import express from 'express';

const router = express.Router();

router.get('/:clubId/registration', async (_req, res) => {
  res.json({ message: 'Squad Registration route' });
});

export default router;