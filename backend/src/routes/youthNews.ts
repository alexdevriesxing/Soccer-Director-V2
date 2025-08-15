import express from 'express';
import { createNews, getNewsForPlayer, getNewsForClub, searchNews } from '../services/youthNewsService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/youth-news
router.post('/', async (req, res) => {
  try {
    const { playerId, clubId, type, headline, content } = req.body;
    const news = await createNews({ playerId, clubId, type, headline, content });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_news', (req as any).language || 'en') });
  }
});

// GET /api/youth-news/player/:playerId
router.get('/player/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const news = await getNewsForPlayer(playerId);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_player_news', (req as any).language || 'en') });
  }
});

// GET /api/youth-news/club/:clubId
router.get('/club/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const news = await getNewsForClub(clubId);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_club_news', (req as any).language || 'en') });
  }
});

// GET /api/youth-news/search
router.get('/search', async (req, res) => {
  try {
    const { type, keyword } = req.query;
    const news = await searchNews({ type: type as string, keyword: keyword as string });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_search_news', (req as any).language || 'en') });
  }
});

export default router; 