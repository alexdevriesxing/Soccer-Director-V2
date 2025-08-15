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
exports.PlayerContractService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PlayerContractService {
    // Create a new contract negotiation
    static createContractNegotiation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const player = yield prisma.player.findUnique({ where: { id: data.playerId } });
            if (!player)
                throw new Error('Player not found');
            const club = yield prisma.club.findUnique({ where: { id: data.clubId } });
            if (!club)
                throw new Error('Club not found');
            // Check if player is available for contract
            if (player.clubId && player.clubId !== data.clubId) {
                throw new Error('Player belongs to another club');
            }
            // Validate financial capacity
            const clubFinances = yield prisma.clubFinances.findFirst({
                where: { clubId: data.clubId },
                orderBy: { season: 'desc' }
            });
            if (clubFinances && clubFinances.wageBudget < ((_a = data.proposedWage) !== null && _a !== void 0 ? _a : 0)) {
                throw new Error('Insufficient wage budget');
            }
            // Ensure offer field is present and valid (required by schema)
            const offer = {
                wage: (_b = data.proposedWage) !== null && _b !== void 0 ? _b : 0,
                length: (_c = data.proposedLength) !== null && _c !== void 0 ? _c : 2,
                bonuses: (_d = data.proposedBonuses) !== null && _d !== void 0 ? _d : {},
                clauses: (_e = data.proposedClauses) !== null && _e !== void 0 ? _e : {}
            };
            return yield prisma.contractNegotiation.create({
                data: {
                    playerId: data.playerId,
                    clubId: data.clubId,
                    proposedWage: (_f = data.proposedWage) !== null && _f !== void 0 ? _f : 0,
                    proposedLength: (_g = data.proposedLength) !== null && _g !== void 0 ? _g : 2,
                    proposedBonuses: (_h = data.proposedBonuses) !== null && _h !== void 0 ? _h : {},
                    proposedClauses: (_j = data.proposedClauses) !== null && _j !== void 0 ? _j : {},
                    agentFee: (_k = data.agentFee) !== null && _k !== void 0 ? _k : 0,
                    status: data.status,
                    counterOffer: (_l = data.counterOffer) !== null && _l !== void 0 ? _l : null,
                    deadline: data.deadline,
                    offer
                    // Do not include 'history' unless updating
                }
            });
        });
    }
    // Accept a contract offer
    static acceptContract(negotiationId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const negotiation = yield prisma.contractNegotiation.findUnique({
                where: { id: negotiationId },
                include: { player: true, club: true }
            });
            if (!negotiation)
                throw new Error('Negotiation not found');
            if (negotiation.status !== 'pending')
                throw new Error('Negotiation is not pending');
            // Update player contract
            const updatedPlayer = yield prisma.player.update({
                where: { id: negotiation.playerId },
                data: {
                    clubId: negotiation.clubId,
                    wage: (_a = negotiation.proposedWage) !== null && _a !== void 0 ? _a : 0,
                    contractExpiry: negotiation.proposedLength ? new Date(Date.now() + ((_b = negotiation.proposedLength) !== null && _b !== void 0 ? _b : 2) * 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
                    contractStart: new Date()
                }
            });
            // Update club finances
            yield prisma.clubFinances.updateMany({
                where: { clubId: negotiation.clubId },
                data: {
                    wageBudget: { decrement: (_c = negotiation.proposedWage) !== null && _c !== void 0 ? _c : 0 },
                    balance: { decrement: (_d = negotiation.agentFee) !== null && _d !== void 0 ? _d : 0 }
                }
            });
            // Update negotiation status
            yield prisma.contractNegotiation.update({
                where: { id: negotiationId },
                data: { status: 'accepted' }
            });
            return updatedPlayer;
        });
    }
    // Reject a contract offer
    static rejectContract(negotiationId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const negotiation = yield prisma.contractNegotiation.findUnique({
                where: { id: negotiationId }
            });
            if (!negotiation)
                throw new Error('Negotiation not found');
            // Only update 'status' unless 'history' is required
            return yield prisma.contractNegotiation.update({
                where: { id: negotiationId },
                data: {
                    status: 'rejected'
                }
            });
        });
    }
    // Make a counter offer
    static makeCounterOffer(negotiationId, counterOffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const negotiation = yield prisma.contractNegotiation.findUnique({
                where: { id: negotiationId }
            });
            if (!negotiation)
                throw new Error('Negotiation not found');
            if (negotiation.status !== 'pending')
                throw new Error('Negotiation is not pending');
            // Only update 'status' and 'counterOffer' unless 'history' is required
            return yield prisma.contractNegotiation.update({
                where: { id: negotiationId },
                data: {
                    status: 'counter_offered',
                    counterOffer
                }
            });
        });
    }
    // Get contract negotiations for a club
    static getClubNegotiations(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.contractNegotiation.findMany({
                where: { clubId },
                include: { player: true },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // Get contract negotiations for a player
    static getPlayerNegotiations(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.contractNegotiation.findMany({
                where: { playerId },
                include: { club: true },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // Calculate contract value including bonuses
    static calculateContractValue(wage, length, bonuses) {
        let totalValue = wage * length;
        // If bonuses is an object, sum all numeric values
        if (bonuses && typeof bonuses === 'object') {
            for (const key in bonuses) {
                if (typeof bonuses[key] === 'number') {
                    totalValue += bonuses[key];
                }
            }
        }
        return totalValue;
    }
    // Check if player is eligible for contract renewal
    static checkRenewalEligibility(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                return false;
            const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 180; // 6 months before expiry
        });
    }
    // Get players with expiring contracts
    static getExpiringContracts(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, daysThreshold = 180) {
            const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);
            return yield prisma.player.findMany({
                where: {
                    clubId,
                    contractExpiry: { lte: thresholdDate }
                },
                orderBy: { contractExpiry: 'asc' }
            });
        });
    }
    // Process contract bonuses after a match
    static processMatchBonuses(playerId, matchStats) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                return;
            let bonusAmount = 0;
            // Appearance bonus
            if (matchStats.appearances > 0) {
                const appearanceBonuses = yield prisma.playerContractBonus.findMany({
                    where: { playerId, type: 'appearance' }
                });
                for (const bonus of appearanceBonuses) {
                    bonusAmount += bonus.amount * matchStats.appearances;
                }
            }
            // Goal bonus
            if (matchStats.goals > 0) {
                const goalBonuses = yield prisma.playerContractBonus.findMany({
                    where: { playerId, type: 'goal' }
                });
                for (const bonus of goalBonuses) {
                    bonusAmount += bonus.amount * matchStats.goals;
                }
            }
            // Clean sheet bonus (for defenders and goalkeepers)
            if (matchStats.cleanSheets > 0 && (player.position === 'GK' || player.position === 'DEF')) {
                const cleanSheetBonuses = yield prisma.playerContractBonus.findMany({
                    where: { playerId, type: 'clean_sheet' }
                });
                for (const bonus of cleanSheetBonuses) {
                    bonusAmount += bonus.amount * matchStats.cleanSheets;
                }
            }
            if (bonusAmount > 0) {
                // Update club finances
                yield prisma.clubFinances.updateMany({
                    where: { clubId: player.clubId },
                    data: { balance: { decrement: bonusAmount } }
                });
                // Log the bonus payment (do not include matchStats as a field, only use valid fields)
                yield prisma.playerContractBonus.create({
                    data: {
                        playerId,
                        clubId: player.clubId,
                        amount: bonusAmount,
                        type: 'match_bonus', // Use only valid types from the schema
                        createdAt: new Date()
                    }
                });
            }
        });
    }
    // Trigger contract renewal negotiations
    static triggerRenewalNegotiations(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const expiringPlayers = yield this.getExpiringContracts(clubId, 90); // 3 months
            for (const player of expiringPlayers) {
                // Check if player wants to renew
                const wantsToRenew = this.calculateRenewalDesire(player);
                if (wantsToRenew) {
                    // Create renewal negotiation
                    const proposedWage = this.calculateRenewalWage(player);
                    const proposedLength = 2; // 2 years
                    yield this.createContractNegotiation({
                        playerId: player.id,
                        clubId: player.clubId,
                        proposedWage,
                        proposedLength,
                        proposedBonuses: {}, // No hardcoded bonus fields
                        proposedClauses: {},
                        agentFee: Math.floor(proposedWage * 0.05),
                        status: 'pending',
                        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    });
                }
            }
        });
    }
    // Calculate if player wants to renew based on various factors
    static calculateRenewalDesire(player) {
        let desire = 50; // Base 50% chance
        // Age factor
        if (player.age < 25)
            desire += 20;
        else if (player.age > 30)
            desire -= 10;
        // Skill factor
        if (player.skill > 80)
            desire += 15;
        else if (player.skill < 60)
            desire -= 10;
        // Morale factor
        if (player.morale && player.morale > 80)
            desire += 20;
        else if (player.morale && player.morale < 50)
            desire -= 20;
        // Ambition factor
        if (player.ambition > 4)
            desire -= 10; // High ambition players might want to move
        return Math.random() * 100 < desire;
    }
    // Calculate proposed renewal wage
    static calculateRenewalWage(player) {
        let baseWage = player.wage;
        // Age-based adjustments
        if (player.age < 25)
            baseWage *= 1.1; // Young players get raises
        else if (player.age > 30)
            baseWage *= 0.9; // Older players might accept less
        // Skill-based adjustments
        if (player.skill > 80)
            baseWage *= 1.2;
        else if (player.skill < 60)
            baseWage *= 0.8;
        // Morale-based adjustments
        if (player.morale && player.morale > 80)
            baseWage *= 1.1;
        else if (player.morale && player.morale < 50)
            baseWage *= 0.9;
        return Math.floor(baseWage);
    }
    // Get contract statistics for a club
    static getContractStats(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const totalWage = players.reduce((sum, p) => sum + (p.wage || 0), 0);
            const avgWage = players.length > 0 ? totalWage / players.length : 0;
            const expiringSoon = yield this.getExpiringContracts(clubId, 90);
            const highEarners = players.filter((p) => (p.wage || 0) > avgWage * 2);
            return {
                totalPlayers: players.length,
                totalWage,
                averageWage: avgWage,
                expiringSoon: expiringSoon.length,
                highEarners: highEarners.length,
                wageDistribution: {
                    low: players.filter((p) => (p.wage || 0) < avgWage * 0.5).length,
                    medium: players.filter((p) => (p.wage || 0) >= avgWage * 0.5 && (p.wage || 0) <= avgWage * 1.5).length,
                    high: players.filter((p) => (p.wage || 0) > avgWage * 1.5).length
                }
            };
        });
    }
}
exports.PlayerContractService = PlayerContractService;
exports.default = PlayerContractService;
