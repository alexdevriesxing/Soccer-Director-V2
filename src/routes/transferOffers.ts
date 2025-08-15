import express from 'express';
import TransferOfferService from '../services/transferOfferService';

const router = express.Router();

// Create a new transfer offer
router.post('/', async (req, res) => {
  try {
    const { playerId, fromClubId, toClubId, initiator, fee, clauses, deadline } = req.body;
    const offer = await TransferOfferService.createOffer({ playerId, fromClubId, toClubId, initiator, fee, clauses, deadline });
    res.status(201).json(offer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Respond to an offer (accept, reject, counter, withdraw)
router.post('/:id/respond', async (req, res) => {
  try {
    const offerId = parseInt(req.params.id, 10);
    const { response, update } = req.body;
    const offer = await TransferOfferService.respondToOffer(offerId, response, update);
    res.json(offer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get a transfer offer by ID
router.get('/:id', async (req, res) => {
  try {
    const offerId = parseInt(req.params.id, 10);
    const offer = await TransferOfferService.getOfferById(offerId);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all offers for a player
router.get('/player/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const offers = await TransferOfferService.getOffersForPlayer(playerId);
    res.json(offers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all offers for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const offers = await TransferOfferService.getOffersForClub(clubId);
    res.json(offers);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 