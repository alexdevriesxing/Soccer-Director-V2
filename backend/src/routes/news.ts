import express from 'express';

const router = express.Router();

router.get('/:clubId/news', async (_req, res) => {
    res.json({ message: 'News route' });
});

export default router;
