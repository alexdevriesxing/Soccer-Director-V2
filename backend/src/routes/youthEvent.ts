import express from 'express';
import { generateOffFieldEvent, getEventsForClub, interveneInEvent } from '../services/youthEventService';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/youth-event/list/:clubId
router.get('/list/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const events = await getEventsForClub(clubId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_youth_events', (req as any).language || 'en') });
  }
});

// POST /api/youth-event/intervene
router.post('/intervene', async (req, res) => {
  try {
    const { eventId, action } = req.body;
    const result = await interveneInEvent(eventId, action);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_intervene_in_event', (req as any).language || 'en') });
  }
});

export default router; 