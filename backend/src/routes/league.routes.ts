import { Router } from 'express';
import LeagueController from '../controllers/LeagueController';

const router = Router();
const leagueController = new LeagueController();

// League routes
router.get('/', leagueController.getLeagues.bind(leagueController));
router.get('/:leagueId/table', leagueController.getLeagueTable.bind(leagueController));
router.get('/:leagueId/top-scorers', leagueController.getTopScorers.bind(leagueController));

// Add other league routes here

export default router;
