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
const clubService_1 = require("../services/clubService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// GET /api/club/:clubId/academy-reputation
router.get('/:clubId/academy-reputation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const reputation = yield clubService_1.ClubService.getAcademyReputation(clubId);
        res.json({ reputation });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_academy_reputation', req.language || 'en') });
    }
}));
// POST /api/club/:clubId/academy-reputation
router.post('/:clubId/academy-reputation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { change } = req.body;
        const reputation = yield clubService_1.ClubService.updateAcademyReputation(clubId, change);
        res.json({ reputation });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_academy_reputation', req.language || 'en') });
    }
}));
exports.default = router;
