import express from 'express';
import { createRelationship, updateRelationship, getRelationshipsForPlayer } from '../services/playerRelationshipService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/player-relationship
router.post('/', async (req, res) => {
  try {
    const { playerAId, playerBId, type, strength } = req.body;
    const relationship = await createRelationship(playerAId, playerBId, type, strength);
    res.json(relationship);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_relationship', (req as any).language || 'en') });
  }
});

// PATCH /api/player-relationship/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { type, strength } = req.body;
    const relationship = await updateRelationship(id, { type, strength });
    res.json(relationship);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_relationship', (req as any).language || 'en') });
  }
});

// GET /api/player-relationship/:playerId
router.get('/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const relationships = await getRelationshipsForPlayer(playerId);
    res.json(relationships);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_relationships', (req as any).language || 'en') });
  }
});

export default router; 