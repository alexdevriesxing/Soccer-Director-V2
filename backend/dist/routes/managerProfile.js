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
// GET /api/manager-profiles - List all manager profiles
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profiles = yield prisma.managerProfile.findMany({
            orderBy: { id: 'desc' }
        });
        res.json({ profiles });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_profiles', req.language || 'en') });
    }
}));
// GET /api/manager-profiles/:id - Get a specific manager profile
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const profile = yield prisma.managerProfile.findUnique({ where: { id } });
        if (!profile) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.profile_not_found', req.language || 'en') });
        }
        res.json({ profile });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_profile', req.language || 'en') });
    }
}));
exports.default = router;
