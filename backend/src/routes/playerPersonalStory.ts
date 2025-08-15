import express from 'express';
import { createPersonalStory, updatePersonalStory, getPersonalStoriesForPlayer } from '../services/playerPersonalStoryService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/player-personal-story
router.post('/', async (req, res) => {
  try {
    const { playerId, type, description, startDate, endDate } = req.body;
    const result = await createPersonalStory(playerId, type, description, new Date(startDate), endDate ? new Date(endDate) : undefined);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_personal_story', (req as any).language || 'en') });
  }
});

// PATCH /api/player-personal-story/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { endDate, description } = req.body;
    const result = await updatePersonalStory(id, { endDate: endDate ? new Date(endDate) : undefined, description });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_personal_story', (req as any).language || 'en') });
  }
});

// GET /api/player-personal-story/:playerId
router.get('/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const stories = await getPersonalStoriesForPlayer(playerId);
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_personal_stories', (req as any).language || 'en') });
  }
});

export default router; 