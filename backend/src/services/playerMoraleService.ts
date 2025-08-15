import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export interface PlayerRequest {
  playerId: number;
  type: 'transfer_request' | 'playtime_demand' | 'wage_demand' | 'contract_extension' | 'position_change' | 'tactical_complaint';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  demands: any;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface MoraleFactors {
  playtime: number; // 0-100
  wage: number; // 0-100
  teamPerformance: number; // 0-100
  individualPerformance: number; // 0-100
  contractStatus: number; // 0-100
  managerRelationship: number; // 0-100
  facilities: number; // 0-100
  location: number; // 0-100
}

export class PlayerMoraleService {
  // Calculate player morale based on various factors
  static async calculatePlayerMorale(playerId: number): Promise<number> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: {
          include: {
            finances: { orderBy: { season: 'desc' }, take: 1 },
            facilities: true
          }
        }
      }
    });

    if (!player || !player.clubId) return 50; // Default morale

    const factors = await this.calculateMoraleFactors(player);
    
    // Weighted average of factors
    const weights = {
      playtime: 0.25,
      wage: 0.20,
      teamPerformance: 0.15,
      individualPerformance: 0.15,
      contractStatus: 0.10,
      managerRelationship: 0.10,
      facilities: 0.03,
      location: 0.02
    };

    let totalMorale = 0;
    let totalWeight = 0;

    for (const [factor, value] of Object.entries(factors)) {
      const weight = weights[factor as keyof typeof weights] || 0;
      totalMorale += value * weight;
      totalWeight += weight;
    }

    return Math.round(totalMorale / totalWeight);
  }

  // Calculate individual morale factors
  private static async calculateMoraleFactors(player: any): Promise<MoraleFactors> {
    const club = player.club;
    
    // Playtime factor (based on recent appearances)
    const recentFixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeClubId: player.clubId }, { awayClubId: player.clubId }],
        played: true
      },
      orderBy: { week: 'desc' },
      take: 10
    });

    let appearances = 0;
    for (const fixture of recentFixtures) {
      // Check if player was in starting XI or made appearance
      const startingXI = await prisma.startingXI.findUnique({
        where: { clubId: player.clubId },
        include: { slots: true }
      });
      
      if (startingXI?.slots.some((slot: any) => slot.playerId === player.id)) {
        appearances++;
      }
    }

    const playtime = Math.min(100, (appearances / recentFixtures.length) * 100);

    // Wage factor (compared to club average)
    const clubPlayers = await prisma.player.findMany({ where: { clubId: player.clubId } });
    const avgWage = clubPlayers.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) / clubPlayers.length;
    const wageRatio = avgWage > 0 ? (player.wage || 0) / avgWage : 1;
    const wage = Math.min(100, Math.max(0, 50 + (wageRatio - 1) * 50));

    // Team performance factor
    const teamStats = await prisma.clubSeasonStats.findFirst({
      where: { clubId: player.clubId },
      orderBy: { season: 'desc' }
    });
    
    const teamPerformance = teamStats ? Math.min(100, Math.max(0, 50 + (teamStats.points || 0) * 2)) : 50;

    // Individual performance factor (based on skill and recent form)
    const individualPerformance = Math.min(100, player.skill + (player.morale || 0) * 0.1);

    // Contract status factor
    const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const contractStatus = daysUntilExpiry > 365 ? 100 : Math.max(0, daysUntilExpiry / 3.65);

    // Manager relationship factor (based on personality compatibility)
    const managerRelationship = 70 + (player.personality === 'PROFESSIONAL' ? 20 : 0);

    // Facilities factor
    const facilities = club.facilities && club.facilities.length > 0 ? 
      Math.min(100, club.facilities.reduce((sum: number, f: any) => sum + (f.level || 0), 0) * 10) : 50;

    // Location factor (simplified)
    const location = 80; // Assume good location

    return {
      playtime,
      wage,
      teamPerformance,
      individualPerformance,
      contractStatus,
      managerRelationship,
      facilities,
      location
    };
  }

  // Create a player request
  static async createPlayerRequest(data: PlayerRequest) {
    const player = await prisma.player.findUnique({ where: { id: data.playerId } });
    if (!player) throw new Error('Player not found');

    return await prisma.playerRequest.create({
      data: {
        playerId: data.playerId,
        type: data.type,
        priority: data.priority,
        message: data.description, // Use description as message
        demands: data.demands,
        status: data.status,
        createdAt: data.createdAt,
        resolvedAt: data.resolvedAt
      }
    });
  }

  // Get all requests for a club
  static async getClubRequests(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    const playerIds = players.map((p: any) => p.id);

    return await prisma.playerRequest.findMany({
      where: { playerId: { in: playerIds } },
      include: { player: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Get requests for a specific player
  static async getPlayerRequests(playerId: number) {
    return await prisma.playerRequest.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Respond to a player request
  static async respondToRequest(requestId: number, response: 'accepted' | 'rejected' | 'negotiating', details?: any) {
    const request = await prisma.playerRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');

    const updatedRequest = await prisma.playerRequest.update({
      where: { id: requestId },
      data: {
        status: response,
        resolvedAt: response !== 'negotiating' ? new Date() : undefined,
        demands: details && typeof request.demands === 'object'
          ? ({ ...request.demands, response: details } as Prisma.InputJsonValue)
          : (request.demands === null ? Prisma.JsonNull : (request.demands as Prisma.InputJsonValue))
      }
    });

    // Update player morale based on response
    await this.updatePlayerMoraleFromRequest(request.playerId, request.type, response);

    return updatedRequest;
  }

  // Update player morale based on request response
  private static async updatePlayerMoraleFromRequest(playerId: number, requestType: string, response: string) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return;

    let moraleChange = 0;

    switch (requestType) {
      case 'transfer_request':
        moraleChange = response === 'accepted' ? 20 : -10;
        break;
      case 'playtime_demand':
        moraleChange = response === 'accepted' ? 15 : -15;
        break;
      case 'wage_demand':
        moraleChange = response === 'accepted' ? 10 : -20;
        break;
      case 'contract_extension':
        moraleChange = response === 'accepted' ? 25 : -25;
        break;
      case 'position_change':
        moraleChange = response === 'accepted' ? 10 : -5;
        break;
      case 'tactical_complaint':
        moraleChange = response === 'accepted' ? 5 : -10;
        break;
    }

    const newMorale = Math.max(0, Math.min(100, (player.morale || 50) + moraleChange));
    
    await prisma.player.update({
      where: { id: playerId },
      data: { morale: newMorale }
    });
  }

  // Trigger automatic requests based on player conditions
  static async triggerAutomaticRequests(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    const requests = [];

    for (const player of players) {
      const morale = await this.calculatePlayerMorale(player.id);
      
      // Transfer request if morale is very low
      if (morale < 30 && Math.random() < 0.3) {
        requests.push(await this.createPlayerRequest({
          playerId: player.id,
          type: 'transfer_request',
          priority: 'high',
          description: `${player.name} is unhappy and wants to leave the club.`,
          demands: { reason: 'low_morale', morale },
          status: 'pending',
          createdAt: new Date()
        }));
      }

      // Playtime demand if player is not playing regularly
      const recentAppearances = await this.getRecentAppearances(player.id);
      if (recentAppearances < 3 && Math.random() < 0.4) {
        requests.push(await this.createPlayerRequest({
          playerId: player.id,
          type: 'playtime_demand',
          priority: 'medium',
          description: `${player.name} wants more playing time.`,
          demands: { currentAppearances: recentAppearances, desiredAppearances: 8 },
          status: 'pending',
          createdAt: new Date()
        }));
      }

      // Wage demand if player is underpaid
      const clubPlayers = await prisma.player.findMany({ where: { clubId } });
      const avgWage = clubPlayers.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) / clubPlayers.length;
      if ((player.wage || 0) < avgWage * 0.7 && Math.random() < 0.2) {
        requests.push(await this.createPlayerRequest({
          playerId: player.id,
          type: 'wage_demand',
          priority: 'medium',
          description: `${player.name} wants a wage increase.`,
          demands: { currentWage: player.wage, desiredWage: Math.floor(avgWage * 0.9) },
          status: 'pending',
          createdAt: new Date()
        }));
      }

      // Contract extension if contract is expiring soon
      const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 180 && Math.random() < 0.5) {
        requests.push(await this.createPlayerRequest({
          playerId: player.id,
          type: 'contract_extension',
          priority: 'high',
          description: `${player.name} wants to extend their contract.`,
          demands: { daysUntilExpiry, desiredLength: 2 },
          status: 'pending',
          createdAt: new Date()
        }));
      }
    }

    return requests;
  }

  // Get recent appearances for a player
  private static async getRecentAppearances(playerId: number): Promise<number> {
    const recentFixtures = await prisma.fixture.findMany({
      where: {
        OR: [
          { homeClub: { players: { some: { id: playerId } } } },
          { awayClub: { players: { some: { id: playerId } } } }
        ],
        played: true
      },
      orderBy: { week: 'desc' },
      take: 10
    });

    let appearances = 0;
    for (const fixture of recentFixtures) {
      const startingXI = await prisma.startingXI.findUnique({
        where: { clubId: fixture.homeClubId === playerId ? fixture.homeClubId : fixture.awayClubId },
        include: { slots: true }
      });
      
      if (startingXI?.slots.some((slot: any) => slot.playerId === playerId)) {
        appearances++;
      }
    }

    return appearances;
  }

  // Update all player morale for a club
  static async updateClubMorale(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    const updates = [];

    for (const player of players) {
      const newMorale = await this.calculatePlayerMorale(player.id);
      updates.push(prisma.player.update({
        where: { id: player.id },
        data: { morale: newMorale }
      }));
    }

    await Promise.all(updates);
    return { updatedPlayers: players.length };
  }

  // Get morale statistics for a club
  static async getClubMoraleStats(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const totalMorale = players.reduce((sum: number, p: any) => sum + (p.morale || 50), 0);
    const avgMorale = players.length > 0 ? totalMorale / players.length : 50;
    
    const moraleDistribution = {
      veryLow: players.filter((p: any) => (p.morale || 50) < 30).length,
      low: players.filter((p: any) => (p.morale || 50) >= 30 && (p.morale || 50) < 50).length,
      medium: players.filter((p: any) => (p.morale || 50) >= 50 && (p.morale || 50) < 70).length,
      high: players.filter((p: any) => (p.morale || 50) >= 70 && (p.morale || 50) < 90).length,
      veryHigh: players.filter((p: any) => (p.morale || 50) >= 90).length
    };

    const unhappyPlayers = players.filter((p: any) => (p.morale || 50) < 50);
    const happyPlayers = players.filter((p: any) => (p.morale || 50) >= 70);

    return {
      averageMorale: avgMorale,
      moraleDistribution,
      unhappyPlayers: unhappyPlayers.length,
      happyPlayers: happyPlayers.length,
      totalPlayers: players.length
    };
  }

  // Get players at risk of making requests
  static async getPlayersAtRisk(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    const atRisk = [];

    for (const player of players) {
      const morale = await this.calculatePlayerMorale(player.id);
      const riskFactors = [];

      if (morale < 40) riskFactors.push('low_morale');
      if ((player.wage || 0) < 1000) riskFactors.push('low_wage');
      if (player.contractExpiry.getTime() - Date.now() < 180 * 24 * 60 * 60 * 1000) riskFactors.push('expiring_contract');

      if (riskFactors.length > 0) {
        atRisk.push({
          player,
          morale,
          riskFactors,
          riskLevel: riskFactors.length > 2 ? 'high' : riskFactors.length > 1 ? 'medium' : 'low'
        });
      }
    }

    return atRisk.sort((a, b) => b.riskFactors.length - a.riskFactors.length);
  }
}

export default PlayerMoraleService; 