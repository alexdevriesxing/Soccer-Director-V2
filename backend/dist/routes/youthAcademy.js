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
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- YOUTH SCOUTS ---
// GET /api/youth-scouts
router.get('/youth-scouts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scouts = yield prisma.youthScout.findMany();
        res.json({ scouts });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_youth_scouts', req.language || 'en') });
    }
}));
// POST /api/youth-scout
router.post('/youth-scout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, name, region, ability, network } = req.body;
        if (!clubId || !name || !region || ability == null || network == null)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const scout = yield prisma.youthScout.create({ data: { clubId, name, region, ability, network } });
        res.status(201).json({ scout });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_add_youth_scout', req.language || 'en') });
    }
}));
// PATCH /api/youth-scout/:id
router.patch('/youth-scout/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, region, ability, network } = req.body;
        const scout = yield prisma.youthScout.update({ where: { id }, data: { name, region, ability, network } });
        res.json({ scout });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_youth_scout', req.language || 'en') });
    }
}));
// DELETE /api/youth-scout/:id
router.delete('/youth-scout/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        yield prisma.youthScout.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_youth_scout', req.language || 'en') });
    }
}));
// --- SCOUTING ASSIGNMENTS & REPORTS ---
// POST /api/youth-scout/:id/assignment
router.post('/youth-scout/:id/assignment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scoutId = parseInt(req.params.id, 10);
        const { region, ageGroup, position } = req.body;
        if (!region || !ageGroup || !position)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const assignment = yield prisma.scoutSpecializations.create({ data: { scoutId, region, ageGroup, position, skill: 50 } });
        res.status(201).json({ assignment });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_assignment', req.language || 'en') });
    }
}));
// GET /api/youth-scout/:id/reports
router.get('/youth-scout/:id/reports', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scoutId = parseInt(req.params.id, 10);
        const reports = yield prisma.scoutingReports.findMany({ where: { scoutId }, orderBy: { date: 'desc' } });
        res.json({ reports });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_reports', req.language || 'en') });
    }
}));
// --- YOUTH PROMOTIONS ---
// POST /api/youth/promote
router.post('/youth/promote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerIds, toClubId } = req.body;
        if (!Array.isArray(playerIds) || !toClubId)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        yield prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: toClubId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_promote_youth', req.language || 'en') });
    }
}));
// --- YOUTH TOURNAMENTS ---
// GET /api/youth-tournaments
router.get('/youth-tournaments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tournaments = yield prisma.youthTournaments.findMany({ orderBy: { year: 'desc' } });
        res.json({ tournaments });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_tournaments', req.language || 'en') });
    }
}));
// POST /api/youth-tournament/join
router.post('/youth-tournament/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tournamentId, clubId } = req.body;
        if (!tournamentId || !clubId)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        // This assumes a relation table for participants, which may need to be added to the schema
        // For now, just return success
        res.json({ success: true, message: 'Joined tournament (stub)' });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_join_tournament', req.language || 'en') });
    }
}));
// GET /api/youth-tournament/:id/results
router.get('/youth-tournament/:id/results', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        // This assumes a results table or logic, which may need to be added
        res.json({ results: [], message: 'Results endpoint (stub)' });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_tournament_results', req.language || 'en') });
    }
}));
exports.default = router;
