"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gameLoopService_1 = __importDefault(require("../services/gameLoopService"));
const gameStateService_1 = __importDefault(require("../services/gameStateService"));
const router = express_1.default.Router();
/**
 * @route GET /api/game/state
 * @description Get the current game state (week, season, transfer window status)
 */
router.get('/state', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameState = gameStateService_1.default.getInstance().getGameState();
        res.json({
            success: true,
            data: {
                currentWeek: gameState.currentWeek,
                currentSeason: gameState.currentSeason,
                transferWindow: gameState.transferWindow,
                gameDate: gameState.gameDate
            }
        });
    }
    catch (error) {
        console.error('Error getting game state:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get game state'
        });
    }
}));
/**
 * @route POST /api/game/advance-week
 * @description Advance the game by one week
 */
router.post('/advance-week', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Process the current week
        yield gameLoopService_1.default.processWeek();
        // Get the updated game state
        const gameState = gameStateService_1.default.getInstance().getGameState();
        res.json({
            success: true,
            message: `Advanced to week ${gameState.currentWeek} of ${gameState.currentSeason}`,
            data: {
                currentWeek: gameState.currentWeek,
                currentSeason: gameState.currentSeason,
                transferWindow: gameState.transferWindow
            }
        });
    }
    catch (error) {
        console.error('Error advancing week:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to advance game week'
        });
    }
}));
/**
 * @route POST /api/game/set-week/:week
 * @description Set the current game week (admin only)
 */
router.post('/set-week/:week', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const week = parseInt(req.params.week);
        if (isNaN(week) || week < 1 || week > 38) {
            return res.status(400).json({
                success: false,
                error: 'Week must be a number between 1 and 38'
            });
        }
        yield gameStateService_1.default.getInstance().setWeek(week);
        // Get the updated game state
        const gameState = gameStateService_1.default.getInstance().getGameState();
        res.json({
            success: true,
            message: `Set game week to ${gameState.currentWeek}`,
            data: {
                currentWeek: gameState.currentWeek,
                currentSeason: gameState.currentSeason,
                transferWindow: gameState.transferWindow
            }
        });
    }
    catch (error) {
        console.error('Error setting game week:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set game week'
        });
    }
}));
exports.default = router;
