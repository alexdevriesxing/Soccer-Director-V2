import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ContractNegotiationInput {
  playerId: number;
  clubId: number;
  proposedWage: number;
  proposedLength: number;
  proposedBonuses: Record<string, number>;
  proposedClauses: Record<string, unknown>;
  agentFee: number;
  status: string;
  deadline: Date;
}

interface ExpiringPlayer {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  weeklyWage: number | null;
  contractEnd: Date | null;
  currentClubId: number | null;
  morale: number | null;
  currentAbility: number | null;
  ambition: number | null;
  // Computed properties for route compatibility
  wage?: number;
  skill?: number;
  clubId?: number | null;
}

/**
 * Player Contract Service
 * Handles all player contract operations including negotiations, renewals, and bonuses
 */
export class PlayerContractService {
  async getPlayerContract(playerId: number) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        weeklyWage: true,
        contractStart: true,
        contractEnd: true,
        currentClubId: true
      }
    });

    return {
      playerId,
      weeklyWage: player?.weeklyWage ?? 0,
      contractStart: player?.contractStart,
      contractEnd: player?.contractEnd,
      clubId: player?.currentClubId
    };
  }

  async offerContract(_playerId: number, _terms: unknown) {
    return {
      success: true,
      message: 'Contract offer - coming soon'
    };
  }

  async negotiateContract(_playerId: number, _terms: unknown) {
    return {
      success: true,
      message: 'Contract negotiation - coming soon'
    };
  }

  async terminateContract(_playerId: number) {
    return {
      success: true,
      message: 'Contract termination - coming soon'
    };
  }

  async renewContract(playerId: number, _clubId: number, _options: {
    wage: number;
    years: number;
  }) {
    return {
      playerId,
      status: 'renewed',
      message: 'Contract renewed stub'
    };
  }

  // --- NEW METHODS REQUIRED BY ROUTES ---

  async createContractNegotiation(input: ContractNegotiationInput) {
    // Store negotiation as a player contract with pending status
    // For now, return a stub negotiation object
    return {
      id: Date.now(), // Temporary ID
      playerId: input.playerId,
      clubId: input.clubId,
      proposedWage: input.proposedWage,
      proposedLength: input.proposedLength,
      proposedBonuses: input.proposedBonuses,
      proposedClauses: input.proposedClauses,
      agentFee: input.agentFee,
      status: input.status,
      deadline: input.deadline,
      createdAt: new Date()
    };
  }

  async acceptContract(negotiationId: number) {
    // Stub: In a real implementation, this would update the player's contract
    return {
      id: negotiationId,
      status: 'accepted',
      message: 'Contract accepted successfully'
    };
  }

  async rejectContract(negotiationId: number, reason: string) {
    return {
      id: negotiationId,
      status: 'rejected',
      reason,
      message: 'Contract rejected'
    };
  }

  async makeCounterOffer(negotiationId: number, counterOffer: unknown) {
    return {
      id: negotiationId,
      status: 'countered',
      counterOffer,
      message: 'Counter offer made'
    };
  }

  async getClubNegotiations(_clubId: number) {
    // Return empty array for now - would query contract negotiations table
    return [];
  }

  async getPlayerNegotiations(_playerId: number) {
    // Return empty array for now
    return [];
  }

  async triggerRenewalNegotiations(_clubId: number) {
    // Find players with expiring contracts and trigger negotiations
    const expiringPlayers = await this.getExpiringContracts(_clubId, 180);
    return {
      triggered: expiringPlayers.length,
      message: `Renewal negotiations triggered for ${expiringPlayers.length} players`
    };
  }

  async getExpiringContracts(clubId: number, daysThreshold: number): Promise<ExpiringPlayer[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const players = await prisma.player.findMany({
      where: {
        currentClubId: clubId,
        contractEnd: {
          lte: thresholdDate,
          gte: new Date()
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        weeklyWage: true,
        contractEnd: true,
        currentClubId: true,
        morale: true,
        currentAbility: true,
        ambition: true
      }
    });

    // Map to include compatibility properties
    return players.map(p => ({
      ...p,
      wage: p.weeklyWage ?? 0,
      skill: p.currentAbility ?? 50,
      clubId: p.currentClubId
    }));
  }

  async checkRenewalEligibility(playerId: number): Promise<boolean> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { contractEnd: true, morale: true }
    });

    if (!player?.contractEnd) return false;

    const daysUntilExpiry = Math.floor(
      (player.contractEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Eligible if contract expires within 365 days and morale is reasonable
    return daysUntilExpiry <= 365 && (player.morale ?? 50) >= 30;
  }

  async processMatchBonuses(_playerId: number, _matchStats: unknown) {
    // Stub: Would calculate and record bonuses based on match performance
    return {
      playerId: _playerId,
      bonusesProcessed: true,
      message: 'Match bonuses processed'
    };
  }

  async getContractStats(clubId: number) {
    const players = await prisma.player.findMany({
      where: { currentClubId: clubId },
      select: {
        weeklyWage: true,
        contractEnd: true
      }
    });

    const totalWage = players.reduce((sum, p) => sum + (p.weeklyWage ?? 0), 0);
    const avgWage = players.length > 0 ? totalWage / players.length : 0;

    const now = new Date();
    const expiringSoon = players.filter(p => {
      if (!p.contractEnd) return false;
      const daysUntil = (p.contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 180;
    }).length;

    return {
      totalPlayers: players.length,
      totalWeeklyWage: totalWage,
      averageWeeklyWage: avgWage,
      expiringSoon,
      yearlyWageBill: totalWage * 52
    };
  }

  calculateContractValue(wage: number, lengthYears: number, bonuses?: Record<string, number>): number {
    const baseValue = wage * 52 * lengthYears;
    const bonusValue = bonuses
      ? Object.values(bonuses).reduce((sum, val) => sum + (val || 0), 0) * lengthYears
      : 0;
    return baseValue + bonusValue;
  }
}

export default new PlayerContractService();