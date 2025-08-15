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
// --- LIVE MATCH EVENTS ---
// GET /api/live-match-events/:fixtureId
router.get('/:fixtureId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId },
            orderBy: { minute: 'asc' },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.json({ events });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_match_events', req.language || 'en') });
    }
}));
// POST /api/live-match-events/:fixtureId
router.post('/:fixtureId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const { type, minute, playerId, clubId, description, varReview, coordinates } = req.body;
        if (!type || minute == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const event = yield prisma.liveMatchEvent.create({
            data: {
                fixtureId,
                type,
                minute,
                playerId,
                clubId,
                description,
                varReview: varReview ? JSON.stringify(varReview) : undefined,
                coordinates: coordinates ? JSON.stringify(coordinates) : undefined
            },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.status(201).json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_match_event', req.language || 'en') });
    }
}));
// PATCH /api/live-match-events/:eventId
router.patch('/:eventId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const updateData = req.body;
        if (updateData.coordinates && typeof updateData.coordinates === 'object') {
            updateData.coordinates = JSON.stringify(updateData.coordinates);
        }
        const event = yield prisma.liveMatchEvent.update({
            where: { id: eventId },
            data: updateData,
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_match_event', req.language || 'en') });
    }
}));
// DELETE /api/live-match-events/:eventId
router.delete('/:eventId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        yield prisma.liveMatchEvent.delete({ where: { id: eventId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_match_event', req.language || 'en') });
    }
}));
// --- VAR REVIEWS ---
// GET /api/live-match-events/:fixtureId/var-reviews
router.get('/:fixtureId/var-reviews', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const varReviews = yield prisma.liveMatchEvent.findMany({
            where: {
                fixtureId,
            },
            orderBy: { minute: 'asc' },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.json({ varReviews });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_var_reviews', req.language || 'en') });
    }
}));
// POST /api/live-match-events/:fixtureId/var-review
router.post('/:fixtureId/var-review', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const { originalEventId, decision, reason, duration, refereeConsultation } = req.body;
        if (!originalEventId || !decision) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // Create VAR review event
        const varEvent = yield prisma.liveMatchEvent.create({
            data: {
                fixtureId,
                type: 'VAR_REVIEW',
                minute: 0, // Will be set based on original event
                description: `VAR Review: ${decision} - ${reason}`,
                varReview: {
                    originalEventId,
                    decision,
                    reason,
                    duration,
                    refereeConsultation
                }
            },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.status(201).json({ varEvent });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_var_review', req.language || 'en') });
    }
}));
// --- WEATHER EVENTS ---
// GET /api/live-match-events/:fixtureId/weather
router.get('/:fixtureId/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const weatherEvents = yield prisma.liveMatchEvent.findMany({
            where: {
                fixtureId,
            },
            orderBy: { minute: 'asc' }
        });
        res.json({ weatherEvents });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_weather_events', req.language || 'en') });
    }
}));
// POST /api/live-match-events/:fixtureId/weather
router.post('/:fixtureId/weather', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const { condition, intensity, minute, description } = req.body;
        if (!condition || minute == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const weatherEvent = yield prisma.liveMatchEvent.create({
            data: {
                fixtureId,
                type: 'WEATHER',
                minute,
                description,
            }
        });
        res.status(201).json({ weatherEvent });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_weather_event', req.language || 'en') });
    }
}));
// --- REFEREE DECISIONS ---
// GET /api/live-match-events/:fixtureId/referee-decisions
router.get('/:fixtureId/referee-decisions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const refereeDecisions = yield prisma.liveMatchEvent.findMany({
            where: {
                fixtureId,
            },
            orderBy: { minute: 'asc' },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.json({ refereeDecisions });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_referee_decisions', req.language || 'en') });
    }
}));
// POST /api/live-match-events/:fixtureId/referee-decision
router.post('/:fixtureId/referee-decision', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const { decision, reason, minute, playerId, clubId, description } = req.body;
        if (!decision || minute == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const refereeEvent = yield prisma.liveMatchEvent.create({
            data: {
                fixtureId,
                type: 'REFEREE_DECISION',
                minute,
                playerId,
                clubId,
                description,
            },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        res.status(201).json({ refereeEvent });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_referee_decision', req.language || 'en') });
    }
}));
// --- MATCH STATISTICS ---
// GET /api/live-match-events/:fixtureId/statistics
router.get('/:fixtureId/statistics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        // Get all events for the fixture
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        // Calculate statistics
        const stats = {
            goals: events.filter((e) => e.type === 'GOAL').length,
            yellowCards: events.filter((e) => e.type === 'YELLOW_CARD').length,
            redCards: events.filter((e) => e.type === 'RED_CARD').length,
            varReviews: events.filter((e) => e.type === 'VAR_REVIEW').length,
            injuries: events.filter((e) => e.type === 'INJURY').length,
            substitutions: events.filter((e) => e.type === 'SUBSTITUTION').length,
            totalXG: events.reduce((sum, e) => sum + (e.xG || 0), 0),
            weatherEvents: events.filter((e) => e.type === 'WEATHER').length
        };
        res.json({ statistics: stats, events });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_match_statistics', req.language || 'en') });
    }
}));
exports.default = router;
