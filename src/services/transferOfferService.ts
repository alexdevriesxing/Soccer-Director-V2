import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TransferOffer = Awaited<ReturnType<typeof prisma.transferOffer.findUnique>>;
type TransferOfferRecord = NonNullable<TransferOffer>;

function validateClauses(clauses: any[]): void {
  for (const clause of clauses) {
    if (clause.type === 'sell_on_percentage') {
      if (typeof clause.value !== 'number' || clause.value < 0 || clause.value > 50) {
        throw new Error('Sell-on percentage must be a number between 0 and 50');
      }
    } else if (clause.type === 'future_bonus') {
      if (typeof clause.condition !== 'string' || !clause.condition) {
        throw new Error('Future bonus must have a valid condition');
      }
      if (typeof clause.threshold !== 'number' || clause.threshold <= 0) {
        throw new Error('Future bonus threshold must be a positive number');
      }
      if (typeof clause.amount !== 'number' || clause.amount <= 0) {
        throw new Error('Future bonus amount must be a positive number');
      }
    }
    // Add more clause types here as needed
  }
}

class TransferOfferService {
  /**
   * Create a new transfer offer with negotiation details.
   */
  static async createOffer({ playerId, fromClubId, toClubId, initiator, fee, clauses, deadline }: {
    playerId: number,
    fromClubId: number,
    toClubId: number,
    initiator: 'user' | 'AI',
    fee: number,
    clauses: any[],
    deadline: Date
  }): Promise<TransferOfferRecord> {
    validateClauses(clauses);
    const offer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId,
        toClubId,
        initiator,
        status: 'pending',
        fee,
        clauses,
        deadline,
        history: JSON.stringify([])
      }
    });
    return offer;
  }

  /**
   * Respond to an existing offer (accept, reject, counter, withdraw).
   */
  static async respondToOffer(offerId: number, response: 'accepted' | 'rejected' | 'countered' | 'withdrawn', update: Partial<{ fee: number, clauses: any[], deadline: Date, initiator: 'user' | 'AI' }>): Promise<TransferOfferRecord> {
    const offer = await prisma.transferOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new Error('Offer not found');
    if (update.clauses) validateClauses(update.clauses);
    // Update history
    const history = Array.isArray(offer.history) ? offer.history : JSON.parse(offer.history as any);
    history.push({
      timestamp: new Date().toISOString(),
      response,
      ...update
    });
    const updatedOffer = await prisma.transferOffer.update({
      where: { id: offerId },
      data: {
        status: response,
        fee: update.fee ?? offer.fee,
        clauses: update.clauses ?? offer.clauses,
        deadline: update.deadline ?? offer.deadline,
        initiator: update.initiator ?? offer.initiator,
        history: JSON.stringify(history)
      }
    });
    return updatedOffer;
  }

  /**
   * Get a transfer offer by ID.
   */
  static async getOfferById(offerId: number): Promise<TransferOffer | null> {
    return prisma.transferOffer.findUnique({ where: { id: offerId } });
  }

  /**
   * Get all offers for a player.
   */
  static async getOffersForPlayer(playerId: number): Promise<TransferOfferRecord[]> {
    return prisma.transferOffer.findMany({ where: { playerId }, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Get all offers for a club (as buyer or seller).
   */
  static async getOffersForClub(clubId: number): Promise<TransferOfferRecord[]> {
    return prisma.transferOffer.findMany({
      where: {
        OR: [
          { fromClubId: clubId },
          { toClubId: clubId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default TransferOfferService; 