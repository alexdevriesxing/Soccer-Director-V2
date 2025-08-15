import express from 'express';
import { assignTrait, revealTrait, getTraitsForPlayer } from '../services/playerTraitService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/player-trait
router.post('/', async (req, res) => {
  try {
    const { playerId, trait } = req.body;
    const result = await assignTrait(playerId, trait);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_assign_trait', (req as any).language || 'en') });
  }
});

// PATCH /api/player-trait/:id/reveal
router.patch('/:id/reveal', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await revealTrait(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_reveal_trait', (req as any).language || 'en') });
  }
});

// GET /api/player-trait/:playerId
router.get('/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const traits = await getTraitsForPlayer(playerId);
    res.json(traits);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_traits', (req as any).language || 'en') });
  }
});

export default router; 