import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * O21 (Under-21) Manager Service - Stub
 */
export class O21ManagerService {
  async getO21Squad(clubId: number) {
    return prisma.player.findMany({
      where: {
        currentClubId: clubId,
        age: { lte: 21 }
      },
      orderBy: { age: 'asc' }
    });
  }

  async getO21Stats(clubId: number) {
    const players = await this.getO21Squad(clubId);
    return {
      totalPlayers: players.length,
      averageAge: players.length > 0
        ? players.reduce((sum, p) => sum + (p.age || 0), 0) / players.length
        : 0
    };
  }
}

export default new O21ManagerService();