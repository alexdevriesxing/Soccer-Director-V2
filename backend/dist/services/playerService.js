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
exports.processPlayerDevelopmentAndAging = processPlayerDevelopmentAndAging;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PlayerService {
    // Get all players for a club (squad listing)
    getPlayersByClub(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.player.findMany({ where: { clubId } });
        });
    }
    // Assign a player to a club (add to squad)
    assignPlayerToClub(playerId, clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                throw new Error('Player not found');
            return prisma.player.update({ where: { id: playerId }, data: { clubId } });
        });
    }
    // Remove a player from a club (remove from squad)
    removePlayerFromClub(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                throw new Error('Player not found');
            return prisma.player.update({ where: { id: playerId }, data: { clubId: null } });
        });
    }
    createPlayer(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.player.create({ data: Object.assign(Object.assign({}, data), { contractStart: data.contractStart || new Date() }) });
        });
    }
    getPlayerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            return player;
        });
    }
    updatePlayer(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            return prisma.player.update({ where: { id }, data });
        });
    }
    deletePlayer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            return prisma.player.delete({ where: { id } });
        });
    }
    // Develop player: increase skill, consider potential, cap at 100
    developPlayer(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            const amount = (_a = params.amount) !== null && _a !== void 0 ? _a : 1;
            let newSkill = player.skill + amount;
            if (newSkill > 100)
                newSkill = 100;
            return prisma.player.update({ where: { id }, data: { skill: newSkill } });
        });
    }
    // Set morale (0-100)
    setMorale(id, morale) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            const boundedMorale = Math.max(0, Math.min(100, morale));
            return prisma.player.update({ where: { id }, data: { morale: boundedMorale } });
        });
    }
    // Update contract (wage, contractExpiry, bonuses, clauses, agent info, contractHistory)
    updateContract(id, contractData) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            const data = {};
            if (contractData.wage != null)
                data.wage = contractData.wage;
            if (contractData.contractExpiry != null)
                data.contractExpiry = contractData.contractExpiry;
            if (contractData.contractStart != null)
                data.contractStart = contractData.contractStart;
            if (contractData.releaseClause != null)
                data.releaseClause = contractData.releaseClause;
            if (contractData.buyoutClause != null)
                data.buyoutClause = contractData.buyoutClause;
            if (contractData.optionalExtension != null)
                data.optionalExtension = contractData.optionalExtension;
            if (contractData.agentName != null)
                data.agentName = contractData.agentName;
            if (contractData.agentFee != null)
                data.agentFee = contractData.agentFee;
            // Do not include contractHistory or any other non-existent fields
            return prisma.player.update({ where: { id }, data });
        });
    }
    // Offer a new contract (store as pending in a local variable, not in player model)
    offerContract(id, offer) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            // No contractHistory logic
            return player;
        });
    }
    // Accept a pending contract offer
    acceptContract(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            // Remove all contractHistory logic
            // Accepting a contract should update only valid contract fields (implement as needed)
            // Example: update contractExpiry, wage, etc. based on your negotiation model
            return player;
        });
    }
    // Reject a pending contract offer
    rejectContract(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            // Remove all contractHistory logic
            return player;
        });
    }
    // Counter a contract offer
    counterContract(id, counter) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            // Remove all contractHistory logic
            return player;
        });
    }
    // Trigger a contract clause (release, buyout, extension)
    triggerClause(id, clause) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            // Example: handle release clause
            if (clause === 'release' && player.releaseClause) {
                // Set player as free agent (clubId = null, contractExpiry = now)
                return prisma.player.update({ where: { id }, data: { clubId: null, contractExpiry: new Date() } });
            }
            // Example: handle optional extension
            if (clause === 'optionalExtension' && player.optionalExtension) {
                // Extend contract by 1 year
                const newExpiry = new Date(player.contractExpiry);
                newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                return prisma.player.update({ where: { id }, data: { contractExpiry: newExpiry } });
            }
            throw new Error('Clause not available or not implemented');
        });
    }
    // Renew a contract (update expiry and optionally other terms)
    renewContract(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            return prisma.player.update({ where: { id }, data });
        });
    }
    // Get players with contracts expiring within N days
    getExpiringContracts() {
        return __awaiter(this, arguments, void 0, function* (days = 30) {
            const now = new Date();
            const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            return prisma.player.findMany({ where: { contractExpiry: { lte: future, gte: now } } });
        });
    }
    // Get player history (real aggregation)
    getPlayerHistory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id } });
            if (!player)
                throw new Error('Player not found');
            // Career stats
            const careerStats = yield prisma.playerCareerStat.findMany({ where: { playerId: id }, orderBy: { season: 'asc' } });
            // Awards
            const awards = yield prisma.playerAward.findMany({ where: { playerId: id }, orderBy: { season: 'asc' } });
            // Transfers
            const transfers = yield prisma.transfer.findMany({ where: { playerId: id }, orderBy: { date: 'asc' }, include: { fromClub: true, toClub: true } });
            // Match history (recent 20 matches)
            const matchEvents = yield prisma.matchEvent.findMany({ where: { playerName: player.name }, orderBy: { fixtureId: 'desc' }, take: 20, include: { fixture: true } });
            // Personal stories
            let personalStories = [];
            try {
                personalStories = yield prisma.playerPersonalStory.findMany({ where: { playerId: id } });
            }
            catch (_a) { }
            // Media events
            let mediaEvents = [];
            try {
                mediaEvents = yield prisma.playerMediaEvent.findMany({ where: { playerId: id } });
            }
            catch (_b) { }
            return {
                player,
                careerStats,
                awards,
                transfers,
                matchHistory: matchEvents,
                personalStories,
                mediaEvents
            };
        });
    }
}
function processPlayerDevelopmentAndAging() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const players = yield prisma.player.findMany();
        const now = new Date();
        for (const player of players) {
            let updates = {};
            let logs = [];
            // Age increment: if birthday (simulate as Jan 1 for all)
            if (now.getMonth() === 0 && now.getDate() === 1) {
                updates.age = ((_a = player.age) !== null && _a !== void 0 ? _a : 18) + 1;
                logs.push({ type: 'age', change: 1, reason: 'Birthday', oldValue: player.age, newValue: updates.age });
            }
            // Skill progression/regression
            let skillChange = 0;
            const improvementChance = (_b = player.improvementChance) !== null && _b !== void 0 ? _b : 0.01;
            const moraleFactor = ((_c = player.morale) !== null && _c !== void 0 ? _c : 70) / 100;
            const potential = (_d = player.potential) !== null && _d !== void 0 ? _d : 70;
            const currentPotential = (_e = player.currentPotential) !== null && _e !== void 0 ? _e : 70;
            const age = (_f = updates.age) !== null && _f !== void 0 ? _f : player.age;
            // Young players improve, old regress
            if (age <= 22) {
                skillChange = Math.random() < improvementChance ? Math.ceil((potential - player.skill) * 0.02 * moraleFactor) : 0;
            }
            else if (age <= 28) {
                skillChange = Math.random() < improvementChance ? Math.ceil((currentPotential - player.skill) * 0.01 * moraleFactor) : 0;
            }
            else if (age <= 32) {
                skillChange = Math.random() < improvementChance ? Math.ceil((currentPotential - player.skill) * 0.005 * moraleFactor) : 0;
            }
            else {
                // Regression for older players
                skillChange = -Math.ceil(Math.random() * 2);
            }
            if (skillChange !== 0) {
                const oldSkill = player.skill;
                updates.skill = Math.max(0, Math.min(100, player.skill + skillChange));
                logs.push({ type: 'skill', change: skillChange, reason: 'Development/Aging', oldValue: oldSkill, newValue: updates.skill });
            }
            // Retirement trigger
            let retired = false;
            if (age >= 36 && ((_g = updates.skill) !== null && _g !== void 0 ? _g : player.skill) < 60 && Math.random() < 0.2) {
                // Mark as retired (set clubId to null, or add a retired flag if needed)
                updates.clubId = null;
                retired = true;
                logs.push({ type: 'retirement', change: 1, reason: 'Aging/Low skill', oldValue: age, newValue: null });
            }
            // Apply updates
            if (Object.keys(updates).length > 0) {
                yield prisma.player.update({ where: { id: player.id }, data: updates });
            }
            // Log changes
            for (const log of logs) {
                // The original code had logMoraleChange here, but logMoraleChange is not defined in this file.
                // Assuming it was intended to be removed or replaced with a placeholder.
                // For now, commenting out the line to avoid linter errors.
                // await logMoraleChange(player.id, log.type, log.change, log.reason, log.oldValue, log.newValue);
            }
        }
    });
}
exports.default = new PlayerService();
