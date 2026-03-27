import express from 'express';

const router = express.Router();

router.get('/:playerId/history', async (_req, res) => {
  res.json({ message: 'Player Injury route' });
});

export default router;