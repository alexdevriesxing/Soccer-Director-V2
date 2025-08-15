import express from 'express';
import { logInjury, updateInjury, getInjuriesForPlayer } from '../services/playerInjuryService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/player-injury
router.post('/', async (req, res) => {
  try {
    const { playerId, type, severity, startDate, endDate, description } = req.body;
    const result = await logInjury(playerId, type, severity, new Date(startDate), endDate ? new Date(endDate) : undefined, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_log_injury', (req as any).language || 'en') });
  }
});

// PATCH /api/player-injury/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { endDate, description } = req.body;
    const result = await updateInjury(id, { endDate: endDate ? new Date(endDate) : undefined, description });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_injury', (req as any).language || 'en') });
  }
});

// GET /api/player-injury/:playerId
router.get('/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const injuries = await getInjuriesForPlayer(playerId);
    res.json(injuries);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_injuries', (req as any).language || 'en') });
  }
});

export default router; 