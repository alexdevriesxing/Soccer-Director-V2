import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface ContractNegotiation {
  playerId: number;
  clubId: number;
  proposedWage: number;
  proposedLength: number;
  proposedBonuses: any;
  proposedClauses: any;
  agentFee: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
  counterOffer?: any;
  deadline: Date;
}

export interface ContractClause {
  type: 'appearance_bonus' | 'goal_bonus' | 'clean_sheet_bonus' | 'promotion_bonus' | 'relegation_reduction' | 'release_clause' | 'buyout_clause';
  value: number;
  conditions: any;
}

export interface ContractBonus {
  type: 'appearance' | 'goal' | 'assist' | 'clean_sheet' | 'promotion' | 'trophy';
  amount: number;
  threshold?: number;
}

export class PlayerContractService {
  // Create a new contract negotiation
  static async createContractNegotiation(data: ContractNegotiation) {
    const player = await prisma.player.findUnique({ where: { id: data.playerId } });
    if (!player) throw new Error('Player not found');

    const club = await prisma.club.findUnique({ where: { id: data.clubId } });
    if (!club) throw new Error('Club not found');

    // Check if player is available for contract
    if (player.clubId && player.clubId !== data.clubId) {
      throw new Error('Player belongs to another club');
    }

    // Validate financial capacity
    const clubFinances = await prisma.clubFinances.findFirst({
      where: { clubId: data.clubId },
      orderBy: { season: 'desc' }
    });

    if (clubFinances && clubFinances.wageBudget < (data.proposedWage ?? 0)) {
      throw new Error('Insufficient wage budget');
    }

    // Ensure offer field is present and valid (required by schema)
    const offer = {
      wage: data.proposedWage ?? 0,
      length: data.proposedLength ?? 2,
      bonuses: data.proposedBonuses ?? {},
      clauses: data.proposedClauses ?? {}
    };

    return await prisma.contractNegotiation.create({
      data: {
        playerId: data.playerId,
        clubId: data.clubId,
        proposedWage: data.proposedWage ?? 0,
        proposedLength: data.proposedLength ?? 2,
        proposedBonuses: data.proposedBonuses ?? {},
        proposedClauses: data.proposedClauses ?? {},
        agentFee: data.agentFee ?? 0,
        status: data.status,
        counterOffer: data.counterOffer ?? null,
        deadline: data.deadline,
        offer
        // Do not include 'history' unless updating
      }
    });
  }

  // Accept a contract offer
  static async acceptContract(negotiationId: number) {
    const negotiation = await prisma.contractNegotiation.findUnique({
      where: { id: negotiationId },
      include: { player: true, club: true }
    });

    if (!negotiation) throw new Error('Negotiation not found');
    if (negotiation.status !== 'pending') throw new Error('Negotiation is not pending');

    // Update player contract
    const updatedPlayer = await prisma.player.update({
      where: { id: negotiation.playerId },
      data: {
        clubId: negotiation.clubId,
        wage: negotiation.proposedWage ?? 0,
        contractExpiry: negotiation.proposedLength ? new Date(Date.now() + (negotiation.proposedLength ?? 2) * 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        contractStart: new Date()
      }
    });

    // Update club finances
    await prisma.clubFinances.updateMany({
      where: { clubId: negotiation.clubId },
      data: {
        wageBudget: { decrement: negotiation.proposedWage ?? 0 },
        balance: { decrement: negotiation.agentFee ?? 0 }
      }
    });

    // Update negotiation status
    await prisma.contractNegotiation.update({
      where: { id: negotiationId },
      data: { status: 'accepted' }
    });

    return updatedPlayer;
  }

  // Reject a contract offer
  static async rejectContract(negotiationId: number, reason: string) {
    const negotiation = await prisma.contractNegotiation.findUnique({
      where: { id: negotiationId }
    });

    if (!negotiation) throw new Error('Negotiation not found');

    // Only update 'status' unless 'history' is required
    return await prisma.contractNegotiation.update({
      where: { id: negotiationId },
      data: {
        status: 'rejected'
      }
    });
  }

  // Make a counter offer
  static async makeCounterOffer(negotiationId: number, counterOffer: any) {
    const negotiation = await prisma.contractNegotiation.findUnique({
      where: { id: negotiationId }
    });

    if (!negotiation) throw new Error('Negotiation not found');
    if (negotiation.status !== 'pending') throw new Error('Negotiation is not pending');

    // Only update 'status' and 'counterOffer' unless 'history' is required
    return await prisma.contractNegotiation.update({
      where: { id: negotiationId },
      data: {
        status: 'counter_offered',
        counterOffer
      }
    });
  }

  // Get contract negotiations for a club
  static async getClubNegotiations(clubId: number) {
    return await prisma.contractNegotiation.findMany({
      where: { clubId },
      include: { player: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get contract negotiations for a player
  static async getPlayerNegotiations(playerId: number) {
    return await prisma.contractNegotiation.findMany({
      where: { playerId },
      include: { club: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Calculate contract value including bonuses
  static calculateContractValue(wage: number, length: number, bonuses: any): number {
    let totalValue = wage * length;
    // If bonuses is an object, sum all numeric values
    if (bonuses && typeof bonuses === 'object') {
      for (const key in bonuses) {
        if (typeof bonuses[key] === 'number') {
          totalValue += bonuses[key];
        }
      }
    }
    return totalValue;
  }

  // Check if player is eligible for contract renewal
  static async checkRenewalEligibility(playerId: number): Promise<boolean> {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return false;

    const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 180; // 6 months before expiry
  }

  // Get players with expiring contracts
  static async getExpiringContracts(clubId: number, daysThreshold: number = 180) {
    const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);
    
    return await prisma.player.findMany({
      where: {
        clubId,
        contractExpiry: { lte: thresholdDate }
      },
      orderBy: { contractExpiry: 'asc' }
    });
  }

  // Process contract bonuses after a match
  static async processMatchBonuses(playerId: number, matchStats: any) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return;

    let bonusAmount = 0;

    // Appearance bonus
    if (matchStats.appearances > 0) {
      const appearanceBonuses = await prisma.playerContractBonus.findMany({
        where: { playerId, type: 'appearance' }
      });
      for (const bonus of appearanceBonuses) {
        bonusAmount += bonus.amount * matchStats.appearances;
      }
    }
    // Goal bonus
    if (matchStats.goals > 0) {
      const goalBonuses = await prisma.playerContractBonus.findMany({
        where: { playerId, type: 'goal' }
      });
      for (const bonus of goalBonuses) {
        bonusAmount += bonus.amount * matchStats.goals;
      }
    }
    // Clean sheet bonus (for defenders and goalkeepers)
    if (matchStats.cleanSheets > 0 && (player.position === 'GK' || player.position === 'DEF')) {
      const cleanSheetBonuses = await prisma.playerContractBonus.findMany({
        where: { playerId, type: 'clean_sheet' }
      });
      for (const bonus of cleanSheetBonuses) {
        bonusAmount += bonus.amount * matchStats.cleanSheets;
      }
    }

    if (bonusAmount > 0) {
      // Update club finances
      await prisma.clubFinances.updateMany({
        where: { clubId: player.clubId! },
        data: { balance: { decrement: bonusAmount } }
      });

      // Log the bonus payment (do not include matchStats as a field, only use valid fields)
      await prisma.playerContractBonus.create({
        data: {
          playerId,
          clubId: player.clubId!,
          amount: bonusAmount,
          type: 'match_bonus', // Use only valid types from the schema
          createdAt: new Date()
        }
      });
    }
  }

  // Trigger contract renewal negotiations
  static async triggerRenewalNegotiations(clubId: number) {
    const expiringPlayers = await this.getExpiringContracts(clubId, 90); // 3 months
    for (const player of expiringPlayers) {
      // Check if player wants to renew
      const wantsToRenew = this.calculateRenewalDesire(player);
      if (wantsToRenew) {
        // Create renewal negotiation
        const proposedWage = this.calculateRenewalWage(player);
        const proposedLength = 2; // 2 years
        await this.createContractNegotiation({
          playerId: player.id,
          clubId: player.clubId!,
          proposedWage,
          proposedLength,
          proposedBonuses: {}, // No hardcoded bonus fields
          proposedClauses: {},
          agentFee: Math.floor(proposedWage * 0.05),
          status: 'pending',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      }
    }
  }

  // Calculate if player wants to renew based on various factors
  private static calculateRenewalDesire(player: any): boolean {
    let desire = 50; // Base 50% chance

    // Age factor
    if (player.age < 25) desire += 20;
    else if (player.age > 30) desire -= 10;

    // Skill factor
    if (player.skill > 80) desire += 15;
    else if (player.skill < 60) desire -= 10;

    // Morale factor
    if (player.morale && player.morale > 80) desire += 20;
    else if (player.morale && player.morale < 50) desire -= 20;

    // Ambition factor
    if (player.ambition > 4) desire -= 10; // High ambition players might want to move

    return Math.random() * 100 < desire;
  }

  // Calculate proposed renewal wage
  private static calculateRenewalWage(player: any): number {
    let baseWage = player.wage;

    // Age-based adjustments
    if (player.age < 25) baseWage *= 1.1; // Young players get raises
    else if (player.age > 30) baseWage *= 0.9; // Older players might accept less

    // Skill-based adjustments
    if (player.skill > 80) baseWage *= 1.2;
    else if (player.skill < 60) baseWage *= 0.8;

    // Morale-based adjustments
    if (player.morale && player.morale > 80) baseWage *= 1.1;
    else if (player.morale && player.morale < 50) baseWage *= 0.9;

    return Math.floor(baseWage);
  }

  // Get contract statistics for a club
  static async getContractStats(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const totalWage = players.reduce((sum: number, p: any) => sum + (p.wage || 0), 0);
    const avgWage = players.length > 0 ? totalWage / players.length : 0;
    const expiringSoon = await this.getExpiringContracts(clubId, 90);
    const highEarners = players.filter((p: any) => (p.wage || 0) > avgWage * 2);

    return {
      totalPlayers: players.length,
      totalWage,
      averageWage: avgWage,
      expiringSoon: expiringSoon.length,
      highEarners: highEarners.length,
      wageDistribution: {
        low: players.filter((p: any) => (p.wage || 0) < avgWage * 0.5).length,
        medium: players.filter((p: any) => (p.wage || 0) >= avgWage * 0.5 && (p.wage || 0) <= avgWage * 1.5).length,
        high: players.filter((p: any) => (p.wage || 0) > avgWage * 1.5).length
      }
    };
  }
}

export default PlayerContractService; 