import express from 'express';
import GameStateService from '../services/gameStateService';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/game-state
router.get('/game-state', async (req, res) => {
  try {
    const gameStateService = GameStateService.getInstance();
    const gameState = gameStateService.getGameState();
    
    res.json({
      currentWeek: gameState.currentWeek,
      currentSeason: gameState.currentSeason,
      transferWindow: gameState.transferWindow,
      gameDate: gameState.gameDate
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_game_state', (req as any).language || 'en') });
  }
});

// POST /api/game-state/advance-week
router.post('/game-state/advance-week', async (req, res) => {
  try {
    const gameStateService = GameStateService.getInstance();
    await gameStateService.advanceWeek();
    
    const newGameState = gameStateService.getGameState();
    res.json({
      message: 'Week advanced successfully',
      currentWeek: newGameState.currentWeek,
      currentSeason: newGameState.currentSeason,
      transferWindow: newGameState.transferWindow
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_advance_week', (req as any).language || 'en') });
  }
});

// PUT /api/game-state/week
router.put('/game-state/week', async (req, res) => {
  try {
    const { week } = req.body;
    if (!week || typeof week !== 'number') {
      return res.status(400).json({ error: 'Week must be a number' });
    }
    
    const gameStateService = GameStateService.getInstance();
    await gameStateService.setWeek(week);
    
    const gameState = gameStateService.getGameState();
    res.json({
      message: 'Week set successfully',
      currentWeek: gameState.currentWeek
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_set_week', (req as any).language || 'en') });
  }
});

export default router; 