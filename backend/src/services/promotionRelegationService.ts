import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Promotion/Relegation Service - Stub Implementation
 */
export class PromotionRelegationService {
  /**
   * Get promotion/relegation candidates
   */
  async getCandidates(leagueId: number) {
    const standings = await prisma.clubSeasonStats.findMany({
      where: {
        club: { leagueId }
      },
      include: { club: true },
      orderBy: { points: 'desc' }
    });

    const totalTeams = standings.length;
    const promotionZone = standings.slice(0, 3);
    const relegationZone = standings.slice(-3);

    return {
      leagueId,
      totalTeams,
      promotion: promotionZone.map(s => ({
        clubId: s.clubId,
        clubName: s.club.name,
        points: s.points
      })),
      relegation: relegationZone.map(s => ({
        clubId: s.clubId,
        clubName: s.club.name,
        points: s.points
      }))
    };
  }

  /**
   * Process end of season promotions/relegations (stub)
   */
  async processEndOfSeason(_leagueId: number) {
    return {
      success: true,
      message: 'Promotion/relegation processing - coming soon'
    };
  }
}

export default new PromotionRelegationService();