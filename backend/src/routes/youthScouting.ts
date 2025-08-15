import express from 'express';
import { assignScout, getScouts, generateScoutingReport } from '../services/youthScoutingService';
import { t } from '../utils/i18n';

const router = express.Router();

// POST /api/youth-scouting/assign
router.post('/assign', async (req, res) => {
  try {
    const { clubId, name, region, ability, network } = req.body;
    const scout = await assignScout(clubId, name, region, ability, network);
    res.json(scout);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_assign_scout', (req as any).language || 'en') });
  }
});

// GET /api/youth-scouting/scouts/:clubId
router.get('/scouts/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const scouts = await getScouts(clubId);
    res.json(scouts);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_scouts', (req as any).language || 'en') });
  }
});

// GET /api/youth-scouting/reports/:clubId
router.get('/reports/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const reports = await generateScoutingReport(clubId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_scouting_reports', (req as any).language || 'en') });
  }
});

export default router; 