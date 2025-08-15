import express, { Request } from 'express';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --- INTERNATIONAL TEAMS ---

// GET /api/international-teams
router.get('/', async (req: Request, res) => {
  try {
    const teams = await prisma.nationalTeam.findMany({
      include: {
        players: { include: { player: true } },
        managers: true
      },
      orderBy: { name: 'asc' }
    });
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_international_teams', (req as any).language || 'en') });
  }
});

// GET /api/international-teams/:teamId
router.get('/:teamId', async (req: Request, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const team = await prisma.nationalTeam.findUnique({
      where: { id: teamId },
      include: {
        players: { include: { player: true } },
        managers: true,
        homeMatches: true,
        awayMatches: true
      }
    });
    
    if (!team) {
      return res.status(404).json({ error: t('error.international_team_not_found', (req as any).language || 'en') });
    }
    
    res.json({ team });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_international_team', (req as any).language || 'en') });
  }
});

// POST /api/international-teams
router.post('/', async (req: Request, res) => {
  try {
    const {
      name,
      code,
      region,
      ranking,
      reputation
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const team = await prisma.nationalTeam.create({
      data: {
        name,
        code,
        region: region || 'Europe',
        reputation: reputation || 50,
        ranking: ranking || 100
      },
      include: {
        players: { include: { player: true } },
        managers: true
      }
    });

    res.status(201).json({ team });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_international_team', (req as any).language || 'en') });
  }
});

// PUT /api/international-teams/:teamId
router.put('/:teamId', async (req: Request, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const updateData = req.body;
    
    const team = await prisma.nationalTeam.update({
      where: { id: teamId },
      data: updateData,
      include: {
        players: { include: { player: true } },
        managers: true
      }
    });
    
    res.json({ team });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_international_team', (req as any).language || 'en') });
  }
});

// --- INTERNATIONAL PLAYERS ---

// GET /api/international-teams/:teamId/players
router.get('/:teamId/players', async (req: Request, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const players = await prisma.internationalPlayer.findMany({
      where: { nationalTeamId: teamId },
      include: {
        player: { include: { club: true } },
        nationalTeam: true
      },
      orderBy: { caps: 'desc' }
    });
    res.json({ players });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_international_players', (req as any).language || 'en') });
  }
});

// POST /api/international-teams/:teamId/player
router.post('/:teamId/player', async (req: Request, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const internationalPlayer = await prisma.internationalPlayer.create({
      data: {
        playerId,
        nationalTeamId: teamId,
        caps: 0,
        goals: 0,
        isActive: true
      },
      include: {
        player: { include: { club: true } },
        nationalTeam: true
      }
    });

    res.status(201).json({ player: internationalPlayer });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_add_international_player', (req as any).language || 'en') });
  }
});

// --- INTERNATIONAL BREAKS ---

// GET /api/international-breaks
router.get('/breaks', async (req: Request, res) => {
  try {
    const breaks = await prisma.internationalBreaks.findMany({
      orderBy: { startDate: 'asc' }
    });
    res.json({ breaks });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_international_breaks', (req as any).language || 'en') });
  }
});

// POST /api/international-breaks
router.post('/breaks', async (req: Request, res) => {
  try {
    const {
      startDate,
      endDate,
      competition,
      year,
      description
    } = req.body;

    if (!startDate || !endDate || !competition || !year) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const breakPeriod = await prisma.internationalBreaks.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        competition,
        year: parseInt(year, 10),
        description: description || 'International Break'
      }
    });

    res.status(201).json({ break: breakPeriod });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_international_break', (req as any).language || 'en') });
  }
});

// --- INTERNATIONAL COMPETITIONS ---

// GET /api/international-competitions
router.get('/competitions', async (req: Request, res) => {
  try {
    const competitions = await prisma.internationalCompetition.findMany({
      include: {
        matches: true,
        teams: true
      },
      orderBy: { startDate: 'desc' }
    });
    res.json({ competitions });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_international_competitions', (req as any).language || 'en') });
  }
});

// POST /api/international-competitions
router.post('/competitions', async (req: Request, res) => {
  try {
    const {
      name,
      type,
      startDate,
      endDate
    } = req.body;

    if (!name || !type || !startDate || !endDate) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const competition = await prisma.internationalCompetition.create({
      data: {
        name,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'UPCOMING'
      },
      include: {
        matches: true,
        teams: true
      }
    });

    res.status(201).json({ competition });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_international_competition', (req as any).language || 'en') });
  }
});

export default router; 