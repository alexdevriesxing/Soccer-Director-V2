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
const advancedFinancialService_1 = __importDefault(require("../services/advancedFinancialService"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- FINANCIAL PROJECTIONS ---
// GET /api/advanced-finance/club/:clubId/projections
router.get('/club/:clubId/projections', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { seasons = 3 } = req.query;
        const projections = yield advancedFinancialService_1.default.calculateFinancialProjections(clubId, parseInt(seasons, 10));
        res.json({ projections });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_projections', req.language || 'en') });
    }
}));
// GET /api/advanced-finance/club/:clubId/projections/:season
router.get('/club/:clubId/projections/:season', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { season } = req.params;
        const projections = yield advancedFinancialService_1.default.calculateFinancialProjections(clubId, 1);
        const seasonProjection = projections.find(p => p.season === season);
        if (!seasonProjection) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.projection_not_found', req.language || 'en') });
        }
        res.json({ projection: seasonProjection });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_projection', req.language || 'en') });
    }
}));
// --- SPONSORSHIP DEALS ---
// POST /api/advanced-finance/sponsorships
router.post('/sponsorships', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, sponsorName, type, value, startDate, endDate, conditions } = req.body;
        if (!clubId || !sponsorName || !type || !value || !startDate || !endDate) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const sponsorship = yield advancedFinancialService_1.default.createSponsorshipDeal(clubId, sponsorName, type, value, new Date(startDate), new Date(endDate));
        res.status(201).json({ sponsorship });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_sponsorship', req.language || 'en') });
    }
}));
// GET /api/advanced-finance/club/:clubId/sponsorships
router.get('/club/:clubId/sponsorships', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { status } = req.query;
        let deals = yield advancedFinancialService_1.default.getSponsorshipDeals(clubId);
        if (status) {
            deals = deals.filter((d) => d.status === status);
        }
        res.json({ sponsorships: deals });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_sponsorships', req.language || 'en') });
    }
}));
// PUT /api/advanced-finance/sponsorships/:dealId
router.put('/sponsorships/:dealId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dealId = parseInt(req.params.dealId, 10);
        const updates = req.body;
        const updatedDeal = yield advancedFinancialService_1.default.updateSponsorshipDeal(dealId, updates);
        res.json({ sponsorship: updatedDeal });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_update_sponsorship', req.language || 'en') });
    }
}));
// DELETE /api/advanced-finance/sponsorships/:dealId
router.delete('/sponsorships/:dealId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dealId = parseInt(req.params.dealId, 10);
        yield prisma.sponsorship.update({
            where: { id: dealId },
            data: { isActive: false }
        });
        res.json({ message: 'Sponsorship deal terminated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_terminate_sponsorship', req.language || 'en') });
    }
}));
// --- FINANCIAL REGULATIONS ---
// GET /api/advanced-finance/club/:clubId/regulations
router.get('/club/:clubId/regulations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const regulations = yield advancedFinancialService_1.default.calculateFinancialRegulations(clubId);
        res.json({ regulations });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_regulations', req.language || 'en') });
    }
}));
// GET /api/advanced-finance/club/:clubId/regulations/:type
router.get('/club/:clubId/regulations/:type', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { type } = req.params;
        const regulations = yield advancedFinancialService_1.default.calculateFinancialRegulations(clubId);
        const regulation = regulations.find((r) => r.regulationType === type);
        if (!regulation) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.regulation_not_found', req.language || 'en') });
        }
        res.json({ regulation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_regulation', req.language || 'en') });
    }
}));
// --- FINANCIAL ANALYTICS ---
// GET /api/advanced-finance/club/:clubId/analytics
router.get('/club/:clubId/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analytics = yield advancedFinancialService_1.default.getFinancialAnalytics(clubId);
        res.json({ analytics });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_analytics', req.language || 'en') });
    }
}));
// GET /api/advanced-finance/club/:clubId/report/:season
router.get('/club/:clubId/report/:season', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { season } = req.params;
        const report = yield advancedFinancialService_1.default.generateFinancialReport(clubId, season);
        res.json({ report });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_generate_report', req.language || 'en') });
    }
}));
// --- REVENUE ANALYSIS ---
// GET /api/advanced-finance/club/:clubId/revenue-breakdown
router.get('/club/:clubId/revenue-breakdown', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { season = '2024/25' } = req.query;
        const club = yield prisma.club.findUnique({
            where: { id: clubId },
            include: {
                players: true,
                sponsorships: { where: { isActive: true } },
                league: true
            }
        });
        if (!club) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        const revenueBreakdown = {
            matchday: advancedFinancialService_1.default['calculateMatchdayRevenue'](club, season),
            broadcasting: advancedFinancialService_1.default['calculateBroadcastingRevenue'](club, season),
            commercial: advancedFinancialService_1.default['calculateCommercialRevenue'](club, season),
            playerSales: advancedFinancialService_1.default['calculatePlayerSalesRevenue'](club, season),
            other: advancedFinancialService_1.default['calculateOtherRevenue'](club, season)
        };
        const totalRevenue = Object.values(revenueBreakdown).reduce((sum, value) => sum + value, 0);
        res.json({
            revenueBreakdown,
            totalRevenue,
            percentages: Object.fromEntries(Object.entries(revenueBreakdown).map(([key, value]) => [key, (value / totalRevenue) * 100]))
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_revenue', req.language || 'en') });
    }
}));
// --- EXPENSE ANALYSIS ---
// GET /api/advanced-finance/club/:clubId/expense-breakdown
router.get('/club/:clubId/expense-breakdown', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { season = '2024/25' } = req.query;
        const club = yield prisma.club.findUnique({
            where: { id: clubId },
            include: {
                players: true,
                finances: { orderBy: { season: 'desc' }, take: 1 },
                facilities: true,
                loansFrom: { where: { status: 'active' } }
            }
        });
        if (!club) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        const expenseBreakdown = {
            wages: advancedFinancialService_1.default['calculateWageExpenses'](club, season),
            transfers: advancedFinancialService_1.default['calculateTransferExpenses'](club, season),
            facilities: advancedFinancialService_1.default['calculateFacilityExpenses'](club, season),
            operations: advancedFinancialService_1.default['calculateOperationExpenses'](club, season),
            debt: advancedFinancialService_1.default['calculateDebtExpenses'](club, season)
        };
        const totalExpenses = Object.values(expenseBreakdown).reduce((sum, value) => sum + value, 0);
        res.json({
            expenseBreakdown,
            totalExpenses,
            percentages: Object.fromEntries(Object.entries(expenseBreakdown).map(([key, value]) => [key, (value / totalExpenses) * 100]))
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_expenses', req.language || 'en') });
    }
}));
// --- WAGE ANALYSIS ---
// GET /api/advanced-finance/club/:clubId/wage-analysis
router.get('/club/:clubId/wage-analysis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const club = yield prisma.club.findUnique({
            where: { id: clubId },
            include: { players: true }
        });
        if (!club) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        const players = club.players;
        const totalWages = players.reduce((sum, p) => sum + (p.wage || 0), 0) * 52;
        const averageWage = players.length > 0 ? totalWages / players.length : 0;
        const wageAnalysis = {
            totalWages,
            averageWage,
            highestPaid: players.reduce((max, p) => p.wage > max.wage ? p : max, { wage: 0, name: 'None' }),
            wageDistribution: {
                low: players.filter((p) => (p.wage || 0) < 5000).length,
                medium: players.filter((p) => (p.wage || 0) >= 5000 && (p.wage || 0) < 15000).length,
                high: players.filter((p) => (p.wage || 0) >= 15000).length
            },
            byPosition: {
                GK: players.filter((p) => p.position === 'GK').reduce((sum, p) => sum + (p.wage || 0), 0) * 52,
                DEF: players.filter((p) => p.position === 'DEF').reduce((sum, p) => sum + (p.wage || 0), 0) * 52,
                MID: players.filter((p) => p.position === 'MID').reduce((sum, p) => sum + (p.wage || 0), 0) * 52,
                FWD: players.filter((p) => p.position === 'FWD').reduce((sum, p) => sum + (p.wage || 0), 0) * 52
            }
        };
        res.json({ wageAnalysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_analyze_wages', req.language || 'en') });
    }
}));
// --- FINANCIAL TRENDS ---
// GET /api/advanced-finance/club/:clubId/trends
router.get('/club/:clubId/trends', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { seasons = 5 } = req.query;
        const club = yield prisma.club.findUnique({
            where: { id: clubId },
            include: {
                finances: { orderBy: { season: 'desc' }, take: parseInt(seasons, 10) }
            }
        });
        if (!club) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        const trends = club.finances.map((finance) => ({
            season: finance.season,
            balance: finance.balance,
            transferBudget: finance.transferBudget,
            wageBudget: finance.wageBudget,
            revenue: finance.revenue || 0,
            expenses: finance.expenses || 0,
            profit: (finance.revenue || 0) - (finance.expenses || 0)
        }));
        res.json({ trends: trends.reverse() });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_trends', req.language || 'en') });
    }
}));
// --- FINANCIAL COMPARISONS ---
// GET /api/advanced-finance/club/:clubId/comparisons
router.get('/club/:clubId/comparisons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const club = yield prisma.club.findUnique({
            where: { id: clubId },
            include: {
                players: true,
                finances: { orderBy: { season: 'desc' }, take: 1 },
                league: { include: { clubs: { include: { finances: { orderBy: { season: 'desc' }, take: 1 } } } } }
            }
        });
        if (!club) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        const leagueClubs = ((_a = club.league) === null || _a === void 0 ? void 0 : _a.clubs) || [];
        const clubFinances = club.finances[0];
        if (!clubFinances) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.financial_data_not_found', req.language || 'en') });
        }
        const comparisons = {
            leaguePosition: {
                balance: leagueClubs
                    .map((c) => { var _a; return ({ clubId: c.id, clubName: c.name, balance: ((_a = c.finances[0]) === null || _a === void 0 ? void 0 : _a.balance) || 0 }); })
                    .sort((a, b) => b.balance - a.balance)
                    .findIndex((c) => c.clubId === clubId) + 1,
                transferBudget: leagueClubs
                    .map((c) => { var _a; return ({ clubId: c.id, clubName: c.name, transferBudget: ((_a = c.finances[0]) === null || _a === void 0 ? void 0 : _a.transferBudget) || 0 }); })
                    .sort((a, b) => b.transferBudget - a.transferBudget)
                    .findIndex((c) => c.clubId === clubId) + 1,
                wageBudget: leagueClubs
                    .map((c) => { var _a; return ({ clubId: c.id, clubName: c.name, wageBudget: ((_a = c.finances[0]) === null || _a === void 0 ? void 0 : _a.wageBudget) || 0 }); })
                    .sort((a, b) => b.wageBudget - a.wageBudget)
                    .findIndex((c) => c.clubId === clubId) + 1
            },
            leagueAverages: {
                balance: leagueClubs.reduce((sum, c) => { var _a; return sum + (((_a = c.finances[0]) === null || _a === void 0 ? void 0 : _a.balance) || 0); }, 0) / leagueClubs.length,
                transferBudget: leagueClubs.reduce((sum, c) => { var _a; return sum + (((_a = c.finances[0]) === null || _a === void 0 ? void 0 : _a.transferBudget) || 0); }, 0) / leagueClubs.length,
                wageBudget: leagueClubs.reduce((sum, c) => { var _a; return sum + (((_a = c.finances[0]) === null || _a === void 0 ? void 0 : _a.wageBudget) || 0); }, 0) / leagueClubs.length
            }
        };
        res.json({ comparisons });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_comparisons', req.language || 'en') });
    }
}));
// --- FINANCIAL PREDICTIONS ---
// POST /api/advanced-finance/club/:clubId/predict
router.post('/club/:clubId/predict', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { scenarios = ['optimistic', 'realistic', 'pessimistic'] } = req.body;
        const predictions = [];
        for (const scenario of scenarios) {
            const projections = yield advancedFinancialService_1.default.calculateFinancialProjections(clubId, 3);
            let multiplier = 1.0;
            switch (scenario) {
                case 'optimistic':
                    multiplier = 1.2;
                    break;
                case 'pessimistic':
                    multiplier = 0.8;
                    break;
                default:
                    multiplier = 1.0;
            }
            const adjustedProjections = projections.map(p => (Object.assign(Object.assign({}, p), { revenue: {
                    matchday: p.revenue.matchday * multiplier,
                    broadcasting: p.revenue.broadcasting * multiplier,
                    commercial: p.revenue.commercial * multiplier,
                    playerSales: p.revenue.playerSales * multiplier,
                    other: p.revenue.other * multiplier
                }, expenses: {
                    wages: p.expenses.wages * (scenario === 'optimistic' ? 0.9 : scenario === 'pessimistic' ? 1.1 : 1.0),
                    transfers: p.expenses.transfers * (scenario === 'optimistic' ? 0.8 : scenario === 'pessimistic' ? 1.2 : 1.0),
                    facilities: p.expenses.facilities,
                    operations: p.expenses.operations,
                    debt: p.expenses.debt
                }, profit: (p.revenue.matchday + p.revenue.broadcasting + p.revenue.commercial + p.revenue.playerSales + p.revenue.other) * multiplier -
                    (p.expenses.wages * (scenario === 'optimistic' ? 0.9 : scenario === 'pessimistic' ? 1.1 : 1.0) +
                        p.expenses.transfers * (scenario === 'optimistic' ? 0.8 : scenario === 'pessimistic' ? 1.2 : 1.0) +
                        p.expenses.facilities + p.expenses.operations + p.expenses.debt) })));
            predictions.push({
                scenario,
                projections: adjustedProjections
            });
        }
        res.json({ predictions });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_predict_finances', req.language || 'en') });
    }
}));
exports.default = router;
