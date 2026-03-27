import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit';

// Import route handlers
import leaguesRouter from '../routes/leagues';
import clubsRouter from '../routes/clubs';
import playersRouter from '../routes/players';
import fixturesRouter from '../routes/fixtures';
import transferMarketRouter from '../routes/transferMarket';
import jongTeamRouter from '../routes/jongTeam';
import financeRouter from '../routes/finance';
import staffRouter from '../routes/staffManagement';
import internationalRouter from '../routes/internationalTeams';
import newsRouter from '../routes/news';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// API routes
router.use('/api/leagues', leaguesRouter);
router.use('/api/clubs', clubsRouter);
router.use('/api/players', playersRouter);
router.use('/api/fixtures', fixturesRouter);
router.use('/api/transfer-market', transferMarketRouter);
router.use('/api/jong-teams', jongTeamRouter);
router.use('/api/finance', financeRouter);
router.use('/api/staff', staffRouter);
router.use('/api/international', internationalRouter);
router.use('/api/news', newsRouter);

export default router;
