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
const youthScoutingService_1 = require("../services/youthScoutingService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// POST /api/youth-scouting/assign
router.post('/assign', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, name, region, ability, network } = req.body;
        const scout = yield (0, youthScoutingService_1.assignScout)(clubId, name, region, ability, network);
        res.json(scout);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_assign_scout', req.language || 'en') });
    }
}));
// GET /api/youth-scouting/scouts/:clubId
router.get('/scouts/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const scouts = yield (0, youthScoutingService_1.getScouts)(clubId);
        res.json(scouts);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_scouts', req.language || 'en') });
    }
}));
// GET /api/youth-scouting/reports/:clubId
router.get('/reports/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const reports = yield (0, youthScoutingService_1.generateScoutingReport)(clubId);
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_scouting_reports', req.language || 'en') });
    }
}));
exports.default = router;
