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
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- SQUAD REGISTRATION ---
// POST /api/squad-registration
router.post('/squad-registration', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, season, competition, registeredPlayers } = req.body;
        if (!clubId || !season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // TODO: Add eligibility checks here
        const registration = yield prisma.squadRegistration.create({
            data: { clubId, season, competition, registeredPlayers },
        });
        res.status(201).json(registration);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_register_squad', req.language || 'en') });
    }
}));
// PATCH /api/squad-registration/:id
router.patch('/squad-registration/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { registeredPlayers } = req.body;
        if (!registeredPlayers || !Array.isArray(registeredPlayers)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // TODO: Add eligibility checks here
        const updated = yield prisma.squadRegistration.update({ where: { id }, data: { registeredPlayers } });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_registration', req.language || 'en') });
    }
}));
// GET /api/squad-registration/:id
router.get('/squad-registration/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const registration = yield prisma.squadRegistration.findUnique({ where: { id } });
        if (!registration)
            return res.status(404).json({ error: (0, i18n_1.t)('error.squad_registration_not_found', req.language || 'en') });
        res.json(registration);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_registration', req.language || 'en') });
    }
}));
// GET /api/squad-registration/:id/validate
router.get('/squad-registration/:id/validate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const registration = yield prisma.squadRegistration.findUnique({ where: { id } });
        if (!registration)
            return res.status(404).json({ error: (0, i18n_1.t)('error.squad_registration_not_found', req.language || 'en') });
        // Example rules (should be dynamic per competition)
        const rules = {
            maxPlayers: 25,
            maxOverage: 3,
            maxForeign: 5,
            minHomegrown: 8,
            ageLimit: 21,
        };
        // Validate registeredPlayers (assume array of player IDs)
        const playerIds = registration.registeredPlayers;
        const players = yield prisma.player.findMany({ where: { id: { in: playerIds } } });
        const overage = players.filter(p => p.age > rules.ageLimit).length;
        const foreign = players.filter(p => p.nationality !== 'Netherlands').length;
        // TODO: Add homegrown logic
        const errors = [];
        if (playerIds.length > rules.maxPlayers)
            errors.push('Too many players');
        if (overage > rules.maxOverage)
            errors.push('Too many overage players');
        if (foreign > rules.maxForeign)
            errors.push('Too many foreign players');
        // TODO: Check minHomegrown
        res.json({ valid: errors.length === 0, errors });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_validate_registration', req.language || 'en') });
    }
}));
// GET /api/squad-registration/rules/:competition
router.get('/squad-registration/rules/:competition', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { competition } = req.params;
        // Example rules (should be dynamic per competition)
        const rules = {
            maxPlayers: 25,
            maxOverage: 3,
            maxForeign: 5,
            minHomegrown: 8,
            ageLimit: 21,
        };
        res.json(rules);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_registration_rules', req.language || 'en') });
    }
}));
exports.default = router;
