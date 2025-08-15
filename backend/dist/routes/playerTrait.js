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
const playerTraitService_1 = require("../services/playerTraitService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// POST /api/player-trait
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, trait } = req.body;
        const result = yield (0, playerTraitService_1.assignTrait)(playerId, trait);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_assign_trait', req.language || 'en') });
    }
}));
// PATCH /api/player-trait/:id/reveal
router.patch('/:id/reveal', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const result = yield (0, playerTraitService_1.revealTrait)(id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_reveal_trait', req.language || 'en') });
    }
}));
// GET /api/player-trait/:playerId
router.get('/:playerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const traits = yield (0, playerTraitService_1.getTraitsForPlayer)(playerId);
        res.json(traits);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_traits', req.language || 'en') });
    }
}));
exports.default = router;
