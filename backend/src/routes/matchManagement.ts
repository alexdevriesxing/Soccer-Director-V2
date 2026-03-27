import express, { Request, Response } from 'express';
import { LiveMatchService } from '../services/liveMatchService';

const router = express.Router();

// GET /api/match-management
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const liveMatchIds = Array.from(LiveMatchService.getLiveMatchIds());
    res.json({ success: true, matches: liveMatchIds });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch live matches' });
  }
});

// GET /api/match-management/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const matchState = LiveMatchService.getMatchState(id);

  if (matchState) {
    res.json({ success: true, match: matchState });
  } else {
    res.status(404).json({ success: false, error: 'Match not active' });
  }
});

// POST /api/matches/:id/start
router.post('/:id/start', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  try {
    let matchState = LiveMatchService.getMatchState(id);
    if (!matchState) {
      matchState = await LiveMatchService.initializeMatch(id);
    }
    LiveMatchService.startMatch(id);
    res.json({ success: true, message: 'Match started', match: matchState });
  } catch (error: any) {
    console.error('Error starting match:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/matches/:id/pause
router.post('/:id/pause', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  try {
    LiveMatchService.pauseMatch(id);
    res.json({ success: true, message: 'Match paused' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/matches/:id/simulate
// Kept for backward compatibility if needed, but LiveMatchService handles simulation now in real-time
router.post('/:id/simulate', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  res.status(501).json({
    message: 'Instant simulation deprecated. Use start/pause for live simulation.',
    id
  });
});

export default router;