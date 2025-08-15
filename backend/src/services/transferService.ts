import { PrismaClient, Prisma } from '@prisma/client';
import { Server } from 'socket.io';

// Custom error classes for the transfer service
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

// Export enums for external use
export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED'
}

// Define Prisma transaction client type
type PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

// Define types using Prisma's generated types
type TransferWithRelations = Prisma.TransferGetPayload<{
  include: {
    player: true;
    fromClub: true;
    toClub: true;
  };
}>;

type TransferOfferWithRelations = Prisma.TransferOfferGetPayload<{
  include: {
    listing: true;
    toClub: true;
  };
}>;

type TransferListingWithRelations = Prisma.TransferListingGetPayload<{
  include: {
    player: true;
    club: true;
    transferOffers: true;
  };
}>;

type LoanWithRelations = Prisma.LoanGetPayload<{
  include: {
    player: true;
    fromClub: true;
    toClub: true;
  };
}>;

type PlayerWithRelations = Prisma.PlayerGetPayload<{
  include: {
    club: true;
    transferListings: true;
    transferOffers: true;
    loans: true;
  };
}>;

type ClubWithRelations = Prisma.ClubGetPayload<{
  include: {
    players: true;
    transferListings: true;
    transferOffers: true;
    sentTransfers: true;
    receivedTransfers: true;
    sentLoans: true;
    receivedLoans: true;
  };
}>;

// Export all types for external use
export type { 
  TransferWithRelations as Transfer,
  TransferOfferWithRelations as TransferOffer,
  TransferListingWithRelations as TransferListing,
  LoanWithRelations as Loan,
  PlayerWithRelations as Player,
  ClubWithRelations as Club,
  PrismaTransactionClient
};

/**
 * Service class for handling transfer-related operations
 */
export class TransferService {
  private static instance: PrismaClient;
  private static ioInstance: Server | null = null;

  /**
   * Get the Prisma client instance
   */
  private static get prisma(): PrismaClient {
    if (!TransferService.instance) {
      TransferService.instance = new PrismaClient();
    }
    return TransferService.instance;
  }

  /**
   * Get the Socket.IO server instance
   */
  private static get io(): Server {
    if (!TransferService.ioInstance) {
      throw new Error('Socket.IO instance not initialized. Call initialize() first.');
    }
    return TransferService.ioInstance;
  }

  /**
   * Initialize the service with required dependencies
   * @param ioInstance Socket.IO server instance
   */
  public static initialize(ioInstance?: Server): void {
    if (ioInstance) {
      TransferService.ioInstance = ioInstance;
    }
  }

  /**
   * Helper function to safely emit socket.io events
   * @param event Event name
   * @param data Event data
   * @param room Optional room to emit to
   */
  private static emitSocketEvent<T>(event: string, data: T, room?: string): void {
    try {
      if (room) {
        this.io.to(room).emit(event, data);
      } else {
        this.io.emit(event, data);
      }
    } catch (error) {
      console.error('Error emitting socket event:', error);
    }
  }

  // Add your service methods here
  // For example:
  // public static async someMethod() { ... }
}

// Helper functions
export async function getTransferListingWithRelations(
  prisma: PrismaClient | PrismaTransactionClient,
  id: number
): Promise<TransferListingWithRelations | null> {
  return prisma.transferListing.findUnique({
    where: { id },
    include: {
      player: true,
      club: true,
      transferOffers: true
    }
  });
}

export async function getTransferOfferWithRelations(
  prisma: PrismaClient | PrismaTransactionClient,
  id: number
): Promise<TransferOfferWithRelations | null> {
  return prisma.transferOffer.findUnique({
    where: { id },
    include: {
      listing: true,
      toClub: true
    }
  });
}
