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
const client_1 = require("@prisma/client");
const i18n_1 = require("../utils/i18n");
const clubTacticsService_1 = require("./clubTacticsService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- CLUB TACTICS & FORMATIONS ---
// GET /:id/tactics
router.get('/:id/tactics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const result = yield clubTacticsService_1.ClubTacticsService.getTactics(clubId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_tactics', req.language || 'en') });
    }
}));
// PATCH /:id/tactics
router.patch('/:id/tactics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const result = yield clubTacticsService_1.ClubTacticsService.updateTactics(clubId, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_tactics', req.language || 'en') });
    }
}));
// --- SET PIECE SPECIALISTS ---
// GET /:id/set-piece-specialists
router.get('/:id/set-piece-specialists', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const specialists = yield clubTacticsService_1.ClubTacticsService.getSetPieceSpecialists(clubId);
        res.json({ specialists });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_set_piece_specialists', req.language || 'en') });
    }
}));
// POST /:id/set-piece-specialist
router.post('/:id/set-piece-specialist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { playerId, type, skill, successRate, attempts, goals } = req.body;
        if (!playerId || !type || skill == null)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        try {
            const specialist = yield clubTacticsService_1.ClubTacticsService.addSetPieceSpecialist(clubId, { playerId, type, skill, successRate, attempts, goals });
            res.status(201).json({ specialist });
        }
        catch (err) {
            if (err instanceof clubTacticsService_1.ValidationError)
                return res.status(400).json({ error: err.message });
            if (err instanceof clubTacticsService_1.DuplicateError)
                return res.status(409).json({ error: err.message });
            if (err instanceof clubTacticsService_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            throw err;
        }
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_add_set_piece_specialist', req.language || 'en') });
    }
}));
// PATCH /api/set-piece-specialist/:id
router.patch('/set-piece-specialist/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { skill } = req.body;
        if (skill == null)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        try {
            const specialist = yield clubTacticsService_1.ClubTacticsService.updateSetPieceSpecialist(id, { skill });
            res.json({ specialist });
        }
        catch (err) {
            if (err instanceof clubTacticsService_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            if (err instanceof clubTacticsService_1.ValidationError)
                return res.status(400).json({ error: err.message });
            throw err;
        }
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_set_piece_specialist', req.language || 'en') });
    }
}));
// DELETE /api/set-piece-specialist/:id
router.delete('/set-piece-specialist/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        try {
            yield clubTacticsService_1.ClubTacticsService.deleteSetPieceSpecialist(id);
            res.json({ success: true });
        }
        catch (err) {
            if (err instanceof clubTacticsService_1.NotFoundError)
                return res.status(404).json({ error: err.message });
            throw err;
        }
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_set_piece_specialist', req.language || 'en') });
    }
}));
exports.default = router;
