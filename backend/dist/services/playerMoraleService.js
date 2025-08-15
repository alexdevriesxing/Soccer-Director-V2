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
exports.PlayerMoraleService = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PlayerMoraleService {
    // Calculate player morale based on various factors
    static calculatePlayerMorale(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({
                where: { id: playerId },
                include: {
                    club: {
                        include: {
                            finances: { orderBy: { season: 'desc' }, take: 1 },
                            facilities: true
                        }
                    }
                }
            });
            if (!player || !player.clubId)
                return 50; // Default morale
            const factors = yield this.calculateMoraleFactors(player);
            // Weighted average of factors
            const weights = {
                playtime: 0.25,
                wage: 0.20,
                teamPerformance: 0.15,
                individualPerformance: 0.15,
                contractStatus: 0.10,
                managerRelationship: 0.10,
                facilities: 0.03,
                location: 0.02
            };
            let totalMorale = 0;
            let totalWeight = 0;
            for (const [factor, value] of Object.entries(factors)) {
                const weight = weights[factor] || 0;
                totalMorale += value * weight;
                totalWeight += weight;
            }
            return Math.round(totalMorale / totalWeight);
        });
    }
    // Calculate individual morale factors
    static calculateMoraleFactors(player) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = player.club;
            // Playtime factor (based on recent appearances)
            const recentFixtures = yield prisma.fixture.findMany({
                where: {
                    OR: [{ homeClubId: player.clubId }, { awayClubId: player.clubId }],
                    played: true
                },
                orderBy: { week: 'desc' },
                take: 10
            });
            let appearances = 0;
            for (const fixture of recentFixtures) {
                // Check if player was in starting XI or made appearance
                const startingXI = yield prisma.startingXI.findUnique({
                    where: { clubId: player.clubId },
                    include: { slots: true }
                });
                if (startingXI === null || startingXI === void 0 ? void 0 : startingXI.slots.some((slot) => slot.playerId === player.id)) {
                    appearances++;
                }
            }
            const playtime = Math.min(100, (appearances / recentFixtures.length) * 100);
            // Wage factor (compared to club average)
            const clubPlayers = yield prisma.player.findMany({ where: { clubId: player.clubId } });
            const avgWage = clubPlayers.reduce((sum, p) => sum + (p.wage || 0), 0) / clubPlayers.length;
            const wageRatio = avgWage > 0 ? (player.wage || 0) / avgWage : 1;
            const wage = Math.min(100, Math.max(0, 50 + (wageRatio - 1) * 50));
            // Team performance factor
            const teamStats = yield prisma.clubSeasonStats.findFirst({
                where: { clubId: player.clubId },
                orderBy: { season: 'desc' }
            });
            const teamPerformance = teamStats ? Math.min(100, Math.max(0, 50 + (teamStats.points || 0) * 2)) : 50;
            // Individual performance factor (based on skill and recent form)
            const individualPerformance = Math.min(100, player.skill + (player.morale || 0) * 0.1);
            // Contract status factor
            const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const contractStatus = daysUntilExpiry > 365 ? 100 : Math.max(0, daysUntilExpiry / 3.65);
            // Manager relationship factor (based on personality compatibility)
            const managerRelationship = 70 + (player.personality === 'PROFESSIONAL' ? 20 : 0);
            // Facilities factor
            const facilities = club.facilities && club.facilities.length > 0 ?
                Math.min(100, club.facilities.reduce((sum, f) => sum + (f.level || 0), 0) * 10) : 50;
            // Location factor (simplified)
            const location = 80; // Assume good location
            return {
                playtime,
                wage,
                teamPerformance,
                individualPerformance,
                contractStatus,
                managerRelationship,
                facilities,
                location
            };
        });
    }
    // Create a player request
    static createPlayerRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: data.playerId } });
            if (!player)
                throw new Error('Player not found');
            return yield prisma.playerRequest.create({
                data: {
                    playerId: data.playerId,
                    type: data.type,
                    priority: data.priority,
                    message: data.description, // Use description as message
                    demands: data.demands,
                    status: data.status,
                    createdAt: data.createdAt,
                    resolvedAt: data.resolvedAt
                }
            });
        });
    }
    // Get all requests for a club
    static getClubRequests(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const playerIds = players.map((p) => p.id);
            return yield prisma.playerRequest.findMany({
                where: { playerId: { in: playerIds } },
                include: { player: true },
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
        });
    }
    // Get requests for a specific player
    static getPlayerRequests(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.playerRequest.findMany({
                where: { playerId },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // Respond to a player request
    static respondToRequest(requestId, response, details) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield prisma.playerRequest.findUnique({ where: { id: requestId } });
            if (!request)
                throw new Error('Request not found');
            const updatedRequest = yield prisma.playerRequest.update({
                where: { id: requestId },
                data: {
                    status: response,
                    resolvedAt: response !== 'negotiating' ? new Date() : undefined,
                    demands: details && typeof request.demands === 'object'
                        ? Object.assign(Object.assign({}, request.demands), { response: details })
                        : (request.demands === null ? client_2.Prisma.JsonNull : request.demands)
                }
            });
            // Update player morale based on response
            yield this.updatePlayerMoraleFromRequest(request.playerId, request.type, response);
            return updatedRequest;
        });
    }
    // Update player morale based on request response
    static updatePlayerMoraleFromRequest(playerId, requestType, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                return;
            let moraleChange = 0;
            switch (requestType) {
                case 'transfer_request':
                    moraleChange = response === 'accepted' ? 20 : -10;
                    break;
                case 'playtime_demand':
                    moraleChange = response === 'accepted' ? 15 : -15;
                    break;
                case 'wage_demand':
                    moraleChange = response === 'accepted' ? 10 : -20;
                    break;
                case 'contract_extension':
                    moraleChange = response === 'accepted' ? 25 : -25;
                    break;
                case 'position_change':
                    moraleChange = response === 'accepted' ? 10 : -5;
                    break;
                case 'tactical_complaint':
                    moraleChange = response === 'accepted' ? 5 : -10;
                    break;
            }
            const newMorale = Math.max(0, Math.min(100, (player.morale || 50) + moraleChange));
            yield prisma.player.update({
                where: { id: playerId },
                data: { morale: newMorale }
            });
        });
    }
    // Trigger automatic requests based on player conditions
    static triggerAutomaticRequests(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const requests = [];
            for (const player of players) {
                const morale = yield this.calculatePlayerMorale(player.id);
                // Transfer request if morale is very low
                if (morale < 30 && Math.random() < 0.3) {
                    requests.push(yield this.createPlayerRequest({
                        playerId: player.id,
                        type: 'transfer_request',
                        priority: 'high',
                        description: `${player.name} is unhappy and wants to leave the club.`,
                        demands: { reason: 'low_morale', morale },
                        status: 'pending',
                        createdAt: new Date()
                    }));
                }
                // Playtime demand if player is not playing regularly
                const recentAppearances = yield this.getRecentAppearances(player.id);
                if (recentAppearances < 3 && Math.random() < 0.4) {
                    requests.push(yield this.createPlayerRequest({
                        playerId: player.id,
                        type: 'playtime_demand',
                        priority: 'medium',
                        description: `${player.name} wants more playing time.`,
                        demands: { currentAppearances: recentAppearances, desiredAppearances: 8 },
                        status: 'pending',
                        createdAt: new Date()
                    }));
                }
                // Wage demand if player is underpaid
                const clubPlayers = yield prisma.player.findMany({ where: { clubId } });
                const avgWage = clubPlayers.reduce((sum, p) => sum + (p.wage || 0), 0) / clubPlayers.length;
                if ((player.wage || 0) < avgWage * 0.7 && Math.random() < 0.2) {
                    requests.push(yield this.createPlayerRequest({
                        playerId: player.id,
                        type: 'wage_demand',
                        priority: 'medium',
                        description: `${player.name} wants a wage increase.`,
                        demands: { currentWage: player.wage, desiredWage: Math.floor(avgWage * 0.9) },
                        status: 'pending',
                        createdAt: new Date()
                    }));
                }
                // Contract extension if contract is expiring soon
                const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry < 180 && Math.random() < 0.5) {
                    requests.push(yield this.createPlayerRequest({
                        playerId: player.id,
                        type: 'contract_extension',
                        priority: 'high',
                        description: `${player.name} wants to extend their contract.`,
                        demands: { daysUntilExpiry, desiredLength: 2 },
                        status: 'pending',
                        createdAt: new Date()
                    }));
                }
            }
            return requests;
        });
    }
    // Get recent appearances for a player
    static getRecentAppearances(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recentFixtures = yield prisma.fixture.findMany({
                where: {
                    OR: [
                        { homeClub: { players: { some: { id: playerId } } } },
                        { awayClub: { players: { some: { id: playerId } } } }
                    ],
                    played: true
                },
                orderBy: { week: 'desc' },
                take: 10
            });
            let appearances = 0;
            for (const fixture of recentFixtures) {
                const startingXI = yield prisma.startingXI.findUnique({
                    where: { clubId: fixture.homeClubId === playerId ? fixture.homeClubId : fixture.awayClubId },
                    include: { slots: true }
                });
                if (startingXI === null || startingXI === void 0 ? void 0 : startingXI.slots.some((slot) => slot.playerId === playerId)) {
                    appearances++;
                }
            }
            return appearances;
        });
    }
    // Update all player morale for a club
    static updateClubMorale(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const updates = [];
            for (const player of players) {
                const newMorale = yield this.calculatePlayerMorale(player.id);
                updates.push(prisma.player.update({
                    where: { id: player.id },
                    data: { morale: newMorale }
                }));
            }
            yield Promise.all(updates);
            return { updatedPlayers: players.length };
        });
    }
    // Get morale statistics for a club
    static getClubMoraleStats(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const totalMorale = players.reduce((sum, p) => sum + (p.morale || 50), 0);
            const avgMorale = players.length > 0 ? totalMorale / players.length : 50;
            const moraleDistribution = {
                veryLow: players.filter((p) => (p.morale || 50) < 30).length,
                low: players.filter((p) => (p.morale || 50) >= 30 && (p.morale || 50) < 50).length,
                medium: players.filter((p) => (p.morale || 50) >= 50 && (p.morale || 50) < 70).length,
                high: players.filter((p) => (p.morale || 50) >= 70 && (p.morale || 50) < 90).length,
                veryHigh: players.filter((p) => (p.morale || 50) >= 90).length
            };
            const unhappyPlayers = players.filter((p) => (p.morale || 50) < 50);
            const happyPlayers = players.filter((p) => (p.morale || 50) >= 70);
            return {
                averageMorale: avgMorale,
                moraleDistribution,
                unhappyPlayers: unhappyPlayers.length,
                happyPlayers: happyPlayers.length,
                totalPlayers: players.length
            };
        });
    }
    // Get players at risk of making requests
    static getPlayersAtRisk(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const atRisk = [];
            for (const player of players) {
                const morale = yield this.calculatePlayerMorale(player.id);
                const riskFactors = [];
                if (morale < 40)
                    riskFactors.push('low_morale');
                if ((player.wage || 0) < 1000)
                    riskFactors.push('low_wage');
                if (player.contractExpiry.getTime() - Date.now() < 180 * 24 * 60 * 60 * 1000)
                    riskFactors.push('expiring_contract');
                if (riskFactors.length > 0) {
                    atRisk.push({
                        player,
                        morale,
                        riskFactors,
                        riskLevel: riskFactors.length > 2 ? 'high' : riskFactors.length > 1 ? 'medium' : 'low'
                    });
                }
            }
            return atRisk.sort((a, b) => b.riskFactors.length - a.riskFactors.length);
        });
    }
}
exports.PlayerMoraleService = PlayerMoraleService;
exports.default = PlayerMoraleService;
