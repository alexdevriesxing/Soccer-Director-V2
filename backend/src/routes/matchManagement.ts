import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// --- SUBSTITUTIONS ---
// POST /api/fixtures/:id/substitute
router.post('/fixtures/:id/substitute', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { outPlayerId, inPlayerId, minute } = req.body;
    if (!outPlayerId || !inPlayerId || minute == null) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const event = await prisma.matchEvent.create({ data: { fixtureId, type: 'substitution', minute, description: `Substitution: ${outPlayerId} out, ${inPlayerId} in`, playerName: null } });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_substitute', (req as any).language || 'en') });
  }
});

// GET /api/fixtures/:id/substitutions
router.get('/fixtures/:id/substitutions', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const subs = await prisma.matchEvent.findMany({ where: { fixtureId, type: 'substitution' }, orderBy: { minute: 'asc' } });
    res.json({ substitutions: subs });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_substitutions', (req as any).language || 'en') });
  }
});

// --- TACTICAL TWEAKS ---
// PATCH /api/fixtures/:id/tactics
router.patch('/fixtures/:id/tactics', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { clubId, formation, style, intensity, width, tempo, strategy } = req.body;
    if (!clubId || (!formation && !strategy)) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    let updatedFormation = null;
    let updatedStrategy = null;
    if (formation) {
      const existing = await prisma.clubFormation.findFirst({ where: { clubId } });
      if (existing) {
        updatedFormation = await prisma.clubFormation.update({ where: { id: existing.id }, data: { formation, style, intensity, width, tempo } });
      } else {
        if (!style || intensity == null || width == null || tempo == null) {
          return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
        }
        updatedFormation = await prisma.clubFormation.create({ data: { clubId, formation, style, intensity, width, tempo } });
      }
    }
    if (strategy) {
      const existing = await prisma.clubStrategy.findFirst({ where: { clubId } });
      if (existing) {
        updatedStrategy = await prisma.clubStrategy.update({ where: { id: existing.id }, data: { ...strategy } });
      } else {
        updatedStrategy = await prisma.clubStrategy.create({ data: { clubId, ...strategy } });
      }
    }
    // Optionally log a match event
    await prisma.matchEvent.create({ data: { fixtureId, type: 'tactical', minute: req.body.minute || 0, description: 'Tactical tweak', playerName: null } });
    res.json({ formation: updatedFormation, strategy: updatedStrategy });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_tactics', (req as any).language || 'en') });
  }
});

// --- SHOUTS / MANAGER INTERVENTIONS ---
// POST /api/fixtures/:id/shout
router.post('/fixtures/:id/shout', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { message, minute } = req.body;
    if (!message || minute == null) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const event = await prisma.matchEvent.create({ data: { fixtureId, type: 'shout', minute, description: message, playerName: null } });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_send_shout', (req as any).language || 'en') });
  }
});

// --- MATCH EVENTS ---
// GET /api/fixtures/:id/events
router.get('/fixtures/:id/events', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const events = await prisma.matchEvent.findMany({ where: { fixtureId }, orderBy: { minute: 'asc' } });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_events', (req as any).language || 'en') });
  }
});

// POST /api/fixtures/:id/event
router.post('/fixtures/:id/event', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { type, minute, description, playerName } = req.body;
    if (!type || minute == null || !description) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const event = await prisma.matchEvent.create({ data: { fixtureId, type, minute, description, playerName } });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_event', (req as any).language || 'en') });
  }
});

// --- VAR DECISIONS ---
// GET /api/fixtures/:id/var-decisions
router.get('/fixtures/:id/var-decisions', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const decisions = await prisma.vARDecisions.findMany({ where: { fixtureId }, orderBy: { minute: 'asc' } });
    res.json({ decisions });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_var_decisions', (req as any).language || 'en') });
  }
});

// POST /api/fixtures/:id/var-decision
router.post('/fixtures/:id/var-decision', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { minute, decision, overturned, controversy, description } = req.body;
    if (!minute || !decision) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const varDecision = await prisma.vARDecisions.create({ data: { fixtureId, minute, decision, overturned: !!overturned, controversy: controversy || 0, description } });
    res.status(201).json({ varDecision });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_var_decision', (req as any).language || 'en') });
  }
});

// --- WEATHER ---
// GET /api/fixtures/:id/weather
router.get('/fixtures/:id/weather', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const weather = await prisma.weather.findUnique({ where: { fixtureId } });
    res.json({ weather });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_weather', (req as any).language || 'en') });
  }
});

// POST /api/fixtures/:id/weather
router.post('/fixtures/:id/weather', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { temperature, humidity, windSpeed, windDirection, precipitation, visibility } = req.body;
    if (temperature == null || humidity == null || windSpeed == null || !windDirection || precipitation == null || visibility == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    let weather = await prisma.weather.findUnique({ where: { fixtureId } });
    if (weather) {
      weather = await prisma.weather.update({ where: { fixtureId }, data: { temperature, humidity, windSpeed, windDirection, precipitation, visibility } });
    } else {
      weather = await prisma.weather.create({ data: { fixtureId, temperature, humidity, windSpeed, windDirection, precipitation, visibility } });
    }
    res.status(201).json({ weather });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_set_weather', (req as any).language || 'en') });
  }
});

// --- REFEREE DECISIONS ---
// GET /api/fixtures/:id/referee-decisions
router.get('/fixtures/:id/referee-decisions', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const events = await prisma.matchEvent.findMany({ where: { fixtureId, type: { in: ['yellow_card', 'red_card', 'penalty'] } }, orderBy: { minute: 'asc' } });
    res.json({ refereeDecisions: events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_referee_decisions', (req as any).language || 'en') });
  }
});

// POST /api/fixtures/:id/referee-decision
router.post('/fixtures/:id/referee-decision', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { type, minute, description, playerName, clubId } = req.body;
    if (!type || minute == null) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const event = await prisma.matchEvent.create({ data: { fixtureId, type, minute, description, playerName, clubId } });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_referee_decision', (req as any).language || 'en') });
  }
});

// --- POST-MATCH ANALYSIS ---
// GET /api/fixtures/:id/post-match-analysis
router.get('/fixtures/:id/post-match-analysis', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) return res.status(404).json({ error: t('error.fixture_not_found', (req as any).language || 'en') });
    // xG (stub)
    const xG = { home: Math.random() * 3, away: Math.random() * 3 };
    // Heatmaps (stub)
    const heatmaps = { home: [], away: [] };
    // Player ratings (simple: goals + assists - cards)
    const events = await prisma.matchEvent.findMany({ where: { fixtureId } });
    const playerStats: Record<string, { goals: number; assists: number; yellow: number; red: number }> = {};
    events.forEach(ev => {
      if (!ev.playerName) return;
      if (!playerStats[ev.playerName]) playerStats[ev.playerName] = { goals: 0, assists: 0, yellow: 0, red: 0 };
      if (ev.type === 'GOAL') playerStats[ev.playerName].goals++;
      if (ev.type === 'ASSIST') playerStats[ev.playerName].assists++;
      if (ev.type === 'yellow_card') playerStats[ev.playerName].yellow++;
      if (ev.type === 'red_card') playerStats[ev.playerName].red++;
    });
    const playerRatings = Object.entries(playerStats).map(([playerName, stats]) => ({
      playerName,
      rating: 6 + stats.goals * 1.5 + stats.assists - stats.yellow * 0.5 - stats.red * 1.5
    }));
    // Summary stats
    const summary = {
      homeGoals: fixture.homeGoals,
      awayGoals: fixture.awayGoals,
      attendance: fixture.attendance
    };
    res.json({ xG, heatmaps, playerRatings, summary });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_post_match_analysis', (req as any).language || 'en') });
  }
});

export default router; 