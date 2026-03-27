import express, { Request, Response } from 'express';
import youthDevelopmentService from '../services/youthDevelopmentService';

const router = express.Router();

// GET /api/youth-development/:clubId
router.get('/:clubId', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const players = await youthDevelopmentService.getYouthPlayers(clubId);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch youth players' });
  }
});

// GET /api/youth-development/:clubId/stats
router.get('/:clubId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const stats = await youthDevelopmentService.getYouthStats(clubId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch youth stats' });
  }
});

// POST /api/youth-development/:playerId/develop
router.post('/:playerId/develop', async (req: Request, res: Response): Promise<void> => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const result = await youthDevelopmentService.developPlayer(playerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to develop player' });
  }
});

export default router;