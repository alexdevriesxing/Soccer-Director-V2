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
const tacticalFamiliarityService_1 = require("../services/tacticalFamiliarityService");
const router = express_1.default.Router();
// GET /api/tactical-familiarity/:clubId/:tactic
router.get('/:clubId/:tactic', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const tactic = req.params.tactic;
        const familiarity = yield tacticalFamiliarityService_1.TacticalFamiliarityService.getTacticalFamiliarity(clubId, tactic);
        res.json({ familiarity });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tactical familiarity' });
    }
}));
// POST /api/tactical-familiarity/:clubId/:tactic
router.post('/:clubId/:tactic', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const tactic = req.params.tactic;
        const { familiarity, notes } = req.body;
        const result = yield tacticalFamiliarityService_1.TacticalFamiliarityService.setTacticalFamiliarity(clubId, tactic, familiarity, notes);
        res.json({ familiarity: result });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to set tactical familiarity' });
    }
}));
// POST /api/tactical-familiarity/:clubId/:tactic/calculate
router.post('/:clubId/:tactic/calculate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const tactic = req.params.tactic;
        const { context } = req.body;
        const familiarity = yield tacticalFamiliarityService_1.TacticalFamiliarityService.calculateTacticalFamiliarity(clubId, tactic, context);
        res.json({ familiarity });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate tactical familiarity' });
    }
}));
exports.default = router;
