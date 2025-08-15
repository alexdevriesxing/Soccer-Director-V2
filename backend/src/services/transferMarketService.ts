import { PrismaClient, Prisma } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { 
  PlayerNotFoundError, 
  ClubNotFoundError, 
  UnauthorizedError, 
  PlayerAlreadyListedError,
  TransferNotFoundError,
  TransferNotAvailableError,
  InsufficientFundsError,
  OfferTooLowError
} from '../errors/transferMarketErrors';

//#region Type Definitions

/** Transfer listing status */
export type TransferStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'WITHDRAWN' | 'EXPIRED';

/** Transfer offer status */
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'WITHDRAWN';

/** Transfer listing type */
export type TransferListingType = 'TRANSFER' | 'LOAN' | 'BOTH';

/**
 * Transfer offer clauses that can be included in a transfer deal
 */
export interface TransferOfferClauses {
  /** Percentage of next transfer fee (0-100) */
  sellOnFee?: number;
  
  /** Buy-back clause details */
  buyBackClause?: {
    amount: number;
    validUntil: Date;
  };
  
  /** Whether the selling club can match any higher offer */
  matchHighestOffer?: boolean;
  
  /** Bonus if buying club gets promoted */
  promotionBonus?: number;
  
  /** Player can leave if club is relegated */
  relegationRelease?: boolean;
  
  /** Bonus per international cap */
  internationalCapsBonus?: number;
  
  /** Bonus per goal */
  goalBonus?: number;
  
  /** For goalkeepers/defenders */
  cleanSheetBonus?: number;
  
  /** Bonus after certain number of appearances */
  appearanceBonus?: number;
}

/** History item for transfer events */
export interface TransferOfferHistoryItem {
  type: 'OFFER_MADE' | 'OFFER_UPDATED' | 'OFFER_ACCEPTED' | 
        'OFFER_REJECTED' | 'OFFER_WITHDRAWN' | 'TRANSFER_COMPLETED';
  timestamp: Date;
  details: Record<string, unknown>;
}

/** Transfer listing with player and club details */
export type TransferListingWithRelations = Prisma.TransferListingGetPayload<{
  include: {
    player: true;
    club: true;
    offers: true;
  };
}>;

/** Transfer offer with related entities */
export type TransferOfferWithRelations = Prisma.TransferOfferGetPayload<{
  include: {
    player: true;
    fromClub: true;
    toClub: true;
    listing: true;
  };
}>;

/** Club with balance information */
type ClubWithBalance = Prisma.ClubGetPayload<{
  select: {
    id: true;
    name: true;
    balance: true;
    league: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

/** Socket.IO event names for transfer market updates */
export enum TransferMarketEvent {
  PlayerListed = 'transfer:playerListed',
  OfferMade = 'transfer:offerMade',
  OfferWithdrawn = 'transfer:offerWithdrawn',
  OfferAccepted = 'transfer:offerAccepted',
  OfferRejected = 'transfer:offerRejected',
  PlayerWithdrawn = 'transfer:playerWithdrawn',
  TransferCompleted = 'transfer:transferCompleted'
}

/** Response structure for transfer offer responses */
export interface TransferOfferResponse {
  status: 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  message?: string;
  counterOffer?: TransferOfferDetails;
}

/** Structure of transfer offer details */
export interface TransferOfferDetails {
  fee: number;
  wage: number;
  contractLength: number;
  clauses?: TransferOfferClauses;
}

//#endregion

/**
 * Service for handling transfer market operations including:
 * - Listing players for transfer
 * - Making and responding to transfer offers
 * - Managing transfer history and statistics
 */
export class TransferMarketService {
  private prisma: PrismaClient;
  private io: SocketIOServer;

  constructor(prisma: PrismaClient, io: SocketIOServer) {
    this.prisma = prisma;
    this.io = io;
  }

  /**
   * List a player on the transfer market
   * @param playerId - The ID of the player to list
   * @param clubId - The ID of the club listing the player
   * @param askingPrice - The asking price for the player
   * @param listingType - Type of listing (TRANSFER, LOAN, BOTH)
   * @param loanFee - Optional loan fee if listing type is LOAN or BOTH
   * @param wageContribution - Optional wage contribution percentage for loan deals
   * @param deadline - Optional deadline for the listing
   */
  async listPlayer(
    playerId: number,
    clubId: number,
    askingPrice: number,
    listingType: 'TRANSFER' | 'LOAN' | 'BOTH' = 'TRANSFER',
    loanFee?: number,
    wageContribution?: number,
    deadline?: Date
  ): Promise<TransferListingWithPlayer> {
    // Check if player exists and belongs to the club
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        currentClubId: true,
      },
    });

    if (!player) {
      throw new PlayerNotFoundError(playerId);
    }

    if (player.currentClubId !== clubId) {
      throw new UnauthorizedError('Player does not belong to your club');
    }

    // Check if player is already listed
    const existingListing = await this.prisma.transferListing.findFirst({
      where: {
        playerId,
        status: 'ACTIVE',
      },
    });

    if (existingListing) {
      throw new PlayerAlreadyListedError(playerId);
    }

    // Create the transfer listing
    const transferListing = await this.prisma.transferListing.create({
      data: {
        player: { connect: { id: playerId } },
        club: { connect: { id: clubId } },
        askingPrice,
        listingType,
        loanFee: listingType !== 'TRANSFER' ? loanFee : undefined,
        wageContribution: listingType !== 'TRANSFER' ? wageContribution : undefined,
        status: 'ACTIVE',
        deadline,
      },
      include: {
        player: true,
        club: true,
        offers: true
      }
    });

    // Notify about the new listing
    if (this.io) {
      this.io.emit(TransferMarketEvent.PlayerListed, transfer);
    }

    return transfer;
  }

  /**
   * Makes a transfer offer for a player
   * @param transferId - ID of the transfer listing
   * @returns The created transfer offer with related data
   * @throws {TransferNotFoundError} If the transfer listing is not found
   * @throws {TransferNotAvailableError} If the transfer is no longer available
   * @throws {InsufficientFundsError} If the buying club doesn't have enough funds
   * @throws {OfferTooLowError} If the offer is lower than the asking price or current highest offer
   */
  async makeOffer(offerDetails: {
    listingId: number;
    fromClubId: number;
    toClubId: number;
    amount: number;
    isLoan: boolean;
    loanEndDate?: Date;
    wageContribution?: number;
    clauses?: TransferOfferClauses;
  }): Promise<TransferOfferWithRelations> {
    const {
      listingId,
      fromClubId,
      toClubId,
      amount,
      isLoan,
      loanEndDate,
      wageContribution,
      clauses = {}
    } = offerDetails;

    // Check if transfer listing exists and is available
    const listing = await this.prisma.transferListing.findUnique({
      where: { id: listingId },
      include: {
        player: true,
        club: true,
        offers: {
          where: {
            status: { in: ['PENDING', 'ACCEPTED'] as const }
          },
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!listing) {
      throw new TransferNotFoundError(`Listing with ID ${listingId} not found`);
    }

    if (listing.status !== 'ACTIVE') {
      throw new TransferNotAvailableError(`Listing with ID ${listingId} is not available`);
    }

    // Check if the buying club has enough funds
    const buyingClub = await this.prisma.club.findUnique({
      where: { id: fromClubId },
      select: {
        id: true,
        name: true,
        balance: true,
        league: true
      }
    });

    if (!buyingClub) {
      throw new ClubNotFoundError(fromClubId);
    }

    if (buyingClub.balance < amount) {
      throw new InsufficientFundsError(fromClubId, amount, buyingClub.balance);
    }

    // Check if offer meets minimum requirements
    const currentHighestOffer = listing.offers[0]?.amount || 0;
    const minimumOffer = Math.max(listing.askingPrice, currentHighestOffer + 1);

    if (amount < minimumOffer) {
      throw new OfferTooLowError(amount, minimumOffer);
    }
      type: 'OFFER_MADE',
      timestamp: new Date(),
      details: {
        fee: offer.amount,
        wage: offer.wage,
        contractLength: offer.contractLength,
        clauses: offer.clauses || {}
      }
    };

    const transferOffer = await this.prisma.transferOffer.create({
      data: {
        transferId,
        fromClubId,
        toClubId: transfer.fromClubId,
        playerId: transfer.playerId,
        amount: offer.amount,
        wage: offer.wage,
        contractLength: offer.contractLength,
        clauses: offer.clauses || {},
        isLoan,
        loanEndDate: isLoan && loanDetails ? 
          new Date(Date.now() + loanDetails.duration * 30 * 24 * 60 * 60 * 1000) : 
          null,
        wageContribution: isLoan && loanDetails ? loanDetails.wageContribution : null,
        optionToBuy: isLoan && loanDetails ? loanDetails.optionToBuy : false,
        optionToBuyFee: isLoan && loanDetails && loanDetails.optionToBuy ? 
          loanDetails.optionToBuyFee || null : 
          null,
        status: 'PENDING' as const,
        history: [historyItem] as Prisma.InputJsonValue
      },
      include: {
        fromClub: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        toClub: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            overall: true,
            potential: true
          }
        }
      }
    });

    // Update transfer status to UNDER_OFFER if not already
    if (transfer.status === 'LISTED') {
      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { status: 'UNDER_OFFER' as const }
      });
    }

    // Notify about the new offer
    if (this.io) {
      this.io.emit(TransferMarketEvent.OfferMade, transferOffer);
      
      // Notify the selling club specifically
      this.io.to(`club:${transfer.fromClubId}`).emit(
        TransferMarketEvent.NewOfferReceived, 
        transferOffer
      );
    }

    return transferOffer as unknown as TransferOfferWithRelations;
  }

  /**
   * Respond to a transfer offer
   */
  async respondToOffer(
    offerId: number,
    response: 'ACCEPTED' | 'REJECTED' | 'COUNTERED',
    userId: number,
    counterOffer?: {
      fee: number;
      wage: number;
      contractLength: number;
    },
    message?: string
  ): Promise<TransferOfferResponse> {
    const offer = await this.prisma.transferOffer.findUnique({
      where: { id: offerId },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        transfer: true
      }
    });

    if (!offer) {
      throw new Error(t('errors.offerNotFound'));
    }

    // Verify user has permission to respond to this offer
    const club = await this.prisma.club.findFirst({
      where: {
        id: offer.toClubId,
        userId
      }
    });

    if (!club) {
      throw new Error(t('errors.unauthorized'));
    }

    // Update offer status
    const updatedOffer = await this.prisma.transferOffer.update({
      where: { id: offerId },
      data: {
        status: response as OfferStatus,
        updatedAt: new Date(),
        history: [
          ...(offer.history as TransferOfferHistoryItem[] || []),
          {
            type: `OFFER_${response}`,
            timestamp: new Date(),
            details: { response, message, counterOffer }
          }
        ]
      },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        transfer: true
      }
    });

    // Handle the response
    if (response === 'ACCEPTED') {
      await this.processTransfer(updatedOffer);
    } else if (response === 'COUNTERED' && counterOffer) {
      // Create a new counter offer
      await this.makeOffer(
        offer.playerId,
        offer.toClubId, // The original toClub becomes the fromClub in the counter
        offer.fromClubId, // The original fromClub becomes the toClub in the counter
        counterOffer.fee,
        counterOffer.wage,
        counterOffer.contractLength,
        offer.clauses as TransferOfferClauses
      );
    }

    // Notify about the response
    if (this.io) {
      this.io.emit('transfer:offerUpdated', updatedOffer);
      this.io.to(`club:${offer.fromClubId}`).emit('transfer:offerResponse', {
        offerId: offer.id,
        response,
        message,
        counterOffer
      });
    }

    return {
      status: response as 'ACCEPTED' | 'REJECTED' | 'COUNTERED',
      message,
      counterOffer: response === 'COUNTERED' ? counterOffer : undefined
    };
  }

  /**
   * Process a transfer after an offer is accepted
   */
  private async processTransfer(offer: TransferOfferWithRelations): Promise<void> {
    await this.prisma.$transaction([
      // Update player's club
      this.prisma.player.update({
        where: { id: offer.playerId },
        data: {
          clubId: offer.fromClubId,
          wage: offer.wage,
          contractExpiry: new Date(
            new Date().setFullYear(
              new Date().getFullYear() + (offer.contractLength || 1)
            )
          )
        }
      }),

      // Update transfer status
      this.prisma.transfer.update({
        where: { id: offer.transferId },
        data: {
          status: 'SOLD',
          soldFor: offer.fee,
          soldTo: offer.fromClubId,
          soldAt: new Date()
        }
      }),

      // Update club balances
      this.prisma.club.update({
        where: { id: offer.toClubId },
        data: { balance: { decrement: offer.fee } }
      }),
      this.prisma.club.update({
        where: { id: offer.fromClubId },
        data: { balance: { increment: offer.fee } }
      })
    ]);
  }

  /**
   * Get transfer offers for a club
   */
  async getClubTransferOffers(
    clubId: number,
    type: 'incoming' | 'outgoing' | 'all' = 'all',
    status?: string
  ): Promise<TransferOfferWithRelations[]> {
    const where: Prisma.TransferOfferWhereInput = {};

    if (type === 'incoming' || type === 'all') {
      where.OR = [
        ...(where.OR || []),
        { toClubId: clubId }
      ];
    }

    if (type === 'outgoing' || type === 'all') {
      where.OR = [
        ...(where.OR || []),
        { fromClubId: clubId }
      ];
    }

    if (status) {
      where.status = status as OfferStatus;
    }

    return this.prisma.transferOffer.findMany({
      where,
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        transfer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get transfer history for a player
   */
  async getPlayerTransferHistory(playerId: number): Promise<TransferOfferWithRelations[]> {
    return this.prisma.transferOffer.findMany({
      where: {
        playerId,
        status: { in: ['ACCEPTED', 'REJECTED'] as OfferStatus[] }
      },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        transfer: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  /**
   * Withdraw a player from the transfer market
   */
  async withdrawPlayer(playerId: number): Promise<TransferListingWithPlayer> {
    const listing = await this.prisma.transfer.findFirst({
      where: {
        playerId,
        status: { in: ['LISTED', 'UNDER_OFFER'] as TransferStatus[] }
      },
      include: {
        player: true,
        club: true,
        offers: true
      }
    });

    if (!listing) {
      throw new Error(t('errors.noActiveListing'));
    }

    // Update the listing status
    const updatedListing = await this.prisma.transfer.update({
      where: { id: listing.id },
      data: {
        status: 'WITHDRAWN',
        updatedAt: new Date(),
        history: [
          ...(listing.history as TransferOfferHistoryItem[] || []),
          {
            type: 'WITHDRAWN',
            timestamp: new Date(),
            details: {}
          }
        ]
      },
      include: {
        player: true,
        club: true,
        offers: true
      }
    });

    // Reject all pending offers
    await this.prisma.transferOffer.updateMany({
      where: {
        transferId: listing.id,
        status: 'PENDING'
      },
      data: {
        status: 'REJECTED',
        updatedAt: new Date(),
        history: {
          push: {
            type: 'OFFER_REJECTED',
            timestamp: new Date(),
            details: { reason: 'Listing withdrawn' }
          }
        }
      }
    });

    // Notify about the withdrawal
    if (this.io) {
      this.io.emit('transfer:playerWithdrawn', updatedListing);
    }

    return updatedListing;
  }

  /**
   * Get transfer market statistics
   */
  async getTransferMarketStats() {
    const [
      totalListings,
      activeListings,
      totalTransfers,
      totalOffers,
      highestTransfer
    ] = await Promise.all([
      this.prisma.transfer.count(),
      this.prisma.transfer.count({
        where: { status: { in: ['LISTED', 'UNDER_OFFER'] as TransferStatus[] } }
      }),
      this.prisma.transfer.count({
        where: { status: 'SOLD' }
      }),
      this.prisma.transferOffer.count(),
      this.prisma.transfer.findFirst({
        where: { status: 'SOLD' },
        orderBy: { soldFor: 'desc' },
        include: { player: true }
      })
    ]);

    return {
      totalListings,
      activeListings,
      totalTransfers,
      totalOffers,
      highestTransfer: highestTransfer ? {
        player: highestTransfer.player,
        fee: highestTransfer.soldFor,
        date: highestTransfer.soldAt
      } : null
    };
  }
}
