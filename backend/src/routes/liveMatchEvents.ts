import express, { Request } from 'express';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --- LIVE MATCH EVENTS ---

// GET /api/live-match-events/:fixtureId
router.get('/:fixtureId', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const events = await prisma.liveMatchEvent.findMany({
      where: { fixtureId },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_match_events', (req as any).language || 'en') });
  }
});

// POST /api/live-match-events/:fixtureId
router.post('/:fixtureId', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const {
      type,
      minute,
      playerId,
      clubId,
      description,
      varReview,
      coordinates
    } = req.body;

    if (!type || minute == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const event = await prisma.liveMatchEvent.create({
      data: {
        fixtureId,
        type,
        minute,
        playerId,
        clubId,
        description,
        varReview: varReview ? JSON.stringify(varReview) : undefined,
        coordinates: coordinates ? JSON.stringify(coordinates) : undefined
      },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_match_event', (req as any).language || 'en') });
  }
});

// PATCH /api/live-match-events/:eventId
router.patch('/:eventId', async (req: Request, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const updateData = req.body;
    
    if (updateData.coordinates && typeof updateData.coordinates === 'object') {
      updateData.coordinates = JSON.stringify(updateData.coordinates);
    }

    const event = await prisma.liveMatchEvent.update({
      where: { id: eventId },
      data: updateData,
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });

    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_match_event', (req as any).language || 'en') });
  }
});

// DELETE /api/live-match-events/:eventId
router.delete('/:eventId', async (req: Request, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    await prisma.liveMatchEvent.delete({ where: { id: eventId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_match_event', (req as any).language || 'en') });
  }
});

// --- VAR REVIEWS ---

// GET /api/live-match-events/:fixtureId/var-reviews
router.get('/:fixtureId/var-reviews', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const varReviews = await prisma.liveMatchEvent.findMany({
      where: { 
        fixtureId,
      },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
    res.json({ varReviews });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_var_reviews', (req as any).language || 'en') });
  }
});

// POST /api/live-match-events/:fixtureId/var-review
router.post('/:fixtureId/var-review', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const {
      originalEventId,
      decision,
      reason,
      duration,
      refereeConsultation
    } = req.body;

    if (!originalEventId || !decision) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    // Create VAR review event
    const varEvent = await prisma.liveMatchEvent.create({
      data: {
        fixtureId,
        type: 'VAR_REVIEW',
        minute: 0, // Will be set based on original event
        description: `VAR Review: ${decision} - ${reason}`,
        varReview: {
          originalEventId,
          decision,
          reason,
          duration,
          refereeConsultation
        }
      },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ varEvent });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_var_review', (req as any).language || 'en') });
  }
});

// --- WEATHER EVENTS ---

// GET /api/live-match-events/:fixtureId/weather
router.get('/:fixtureId/weather', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const weatherEvents = await prisma.liveMatchEvent.findMany({
      where: { 
        fixtureId,
      },
      orderBy: { minute: 'asc' }
    });
    res.json({ weatherEvents });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_weather_events', (req as any).language || 'en') });
  }
});

// POST /api/live-match-events/:fixtureId/weather
router.post('/:fixtureId/weather', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const {
      condition,
      intensity,
      minute,
      description
    } = req.body;

    if (!condition || minute == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const weatherEvent = await prisma.liveMatchEvent.create({
      data: {
        fixtureId,
        type: 'WEATHER',
        minute,
        description,
      }
    });

    res.status(201).json({ weatherEvent });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_weather_event', (req as any).language || 'en') });
  }
});

// --- REFEREE DECISIONS ---

// GET /api/live-match-events/:fixtureId/referee-decisions
router.get('/:fixtureId/referee-decisions', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const refereeDecisions = await prisma.liveMatchEvent.findMany({
      where: { 
        fixtureId,
      },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
    res.json({ refereeDecisions });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_referee_decisions', (req as any).language || 'en') });
  }
});

// POST /api/live-match-events/:fixtureId/referee-decision
router.post('/:fixtureId/referee-decision', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const {
      decision,
      reason,
      minute,
      playerId,
      clubId,
      description
    } = req.body;

    if (!decision || minute == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const refereeEvent = await prisma.liveMatchEvent.create({
      data: {
        fixtureId,
        type: 'REFEREE_DECISION',
        minute,
        playerId,
        clubId,
        description,
      },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ refereeEvent });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_referee_decision', (req as any).language || 'en') });
  }
});

// --- MATCH STATISTICS ---

// GET /api/live-match-events/:fixtureId/statistics
router.get('/:fixtureId/statistics', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    
    // Get all events for the fixture
    const events = await prisma.liveMatchEvent.findMany({
      where: { fixtureId },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });

    // Calculate statistics
    const stats = {
      goals: events.filter((e: any) => e.type === 'GOAL').length,
      yellowCards: events.filter((e: any) => e.type === 'YELLOW_CARD').length,
      redCards: events.filter((e: any) => e.type === 'RED_CARD').length,
      varReviews: events.filter((e: any) => e.type === 'VAR_REVIEW').length,
      injuries: events.filter((e: any) => e.type === 'INJURY').length,
      substitutions: events.filter((e: any) => e.type === 'SUBSTITUTION').length,
      totalXG: events.reduce((sum: number, e: any) => sum + (e.xG || 0), 0),
      weatherEvents: events.filter((e: any) => e.type === 'WEATHER').length
    };

    res.json({ statistics: stats, events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_match_statistics', (req as any).language || 'en') });
  }
});

export default router; 