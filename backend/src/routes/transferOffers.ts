import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// Create a new transfer offer
router.post('/', async (req, res) => {
  try {
    const { playerId, fromClubId, toClubId, fee, clauses, deadline } = req.body;
    if (!playerId || !fromClubId || !toClubId || !fee || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Validate player and clubs
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    const fromClub = await prisma.club.findUnique({ where: { id: fromClubId } });
    const toClub = await prisma.club.findUnique({ where: { id: toClubId } });
    if (!fromClub || !toClub) return res.status(404).json({ error: 'Club not found' });
    if (player.clubId !== fromClubId) return res.status(400).json({ error: 'Player does not belong to fromClub' });
    // Determine initiator from session/auth (future: integrate real auth)
    let initiator = 'user';
    // Use type assertions to avoid TypeScript errors (temporary workaround)
    const reqAny = req as any;
    if (reqAny.user && reqAny.user.role) {
      initiator = reqAny.user.role;
    } else if (reqAny.session && reqAny.session.user && reqAny.session.user.role) {
      initiator = reqAny.session.user.role;
    }
    // Create offer
    const offer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId,
        toClubId,
        initiator, // Now set from session/user if available
        status: 'pending',
        fee,
        clauses: clauses || {},
        deadline: new Date(deadline),
        history: [],
      },
    });
    res.status(201).json(offer);
  } catch (err) {
    console.error('Error creating transfer offer:', err);
    res.status(500).json({ error: 'Failed to create transfer offer' });
  }
});

// Respond to a transfer offer (accept/reject/counter)
router.post('/:id/respond', async (req, res) => {
  try {
    const offerId = parseInt(req.params.id);
    const { action, counterFee, counterClauses } = req.body;
    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    const offer = await prisma.transferOffer.findUnique({ where: { id: offerId } });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({ error: 'Offer is not pending or countered' });
    }
    let updatedOffer;
    let newHistory = Array.isArray(offer.history) ? offer.history : [];
    if (action === 'accept') {
      updatedOffer = await prisma.transferOffer.update({
        where: { id: offerId },
        data: {
          status: 'accepted',
          history: [...newHistory, { action: 'accept', date: new Date() }],
        },
      });
    } else if (action === 'reject') {
      updatedOffer = await prisma.transferOffer.update({
        where: { id: offerId },
        data: {
          status: 'rejected',
          history: [...newHistory, { action: 'reject', date: new Date() }],
        },
      });
    } else if (action === 'counter') {
      if (!counterFee) return res.status(400).json({ error: 'Missing counterFee for counter action' });
      updatedOffer = await prisma.transferOffer.update({
        where: { id: offerId },
        data: {
          status: 'countered',
          fee: counterFee,
          clauses: counterClauses || offer.clauses,
          history: [...newHistory, { action: 'counter', date: new Date(), counterFee, counterClauses }],
        },
      });
    }
    res.json(updatedOffer);
  } catch (err) {
    console.error('Error responding to transfer offer:', err);
    res.status(500).json({ error: 'Failed to respond to transfer offer' });
  }
});

// List all offers for a club (incoming/outgoing)
router.get('/', async (req, res) => {
  try {
    const clubId = parseInt(req.query.clubId as string);
    const status = req.query.status as string | undefined;
    if (!clubId) return res.status(400).json({ error: 'Missing clubId query param' });
    const where: any = {
      OR: [
        { fromClubId: clubId },
        { toClubId: clubId },
      ],
    };
    if (status) where.status = status;
    const offers = await prisma.transferOffer.findMany({ where });
    res.json(offers);
  } catch (err) {
    console.error('Error listing transfer offers:', err);
    res.status(500).json({ error: 'Failed to list transfer offers' });
  }
});

// Sign a free agent
router.post('/free-agent', async (req, res) => {
  try {
    const { playerId, toClubId, wage, contractExpiry } = req.body;
    if (!playerId || !toClubId || !wage || !contractExpiry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Validate player
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.clubId !== null) {
      return res.status(400).json({ error: 'Player is not a free agent' });
    }
    // Validate club
    const club = await prisma.club.findUnique({ where: { id: toClubId } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    // Find the Free Agent club before creating the offer
    const freeAgentClub = await prisma.club.findFirst({ where: { name: 'Free Agent' } });
    if (!freeAgentClub) return res.status(500).json({ error: 'Free Agent club not found' });
    // Update player
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        clubId: toClubId,
        wage,
        contractExpiry: new Date(contractExpiry),
      },
    });
    // Log as finalized TransferOffer
    await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId: freeAgentClub.id, // Use Free Agent club's ID instead of null
        toClubId,
        initiator: 'user',
        status: 'finalized',
        fee: 0,
        clauses: {},
        deadline: new Date(contractExpiry),
        history: [{ action: 'signed', date: new Date(), wage }],
      },
    });
    res.json({ player: updatedPlayer });
  } catch (err) {
    console.error('Error signing free agent:', err);
    res.status(500).json({ error: 'Failed to sign free agent' });
  }
});

export default router; 