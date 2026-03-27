import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Player Service - Core player operations
 */
export class PlayerService {
  async getPlayerById(id: number) {
    return prisma.player.findUnique({
      where: { id: id },
      include: {
        currentClub: true,
        // playerTraits: true, // Stubbed out
      }
    });
  }

  async getPlayersByClub(clubId: number) {
    return prisma.player.findMany({
      where: { currentClubId: clubId },
      orderBy: { value: 'desc' }
    });
  }

  async searchPlayers(query: string) {
    return prisma.player.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } }
        ]
      },
      take: 50
    });
  }

  async updatePlayer(id: number, data: any) {
    return prisma.player.update({
      where: { id },
      data
    });
  }

  async assignPlayerToClub(playerId: number, clubId: number) {
    return prisma.player.update({
      where: { id: playerId },
      data: { currentClubId: clubId }
    });
  }

  async getSeasonStats(playerId: number, season: string) {
    // Stub implementation
    return {
      playerId,
      season,
      appearances: 0,
      goals: 0,
      assists: 0,
      avgRating: 0,
      manOfTheMatch: 0
    };
  }

  async removePlayerFromClub(playerId: number) {
    return prisma.player.update({
      where: { id: playerId },
      data: { currentClubId: null }
    });
  }

  async getPlayerStats(_playerId: number) {
    // Stub implementation
    return [];
  }

  async getTopScorers(_competitionId?: number, _limit = 20) {
    // Stub implementation
    return [];
  }
}

export default new PlayerService();