import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

class TransferListingService {
  async listPlayer(params: {
    playerId: number;
    clubId: number;
    askingPrice: number;
    listingType: 'TRANSFER' | 'LOAN' | 'BOTH';
    loanFee?: number;
    wageContribution?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const player = await tx.player.findUnique({
        where: { id: params.playerId },
        include: { club: true }
      });

      if (!player) throw new Error('Player not found');
      if (player.clubId !== params.clubId) {
        throw new Error('Player does not belong to your club');
      }
      
      const existingListing = await tx.transferListing.findFirst({
        where: { 
          playerId: params.playerId,
          status: 'ACTIVE'
        }
      });

      if (existingListing) {
        throw new Error('Player is already listed for transfer');
      }

      return tx.transferListing.create({
        data: {
          playerId: params.playerId,
          clubId: params.clubId,
          askingPrice: params.askingPrice,
          listingType: params.listingType,
          loanFee: params.loanFee,
          wageContribution: params.wageContribution,
          status: 'ACTIVE'
        },
        include: {
          player: true,
          club: true
        }
      });
    });
  }

  async getActiveListings(filters: {
    position?: string;
    minPrice?: number;
    maxPrice?: number;
    clubId?: number;
    leagueId?: number;
  } = {}) {
    const where: any = { status: 'ACTIVE' };
    
    if (filters.position) {
      where.player = { position: filters.position };
    }
    if (filters.minPrice !== undefined) {
      where.askingPrice = { gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.askingPrice = { ...where.askingPrice, lte: filters.maxPrice };
    }
    if (filters.clubId) {
      where.clubId = filters.clubId;
    }
    if (filters.leagueId) {
      where.club = { leagueId: filters.leagueId };
    }

    return prisma.transferListing.findMany({
      where,
      include: {
        player: {
          include: {
            club: {
              include: {
                league: true
              }
            }
          }
        },
        club: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async cancelListing(listingId: number, clubId: number) {
    return prisma.$transaction(async (tx) => {
      const listing = await tx.transferListing.findUnique({
        where: { id: listingId }
      });

      if (!listing) throw new Error('Listing not found');
      if (listing.clubId !== clubId) {
        throw new Error('Not authorized to cancel this listing');
      }
      if (listing.status !== 'ACTIVE') {
        throw new Error('Only active listings can be cancelled');
      }

      return tx.transferListing.update({
        where: { id: listingId },
        data: { status: 'CANCELLED' }
      });
    });
  }
}

export const transferListingService = new TransferListingService();
