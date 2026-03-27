import express, { Request, Response } from 'express';
import { generateOffFieldEvent, getEventsForClub, interveneInEvent } from '../services/youthEventService';

const router = express.Router();

router.get('/:clubId', async (req: Request, res: Response) => {
  try {
    const clubId = parseInt(req.params.clubId);
    const events = await getEventsForClub(clubId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch youth events' });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { clubId } = req.body;
    await generateOffFieldEvent(clubId);
    res.json({ message: 'Event generated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate event' });
  }
});

router.post('/intervene', async (req: Request, res: Response) => {
  try {
    const { eventId, decision } = req.body;
    const result = await interveneInEvent(eventId, decision);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to intervene in event' });
  }
});

export default router;