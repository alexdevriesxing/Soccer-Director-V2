import express from 'express';
import { ClubService } from '../services/clubService';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/club/:clubId/academy-reputation
router.get('/:clubId/academy-reputation', async (req: express.Request, res: express.Response) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const reputation = await ClubService.getAcademyReputation(clubId);
    res.json({ reputation });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_academy_reputation', (req as any).language || 'en') });
  }
});

// POST /api/club/:clubId/academy-reputation
router.post('/:clubId/academy-reputation', async (req: express.Request, res: express.Response) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { change } = req.body;
    const reputation = await ClubService.updateAcademyReputation(clubId, change);
    res.json({ reputation });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_academy_reputation', (req as any).language || 'en') });
  }
});

export default router; 