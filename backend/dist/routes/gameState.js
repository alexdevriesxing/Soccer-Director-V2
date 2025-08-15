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
const gameStateService_1 = __importDefault(require("../services/gameStateService"));
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// GET /api/game-state
router.get('/game-state', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameStateService = gameStateService_1.default.getInstance();
        const gameState = gameStateService.getGameState();
        res.json({
            currentWeek: gameState.currentWeek,
            currentSeason: gameState.currentSeason,
            transferWindow: gameState.transferWindow,
            gameDate: gameState.gameDate
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_game_state', req.language || 'en') });
    }
}));
// POST /api/game-state/advance-week
router.post('/game-state/advance-week', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameStateService = gameStateService_1.default.getInstance();
        yield gameStateService.advanceWeek();
        const newGameState = gameStateService.getGameState();
        res.json({
            message: 'Week advanced successfully',
            currentWeek: newGameState.currentWeek,
            currentSeason: newGameState.currentSeason,
            transferWindow: newGameState.transferWindow
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_advance_week', req.language || 'en') });
    }
}));
// PUT /api/game-state/week
router.put('/game-state/week', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { week } = req.body;
        if (!week || typeof week !== 'number') {
            return res.status(400).json({ error: 'Week must be a number' });
        }
        const gameStateService = gameStateService_1.default.getInstance();
        yield gameStateService.setWeek(week);
        const gameState = gameStateService.getGameState();
        res.json({
            message: 'Week set successfully',
            currentWeek: gameState.currentWeek
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_set_week', req.language || 'en') });
    }
}));
exports.default = router;
