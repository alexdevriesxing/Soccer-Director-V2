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
const i18n_1 = require("../utils/i18n");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// --- INTERNATIONAL TEAMS ---
// GET /api/international-teams
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield prisma.nationalTeam.findMany({
            include: {
                players: { include: { player: true } },
                managers: true
            },
            orderBy: { name: 'asc' }
        });
        res.json({ teams });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_international_teams', req.language || 'en') });
    }
}));
// GET /api/international-teams/:teamId
router.get('/:teamId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = parseInt(req.params.teamId, 10);
        const team = yield prisma.nationalTeam.findUnique({
            where: { id: teamId },
            include: {
                players: { include: { player: true } },
                managers: true,
                homeMatches: true,
                awayMatches: true
            }
        });
        if (!team) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.international_team_not_found', req.language || 'en') });
        }
        res.json({ team });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_international_team', req.language || 'en') });
    }
}));
// POST /api/international-teams
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, region, ranking, reputation } = req.body;
        if (!name || !code) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const team = yield prisma.nationalTeam.create({
            data: {
                name,
                code,
                region: region || 'Europe',
                reputation: reputation || 50,
                ranking: ranking || 100
            },
            include: {
                players: { include: { player: true } },
                managers: true
            }
        });
        res.status(201).json({ team });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_international_team', req.language || 'en') });
    }
}));
// PUT /api/international-teams/:teamId
router.put('/:teamId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = parseInt(req.params.teamId, 10);
        const updateData = req.body;
        const team = yield prisma.nationalTeam.update({
            where: { id: teamId },
            data: updateData,
            include: {
                players: { include: { player: true } },
                managers: true
            }
        });
        res.json({ team });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_international_team', req.language || 'en') });
    }
}));
// --- INTERNATIONAL PLAYERS ---
// GET /api/international-teams/:teamId/players
router.get('/:teamId/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = parseInt(req.params.teamId, 10);
        const players = yield prisma.internationalPlayer.findMany({
            where: { nationalTeamId: teamId },
            include: {
                player: { include: { club: true } },
                nationalTeam: true
            },
            orderBy: { caps: 'desc' }
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_international_players', req.language || 'en') });
    }
}));
// POST /api/international-teams/:teamId/player
router.post('/:teamId/player', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = parseInt(req.params.teamId, 10);
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const internationalPlayer = yield prisma.internationalPlayer.create({
            data: {
                playerId,
                nationalTeamId: teamId,
                caps: 0,
                goals: 0,
                isActive: true
            },
            include: {
                player: { include: { club: true } },
                nationalTeam: true
            }
        });
        res.status(201).json({ player: internationalPlayer });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_add_international_player', req.language || 'en') });
    }
}));
// --- INTERNATIONAL BREAKS ---
// GET /api/international-breaks
router.get('/breaks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const breaks = yield prisma.internationalBreaks.findMany({
            orderBy: { startDate: 'asc' }
        });
        res.json({ breaks });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_international_breaks', req.language || 'en') });
    }
}));
// POST /api/international-breaks
router.post('/breaks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, competition, year, description } = req.body;
        if (!startDate || !endDate || !competition || !year) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const breakPeriod = yield prisma.internationalBreaks.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                competition,
                year: parseInt(year, 10),
                description: description || 'International Break'
            }
        });
        res.status(201).json({ break: breakPeriod });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_international_break', req.language || 'en') });
    }
}));
// --- INTERNATIONAL COMPETITIONS ---
// GET /api/international-competitions
router.get('/competitions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const competitions = yield prisma.internationalCompetition.findMany({
            include: {
                matches: true,
                teams: true
            },
            orderBy: { startDate: 'desc' }
        });
        res.json({ competitions });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_international_competitions', req.language || 'en') });
    }
}));
// POST /api/international-competitions
router.post('/competitions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, startDate, endDate } = req.body;
        if (!name || !type || !startDate || !endDate) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const competition = yield prisma.internationalCompetition.create({
            data: {
                name,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: 'UPCOMING'
            },
            include: {
                matches: true,
                teams: true
            }
        });
        res.status(201).json({ competition });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_international_competition', req.language || 'en') });
    }
}));
exports.default = router;
