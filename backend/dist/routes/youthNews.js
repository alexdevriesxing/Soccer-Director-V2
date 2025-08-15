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
const youthNewsService_1 = require("../services/youthNewsService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// POST /api/youth-news
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, clubId, type, headline, content } = req.body;
        const news = yield (0, youthNewsService_1.createNews)({ playerId, clubId, type, headline, content });
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_news', req.language || 'en') });
    }
}));
// GET /api/youth-news/player/:playerId
router.get('/player/:playerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const news = yield (0, youthNewsService_1.getNewsForPlayer)(playerId);
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_player_news', req.language || 'en') });
    }
}));
// GET /api/youth-news/club/:clubId
router.get('/club/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const news = yield (0, youthNewsService_1.getNewsForClub)(clubId);
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_club_news', req.language || 'en') });
    }
}));
// GET /api/youth-news/search
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, keyword } = req.query;
        const news = yield (0, youthNewsService_1.searchNews)({ type: type, keyword: keyword });
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_search_news', req.language || 'en') });
    }
}));
exports.default = router;
