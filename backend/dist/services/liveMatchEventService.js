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
exports.LiveMatchEventService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class LiveMatchEventService {
    // Create a new match event
    static createEvent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.liveMatchEvent.create({
                data: Object.assign(Object.assign({}, data), { description: data.description || '', coordinates: data.coordinates ? JSON.stringify(data.coordinates) : undefined, varReview: data.varReview ? JSON.stringify(data.varReview) : undefined }),
                include: {
                    player: { select: { id: true, name: true, position: true } },
                    club: { select: { id: true, name: true } }
                }
            });
        });
    }
    // Get all events for a fixture
    static getEventsByFixture(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.liveMatchEvent.findMany({
                where: { fixtureId },
                orderBy: { minute: 'asc' },
                include: {
                    player: { select: { id: true, name: true, position: true } },
                    club: { select: { id: true, name: true } }
                }
            });
        });
    }
    // Get events by type for a fixture
    static getEventsByType(fixtureId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.liveMatchEvent.findMany({
                where: { fixtureId, type },
                orderBy: { minute: 'asc' },
                include: {
                    player: { select: { id: true, name: true, position: true } },
                    club: { select: { id: true, name: true } }
                }
            });
        });
    }
    // Create a VAR review
    static createVARReview(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalEvent = yield prisma.liveMatchEvent.findUnique({
                where: { id: data.originalEventId }
            });
            if (!originalEvent) {
                throw new Error('Original event not found');
            }
            return yield prisma.liveMatchEvent.create({
                data: {
                    fixtureId: data.fixtureId,
                    type: 'VAR_REVIEW',
                    minute: originalEvent.minute,
                    description: `VAR Review: ${data.decision} - ${data.reason}`,
                    varReview: JSON.stringify({
                        originalEventId: data.originalEventId,
                        decision: data.decision,
                        reason: data.reason,
                        duration: data.duration,
                        refereeConsultation: data.refereeConsultation
                    })
                },
                include: {
                    player: { select: { id: true, name: true, position: true } },
                    club: { select: { id: true, name: true } }
                }
            });
        });
    }
    // Create a weather event
    static createWeatherEvent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.liveMatchEvent.create({
                data: {
                    fixtureId: data.fixtureId,
                    type: 'WEATHER',
                    minute: data.minute,
                    description: data.description || ''
                }
            });
        });
    }
    // Create a referee decision
    static createRefereeDecision(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.liveMatchEvent.create({
                data: {
                    fixtureId: data.fixtureId,
                    type: 'REFEREE_DECISION',
                    minute: data.minute,
                    playerId: data.playerId,
                    clubId: data.clubId,
                    description: data.description || ''
                },
                include: {
                    player: { select: { id: true, name: true, position: true } },
                    club: { select: { id: true, name: true } }
                }
            });
        });
    }
    // Get match statistics
    static getMatchStatistics(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield this.getEventsByFixture(fixtureId);
            const stats = {
                goals: events.filter((e) => e.type === 'GOAL').length,
                yellowCards: events.filter((e) => e.type === 'YELLOW_CARD').length,
                redCards: events.filter((e) => e.type === 'RED_CARD').length,
                varReviews: events.filter((e) => e.type === 'VAR_REVIEW').length,
                injuries: events.filter((e) => e.type === 'INJURY').length,
                substitutions: events.filter((e) => e.type === 'SUBSTITUTION').length,
                weatherEvents: events.filter((e) => e.type === 'WEATHER').length,
                refereeDecisions: events.filter((e) => e.type === 'REFEREE_DECISION').length
            };
            return { statistics: stats, events };
        });
    }
    // Generate realistic match events for a fixture
    static generateMatchEvents(fixtureId, homeClubId, awayClubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = [];
            // Get fixture details
            const fixture = yield prisma.fixture.findUnique({
                where: { id: fixtureId },
                include: {
                    homeClub: { include: { players: true } },
                    awayClub: { include: { players: true } }
                }
            });
            if (!fixture) {
                throw new Error('Fixture not found');
            }
            // Generate goals
            const homeGoals = fixture.homeGoals || 0;
            const awayGoals = fixture.awayGoals || 0;
            for (let i = 0; i < homeGoals; i++) {
                const minute = Math.floor(Math.random() * 90) + 1;
                const scorer = fixture.homeClub.players[Math.floor(Math.random() * fixture.homeClub.players.length)];
                events.push({
                    fixtureId,
                    type: 'GOAL',
                    minute,
                    playerId: scorer.id,
                    clubId: homeClubId,
                    description: `Goal scored by ${scorer.name}`
                });
            }
            for (let i = 0; i < awayGoals; i++) {
                const minute = Math.floor(Math.random() * 90) + 1;
                const scorer = fixture.awayClub.players[Math.floor(Math.random() * fixture.awayClub.players.length)];
                events.push({
                    fixtureId,
                    type: 'GOAL',
                    minute,
                    playerId: scorer.id,
                    clubId: awayClubId,
                    description: `Goal scored by ${scorer.name}`
                });
            }
            // Generate cards
            const totalCards = Math.floor(Math.random() * 6) + 2; // 2-7 cards
            for (let i = 0; i < totalCards; i++) {
                const minute = Math.floor(Math.random() * 90) + 1;
                const isYellow = Math.random() > 0.2; // 80% yellow, 20% red
                const club = Math.random() > 0.5 ? fixture.homeClub : fixture.awayClub;
                const player = club.players[Math.floor(Math.random() * club.players.length)];
                events.push({
                    fixtureId,
                    type: isYellow ? 'YELLOW_CARD' : 'RED_CARD',
                    minute,
                    playerId: player.id,
                    clubId: club.id,
                    description: `${isYellow ? 'Yellow' : 'Red'} card for ${player.name}`
                });
            }
            // Generate substitutions
            const substitutions = Math.floor(Math.random() * 6) + 3; // 3-8 substitutions
            for (let i = 0; i < substitutions; i++) {
                const minute = Math.floor(Math.random() * 90) + 1;
                const club = Math.random() > 0.5 ? fixture.homeClub : fixture.awayClub;
                const player = club.players[Math.floor(Math.random() * club.players.length)];
                events.push({
                    fixtureId,
                    type: 'SUBSTITUTION',
                    minute,
                    playerId: player.id,
                    clubId: club.id,
                    description: `Substitution: ${player.name}`
                });
            }
            // Generate weather events (rare)
            if (Math.random() > 0.8) {
                const weatherConditions = ['RAIN', 'SNOW', 'STRONG_WIND', 'HEAT'];
                const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
                events.push({
                    fixtureId,
                    type: 'WEATHER',
                    minute: Math.floor(Math.random() * 90) + 1,
                    description: `Weather condition: ${condition}`
                });
            }
            // Save all events
            for (const event of events) {
                yield this.createEvent(event);
            }
            return events;
        });
    }
    // Update an existing event
    static updateEvent(eventId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = Object.assign({}, data);
            if (updateData.coordinates && typeof updateData.coordinates === 'object') {
                updateData.coordinates = JSON.stringify(updateData.coordinates);
            }
            if (updateData.varReview && typeof updateData.varReview === 'object') {
                updateData.varReview = JSON.stringify(updateData.varReview);
            }
            return yield prisma.liveMatchEvent.update({
                where: { id: eventId },
                data: updateData,
                include: {
                    player: { select: { id: true, name: true, position: true } },
                    club: { select: { id: true, name: true } }
                }
            });
        });
    }
    // Delete an event
    static deleteEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.liveMatchEvent.delete({
                where: { id: eventId }
            });
        });
    }
}
exports.LiveMatchEventService = LiveMatchEventService;
exports.default = LiveMatchEventService;
