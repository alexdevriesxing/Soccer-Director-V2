"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimit_1 = require("../middleware/rateLimit");
// Import route handlers
const leagues_1 = __importDefault(require("../routes/leagues"));
const clubs_1 = __importDefault(require("../routes/clubs"));
const players_1 = __importDefault(require("../routes/players"));
const fixtures_1 = __importDefault(require("../routes/fixtures"));
const transferMarket_1 = __importDefault(require("../routes/transferMarket"));
const jongTeam_1 = __importDefault(require("../routes/jongTeam"));
const finance_1 = __importDefault(require("../routes/finance"));
const staff_1 = __importDefault(require("../routes/staff"));
const international_1 = __importDefault(require("../routes/international"));
const news_1 = __importDefault(require("../routes/news"));
const router = (0, express_1.Router)();
// Apply rate limiting to all routes
router.use(rateLimit_1.apiLimiter);
// API routes
router.use('/api/leagues', leagues_1.default);
router.use('/api/clubs', clubs_1.default);
router.use('/api/players', players_1.default);
router.use('/api/fixtures', fixtures_1.default);
router.use('/api/transfer-market', transferMarket_1.default);
router.use('/api/jong-teams', jongTeam_1.default);
router.use('/api/finance', finance_1.default);
router.use('/api/staff', staff_1.default);
router.use('/api/international', international_1.default);
router.use('/api/news', news_1.default);
exports.default = router;
