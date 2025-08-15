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
const youthDevelopmentService_1 = __importDefault(require("../services/youthDevelopmentService"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- YOUTH ACADEMY MANAGEMENT ---
// POST /api/youth-development/academy
router.post('/academy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, level = 1 } = req.body;
        if (!clubId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const academy = yield youthDevelopmentService_1.default.createYouthAcademy(clubId, level);
        res.status(201).json({ academy });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_academy', req.language || 'en') });
    }
}));
// GET /api/youth-development/club/:clubId/academy
router.get('/club/:clubId/academy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const academy = yield youthDevelopmentService_1.default.getYouthAcademy(clubId);
        if (!academy) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.academy_not_found', req.language || 'en') });
        }
        res.json({ academy });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_academy', req.language || 'en') });
    }
}));
// PUT /api/youth-development/club/:clubId/academy/upgrade
router.put('/club/:clubId/academy/upgrade', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const academy = yield youthDevelopmentService_1.default.upgradeYouthAcademy(clubId);
        res.json({ academy });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_upgrade_academy', req.language || 'en') });
    }
}));
// --- YOUTH PLAYER MANAGEMENT ---
// POST /api/youth-development/club/:clubId/intake
router.post('/club/:clubId/intake', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { count = 5 } = req.body;
        const players = yield youthDevelopmentService_1.default.generateYouthIntake(clubId, count);
        res.status(201).json({ players });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_generate_intake', req.language || 'en') });
    }
}));
// GET /api/youth-development/club/:clubId/players
router.get('/club/:clubId/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { age = 21, developmentPath } = req.query;
        const where = {
            clubId,
            age: { lte: parseInt(age, 10) }
        };
        if (developmentPath) {
            where.developmentPath = developmentPath;
        }
        const players = yield prisma.player.findMany({
            where,
            orderBy: { skill: 'desc' }
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_players', req.language || 'en') });
    }
}));
// POST /api/youth-development/players/:playerId/mentor
router.post('/players/:playerId/mentor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const { mentorId } = req.body;
        if (!mentorId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        yield youthDevelopmentService_1.default.assignMentor(playerId, mentorId);
        res.json({ message: 'Mentor assigned successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_assign_mentor', req.language || 'en') });
    }
}));
// POST /api/youth-development/players/:playerId/promote
router.post('/players/:playerId/promote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const { clubId } = req.body;
        if (!clubId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        yield youthDevelopmentService_1.default.promoteYouthPlayer(playerId, clubId);
        res.json({ message: 'Player promoted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_promote_player', req.language || 'en') });
    }
}));
// POST /api/youth-development/club/:clubId/development
router.post('/club/:clubId/development', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const results = yield youthDevelopmentService_1.default.processYouthDevelopment(clubId);
        res.json({ results });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_process_development', req.language || 'en') });
    }
}));
// --- YOUTH TOURNAMENTS ---
// POST /api/youth-development/tournaments
router.post('/tournaments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, ageGroup, participants, startDate, endDate } = req.body;
        if (!name || !participants || !startDate || !endDate) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // Ensure participants is an array of numbers
        const participantIds = Array.isArray(participants) ? participants.map(Number) : [];
        const tournament = yield youthDevelopmentService_1.default.createYouthTournament(name, participantIds, new Date(startDate), new Date(endDate));
        res.status(201).json({ tournament });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_tournament', req.language || 'en') });
    }
}));
// GET /api/youth-development/club/:clubId/tournaments
router.get('/club/:clubId/tournaments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const tournaments = yield youthDevelopmentService_1.default.getYouthTournaments(clubId);
        res.json({ tournaments });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_tournaments', req.language || 'en') });
    }
}));
// PUT /api/youth-development/tournaments/:tournamentId/status
router.put('/tournaments/:tournamentId/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tournamentId = parseInt(req.params.tournamentId, 10);
        const { status, results } = req.body;
        if (!status) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const updated = yield prisma.youthTournaments.update({
            where: { id: tournamentId },
            data: {
            // results: results ? JSON.stringify(results) : undefined // Remove, not in schema
            }
        });
        res.json({ tournament: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_tournament', req.language || 'en') });
    }
}));
// --- SCOUTING NETWORK ---
// POST /api/youth-development/club/:clubId/scouting
router.post('/club/:clubId/scouting', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { regions } = req.body;
        if (!regions || !Array.isArray(regions)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const network = yield youthDevelopmentService_1.default.createScoutingNetwork(clubId, regions);
        res.status(201).json({ network });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_scouting', req.language || 'en') });
    }
}));
// GET /api/youth-development/club/:clubId/scouting
router.get('/club/:clubId/scouting', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const network = yield youthDevelopmentService_1.default.getScoutingNetwork(clubId);
        res.json({ network });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_scouting', req.language || 'en') });
    }
}));
// POST /api/youth-development/club/:clubId/scouting/discover
router.post('/club/:clubId/scouting/discover', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const discoveredPlayers = yield youthDevelopmentService_1.default.scoutForYouthPlayers(clubId);
        res.json({ discoveredPlayers });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_discover_players', req.language || 'en') });
    }
}));
// PUT /api/youth-development/scouts/:scoutId
router.put('/scouts/:scoutId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scoutId = parseInt(req.params.scoutId, 10);
        const { name, region, ability, network } = req.body;
        const updated = yield prisma.youthScout.update({
            where: { id: scoutId },
            data: { name, region, ability, network }
        });
        res.json({ scout: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_scout', req.language || 'en') });
    }
}));
// DELETE /api/youth-development/scouts/:scoutId
router.delete('/scouts/:scoutId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scoutId = parseInt(req.params.scoutId, 10);
        yield prisma.youthScout.delete({ where: { id: scoutId } });
        res.json({ message: 'Scout removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_remove_scout', req.language || 'en') });
    }
}));
// --- YOUTH DEVELOPMENT ANALYTICS ---
// GET /api/youth-development/club/:clubId/analytics
router.get('/club/:clubId/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analytics = yield youthDevelopmentService_1.default.getYouthDevelopmentAnalytics(clubId);
        res.json({ analytics });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_analytics', req.language || 'en') });
    }
}));
// GET /api/youth-development/club/:clubId/players/ready-for-promotion
router.get('/club/:clubId/players/ready-for-promotion', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const players = yield prisma.player.findMany({
            where: {
                clubId,
                age: { gte: 18, lte: 21 },
                skill: { gte: 70 },
                developmentPath: { in: ['youth_academy', 'scouted'] }
            },
            orderBy: { skill: 'desc' }
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_ready_players', req.language || 'en') });
    }
}));
// GET /api/youth-development/club/:clubId/players/needs-attention
router.get('/club/:clubId/players/needs-attention', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const players = yield prisma.player.findMany({
            where: {
                clubId,
                age: { gte: 19, lte: 21 },
                skill: { lt: 50 },
                developmentPath: { in: ['youth_academy', 'scouted'] }
            },
            orderBy: { skill: 'asc' }
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_attention_players', req.language || 'en') });
    }
}));
// --- YOUTH DEVELOPMENT PROGRAMS ---
// POST /api/youth-development/club/:clubId/programs
// router.post('/club/:clubId/programs', async (req, res) => {
//   // Feature not supported: 'developmentPrograms' does not exist in schema
//   return res.status(501).json({ error: 'Development programs are not supported in the current schema.' });
// });
// GET /api/youth-development/club/:clubId/programs
// router.get('/club/:clubId/programs', async (req, res) => {
//   // Feature not supported: 'developmentPrograms' does not exist in schema
//   return res.status(501).json({ error: 'Development programs are not supported in the current schema.' });
// });
// POST /api/youth-development/players/:playerId/program
router.post('/players/:playerId/program', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const { programId } = req.body;
        if (!programId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // Apply program benefits to player
        const player = yield prisma.player.findUnique({ where: { id: playerId } });
        if (!player) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        // Simple program effect - increase skill and morale
        yield prisma.player.update({
            where: { id: playerId },
            data: {
                skill: { increment: 2 },
                morale: { increment: 5 }
            }
        });
        res.json({ message: 'Program applied successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_apply_program', req.language || 'en') });
    }
}));
// --- YOUTH DEVELOPMENT REPORTS ---
// GET /api/youth-development/club/:clubId/report
router.get('/club/:clubId/report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { season = '2024/25' } = req.query;
        const academy = yield youthDevelopmentService_1.default.getYouthAcademy(clubId);
        const network = yield youthDevelopmentService_1.default.getScoutingNetwork(clubId);
        const analytics = yield youthDevelopmentService_1.default.getYouthDevelopmentAnalytics(clubId);
        const youthPlayers = yield prisma.player.findMany({
            where: {
                clubId,
                age: { lte: 21 },
                OR: [
                    { developmentPath: 'youth_academy' },
                    { developmentPath: 'scouted' }
                ]
            },
            orderBy: { skill: 'desc' }
        });
        const youthPlayersSafe = youthPlayers || [];
        const report = {
            season,
            academy: academy ? {
                level: academy.level,
                facilities: academy.facilities,
                coaches: academy.coaches.length,
                currentIntake: academy.currentIntake.length
            } : null,
            scouting: network ? {
                scouts: network.scouts.length,
                regions: network.regions,
                coverage: network.coverage,
                efficiency: network.efficiency,
                totalDiscoveries: ((_a = network === null || network === void 0 ? void 0 : network.scouts) === null || _a === void 0 ? void 0 : _a.reduce((sum, s) => sum + s.discoveries, 0)) || 0
            } : null,
            players: {
                total: youthPlayersSafe.length,
                byAge: {
                    '15-17': youthPlayersSafe.filter((p) => p.age >= 15 && p.age <= 17).length,
                    '18-19': youthPlayersSafe.filter((p) => p.age >= 18 && p.age <= 19).length,
                    '20-21': youthPlayersSafe.filter((p) => p.age >= 20 && p.age <= 21).length
                },
                byPosition: {
                    GK: youthPlayersSafe.filter((p) => p.position === 'GK').length,
                    DEF: youthPlayersSafe.filter((p) => p.position === 'DEF').length,
                    MID: youthPlayersSafe.filter((p) => p.position === 'MID').length,
                    FWD: youthPlayersSafe.filter((p) => p.position === 'FWD').length
                },
                byPotential: {
                    high: youthPlayersSafe.filter((p) => p.potential >= 80).length,
                    medium: youthPlayersSafe.filter((p) => p.potential >= 70 && p.potential < 80).length,
                    low: youthPlayersSafe.filter((p) => p.potential < 70).length
                },
                withMentors: youthPlayersSafe.filter((p) => p.mentorId).length
            },
            development: {
                averageImprovement: youthPlayersSafe.reduce((sum, p) => sum + (p.improvementRate || 0), 0) / (youthPlayersSafe.length || 1),
                readyForPromotion: youthPlayersSafe.filter((p) => p.skill >= 70 && p.age >= 18).length,
                needsAttention: youthPlayersSafe.filter((p) => p.skill < 50 && p.age >= 19).length
            },
            recommendations: generateYouthRecommendations(academy || {}, network || {}, youthPlayersSafe)
        };
        res.json({ report });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_generate_report', req.language || 'en') });
    }
}));
// Generate youth development recommendations
function generateYouthRecommendations(academy, network, players) {
    const recommendations = [];
    if (!academy) {
        recommendations.push('Consider establishing a youth academy to develop young talent');
    }
    else if (academy.level < 3) {
        recommendations.push('Upgrade youth academy to improve player development');
    }
    if (!network) {
        recommendations.push('Establish a scouting network to discover young talent');
    }
    else if (network.scouts.length < 3) {
        recommendations.push('Expand scouting network to cover more regions');
    }
    const readyForPromotion = players.filter((p) => p.skill >= 70 && p.age >= 18).length;
    if (readyForPromotion > 0) {
        recommendations.push(`Consider promoting ${readyForPromotion} player(s) to the first team`);
    }
    const needsAttention = players.filter((p) => p.skill < 50 && p.age >= 19).length;
    if (needsAttention > 0) {
        recommendations.push(`${needsAttention} player(s) need special attention or may need to be released`);
    }
    const withMentors = players.filter((p) => p.mentorId).length;
    const totalPlayers = players.length;
    if (withMentors < totalPlayers * 0.5) {
        recommendations.push('Assign mentors to more youth players to improve development');
    }
    return recommendations;
}
exports.default = router;
