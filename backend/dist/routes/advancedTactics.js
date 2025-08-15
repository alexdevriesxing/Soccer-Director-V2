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
const advancedTacticsService_1 = __importDefault(require("../services/advancedTacticsService"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- TACTICAL FORMATION MANAGEMENT ---
// POST /api/advanced-tactics/formations
router.post('/formations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, name, formation, style, intensity, width, tempo } = req.body;
        if (!clubId || !name || !formation || !style || intensity === undefined || width === undefined || tempo === undefined) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const tacticalFormation = yield advancedTacticsService_1.default.createTacticalFormation(clubId, name, formation, style, intensity, width, tempo);
        res.status(201).json({ formation: tacticalFormation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_formation', req.language || 'en') });
    }
}));
// GET /api/advanced-tactics/club/:clubId/formation
router.get('/club/:clubId/formation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const formation = yield advancedTacticsService_1.default.getTacticalFormation(clubId);
        if (!formation) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.formation_not_found', req.language || 'en') });
        }
        res.json({ formation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_formation', req.language || 'en') });
    }
}));
// PUT /api/advanced-tactics/formations/:formationId
router.put('/formations/:formationId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formationId = parseInt(req.params.formationId, 10);
        const updates = req.body;
        const formation = yield advancedTacticsService_1.default.updateTacticalFormation(formationId, updates);
        res.json({ formation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_formation', req.language || 'en') });
    }
}));
// DELETE /api/advanced-tactics/formations/:formationId
router.delete('/formations/:formationId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formationId = parseInt(req.params.formationId, 10);
        yield prisma.clubFormation.delete({ where: { id: formationId } });
        res.json({ message: 'Formation deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_delete_formation', req.language || 'en') });
    }
}));
// --- PLAYER ASSIGNMENT ---
// POST /api/advanced-tactics/formations/:formationId/positions/:positionId/assign
router.post('/formations/:formationId/positions/:positionId/assign', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formationId = parseInt(req.params.formationId, 10);
        const positionId = parseInt(req.params.positionId, 10);
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        yield advancedTacticsService_1.default.assignPlayerToPosition(formationId, positionId, playerId);
        res.json({ message: 'Player assigned successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_assign_player', req.language || 'en') });
    }
}));
// POST /api/advanced-tactics/formations/:formationId/positions/:positionId/instructions
router.post('/formations/:formationId/positions/:positionId/instructions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formationId = parseInt(req.params.formationId, 10);
        const positionId = parseInt(req.params.positionId, 10);
        const { type, value, priority } = req.body;
        if (!type || value === undefined || priority === undefined) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const instruction = { type, value, priority };
        yield advancedTacticsService_1.default.addPlayerInstruction(formationId, positionId, instruction);
        res.json({ message: 'Instruction added successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_add_instruction', req.language || 'en') });
    }
}));
// --- TACTICAL ANALYSIS ---
// GET /api/advanced-tactics/club/:clubId/analysis
router.get('/club/:clubId/analysis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analysis = yield advancedTacticsService_1.default.analyzeTacticalFormation(clubId);
        res.json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_analyze_formation', req.language || 'en') });
    }
}));
// GET /api/advanced-tactics/club/:clubId/analysis/strengths
router.get('/club/:clubId/analysis/strengths', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analysis = yield advancedTacticsService_1.default.analyzeTacticalFormation(clubId);
        res.json({ strengths: analysis.strengths });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_analyze_strengths', req.language || 'en') });
    }
}));
// GET /api/advanced-tactics/club/:clubId/analysis/weaknesses
router.get('/club/:clubId/analysis/weaknesses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analysis = yield advancedTacticsService_1.default.analyzeTacticalFormation(clubId);
        res.json({ weaknesses: analysis.weaknesses });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_analyze_weaknesses', req.language || 'en') });
    }
}));
// GET /api/advanced-tactics/club/:clubId/analysis/recommendations
router.get('/club/:clubId/analysis/recommendations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analysis = yield advancedTacticsService_1.default.analyzeTacticalFormation(clubId);
        res.json({ recommendations: analysis.recommendations });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_analyze_recommendations', req.language || 'en') });
    }
}));
// --- MATCH PREPARATION ---
// POST /api/advanced-tactics/club/:clubId/prepare-match
router.post('/club/:clubId/prepare-match', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { opponentId, fixtureId } = req.body;
        if (!opponentId || !fixtureId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const preparation = yield advancedTacticsService_1.default.prepareForMatch(clubId, opponentId, fixtureId);
        res.json({ preparation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_prepare_match', req.language || 'en') });
    }
}));
// GET /api/advanced-tactics/club/:clubId/opponent-analysis/:opponentId
router.get('/club/:clubId/opponent-analysis/:opponentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const opponentId = parseInt(req.params.opponentId, 10);
        const opponent = yield prisma.club.findUnique({ where: { id: opponentId } });
        if (!opponent) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.opponent_not_found', req.language || 'en') });
        }
        const opponentFormation = yield advancedTacticsService_1.default.getTacticalFormation(opponentId);
        const analysis = yield advancedTacticsService_1.default['analyzeOpponent'](opponent, opponentFormation);
        res.json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_analyze_opponent', req.language || 'en') });
    }
}));
// --- FORMATION TEMPLATES ---
// GET /api/advanced-tactics/templates
router.get('/templates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templates = [
            {
                name: '4-3-3 Attacking',
                formation: '4-3-3',
                style: 'possession',
                intensity: 8,
                width: 7,
                tempo: 7,
                description: 'High-pressing, possession-based attacking formation'
            },
            {
                name: '4-4-2 Balanced',
                formation: '4-4-2',
                style: 'balanced',
                intensity: 6,
                width: 6,
                tempo: 6,
                description: 'Traditional balanced formation'
            },
            {
                name: '3-5-2 Defensive',
                formation: '3-5-2',
                style: 'counter-attack',
                intensity: 5,
                width: 8,
                tempo: 5,
                description: 'Defensive formation with wing-backs'
            },
            {
                name: '4-2-3-1 Modern',
                formation: '4-2-3-1',
                style: 'possession',
                intensity: 7,
                width: 6,
                tempo: 7,
                description: 'Modern possession-based formation'
            },
            {
                name: '5-3-2 Ultra Defensive',
                formation: '5-3-2',
                style: 'defensive',
                intensity: 4,
                width: 5,
                tempo: 4,
                description: 'Ultra-defensive formation'
            }
        ];
        res.json({ templates });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_templates', req.language || 'en') });
    }
}));
// POST /api/advanced-tactics/club/:clubId/apply-template
router.post('/club/:clubId/apply-template', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { templateName } = req.body;
        if (!templateName) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const templates = [
            {
                name: '4-3-3 Attacking',
                formation: '4-3-3',
                style: 'possession',
                intensity: 8,
                width: 7,
                tempo: 7
            },
            {
                name: '4-4-2 Balanced',
                formation: '4-4-2',
                style: 'balanced',
                intensity: 6,
                width: 6,
                tempo: 6
            },
            {
                name: '3-5-2 Defensive',
                formation: '3-5-2',
                style: 'counter-attack',
                intensity: 5,
                width: 8,
                tempo: 5
            },
            {
                name: '4-2-3-1 Modern',
                formation: '4-2-3-1',
                style: 'possession',
                intensity: 7,
                width: 6,
                tempo: 7
            },
            {
                name: '5-3-2 Ultra Defensive',
                formation: '5-3-2',
                style: 'defensive',
                intensity: 4,
                width: 5,
                tempo: 4
            }
        ];
        const template = templates.find(t => t.name === templateName);
        if (!template) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.template_not_found', req.language || 'en') });
        }
        // Delete existing formation if any
        const existingFormation = yield prisma.clubFormation.findFirst({ where: { clubId } });
        if (existingFormation) {
            yield prisma.clubFormation.delete({ where: { id: existingFormation.id } });
        }
        const formation = yield advancedTacticsService_1.default.createTacticalFormation(clubId, template.name, template.formation, template.style, template.intensity, template.width, template.tempo);
        res.json({ formation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_apply_template', req.language || 'en') });
    }
}));
// --- TACTICAL FAMILIARITY ---
// GET /api/advanced-tactics/club/:clubId/familiarity
router.get('/club/:clubId/familiarity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const familiarity = yield prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
        res.json({ familiarity: (familiarity === null || familiarity === void 0 ? void 0 : familiarity.familiarity) || 50 });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_familiarity', req.language || 'en') });
    }
}));
// PUT /api/advanced-tactics/club/:clubId/familiarity
router.put('/club/:clubId/familiarity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { familiarity } = req.body;
        if (familiarity === undefined) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const existing = yield prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
        let updated;
        if (existing) {
            updated = yield prisma.tacticalFamiliarity.update({
                where: { id: existing.id },
                data: { familiarity }
            });
        }
        else {
            updated = yield prisma.tacticalFamiliarity.create({
                data: { clubId, familiarity, tactic: 'default' }
            });
        }
        res.json({ familiarity: updated.familiarity });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_familiarity', req.language || 'en') });
    }
}));
// --- SQUAD CHEMISTRY ---
// GET /api/advanced-tactics/club/:clubId/chemistry
router.get('/club/:clubId/chemistry', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const chemistry = yield prisma.squadChemistry.findFirst({ where: { clubId } });
        res.json({ chemistry: (chemistry === null || chemistry === void 0 ? void 0 : chemistry.score) || 50 });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_chemistry', req.language || 'en') });
    }
}));
// PUT /api/advanced-tactics/club/:clubId/chemistry
router.put('/club/:clubId/chemistry', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { score, notes } = req.body;
        if (score === undefined) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const existing = yield prisma.squadChemistry.findFirst({ where: { clubId } });
        let updated;
        if (existing) {
            updated = yield prisma.squadChemistry.update({
                where: { id: existing.id },
                data: { score, notes }
            });
        }
        else {
            updated = yield prisma.squadChemistry.create({
                data: { clubId, score, notes }
            });
        }
        res.json({ chemistry: updated.score });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_chemistry', req.language || 'en') });
    }
}));
// --- SET PIECES ---
// GET /api/advanced-tactics/club/:clubId/set-pieces
router.get('/club/:clubId/set-pieces', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const players = yield prisma.player.findMany({ where: { clubId } });
        const setPieces = {
            corners: {
                takers: players.filter((p) => p.skill > 70).slice(0, 2).map((p) => ({ id: p.id, name: p.name })),
                targets: players.filter((p) => p.position === 'DEF' || p.position === 'FWD').slice(0, 3).map((p) => ({ id: p.id, name: p.name }))
            },
            freeKicks: {
                takers: players.filter((p) => p.skill > 75).slice(0, 2).map((p) => ({ id: p.id, name: p.name }))
            },
            penalties: {
                taker: players.filter((p) => p.skill > 70).sort((a, b) => b.skill - a.skill)[0] || null
            }
        };
        res.json({ setPieces });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_set_pieces', req.language || 'en') });
    }
}));
// --- SUBSTITUTION PLANS ---
// GET /api/advanced-tactics/club/:clubId/substitutions
router.get('/club/:clubId/substitutions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const players = yield prisma.player.findMany({ where: { clubId } });
        const substitutions = {
            tactical: players.filter((p) => p.skill > 65 && !p.injured).slice(0, 3).map((p) => ({ id: p.id, name: p.name, position: p.position })),
            fitness: players.filter((p) => p.age > 30).slice(0, 2).map((p) => ({ id: p.id, name: p.name, position: p.position })),
            impact: players.filter((p) => p.skill > 70 && p.position === 'FWD').slice(0, 2).map((p) => ({ id: p.id, name: p.name, position: p.position }))
        };
        res.json({ substitutions });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_substitutions', req.language || 'en') });
    }
}));
// --- TACTICAL REPORTS ---
// GET /api/advanced-tactics/club/:clubId/report
router.get('/club/:clubId/report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { season = '2024/25' } = req.query;
        const formation = yield advancedTacticsService_1.default.getTacticalFormation(clubId);
        const analysis = formation ? yield advancedTacticsService_1.default.analyzeTacticalFormation(clubId) : null;
        const familiarity = yield prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
        const chemistry = yield prisma.squadChemistry.findFirst({ where: { clubId } });
        const recentFixtures = yield prisma.fixture.findMany({
            where: {
                OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
                played: true
            },
            orderBy: { week: 'desc' },
            take: 10
        });
        const report = {
            season,
            formation: formation ? {
                name: formation.name,
                formation: formation.formation,
                style: formation.style,
                intensity: formation.intensity,
                width: formation.width,
                tempo: formation.tempo
            } : null,
            analysis: analysis ? {
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
                recommendations: analysis.recommendations
            } : null,
            familiarity: (familiarity === null || familiarity === void 0 ? void 0 : familiarity.familiarity) || 50,
            chemistry: (chemistry === null || chemistry === void 0 ? void 0 : chemistry.score) || 50,
            recentPerformance: {
                totalMatches: recentFixtures.length,
                wins: recentFixtures.filter((f) => {
                    const isHome = f.homeClubId === clubId;
                    const goalsScored = isHome ? f.homeGoals : f.awayGoals;
                    const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
                    return goalsScored > goalsConceded;
                }).length,
                draws: recentFixtures.filter((f) => {
                    const isHome = f.homeClubId === clubId;
                    const goalsScored = isHome ? f.homeGoals : f.awayGoals;
                    const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
                    return goalsScored === goalsConceded;
                }).length,
                losses: recentFixtures.filter((f) => {
                    const isHome = f.homeClubId === clubId;
                    const goalsScored = isHome ? f.homeGoals : f.awayGoals;
                    const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
                    return goalsScored < goalsConceded;
                }).length
            }
        };
        res.json({ report });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_generate_report', req.language || 'en') });
    }
}));
exports.default = router;
