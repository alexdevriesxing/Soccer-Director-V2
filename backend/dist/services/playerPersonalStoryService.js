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
exports.getPersonalStoriesForPlayer = exports.updatePersonalStory = exports.createPersonalStory = void 0;
exports.maybeTriggerPersonalStory = maybeTriggerPersonalStory;
// Player Personal Story Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a personal story for a player
const createPersonalStory = (playerId, type, description, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerPersonalStory.create({
        data: { playerId, type, description, startDate, endDate }
    });
});
exports.createPersonalStory = createPersonalStory;
// Update a personal story (e.g., set endDate or description)
const updatePersonalStory = (storyId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerPersonalStory.update({
        where: { id: storyId },
        data
    });
});
exports.updatePersonalStory = updatePersonalStory;
// Fetch all personal stories for a player
const getPersonalStoriesForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerPersonalStory.findMany({ where: { playerId } });
});
exports.getPersonalStoriesForPlayer = getPersonalStoriesForPlayer;
// Utility: Maybe trigger a personal story for a player (to be called in weekly simulation)
function maybeTriggerPersonalStory(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // 5% chance per week
        if (Math.random() < 0.05) {
            const types = ['family', 'adversity', 'ambition'];
            const type = types[Math.floor(Math.random() * types.length)];
            let description = '';
            let effects = {};
            if (type === 'family') {
                description = 'Family member fell ill, affecting focus.';
                effects = { morale: -5 };
            }
            else if (type === 'adversity') {
                description = 'Overcame a tough period in training.';
                effects = { morale: +5 };
            }
            else if (type === 'ambition') {
                description = 'Expressed ambition to play for a top club.';
                effects = { ambition: +1 };
            }
            const story = yield (0, exports.createPersonalStory)(playerId, type, description, new Date());
            return { story, effects };
        }
        return null;
    });
}
