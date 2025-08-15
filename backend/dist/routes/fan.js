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
const fanService_1 = require("../services/fanService");
const router = express_1.default.Router();
// GET /api/fan/groups/:clubId
router.get('/groups/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const groups = yield fanService_1.FanService.getFanGroups(clubId);
        res.json({ groups });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_fan_groups') });
    }
}));
// GET /api/fan/events/:fanGroupId
router.get('/events/:fanGroupId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fanGroupId = parseInt(req.params.fanGroupId, 10);
        const events = yield fanService_1.FanService.getFanEvents(fanGroupId);
        res.json({ events });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_fan_events') });
    }
}));
// GET /api/fan/sentiment/:fanGroupId
router.get('/sentiment/:fanGroupId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fanGroupId = parseInt(req.params.fanGroupId, 10);
        const sentiment = yield fanService_1.FanService.getFanSentiments(fanGroupId);
        res.json({ sentiment });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_fan_sentiment') });
    }
}));
// POST /api/fan/event
router.post('/event', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fanGroupId, type, description, date } = req.body;
        const event = yield fanService_1.FanService.createFanEvent({ fanGroupId, type, description, date });
        res.json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_fan_event') });
    }
}));
// POST /api/fan/protest
router.post('/protest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fanGroupId, description, date } = req.body;
        const event = yield fanService_1.FanService.triggerFanEvent(fanGroupId, 'protest', description, date ? new Date(date) : new Date());
        res.json({ event });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_fan_protest') });
    }
}));
exports.default = router;
