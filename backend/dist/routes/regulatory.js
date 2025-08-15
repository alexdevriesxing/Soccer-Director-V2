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
// GET /api/regulatory/warnings/:clubId
router.get('/warnings/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const warnings = yield prisma.regulatoryWarning.findMany({ where: { clubId } });
        res.json({ warnings });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_regulatory_warnings') });
    }
}));
// GET /api/regulatory/status/:clubId
router.get('/status/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const club = yield prisma.club.findUnique({ where: { id: clubId }, select: { regulatoryStatus: true, complianceDeadline: true } });
        res.json({ status: club === null || club === void 0 ? void 0 : club.regulatoryStatus, complianceDeadline: club === null || club === void 0 ? void 0 : club.complianceDeadline });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_regulatory_status') });
    }
}));
// GET /api/regulatory/bailouts/:clubId
router.get('/bailouts/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const bailouts = yield prisma.governmentBailout.findMany({ where: { clubId } });
        res.json({ bailouts });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_bailouts') });
    }
}));
// GET /api/regulatory/bankruptcy/:clubId
router.get('/bankruptcy/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const events = yield prisma.bankruptcyEvent.findMany({ where: { clubId } });
        res.json({ events });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_bankruptcy_events') });
    }
}));
exports.default = router;
