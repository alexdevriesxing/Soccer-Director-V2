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
const youthIntakeService_1 = require("../services/youthIntakeService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// POST /api/youth-intake/trigger
router.post('/trigger', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, type, year } = req.body;
        const event = yield (0, youthIntakeService_1.triggerIntakeEvent)(clubId, type, year);
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_trigger_intake_event', req.language || 'en') });
    }
}));
// GET /api/youth-intake/history/:clubId
router.get('/history/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const history = yield (0, youthIntakeService_1.getIntakeHistory)(clubId);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_intake_history', req.language || 'en') });
    }
}));
exports.default = router;
