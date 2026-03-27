import express from 'express';

const router = express.Router();

router.get('/:playerId/events', async (_req, res) => {
  res.json({ message: 'Player Media Event route' });
});

export default router;