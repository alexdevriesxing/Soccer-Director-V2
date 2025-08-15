import express from 'express';
import { triggerIntakeEvent, getIntakeHistory } from '../services/youthIntakeService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/youth-intake/trigger
router.post('/trigger', async (req, res) => {
  try {
    const { clubId, type, year } = req.body;
    const event = await triggerIntakeEvent(clubId, type, year);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_trigger_intake_event', (req as any).language || 'en') });
  }
});

// GET /api/youth-intake/history/:clubId
router.get('/history/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const history = await getIntakeHistory(clubId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_intake_history', (req as any).language || 'en') });
  }
});

export default router; 