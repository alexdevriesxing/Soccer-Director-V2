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
const academyFacilityService_1 = require("../services/academyFacilityService");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// GET /api/academy-facility/:clubId
router.get('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const facilities = yield (0, academyFacilityService_1.getFacilitiesForClub)(clubId);
        res.json(facilities);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_facilities', req.language || 'en') });
    }
}));
// POST /api/academy-facility/upgrade
router.post('/upgrade', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facilityId } = req.body;
        const facility = yield (0, academyFacilityService_1.upgradeFacility)(facilityId);
        res.json(facility);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_upgrade_facility', req.language || 'en') });
    }
}));
// POST /api/academy-facility/specialize
router.post('/specialize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facilityId, specialization } = req.body;
        const facility = yield (0, academyFacilityService_1.setFacilitySpecialization)(facilityId, specialization);
        res.json(facility);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_set_specialization', req.language || 'en') });
    }
}));
// GET /api/academy-facility/:clubId/specialization/:specialization
router.get('/:clubId/specialization/:specialization', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const specialization = req.params.specialization;
        const facilities = yield (0, academyFacilityService_1.getFacilitiesBySpecialization)(clubId, specialization);
        res.json(facilities);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_get_specialized_facilities', req.language || 'en') });
    }
}));
exports.default = router;
