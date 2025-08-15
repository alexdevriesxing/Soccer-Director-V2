import 'express-async-errors';
import express, { Request, Response, NextFunction, Application, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { initWebSocketService, getWebSocketService } from './services/websocketService';
import logger from './utils/logger';
import { CustomRequest, Player, Team } from './types';

// Import route handlers
import leaguesRouter from './routes/leagues';
import clubsRouter from './routes/clubs';
import playersRouter from './routes/players';
import fixturesRouter from './routes/fixtures';
import matchManagementRouter from './routes/matchManagement';
import transferMarketRouter from './routes/transferMarket';
import youthDevelopmentRouter from './routes/youthDevelopment';
import financeRouter from './routes/finance';
import staffManagementRouter from './routes/staffManagement';
import fanRouter from './routes/fan';
import newsRouter from './routes/news';
import boardroomRouter from './routes/boardroom';
import youthCompetitionRouter from './routes/youthCompetition';
import youthIntakeRouter from './routes/youthIntake';
import youthEventRouter from './routes/youthEvent';
import youthNewsRouter from './routes/youthNews';
import playerTraitRouter from './routes/playerTrait';
import profilesRouter from './routes/profiles';
import errorTestRouter from './routes/errorTest';
import competitionsRouter from './routes/competitions';

// Import services
import { LiveMatchService } from './services/liveMatchService';
import { TransferService } from './services/transferService';
import { PromotionRelegationService } from './services/promotionRelegationService';

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: 'Too many attempts, please try again after an hour'
});

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize WebSocket service
initWebSocketService(httpServer);
const webSocketService = getWebSocketService();

// Initialize Socket.io for real-time events
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.io connection handler
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
  
  // Handle live match subscriptions
  socket.on('subscribeMatch', async (fixtureId: number) => {
    try {
      const matchState = await LiveMatchService.initializeMatch(fixtureId);
      socket.join(`match:${fixtureId}`);
      socket.emit('matchState', matchState);
      logger.info(`Client subscribed to match ${fixtureId}`);
    } catch (error) {
      logger.error(`Error subscribing to match ${fixtureId}:`, error);
      socket.emit('error', { message: 'Failed to subscribe to match' });
    }
  });

  // Handle match control
  socket.on('controlMatch', async ({ fixtureId, action }: { fixtureId: number, action: 'start' | 'pause' | 'reset' }) => {
    try {
      let matchState;
      if (action === 'start') {
        LiveMatchService.startMatch(fixtureId);
      } else if (action === 'pause') {
        LiveMatchService.pauseMatch(fixtureId);
      } else if (action === 'reset') {
        matchState = await LiveMatchService.initializeMatch(fixtureId);
      }
      
      // Broadcast updated state to all subscribers
      const updatedState = LiveMatchService.getMatchState(fixtureId);
      if (updatedState) {
        io.to(`match:${fixtureId}`).emit('matchState', updatedState);
      }
    } catch (error) {
      logger.error(`Error controlling match ${fixtureId}:`, error);
      socket.emit('error', { message: `Failed to ${action} match` });
    }
  });
});

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(configureCors);

// Request logging
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression
app.use(compression());

// CSRF protection (for non-API routes)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return csrfProtection(req, res, next);
  }
  next();
});

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', strictLimiter);
import playerMediaEventRouter from './routes/playerMediaEvent';
import playerInjuryRouter from './routes/playerInjury';
import playerHabitRouter from './routes/playerHabit';
import youthScoutingRouter from './routes/youthScouting';
import playerRelationshipRouter from './routes/playerRelationship';
import playerPersonalStoryRouter from './routes/playerPersonalStory';
import clubTacticsRouter from './routes/clubTactics';
import opponentAnalysisRouter from './routes/opponentAnalysis';
import squadRegistrationRouter from './routes/squadRegistration';
import gameProgressionRouter from './routes/gameProgression';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/api/clubs', clubTacticsRouter); // Mount clubTacticsRouter first
// app.use('/api/clubs', clubsRouter); // Commented out to avoid conflict

// Register the leagues router BEFORE static file serving and fallback
app.use('/api/leagues', leaguesRouter);

// Register the clubs router
app.use('/api/clubs', clubsRouter);

// Register the game router
app.use('/api/league', gameRouter);

// Register the transfer market routes
app.use('/api/transfer-market', transferMarketRouter);

// Register the Jong team router
app.use('/api/jong-team', jongTeamRouter);

// Register the squad chemistry router
app.use('/api/squad-chemistry', squadChemistryRouter);

// Register the tactical familiarity router
app.use('/api/tactical-familiarity', tacticalFamiliarityRouter);

// Register the manager profile router
app.use('/api/manager-profile', managerProfileRouter);

// Register the finance router
app.use('/api/finance', financeRouter);

// Register the facility router
app.use('/api/facility', facilityRouter);

// Register the regulatory router
app.use('/api/regulatory', regulatoryRouter);

// Register the football quotes router
app.use('/api/football-quotes', footballQuotesRoute);

// Register the live match events router
app.use('/api/live-match-events', liveMatchEventsRouter);

// Register the post match analysis router
app.use('/api/post-match-analysis', postMatchAnalysisRouter);

// Register the staff management router
app.use('/api/staff-management', staffManagementRouter);

// Register the international teams router
app.use('/api/international-teams', internationalTeamsRouter);

// Register the press conferences router
app.use('/api/press-conferences', pressConferencesRouter);

// Register the social media router
app.use('/api/social-media', socialMediaRouter);

// Register the player contracts router
app.use('/api/player-contracts', playerContractsRouter);

// Register the player morale router
app.use('/api/player-morale', playerMoraleRouter);

// Register the advanced match engine router
app.use('/api/advanced-match', advancedMatchEngineRouter);

// Register the fan dynamics router
app.use('/api/fan-dynamics', fanDynamicsRouter);
app.use('/api/advanced-finance', advancedFinanceRouter);
app.use('/api/youth-development', youthDevelopmentRouter);
app.use('/api/advanced-tactics', advancedTacticsRouter);
app.use('/api/players', playersRouter);
app.use('/api/match-management', matchManagementRouter);
app.use('/api/fixtures', fixturesRouter);
app.use('/api/fan', fanRouter);
app.use('/api/boardroom', boardroomRouter);
app.use('/api/youth-competition', youthCompetitionRouter);
app.use('/api/youth-intake', youthIntakeRouter);
app.use('/api/youth-event', youthEventRouter);
app.use('/api/youth-news', youthNewsRouter);
app.use('/api/player-trait', playerTraitRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/test/errors', errorTestRouter);
app.use('/api', competitionsRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    return res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Helper function to get random player from team
function getRandomPlayer(players: any[], position?: string) {
    const filtered = position ? players.filter(p => p.position === position) : players;
    if (filtered.length === 0) return players[Math.floor(Math.random() * players.length)];
    return filtered[Math.floor(Math.random() * filtered.length)];
}

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// --- Leagues endpoint ---
app.get('/api/leagues', async (req: Request, res: Response) => {
    try {
        const leagues = await prisma.league.findMany({
            include: { clubs: { include: { parentClub: { select: { id: true, name: true } } } } }
        });
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
});

// --- League table endpoint (deprecated) ---
app.get('/api/league-table/:leagueId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use GET /api/competitions/:competitionId/table?season=YYYY/YYYY instead.'
    });
});

// --- League table endpoint (deprecated) ---
app.get('/api/league/:leagueId/table', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use GET /api/competitions/:competitionId/table?season=YYYY/YYYY instead.'
    });
});

// --- League stats endpoints ---
app.get('/api/league-topscorers/:leagueId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use CompetitionService-based stats endpoints (to be provided) or related team/fixture queries.'
    });
});

app.get('/api/league-assistleaders/:leagueId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use CompetitionService-based stats endpoints (to be provided) or related team/fixture queries.'
    });
});

app.get('/api/league-yellowcards/:leagueId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use CompetitionService-based stats endpoints (to be provided) or related team/fixture queries.'
    });
});

app.get('/api/league-redcards/:leagueId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use CompetitionService-based stats endpoints (to be provided) or related team/fixture queries.'
    });
});

app.get('/api/league-appearances/:leagueId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use CompetitionService-based stats endpoints (to be provided) or related team/fixture queries.'
    });
});

app.get('/api/league-playerstats/:leagueId', async (req: Request, res: Response) => {
    try {
        const leagueId = parseInt(req.params.leagueId);
        
        const players = await prisma.player.findMany({
            where: {
                club: {
                    leagueId: leagueId
                }
            },
            include: {
                club: true
            }
        });

        const playerStats = players.map(player => ({
            id: player.id,
            name: player.name,
            club: player.club?.name || 'Free Agent',
            position: player.position,
            skill: player.skill,
            age: player.age || 25,
            nationality: player.nationality || 'Dutch',
            goals: Math.floor(Math.random() * 20) + 1,
            assists: Math.floor(Math.random() * 15) + 1,
            appearances: Math.floor(Math.random() * 30) + 10,
            yellowCards: Math.floor(Math.random() * 8) + 1,
            redCards: Math.floor(Math.random() * 3)
        }));

        res.json(playerStats);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ error: 'Failed to fetch player stats' });
    }
});

// --- Create sample fixtures endpoint ---
app.post('/api/create-fixtures', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based scheduling endpoints aligned with the updated schema.'
    });
});

// --- Clubs endpoint ---
app.get('/api/clubs', async (req: Request, res: Response) => {
    try {
        const clubs = await prisma.club.findMany({
            include: { players: true },
        });
        res.json(clubs.map(club => ({
            ...club,
            squad: club.players,
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

// --- Single club endpoint ---
app.get('/api/clubs/:id', async (req: Request, res: Response) => {
    try {
        const club = await prisma.club.findUnique({
            where: { id: Number(req.params.id) },
            include: { players: true },
        });
        if (!club) return res.status(404).json({ error: 'Club not found' });
        res.json({ ...club, squad: club.players });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch club' });
    }
});

// --- All players endpoint ---
app.get('/api/players', async (req: Request, res: Response) => {
    try {
        const { clubId } = req.query;
        let players;
        if (clubId) {
            players = await prisma.player.findMany({ where: { clubId: Number(clubId) } });
        } else {
            players = await prisma.player.findMany();
        }
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// --- Players by club endpoint ---
app.get('/api/players/club/:clubId', async (req: Request, res: Response) => {
    try {
        const { clubId } = req.params;
        const { page = '1', limit = '25' } = req.query;
        
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;
        
        const [players, totalPlayers] = await prisma.$transaction([
            prisma.player.findMany({
                where: { clubId: Number(clubId) },
                take: limitNum,
                skip: skip,
                orderBy: {
                    name: 'asc',
                },
            }),
            prisma.player.count({
                where: { clubId: Number(clubId) },
            }),
        ]);

        res.json({
            players,
            totalPlayers,
            currentPage: pageNum,
            totalPages: Math.ceil(totalPlayers / limitNum),
        });
    } catch (error) {
        console.error(`Failed to retrieve players for clubId ${req.params.clubId}:`, error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// --- Single player endpoint ---
app.get('/api/players/:id', async (req: Request, res: Response) => {
    try {
        const player = await prisma.player.findUnique({ where: { id: Number(req.params.id) } });
        if (!player) return res.status(404).json({ error: 'Player not found' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

// --- Fixtures endpoint with filtering ---
app.get('/api/fixtures', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based fixtures endpoints aligned with the updated schema (CompetitionService).'
    });
});

// --- Single fixture by ID ---
app.get('/api/fixtures/:id', async (req: Request, res: Response) => {
    try {
        const fixture = await prisma.fixture.findUnique({
            where: { id: Number(req.params.id) }
        });
        if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
        res.json(fixture);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch fixture' });
    }
});

// --- Loans Endpoints ---
app.get('/api/loans', async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany();
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

app.get('/api/loans/:id', async (req: Request, res: Response) => {
    try {
        const loan = await prisma.loan.findUnique({ where: { id: Number(req.params.id) } });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loan' });
    }
});

app.post('/api/loans', async (req: Request, res: Response) => {
    try {
        const { playerId, fromClubId, toClubId, startDate, endDate, fee } = req.body;
        if (!playerId || !fromClubId || !toClubId || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Calculate duration in weeks
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationMs = end.getTime() - start.getTime();
        const durationWeeks = Math.max(1, Math.round(durationMs / (7 * 24 * 60 * 60 * 1000)));
        const loan = await TransferService.createLoanOffer({
            fromClubId: Number(fromClubId),
            toClubId: Number(toClubId),
            playerId: Number(playerId),
            duration: durationWeeks,
            fee: fee ? Number(fee) : 0
        });
        res.json(loan);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to create loan' });
    }
});

app.put('/api/loans/:id', async (req: Request, res: Response) => {
    try {
        const { action } = req.body;
        const loanId = Number(req.params.id);
        if (!loanId) return res.status(400).json({ error: 'Invalid loan ID' });
        if (action === 'recall' || action === 'end') {
            const updatedLoan = await TransferService.recallPlayer(loanId);
            return res.json({ success: true, loan: updatedLoan });
        }
        return res.status(400).json({ error: 'Invalid action' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to update loan' });
    }
});

app.get('/api/loans/out', async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            where: { status: 'active' },
            include: {
                player: true,
                fromClub: true,
                toClub: true
            }
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loans out' });
    }
});

app.get('/api/loans/available', async (req: Request, res: Response) => {
    try {
        const players = await prisma.player.findMany({
            where: { clubId: 1 } // Assuming club 1 is the main club
        });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch available players for loan' });
    }
});

// --- Training & Staff Endpoints ---
app.get('/api/training', async (req: Request, res: Response) => {
    try {
        const { clubId } = req.query;
        if (!clubId) return res.status(400).json({ error: 'Missing clubId' });

        const focus = await prisma.trainingFocus.findMany({
            where: { clubId: Number(clubId) },
            include: { player: true }
        });
        const staff = await prisma.staff.findMany({
            where: { clubId: Number(clubId) }
        });

        res.json({ focus, staff });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch training data' });
    }
});

app.post('/api/training/focus', async (req: Request, res: Response) => {
    try {
        const { clubId, playerId, focus, isExtra } = req.body;
        if (!clubId || !playerId || !focus || isExtra === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if player and club exist
        const player = await prisma.player.findUnique({ where: { id: Number(playerId) } });
        const club = await prisma.club.findUnique({ where: { id: Number(clubId) } });
        if (!player || !club) {
            return res.status(500).json({ error: 'Player or club not found' });
        }
        const trainingFocus = await prisma.trainingFocus.create({
            data: {
                clubId: Number(clubId),
                playerId: Number(playerId),
                focus: String(focus),
                isExtra: Boolean(isExtra),
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            }
        });
        res.status(200).json(trainingFocus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create training focus' });
    }
});

app.post('/api/training/extra', async (req: Request, res: Response) => {
    try {
        const { clubId, playerId, focus, isExtra } = req.body;
        if (!clubId || !playerId || !focus || isExtra === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if player already has extra training focus
        const existingFocus = await prisma.trainingFocus.findFirst({
            where: {
                clubId: Number(clubId),
                playerId: Number(playerId),
                isExtra: true,
                endDate: { gte: new Date() }
            }
        });
        if (existingFocus) {
            return res.status(400).json({ error: 'Player already has extra training' });
        }
        const trainingFocus = await prisma.trainingFocus.create({
            data: {
                clubId: Number(clubId),
                playerId: Number(playerId),
                focus: String(focus),
                isExtra: Boolean(isExtra),
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            }
        });
        res.status(200).json(trainingFocus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create extra training' });
    }
});

app.post('/api/training/staff', async (req: Request, res: Response) => {
    try {
        const { clubId, name, role, skill } = req.body;
        const staff = await prisma.staff.create({
            data: {
                clubId: Number(clubId),
                name,
                role,
                skill: Number(skill),
                hiredDate: new Date(),
            }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Failed to hire staff' });
    }
});

app.delete('/api/training/staff/:id', async (req: Request, res: Response) => {
    try {
        await prisma.staff.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fire staff' });
    }
});

app.get('/api/training/progress', async (req: Request, res: Response) => {
    try {
        const { clubId } = req.query;
        const focus = await prisma.trainingFocus.findMany({
            where: { clubId: Number(clubId) },
            include: { player: true }
        });

        const progress = focus.map((f: any) => {
            // Calculate real progress based on training duration
            const startDate = new Date(f.startDate);
            const now = new Date();
            const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

            // Progress increases by 1-3 points per day, capped at 100
            const baseProgress = Math.min(100, daysSinceStart * (Math.floor(Math.random() * 3) + 1));

            // Add some randomness but keep it realistic
            const finalProgress = Math.min(100, Math.max(1, baseProgress + (Math.floor(Math.random() * 100) - 50)));

            return {
                player: f.player?.name || 'Unknown',
                focus: f.focus,
                progress: finalProgress
            };
        });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch training progress' });
    }
});

// --- Formation & Strategy Endpoints ---

app.get('/api/clubs/:id/formation', async (req: Request, res: Response) => {
    try {
        const formation = await prisma.clubFormation.findFirst({
            where: { clubId: Number(req.params.id) }
        });
        res.json(formation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch formation' });
    }
});

app.put('/api/clubs/:id/formation', async (req: Request, res: Response) => {
    try {
        const { formation, style, intensity, width, tempo } = req.body;
        const clubId = Number(req.params.id);

        // Check if formation exists
        const existingFormation = await prisma.clubFormation.findFirst({
            where: { clubId }
        });

        let updatedFormation;
        if (existingFormation) {
            // Update existing formation
            updatedFormation = await prisma.clubFormation.update({
                where: { id: existingFormation.id },
                data: {
                    formation,
                    style,
                    intensity: Number(intensity),
                    width: Number(width),
                    tempo: Number(tempo),
                }
            });
        } else {
            // Create new formation
            updatedFormation = await prisma.clubFormation.create({
                data: {
                    clubId,
                    formation,
                    style,
                    intensity: Number(intensity),
                    width: Number(width),
                    tempo: Number(tempo)
                }
            });
        }

        res.json(updatedFormation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update formation' });
    }
});

app.get('/api/clubs/:id/strategy', async (req: Request, res: Response) => {
    try {
        const strategy = await prisma.clubStrategy.findFirst({
            where: { clubId: Number(req.params.id) }
        });
        res.json(strategy);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch strategy' });
    }
});

app.put('/api/clubs/:id/strategy', async (req: Request, res: Response) => {
    try {
        const { approach, defensiveStyle, attackingStyle, setPieces, marking } = req.body;
        const clubId = Number(req.params.id);

        // Check if strategy exists
        const existingStrategy = await prisma.clubStrategy.findFirst({
            where: { clubId }
        });

        let updatedStrategy;
        if (existingStrategy) {
            // Update existing strategy
            updatedStrategy = await prisma.clubStrategy.update({
                where: { id: existingStrategy.id },
                data: {
                    approach,
                    defensiveStyle,
                    attackingStyle,
                    setPieces,
                    marking,
                }
            });
        } else {
            // Create new strategy
            updatedStrategy = await prisma.clubStrategy.create({
                data: {
                    clubId,
                    approach,
                    defensiveStyle,
                    attackingStyle,
                    setPieces,
                    marking
                }
            });
        }

        res.json(updatedStrategy);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update strategy' });
    }
});

// Helper function to calculate tactical bonuses
/**
 * Calculates the tactical bonus for a club based on formation, strategy, and opponent setup.
 * Considers formation effectiveness, style, intensity, approach, and tactical matchups.
 * Returns a capped bonus between -5 and +5.
 *
 * @param {object} formation - The club's formation object (e.g., { formation: '4-3-3', style: 'attacking', intensity: 60, width: 50 })
 * @param {object} strategy - The club's strategy object (e.g., { approach: 'possession', defensiveStyle: 'high_line' })
 * @param {object} opponentFormation - The opponent's formation object
 * @param {object} opponentStrategy - The opponent's strategy object
 * @returns {number} Tactical bonus (between -5 and +5)
 */
function calculateTacticalBonus(formation: any, strategy: any, opponentFormation: any, opponentStrategy: any) {
    let bonus = 0;

    if (!formation || !strategy) return 0;

    // Formation effectiveness
    const formationBonus = {
        '4-3-3': { attacking: 5, defending: 3 },
        '4-4-2': { attacking: 3, defending: 5 },
        '4-2-3-1': { attacking: 4, defending: 4 },
        '3-5-2': { attacking: 4, defending: 4 },
        '5-3-2': { attacking: 2, defending: 6 },
        '4-1-4-1': { attacking: 3, defending: 5 }
    };

    const formationEffect = formationBonus[formation.formation as keyof typeof formationBonus] || { attacking: 0, defending: 0 };

    // Style effectiveness
    const styleBonus = {
        'attacking': 3,
        'defensive': -2,
        'balanced': 0,
        'possession': 2,
        'counter': 1
    };

    const styleEffect = styleBonus[formation.style as keyof typeof styleBonus] || 0;

    // Intensity bonus
    const intensityBonus = (formation.intensity - 50) * 0.1;

    // Strategy approach bonus
    const approachBonus = {
        'possession': 2,
        'pressing': 3,
        'counter': 1,
        'direct': 0,
        'balanced': 0
    };

    const approachEffect = approachBonus[strategy.approach as keyof typeof approachBonus] || 0;

    // Tactical matchup bonuses
    let matchupBonus = 0;
    if (opponentFormation && opponentStrategy) {
        // High line vs counter attack
        if (strategy.defensiveStyle === 'high_line' && opponentStrategy.approach === 'counter') {
            matchupBonus -= 2;
        }
        // Pressing vs possession
        if (strategy.approach === 'pressing' && opponentStrategy.approach === 'possession') {
            matchupBonus += 1;
        }
        // Wide vs narrow
        if (formation.width > 60 && opponentFormation.width < 40) {
            matchupBonus += 1;
        }
    }

    bonus = formationEffect.attacking + styleEffect + intensityBonus + approachEffect + matchupBonus;

    return Math.max(-5, Math.min(5, bonus)); // Cap between -5 and +5
}

// --- Match Simulation Endpoints ---

// Helper function to calculate team strength based on players and tactics
/**
 * Calculates a team's strength for simulation based on player skill, morale, club morale, and recent form.
 * Weights skill, morale, and form to produce a single strength value.
 *
 * @param {Array} players - Array of player objects with skill and morale
 * @param {number} clubMorale - The club's overall morale
 * @param {string} form - Recent form string (e.g., 'WWDL')
 * @returns {number} Team strength value
 */
function calculateTeamStrength(players: any[], clubMorale: number, form: string) {
    if (players.length === 0) return 50;

    const avgSkill = players.reduce((sum, p) => sum + p.skill, 0) / players.length;
    const avgMorale = players.reduce((sum, p) => sum + p.morale, 0) / players.length;

    // Form bonus (W=+2, D=+1, L=-1)
    const formBonus = form ? form.split('').reduce((sum, result) => {
        if (result === 'W') return sum + 2;
        if (result === 'D') return sum + 1;
        if (result === 'L') return sum - 1;
        return sum;
    }, 0) : 0;

    return (avgSkill * 0.6) + (avgMorale * 0.2) + (clubMorale * 0.1) + (formBonus * 0.1);
}

// Helper function to simulate Poisson distribution for goals
/**
 * Simulates a Poisson-distributed random variable (used for goal simulation in football).
 * Given an expected value (lambda), returns a random integer representing the number of events (e.g., goals).
 *
 * @param {number} lambda - Expected value (mean) for the Poisson distribution
 * @returns {number} Random integer from Poisson distribution
 */
function poisson(lambda: number) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

// Enhanced match simulation
app.post('/api/fixtures/:id/simulate', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based simulation endpoints aligned with the updated schema.'
    });
});

app.post('/api/simulate-week', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based round simulation aligned with the updated schema.'
    });
});

app.get('/api/fixtures/:id/events', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based fixtures/events endpoints aligned with the updated schema.'
    });
});

// New endpoint to get match statistics
app.get('/api/fixtures/:id/stats', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition/fixture statistics endpoints aligned with the updated schema.'
    });
});

// --- News endpoints ---
app.get('/api/news', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based news endpoints aligned with the updated schema.'
    });
});

app.post('/api/news', (req: Request, res: Response) => {
    res.json({ success: true, id: uuidv4() });
});

// --- Transfer Market Endpoints ---
app.get('/api/transfer-market', async (req: Request, res: Response) => {
    try {
        const { position, minSkill, maxSkill, nationality, maxAge } = req.query;

        // Get all players who are not currently on loan or in transfer negotiations
        const availablePlayers = await prisma.player.findMany({
            where: {
                loans: { none: { status: 'active' } },
                // Add more filters based on query parameters
                ...(position && { position: position as string }),
                ...(minSkill && { skill: { gte: Number(minSkill) } }),
                ...(maxSkill && { skill: { lte: Number(maxSkill) } }),
                ...(nationality && { nationality: nationality as string }),
                ...(maxAge && { age: { lte: Number(maxAge) } }),
            },
            include: {
                club: true,
            }
        });

        // Transform to transfer market format
        const transferMarketPlayers = availablePlayers.map((player: any) => ({
            id: player.id,
            name: player.name,
            position: player.position,
            skill: player.skill,
            age: player.age,
            nationality: player.nationality,
            currentClub: player.club?.name || 'Free Agent',
            currentClubId: player.clubId,
            estimatedValue: Math.floor(player.skill * 10000 + Math.random() * 50000),
            wage: Math.floor(player.skill * 100 + Math.random() * 500),
            contractExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
            transferStatus: 'available',
            agent: {
                name: `Agent ${player.name.split(' ')[1] || 'Smith'}`,
                style: ['hardball', 'reasonable', 'flexible'][Math.floor(Math.random() * 3)],
                reputation: Math.floor(Math.random() * 100),
            },
            ambition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            loyalty: Math.floor(Math.random() * 100),
            injuryHistory: Math.floor(Math.random() * 100),
        }));

        res.json(transferMarketPlayers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transfer market' });
    }
});

app.get('/api/transfer-market/:playerId', async (req: Request, res: Response) => {
    try {
        const player = await prisma.player.findUnique({
            where: { id: Number(req.params.playerId) },
            include: { club: true }
        });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const transferMarketPlayer = {
            id: player.id,
            name: player.name,
            position: player.position,
            skill: player.skill,
            age: player.age,
            nationality: player.nationality,
            currentClub: player.club?.name || 'Free Agent',
            currentClubId: player.clubId,
            estimatedValue: Math.floor(player.skill * 10000 + Math.random() * 50000),
            wage: Math.floor(player.skill * 100 + Math.random() * 500),
            contractExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
            transferStatus: 'available',
            agent: {
                name: `Agent ${player.name.split(' ')[1] || 'Smith'}`,
                style: ['hardball', 'reasonable', 'flexible'][Math.floor(Math.random() * 3)],
                reputation: Math.floor(Math.random() * 100),
            },
            ambition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            loyalty: Math.floor(Math.random() * 100),
            injuryHistory: Math.floor(Math.random() * 100),
        };

        res.json(transferMarketPlayer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player details' });
    }
});

app.post('/api/transfer-market/:playerId/bid', async (req: Request, res: Response) => {
    try {
        const { bidAmount, biddingClubId, wageOffer, contractLength } = req.body;
        const playerId = Number(req.params.playerId);

        const player = await prisma.player.findUnique({
            where: { id: playerId },
            include: { club: true }
        });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Create transfer negotiation record
        const transferNegotiation = {
            id: uuidv4(),
            playerId,
            fromClubId: player.clubId,
            toClubId: Number(biddingClubId),
            bidAmount: Number(bidAmount),
            wageOffer: Number(wageOffer),
            contractLength: Number(contractLength),
            status: 'pending',
            createdAt: new Date(),
            rounds: 1,
            agentMood: 50, // Starting mood
            lastOffer: {
                bidAmount: Number(bidAmount),
                wageOffer: Number(wageOffer),
                contractLength: Number(contractLength),
            }
        };

        // For now, we'll store this in memory. In a real app, you'd use a database table
        // This is a simplified version - you'd want to create a TransferNegotiation model in Prisma

        res.json({
            success: true,
            negotiation: transferNegotiation,
            message: 'Bid submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit bid' });
    }
});

app.post('/api/transfer-market/:playerId/negotiate', async (req: Request, res: Response) => {
    try {
        const { negotiationId, newBidAmount, newWageOffer, newContractLength } = req.body;
        const playerId = Number(req.params.playerId);

        // Simulate negotiation logic
        const player = await prisma.player.findUnique({
            where: { id: playerId }
        });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Calculate if the offer is acceptable
        const estimatedValue = Math.floor(player.skill * 10000);
        const isBidAcceptable = Number(newBidAmount) >= estimatedValue * 0.8;
        const isWageAcceptable = Number(newWageOffer) >= Math.floor(player.skill * 100);

        const response = {
            accepted: isBidAcceptable && isWageAcceptable,
            message: isBidAcceptable && isWageAcceptable
                ? 'Offer accepted!'
                : 'Offer rejected. Try increasing the bid or wage offer.',
            counterOffer: !isBidAcceptable || !isWageAcceptable ? {
                bidAmount: Math.floor(estimatedValue * 1.1),
                wageOffer: Math.floor(player.skill * 120),
                contractLength: 3
            } : null,
            agentMood: isBidAcceptable && isWageAcceptable ? 80 : 30
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to negotiate transfer' });
    }
});

// --- Transfer Endpoints ---
app.get('/api/transfers', async (req: Request, res: Response) => {
    try {
        const { status, clubId, playerId } = req.query;
        const where: any = {};
        if (status && status !== 'all') where.status = String(status);
        if (clubId) {
            where.OR = [
                { fromClubId: Number(clubId) },
                { toClubId: Number(clubId) }
            ];
        }
        if (playerId) where.playerId = Number(playerId);
        const transfers = await prisma.transfer.findMany({
            where,
            include: {
                player: true,
                fromClub: true,
                toClub: true
            },
            orderBy: { date: 'desc' }
        });
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transfers' });
    }
});

app.get('/api/transfers/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const transfer = await prisma.transfer.findUnique({
            where: { id },
            include: { player: true, fromClub: true, toClub: true }
        });
        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
        res.status(200).json(transfer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transfer' });
    }
});

app.post('/api/transfers', async (req: Request, res: Response) => {
    try {
        const { fromClubId, toClubId, playerId, fee } = req.body;
        if (!fromClubId || !toClubId || !playerId || !fee) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Validate player and clubs
        const player = await prisma.player.findUnique({ where: { id: playerId } });
        const fromClub = await prisma.club.findUnique({ where: { id: fromClubId } });
        const toClub = await prisma.club.findUnique({ where: { id: toClubId } });
        if (!player || !fromClub || !toClub) return res.status(500).json({ error: 'Player or club not found' });
        if (player.clubId !== fromClubId) return res.status(400).json({ error: 'Player does not belong to fromClub' });
        // Create transfer
        const transfer = await prisma.transfer.create({
            data: {
                fromClubId,
                toClubId,
                playerId,
                fee,
                status: 'pending',
                date: new Date()
            }
        });
        res.status(200).json(transfer);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to create transfer' });
    }
});

app.patch('/api/transfers/:id', async (req: Request, res: Response) => {
    try {
        const { fee, status } = req.body;
        const transfer = await prisma.transfer.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(fee !== undefined && { fee: Number(fee) }),
                ...(status && { status: String(status) }),
            },
            include: {
                player: true,
                fromClub: true,
                toClub: true
            }
        });
        res.json(transfer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transfer' });
    }
});

// --- Friendly Match Endpoints ---
app.get('/api/friendly/available-dates', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based scheduling endpoints aligned with the updated schema.'
    });
});

app.post('/api/friendly/schedule', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based friendly scheduling aligned with the updated schema.'
    });
});

app.delete('/api/friendly/:id/cancel', async (req: Request, res: Response) => {
    try {
        const fixtureId = Number(req.params.id);

        await prisma.fixture.delete({
            where: { id: fixtureId }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel friendly' });
    }
});

// --- AI Manager endpoints ---
app.post('/api/ai/trigger', async (req: Request, res: Response) => {
    try {
        await triggerAIManagers();
        res.json({ message: 'AI managers triggered successfully' });
    } catch (error) {
        console.error('Error triggering AI managers:', error);
        res.status(500).json({ error: 'Failed to trigger AI managers' });
    }
});

app.get('/api/ai/transfers', async (req: Request, res: Response) => {
    try {
        const transfers = await prisma.transfer.findMany({
            where: {
                status: 'pending',
                fromClubId: { not: 1 } // Exclude human player's club
            },
            include: {
                player: true,
                fromClub: true,
                toClub: true
            },
            orderBy: { date: 'desc' },
            take: 20
        });

        res.json(transfers);
    } catch (error) {
        console.error('Error fetching AI transfers:', error);
        res.status(500).json({ error: 'Failed to fetch AI transfers' });
    }
});

app.get('/api/ai/loans', async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            where: {
                status: 'active',
                fromClubId: { not: 1 } // Exclude human player's club
            },
            include: {
                player: true,
                fromClub: true,
                toClub: true
            },
            orderBy: { startDate: 'desc' },
            take: 20
        });

        res.json(loans);
    } catch (error) {
        console.error('Error fetching AI loans:', error);
        res.status(500).json({ error: 'Failed to fetch AI loans' });
    }
});

app.get('/api/ai/activity/:clubId', async (req: Request, res: Response) => {
    try {
        const clubId = parseInt(req.params.clubId);

        const transfers = await prisma.transfer.findMany({
            where: {
                OR: [
                    { fromClubId: clubId },
                    { toClubId: clubId }
                ],
                fromClubId: { not: 1 } // Exclude human player's club
            },
            include: {
                player: true,
                fromClub: true,
                toClub: true
            },
            orderBy: { date: 'desc' },
            take: 10
        });

        const loans = await prisma.loan.findMany({
            where: {
                OR: [
                    { fromClubId: clubId },
                    { toClubId: clubId }
                ],
                fromClubId: { not: 1 } // Exclude human player's club
            },
            include: {
                player: true,
                fromClub: true,
                toClub: true
            },
            orderBy: { startDate: 'desc' },
            take: 10
        });

        res.json({
            transfers,
            loans,
            totalActivity: transfers.length + loans.length
        });
    } catch (error) {
        console.error('Error fetching AI activity:', error);
        res.status(500).json({ error: 'Failed to fetch AI activity' });
    }
});

// --- Weekly Simulation endpoints ---
app.post('/api/simulate/week/:weekNumber', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based round simulation aligned with the updated schema.'
    });
});

app.get('/api/current-week', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based schedules/rounds aligned with the updated schema.'
    });
});

// Promotion and Relegation endpoints
app.post('/api/promotion-relegation/zaterdag-noord', async (req, res) => {
  try {
    const result = await PromotionRelegationService.handleZaterdagNoordPromotionRelegation();
    res.json({
      success: true,
      message: 'Promotion and relegation processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error processing promotion and relegation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing promotion and relegation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/promotion-relegation/stats/:season', async (req, res) => {
  try {
    const { season } = req.params;
    const stats = await PromotionRelegationService.getPromotionRelegationStats(season);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting promotion/relegation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting promotion/relegation stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all Zaterdag Noord leagues and clubs
app.get('/api/zaterdag-noord', async (req, res) => {
  try {
    const zaterdagNoordLeagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag Noord'
      },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            homeCity: true,
            morale: true,
            form: true,
            boardExpectation: true
          }
        }
      },
      orderBy: [
        { division: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: zaterdagNoordLeagues
    });
  } catch (error) {
    console.error('Error getting Zaterdag Noord data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting Zaterdag Noord data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// --- International Match Endpoints ---
app.get('/api/international/teams', async (req: Request, res: Response) => {
    try {
        const teams = await prisma.nationalTeam.findMany({
            include: {
                players: {
                    include: {
                        player: true
                    }
                }
            }
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch national teams' });
    }
});

app.get('/api/international/matches', async (req: Request, res: Response) => {
    try {
        const { competitionId, teamId } = req.query;
        let where: any = {};
        
        if (competitionId) where.competitionId = Number(competitionId);
        if (teamId) {
            where.OR = [
                { homeTeamId: Number(teamId) },
                { awayTeamId: Number(teamId) }
            ];
        }

        const matches = await prisma.internationalMatch.findMany({
            where,
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true,
                events: true
            },
            orderBy: { date: 'desc' }
        });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch international matches' });
    }
});

app.post('/api/international/matches/simulate', async (req: Request, res: Response) => {
    try {
        const { homeTeamId, awayTeamId, matchType = 'FRIENDLY' } = req.body;

        // Get team data
        const homeTeam = await prisma.nationalTeam.findUnique({
            where: { id: Number(homeTeamId) },
            include: {
                players: {
                    where: { isActive: true },
                    include: { player: true }
                }
            }
        });

        const awayTeam = await prisma.nationalTeam.findUnique({
            where: { id: Number(awayTeamId) },
            include: {
                players: {
                    where: { isActive: true },
                    include: { player: true }
                }
            }
        });

        if (!homeTeam || !awayTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Calculate team strengths
        const homeStrength = calculateInternationalTeamStrength(homeTeam);
        const awayStrength = calculateInternationalTeamStrength(awayTeam);

        // Simulate match
        const matchResult = simulateInternationalMatch(homeTeam, awayTeam, homeStrength, awayStrength);

        // Create match record
        const match = await prisma.internationalMatch.create({
            data: {
                homeTeamId: Number(homeTeamId),
                awayTeamId: Number(awayTeamId),
                date: new Date(),
                homeGoals: matchResult.homeGoals,
                awayGoals: matchResult.awayGoals,
                played: true,
                matchType,
                homeFormation: '4-3-3',
                awayFormation: '4-3-3',
                homeStrategy: 'Balanced',
                awayStrategy: 'Balanced'
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                events: true
            }
        });

        // Create match events
        for (const event of matchResult.events) {
            await prisma.internationalMatchEvent.create({
                data: {
                    matchId: match.id,
                    type: event.type,
                    minute: event.minute,
                    description: event.description,
                    playerName: event.playerName,
                    teamId: event.teamId,
                    isHomeTeam: event.teamId === Number(homeTeamId)
                }
            });
        }

        res.json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to simulate international match' });
    }
});

function calculateInternationalTeamStrength(team: any): number {
    if (!team.players || team.players.length === 0) {
        return team.reputation * 2; // Base strength from reputation
    }

    const activePlayers = team.players.filter((p: any) => p.isActive);
    if (activePlayers.length === 0) return team.reputation * 2;

    const totalSkill = activePlayers.reduce((sum: number, p: any) => sum + p.player.skill, 0);
    const avgSkill = totalSkill / activePlayers.length;
    
    // Combine player skill with team reputation
    return Math.floor((avgSkill * 0.7) + (team.reputation * 0.3));
}

function simulateInternationalMatch(homeTeam: any, awayTeam: any, homeStrength: number, awayStrength: number) {
    const homeGoals = Math.floor(Math.random() * 4); // 0-3 goals
    const awayGoals = Math.floor(Math.random() * 4); // 0-3 goals
    
    // Adjust based on team strength difference
    const strengthDiff = homeStrength - awayStrength;
    const homeAdvantage = Math.floor(Math.random() * 2) + 1; // Home advantage
    
    const adjustedHomeGoals = Math.max(0, homeGoals + Math.floor(strengthDiff / 20) + homeAdvantage);
    const adjustedAwayGoals = Math.max(0, awayGoals - Math.floor(strengthDiff / 20));

    const events = [];

    // Generate goal events
    for (let i = 0; i < adjustedHomeGoals; i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const scorer = getRandomPlayer(homeTeam.players, 'FWD');
        events.push({
            type: 'GOAL',
            minute,
            description: `GOAL! ${scorer?.name || 'Player'} scores for ${homeTeam.name}!`,
            playerName: scorer?.name,
            teamId: homeTeam.id
        });
    }

    for (let i = 0; i < adjustedAwayGoals; i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const scorer = getRandomPlayer(awayTeam.players, 'FWD');
        events.push({
            type: 'GOAL',
            minute,
            description: `GOAL! ${scorer?.name || 'Player'} scores for ${awayTeam.name}!`,
            playerName: scorer?.name,
            teamId: awayTeam.id
        });
    }

    // Add some near misses and saves
    const nearMisses = Math.floor(Math.random() * 6);
    for (let i = 0; i < nearMisses; i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const team = Math.random() > 0.5 ? homeTeam : awayTeam;
        const player = getRandomPlayer(team.players, 'FWD');
        events.push({
            type: 'NEAR_MISS',
            minute,
            description: `${player?.name || 'Player'} hits the post!`,
            playerName: player?.name,
            teamId: team.id
        });
    }

    // Sort events by minute
    events.sort((a, b) => a.minute - b.minute);

    return {
        homeGoals: adjustedHomeGoals,
        awayGoals: adjustedAwayGoals,
        events
    };
}

// Fixture Scheduling Endpoints
app.post('/api/fixtures/generate-season', async (req, res) => {
  // Deprecated: FixtureSchedulerService has been retired in favor of CompetitionService
  return res.status(410).json({
    error: 'Endpoint deprecated. Use Competition-based endpoints: POST /api/competitions/:competitionId/fixtures/generate?season=YYYY/YYYY',
  });
});

app.get('/api/fixtures/club/:clubId', async (req, res) => {
  // Deprecated: club-based fixtures via FixtureSchedulerService
  return res.status(410).json({
    error: 'Endpoint deprecated. Use team-based endpoint: GET /api/teams/:teamId/fixtures',
  });
});

app.get('/api/fixtures/next/:clubId', async (req, res) => {
  // Deprecated: club-based next fixture
  return res.status(410).json({
    error: 'Endpoint deprecated. Use team-based endpoint: GET /api/teams/:teamId/fixtures/next',
  });
});

app.post('/api/fixtures/schedule-friendly', async (req, res) => {
  // Deprecated: friendlies via FixtureSchedulerService
  return res.status(410).json({
    error: 'Endpoint deprecated. Friendlies to be reintroduced via CompetitionService (PLAYOFF/FRIENDLY) pipeline',
  });
});

app.delete('/api/fixtures/cancel-friendly/:fixtureId', async (req, res) => {
  // Deprecated
  return res.status(410).json({ error: 'Endpoint deprecated.' });
});

app.get('/api/fixtures/available-weeks/:clubId', async (req, res) => {
  // Deprecated
  return res.status(410).json({ error: 'Endpoint deprecated.' });
});

app.get('/api/fixtures/potential-opponents/:clubId', async (req, res) => {
  // Deprecated
  return res.status(410).json({ error: 'Endpoint deprecated.' });
});

// --- Club History Endpoint ---
app.get('/api/club-history/:clubId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based club history endpoints aligned with the updated schema.'
    });
});

// --- All-Time Goalscorers Endpoint ---
app.get('/api/club-alltime-goalscorers/:clubId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based player statistics endpoints aligned with the updated schema.'
    });
});

// --- All-Time Appearances Endpoint ---
app.get('/api/club-alltime-appearances/:clubId', async (req: Request, res: Response) => {
    return res.status(410).json({
        error: 'Deprecated endpoint',
        message: 'Use competition-based player statistics endpoints aligned with the updated schema.'
    });
});

// --- World Club Cup Endpoints ---
const WORLD_CLUB_CUP_INTERVAL = 4;
const WORLD_CLUB_CUP_HOSTS = [
  'Japan', 'UAE', 'Morocco', 'Qatar', 'China', 'USA', 'Brazil', 'South Africa', 'Australia', 'Spain'
];
const WORLD_CLUB_CUP_REAL_TEAMS = [
  { clubName: 'Real Madrid', country: 'Spain', continent: 'Europe' },
  { clubName: 'Flamengo', country: 'Brazil', continent: 'South America' },
  { clubName: 'Al Ahly', country: 'Egypt', continent: 'Africa' },
  { clubName: 'Al Hilal', country: 'Saudi Arabia', continent: 'Asia' },
  { clubName: 'Auckland City', country: 'New Zealand', continent: 'Oceania' },
  { clubName: 'Monterrey', country: 'Mexico', continent: 'North America' },
  { clubName: 'Al Ahli', country: 'UAE', continent: 'Host' },
];

app.get('/api/world-club-cup/current', async (req, res) => {
  const latest = await prisma.worldClubCup.findFirst({
    orderBy: { year: 'desc' },
    include: { participants: true, fixtures: true }
  });
  res.json(latest);
});

app.get('/api/world-club-cup/history', async (req, res) => {
  const history = await prisma.worldClubCup.findMany({
    orderBy: { year: 'desc' },
    select: { year: true, host: true, champion: true, runnerUp: true }
  });
  res.json(history);
});

app.post('/api/world-club-cup/simulate', async (req, res) => {
  const last = await prisma.worldClubCup.findFirst({ orderBy: { year: 'desc' } });
  const thisYear = new Date().getFullYear();
  let nextYear = thisYear;
  if (last) {
    nextYear = last.year + WORLD_CLUB_CUP_INTERVAL;
    if (thisYear < nextYear) {
      return res.status(400).json({ error: `Next World Club Cup is in ${nextYear}` });
    }
  }
  const host = WORLD_CLUB_CUP_HOSTS[Math.floor((nextYear / WORLD_CLUB_CUP_INTERVAL) % WORLD_CLUB_CUP_HOSTS.length)];
  // Create tournament and participants in one go
  const cup = await prisma.worldClubCup.create({
    data: {
      year: nextYear,
      host,
      participants: { create: WORLD_CLUB_CUP_REAL_TEAMS },
      fixtures: { create: [] }
    },
    include: { participants: true, fixtures: true }
  });
  res.json(cup);
});

// --- Kit Colors Endpoint ---
app.get('/api/match-kit-colors/:homeClubId/:awayClubId', async (req: Request, res: Response) => {
    try {
        const homeClubId = parseInt(req.params.homeClubId);
        const awayClubId = parseInt(req.params.awayClubId);
        
        const kitColors = await KitColorService.getMatchKitColors(homeClubId, awayClubId);
        res.json(kitColors);
    } catch (error) {
        console.error('Error fetching kit colors:', error);
        res.status(500).json({ error: 'Failed to fetch kit colors' });
    }
});

// --- Initialize Kit Colors Endpoint ---
app.post('/api/initialize-kit-colors', async (req: Request, res: Response) => {
    try {
        await KitColorService.initializeAllClubKitColors();
        res.json({ message: 'Kit colors initialized successfully' });
    } catch (error) {
        console.error('Error initializing kit colors:', error);
        res.status(500).json({ error: 'Failed to initialize kit colors' });
    }
});

// --- Hierarchical leagues endpoint ---
app.get('/api/leagues/hierarchical', async (req: Request, res: Response) => {
    try {
        const leagues = await prisma.league.findMany({
            include: { clubs: { include: { parentClub: { select: { id: true, name: true } } } } },
            orderBy: [
                { tier: 'asc' },
                { region: 'asc' },
                { division: 'asc' },
                { name: 'asc' }
            ]
        });

        // Define types for the hierarchical structure
        interface LeagueData {
            id: number;
            name: string;
            tier: string;
            region: string | null;
            division: string | null;
            season: string;
            clubsCount: number;
            type: string;
        }

        interface RegionGroup {
            name: string;
            type: string;
            children: LeagueData[];
        }

        interface CategoryGroup {
            name: string;
            type: string;
            children: (LeagueData | RegionGroup)[];
        }

        // Create hierarchical structure
        const hierarchicalLeagues: { [key: string]: CategoryGroup } = {
            professional: {
                name: "Professional Leagues",
                type: "parent",
                children: []
            },
            derdeDivisie: {
                name: "Derde Divisie",
                type: "parent",
                children: []
            },
            vierdeDivisie: {
                name: "Vierde Divisie",
                type: "parent",
                children: []
            },
            o21Leagues: {
                name: "O21 Leagues",
                type: "parent",
                children: []
            },
            regionalLeagues: {
                name: "Regional Leagues",
                type: "parent",
                children: []
            }
        };

        // Process each league and categorize it
        leagues.forEach(league => {
            const leagueData: LeagueData = {
                id: league.id,
                name: league.name,
                tier: league.tier,
                region: league.region,
                division: league.division,
                season: league.season,
                clubsCount: league.clubs.length,
                type: "league"
            };

            // Categorize based on tier and region
            if (league.tier === 'EREDIVISIE' || league.tier === 'EERSTE_DIVISIE' || league.tier === 'TWEEDE_DIVISIE') {
                hierarchicalLeagues.professional.children.push(leagueData);
            } else if (league.tier === 'DERDE_DIVISIE') {
                hierarchicalLeagues.derdeDivisie.children.push(leagueData);
            } else if (league.tier === 'VIERDE_DIVISIE') {
                hierarchicalLeagues.vierdeDivisie.children.push(leagueData);
            } else if (league.tier.startsWith('O21')) {
                hierarchicalLeagues.o21Leagues.children.push(leagueData);
            } else if (league.tier === 'AMATEUR') {
                // Group regional leagues by region
                const region = league.region || 'Other';
                let regionGroup = hierarchicalLeagues.regionalLeagues.children.find(child => 
                    child.type === "region" && child.name === region
                ) as RegionGroup | undefined;
                
                if (!regionGroup) {
                    regionGroup = {
                        name: region,
                        type: "region",
                        children: []
                    };
                    hierarchicalLeagues.regionalLeagues.children.push(regionGroup);
                }
                
                regionGroup.children.push(leagueData);
            }
        });

        // Convert to array and sort
        const result = Object.values(hierarchicalLeagues).map(category => {
            if (category.children.length > 0) {
                // Sort children by division level (Eerste Klasse first, then Tweede, etc.)
                category.children.sort((a, b) => {
                    const divisionOrder: { [key: string]: number } = {
                        'Eerste Klasse': 1,
                        'Tweede Klasse': 2,
                        'Derde Klasse': 3,
                        'Vierde Klasse': 4,
                        'Vijfde Klasse': 5
                    };
                    
                    // Handle different types of children
                    if (a.type === "league" && b.type === "league") {
                        const aLeague = a as LeagueData;
                        const bLeague = b as LeagueData;
                        const aDivision = aLeague.division;
                        const bDivision = bLeague.division;
                        
                        const aOrder = aDivision ? (divisionOrder[aDivision] || 999) : 999;
                        const bOrder = bDivision ? (divisionOrder[bDivision] || 999) : 999;
                        
                        if (aOrder !== bOrder) return aOrder - bOrder;
                    }
                    
                    // If same division level or different types, sort by name
                    return a.name.localeCompare(b.name);
                });
            }
            return category;
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching hierarchical leagues:', error);
        res.status(500).json({ error: 'Failed to fetch hierarchical leagues' });
    }
});

// Global error handler (must be after all other middleware and routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res.status(500).json({ error: 'An unexpected error occurred.' });
});

// Add this endpoint after other league endpoints
app.get('/api/leagues/all', async (req: Request, res: Response) => {
  try {
    const leagues = await prisma.league.findMany();
    res.json(leagues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

// --- League Structure Endpoint ---
app.get('/api/leagues/structure', async (req: Request, res: Response) => {
  try {
    // 1. National leagues (ordered)
    const nationalLeagues = await prisma.league.findMany({
      where: {
        OR: [
          { name: 'Eredivisie' },
          { name: 'Eerste Divisie' },
          { name: 'Tweede Divisie' },
          { name: { startsWith: 'Derde Divisie' } },
          { name: { startsWith: 'Vierde Divisie' } }
        ]
      },
      orderBy: [
        { name: 'asc' }
      ],
      select: { id: true, name: true, region: true, division: true }
    });

    // 2. Regional leagues (grouped by region, then by division)
    const regionalLeagues = await prisma.league.findMany({
      where: {
        region: {
          in: [
            'West 1', 'West 2', 'Zuid 1', 'Zuid 2', 'Oost', 'Noord',
            'Zaterdag West 1', 'Zaterdag West 2', 'Zaterdag Zuid 1', 'Zaterdag Zuid 2', 'Zaterdag Oost', 'Zaterdag Noord',
            'Zondag West 1', 'Zondag West 2', 'Zondag Zuid 1', 'Zondag Zuid 2', 'Zondag Oost', 'Zondag Noord'
          ]
        }
      },
      orderBy: [
        { region: 'asc' },
        { division: 'asc' },
        { name: 'asc' }
      ],
      select: { id: true, name: true, region: true, division: true }
    });

    // Group regional leagues by region, then by division
    const regionMap: Record<string, Record<string, any[]>> = {};
    for (const league of regionalLeagues) {
      const region = league.region || 'Other';
      const division = league.division || 'Other';
      if (!regionMap[region]) regionMap[region] = {};
      if (!regionMap[region][division]) regionMap[region][division] = [];
      regionMap[region][division].push(league);
    }

    res.json({
      national: nationalLeagues,
      regional: regionMap
    });
  } catch (error) {
    console.error('Failed to fetch league structure:', error);
    res.status(500).json({ error: 'Failed to fetch league structure' });
  }
});

// --- Manager Profile API ---
app.post('/api/manager-profiles', async (req: Request, res: Response) => {
  try {
    const { managerName, clubId } = req.body;
    if (!managerName || !clubId) {
      return res.status(400).json({ error: 'managerName and clubId are required' });
    }
    // Ensure only one profile per club
    const existing = await prisma.managerProfile.findUnique({ where: { clubId: Number(clubId) } });
    if (existing) {
      return res.status(409).json({ error: 'A manager profile already exists for this club.' });
    }
    const profile = await prisma.managerProfile.create({
      data: {
        name: managerName,
        clubId: Number(clubId)
      }
    });
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create manager profile' });
  }
});

// Transfer market endpoints
app.use('/api/transfer-offers', transferOffersRouter);
app.use('/api/jong-team', jongTeamRouter);
app.use('/api/squad-chemistry', squadChemistryRouter);
app.use('/api/tactical-familiarity', tacticalFamiliarityRouter);
app.use('/api/manager-profiles', managerProfileRouter);
app.use('/api/finance', financeRouter);
app.use('/api/game', gameProgressionRouter);
app.use('/api/facility', facilityRouter);
app.use('/api/regulatory', regulatoryRouter);
app.use('/api/football-quotes', footballQuotesRoute);
app.use('/api/live-match-events', liveMatchEventsRouter);
app.use('/api/post-match-analysis', postMatchAnalysisRouter);
app.use('/api/staff-management', staffManagementRouter);
app.use('/api/international-teams', internationalTeamsRouter);
app.use('/api/press-conferences', pressConferencesRouter);
app.use('/api/social-media', socialMediaRouter);

app.use(languageMiddleware);

app.patch('/api/training/staff/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const staff = await prisma.staff.findUnique({ where: { id } });
        if (!staff) return res.status(404).json({ error: 'Staff not found' });
        const updated = await prisma.staff.update({
            where: { id },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update staff' });
    }
});

// PATCH /api/news/:id
app.patch('/api/news/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const allowedFields = ['type', 'headline', 'content', 'isRead'];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }
    const updated = await prisma.newsItem.update({ where: { id }, data: updateData });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news item' });
  }
});

// DELETE /api/news/:id
app.delete('/api/news/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.newsItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news item' });
  }
});

// --- International NationalTeam CRUD Endpoints ---
app.post('/api/international/teams', async (req: Request, res: Response) => {
    try {
        const { name, code, region, ranking, reputation } = req.body;
        if (!name || !code || !region) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const team = await prisma.nationalTeam.create({
            data: { name, code, region, ranking: ranking ?? 100, reputation: reputation ?? 50 }
        });
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create national team' });
    }
});

app.patch('/api/international/teams/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const allowedFields = ['name', 'code', 'region', 'ranking', 'reputation'];
        const updateData: any = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
        }
        const team = await prisma.nationalTeam.update({ where: { id }, data: updateData });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update national team' });
    }
});

app.delete('/api/international/teams/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await prisma.nationalTeam.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete national team' });
    }
});

// --- InternationalCompetition CRUD Endpoints ---
app.post('/api/international/competitions', async (req: Request, res: Response) => {
    try {
        const { name, type, startDate, endDate, status } = req.body;
        if (!name || !type || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const competition = await prisma.internationalCompetition.create({
            data: {
                name,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status ?? 'UPCOMING'
            }
        });
        res.status(201).json(competition);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create international competition' });
    }
});

app.patch('/api/international/competitions/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const allowedFields = ['name', 'type', 'startDate', 'endDate', 'status'];
        const updateData: any = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updateData[key] = key.endsWith('Date') ? new Date(req.body[key]) : req.body[key];
            }
        }
        const competition = await prisma.internationalCompetition.update({ where: { id }, data: updateData });
        res.json(competition);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update international competition' });
    }
});

app.delete('/api/international/competitions/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await prisma.internationalCompetition.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete international competition' });
    }
});

// --- InternationalManager CRUD Endpoints ---
app.post('/api/international/managers', async (req: Request, res: Response) => {
    try {
        const { name, nationality, nationalTeamId, startDate, endDate, isActive, reputation, tactics, formation } = req.body;
        if (!name || !nationality || !nationalTeamId || !startDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const manager = await prisma.internationalManager.create({
            data: {
                name,
                nationality,
                nationalTeamId: Number(nationalTeamId),
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                isActive: isActive ?? true,
                reputation: reputation ?? 50,
                tactics,
                formation
            }
        });
        res.status(201).json(manager);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create international manager' });
    }
});

app.patch('/api/international/managers/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const allowedFields = ['name', 'nationality', 'nationalTeamId', 'startDate', 'endDate', 'isActive', 'reputation', 'tactics', 'formation'];
        const updateData: any = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key.endsWith('Date')) updateData[key] = new Date(req.body[key]);
                else if (key === 'nationalTeamId') updateData[key] = Number(req.body[key]);
                else updateData[key] = req.body[key];
            }
        }
        const manager = await prisma.internationalManager.update({ where: { id }, data: updateData });
        res.json(manager);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update international manager' });
    }
});

app.delete('/api/international/managers/:id', async (req: Request, res: Response, next) => {
    try {
        const id = Number(req.params.id);
        await prisma.internationalManager.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Import error handler
import { errorHandler } from './middleware/errorHandler';

// Error handling middleware (must be after all routes)
app.use(errorHandler);

export default app; 