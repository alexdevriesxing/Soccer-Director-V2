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
const youthEventService_1 = require("../services/youthEventService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// GET /api/youth-event/list/:clubId
router.get('/list/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const events = yield (0, youthEventService_1.getEventsForClub)(clubId);
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_youth_events', req.language || 'en') });
    }
}));
// POST /api/youth-event/intervene
router.post('/intervene', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, action } = req.body;
        const result = yield (0, youthEventService_1.interveneInEvent)(eventId, action);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_intervene_in_event', req.language || 'en') });
    }
}));
exports.default = router;
