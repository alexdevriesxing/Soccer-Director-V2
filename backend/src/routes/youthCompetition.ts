import express from 'express';
import { listCompetitions, enterCompetition, getCompetitionResults } from '../services/youthCompetitionService';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/youth-competition/list/:clubId
router.get('/list/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const competitions = await listCompetitions(clubId);
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_list_competitions', (req as any).language || 'en') });
  }
});

// POST /api/youth-competition/enter
router.post('/enter', async (req, res) => {
  try {
    const { clubId, competitionId } = req.body;
    const result = await enterCompetition(clubId, competitionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_enter_competition', (req as any).language || 'en') });
  }
});

// GET /api/youth-competition/results/:competitionId
router.get('/results/:competitionId', async (req, res) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const results = await getCompetitionResults(competitionId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_competition_results', (req as any).language || 'en') });
  }
});

export default router; 