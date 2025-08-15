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
exports.getTraitsForPlayer = exports.revealTrait = exports.assignTrait = void 0;
// Player Trait Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Assign a trait to a player
const assignTrait = (playerId, trait) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerTrait.create({
        data: { playerId, trait, revealed: false }
    });
});
exports.assignTrait = assignTrait;
// Reveal a trait for a player
const revealTrait = (traitId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerTrait.update({
        where: { id: traitId },
        data: { revealed: true }
    });
});
exports.revealTrait = revealTrait;
// Fetch all traits for a player
const getTraitsForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerTrait.findMany({ where: { playerId } });
});
exports.getTraitsForPlayer = getTraitsForPlayer;
