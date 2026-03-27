import express, { Request, Response } from 'express';
import advancedFinancialService from '../services/advancedFinancialService';

const router = express.Router();

// GET /api/advanced-finance/:clubId
router.get('/:clubId', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const overview = await advancedFinancialService.getFinancialOverview(clubId);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial overview' });
  }
});

// GET /api/advanced-finance/:clubId/projections
router.get('/:clubId/projections', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const projections = await advancedFinancialService.getProjections(clubId);
    res.json(projections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projections' });
  }
});

// POST /api/advanced-finance/:clubId/process-weekly
router.post('/:clubId/process-weekly', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const result = await advancedFinancialService.processWeeklyFinances(clubId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process weekly finances' });
  }
});

export default router;