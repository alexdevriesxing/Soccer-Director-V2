import express from 'express';
import { createMediaEvent, updateMediaEvent, getMediaEventsForPlayer } from '../services/playerMediaEventService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/player-media-event
router.post('/', async (req, res) => {
  try {
    const { playerId, type, headline, content } = req.body;
    const result = await createMediaEvent(playerId, type, headline, content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_media_event', (req as any).language || 'en') });
  }
});

// PATCH /api/player-media-event/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { headline, content } = req.body;
    const result = await updateMediaEvent(id, { headline, content });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_media_event', (req as any).language || 'en') });
  }
});

// GET /api/player-media-event/:playerId
router.get('/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const events = await getMediaEventsForPlayer(playerId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_media_events', (req as any).language || 'en') });
  }
});

export default router; 