import express from 'express';
import { createHabit, updateHabit, getHabitsForPlayer } from '../services/playerHabitService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/player-habit
router.post('/', async (req, res) => {
  try {
    const { playerId, habit, value } = req.body;
    const result = await createHabit(playerId, habit, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_habit', (req as any).language || 'en') });
  }
});

// PATCH /api/player-habit/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { value, lastUpdated } = req.body;
    const result = await updateHabit(id, { value, lastUpdated: lastUpdated ? new Date(lastUpdated) : undefined });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_habit', (req as any).language || 'en') });
  }
});

// GET /api/player-habit/:playerId
router.get('/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const habits = await getHabitsForPlayer(playerId);
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_habits', (req as any).language || 'en') });
  }
});

export default router; 