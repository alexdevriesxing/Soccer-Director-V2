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
const facilityService_1 = require("../services/facilityService");
const i18n_1 = require("../utils/i18n");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET /api/facility/:clubId
router.get('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const facilities = yield (0, facilityService_1.getFacilitiesForClub)(clubId);
        res.json(facilities);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_facilities', req.language || 'en') });
    }
}));
// POST /api/facility/upgrade
router.post('/upgrade', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facilityId } = req.body;
        const facility = yield (0, facilityService_1.upgradeFacility)(facilityId);
        res.json(facility);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_upgrade_facility', req.language || 'en') });
    }
}));
// GET /api/facility/:clubId/progress
router.get('/:clubId/progress', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const progress = yield (0, facilityService_1.getUpgradeProgress)(clubId);
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_upgrade_progress', req.language || 'en') });
    }
}));
// GET /api/facility/:facilityId/ticket-price
router.get('/:facilityId/ticket-price', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const facilityId = parseInt(req.params.facilityId, 10);
        const facility = yield prisma.facility.findUnique({ where: { id: facilityId } });
        if (!facility || facility.type !== 'stadium') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.facility_not_found', req.language || 'en') });
        }
        res.json({ ticketPrice: facility.ticketPrice });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_ticket_price', req.language || 'en') });
    }
}));
// PATCH /api/facility/:facilityId/ticket-price
router.patch('/:facilityId/ticket-price', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const facilityId = parseInt(req.params.facilityId, 10);
        const { ticketPrice } = req.body;
        if (typeof ticketPrice !== 'number' || ticketPrice < 1 || ticketPrice > 500) {
            return res.status(400).json({ error: 'Invalid ticket price' });
        }
        const facility = yield prisma.facility.findUnique({ where: { id: facilityId } });
        if (!facility || facility.type !== 'stadium') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.facility_not_found', req.language || 'en') });
        }
        const updated = yield prisma.facility.update({ where: { id: facilityId }, data: { ticketPrice } });
        res.json({ ticketPrice: updated.ticketPrice });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_ticket_price', req.language || 'en') });
    }
}));
exports.default = router;
