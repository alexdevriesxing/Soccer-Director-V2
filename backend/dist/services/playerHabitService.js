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
exports.getHabitsForPlayer = exports.updateHabit = exports.createHabit = void 0;
exports.maybeUpdatePlayerHabitsAfterMatch = maybeUpdatePlayerHabitsAfterMatch;
// Player Habit Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a habit for a player
const createHabit = (playerId, habit, value) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerHabit.create({
        data: { playerId, habit, value }
    });
});
exports.createHabit = createHabit;
// Update a habit (e.g., set value or lastUpdated)
const updateHabit = (habitId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerHabit.update({
        where: { id: habitId },
        data
    });
});
exports.updateHabit = updateHabit;
// Fetch all habits for a player
const getHabitsForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerHabit.findMany({ where: { playerId } });
});
exports.getHabitsForPlayer = getHabitsForPlayer;
// Utility: Maybe update player habits after a match (to be called in match simulation)
function maybeUpdatePlayerHabitsAfterMatch(playerId, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // 10% chance to worsen nightlife after a win, 10% chance to improve diet after a loss
        let effect = null;
        if (result === 'win' && Math.random() < 0.1) {
            // Worsen nightlife
            yield updateHabitForType(playerId, 'nightlife', 'poor');
            effect = { nightlife: 'poor' };
        }
        else if (result === 'loss' && Math.random() < 0.1) {
            // Improve diet
            yield updateHabitForType(playerId, 'diet', 'good');
            effect = { diet: 'good' };
        }
        return effect;
    });
}
// Helper to update a specific habit type for a player
function updateHabitForType(playerId, habit, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield prisma.playerHabit.findFirst({ where: { playerId, habit } });
        if (existing) {
            yield prisma.playerHabit.update({ where: { id: existing.id }, data: { value, lastUpdated: new Date() } });
        }
        else {
            yield prisma.playerHabit.create({ data: { playerId, habit, value } });
        }
    });
}
