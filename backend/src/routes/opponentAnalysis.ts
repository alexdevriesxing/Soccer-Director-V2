import express from 'express';

const router = express.Router();

router.get('/:matchId/analysis', async (_req, res) => {
  res.json({ message: 'Opponent Analysis route' });
});

export default router;