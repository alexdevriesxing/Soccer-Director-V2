import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { transferListingService } from '../services/transferListing.service';

const prisma = new PrismaClient();
const router = express.Router();

// Extend Request type for user
interface AuthRequest extends express.Request {
  user?: { id: number; role: string; clubId?: number };
}

// Get active transfer listings
router.get('/listings', async (req, res) => {
  try {
    const { position, minPrice, maxPrice, clubId, leagueId } = req.query;

    const listings = await transferListingService.getActiveListings({
      position: position as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      clubId: clubId ? Number(clubId) : undefined,
      leagueId: leagueId ? Number(leagueId) : undefined
    });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfer listings' });
  }
});

// List a player for transfer
router.post('/list', authenticate, async (req: AuthRequest, res) => {
  try {
    const { playerId, askingPrice, listingType, loanFee, wageContribution } = req.body;
    const clubId = req.user?.clubId || 1;

    const listing = await transferListingService.listPlayer({
      playerId,
      clubId,
      askingPrice,
      listingType,
      loanFee,
      wageContribution
    });

    res.status(201).json(listing);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to list player' });
  }
});

// Cancel a listing
router.delete('/listings/:listingId', authenticate, async (req: AuthRequest, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const clubId = req.user?.clubId || 1;

    await transferListingService.cancelListing(listingId, clubId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to cancel listing' });
  }
});

// Get transfer offers
router.get('/offers', authenticate, async (req: AuthRequest, res) => {
  try {
    const clubId = req.user?.clubId || parseInt(req.query.clubId as string) || 1;

    const offers = await prisma.transferOffer.findMany({
      where: {
        OR: [{ fromClubId: clubId }, { toClubId: clubId }]
      },
      include: {
        player: true,
        fromClub: true,
        toClub: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfer offers' });
  }
});

// Make a transfer offer
router.post('/offers', authenticate, async (req: AuthRequest, res) => {
  try {
    const { playerId, toClubId, amount, deadline } = req.body;
    const fromClubId = req.user?.clubId || 1;

    const offer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId,
        toClubId,
        amount,
        deadline: new Date(deadline),
        status: 'PENDING',
        initiator: 'user',
        history: []
      }
    });

    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transfer offer' });
  }
});

export default router;
