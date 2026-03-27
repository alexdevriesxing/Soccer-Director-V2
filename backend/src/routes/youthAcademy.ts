import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory stubs for models that don't exist in Prisma schema
interface YouthScout { id: number; clubId: number; name: string; region: string; ability: number; network: number; }
interface ScoutingReport { id: number; scoutId: number; playerName: string; date: Date; rating: number; }

const youthScouts: Map<number, YouthScout> = new Map();
const scoutingReports: Map<number, ScoutingReport> = new Map();
let nextScoutId = 1;
// const _nextReportId = 1;

// --- YOUTH SCOUTS ---
// GET /api/youth-scouts
router.get('/youth-scouts', async (req, res) => {
  try {
    const scouts = Array.from(youthScouts.values());
    res.json({ scouts });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_youth_scouts', (req as any).language || 'en') });
  }
});

// POST /api/youth-scout
router.post('/youth-scout', async (req, res) => {
  try {
    const { clubId, name, region, ability, network } = req.body;
    if (!clubId || !name || !region || ability == null || network == null) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }
    const scout: YouthScout = { id: nextScoutId++, clubId, name, region, ability, network };
    youthScouts.set(scout.id, scout);
    res.status(201).json({ scout });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_add_youth_scout', (req as any).language || 'en') });
  }
});

// PATCH /api/youth-scout/:id
router.patch('/youth-scout/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = youthScouts.get(id);
    if (!existing) {
      res.status(404).json({ error: 'Scout not found' });
      return;
    }
    const { name, region, ability, network } = req.body;
    const updated = { ...existing, name: name || existing.name, region: region || existing.region, ability: ability ?? existing.ability, network: network ?? existing.network };
    youthScouts.set(id, updated);
    res.json({ scout: updated });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_youth_scout', (req as any).language || 'en') });
  }
});

// DELETE /api/youth-scout/:id
router.delete('/youth-scout/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    youthScouts.delete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_youth_scout', (req as any).language || 'en') });
  }
});

// --- SCOUTING REPORTS ---
// POST /api/youth-scout/:id/assignment
router.post('/youth-scout/:id/assignment', async (req, res) => {
  try {
    const scoutId = parseInt(req.params.id, 10);
    const { region, ageGroup, position } = req.body;
    if (!region || !ageGroup || !position) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }
    // Return stub assignment
    res.status(201).json({ assignment: { scoutId, region, ageGroup, position, message: 'Assignment created (stub)' } });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_assignment', (req as any).language || 'en') });
  }
});

// GET /api/youth-scout/:id/reports
router.get('/youth-scout/:id/reports', async (req, res) => {
  try {
    const scoutId = parseInt(req.params.id, 10);
    const reports = Array.from(scoutingReports.values()).filter(r => r.scoutId === scoutId);
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_reports', (req as any).language || 'en') });
  }
});

// --- YOUTH PROMOTIONS ---
// POST /api/youth/promote
router.post('/youth/promote', async (req, res) => {
  try {
    const { playerIds, toClubId } = req.body;
    if (!Array.isArray(playerIds) || !toClubId) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }
    // Use currentClubId instead of clubId
    await prisma.player.updateMany({
      where: { id: { in: playerIds } },
      data: { currentClubId: toClubId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_promote_youth', (req as any).language || 'en') });
  }
});

// --- YOUTH TOURNAMENTS ---
// GET /api/youth-tournaments
router.get('/youth-tournaments', async (_req, res) => {
  try {
    res.json({ tournaments: [], message: 'Youth tournaments feature coming soon' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// POST /api/youth-tournament/join
router.post('/youth-tournament/join', async (req, res) => {
  try {
    const { tournamentId, clubId } = req.body;
    if (!tournamentId || !clubId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    res.json({ success: true, message: 'Joined tournament (stub)' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// GET /api/youth-tournament/:id/results
router.get('/youth-tournament/:id/results', async (_req, res) => {
  try {
    res.json({ results: [], message: 'Results endpoint (stub)' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournament results' });
  }
});

export default router;