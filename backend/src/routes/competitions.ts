import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { competitionService } from '../services/competitionService';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/competitions?season=YYYY/YYYY
router.get('/competitions', async (req: Request, res: Response) => {
  try {
    const season = String(req.query.season || '').trim();
    if (!season) return res.status(400).json({ error: 'season (query) is required' });
    const comps = await competitionService.getActiveCompetitions(season);
    return res.json(comps);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// POST /api/competitions/:competitionId/fixtures/generate?season=YYYY/YYYY
router.post('/competitions/:competitionId/fixtures/generate', async (req: Request, res: Response) => {
  try {
    const competitionId = Number(req.params.competitionId);
    const season = String(req.query.season || '').trim();
    if (!competitionId || !season) {
      return res.status(400).json({ error: 'competitionId (path) and season (query) are required' });
    }

    await competitionService.generateLeagueFixtures(competitionId, season);
    return res.json({ message: 'Fixtures generated', competitionId, season });
  } catch (error) {
    console.error('Error generating fixtures:', error);
    return res.status(500).json({ error: 'Failed to generate fixtures' });
  }
});

// GET /api/competitions/:competitionId/table?season=YYYY/YYYY
router.get('/competitions/:competitionId/table', async (req: Request, res: Response) => {
  try {
    const competitionId = Number(req.params.competitionId);
    const season = String(req.query.season || '').trim();
    if (!competitionId || !season) {
      return res.status(400).json({ error: 'competitionId (path) and season (query) are required' });
    }
    const table = await competitionService.getLeagueTable(competitionId, season);
    return res.json(table);
  } catch (error) {
    console.error('Error fetching league table:', error);
    return res.status(500).json({ error: 'Failed to fetch league table' });
  }
});

// GET /api/teams/:teamId/fixtures?season=YYYY/YYYY
router.get('/teams/:teamId/fixtures', async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    const season = String(req.query.season || '').trim();
    if (!teamId || !season) {
      return res.status(400).json({ error: 'teamId (path) and season (query) are required' });
    }

    const fixtures = await prisma.fixture.findMany({
      where: {
        season,
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

// GET /api/teams/:teamId/fixtures/next?season=YYYY/YYYY
router.get('/teams/:teamId/fixtures/next', async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    const season = String(req.query.season || '').trim();
    if (!teamId || !season) {
      return res.status(400).json({ error: 'teamId (path) and season (query) are required' });
    }

    const nextFixture = await prisma.fixture.findFirst({
      where: {
        season,
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
