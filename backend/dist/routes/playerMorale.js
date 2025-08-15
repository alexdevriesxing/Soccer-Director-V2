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
const client_1 = require("@prisma/client");
const i18n_1 = require("../utils/i18n");
const playerMoraleService_1 = __importDefault(require("../services/playerMoraleService"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- PLAYER MORALE ---
// GET /api/player-morale/player/:playerId/calculate
router.get('/player/:playerId/calculate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const morale = yield playerMoraleService_1.default.calculatePlayerMorale(playerId);
        res.json({ playerId, morale });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_morale', req.language || 'en') });
    }
}));
// GET /api/player-morale/club/:clubId/stats
router.get('/club/:clubId/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const stats = yield playerMoraleService_1.default.getClubMoraleStats(clubId);
        res.json({ stats });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_morale_stats', req.language || 'en') });
    }
}));
// POST /api/player-morale/club/:clubId/update-all
router.post('/club/:clubId/update-all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const result = yield playerMoraleService_1.default.updateClubMorale(clubId);
        res.json({ message: 'Club morale updated successfully', result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_morale', req.language || 'en') });
    }
}));
// GET /api/player-morale/club/:clubId/at-risk
router.get('/club/:clubId/at-risk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const atRisk = yield playerMoraleService_1.default.getPlayersAtRisk(clubId);
        res.json({ atRisk });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_at_risk_players', req.language || 'en') });
    }
}));
// --- PLAYER REQUESTS ---
// POST /api/player-morale/requests
router.post('/requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, type, priority, description, demands } = req.body;
        if (!playerId || !type || !priority || !description) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const request = yield playerMoraleService_1.default.createPlayerRequest({
            playerId,
            type,
            priority,
            description,
            demands: demands || {},
            status: 'pending',
            createdAt: new Date()
        });
        res.status(201).json({ request });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_request', req.language || 'en') });
    }
}));
// GET /api/player-morale/club/:clubId/requests
router.get('/club/:clubId/requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { status, priority } = req.query;
        let requests = yield playerMoraleService_1.default.getClubRequests(clubId);
        if (status) {
            requests = requests.filter((r) => r.status === status);
        }
        if (priority) {
            requests = requests.filter((r) => r.priority === priority);
        }
        res.json({ requests });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_requests', req.language || 'en') });
    }
}));
// GET /api/player-morale/player/:playerId/requests
router.get('/player/:playerId/requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const requests = yield playerMoraleService_1.default.getPlayerRequests(playerId);
        res.json({ requests });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_player_requests', req.language || 'en') });
    }
}));
// POST /api/player-morale/requests/:requestId/respond
router.post('/requests/:requestId/respond', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestId = parseInt(req.params.requestId, 10);
        const { response, details } = req.body;
        if (!response || !['accepted', 'rejected', 'negotiating'].includes(response)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.invalid_response', req.language || 'en') });
        }
        const updatedRequest = yield playerMoraleService_1.default.respondToRequest(requestId, response, details);
        res.json({ request: updatedRequest, message: `Request ${response}` });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_respond_to_request', req.language || 'en') });
    }
}));
// POST /api/player-morale/club/:clubId/trigger-automatic-requests
router.post('/club/:clubId/trigger-automatic-requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const requests = yield playerMoraleService_1.default.triggerAutomaticRequests(clubId);
        res.json({ message: 'Automatic requests triggered', requests });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_trigger_requests', req.language || 'en') });
    }
}));
// --- REQUEST ANALYTICS ---
// GET /api/player-morale/club/:clubId/request-analytics
router.get('/club/:clubId/request-analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { startDate, endDate } = req.query;
        const where = { player: { clubId } };
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const requests = yield prisma.playerRequest.findMany({
            where,
            include: { player: true },
            orderBy: { createdAt: 'desc' }
        });
        const analytics = {
            totalRequests: requests.length,
            byType: requests.reduce((acc, req) => {
                acc[req.type] = (acc[req.type] || 0) + 1;
                return acc;
            }, {}),
            byPriority: requests.reduce((acc, req) => {
                acc[req.priority] = (acc[req.priority] || 0) + 1;
                return acc;
            }, {}),
            byStatus: requests.reduce((acc, req) => {
                acc[req.status] = (acc[req.status] || 0) + 1;
                return acc;
            }, {}),
            averageResponseTime: requests
                .filter((r) => r.resolvedAt)
                .reduce((sum, r) => {
                return sum + (r.resolvedAt.getTime() - r.createdAt.getTime());
            }, 0) / requests.filter((r) => r.resolvedAt).length || 0
        };
        res.json({ analytics });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_request_analytics', req.language || 'en') });
    }
}));
// --- MORALE FACTORS ANALYSIS ---
// GET /api/player-morale/player/:playerId/factors
router.get('/player/:playerId/factors', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const player = yield prisma.player.findUnique({
            where: { id: playerId },
            include: {
                club: {
                    include: {
                        finances: { orderBy: { season: 'desc' }, take: 1 },
                        facilities: true
                    }
                }
            }
        });
        if (!player) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        // Calculate individual factors (simplified version)
        const clubPlayers = yield prisma.player.findMany({ where: { clubId: player.clubId } });
        const avgWage = clubPlayers.reduce((sum, p) => sum + (p.wage || 0), 0) / clubPlayers.length;
        const factors = {
            playtime: 75, // Simplified - would need actual appearance data
            wage: Math.min(100, Math.max(0, 50 + ((player.wage || 0) / avgWage - 1) * 50)),
            teamPerformance: 70, // Simplified - would need actual team stats
            individualPerformance: Math.min(100, player.skill + (player.morale || 0) * 0.1),
            contractStatus: Math.max(0, Math.min(100, (player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24) / 3.65)),
            managerRelationship: 70 + (player.personality === 'PROFESSIONAL' ? 20 : 0),
            facilities: ((_a = player.club) === null || _a === void 0 ? void 0 : _a.facilities) && player.club.facilities.length > 0 ?
                Math.min(100, player.club.facilities.reduce((sum, f) => sum + (f.level || 0), 0) * 10) : 50,
            location: 80
        };
        res.json({ factors });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_morale_factors', req.language || 'en') });
    }
}));
// --- MORALE TRENDS ---
// GET /api/player-morale/club/:clubId/trends
router.get('/club/:clubId/trends', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { weeks = 10 } = req.query;
        const players = yield prisma.player.findMany({ where: { clubId } });
        const trends = [];
        for (let week = 0; week < parseInt(weeks, 10); week++) {
            const weekDate = new Date(Date.now() - week * 7 * 24 * 60 * 60 * 1000);
            // Simplified trend calculation - in reality would use historical morale data
            const avgMorale = players.reduce((sum, p) => sum + (p.morale || 50), 0) / players.length;
            trends.push({
                week: week + 1,
                date: weekDate,
                averageMorale: avgMorale + (Math.random() - 0.5) * 10, // Add some variation
                unhappyPlayers: players.filter((p) => (p.morale || 50) < 50).length,
                happyPlayers: players.filter((p) => (p.morale || 50) >= 70).length
            });
        }
        res.json({ trends: trends.reverse() });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_morale_trends', req.language || 'en') });
    }
}));
// --- MORALE COMPARISONS ---
// GET /api/player-morale/club/:clubId/comparisons
router.get('/club/:clubId/comparisons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const players = yield prisma.player.findMany({ where: { clubId } });
        const comparisons = {
            byPosition: players.reduce((acc, p) => {
                if (!acc[p.position])
                    acc[p.position] = { count: 0, totalMorale: 0 };
                acc[p.position].count++;
                acc[p.position].totalMorale += p.morale || 50;
                return acc;
            }, {}),
            byAge: players.reduce((acc, p) => {
                const ageGroup = p.age < 23 ? 'young' : p.age < 28 ? 'prime' : p.age < 32 ? 'experienced' : 'veteran';
                if (!acc[ageGroup])
                    acc[ageGroup] = { count: 0, totalMorale: 0 };
                acc[ageGroup].count++;
                acc[ageGroup].totalMorale += p.morale || 50;
                return acc;
            }, {}),
            bySkill: players.reduce((acc, p) => {
                const skillGroup = p.skill < 60 ? 'low' : p.skill < 75 ? 'medium' : p.skill < 85 ? 'high' : 'elite';
                if (!acc[skillGroup])
                    acc[skillGroup] = { count: 0, totalMorale: 0 };
                acc[skillGroup].count++;
                acc[skillGroup].totalMorale += p.morale || 50;
                return acc;
            }, {})
        };
        // Calculate averages
        for (const category of Object.values(comparisons)) {
            for (const group of Object.values(category)) {
                group.averageMorale = group.count > 0 ?
                    Math.round(group.totalMorale / group.count) : 0;
            }
        }
        res.json({ comparisons });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_morale_comparisons', req.language || 'en') });
    }
}));
// --- MORALE PREDICTIONS ---
// POST /api/player-morale/club/:clubId/predict-morale
router.post('/club/:clubId/predict-morale', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { weeks = 4 } = req.body;
        const players = yield prisma.player.findMany({ where: { clubId } });
        const predictions = [];
        for (const player of players) {
            const currentMorale = player.morale || 50;
            const playerPredictions = [];
            for (let week = 1; week <= weeks; week++) {
                // Simple prediction model based on current factors
                let predictedMorale = currentMorale;
                // Contract expiry impact
                const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry < 90) {
                    predictedMorale -= (90 - daysUntilExpiry) * 0.5;
                }
                // Age impact
                if (player.age > 30) {
                    predictedMorale -= (player.age - 30) * 0.3;
                }
                // Skill vs wage balance
                const clubPlayers = yield prisma.player.findMany({ where: { clubId } });
                const avgWage = clubPlayers.reduce((sum, p) => sum + (p.wage || 0), 0) / clubPlayers.length;
                const wageRatio = avgWage > 0 ? (player.wage || 0) / avgWage : 1;
                if (wageRatio < 0.7) {
                    predictedMorale -= 10;
                }
                predictedMorale = Math.max(0, Math.min(100, predictedMorale));
                playerPredictions.push({
                    week,
                    predictedMorale: Math.round(predictedMorale)
                });
            }
            predictions.push({
                playerId: player.id,
                playerName: player.name,
                currentMorale,
                predictions: playerPredictions
            });
        }
        res.json({ predictions });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_predict_morale', req.language || 'en') });
    }
}));
exports.default = router;
