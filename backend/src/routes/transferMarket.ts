import express, { Request, Response } from 'express';
import { TransferMarketService } from '../services/transferMarketService';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

const router = express.Router();
const prisma = new PrismaClient();

// Will be initialized when app starts
let transferService: TransferMarketService;

export const initTransferMarketRoutes = (io: SocketIOServer) => {
  transferService = new TransferMarketService(prisma, io);
};

// GET /api/transfer-market/listings
router.get('/listings', async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!transferService) {
      res.status(503).json({ error: 'Transfer service not initialized' });
      return;
    }
    const listings = await transferService.getActiveListings();
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch transfer listings' });
  }
});

// GET /api/transfer-market/stats
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!transferService) {
      res.status(503).json({ error: 'Transfer service not initialized' });
      return;
    }
    const stats = await transferService.getTransferMarketStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch transfer market stats' });
  }
});

// GET /api/transfer-market/club/:clubId/offers
router.get('/club/:clubId/offers', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!transferService) {
      res.status(503).json({ error: 'Transfer service not initialized' });
      return;
    }
    const clubId = parseInt(req.params.clubId, 10);
    const type = (req.query.type as 'incoming' | 'outgoing' | 'all') || 'all';
    const offers = await transferService.getClubTransferOffers(clubId, type);
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch transfer offers' });
  }
});

export default router;