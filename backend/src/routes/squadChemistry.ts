import express from 'express';
import { SquadChemistryService } from '../services/squadChemistryService';

const router = express.Router();

// GET /api/squad-chemistry/:clubId
router.get('/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const chemistry = await SquadChemistryService.getSquadChemistry(clubId);
    res.json({ chemistry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch squad chemistry' });
  }
});

// POST /api/squad-chemistry/:clubId
router.post('/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { score, notes } = req.body;
    const chemistry = await SquadChemistryService.setSquadChemistry(clubId, score, notes);
    res.json({ chemistry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set squad chemistry' });
  }
});

// POST /api/squad-chemistry/:clubId/calculate
router.post('/:clubId/calculate', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { context } = req.body;
    const score = await SquadChemistryService.calculateSquadChemistry(clubId, context);
    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate squad chemistry' });
  }
});

export default router; 