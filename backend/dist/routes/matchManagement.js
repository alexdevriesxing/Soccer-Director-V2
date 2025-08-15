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
// --- SUBSTITUTIONS ---
// POST /api/fixtures/:id/substitute
router.post('/fixtures/:id/substitute', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { outPlayerId, inPlayerId, minute } = req.body;
        if (!outPlayerId || !inPlayerId || minute == null)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const event = yield prisma.matchEvent.create({ data: { fixtureId, type: 'substitution', minute, description: `Substitution: ${outPlayerId} out, ${inPlayerId} in`, playerName: null } });
        res.status(201).json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_substitute', req.language || 'en') });
    }
}));
// GET /api/fixtures/:id/substitutions
router.get('/fixtures/:id/substitutions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const subs = yield prisma.matchEvent.findMany({ where: { fixtureId, type: 'substitution' }, orderBy: { minute: 'asc' } });
        res.json({ substitutions: subs });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_substitutions', req.language || 'en') });
    }
}));
// --- TACTICAL TWEAKS ---
// PATCH /api/fixtures/:id/tactics
router.patch('/fixtures/:id/tactics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { clubId, formation, style, intensity, width, tempo, strategy } = req.body;
        if (!clubId || (!formation && !strategy))
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        let updatedFormation = null;
        let updatedStrategy = null;
        if (formation) {
            const existing = yield prisma.clubFormation.findFirst({ where: { clubId } });
            if (existing) {
                updatedFormation = yield prisma.clubFormation.update({ where: { id: existing.id }, data: { formation, style, intensity, width, tempo } });
            }
            else {
                if (!style || intensity == null || width == null || tempo == null) {
                    return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
                }
                updatedFormation = yield prisma.clubFormation.create({ data: { clubId, formation, style, intensity, width, tempo } });
            }
        }
        if (strategy) {
            const existing = yield prisma.clubStrategy.findFirst({ where: { clubId } });
            if (existing) {
                updatedStrategy = yield prisma.clubStrategy.update({ where: { id: existing.id }, data: Object.assign({}, strategy) });
            }
            else {
                updatedStrategy = yield prisma.clubStrategy.create({ data: Object.assign({ clubId }, strategy) });
            }
        }
        // Optionally log a match event
        yield prisma.matchEvent.create({ data: { fixtureId, type: 'tactical', minute: req.body.minute || 0, description: 'Tactical tweak', playerName: null } });
        res.json({ formation: updatedFormation, strategy: updatedStrategy });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_tactics', req.language || 'en') });
    }
}));
// --- SHOUTS / MANAGER INTERVENTIONS ---
// POST /api/fixtures/:id/shout
router.post('/fixtures/:id/shout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { message, minute } = req.body;
        if (!message || minute == null)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const event = yield prisma.matchEvent.create({ data: { fixtureId, type: 'shout', minute, description: message, playerName: null } });
        res.status(201).json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_send_shout', req.language || 'en') });
    }
}));
// --- MATCH EVENTS ---
// GET /api/fixtures/:id/events
router.get('/fixtures/:id/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const events = yield prisma.matchEvent.findMany({ where: { fixtureId }, orderBy: { minute: 'asc' } });
        res.json({ events });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_events', req.language || 'en') });
    }
}));
// POST /api/fixtures/:id/event
router.post('/fixtures/:id/event', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { type, minute, description, playerName } = req.body;
        if (!type || minute == null || !description)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const event = yield prisma.matchEvent.create({ data: { fixtureId, type, minute, description, playerName } });
        res.status(201).json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_event', req.language || 'en') });
    }
}));
// --- VAR DECISIONS ---
// GET /api/fixtures/:id/var-decisions
router.get('/fixtures/:id/var-decisions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const decisions = yield prisma.vARDecisions.findMany({ where: { fixtureId }, orderBy: { minute: 'asc' } });
        res.json({ decisions });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_var_decisions', req.language || 'en') });
    }
}));
// POST /api/fixtures/:id/var-decision
router.post('/fixtures/:id/var-decision', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { minute, decision, overturned, controversy, description } = req.body;
        if (!minute || !decision)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const varDecision = yield prisma.vARDecisions.create({ data: { fixtureId, minute, decision, overturned: !!overturned, controversy: controversy || 0, description } });
        res.status(201).json({ varDecision });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_var_decision', req.language || 'en') });
    }
}));
// --- WEATHER ---
// GET /api/fixtures/:id/weather
router.get('/fixtures/:id/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const weather = yield prisma.weather.findUnique({ where: { fixtureId } });
        res.json({ weather });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_weather', req.language || 'en') });
    }
}));
// POST /api/fixtures/:id/weather
router.post('/fixtures/:id/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { temperature, humidity, windSpeed, windDirection, precipitation, visibility } = req.body;
        if (temperature == null || humidity == null || windSpeed == null || !windDirection || precipitation == null || visibility == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        let weather = yield prisma.weather.findUnique({ where: { fixtureId } });
        if (weather) {
            weather = yield prisma.weather.update({ where: { fixtureId }, data: { temperature, humidity, windSpeed, windDirection, precipitation, visibility } });
        }
        else {
            weather = yield prisma.weather.create({ data: { fixtureId, temperature, humidity, windSpeed, windDirection, precipitation, visibility } });
        }
        res.status(201).json({ weather });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_set_weather', req.language || 'en') });
    }
}));
// --- REFEREE DECISIONS ---
// GET /api/fixtures/:id/referee-decisions
router.get('/fixtures/:id/referee-decisions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const events = yield prisma.matchEvent.findMany({ where: { fixtureId, type: { in: ['yellow_card', 'red_card', 'penalty'] } }, orderBy: { minute: 'asc' } });
        res.json({ refereeDecisions: events });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_referee_decisions', req.language || 'en') });
    }
}));
// POST /api/fixtures/:id/referee-decision
router.post('/fixtures/:id/referee-decision', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const { type, minute, description, playerName, clubId } = req.body;
        if (!type || minute == null)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const event = yield prisma.matchEvent.create({ data: { fixtureId, type, minute, description, playerName, clubId } });
        res.status(201).json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_referee_decision', req.language || 'en') });
    }
}));
// --- POST-MATCH ANALYSIS ---
// GET /api/fixtures/:id/post-match-analysis
router.get('/fixtures/:id/post-match-analysis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.id, 10);
        const fixture = yield prisma.fixture.findUnique({ where: { id: fixtureId } });
        if (!fixture)
            return res.status(404).json({ error: (0, i18n_1.t)('error.fixture_not_found', req.language || 'en') });
        // xG (stub)
        const xG = { home: Math.random() * 3, away: Math.random() * 3 };
        // Heatmaps (stub)
        const heatmaps = { home: [], away: [] };
        // Player ratings (simple: goals + assists - cards)
        const events = yield prisma.matchEvent.findMany({ where: { fixtureId } });
        const playerStats = {};
        events.forEach(ev => {
            if (!ev.playerName)
                return;
            if (!playerStats[ev.playerName])
                playerStats[ev.playerName] = { goals: 0, assists: 0, yellow: 0, red: 0 };
            if (ev.type === 'GOAL')
                playerStats[ev.playerName].goals++;
            if (ev.type === 'ASSIST')
                playerStats[ev.playerName].assists++;
            if (ev.type === 'yellow_card')
                playerStats[ev.playerName].yellow++;
            if (ev.type === 'red_card')
                playerStats[ev.playerName].red++;
        });
        const playerRatings = Object.entries(playerStats).map(([playerName, stats]) => ({
            playerName,
            rating: 6 + stats.goals * 1.5 + stats.assists - stats.yellow * 0.5 - stats.red * 1.5
        }));
        // Summary stats
        const summary = {
            homeGoals: fixture.homeGoals,
            awayGoals: fixture.awayGoals,
            attendance: fixture.attendance
        };
        res.json({ xG, heatmaps, playerRatings, summary });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_post_match_analysis', req.language || 'en') });
    }
}));
exports.default = router;
