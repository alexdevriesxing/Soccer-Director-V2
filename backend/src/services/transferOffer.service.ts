import { PrismaClient, TransferOfferStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { transferService } from './transfer.service';

const prisma = new PrismaClient();

class TransferOfferService {
  async createOffer(params: {
    transferListingId: number;
    biddingClubId: number;
    amount: number;
    wageContribution?: number;
    isLoanOffer: boolean;
    loanDuration?: number;
    isLoanWithOption?: boolean;
    optionToBuyFee?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const listing = await tx.transferListing.findUnique({
        where: { id: params.transferListingId },
        include: { 
          player: true,
          club: true
        }
      });

      if (!listing) throw new Error('Transfer listing not found');
      if (listing.status !== 'ACTIVE') throw new Error('Listing is not active');
      if (params.biddingClubId === listing.clubId) {
        throw new Error('Cannot make an offer for your own player');
      }

      const bidAmount = params.amount;
      if (bidAmount < (listing.askingPrice * 0.8)) {
        throw new Error('Bid amount is too low (must be at least 80% of asking price)');
      }

      const biddingClub = await tx.club.findUnique({
        where: { id: params.biddingClubId },
        select: { balance: true }
      });

      if (!biddingClub) throw new Error('Bidding club not found');
      if (biddingClub.balance < bidAmount) {
        throw new Error('Insufficient funds for this transfer');
      }

      // Check for existing pending offers from this club for the same player
      const existingOffer = await tx.transferOffer.findFirst({
        where: {
          transferListingId: params.transferListingId,
          biddingClubId: params.biddingClubId,
          status: 'PENDING'
        }
      });

      if (existingOffer) {
        throw new Error('You already have a pending offer for this player');
      }

      return tx.transferOffer.create({
        data: {
          transferListingId: params.transferListingId,
          biddingClubId: params.biddingClubId,
          amount: bidAmount,
          wageContribution: params.wageContribution,
          status: 'PENDING',
          isLoanOffer: params.isLoanOffer,
          loanDuration: params.loanDuration,
          isLoanWithOption: params.isLoanWithOption,
          optionToBuyFee: params.optionToBuyFee
        },
        include: {
          transferListing: {
            include: {
              player: true,
              club: true
            }
          },
          biddingClub: true
        }
      });
    });
  }

  async respondToOffer(offerId: number, response: 'ACCEPT' | 'REJECT' | 'COUNTER', counterOffer?: number) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.transferOffer.findUnique({
        where: { id: offerId },
        include: { 
          transferListing: {
            include: {
              player: true,
              club: true
            }
          },
          biddingClub: true
        }
      });

      if (!offer) throw new Error('Offer not found');
      if (offer.status !== 'PENDING') {
        throw new Error('Offer has already been processed');
      }

      if (response === 'ACCEPT') {
        // Process the transfer
        const transfer = await transferService.createTransfer({
          fromClubId: offer.transferListing.clubId,
          toClubId: offer.biddingClubId,
          playerId: offer.transferListing.playerId,
          fee: offer.amount,
          wageContribution: offer.wageContribution || 0,
          transferType: offer.isLoanOffer ? 
            (offer.isLoanWithOption ? 'LOAN_WITH_OPTION' : 'LOAN') : 
            'PERMANENT',
          loanDuration: offer.loanDuration,
          optionToBuyFee: offer.optionToBuyFee
        });

        // Update listing status
        await tx.transferListing.update({
          where: { id: offer.transferListingId },
          data: { status: 'COMPLETED' }
        });

        // Reject all other pending offers for this player
        await tx.transferOffer.updateMany({
          where: { 
            transferListingId: offer.transferListingId,
            id: { not: offer.id },
            status: 'PENDING'
          },
          data: { status: 'REJECTED' }
        });

        // Update offer status
        return tx.transferOffer.update({
          where: { id: offerId },
          data: { status: 'ACCEPTED' },
          include: {
            transferListing: {
              include: {
                player: true,
                club: true
              }
            },
            biddingClub: true
          }
        });
      } else if (response === 'REJECT') {
        return tx.transferOffer.update({
          where: { id: offerId },
          data: { status: 'REJECTED' },
          include: {
            transferListing: {
              include: {
                player: true,
                club: true
              }
            },
            biddingClub: true
          }
        });
      } else if (response === 'COUNTER' && counterOffer) {
        if (counterOffer <= offer.amount) {
          throw new Error('Counter offer must be higher than the current offer');
        }
        return tx.transferOffer.update({
          where: { id: offerId },
          data: { 
            status: 'COUNTERED',
            counteredAmount: counterOffer
          },
          include: {
            transferListing: {
              include: {
                player: true,
                club: true
              }
            },
            biddingClub: true
          }
        });
      } else {
        throw new Error('Invalid response or missing counter offer amount');
      }
    });
  }

  async getClubOffers(clubId: number, status?: TransferOfferStatus) {
    const where: any = {
      OR: [
        { biddingClubId: clubId },
        { 'transferListing': { clubId } }
      ]
    };

    if (status) {
      where.status = status;
    }

    return prisma.transferOffer.findMany({
      where,
      include: {
        transferListing: {
          include: {
            player: true,
            club: true
          }
        },
        biddingClub: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const transferOfferService = new TransferOfferService();
