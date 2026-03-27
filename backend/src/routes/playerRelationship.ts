import express from 'express';

const router = express.Router();

router.get('/:playerId/relationships', async (_req, res) => {
  res.json({ message: 'Player Relationship route' });
});

export default router;