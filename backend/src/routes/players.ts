import express, { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient, Player, PlayerInjury, PlayerTrait, PlayerPosition, PlayerCareerStat } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { validate, createPlayerSchema, updatePlayerSchema, playerIdParamSchema, playerListQuerySchema, playerSearchQuerySchema } from '../middleware/validation';

// Define API response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Type for the translation function
type TranslationFunction = (key: string, params?: Record<string, unknown>) => string;

// Extend Express Request type to include language and translation function
declare module 'express-serve-static-core' {
  interface Request {
    language?: string;
    t?: TranslationFunction;
  }
}

// Helper function to get translation function from request
const getT = (req: Request): TranslationFunction => {
  return (key: string, params?: Record<string, unknown>) => {
    if (req.t) {
      return req.t(key, params);
    }
    return key; // Fallback to key if translation function is not available
  };
};



// Interface for raw player data from the database
interface RawPlayer extends Player {
  playerTraits?: Array<{ trait: string }>;
  injuries?: PlayerInjury[];
  positions?: PlayerPosition[];
  careerStats?: PlayerCareerStat[];
}

// Type for player with relations
type PlayerWithRelations = Player & {
  playerTraits?: PlayerTrait[];
  injuries?: PlayerInjury[];
  positions?: PlayerPosition[];
  careerStats?: PlayerCareerStat[];
  club?: {
    id: number;
    name: string;
  } | null;
  traits?: string[];
  morale?: number | null;
};

// Error utility functions
const createValidationError = (message: string, t: TranslationFunction, params: Record<string, unknown> = {}): AppError => {
  return new AppError(
    message,
    400,
    'errors.validation',
    { ...params, message }
  );
};

const createNotFoundError = (entity: string, id: string | number, t: TranslationFunction): AppError => {
  return new AppError(
    t('errors.notFound', { entity, id }),
    404,
    'errors.notFound',
    { entity, id: String(id) }
  );
};

const handlePrismaError = (error: unknown, t: TranslationFunction): AppError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0] || 'unknown';
      return new AppError(
        t('errors.duplicate', { field }),
        400,
        'errors.duplicate',
        { field }
      );
    }
    if (error.code === 'P2025') {
      return new AppError(
        t('errors.notFound', { entity: 'resource' }),
        404,
        'errors.notFound',
        { entity: 'resource' }
      );
    }
  }
  return new AppError(
    t('errors.unexpected'),
    500,
    'errors.unexpected'
  );
};

// Helper function to send standardized API responses
const sendResponse = <T>(
  res: Response,
  status: number,
  data?: T,
  message?: string,
  error?: {
    code: string;
    message: string;
    details?: unknown;
  }
): void => {
  const response: ApiResponse<T> = {
    success: status >= 200 && status < 300,
  };

  if (data) response.data = data;
  if (message) response.message = message;
  if (error) response.error = error;

  res.status(status).json(response);
};

// Async handler middleware
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Player request interfaces
interface CreatePlayerRequest {
  name: string;
  position: string;
  skill: number;
  age: number;
  nationality: string;
  traits?: string[];
  potential?: number;
  value?: number;
  wage?: number;
  contractExpiry?: Date;
  clubId?: number | null;
}

type UpdatePlayerRequest = Partial<CreatePlayerRequest>;

// Player include options for Prisma queries
const playerIncludeOptions: Prisma.PlayerInclude = {
  playerInjuries: true,
  playerTraits: true,
  positions: true,
  careerStats: true,
  club: {
    select: {
      id: true,
      name: true,
    },
  },
};

const prisma = new PrismaClient();
const router = express.Router();

// Helper function to calculate player value (exported for potential future use)
export const calculatePlayerValue = (player: Player & { potential?: number }): number => {
  // Base value calculation logic
  const baseValue = player.skill * 10000;
  const potentialBonus = (player.potential || 0) * 5000;
  const ageFactor = Math.max(1, 1.5 - (player.age - 18) * 0.05);
  
  return Math.round((baseValue + potentialBonus) * ageFactor);
};

// Routes
router.post<Record<string, never>, ApiResponse<PlayerWithRelations>, CreatePlayerRequest>(
  '/',
  validate(createPlayerSchema),
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const { name, position, skill, age, nationality, traits = [], ...rest } = req.body;

    try {
      // Input validation
      if (!name || !position || skill === undefined || !age || !nationality) {
        throw createValidationError(t('validation.missing_required_fields'), t, { fields: ['name', 'position', 'skill', 'age', 'nationality'] });
      }

      const player = await prisma.player.create({
        data: {
          name,
          position,
          skill,
          age,
          nationality,
          ...rest,
          playerTraits: {
            create: traits.map((trait: string) => ({
              trait,
            })),
          },
        },
        include: playerIncludeOptions,
      });

      const playerWithRelations: PlayerWithRelations = {
        ...player,
        playerTraits: player.playerTraits || [],
        injuries: player.playerInjuries || [],
        positions: player.positions || [],
        careerStats: player.careerStats || [],
        traits: player.playerTraits?.map(t => t.trait) || [],
      };

      sendResponse(res, 201, playerWithRelations, t('player.created_successfully'));
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

// GET /api/players/:id
router.get<{ id: string }, ApiResponse<PlayerWithRelations>, unknown>(
  '/:id',
  validate(playerIdParamSchema),
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);

    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: playerIncludeOptions,
      });

      if (!player) {
        throw createNotFoundError('Player', playerId, t);
      }

      const playerWithRelations: PlayerWithRelations = {
        ...player,
        playerTraits: player.playerTraits || [],
        injuries: player.playerInjuries || [],
        positions: player.positions || [],
        careerStats: player.careerStats || [],
        traits: player.playerTraits?.map(t => t.trait) || [],
      };

      sendResponse(res, 200, playerWithRelations);
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

// PUT /api/players/:id - Full update
router.put<{ id: string }, ApiResponse<PlayerWithRelations>, UpdatePlayerRequest>(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);
    const { traits, ...updateData } = req.body;

    try {
      // Check if player exists
      const existingPlayer = await prisma.player.findUnique({
        where: { id: playerId },
        include: { playerTraits: true },
      });

      if (!existingPlayer) {
        throw createNotFoundError('Player', playerId, t);
      }

      // Update player and handle traits in a transaction
      const [updatedPlayer] = await prisma.$transaction([
        prisma.player.update({
          where: { id: playerId },
          data: {
            ...updateData,
            playerTraits: traits ? {
              deleteMany: {},
              create: traits.map((trait: string) => ({ trait })),
            } : undefined,
          },
          include: playerIncludeOptions,
        }),
      ]);

      const playerWithRelations: PlayerWithRelations = {
        ...updatedPlayer,
        playerTraits: updatedPlayer.playerTraits || [],
        injuries: updatedPlayer.playerInjuries || [],
        positions: updatedPlayer.positions || [],
        careerStats: updatedPlayer.careerStats || [],
        traits: updatedPlayer.playerTraits?.map(t => t.trait) || [],
      };

      sendResponse(res, 200, playerWithRelations, t('player.updated_successfully'));
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

// PATCH /api/players/:id - Partial update
router.patch<{ id: string }, ApiResponse<PlayerWithRelations>, UpdatePlayerRequest>(
  '/:id',
  validate([...playerIdParamSchema, ...updatePlayerSchema]),
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);
    const { traits, ...updateData } = req.body;

    try {
      // Check if player exists
      const existingPlayer = await prisma.player.findUnique({
        where: { id: playerId },
        include: { playerTraits: true },
      });

      if (!existingPlayer) {
        throw createNotFoundError('Player', playerId, t);
      }

      // Update player and handle traits if provided
      const [updatedPlayer] = await prisma.$transaction([
        prisma.player.update({
          where: { id: playerId },
          data: {
            ...updateData,
            ...(traits ? {
              playerTraits: {
                deleteMany: {},
                create: traits.map((trait: string) => ({ trait })),
              },
            } : {}),
          },
          include: playerIncludeOptions,
        }),
      ]);

      const playerWithRelations: PlayerWithRelations = {
        ...updatedPlayer,
        playerTraits: updatedPlayer.playerTraits || [],
        injuries: updatedPlayer.playerInjuries || [],
        positions: updatedPlayer.positions || [],
        careerStats: updatedPlayer.careerStats || [],
        traits: updatedPlayer.playerTraits?.map(t => t.trait) || [],
      };

      sendResponse(res, 200, playerWithRelations, t('player.updated_successfully'));
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

// DELETE /api/players/:id
router.delete<{ id: string }, ApiResponse<object>, unknown>(
  '/:id',
  validate(playerIdParamSchema),
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);

    try {
      // Check if player exists
      const existingPlayer = await prisma.player.findUnique({
        where: { id: playerId },
      });

      if (!existingPlayer) {
        throw createNotFoundError('Player', playerId, t);
      }

      // Delete player (cascading deletes will handle related records)
      await prisma.player.delete({
        where: { id: playerId },
      });

      sendResponse(res, 204, undefined, t('player.deleted_successfully'));
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

// GET /api/players - List all players with pagination
router.get<Record<string, never>, ApiResponse<{ players: PlayerWithRelations[]; total: number; page: number; limit: number; }>, unknown, { page?: string; limit?: string }>(
  '/',
  validate(playerListQuerySchema),
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const page = parseInt(String(req.query?.page || '1'), 10) || 1;
    const limit = Math.min(parseInt(String(req.query?.limit || '10'), 10) || 10, 100);
    const skip = (page - 1) * limit;

    try {
      const [total, players] = await Promise.all([
        prisma.player.count(),
        prisma.player.findMany({
          skip,
          take: limit,
          include: playerIncludeOptions,
          orderBy: { id: 'asc' },
        }),
      ]);

      // Map the raw query results to our expected format
      const playersWithRelations = players.map((player: RawPlayer) => ({
        ...player,
        playerTraits: player.playerTraits || [],
        injuries: player.injuries || [],
        positions: player.positions || [],
        careerStats: player.careerStats || [],
        traits: Array.isArray(player.playerTraits) 
          ? player.playerTraits.map((t: { trait: string }) => t.trait)
          : [],
      })) as PlayerWithRelations[];

      sendResponse(res, 200, {
        players: playersWithRelations,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

// GET /api/players/search - Search players by name or other criteria
router.get<Record<string, never>, ApiResponse<PlayerWithRelations[]>, unknown, { q: string }>(
  '/search',
  validate(playerSearchQuerySchema),
  asyncHandler(async (req, res, next) => {
    const t = getT(req);
    const q = (req.query.q as string)?.toLowerCase();

    if (!q) {
      return next(new AppError(t('errors.searchQueryRequired'), 400, 'errors.searchQueryRequired'));
    }

    try {
      // Fetch players matching search criteria with case-insensitive search using raw query
      const players = await prisma.$queryRaw<PlayerWithRelations[]>`
        SELECT p.*, 
               json_agg(DISTINCT pt.*) FILTER (WHERE pt."trait" IS NOT NULL) as "playerTraits"
        FROM "Player" p
        LEFT JOIN "PlayerTrait" pt ON p.id = pt."playerId"
        WHERE LOWER(p.name) LIKE ${`%${q}%`}
           OR LOWER(p.nationality) LIKE ${`%${q}%`}
           OR LOWER(p.position) LIKE ${`%${q}%`}
        GROUP BY p.id
        LIMIT 20
      `;

      // Map the results to our expected format
      const playersWithRelations = players.map((player: RawPlayer) => ({
        ...player,
        playerTraits: player.playerTraits || [],
        injuries: player.injuries || [],
        positions: player.positions || [],
        careerStats: player.careerStats || [],
        traits: Array.isArray(player.playerTraits) 
          ? player.playerTraits.map((trait: { trait: string }) => trait.trait)
          : [],
      })) as PlayerWithRelations[];

      sendResponse(res, 200, playersWithRelations);
    } catch (error) {
      next(handlePrismaError(error, t));
    }
  })
);

export default router;
