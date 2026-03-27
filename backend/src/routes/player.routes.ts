import { Router } from 'express';
import {
  getPlayer,
  searchPlayers,
  getPlayerStats,
  updateTrainingFocus
} from '../controllers/player.controller';

const router = Router();

// GET /api/players - Search players with filters
router.get('/', searchPlayers);

// GET /api/players/:id - Get player details
router.get('/:id', getPlayer);

// GET /api/players/:id/stats - Get player statistics
router.get('/:id/stats', getPlayerStats);

// POST /api/players/:id/training - Update player training focus
router.post('/:id/training', updateTrainingFocus);

export default router;
