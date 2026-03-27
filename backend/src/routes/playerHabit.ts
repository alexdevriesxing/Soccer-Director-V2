import express from 'express';

const router = express.Router();

router.get('/:playerId/habits', async (_req, res) => {
  res.json({ message: 'Player Habit route' });
});

export default router;