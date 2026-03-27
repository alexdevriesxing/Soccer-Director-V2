import { Prisma, PrismaClient } from '@prisma/client';
import { PlayerWithDetails, PlayerSearchFilters } from '../types/player.types';

// Define the include type for player relations based on Prisma schema
type PlayerWithRelations = Prisma.PlayerGetPayload<{
  include: {
    playerAttributes: true;
    contracts: true;
    transferListings: true;
    moraleEvents: true;
    currentClub: true;
  };
}> & {
  // Add any additional fields that might be needed
  currentContract?: any;
  nextContract?: any;
  isTransferListed?: boolean;
  transferStatus?: string;
};

export class PlayerService {
  constructor(private prisma: PrismaClient) { }

  async getPlayer(id: number): Promise<PlayerWithDetails | null> {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        playerAttributes: true,
        contracts: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
          take: 2
        },
        transferListings: {
          where: { status: 'ACTIVE' },
          take: 1
        },
        moraleEvents: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        currentClub: true
      }
    }) as PlayerWithRelations | null;

    if (!player) return null;

    const currentContract = player.contracts[0] || null;
    const nextContract = player.contracts[1] || null;
    const isTransferListed = player.transferListings.length > 0;
    const transferStatus = isTransferListed
      ? player.transferListings[0]?.listingType === 'LOAN'
        ? 'Listed for Loan'
        : 'Listed for Transfer'
      : 'Not for Sale';

    // Map the player data to the expected PlayerWithDetails type
    const result: PlayerWithDetails = {
      ...player,
      currentContract,
      nextContract,
      isTransferListed,
      transferStatus,
      moraleEvents: player.moraleEvents || [],
      attributes: player.playerAttributes || [],
      contracts: player.contracts || []
    };

    return result;
  }

  async searchPlayers(filters: PlayerSearchFilters) {
    const { page = 1, pageSize = 20, ...rest } = filters;
    const skip = (page - 1) * pageSize;

    const where = this.buildWhereClause(rest);
    const orderBy = this.getOrderBy(rest.sortBy, rest.sortOrder);

    const [total, players] = await Promise.all([
      this.prisma.player.count({ where }),
      this.prisma.player.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          playerAttributes: true,
          contracts: {
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
            take: 1
          },
          transferListings: {
            where: { status: 'ACTIVE' },
            take: 1
          },
          moraleEvents: {
            where: {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            },
            take: 5
          },
          currentClub: true
        }
      }) as Promise<PlayerWithRelations[]>
    ]);

    return {
      players: players.map(p => ({
        ...p,
        currentContract: p.contracts[0] || null,
        nextContract: p.contracts[1] || null,
        isTransferListed: p.transferListings.length > 0,
        transferStatus: p.transferListings[0]?.listingType === 'LOAN'
          ? 'Listed for Loan'
          : p.transferListings.length > 0 ? 'Listed for Transfer' : 'Not for Sale',
        moraleEvents: p.moraleEvents || [],
        attributes: p.playerAttributes || [],
        contracts: p.contracts || []
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  private buildWhereClause(filters: Omit<PlayerSearchFilters, 'page' | 'pageSize'>): Prisma.PlayerWhereInput {
    const where: Prisma.PlayerWhereInput = {};

    if (filters.name) {
      where.OR = [
        {
          firstName: {
            contains: filters.name
          }
        },
        {
          lastName: {
            contains: filters.name
          }
        }
      ];
    }

    if (filters.position) where.position = filters.position;
    if (filters.nationality) where.nationality = filters.nationality;
    if (filters.clubId !== undefined) where.currentClubId = filters.clubId;

    if (filters.minValue || filters.maxValue) {
      where.value = {};
      if (filters.minValue) where.value.gte = filters.minValue;
      if (filters.maxValue) where.value.lte = filters.maxValue;
    }

    if (filters.minAge || filters.maxAge) {
      const now = new Date();
      const currentYear = now.getFullYear();

      if (filters.minAge) {
        const maxBirthYear = currentYear - filters.minAge;
        where.dateOfBirth = { ...(where.dateOfBirth as Prisma.DateTimeFilter), lte: new Date(`${maxBirthYear}-12-31`) };
      }

      if (filters.maxAge) {
        const minBirthYear = currentYear - filters.maxAge;
        where.dateOfBirth = { ...(where.dateOfBirth as Prisma.DateTimeFilter), gte: new Date(`${minBirthYear}-01-01`) };
      }
    }

    if (filters.contractExpiring) {
      const sixMonths = new Date();
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      where.contractEnd = { lte: sixMonths };
    }

    return where;
  }

  async getStats(playerId: number) {
    // Stub implementation as PlayerStats model/table might differ
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: {
        appearances: true,
        goals: true,
        assists: true,
        yellowCards: true,
        redCards: true,
        cleanSheets: true
      }
    });

    if (!player) return null;

    return {
      appearances: player.appearances,
      goals: player.goals,
      assists: player.assists,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      cleanSheets: player.cleanSheets,
      minutesPlayed: player.appearances * 90, // Approximation
      averageRating: 7.0, // Stub
      manOfTheMatch: 0 // Stub
    };
  }

  async updateTraining(playerId: number, focus: string, intensity: number) {
    // Update player's training focus and last trained date
    await this.prisma.player.update({
      where: { id: playerId },
      data: {
        trainingFocus: focus,
        trainingLevel: intensity,
        lastTrained: new Date()
      }
    });
  }

  private getOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Record<string, 'asc' | 'desc'> {
    if (!sortBy) return { createdAt: 'desc' };
    return { [sortBy]: sortOrder };
  }
}

export default PlayerService;
