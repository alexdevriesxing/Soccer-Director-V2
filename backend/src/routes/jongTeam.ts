import express, { Request, Response } from 'express';

const router = express.Router();

// GET /api/jong-teams
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Jong Team routes - coming soon', data: [] });
});

// GET /api/jong-teams/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  res.json({ message: 'Jong Team details - coming soon', id });
});

// GET /api/jong-teams/:id/players
router.get('/:id/players', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  res.json({ message: 'Jong Team players - coming soon', id, players: [] });
});

export default router;