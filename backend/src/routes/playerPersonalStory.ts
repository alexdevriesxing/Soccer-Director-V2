import express from 'express';

const router = express.Router();

router.get('/:playerId/stories', async (_req, res) => {
  res.json({ message: 'Player Personal Story route' });
});

export default router;