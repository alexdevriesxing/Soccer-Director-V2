import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Player Morale Service - Stub
 */
export class PlayerMoraleService {
  async getPlayerMorale(playerId: number) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, morale: true, happiness: true }
    });
    return player;
  }

  async getSquadMorale(clubId: number) {
    const players = await prisma.player.findMany({
      where: { currentClubId: clubId },
      select: { id: true, morale: true, happiness: true }
    });

    const avgMorale = players.length > 0
      ? players.reduce((sum, p) => sum + (p.morale || 50), 0) / players.length
      : 50;

    return {
      clubId,
      averageMorale: avgMorale,
      totalPlayers: players.length
    };
  }

  async updateMorale(_playerId: number, _change: number) {
    return { success: true, message: 'Morale update - coming soon' };
  }
}

export default new PlayerMoraleService();