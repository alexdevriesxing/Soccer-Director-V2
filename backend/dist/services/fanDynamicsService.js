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
exports.FanDynamicsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class FanDynamicsService {
    // Calculate overall fan satisfaction for a club
    static calculateFanSatisfaction(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({
                where: { id: clubId },
                include: {
                    homeFixtures: true,
                    awayFixtures: true
                }
            });
            if (!club)
                throw new Error('Club not found');
            // Merge home and away fixtures
            const fixtures = [...(club.homeFixtures || []), ...(club.awayFixtures || [])];
            // Calculate satisfaction factors
            const matchResults = this.calculateMatchResultsSatisfaction(fixtures);
            const entertainment = this.calculateEntertainmentSatisfaction(fixtures);
            const ticketPrices = this.calculateTicketPriceSatisfaction(fixtures);
            const facilities = this.calculateFacilitiesSatisfaction(fixtures);
            const communication = 70 + Math.random() * 20; // Simplified
            const community = 75 + Math.random() * 15; // Simplified
            const overallSatisfaction = Math.round((matchResults + entertainment + ticketPrices + facilities + communication + community) / 6);
            const satisfaction = {
                clubId,
                overallSatisfaction,
                matchResults,
                entertainment,
                ticketPrices,
                facilities,
                communication,
                community,
                lastUpdated: new Date()
            };
            // No fanSatisfaction model in Prisma, so just return the calculated object
            return satisfaction;
        });
    }
    // Calculate match results satisfaction
    static calculateMatchResultsSatisfaction(fixtures) {
        if (fixtures.length === 0)
            return 50;
        const recentResults = fixtures.slice(0, 5);
        let satisfaction = 50;
        for (const fixture of recentResults) {
            const isHome = fixture.homeClubId === fixture.clubId;
            const goalsFor = isHome ? fixture.homeGoals : fixture.awayGoals;
            const goalsAgainst = isHome ? fixture.awayGoals : fixture.homeGoals;
            if (goalsFor > goalsAgainst) {
                satisfaction += 10; // Win
            }
            else if (goalsFor === goalsAgainst) {
                satisfaction += 5; // Draw
            }
            else {
                satisfaction -= 5; // Loss
            }
            // Bonus for goals scored
            satisfaction += goalsFor * 2;
            // Penalty for goals conceded
            satisfaction -= goalsAgainst * 1;
        }
        return Math.max(0, Math.min(100, satisfaction));
    }
    // Calculate entertainment satisfaction
    static calculateEntertainmentSatisfaction(fixtures) {
        if (fixtures.length === 0)
            return 50;
        const avgSkill = fixtures.reduce((sum, f) => sum + f.homeGoals + f.awayGoals, 0) / fixtures.length;
        const starPlayers = fixtures.filter((f) => f.homeGoals + f.awayGoals > 5).length;
        const youngPlayers = fixtures.filter((f) => f.homeGoals + f.awayGoals < 3).length;
        let satisfaction = 50;
        // Skill factor
        satisfaction += (avgSkill - 50) * 0.5;
        // Star players factor
        satisfaction += starPlayers * 5;
        // Youth factor
        satisfaction += youngPlayers * 2;
        return Math.max(0, Math.min(100, satisfaction));
    }
    // Calculate ticket price satisfaction
    static calculateTicketPriceSatisfaction(fixtures) {
        if (fixtures.length === 0)
            return 70;
        const avgTicketPrice = fixtures.reduce((sum, f) => sum + f.avgTicketPrice, 0) / fixtures.length;
        const baseSatisfaction = 80;
        // Lower prices = higher satisfaction
        if (avgTicketPrice < 20) {
            return baseSatisfaction + 15;
        }
        else if (avgTicketPrice < 30) {
            return baseSatisfaction + 5;
        }
        else if (avgTicketPrice < 40) {
            return baseSatisfaction - 5;
        }
        else {
            return baseSatisfaction - 15;
        }
    }
    // Calculate facilities satisfaction
    static calculateFacilitiesSatisfaction(fixtures) {
        if (fixtures.length === 0)
            return 60;
        const avgLevel = fixtures.reduce((sum, f) => sum + f.facilityLevel, 0) / fixtures.length;
        const satisfaction = 50 + avgLevel * 5;
        return Math.max(0, Math.min(100, satisfaction));
    }
    // Create fan group
    static createFanGroup(clubId, name, size) {
        return __awaiter(this, void 0, void 0, function* () {
            const fanGroup = {
                id: 0,
                clubId,
                name,
                size,
                // Removed: demands, createdAt, satisfaction
            };
            const created = yield prisma.fanGroup.create({
                data: {
                    clubId,
                    name,
                    size,
                    // Removed: demands, createdAt, satisfaction
                }
            });
            return Object.assign(Object.assign({}, fanGroup), { id: created.id });
        });
    }
    // Get fan groups for a club
    static getFanGroups(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const groups = yield prisma.fanGroup.findMany({
                where: { clubId },
                orderBy: { size: 'desc' }
            });
            return groups;
        });
    }
    // Update fan group satisfaction
    static updateFanGroupSatisfaction(groupId, satisfaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // No satisfaction field in FanGroup model, so this is a no-op or can be removed
            return;
        });
    }
    // Trigger automatic fan reactions based on club events
    static triggerAutomaticFanReactions(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({
                where: { id: clubId },
                include: {
                    homeFixtures: {
                        where: { played: true },
                        orderBy: { week: 'desc' },
                        take: 1
                    },
                    awayFixtures: {
                        where: { played: true },
                        orderBy: { week: 'desc' },
                        take: 1
                    },
                    finances: { orderBy: { season: 'desc' }, take: 1 }
                }
            });
            if (!club)
                throw new Error('Club not found');
            const reactions = [];
            // React to recent match results
            if (club.homeFixtures.length > 0 || club.awayFixtures.length > 0) {
                const latestFixture = club.homeFixtures.length > 0 ? club.homeFixtures[0] : club.awayFixtures[0];
                const isHome = latestFixture.homeClubId === clubId;
                const goalsFor = isHome ? latestFixture.homeGoals : latestFixture.awayGoals;
                const goalsAgainst = isHome ? latestFixture.awayGoals : latestFixture.homeGoals;
                if (goalsFor != null && goalsAgainst != null) {
                    let reaction;
                    let intensity;
                    let description;
                    if (goalsFor > goalsAgainst) {
                        reaction = 'positive';
                        intensity = 70 + Math.random() * 20;
                        description = `Fans celebrate ${goalsFor}-${goalsAgainst} victory`;
                    }
                    else if (goalsFor === goalsAgainst) {
                        reaction = 'neutral';
                        intensity = 40 + Math.random() * 20;
                        description = `Fans react to ${goalsFor}-${goalsAgainst} draw`;
                    }
                    else {
                        reaction = 'negative';
                        intensity = 60 + Math.random() * 30;
                        description = `Fans disappointed with ${goalsFor}-${goalsAgainst} loss`;
                    }
                    // No fanReaction model, so skip creating reactions
                }
            }
            // React to financial changes
            if (club.finances.length > 0) {
                const finances = club.finances[0];
                // No avgTicketPrice field or fanReaction model, so skip this logic
            }
            // React to player transfers
            const recentTransfers = yield prisma.transfer.findMany({
                where: {
                    OR: [
                        { fromClubId: clubId },
                        { toClubId: clubId }
                    ]
                },
                orderBy: { date: 'desc' },
                take: 1
            });
            if (recentTransfers.length > 0) {
                const transfer = recentTransfers[0];
                const isIncoming = transfer.toClubId === clubId;
                if (isIncoming) {
                    // No fanReaction model, so skip creating reactions
                }
                else {
                    // No fanReaction model, so skip creating reactions
                }
            }
            return reactions;
        });
    }
    // Get fan analytics for a club
    static getFanAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const satisfaction = yield this.calculateFanSatisfaction(clubId);
            // No fan reactions model or method, so skip reactions
            const reactions = [];
            const groups = yield this.getFanGroups(clubId);
            const analytics = {
                satisfaction,
                reactionTrends: this.analyzeReactionTrends(reactions),
                groupInfluence: this.analyzeGroupInfluence(groups),
                fanSentiment: this.calculateFanSentiment(reactions),
                recommendations: this.generateFanRecommendations(satisfaction, reactions, groups)
            };
            return analytics;
        });
    }
    // Analyze reaction trends
    static analyzeReactionTrends(reactions) {
        const trends = {
            positive: 0,
            negative: 0,
            neutral: 0,
            outraged: 0,
            ecstatic: 0
        };
        for (const reaction of reactions) {
            if (trends[reaction.reaction] !== undefined) {
                trends[reaction.reaction]++;
            }
        }
        const total = reactions.length;
        if (total > 0) {
            for (const key in trends) {
                trends[key] = Math.round((trends[key] / total) * 100);
            }
        }
        return trends;
    }
    // Analyze group influence
    static analyzeGroupInfluence(groups) {
        const influence = {
            ultras: 0,
            casual: 0,
            family: 0,
            corporate: 0,
            international: 0
        };
        for (const group of groups) {
            // Map group names to influence types
            const groupType = group.name.toLowerCase().includes('ultra') ? 'ultras' :
                group.name.toLowerCase().includes('casual') ? 'casual' :
                    group.name.toLowerCase().includes('family') ? 'family' :
                        group.name.toLowerCase().includes('corporate') ? 'corporate' :
                            group.name.toLowerCase().includes('international') ? 'international' : 'casual';
            influence[groupType] += group.size;
        }
        return influence;
    }
    // Calculate fan sentiment
    static calculateFanSentiment(reactions) {
        if (reactions.length === 0)
            return 50;
        let sentiment = 50;
        let totalWeight = 0;
        for (const reaction of reactions) {
            const weight = reaction.intensity / 100;
            let score = 50;
            switch (reaction.reaction) {
                case 'ecstatic':
                    score = 90;
                    break;
                case 'positive':
                    score = 75;
                    break;
                case 'neutral':
                    score = 50;
                    break;
                case 'negative':
                    score = 25;
                    break;
                case 'outraged':
                    score = 10;
                    break;
            }
            sentiment += score * weight;
            totalWeight += weight;
        }
        return totalWeight > 0 ? Math.round(sentiment / totalWeight) : 50;
    }
    // Generate fan recommendations
    static generateFanRecommendations(satisfaction, reactions, groups) {
        const recommendations = [];
        if (satisfaction.overallSatisfaction < 60) {
            recommendations.push('Consider improving match day experience');
        }
        if (satisfaction.ticketPrices < 60) {
            recommendations.push('Review ticket pricing strategy');
        }
        if (satisfaction.facilities < 60) {
            recommendations.push('Upgrade stadium facilities');
        }
        const negativeReactions = reactions.filter(r => r.reaction === 'negative' || r.reaction === 'outraged');
        if (negativeReactions.length > reactions.length * 0.4) {
            recommendations.push('Address fan concerns through better communication');
        }
        const influentialGroups = groups.filter(g => g.size > 10); // Assuming size is the indicator
        if (influentialGroups.length > 0) {
            recommendations.push('Engage with influential fan groups');
        }
        return recommendations;
    }
}
exports.FanDynamicsService = FanDynamicsService;
exports.default = FanDynamicsService;
