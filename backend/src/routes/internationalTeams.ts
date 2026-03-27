import express, { Request } from 'express';
import { t } from '../utils/i18n';

const router = express.Router();

// --- INTERNATIONAL TEAMS ---
// Note: NationalTeam, InternationalPlayer, InternationalBreaks, and InternationalCompetition
// models are not yet implemented in the Prisma schema. These endpoints return stub data.

// In-memory storage for international teams (stub implementation)
interface NationalTeam {
  id: number;
  name: string;
  code: string;
  region: string;
  ranking: number;
  reputation: number;
  players: { playerId: number; caps: number; goals: number }[];
}

const teamsStore: Map<number, NationalTeam> = new Map();
let nextTeamId = 1;

// GET /api/international-teams
router.get('/', async (_req: Request, res) => {
  const teams = Array.from(teamsStore.values());
  res.json({ teams, message: 'International teams feature coming soon - showing stub data' });
});

// GET /api/international-teams/:teamId
router.get('/:teamId', async (req: Request, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const team = teamsStore.get(teamId);

  if (!team) {
    res.status(404).json({ error: t('error.international_team_not_found', (req as any).language || 'en') });
    return;
  }

  res.json({ team });
});

// POST /api/international-teams
router.post('/', async (req: Request, res) => {
  const { name, code, region, ranking, reputation } = req.body;

  if (!name || !code) {
    res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    return;
  }

  const team: NationalTeam = {
    id: nextTeamId++,
    name,
    code,
    region: region || 'Europe',
    reputation: reputation || 50,
    ranking: ranking || 100,
    players: []
  };

  teamsStore.set(team.id, team);
  res.status(201).json({ team });
});

// PUT /api/international-teams/:teamId
router.put('/:teamId', async (req: Request, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const team = teamsStore.get(teamId);

  if (!team) {
    res.status(404).json({ error: t('error.international_team_not_found', (req as any).language || 'en') });
    return;
  }

  Object.assign(team, req.body);
  res.json({ team });
});

// --- INTERNATIONAL PLAYERS ---

// GET /api/international-teams/:teamId/players
router.get('/:teamId/players', async (req: Request, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const team = teamsStore.get(teamId);

  res.json({
    players: team?.players || [],
    message: 'International players feature coming soon'
  });
});

// POST /api/international-teams/:teamId/player
router.post('/:teamId/player', async (req: Request, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const { playerId } = req.body;

  if (!playerId) {
    res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    return;
  }

  const team = teamsStore.get(teamId);
  if (!team) {
    res.status(404).json({ error: t('error.international_team_not_found', (req as any).language || 'en') });
    return;
  }

  const internationalPlayer = { playerId, caps: 0, goals: 0 };
  team.players.push(internationalPlayer);

  res.status(201).json({ player: internationalPlayer });
});

// --- INTERNATIONAL BREAKS ---

// GET /api/international-breaks
router.get('/breaks', async (_req: Request, res) => {
  res.json({ breaks: [], message: 'International breaks feature coming soon' });
});

// POST /api/international-breaks
router.post('/breaks', async (req: Request, res) => {
  const { startDate, endDate, competition, year } = req.body;

  if (!startDate || !endDate || !competition || !year) {
    res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    return;
  }

  res.status(201).json({
    break: { startDate, endDate, competition, year },
    message: 'International breaks feature coming soon - data not persisted'
  });
});

// --- INTERNATIONAL COMPETITIONS ---

// GET /api/international-competitions
router.get('/competitions', async (_req: Request, res) => {
  res.json({ competitions: [], message: 'International competitions feature coming soon' });
});

// POST /api/international-competitions
router.post('/competitions', async (req: Request, res) => {
  const { name, type, startDate, endDate } = req.body;

  if (!name || !type || !startDate || !endDate) {
    res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    return;
  }

  res.status(201).json({
    competition: { name, type, startDate, endDate, status: 'UPCOMING' },
    message: 'International competitions feature coming soon - data not persisted'
  });
});

export default router;