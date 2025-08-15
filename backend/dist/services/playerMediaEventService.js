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
exports.getMediaEventsForPlayer = exports.updateMediaEvent = exports.createMediaEvent = void 0;
exports.maybeTriggerMediaEvent = maybeTriggerMediaEvent;
// Player Media Event Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a media event for a player
const createMediaEvent = (playerId, type, headline, content) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerMediaEvent.create({
        data: { playerId, type, headline, content }
    });
});
exports.createMediaEvent = createMediaEvent;
// Update a media event (e.g., set headline or content)
const updateMediaEvent = (eventId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerMediaEvent.update({
        where: { id: eventId },
        data
    });
});
exports.updateMediaEvent = updateMediaEvent;
// Fetch all media events for a player
const getMediaEventsForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerMediaEvent.findMany({ where: { playerId } });
});
exports.getMediaEventsForPlayer = getMediaEventsForPlayer;
// Utility: Maybe trigger a media event for a player (to be called after habit/story events)
function maybeTriggerMediaEvent(playerId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        // 20% chance to trigger a scandal after a poor habit
        if (context === 'scandal' && Math.random() < 0.2) {
            const event = yield (0, exports.createMediaEvent)(playerId, 'scandal', 'Caught on camera at nightclub', 'Player was seen partying after a loss.');
            return { event, effect: { reputation: -5, morale: -3 } };
        }
        // 10% chance to trigger a viral interview after an ambition story
        if (context === 'ambition' && Math.random() < 0.1) {
            const event = yield (0, exports.createMediaEvent)(playerId, 'interview', 'Ambitious interview goes viral', 'Player expressed desire to play for a top club.');
            return { event, effect: { reputation: +3 } };
        }
        return null;
    });
}
