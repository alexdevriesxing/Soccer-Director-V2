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
// --- SOCIAL MEDIA ---
// GET /api/social-media
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.socialMedia.findMany({
            include: {
                club: true,
                player: true
            },
            orderBy: { date: 'desc' }
        });
        res.json({ posts });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_social_media', req.language || 'en') });
    }
}));
// GET /api/social-media/:postId
router.get('/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = parseInt(req.params.postId, 10);
        const post = yield prisma.socialMedia.findUnique({
            where: { id: postId },
            include: {
                club: true,
                player: true
            }
        });
        if (!post) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.social_media_post_not_found', req.language || 'en') });
        }
        res.json({ post });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_social_media_post', req.language || 'en') });
    }
}));
// POST /api/social-media
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, playerId, platform, content, sentiment } = req.body;
        if (!content || !platform) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const post = yield prisma.socialMedia.create({
            data: {
                clubId,
                playerId,
                platform,
                content,
                sentiment: sentiment || 'Neutral',
                engagement: 0
            },
            include: {
                club: true,
                player: true
            }
        });
        res.status(201).json({ post });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_social_media_post', req.language || 'en') });
    }
}));
// PUT /api/social-media/:postId
router.put('/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = parseInt(req.params.postId, 10);
        const updateData = req.body;
        const post = yield prisma.socialMedia.update({
            where: { id: postId },
            data: updateData,
            include: {
                club: true,
                player: true
            }
        });
        res.json({ post });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_social_media_post', req.language || 'en') });
    }
}));
// DELETE /api/social-media/:postId
router.delete('/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = parseInt(req.params.postId, 10);
        yield prisma.socialMedia.delete({ where: { id: postId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_social_media_post', req.language || 'en') });
    }
}));
exports.default = router;
