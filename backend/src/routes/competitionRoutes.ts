import { Router } from 'express';
import { competitionController } from '../controllers/competitionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', competitionController.getActiveCompetitions);
router.get('/:competitionId', competitionController.getCompetition);
router.get('/:competitionId/table', competitionController.getLeagueTable);
router.get('/:competitionId/fixtures', competitionController.getFixtures);

// Protected routes (require authentication)
router.post('/:competitionId/fixtures/generate', authenticateToken, competitionController.generateFixtures);

export default router;
