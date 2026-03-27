import express from 'express';

const router = express.Router();

router.get('/:clubId/scouting', async (_req, res) => {
  res.json({ message: 'Youth Scouting route' });
});

export default router;