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
const i18n_1 = require("../utils/i18n");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// --- STAFF MANAGEMENT ---
// GET /api/staff/:clubId
router.get('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const staff = yield prisma.staff.findMany({
            where: { clubId },
            include: {
                contracts: true
            },
            orderBy: { role: 'asc' }
        });
        res.json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff', req.language || 'en') });
    }
}));
// POST /api/staff/:clubId
router.post('/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { name, role, skill, hiredDate } = req.body;
        if (!name || !role || skill == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // Create staff member
        const staff = yield prisma.staff.create({
            data: {
                clubId,
                name,
                role,
                skill,
                hiredDate: hiredDate ? new Date(hiredDate) : new Date()
            },
            include: {
                contracts: true
            }
        });
        res.status(201).json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_staff', req.language || 'en') });
    }
}));
// GET /api/staff/:clubId/:role
router.get('/:clubId/:role', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const role = req.params.role;
        const staff = yield prisma.staff.findMany({
            where: { clubId, role },
            include: {
                contracts: true
            },
            orderBy: { skill: 'desc' }
        });
        res.json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff_by_role', req.language || 'en') });
    }
}));
// PUT /api/staff/:staffId
router.put('/:staffId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = parseInt(req.params.staffId, 10);
        const updateData = req.body;
        const staff = yield prisma.staff.update({
            where: { id: staffId },
            data: updateData,
            include: {
                contracts: true
            }
        });
        res.json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_staff', req.language || 'en') });
    }
}));
// DELETE /api/staff/:staffId
router.delete('/:staffId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = parseInt(req.params.staffId, 10);
        // Delete related records first
        yield prisma.staffContract.deleteMany({ where: { staffId } });
        yield prisma.staff.delete({ where: { id: staffId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_staff', req.language || 'en') });
    }
}));
// --- STAFF CONTRACTS ---
// GET /api/staff/:staffId/contract
router.get('/:staffId/contract', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = parseInt(req.params.staffId, 10);
        const contract = yield prisma.staffContract.findFirst({
            where: { staffId }
        });
        res.json({ contract });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff_contract', req.language || 'en') });
    }
}));
// POST /api/staff/:staffId/contract
router.post('/:staffId/contract', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = parseInt(req.params.staffId, 10);
        const { startDate, endDate, wage, role } = req.body;
        if (!startDate || !endDate || wage == null || !role) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const contract = yield prisma.staffContract.create({
            data: {
                staffId,
                clubId: 1, // TODO: Get from staff member's club
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                wage,
                role
            }
        });
        res.status(201).json({ contract });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_staff_contract', req.language || 'en') });
    }
}));
// PUT /api/staff/:staffId/contract
router.put('/:staffId/contract', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = parseInt(req.params.staffId, 10);
        const updateData = req.body;
        // First find the contract to get its ID
        const existingContract = yield prisma.staffContract.findFirst({
            where: { staffId }
        });
        if (!existingContract) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.contract_not_found', req.language || 'en') });
        }
        const contract = yield prisma.staffContract.update({
            where: { id: existingContract.id },
            data: updateData
        });
        res.json({ contract });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_staff_contract', req.language || 'en') });
    }
}));
// --- STAFF ANALYTICS ---
// GET /api/staff/:clubId/analytics
router.get('/:clubId/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const staff = yield prisma.staff.findMany({
            where: { clubId },
            include: {
                contracts: true
            }
        });
        const analytics = {
            totalStaff: staff.length,
            byRole: staff.reduce((acc, s) => {
                acc[s.role] = (acc[s.role] || 0) + 1;
                return acc;
            }, {}),
            averageSkill: staff.reduce((sum, s) => sum + s.skill, 0) / staff.length,
            totalWage: staff.reduce((sum, s) => sum + (s.wage || 0), 0),
            expiringContracts: staff.filter((s) => {
                if (!s.contracts)
                    return false;
                const expiryDate = new Date(s.contracts.endDate);
                const now = new Date();
                const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                return daysUntilExpiry <= 90;
            }).length
        };
        res.json({ analytics });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff_analytics', req.language || 'en') });
    }
}));
exports.default = router;
