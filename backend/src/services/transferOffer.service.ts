import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class TransferOfferService {
  async createOffer(params: {
    listingId?: number;
    playerId: number;
    biddingClubId: number;
    sellingClubId: number;
    amount: number;
    wageContribution?: number;
    isLoan: boolean;
    loanEndDate?: Date;
    isLoanWithOption?: boolean;
    optionToBuyFee?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      // If listing provided, validate it
      if (params.listingId) {
        const listing = await tx.transferListing.findUnique({
          where: { id: params.listingId },
          include: {
            player: true,
            club: true
          }
        });

        if (!listing) throw new Error('Transfer listing not found');
        if (listing.status !== 'active') throw new Error('Listing is not active');
        if (params.biddingClubId === listing.clubId) {
          throw new Error('Cannot make an offer for your own player');
        }
      }

      const bidAmount = params.amount;

      // Check bidding club has funds
      const biddingClub = await tx.club.findUnique({
        where: { id: params.biddingClubId },
        select: { balance: true }
      });

      if (!biddingClub) throw new Error('Bidding club not found');
      if ((biddingClub.balance || 0) < bidAmount) {
        throw new Error('Insufficient funds for this transfer');
      }

      // Check for existing pending offers
      const existingOffer = await tx.transferOffer.findFirst({
        where: {
          playerId: params.playerId,
          fromClubId: params.biddingClubId,
          status: 'PENDING'
        }
      });

      if (existingOffer) {
        throw new Error('You already have a pending offer for this player');
      }

      const offer = await tx.transferOffer.create({
        data: {
          playerId: params.playerId,
          fromClubId: params.biddingClubId,
          toClubId: params.sellingClubId,
          listingId: params.listingId,
          amount: bidAmount,
          wageContribution: params.wageContribution,
          status: 'PENDING',
          isLoan: params.isLoan,
          loanEndDate: params.loanEndDate,
          isLoanWithOption: params.isLoanWithOption || false,
          optionToBuyFee: params.optionToBuyFee
        },
        include: {
          listing: {
            include: {
              player: true,
              club: true
            }
          },
          player: true,
          fromClub: true,
          toClub: true
        }
      });

      logger.info(`Transfer offer created: ${offer.id} for player ${params.playerId}`);
      return offer;
    });
  }

  async respondToOffer(offerId: number, response: 'ACCEPT' | 'REJECT' | 'COUNTER', counterOffer?: number) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.transferOffer.findUnique({
        where: { id: offerId },
        include: {
          listing: {
            include: {
              player: true,
              club: true
            }
          },
          player: true,
          fromClub: true,
          toClub: true
        }
      });

      if (!offer) throw new Error('Offer not found');
      if (offer.status !== 'PENDING') {
        throw new Error('Offer has already been processed');
      }

      if (response === 'ACCEPT') {
        // Update player's club
        await tx.player.update({
          where: { id: offer.playerId },
          data: {
            currentClubId: offer.fromClubId,
            weeklyWage: offer.weeklyWage || undefined
          }
        });

        // Update club balances
        await tx.club.update({
          where: { id: offer.fromClubId },
          data: { balance: { decrement: offer.amount } }
        });
        await tx.club.update({
          where: { id: offer.toClubId },
          data: { balance: { increment: offer.amount } }
        });

        // Update listing status if exists
        if (offer.listingId) {
          await tx.transferListing.update({
            where: { id: offer.listingId },
            data: { status: 'completed' }
          });

          // Reject all other pending offers for this listing
          await tx.transferOffer.updateMany({
            where: {
              listingId: offer.listingId,
              id: { not: offer.id },
              status: 'PENDING'
            },
            data: { status: 'REJECTED' }
          });
        }

        logger.info(`Transfer offer ${offerId} accepted`);
        return tx.transferOffer.update({
          where: { id: offerId },
          data: { status: 'ACCEPTED' },
          include: {
            listing: true,
            player: true,
            fromClub: true,
            toClub: true
          }
        });

      } else if (response === 'REJECT') {
        logger.info(`Transfer offer ${offerId} rejected`);
        return tx.transferOffer.update({
          where: { id: offerId },
          data: { status: 'REJECTED' },
          include: {
            listing: true,
            player: true,
            fromClub: true,
            toClub: true
          }
        });

      } else if (response === 'COUNTER' && counterOffer) {
        if (counterOffer <= offer.amount) {
          throw new Error('Counter offer must be higher than the current offer');
        }
        logger.info(`Transfer offer ${offerId} countered with ${counterOffer}`);
        return tx.transferOffer.update({
          where: { id: offerId },
          data: {
            status: 'COUNTERED',
            counteredAmount: counterOffer
          },
          include: {
            listing: true,
            player: true,
            fromClub: true,
            toClub: true
          }
        });
      } else {
        throw new Error('Invalid response or missing counter offer amount');
      }
    });
  }

  async getClubOffers(clubId: number, status?: string) {
    const where: any = {
      OR: [
        { fromClubId: clubId },
        { toClubId: clubId }
      ]
    };

    if (status) {
      where.status = status;
    }

    return prisma.transferOffer.findMany({
      where,
      include: {
        listing: {
          include: {
            player: true,
            club: true
          }
        },
        player: true,
        fromClub: true,
        toClub: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOfferById(offerId: number) {
    return prisma.transferOffer.findUnique({
      where: { id: offerId },
      include: {
        listing: {
          include: {
            player: true,
            club: true
          }
        },
        player: true,
        fromClub: true,
        toClub: true
      }
    });
  }

  async withdrawOffer(offerId: number) {
    return prisma.transferOffer.update({
      where: { id: offerId },
      data: { status: 'WITHDRAWN' }
    });
  }
}

export const transferOfferService = new TransferOfferService();
