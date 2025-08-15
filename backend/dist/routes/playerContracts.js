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
const playerContractService_1 = __importDefault(require("../services/playerContractService"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- CONTRACT NEGOTIATIONS ---
// POST /api/player-contracts/negotiate
router.post('/negotiate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, clubId, proposedWage, proposedLength, proposedBonuses, proposedClauses, agentFee, deadline } = req.body;
        if (!playerId || !clubId || !proposedWage || !proposedLength || !deadline) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const negotiation = yield playerContractService_1.default.createContractNegotiation({
            playerId,
            clubId,
            proposedWage,
            proposedLength,
            proposedBonuses: proposedBonuses || {},
            proposedClauses: proposedClauses || {},
            agentFee: agentFee || 0,
            status: 'pending',
            deadline: new Date(deadline)
        });
        res.status(201).json({ negotiation });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_create_negotiation', req.language || 'en') });
    }
}));
// POST /api/player-contracts/:negotiationId/accept
router.post('/:negotiationId/accept', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const negotiationId = parseInt(req.params.negotiationId, 10);
        const player = yield playerContractService_1.default.acceptContract(negotiationId);
        res.json({ player, message: 'Contract accepted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_accept_contract', req.language || 'en') });
    }
}));
// POST /api/player-contracts/:negotiationId/reject
router.post('/:negotiationId/reject', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const negotiationId = parseInt(req.params.negotiationId, 10);
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const negotiation = yield playerContractService_1.default.rejectContract(negotiationId, reason);
        res.json({ negotiation, message: 'Contract rejected' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_reject_contract', req.language || 'en') });
    }
}));
// POST /api/player-contracts/:negotiationId/counter-offer
router.post('/:negotiationId/counter-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const negotiationId = parseInt(req.params.negotiationId, 10);
        const { counterOffer } = req.body;
        if (!counterOffer) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const negotiation = yield playerContractService_1.default.makeCounterOffer(negotiationId, counterOffer);
        res.json({ negotiation, message: 'Counter offer made' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_make_counter_offer', req.language || 'en') });
    }
}));
// GET /api/player-contracts/club/:clubId/negotiations
router.get('/club/:clubId/negotiations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const negotiations = yield playerContractService_1.default.getClubNegotiations(clubId);
        res.json({ negotiations });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_negotiations', req.language || 'en') });
    }
}));
// GET /api/player-contracts/player/:playerId/negotiations
router.get('/player/:playerId/negotiations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const negotiations = yield playerContractService_1.default.getPlayerNegotiations(playerId);
        res.json({ negotiations });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_negotiations', req.language || 'en') });
    }
}));
// --- CONTRACT RENEWALS ---
// POST /api/player-contracts/club/:clubId/trigger-renewals
router.post('/club/:clubId/trigger-renewals', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        yield playerContractService_1.default.triggerRenewalNegotiations(clubId);
        res.json({ message: 'Renewal negotiations triggered' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_trigger_renewals', req.language || 'en') });
    }
}));
// GET /api/player-contracts/club/:clubId/expiring
router.get('/club/:clubId/expiring', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { daysThreshold = 180 } = req.query;
        const expiringPlayers = yield playerContractService_1.default.getExpiringContracts(clubId, parseInt(daysThreshold, 10));
        res.json({ expiringPlayers });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_expiring_contracts', req.language || 'en') });
    }
}));
// GET /api/player-contracts/player/:playerId/renewal-eligibility
router.get('/player/:playerId/renewal-eligibility', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const isEligible = yield playerContractService_1.default.checkRenewalEligibility(playerId);
        res.json({ isEligible });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_check_eligibility', req.language || 'en') });
    }
}));
// --- CONTRACT BONUSES ---
// POST /api/player-contracts/process-match-bonuses
router.post('/process-match-bonuses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, matchStats } = req.body;
        if (!playerId || !matchStats) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        yield playerContractService_1.default.processMatchBonuses(playerId, matchStats);
        res.json({ message: 'Match bonuses processed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_process_bonuses', req.language || 'en') });
    }
}));
// GET /api/player-contracts/club/:clubId/bonuses
router.get('/club/:clubId/bonuses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { startDate, endDate } = req.query;
        const where = { clubId };
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const bonuses = yield prisma.playerContractBonus.findMany({
            where,
            include: { player: true },
            orderBy: { createdAt: 'desc' }
        });
        const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
        res.json({ bonuses, totalBonuses });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_bonuses', req.language || 'en') });
    }
}));
// --- CONTRACT STATISTICS ---
// GET /api/player-contracts/club/:clubId/stats
router.get('/club/:clubId/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const stats = yield playerContractService_1.default.getContractStats(clubId);
        res.json({ stats });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_contract_stats', req.language || 'en') });
    }
}));
// GET /api/player-contracts/club/:clubId/wage-analysis
router.get('/club/:clubId/wage-analysis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const players = yield prisma.player.findMany({ where: { clubId } });
        const totalWage = players.reduce((sum, p) => sum + (p.wage || 0), 0);
        const avgWage = players.length > 0 ? totalWage / players.length : 0;
        const analysis = {
            totalWage,
            averageWage: avgWage,
            wageEfficiency: players.length > 0 ? players.reduce((sum, p) => sum + (p.skill || 0), 0) / totalWage : 0,
            topEarners: players
                .sort((a, b) => (b.wage || 0) - (a.wage || 0))
                .slice(0, 5)
                .map((p) => ({ id: p.id, name: p.name, wage: p.wage, skill: p.skill })),
            valueForMoney: players
                .filter((p) => p.wage && p.skill)
                .sort((a, b) => (b.skill / b.wage) - (a.skill / a.wage))
                .slice(0, 5)
                .map((p) => ({ id: p.id, name: p.name, wage: p.wage, skill: p.skill, ratio: p.skill / p.wage }))
        };
        res.json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_wage_analysis', req.language || 'en') });
    }
}));
// --- CONTRACT CALCULATIONS ---
// POST /api/player-contracts/calculate-value
router.post('/calculate-value', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { wage, length, bonuses } = req.body;
        if (!wage || !length) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const totalValue = playerContractService_1.default.calculateContractValue(wage, length, bonuses);
        res.json({ totalValue, breakdown: { baseWage: wage * length, bonuses: totalValue - (wage * length) } });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_calculate_value', req.language || 'en') });
    }
}));
// --- CONTRACT HISTORY ---
// GET /api/player-contracts/player/:playerId/history
router.get('/player/:playerId/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const negotiations = yield prisma.contractNegotiation.findMany({
            where: { playerId },
            orderBy: { createdAt: 'desc' }
        });
        const bonuses = yield prisma.playerContractBonus.findMany({
            where: { playerId },
            orderBy: { createdAt: 'desc' }
        });
        const player = yield prisma.player.findUnique({ where: { id: playerId } });
        res.json({
            currentContract: player ? {
                wage: player.wage,
                contractExpiry: player.contractExpiry,
                contractStart: player.contractStart
            } : null,
            negotiations,
            bonuses
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_fetch_contract_history', req.language || 'en') });
    }
}));
// --- CONTRACT AUTOMATION ---
// POST /api/player-contracts/club/:clubId/auto-renewals
router.post('/club/:clubId/auto-renewals', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { autoAcceptThreshold = 70 } = req.body;
        const expiringPlayers = yield playerContractService_1.default.getExpiringContracts(clubId, 90);
        const results = [];
        for (const player of expiringPlayers) {
            // Calculate renewal probability based on player factors
            let probability = 50;
            if (player.morale && player.morale > 80)
                probability += 20;
            if (player.skill > 80)
                probability += 15;
            if (player.age < 25)
                probability += 10;
            if (player.ambition && player.ambition > 4)
                probability -= 15;
            if (probability >= autoAcceptThreshold) {
                try {
                    const proposedWage = Math.floor((player.wage || 0) * 1.1); // 10% raise
                    yield playerContractService_1.default.createContractNegotiation({
                        playerId: player.id,
                        clubId: player.clubId,
                        proposedWage,
                        proposedLength: 2,
                        proposedBonuses: {
                            appearance_bonus: Math.floor(proposedWage * 0.1),
                            goal_bonus: player.position === 'FWD' ? Math.floor(proposedWage * 0.2) : 0,
                            clean_sheet_bonus: player.position === 'GK' || player.position === 'DEF' ? Math.floor(proposedWage * 0.15) : 0
                        },
                        proposedClauses: {},
                        agentFee: Math.floor(proposedWage * 0.05),
                        status: 'pending',
                        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    });
                    results.push({ playerId: player.id, action: 'negotiation_created', probability });
                }
                catch (error) {
                    results.push({ playerId: player.id, action: 'failed', error: error.message });
                }
            }
            else {
                results.push({ playerId: player.id, action: 'skipped', probability });
            }
        }
        res.json({ results });
    }
    catch (error) {
        res.status(500).json({ error: error.message || (0, i18n_1.t)('error.failed_to_process_auto_renewals', req.language || 'en') });
    }
}));
exports.default = router;
