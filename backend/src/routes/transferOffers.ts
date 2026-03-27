import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// Create a new transfer offer
router.post('/', async (req, res) => {
  try {
    const { playerId, fromClubId, toClubId, amount, deadline } = req.body;
    if (!playerId || !fromClubId || !toClubId || !amount || !deadline) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    const fromClub = await prisma.club.findUnique({ where: { id: fromClubId } });
    const toClub = await prisma.club.findUnique({ where: { id: toClubId } });
    if (!fromClub || !toClub) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    if (player.currentClubId !== fromClubId) {
      res.status(400).json({ error: 'Player does not belong to fromClub' });
      return;
    }

    // Create offer with correct schema fields
    const offer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId,
        toClubId,
        initiator: 'user',
        status: 'PENDING',
        amount,
        deadline: new Date(deadline),
        history: []
      }
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
    const { action, counterAmount } = req.body;
    if (!['accept', 'reject', 'counter'].includes(action)) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    const offer = await prisma.transferOffer.findUnique({ where: { id: offerId } });
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
      res.status(400).json({ error: 'Offer is not pending or countered' });
      return;
    }

    let updatedOffer;
    const newHistory = Array.isArray(offer.history) ? offer.history : [];

    if (action === 'accept') {
      updatedOffer = await prisma.transferOffer.update({
        where: { id: offerId },
        data: {
          status: 'ACCEPTED',
          history: [...newHistory, { action: 'accept', date: new Date() }]
        }
      });
    } else if (action === 'reject') {
      updatedOffer = await prisma.transferOffer.update({
        where: { id: offerId },
        data: {
          status: 'REJECTED',
          history: [...newHistory, { action: 'reject', date: new Date() }]
        }
      });
    } else if (action === 'counter') {
      if (!counterAmount) {
        res.status(400).json({ error: 'Missing counterAmount for counter action' });
        return;
      }
      updatedOffer = await prisma.transferOffer.update({
        where: { id: offerId },
        data: {
          status: 'COUNTERED',
          counteredAmount: counterAmount,
          history: [...newHistory, { action: 'counter', date: new Date(), counterAmount }]
        }
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
    if (!clubId) {
      res.status(400).json({ error: 'Missing clubId query param' });
      return;
    }

    const where: any = {
      OR: [
        { fromClubId: clubId },
        { toClubId: clubId }
      ]
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
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    if (player.currentClubId !== null) {
      res.status(400).json({ error: 'Player is not a free agent' });
      return;
    }

    const club = await prisma.club.findUnique({ where: { id: toClubId } });
    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    const freeAgentClub = await prisma.club.findFirst({ where: { name: 'Free Agent' } });

    // Update player with correct field names
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        currentClubId: toClubId,
        weeklyWage: wage,
        contractEnd: new Date(contractExpiry)
      }
    });

    // Log as finalized TransferOffer
    await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId: freeAgentClub?.id || toClubId,
        toClubId,
        initiator: 'user',
        status: 'ACCEPTED',
        amount: 0,
        deadline: new Date(contractExpiry),
        history: [{ action: 'signed', date: new Date(), wage }]
      }
    });
    res.json({ player: updatedPlayer });
  } catch (err) {
    console.error('Error signing free agent:', err);
    res.status(500).json({ error: 'Failed to sign free agent' });
  }
});

export default router;