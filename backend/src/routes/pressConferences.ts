import express, { Request } from 'express';
import { t } from '../utils/i18n';

const router = express.Router();

// --- PRESS CONFERENCES ---
// Note: PressConferences model is not yet implemented in the Prisma schema.
// Using in-memory storage as a stub implementation.

interface PressConference {
  id: number;
  clubId: number;
  managerId?: number;
  topic: string;
  mood: string;
  mediaReaction: string;
  fanReaction: string;
  date: Date;
}

const conferencesStore: Map<number, PressConference[]> = new Map();
let nextConfId = 1;

// GET /api/press-conferences/history/:clubId
router.get('/history/:clubId', async (req, res) => {
  try {
    // const _clubId = parseInt(req.params.clubId);
    // Stub implementation
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_press_conferences', (req as any).language || 'en') });
  }
});

// GET /api/press-conferences/:clubId
router.get('/:clubId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const conferences = conferencesStore.get(clubId) || [];
    res.json({ conferences, message: 'Press conferences feature coming soon' });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_press_conferences', (req as any).language || 'en') });
  }
});

// GET /api/press-conferences/:clubId/:conferenceId
router.get('/:clubId/:conferenceId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const conferenceId = parseInt(req.params.conferenceId, 10);
    const conferences = conferencesStore.get(clubId) || [];
    const conference = conferences.find(c => c.id === conferenceId);

    if (!conference) {
      res.status(404).json({ error: t('error.press_conference_not_found', (req as any).language || 'en') });
      return;
    }

    res.json({ conference });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_press_conference', (req as any).language || 'en') });
  }
});

// POST /api/press-conferences/:clubId
router.post('/:clubId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { managerId, topic, mood, mediaReaction, fanReaction } = req.body;

    if (!topic || !mood) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }

    const conference: PressConference = {
      id: nextConfId++,
      clubId,
      managerId: managerId || undefined,
      topic,
      mood,
      mediaReaction: mediaReaction || 'Neutral',
      fanReaction: fanReaction || 'Neutral',
      date: new Date()
    };

    let clubConfs = conferencesStore.get(clubId);
    if (!clubConfs) {
      clubConfs = [];
      conferencesStore.set(clubId, clubConfs);
    }
    clubConfs.push(conference);

    res.status(201).json({ conference });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_press_conference', (req as any).language || 'en') });
  }
});

// PUT /api/press-conferences/:conferenceId
router.put('/:conferenceId', async (req: Request, res) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId, 10);

    for (const [_clubId, conferences] of conferencesStore) {
      const conference = conferences.find(c => c.id === conferenceId);
      if (conference) {
        Object.assign(conference, req.body);
        res.json({ conference });
        return;
      }
    }

    res.status(404).json({ error: t('error.press_conference_not_found', (req as any).language || 'en') });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_press_conference', (req as any).language || 'en') });
  }
});

// DELETE /api/press-conferences/:conferenceId
router.delete('/:conferenceId', async (req: Request, res) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId, 10);

    for (const [_clubId, conferences] of conferencesStore) {
      const index = conferences.findIndex(c => c.id === conferenceId);
      if (index !== -1) {
        conferences.splice(index, 1);
        res.status(204).send();
        return;
      }
    }

    res.status(404).json({ error: t('error.press_conference_not_found', (req as any).language || 'en') });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_press_conference', (req as any).language || 'en') });
  }
});

// GET /api/press-conferences/:clubId/analytics
router.get('/:clubId/analytics', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const conferences = conferencesStore.get(clubId) || [];

    const analytics = {
      totalConferences: conferences.length,
      averageMood: conferences.length > 0
        ? conferences.filter(c => c.mood === 'Confident').length / conferences.length
        : 0,
      mediaReactionDistribution: conferences.reduce<Record<string, number>>((acc, c) => {
        acc[c.mediaReaction] = (acc[c.mediaReaction] || 0) + 1;
        return acc;
      }, {}),
      fanReactionDistribution: conferences.reduce<Record<string, number>>((acc, c) => {
        acc[c.fanReaction] = (acc[c.fanReaction] || 0) + 1;
        return acc;
      }, {}),
      topicDistribution: conferences.reduce<Record<string, number>>((acc, c) => {
        acc[c.topic] = (acc[c.topic] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_press_conference_analytics', (req as any).language || 'en') });
  }
});

export default router;