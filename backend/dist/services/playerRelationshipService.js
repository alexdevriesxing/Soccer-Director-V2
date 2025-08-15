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
exports.getRelationshipsForPlayer = exports.updateRelationship = exports.createRelationship = void 0;
// Player Relationship Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a relationship between two players
const createRelationship = (playerAId, playerBId, type, strength) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerRelationship.create({
        data: { playerAId, playerBId, type, strength }
    });
});
exports.createRelationship = createRelationship;
// Update relationship strength or type
const updateRelationship = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerRelationship.update({
        where: { id },
        data
    });
});
exports.updateRelationship = updateRelationship;
// Fetch all relationships for a player
const getRelationshipsForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.playerRelationship.findMany({
        where: { OR: [{ playerAId: playerId }, { playerBId: playerId }] }
    });
});
exports.getRelationshipsForPlayer = getRelationshipsForPlayer;
// Logic for forming/breaking relationships can be added here 
