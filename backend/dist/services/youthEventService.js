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
exports.automateEventHandling = exports.interveneInEvent = exports.generateRandomEventsForClub = exports.getEventsForClub = exports.generateOffFieldEvent = void 0;
// Youth Event Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Placeholder for event storage (could be a DB table in a full implementation)
const eventStore = [];
const generateOffFieldEvent = (playerId, type, description) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Store in DB in production
    const event = { id: eventStore.length + 1, playerId, type, description, resolved: false, createdAt: new Date() };
    eventStore.push(event);
    return event;
});
exports.generateOffFieldEvent = generateOffFieldEvent;
const getEventsForClub = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Filter by club's youth players
    return eventStore.filter(e => e.playerId && e.resolved === false);
});
exports.getEventsForClub = getEventsForClub;
// Generate random events for all youth players in a club
const generateRandomEventsForClub = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all youth players (age <= 21)
    const players = yield prisma.player.findMany({ where: { clubId, age: { lte: 21 } } });
    const eventTypes = [
        { type: 'homesickness', effect: p => ({ morale: { decrement: 5 } }), description: 'is feeling homesick.' },
        { type: 'discipline', effect: p => ({ morale: { decrement: 3 } }), description: 'was late to training.' },
        { type: 'academic', effect: p => ({ academicGrade: { decrement: 0.5 } }), description: 'is struggling academically.' },
        { type: 'breakthrough', effect: p => ({ skill: { increment: 2 }, morale: { increment: 5 } }), description: 'had a breakthrough in training!' }
    ];
    const generatedEvents = [];
    for (const player of players) {
        if (Math.random() < 0.2) { // 20% chance for an event per player
            const eventType = randomFromArray(eventTypes);
            // Store event in memory (replace with DB in production)
            const event = { id: eventStore.length + 1, playerId: player.id, type: eventType.type, description: `${player.name} ${eventType.description}`, resolved: false, createdAt: new Date() };
            eventStore.push(event);
            generatedEvents.push(event);
        }
    }
    return generatedEvents;
});
exports.generateRandomEventsForClub = generateRandomEventsForClub;
// Intervene in an event: update player attributes based on event type
const interveneInEvent = (eventId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const event = eventStore.find(e => e.id === eventId);
    if (!event || event.resolved)
        return null;
    // Find the player
    const player = yield prisma.player.findUnique({ where: { id: event.playerId } });
    if (!player)
        return null;
    // Apply intervention effect based on event type and action
    if (event.type === 'homesickness' && action === 'counsel') {
        yield prisma.player.update({ where: { id: player.id }, data: { morale: { increment: 5 } } });
    }
    else if (event.type === 'discipline' && action === 'discipline') {
        yield prisma.player.update({ where: { id: player.id }, data: { morale: { decrement: 1 } } });
    }
    else if (event.type === 'academic' && action === 'tutor') {
        // If academicGrade is null, set to 6.0 first
        if (player.academicGrade == null) {
            yield prisma.player.update({ where: { id: player.id }, data: { academicGrade: 6.0 } });
        }
        yield prisma.player.update({ where: { id: player.id }, data: { academicGrade: { increment: 0.5 } } });
    }
    else if (event.type === 'breakthrough' && action === 'praise') {
        yield prisma.player.update({ where: { id: player.id }, data: { morale: { increment: 2 } } });
    }
    event.resolved = true;
    return event;
});
exports.interveneInEvent = interveneInEvent;
function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
// Automation logic placeholder
const automateEventHandling = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find unresolved events for this club's players
    const players = yield prisma.player.findMany({ where: { clubId } });
    const playerIds = players.map((p) => p.id);
    // Assume events are now stored in DB: OffFieldEvent
    const events = yield prisma.offFieldEvent.findMany({ where: { playerId: { in: playerIds }, resolved: false } });
    for (const event of events) {
        yield prisma.offFieldEvent.update({ where: { id: event.id }, data: { resolved: true, resolvedAt: new Date() } });
    }
    return { resolved: events.length };
});
exports.automateEventHandling = automateEventHandling;
