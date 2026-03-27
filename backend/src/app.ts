import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initWebSocketService } from './services/websocketService';
import logger from './utils/logger';
import { LiveMatchService } from './services/liveMatchService';

// Route Imports
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
import playerRoutes from './routes/player.routes';
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
import gameRouter from './routes/game';
import jongTeamRouter from './routes/jongTeam';
import squadChemistryRouter from './routes/squadChemistry';
import tacticalFamiliarityRouter from './routes/tacticalFamiliarity';
import managerProfileRouter from './routes/managerProfile';
import facilityRouter from './routes/facility';
import regulatoryRouter from './routes/regulatory';
import footballQuotesRoute from './routes/footballQuotes';
import liveMatchEventsRouter from './routes/liveMatchEvents';
import postMatchAnalysisRouter from './routes/postMatchAnalysis';
import internationalTeamsRouter from './routes/internationalTeams';
import pressConferencesRouter from './routes/pressConferences';
import socialMediaRouter from './routes/socialMedia';
import playerContractsRouter from './routes/playerContracts';
import playerMoraleRouter from './routes/playerMorale';
import advancedMatchEngineRouter from './routes/advancedMatchEngine';
import fanDynamicsRouter from './routes/fanDynamics';
import advancedFinanceRouter from './routes/advancedFinance';
import advancedTacticsRouter from './routes/advancedTactics';
import mentoringRouter from './routes/mentoring';
import v2Router from './v2/routes';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Prisma client
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket service
initWebSocketService(httpServer);

// Initialize Socket.io
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

    // Inject io into LiveMatchService if not already set (or set it globally below)
    LiveMatchService.setSocketIO(io);

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });

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

    socket.on('controlMatch', async ({ fixtureId, action }: { fixtureId: number, action: 'start' | 'pause' | 'reset' }) => {
        try {
            // let matchState; // This variable was declared but not used after assignment in the 'reset' case.
            if (action === 'start') LiveMatchService.startMatch(fixtureId);
            else if (action === 'pause') LiveMatchService.pauseMatch(fixtureId);
            else if (action === 'reset') await LiveMatchService.initializeMatch(fixtureId);

            const updatedState = LiveMatchService.getMatchState(fixtureId);
            if (updatedState) io.to(`match:${fixtureId}`).emit('matchState', updatedState);
        } catch (error) {
            logger.error(`Error controlling match ${fixtureId}:`, error);
            socket.emit('error', { message: `Failed to ${action} match` });
        }
    });
});

// Middleware
app.set('trust proxy', 1);
app.set('etag', false);
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    credentials: true,
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Rate limiting
const apiRateLimitDisabled = process.env.DISABLE_API_RATE_LIMIT === 'true';
const apiRateLimitWindowMs = Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const apiRateLimitMax = Number(
    process.env.API_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 100 : 5000)
);

if (!apiRateLimitDisabled) {
    const apiLimiter = rateLimit({
        windowMs: apiRateLimitWindowMs,
        max: apiRateLimitMax,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    });
    app.use('/api/', apiLimiter);
}

// Routes
app.use('/api/leagues', leaguesRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/players', playersRouter); // General players route
app.use('/api/fixtures', fixturesRouter);
app.use('/api/match-management', matchManagementRouter);
app.use('/api/transfer-market', transferMarketRouter);
app.use('/api/youth-development', youthDevelopmentRouter);
app.use('/api/finance', financeRouter);
app.use('/api/staff-management', staffManagementRouter);
app.use('/api/fan', fanRouter);
app.use('/api/news', newsRouter);
app.use('/api/boardroom', boardroomRouter);
app.use('/api/youth-competition', youthCompetitionRouter);
app.use('/api/youth-intake', youthIntakeRouter);
app.use('/api/youth-event', youthEventRouter);
app.use('/api/youth-news', youthNewsRouter);
app.use('/api/player-trait', playerTraitRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/test/errors', errorTestRouter);
app.use('/api/competitions', competitionsRouter);
app.use('/api/player-routes', playerRoutes); // Renamed to avoid collision if necessary, or check path
app.use('/api/player-media-event', playerMediaEventRouter);
app.use('/api/player-injury', playerInjuryRouter);
app.use('/api/player-habit', playerHabitRouter);
app.use('/api/youth-scouting', youthScoutingRouter);
app.use('/api/player-relationship', playerRelationshipRouter);
app.use('/api/player-personal-story', playerPersonalStoryRouter);
app.use('/api/club-tactics', clubTacticsRouter);
app.use('/api/opponent-analysis', opponentAnalysisRouter);
app.use('/api/squad-registration', squadRegistrationRouter);
app.use('/api/game-progression', gameProgressionRouter);
app.use('/api/league', gameRouter); // Kept as /api/league for compatibility with test-game-features if needed
app.use('/api/jong-team', jongTeamRouter);
app.use('/api/squad-chemistry', squadChemistryRouter);
app.use('/api/tactical-familiarity', tacticalFamiliarityRouter);
app.use('/api/manager-profile', managerProfileRouter);
app.use('/api/facility', facilityRouter);
app.use('/api/regulatory', regulatoryRouter);
app.use('/api/football-quotes', footballQuotesRoute);
app.use('/api/live-match-events', liveMatchEventsRouter);
app.use('/api/post-match-analysis', postMatchAnalysisRouter);
app.use('/api/international-teams', internationalTeamsRouter);
app.use('/api/press-conferences', pressConferencesRouter);
app.use('/api/social-media', socialMediaRouter);
app.use('/api/player-contracts', playerContractsRouter);
app.use('/api/player-morale', playerMoraleRouter);
app.use('/api/advanced-match', advancedMatchEngineRouter);
app.use('/api/fan-dynamics', fanDynamicsRouter);
app.use('/api/advanced-finance', advancedFinanceRouter);
app.use('/api/advanced-tactics', advancedTacticsRouter);
app.use('/api/mentoring', mentoringRouter);
app.use('/api/v2', v2Router);

// Health check
app.get('/api/health', (_req: any, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/health', (_req: any, res: Response) => {
    res.json({ status: 'ok' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (_req: any, res: Response) => {
        res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
    });
}

// 404 handler
app.use((_req: any, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(_err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

export { app, httpServer };
