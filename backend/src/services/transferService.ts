import { PrismaClient, Prisma } from '@prisma/client';
// import { Server } from 'socket.io';

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
// Removed TransferWithRelations as Transfer model does not exist

export type TransferOfferWithRelations = Prisma.TransferOfferGetPayload<{
  include: {
    listing: true;
    toClub: true;
  };
}>;

export type TransferListingWithRelations = Prisma.TransferListingGetPayload<{
  include: {
    player: true;
    club: true;
    offers: true;
  };
}>;

export type LoanWithRelations = Prisma.LoanGetPayload<{
  include: {
    player: true;
    fromClub: true;
    toClub: true;
  };
}>;

export type PlayerWithRelations = Prisma.PlayerGetPayload<{
  include: {
    currentClub: true; // Corrected from 'club'
    transferListings: true;
    transferOffers: true;
    loans: true;
  };
}>;

export type ClubWithRelations = Prisma.ClubGetPayload<{
  include: {
    players: true;
    transferListings: true;
    offersMade: true; // Corrected from transferOffers to offersMade (based on schema)
    offersReceived: true; // Added offersReceived
    loansOut: true; // Corrected from sentLoans
    loansIn: true; // Corrected from receivedLoans
  };
}>;

// Export all types for external use
export type {
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
  // private static instance: PrismaClient;
  // private static ioInstance: Server | null = null;
  // Unused methods removed or commented out to satisfy linter
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
      offers: true
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
