import express, { Request } from 'express';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --- LIVE MATCH EVENTS ---
// Uses the MatchEvent model from Prisma schema

// GET /api/live-match-events/:fixtureId
router.get('/:fixtureId', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const events = await prisma.matchEvent.findMany({
      where: { fixtureId },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
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
      eventType,
      minute,
      playerId,
      clubId,
      description,
      isHomeTeam
    } = req.body;

    if (!eventType || minute == null || !clubId || isHomeTeam == null) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }

    const event = await prisma.matchEvent.create({
      data: {
        fixtureId,
        eventType,
        minute,
        playerId,
        clubId,
        description,
        isHomeTeam
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
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
    const { eventType, minute, playerId, description, isHomeTeam } = req.body;

    const event = await prisma.matchEvent.update({
      where: { id: eventId },
      data: {
        ...(eventType !== undefined && { eventType }),
        ...(minute !== undefined && { minute }),
        ...(playerId !== undefined && { playerId }),
        ...(description !== undefined && { description }),
        ...(isHomeTeam !== undefined && { isHomeTeam })
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
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
    await prisma.matchEvent.delete({ where: { id: eventId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_match_event', (req as any).language || 'en') });
  }
});

// --- VAR REVIEWS (stub - not part of current schema) ---

// GET /api/live-match-events/:fixtureId/var-reviews
router.get('/:fixtureId/var-reviews', async (_req: Request, res) => {
  // VAR reviews are not yet implemented in the schema
  res.json({ varReviews: [], message: 'VAR review feature coming soon' });
});

// POST /api/live-match-events/:fixtureId/var-review
router.post('/:fixtureId/var-review', async (_req: Request, res) => {
  res.status(501).json({ message: 'VAR review feature coming soon' });
});

// --- WEATHER EVENTS (stub - not part of current schema) ---

// GET /api/live-match-events/:fixtureId/weather
router.get('/:fixtureId/weather', async (_req: Request, res) => {
  res.json({ weatherEvents: [], message: 'Weather events feature coming soon' });
});

// POST /api/live-match-events/:fixtureId/weather
router.post('/:fixtureId/weather', async (_req: Request, res) => {
  res.status(501).json({ message: 'Weather events feature coming soon' });
});

// --- REFEREE DECISIONS ---

// GET /api/live-match-events/:fixtureId/referee-decisions
router.get('/:fixtureId/referee-decisions', async (req: Request, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const refereeDecisions = await prisma.matchEvent.findMany({
      where: {
        fixtureId,
        eventType: { in: ['YELLOW_CARD', 'RED_CARD', 'PENALTY', 'FREE_KICK'] }
      },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
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
      eventType,
      minute,
      playerId,
      clubId,
      description,
      isHomeTeam
    } = req.body;

    if (!eventType || minute == null || !clubId || isHomeTeam == null) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }

    const refereeEvent = await prisma.matchEvent.create({
      data: {
        fixtureId,
        eventType,
        minute,
        playerId,
        clubId,
        description,
        isHomeTeam
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
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
    const events = await prisma.matchEvent.findMany({
      where: { fixtureId },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });

    // Calculate statistics
    const stats = {
      goals: events.filter(e => e.eventType === 'GOAL').length,
      yellowCards: events.filter(e => e.eventType === 'YELLOW_CARD').length,
      redCards: events.filter(e => e.eventType === 'RED_CARD').length,
      substitutions: events.filter(e => e.eventType === 'SUBSTITUTION').length,
      totalEvents: events.length
    };

    res.json({ statistics: stats, events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_match_statistics', (req as any).language || 'en') });
  }
});

export default router;