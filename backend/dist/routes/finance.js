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
const financeService_1 = require("../services/financeService");
const errorResponse_1 = require("../utils/errorResponse");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
// GET /api/finance/:clubId/transactions
router.get('/:clubId/transactions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const transactions = yield (0, financeService_1.getTransactionsForClub)(clubId);
        res.json(transactions);
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_get_transactions', req.language || 'en'));
    }
}));
// POST /api/finance/request-loan
router.post('/request-loan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, amount, bankId, type } = req.body;
        const result = yield (0, financeService_1.requestLoan)(clubId, amount, bankId, type);
        res.json(result);
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_request_loan', req.language || 'en'));
    }
}));
// POST /api/finance/accept-investment
router.post('/accept-investment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, investorId, offerId } = req.body;
        const result = yield (0, financeService_1.acceptInvestment)(clubId, investorId, offerId);
        res.json(result);
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_accept_investment', req.language || 'en'));
    }
}));
// POST /api/finance/negotiate-sponsorship
router.post('/negotiate-sponsorship', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId, sponsorName, type, value, duration } = req.body;
        const result = yield (0, financeService_1.negotiateSponsorship)(clubId, sponsorName, type, value, duration);
        res.json(result);
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_negotiate_sponsorship', req.language || 'en'));
    }
}));
// PATCH /api/finance/club-finances/:id
router.patch('/club-finances/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const updated = yield (0, financeService_1.updateClubFinances)(id, req.body);
        res.json(updated);
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_update_financial_record', req.language || 'en'));
    }
}));
// DELETE /api/finance/club-finances/:id
router.delete('/club-finances/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        yield (0, financeService_1.deleteClubFinances)(id);
        res.status(204).send();
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_delete_financial_record', req.language || 'en'));
    }
}));
// PATCH /api/finance/sponsorship/:id
router.patch('/sponsorship/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const updated = yield (0, financeService_1.updateSponsorship)(id, req.body);
        res.json(updated);
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_update_sponsorship', req.language || 'en'));
    }
}));
// DELETE /api/finance/sponsorship/:id
router.delete('/sponsorship/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        yield (0, financeService_1.deleteSponsorship)(id);
        res.status(204).send();
    }
    catch (error) {
        (0, errorResponse_1.errorResponse)(res, error, (0, i18n_1.t)('error.failed_to_delete_sponsorship', req.language || 'en'));
    }
}));
exports.default = router;
