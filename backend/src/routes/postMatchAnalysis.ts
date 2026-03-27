import express, { Request, Response } from 'express';

const router = express.Router();

// GET /api/post-match-analysis/:fixtureId
router.get('/:fixtureId', async (req: Request, res: Response): Promise<void> => {
  const fixtureId = parseInt(req.params.fixtureId, 10);
  res.json({
    message: 'Post-match analysis - coming soon',
    fixtureId,
    analysis: {
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 }
    }
  });
});

// GET /api/post-match-analysis/:fixtureId/player-ratings
router.get('/:fixtureId/player-ratings', async (req: Request, res: Response): Promise<void> => {
  const fixtureId = parseInt(req.params.fixtureId, 10);
  res.json({
    message: 'Player ratings - coming soon',
    fixtureId,
    ratings: []
  });
});

export default router;