import express, { Request } from 'express';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --- PRESS CONFERENCES ---

// GET /api/press-conferences/:clubId
router.get('/:clubId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const conferences = await prisma.pressConferences.findMany({
      where: { clubId },
      include: {
        club: true,
        manager: true
      },
      orderBy: { date: 'desc' }
    });
    res.json({ conferences });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_press_conferences', (req as any).language || 'en') });
  }
});

// GET /api/press-conferences/:clubId/:conferenceId
router.get('/:clubId/:conferenceId', async (req: Request, res) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId, 10);
    const conference = await prisma.pressConferences.findUnique({
      where: { id: conferenceId },
      include: {
        club: true,
        manager: true
      }
    });
    
    if (!conference) {
      return res.status(404).json({ error: t('error.press_conference_not_found', (req as any).language || 'en') });
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
    const {
      managerId,
      topic,
      mood,
      mediaReaction,
      fanReaction
    } = req.body;

    if (!topic || !mood) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const conference = await prisma.pressConferences.create({
      data: {
        clubId,
        managerId: managerId || null,
        topic,
        mood,
        mediaReaction: mediaReaction || 'Neutral',
        fanReaction: fanReaction || 'Neutral'
      },
      include: {
        club: true,
        manager: true
      }
    });

    res.status(201).json({ conference });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_press_conference', (req as any).language || 'en') });
  }
});

// PUT /api/press-conferences/:conferenceId
router.put('/:conferenceId', async (req: Request, res) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId, 10);
    const updateData = req.body;
    
    const conference = await prisma.pressConferences.update({
      where: { id: conferenceId },
      data: updateData,
      include: {
        club: true,
        manager: true
      }
    });
    
    res.json({ conference });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_press_conference', (req as any).language || 'en') });
  }
});

// DELETE /api/press-conferences/:conferenceId
router.delete('/:conferenceId', async (req: Request, res) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId, 10);
    
    await prisma.pressConferences.delete({ where: { id: conferenceId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_press_conference', (req as any).language || 'en') });
  }
});

// --- PRESS CONFERENCE ANALYTICS ---

// GET /api/press-conferences/:clubId/analytics
router.get('/:clubId/analytics', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const conferences = await prisma.pressConferences.findMany({
      where: { clubId },
      include: {
        club: true,
        manager: true
      },
      orderBy: { date: 'desc' }
    });

    const analytics = {
      totalConferences: conferences.length,
      averageMood: conferences.reduce((sum, c) => sum + (c.mood === 'Confident' ? 1 : 0), 0) / conferences.length || 0,
      mediaReactionDistribution: conferences.reduce((acc, c) => {
        acc[c.mediaReaction] = (acc[c.mediaReaction] || 0) + 1;
        return acc;
      }, {} as any),
      fanReactionDistribution: conferences.reduce((acc, c) => {
        acc[c.fanReaction] = (acc[c.fanReaction] || 0) + 1;
        return acc;
      }, {} as any),
      topicDistribution: conferences.reduce((acc, c) => {
        acc[c.topic] = (acc[c.topic] || 0) + 1;
        return acc;
      }, {} as any)
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_press_conference_analytics', (req as any).language || 'en') });
  }
});

export default router; 