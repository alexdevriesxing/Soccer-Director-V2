import express, { Request, Response } from 'express';
import youthAcademyService from '../services/youthAcademyService';

const router = express.Router();

// GET /api/youth/:clubId
router.get('/:clubId', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const info = await youthAcademyService.getAcademyInfo(clubId);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch youth academy info' });
  }
});

// GET /api/youth/:clubId/prospects
router.get('/:clubId/prospects', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const prospects = await youthAcademyService.getYouthProspects(clubId);
    res.json(prospects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prospects' });
  }
});

// POST /api/youth/:clubId/intake
router.post('/:clubId/intake', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    if (isNaN(clubId)) {
      res.status(400).json({ error: 'Invalid club ID' });
      return;
    }
    const result = await youthAcademyService.generateYouthIntake(clubId);
    res.json(result);
  } catch (error) {
    console.error('Youth intake error:', error);
    res.status(500).json({ error: 'Failed to generate youth intake' });
  }
});

export default router;