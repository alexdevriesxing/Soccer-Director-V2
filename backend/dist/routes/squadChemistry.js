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
const squadChemistryService_1 = require("../services/squadChemistryService");
const router = express_1.default.Router();
// GET /api/squad-chemistry/:clubId
router.get('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const chemistry = yield squadChemistryService_1.SquadChemistryService.getSquadChemistry(clubId);
        res.json({ chemistry });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch squad chemistry' });
    }
}));
// POST /api/squad-chemistry/:clubId
router.post('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { score, notes } = req.body;
        const chemistry = yield squadChemistryService_1.SquadChemistryService.setSquadChemistry(clubId, score, notes);
        res.json({ chemistry });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to set squad chemistry' });
    }
}));
// POST /api/squad-chemistry/:clubId/calculate
router.post('/:clubId/calculate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { context } = req.body;
        const score = yield squadChemistryService_1.SquadChemistryService.calculateSquadChemistry(clubId, context);
        res.json({ score });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate squad chemistry' });
    }
}));
exports.default = router;
