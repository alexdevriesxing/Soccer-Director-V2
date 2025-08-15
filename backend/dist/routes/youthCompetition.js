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
const youthCompetitionService_1 = require("../services/youthCompetitionService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// GET /api/youth-competition/list/:clubId
router.get('/list/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const competitions = yield (0, youthCompetitionService_1.listCompetitions)(clubId);
        res.json(competitions);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_list_competitions', req.language || 'en') });
    }
}));
// POST /api/youth-competition/enter
router.post('/enter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, competitionId } = req.body;
        const result = yield (0, youthCompetitionService_1.enterCompetition)(clubId, competitionId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_enter_competition', req.language || 'en') });
    }
}));
// GET /api/youth-competition/results/:competitionId
router.get('/results/:competitionId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const competitionId = parseInt(req.params.competitionId, 10);
        const results = yield (0, youthCompetitionService_1.getCompetitionResults)(competitionId);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_competition_results', req.language || 'en') });
    }
}));
exports.default = router;
