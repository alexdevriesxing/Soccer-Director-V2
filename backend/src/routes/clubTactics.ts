import express from 'express';

import { t } from '../utils/i18n';
import { ClubTacticsService, NotFoundError, ValidationError, DuplicateError } from './clubTacticsService';

const router = express.Router();
// const prisma = new PrismaClient();

// --- CLUB TACTICS & FORMATIONS ---
// GET /:id/tactics
router.get('/:id/tactics', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const result = await ClubTacticsService.getTactics(clubId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_fetch_tactics', (req as any).language || 'en') });
  }
});

// PATCH /:id/tactics
router.patch('/:id/tactics', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const result = await ClubTacticsService.updateTactics(clubId, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || t('error.failed_to_update_tactics', (req as any).language || 'en') });
  }
});

// --- SET PIECE SPECIALISTS ---
// GET /:id/set-piece-specialists
router.get('/:id/set-piece-specialists', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const specialists = await ClubTacticsService.getSetPieceSpecialists(clubId);
    return res.json({ specialists });
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_fetch_set_piece_specialists', (req as any).language || 'en') });
  }
});
// ... (I will rely on TS compiler to catch remaining missing returns)

// POST /:id/set-piece-specialist
router.post('/:id/set-piece-specialist', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const { playerId, type, skill, successRate, attempts, goals } = req.body;
    if (!playerId || !type || skill == null) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    try {
      const specialist = await ClubTacticsService.addSetPieceSpecialist(clubId, { playerId, type, skill, successRate, attempts, goals });
      return res.status(201).json({ specialist });
    } catch (err: any) {
      if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
      if (err instanceof DuplicateError) return res.status(409).json({ error: err.message });
      if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_add_set_piece_specialist', (req as any).language || 'en') });
  }
});

// PATCH /api/set-piece-specialist/:id
router.patch('/set-piece-specialist/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { skill } = req.body;
    if (skill == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    try {
      const specialist = await ClubTacticsService.updateSetPieceSpecialist(id, { skill });
      return res.json({ specialist });
    } catch (err: any) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_update_set_piece_specialist', (req as any).language || 'en') });
  }
});

// DELETE /api/set-piece-specialist/:id
router.delete('/set-piece-specialist/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    try {
      await ClubTacticsService.deleteSetPieceSpecialist(id);
      return res.json({ success: true });
    } catch (err: any) {
      if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
      if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_update_set_piece_specialist', (req as any).language || 'en') });
  }
});

export default router;