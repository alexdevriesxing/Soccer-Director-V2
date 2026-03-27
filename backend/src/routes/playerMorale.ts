import express, { Request, Response } from 'express';
import playerMoraleService from '../services/playerMoraleService';

const router = express.Router();

// GET /api/player-morale/:playerId
router.get('/:playerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const morale = await playerMoraleService.getPlayerMorale(playerId);
    res.json(morale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player morale' });
  }
});

// GET /api/player-morale/squad/:clubId
router.get('/squad/:clubId', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const morale = await playerMoraleService.getSquadMorale(clubId);
    res.json(morale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch squad morale' });
  }
});

// POST /api/player-morale/:playerId/update
router.post('/:playerId/update', async (req: Request, res: Response): Promise<void> => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const { change } = req.body;
    const result = await playerMoraleService.updateMorale(playerId, change || 0);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update morale' });
  }
});

export default router;