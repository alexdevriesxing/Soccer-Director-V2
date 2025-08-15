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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsForClub = getTransactionsForClub;
exports.requestLoan = requestLoan;
exports.acceptInvestment = acceptInvestment;
exports.negotiateSponsorship = negotiateSponsorship;
exports.updateClubFinances = updateClubFinances;
exports.deleteClubFinances = deleteClubFinances;
exports.updateSponsorship = updateSponsorship;
exports.deleteSponsorship = deleteSponsorship;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getTransactionsForClub(clubId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Return the last 12 weeks of ClubFinances for the club
        const finances = yield prisma.clubFinances.findMany({
            where: { clubId },
            orderBy: { week: 'desc' },
            take: 12,
            select: {
                id: true,
                season: true,
                week: true,
                balance: true,
                gateReceiptsTotal: true,
                sponsorshipTotal: true,
                tvRightsTotal: true,
                prizeMoneyTotal: true,
                transferIncome: true,
                playerWagesTotal: true,
                staffWagesTotal: true,
                transferExpenses: true,
                facilityCosts: true,
                maintenanceCosts: true,
                debtTotal: true,
                equityValue: true,
                marketValue: true,
            },
        });
        return finances;
    });
}
function requestLoan(clubId, amount, bankId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a new CreditFacility for the club
        const now = new Date();
        const endDate = new Date(now);
        endDate.setFullYear(now.getFullYear() + 1); // 1 year loan by default
        const interestRate = 0.05; // 5% default
        const facility = yield prisma.creditFacility.create({
            data: {
                clubId,
                bankId,
                type,
                amount,
                usedAmount: amount,
                interestRate,
                startDate: now,
                endDate,
                status: 'active',
            },
        });
        // Add funds to club finances (latest week)
        const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
        if (finances) {
            yield prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { increment: amount }, debtTotal: { increment: amount } } });
        }
        return facility;
    });
}
function acceptInvestment(clubId, investorId, offerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Mark the offer as accepted
        const offer = yield prisma.investorOffer.update({
            where: { id: offerId },
            data: { status: 'accepted', boardApproval: true, shareholderApproval: true, regulatoryApproval: true },
        });
        // Add funds to club finances
        const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
        if (finances) {
            yield prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { increment: offer.totalValue }, equityValue: { increment: offer.totalValue } } });
        }
        return offer;
    });
}
function negotiateSponsorship(clubId, sponsorName, type, value, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a new Sponsorship
        const now = new Date();
        const endDate = new Date(now);
        endDate.setFullYear(now.getFullYear() + duration);
        const sponsorship = yield prisma.sponsorship.create({
            data: {
                clubId,
                sponsorName,
                type,
                value,
                startDate: now,
                endDate,
                isActive: true,
            },
        });
        // Add value to club finances (latest week)
        const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
        if (finances) {
            yield prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { increment: value }, sponsorshipTotal: { increment: value } } });
        }
        return sponsorship;
    });
}
function updateClubFinances(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only allow updating certain fields for safety
        const allowedFields = [
            'balance', 'season', 'week', 'gateReceiptsTotal', 'sponsorshipTotal', 'tvRightsTotal', 'prizeMoneyTotal',
            'transferIncome', 'playerWagesTotal', 'staffWagesTotal', 'transferExpenses', 'facilityCosts', 'maintenanceCosts',
            'transferBudget', 'wageBudget', 'debtTotal', 'equityValue', 'marketValue'
        ];
        const updateData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined)
                updateData[key] = data[key];
        }
        return prisma.clubFinances.update({ where: { id }, data: updateData });
    });
}
function deleteClubFinances(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.clubFinances.delete({ where: { id } });
    });
}
function updateSponsorship(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only allow updating certain fields
        const allowedFields = ['sponsorName', 'type', 'value', 'startDate', 'endDate', 'isActive'];
        const updateData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined)
                updateData[key] = data[key];
        }
        return prisma.sponsorship.update({ where: { id }, data: updateData });
    });
}
function deleteSponsorship(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.sponsorship.delete({ where: { id } });
    });
}
