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
exports.callUpPlayersForInternationalDuty = callUpPlayersForInternationalDuty;
exports.resetInternationalDuty = resetInternationalDuty;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Randomly selects eligible players for international duty and updates their status in the DB.
 * @param week The current week number (optional, for future use)
 * @param callUpRate The probability (0-1) that an eligible player is called up (default: 0.5)
 * @returns The list of called-up players
 */
function callUpPlayersForInternationalDuty(week_1) {
    return __awaiter(this, arguments, void 0, function* (week, callUpRate = 0.5) {
        // Find all eligible players
        const eligiblePlayers = yield prisma.player.findMany({
            where: {
                internationalCaps: { gt: 0 },
                injured: false,
                onInternationalDuty: false,
            },
        });
        // Randomly select players to call up
        const calledUp = eligiblePlayers.filter(() => Math.random() < callUpRate);
        const calledUpIds = calledUp.map(p => p.id);
        // Update their status in the DB
        yield prisma.player.updateMany({
            where: { id: { in: calledUpIds } },
            data: { onInternationalDuty: true },
        });
        return calledUp;
    });
}
/**
 * Resets all players' onInternationalDuty flag to false (after the break)
 */
function resetInternationalDuty() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.player.updateMany({
            where: { onInternationalDuty: true },
            data: { onInternationalDuty: false },
        });
    });
}
