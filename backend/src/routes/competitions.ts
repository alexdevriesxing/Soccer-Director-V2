import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import competitionService from '../services/competitionService';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/competitions?season=YYYY/YYYY
// Get active competitions (filtered by season if provided)
// router.get('/competitions', async (_req: Request, res: Response) => {
router.get('/competitions', async (_req: any, res: any) => {
  try {
    // const { season } = req.params;

    // If season is provided, try to filter (using service logic if available)
    // For now we just get all competitions as filtering might not be implemented
    const comps = await competitionService.getAllCompetitions();

    // Stub filtering logic
    // const filtered = season ? comps.filter(c => c.season === season) : comps;

    return res.json(comps);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// GET /api/competitions/active
// Alias for active competitions
router.get('/active', async (_req, res) => {
  try {
    const competitions = await competitionService.getAllCompetitions();
    res.json(competitions);
  } catch (error) {
    console.error('Error fetching active competitions:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// POST /api/competitions/:id/fixtures/generate
// Generate fixtures
router.post('/:id/fixtures/generate', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // The variable `season` was commented out and not used, so it's removed.
    // Stub
    res.json({ message: 'Fixtures generation scheduled', competitionId: id });
  } catch (error) {
    console.error('Error generating fixtures:', error);
    res.status(500).json({ error: 'Failed to generate fixtures' });
  }
});

// GET /api/competitions/:competitionId/table
// Get league table
router.get('/competitions/:competitionId/table', async (req: Request, res: Response) => {
  try {
    const competitionId = Number(req.params.competitionId);
    // const season = String(req.query.season || '').trim();

    if (!competitionId) {
      return res.status(400).json({ error: 'competitionId (path) is required' });
    }
    const table = await competitionService.getLeagueTable(competitionId);
    return res.json(table);
  } catch (error) {
    console.error('Error fetching league table:', error);
    return res.status(500).json({ error: 'Failed to fetch league table' });
  }
});

// GET /api/teams/:teamId/fixtures
// Get fixtures for a team
router.get('/teams/:teamId/fixtures', async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return res.status(400).json({ error: 'teamId (path) is required' });
    }

    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      include: {
        competition: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [{ matchDate: 'asc' }],
    });

    return res.json(fixtures);
  } catch (error) {
    console.error('Error fetching team fixtures:', error);
    return res.status(500).json({ error: 'Failed to fetch team fixtures' });
  }
});

// GET /api/teams/:teamId/fixtures/next
// Get next fixture for a team
router.get('/teams/:teamId/fixtures/next', async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    // const season = String(req.query.season || '').trim();

    if (!teamId) {
      return res.status(400).json({ error: 'teamId (path) is required' });
    }

    const nextFixture = await prisma.fixture.findFirst({
      where: {
        // season,
        isPlayed: false,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      include: {
        competition: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [{ matchDate: 'asc' }],
    });

    return res.json(nextFixture);
  } catch (error) {
    console.error('Error fetching next team fixture:', error);
    return res.status(500).json({ error: 'Failed to fetch next team fixture' });
  }
});

export default router;
