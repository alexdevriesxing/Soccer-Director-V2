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
  sellOnFee?: number;
  buyBackClause?: {
    amount: number;
    validUntil: Date;
  };
  matchHighestOffer?: boolean;
  promotionBonus?: number;
  relegationRelease?: boolean;
  internationalCapsBonus?: number;
  goalBonus?: number;
  cleanSheetBonus?: number;
  appearanceBonus?: number;
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
   */
  async listPlayer(
    playerId: number,
    clubId: number,
    askingPrice: number,
    listingType: 'TRANSFER' | 'LOAN' | 'BOTH' = 'TRANSFER',
    loanFee?: number,
    wageContribution?: number,
    deadline?: Date
  ): Promise<TransferListingWithRelations> {
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
      this.io.emit(TransferMarketEvent.PlayerListed, transferListing);
    }

    return transferListing;
  }

  /**
   * Makes a transfer offer for a player
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
            status: { in: ['PENDING', 'ACCEPTED'] }
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

    // Create the transfer offer
    const transferOffer = await this.prisma.transferOffer.create({
      data: {
        player: { connect: { id: listing.playerId } },
        fromClub: { connect: { id: fromClubId } },
        toClub: { connect: { id: toClubId } },
        listing: { connect: { id: listingId } },
        amount,
        isLoan,
        loanEndDate: isLoan ? loanEndDate : undefined,
        wageContribution: isLoan ? wageContribution : undefined,
        status: 'PENDING',
        addonClauses: clauses as unknown as Prisma.InputJsonValue,
        history: JSON.stringify([{
          type: 'OFFER_MADE',
          timestamp: new Date().toISOString(),
          details: { amount, isLoan, clauses }
        }])
      },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        listing: true
      }
    });

    // Notify about the new offer
    if (this.io) {
      this.io.emit(TransferMarketEvent.OfferMade, transferOffer);
    }

    return transferOffer;
  }

  /**
   * Get all active transfer listings
   */
  async getActiveListings(): Promise<TransferListingWithRelations[]> {
    return this.prisma.transferListing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        player: true,
        club: true,
        offers: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get transfer offers for a club
   */
  async getClubTransferOffers(
    clubId: number,
    type: 'incoming' | 'outgoing' | 'all' = 'all'
  ): Promise<TransferOfferWithRelations[]> {
    const where: Prisma.TransferOfferWhereInput = {};

    if (type === 'incoming') {
      where.toClubId = clubId;
    } else if (type === 'outgoing') {
      where.fromClubId = clubId;
    } else {
      where.OR = [
        { toClubId: clubId },
        { fromClubId: clubId }
      ];
    }

    return this.prisma.transferOffer.findMany({
      where,
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        listing: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get transfer history for a player
   */
  async getPlayerTransferHistory(playerId: number): Promise<TransferOfferWithRelations[]> {
    return this.prisma.transferOffer.findMany({
      where: {
        playerId,
        status: { in: ['ACCEPTED', 'REJECTED'] }
      },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
        listing: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Withdraw a player from the transfer market
   */
  async withdrawPlayer(listingId: number): Promise<TransferListingWithRelations> {
    const listing = await this.prisma.transferListing.findUnique({
      where: { id: listingId },
      include: {
        player: true,
        club: true,
        offers: true
      }
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new TransferNotFoundError('No active listing found');
    }

    // Update the listing status
    const updatedListing = await this.prisma.transferListing.update({
      where: { id: listingId },
      data: { status: 'WITHDRAWN' },
      include: {
        player: true,
        club: true,
        offers: true
      }
    });

    // Reject all pending offers
    await this.prisma.transferOffer.updateMany({
      where: {
        listingId: listing.id,
        status: 'PENDING'
      },
      data: { status: 'REJECTED' }
    });

    // Notify about the withdrawal
    if (this.io) {
      this.io.emit(TransferMarketEvent.PlayerWithdrawn, updatedListing);
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
      completedTransfers,
      totalOffers
    ] = await Promise.all([
      this.prisma.transferListing.count(),
      this.prisma.transferListing.count({
        where: { status: 'ACTIVE' }
      }),
      this.prisma.transferListing.count({
        where: { status: 'COMPLETED' }
      }),
      this.prisma.transferOffer.count()
    ]);

    return {
      totalListings,
      activeListings,
      completedTransfers,
      totalOffers
    };
  }
}
