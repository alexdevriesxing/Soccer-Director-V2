import express from 'express';
import GameLoopService from '../services/gameLoopService';
import GameStateService from '../services/gameStateService';

const router = express.Router();

/**
 * @route GET /api/game/state
 * @description Get the current game state (week, season, transfer window status)
 */
router.get('/state', async (req, res) => {
  try {
    const gameState = GameStateService.getInstance().getGameState();
    res.json({
      success: true,
      data: {
        currentWeek: gameState.currentWeek,
        currentSeason: gameState.currentSeason,
        transferWindow: gameState.transferWindow,
        gameDate: gameState.gameDate
      }
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    });
  }
});

/**
 * @route POST /api/game/advance-week
 * @description Advance the game by one week
 */
router.post('/advance-week', async (req, res) => {
  try {
    // Process the current week
    await GameLoopService.processWeek();
    
    // Get the updated game state
    const gameState = GameStateService.getInstance().getGameState();
    
    res.json({
      success: true,
      message: `Advanced to week ${gameState.currentWeek} of ${gameState.currentSeason}`,
      data: {
        currentWeek: gameState.currentWeek,
        currentSeason: gameState.currentSeason,
        transferWindow: gameState.transferWindow
      }
    });
  } catch (error) {
    console.error('Error advancing week:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to advance game week'
    });
  }
});

/**
 * @route POST /api/game/set-week/:week
 * @description Set the current game week (admin only)
 */
router.post('/set-week/:week', async (req, res) => {
  try {
    const week = parseInt(req.params.week);
    
    if (isNaN(week) || week < 1 || week > 38) {
      return res.status(400).json({
        success: false,
        error: 'Week must be a number between 1 and 38'
      });
    }
    
    await GameStateService.getInstance().setWeek(week);
    
    // Get the updated game state
    const gameState = GameStateService.getInstance().getGameState();
    
    res.json({
      success: true,
      message: `Set game week to ${gameState.currentWeek}`,
      data: {
        currentWeek: gameState.currentWeek,
        currentSeason: gameState.currentSeason,
        transferWindow: gameState.transferWindow
      }
    });
  } catch (error) {
    console.error('Error setting game week:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set game week'
    });
  }
});

export default router;
