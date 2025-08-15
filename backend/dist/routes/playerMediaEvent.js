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
const playerMediaEventService_1 = require("../services/playerMediaEventService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// POST /api/player-media-event
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, type, headline, content } = req.body;
        const result = yield (0, playerMediaEventService_1.createMediaEvent)(playerId, type, headline, content);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_media_event', req.language || 'en') });
    }
}));
// PATCH /api/player-media-event/:id
router.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { headline, content } = req.body;
        const result = yield (0, playerMediaEventService_1.updateMediaEvent)(id, { headline, content });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_media_event', req.language || 'en') });
    }
}));
// GET /api/player-media-event/:playerId
router.get('/:playerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const events = yield (0, playerMediaEventService_1.getMediaEventsForPlayer)(playerId);
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_media_events', req.language || 'en') });
    }
}));
exports.default = router;
