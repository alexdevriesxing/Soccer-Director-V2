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
exports.getInjuriesForPlayer = exports.updateInjury = exports.logInjury = void 0;
// Player Injury Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Log a new injury for a player
const logInjury = (playerId, type, severity, startDate, endDate, description) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerInjury.create({
        data: { playerId, type, severity, startDate, endDate, description }
    });
});
exports.logInjury = logInjury;
// Update an injury (e.g., set endDate or description)
const updateInjury = (injuryId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerInjury.update({
        where: { id: injuryId },
        data
    });
});
exports.updateInjury = updateInjury;
// Fetch all injuries for a player
const getInjuriesForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerInjury.findMany({ where: { playerId } });
});
exports.getInjuriesForPlayer = getInjuriesForPlayer;
