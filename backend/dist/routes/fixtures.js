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
const matchSimulationService_1 = require("../services/matchSimulationService");
const websocketService_1 = require("../services/websocketService");
const router = express_1.default.Router();
// POST /api/matches/:id/simulate
router.post('/:id/simulate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const result = yield matchSimulationService_1.MatchSimulationService.simulateMatch(fixtureId);
        res.json({ success: true, result });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to simulate match.' });
    }
}));
// POST /api/fixtures/:id/tactical-change
router.post('/:id/tactical-change', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { minute, changeType, description, effectiveness = 0 } = req.body;
        if (!minute || !changeType || !description) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const tacticalChange = yield req.app.get('prisma').realTimeTacticalChanges.create({
            data: {
                fixtureId,
                minute,
                changeType,
                description,
                effectiveness,
            },
        });
        res.json(tacticalChange);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to record tactical change.' });
    }
}));
// GET /api/fixtures/live
router.get('/live', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all currently live matches from the WebSocket service
        const liveMatches = websocketService_1.WebSocketService.getLiveMatches();
        // If no live matches, return empty array
        if (!liveMatches || liveMatches.length === 0) {
            return res.json([]);
        }
        // Get fixture details for each live match
        const prisma = req.app.get('prisma');
        const fixturePromises = liveMatches.map(matchId => prisma.fixture.findUnique({
            where: { id: matchId },
            include: {
                homeClub: true,
                awayClub: true,
                league: true
            }
        }));
        const fixtures = yield Promise.all(fixturePromises);
        // Filter out any null values and add live match status
        const liveFixtures = fixtures
            .filter(fixture => fixture !== null)
            .map(fixture => (Object.assign(Object.assign({}, fixture), { isLive: true, currentMinute: websocketService_1.WebSocketService.getCurrentMinute(fixture.id) || 0, score: {
                home: fixture.homeGoals || 0,
                away: fixture.awayGoals || 0
            } })));
        res.json(liveFixtures);
    }
    catch (error) {
        console.error('Error fetching live matches:', error);
        res.status(500).json({ error: 'Failed to fetch live matches.' });
    }
}));
// GET /api/fixtures/:id/analysis
router.get('/:id/analysis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const analysis = yield req.app.get('MatchSimulationService').getMatchAnalysis(fixtureId);
        if (!analysis)
            return res.status(404).json({ error: 'No analysis found for this fixture.' });
        res.json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch match analysis.' });
    }
}));
exports.default = router;
