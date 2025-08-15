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
exports.selectBestXIForClub = selectBestXIForClub;
exports.setStartingXIForClub = setStartingXIForClub;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Selects the best starting XI for a club using a 4-4-2 formation.
 * Considers skill, fitness, and availability (not injured, not on international duty, not on loan).
 * Returns an array of Player objects representing the best XI.
 */
function selectBestXIForClub(clubId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch all available players for the club, including their loans
        const players = yield prisma.player.findMany({
            where: {
                clubId,
                injured: false,
                onInternationalDuty: false,
            },
            include: {
                loans: true,
            },
            orderBy: [
                { skill: 'desc' },
                { morale: 'desc' },
            ],
        });
        // Filter out players who are currently on loan (have an active loan)
        const availablePlayers = players.filter(p => !p.loans.some(loan => loan.status === 'active'));
        // Define a standard 4-4-2 formation
        const formation = [
            { position: 'GK', count: 1 },
            { position: 'DEF', count: 4 },
            { position: 'MID', count: 4 },
            { position: 'FWD', count: 2 },
        ];
        const selectedXI = [];
        const usedPlayerIds = new Set();
        for (const { position, count } of formation) {
            const candidates = availablePlayers.filter(p => p.position === position && !usedPlayerIds.has(p.id));
            for (let i = 0; i < count && i < candidates.length; i++) {
                const player = candidates[i];
                if (player) {
                    selectedXI.push(player);
                    usedPlayerIds.add(player.id);
                }
            }
        }
        // If not enough players for a position, fill with best available remaining players
        if (selectedXI.length < 11) {
            const remaining = availablePlayers.filter(p => !usedPlayerIds.has(p.id));
            for (let i = 0; i < 11 - selectedXI.length && i < remaining.length; i++) {
                selectedXI.push(remaining[i]);
            }
        }
        return selectedXI;
    });
}
/**
 * Sets the starting XI for a club by creating or updating the StartingXI and StartingXISlot records.
 * @param clubId The club's ID
 * @param xi Array of { id: number, position: string, order: number }
 */
function setStartingXIForClub(clubId, xi) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find or create the StartingXI record for the club
        let startingXI = yield prisma.startingXI.findUnique({
            where: { clubId },
            include: { slots: true },
        });
        if (!startingXI) {
            startingXI = Object.assign(Object.assign({}, (yield prisma.startingXI.create({
                data: {
                    clubId,
                },
            }))), { slots: [] });
        }
        else {
            // Delete existing slots
            yield prisma.startingXISlot.deleteMany({ where: { startingXIId: startingXI.id } });
        }
        // Create new slots for the XI
        yield prisma.startingXISlot.createMany({
            data: xi.map((p, idx) => {
                var _a;
                return ({
                    startingXIId: startingXI.id,
                    playerId: p.id,
                    position: p.position,
                    order: (_a = p.order) !== null && _a !== void 0 ? _a : idx + 1,
                });
            }),
        });
    });
}
