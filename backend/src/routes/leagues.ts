import express, { Request, Response, Router } from 'express';
import { PrismaClient, LeagueLevel } from '@prisma/client';
import leagueService from '../services/leagueService';
import { t } from '../utils/i18n';

const prisma = new PrismaClient();

// Type definitions
interface LeagueStructureByLevel {
  [level: string]: Array<{
    id: number;
    name: string;
    season: string;
    tier: number;
    divisionType: 'PRO' | 'AMATEUR';
  }>;
}

interface LeagueStructureByCountry {
  [country: string]: LeagueStructureByLevel;
}

interface TypedRequest<T> extends Request {
  body: T;
  language?: string;
  query: {
    season?: string;
    [key: string]: string | string[] | undefined;
  };
}

interface CreateLeagueInput {
  name: string;
  country: string;
  level: string;
  season: string;
  type?: string;
  isActive?: boolean;
}

interface UpdateLeagueInput {
  name?: string;
  country?: string;
  level?: string;
  season?: string;
  type?: string;
  isActive?: boolean;
}

interface RegisterClubInput {
  clubId: number;
  season: string;
}

const router: Router = express.Router();

// Helper function to get language from request
const getLanguage = (req: Request): string => {
  return (req as TypedRequest<unknown>).language || 'en';
};

// Helper function to handle errors consistently
const handleError = (res: Response, error: unknown, errorKey: string, language: string): Response => {
  console.error('Error:', error);
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return res.status(500).json({
    success: false,
    error: t(errorKey, language) || errorMessage
  });
};

// Helper function to validate league ID
const validateLeagueId = (id: string, res: Response): { id: number; error?: Response } => {
  const leagueId = parseInt(id, 10);
  if (isNaN(leagueId)) {
    return {
      id: 0,
      error: res.status(400).json({
        success: false,
        error: 'Invalid league ID'
      })
    };
  }
  return { id: leagueId };
};

// GET /api/leagues/structure
router.get('/structure', async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Get all active leagues grouped by country and level from the League table
    // This is important because clubs reference League.id, not Competition.id
    const leagues = await prisma.league.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        country: true,
        level: true,
        tier: true
      },
      orderBy: [
        { country: 'asc' },
        { tier: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group by country and level
    const structure = leagues.reduce<LeagueStructureByCountry>((acc, league) => {
      const country = league.country || 'Unknown';
      const level = league.level || 'UNKNOWN';

      if (!acc[country]) {
        acc[country] = {};
      }

      if (!acc[country][level]) {
        acc[country][level] = [];
      }

      acc[country][level].push({
        id: league.id,
        name: league.name,
        season: '2026/2027', // Default season since League table doesn't have season field
        tier: league.tier,
        divisionType: league.tier <= 2 ? 'PRO' : 'AMATEUR'
      });

      return acc;
    }, {});

    return res.json(structure);
  } catch (error) {
    console.error('Error fetching league structure:', error);
    return res.status(500).json({
      error: 'Failed to fetch league structure',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// GET /api/leagues
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);

  try {
    const { country, level, season } = req.query;

    // Build the base where clause with required fields
    const where: {
      type: 'LEAGUE';
      isActive: boolean;
      country?: { contains: string; mode: 'insensitive' };
      level?: LeagueLevel;
      season?: string;
    } = {
      type: 'LEAGUE',
      isActive: true
    };

    // Add optional filters with type checking
    if (country && typeof country === 'string') {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (level) {
      // Ensure the level is a valid LeagueLevel enum value
      const validLevels = new Set(Object.values(LeagueLevel));
      if (validLevels.has(level as LeagueLevel)) {
        where.level = level as LeagueLevel;
      }
    }

    if (season && typeof season === 'string') {
      where.season = season;
    }

    const leagues = await prisma.competition.findMany({
      where,
      include: {
        teams: true
      }
    });

    return res.json({ success: true, data: leagues });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_leagues', language);
  }
});

// POST /api/leagues
router.post('/', async (req: TypedRequest<CreateLeagueInput>, res: Response): Promise<Response> => {
  const language = getLanguage(req);

  try {
    // Create league using the service
    const league = await leagueService.createLeague({
      name: req.body.name,
      country: req.body.country,
      level: req.body.level,
      season: req.body.season,
      type: req.body.type,
      isActive: req.body.isActive ?? true
    });

    return res.status(201).json({ success: true, data: league });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_create_league', language);
  }
});

// GET /api/leagues with filters
router.get('/filter', async (req: TypedRequest<unknown>, res: Response): Promise<Response> => {
  const language = getLanguage(req);

  try {
    const { country, level, season } = req.query;
    // Build the where clause with proper typing for Prisma
    const where = {
      type: 'LEAGUE' as const,
      isActive: true,
      ...(country && { country: { contains: country as string, mode: 'insensitive' } as const }),
      ...(level && { level: level as LeagueLevel }),
      ...(season && { season: season as string })
    };

    const leagues = await prisma.competition.findMany({
      where,
      include: {
        teams: true
      }
    });

    return res.json({ success: true, data: leagues });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_leagues', language);
  }
});

// GET /api/leagues/:id
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const league = await prisma.competition.findUnique({
      where: { id: Number(id), type: 'LEAGUE' },
      include: {
        teams: {
          include: {
            team: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        fixtures: true
      }
    });

    if (!league) {
      return res.status(404).json({
        success: false,
        error: t('error.league_not_found', language)
      });
    }

    return res.json({ success: true, data: league });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_league', language);
  }
});

// GET /api/leagues/:id/table
router.get('/:id/table', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const season = req.query.season as string || new Date().getFullYear().toString();
    const standings = await leagueService.getLeagueStandings(Number(id), season);

    if (!standings) {
      return res.status(404).json({
        success: false,
        error: t('error.league_table_not_found', language)
      });
    }

    return res.json({ success: true, data: standings });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_league_table', language);
  }
});

// PUT /api/leagues/:id
router.put('/:id', async (req: TypedRequest<UpdateLeagueInput>, res: Response): Promise<Response> => {
  const language = getLanguage(req);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const league = await leagueService.getLeagueById(id);
    if (!league) {
      return res.status(404).json({
        success: false,
        error: t('error.league_not_found', language)
      });
    }

    const updatedLeague = await leagueService.updateLeague(id, {
      name: req.body.name ?? league.name,
      country: req.body.country ?? league.country,
      level: req.body.level ?? league.level,
      season: req.body.season ?? league.season,
      type: req.body.type ?? league.type,
      isActive: req.body.isActive ?? league.isActive
    });

    return res.json({ success: true, data: updatedLeague });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_update_league', language);
  }
});

// DELETE /api/leagues/:id
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const league = await leagueService.getLeagueById(id);
    if (!league) {
      return res.status(404).json({
        success: false,
        error: t('error.league_not_found', language)
      });
    }

    await leagueService.deleteLeague(id);
    return res.json({
      success: true,
      message: t('success.league_deleted', language)
    });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_delete_league', language);
  }
});

// POST /api/leagues/:id/register-club
router.post('/:id/register-club', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<RegisterClubInput>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const { clubId, season } = req.body as RegisterClubInput;
    const result = await leagueService.registerClubForLeague(Number(clubId), Number(id), season);
    return res.json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_register_club', language);
  }
});

// GET /api/leagues/:id/standings
router.get('/:id/standings', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const season = req.query.season as string || new Date().getFullYear().toString();
    const standings = await leagueService.getLeagueStandings(Number(id), season);
    return res.json({ success: true, data: standings });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_standings', language);
  }
});

// GET /api/leagues/:id/fixtures
router.get('/:id/fixtures', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const season = req.query.season as string || new Date().getFullYear().toString();
    const matchday = req.query.matchday as string | undefined;

    const fixtures = await leagueService.getLeagueFixtures(Number(id), season);

    if (!fixtures) {
      return res.status(404).json({
        success: false,
        error: t('error.fixtures_not_found', language)
      });
    }

    // Filter by matchday if provided
    const filteredFixtures = matchday
      ? fixtures.fixtures.filter(f => f.matchDay === parseInt(matchday, 10))
      : fixtures.fixtures;

    return res.json({
      success: true,
      data: {
        ...fixtures,
        fixtures: filteredFixtures
      }
    });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_fixtures', language);
  }
});

// GET /api/leagues/:id/statistics
router.get('/:id/statistics', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const statistics = await leagueService.getLeagueStatistics(Number(id));
    return res.json({ success: true, data: statistics });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_statistics', language);
  }
});

// GET /api/leagues/:id/history
router.get('/:id/history', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    const history = await leagueService.getLeagueHistory(Number(id));
    return res.json({ success: true, data: history });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_history', language);
  }
});

// GET /api/leagues/:id/rankings
router.get('/:id/rankings', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);
  const { id, error: idError } = validateLeagueId(req.params.id, res);
  if (idError) return idError;

  try {
    // Check if league exists
    const league = await leagueService.getLeagueById(id);
    if (!league) {
      return res.status(404).json({
        success: false,
        error: t('error.league_not_found', language)
      });
    }

    const season = req.query.season as string || new Date().getFullYear().toString();
    const rankings = await leagueService.getLeagueStandings(id, season);
    return res.json({ success: true, data: rankings });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_rankings', language);
  }
});

// GET /api/leagues/cup-competitions
router.get('/cup-competitions', async (req: Request, res: Response): Promise<Response> => {
  const language = getLanguage(req as TypedRequest<unknown>);

  try {
    const cups = await leagueService.getCupCompetitions();
    return res.json({ success: true, data: cups });
  } catch (error) {
    return handleError(res, error, 'error.failed_to_fetch_cup_competitions', language);
  }
});

// GET /api/cup-competitions/:id/fixtures
router.get('/cup-competitions/:id/fixtures', async (req: TypedRequest<unknown>, res: Response): Promise<Response> => {
  const language = getLanguage(req);

  try {
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError) return idError;

    const cupFixtures = await leagueService.getCupFixtures(id);
    return res.json({ success: true, data: cupFixtures });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Cup competition not found') {
      return res.status(404).json({
        success: false,
        error: t('error.cup_competition_not_found', language)
      });
    }
    return handleError(res, error, 'error.failed_to_fetch_cup_fixtures', language);
  }
});

export default router; 
