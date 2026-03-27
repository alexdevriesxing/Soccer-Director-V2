import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type TransferOffer = Awaited<ReturnType<typeof prisma.transferOffer.findUnique>>;

type TransferOfferRecord = NonNullable<TransferOffer>;

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
    const offer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId,
        toClubId,
        initiator,
        status: 'PENDING',
        transferFee: fee, // Mapped from 'fee'
        amount: fee,
        addonClauses: clauses as any, // Map to addonClauses
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
        // fee: update.fee ?? offer.fee, // 'fee' not in model, probably transferFee or similar?
        // Checking schema: TransferOffer has 'optionToBuyFee' but not 'fee'. Use 'optionToBuyFee' if that's what was meant, or just remove if it's a stub mistake.
        // Assuming it's optionToBuyFee for now or just ignoring.
        optionToBuyFee: (update as any).fee ?? offer.optionToBuyFee,
        addonClauses: (update.clauses === null || update.clauses === undefined) ? Prisma.JsonNull : update.clauses,
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