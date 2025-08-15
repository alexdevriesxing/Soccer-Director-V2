import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// --- YOUTH SCOUTS ---
// GET /api/youth-scouts
router.get('/youth-scouts', async (req, res) => {
  try {
    const scouts = await prisma.youthScout.findMany();
    res.json({ scouts });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_youth_scouts', (req as any).language || 'en') });
  }
});

// POST /api/youth-scout
router.post('/youth-scout', async (req, res) => {
  try {
    const { clubId, name, region, ability, network } = req.body;
    if (!clubId || !name || !region || ability == null || network == null) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const scout = await prisma.youthScout.create({ data: { clubId, name, region, ability, network } });
    res.status(201).json({ scout });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_add_youth_scout', (req as any).language || 'en') });
  }
});

// PATCH /api/youth-scout/:id
router.patch('/youth-scout/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, region, ability, network } = req.body;
    const scout = await prisma.youthScout.update({ where: { id }, data: { name, region, ability, network } });
    res.json({ scout });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_youth_scout', (req as any).language || 'en') });
  }
});

// DELETE /api/youth-scout/:id
router.delete('/youth-scout/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.youthScout.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_youth_scout', (req as any).language || 'en') });
  }
});

// --- SCOUTING ASSIGNMENTS & REPORTS ---
// POST /api/youth-scout/:id/assignment
router.post('/youth-scout/:id/assignment', async (req, res) => {
  try {
    const scoutId = parseInt(req.params.id, 10);
    const { region, ageGroup, position } = req.body;
    if (!region || !ageGroup || !position) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const assignment = await prisma.scoutSpecializations.create({ data: { scoutId, region, ageGroup, position, skill: 50 } });
    res.status(201).json({ assignment });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_assignment', (req as any).language || 'en') });
  }
});

// GET /api/youth-scout/:id/reports
router.get('/youth-scout/:id/reports', async (req, res) => {
  try {
    const scoutId = parseInt(req.params.id, 10);
    const reports = await prisma.scoutingReports.findMany({ where: { scoutId }, orderBy: { date: 'desc' } });
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
    if (!Array.isArray(playerIds) || !toClubId) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    await prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: toClubId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_promote_youth', (req as any).language || 'en') });
  }
});

// --- YOUTH TOURNAMENTS ---
// GET /api/youth-tournaments
router.get('/youth-tournaments', async (req, res) => {
  try {
    const tournaments = await prisma.youthTournaments.findMany({ orderBy: { year: 'desc' } });
    res.json({ tournaments });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_tournaments', (req as any).language || 'en') });
  }
});

// POST /api/youth-tournament/join
router.post('/youth-tournament/join', async (req, res) => {
  try {
    const { tournamentId, clubId } = req.body;
    if (!tournamentId || !clubId) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    // This assumes a relation table for participants, which may need to be added to the schema
    // For now, just return success
    res.json({ success: true, message: 'Joined tournament (stub)' });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_join_tournament', (req as any).language || 'en') });
  }
});

// GET /api/youth-tournament/:id/results
router.get('/youth-tournament/:id/results', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    // This assumes a results table or logic, which may need to be added
    res.json({ results: [], message: 'Results endpoint (stub)' });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_tournament_results', (req as any).language || 'en') });
  }
});

export default router; 