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
// --- PRESS CONFERENCES ---
// GET /api/press-conferences/:clubId
router.get('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const conferences = yield prisma.pressConferences.findMany({
            where: { clubId },
            include: {
                club: true,
                manager: true
            },
            orderBy: { date: 'desc' }
        });
        res.json({ conferences });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_press_conferences', req.language || 'en') });
    }
}));
// GET /api/press-conferences/:clubId/:conferenceId
router.get('/:clubId/:conferenceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conferenceId = parseInt(req.params.conferenceId, 10);
        const conference = yield prisma.pressConferences.findUnique({
            where: { id: conferenceId },
            include: {
                club: true,
                manager: true
            }
        });
        if (!conference) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.press_conference_not_found', req.language || 'en') });
        }
        res.json({ conference });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_press_conference', req.language || 'en') });
    }
}));
// POST /api/press-conferences/:clubId
router.post('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { managerId, topic, mood, mediaReaction, fanReaction } = req.body;
        if (!topic || !mood) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const conference = yield prisma.pressConferences.create({
            data: {
                clubId,
                managerId: managerId || null,
                topic,
                mood,
                mediaReaction: mediaReaction || 'Neutral',
                fanReaction: fanReaction || 'Neutral'
            },
            include: {
                club: true,
                manager: true
            }
        });
        res.status(201).json({ conference });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_press_conference', req.language || 'en') });
    }
}));
// PUT /api/press-conferences/:conferenceId
router.put('/:conferenceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conferenceId = parseInt(req.params.conferenceId, 10);
        const updateData = req.body;
        const conference = yield prisma.pressConferences.update({
            where: { id: conferenceId },
            data: updateData,
            include: {
                club: true,
                manager: true
            }
        });
        res.json({ conference });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_press_conference', req.language || 'en') });
    }
}));
// DELETE /api/press-conferences/:conferenceId
router.delete('/:conferenceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conferenceId = parseInt(req.params.conferenceId, 10);
        yield prisma.pressConferences.delete({ where: { id: conferenceId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_press_conference', req.language || 'en') });
    }
}));
// --- PRESS CONFERENCE ANALYTICS ---
// GET /api/press-conferences/:clubId/analytics
router.get('/:clubId/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const conferences = yield prisma.pressConferences.findMany({
            where: { clubId },
            include: {
                club: true,
                manager: true
            },
            orderBy: { date: 'desc' }
        });
        const analytics = {
            totalConferences: conferences.length,
            averageMood: conferences.reduce((sum, c) => sum + (c.mood === 'Confident' ? 1 : 0), 0) / conferences.length || 0,
            mediaReactionDistribution: conferences.reduce((acc, c) => {
                acc[c.mediaReaction] = (acc[c.mediaReaction] || 0) + 1;
                return acc;
            }, {}),
            fanReactionDistribution: conferences.reduce((acc, c) => {
                acc[c.fanReaction] = (acc[c.fanReaction] || 0) + 1;
                return acc;
            }, {}),
            topicDistribution: conferences.reduce((acc, c) => {
                acc[c.topic] = (acc[c.topic] || 0) + 1;
                return acc;
            }, {})
        };
        res.json({ analytics });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_press_conference_analytics', req.language || 'en') });
    }
}));
exports.default = router;
