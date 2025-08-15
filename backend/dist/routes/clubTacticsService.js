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
exports.ClubTacticsService = exports.DuplicateError = exports.ValidationError = exports.NotFoundError = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotFoundError extends Error {
}
exports.NotFoundError = NotFoundError;
class ValidationError extends Error {
}
exports.ValidationError = ValidationError;
class DuplicateError extends Error {
}
exports.DuplicateError = DuplicateError;
class ClubTacticsService {
    // --- SET PIECE SPECIALISTS ---
    static getSetPieceSpecialists(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const playerIds = players.map(p => p.id);
            return prisma.setPieceSpecialists.findMany({ where: { playerId: { in: playerIds } } });
        });
    }
    static addSetPieceSpecialist(clubId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { playerId, type, skill, successRate, attempts, goals } = data;
            // Validate player belongs to club
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player || player.clubId !== clubId)
                throw new ValidationError('Player does not belong to this club');
            // Prevent duplicate specialist for same player/type
            const existing = yield prisma.setPieceSpecialists.findFirst({ where: { playerId, type } });
            if (existing)
                throw new DuplicateError('Specialist for this player and type already exists');
            const specialistData = { playerId, type, skill };
            if (successRate !== undefined)
                specialistData.successRate = successRate;
            if (attempts !== undefined)
                specialistData.attempts = attempts;
            if (goals !== undefined)
                specialistData.goals = goals;
            return prisma.setPieceSpecialists.create({ data: specialistData });
        });
    }
    static updateSetPieceSpecialist(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const specialist = yield prisma.setPieceSpecialists.findUnique({ where: { id } });
            if (!specialist)
                throw new NotFoundError('Specialist not found');
            return prisma.setPieceSpecialists.update({ where: { id }, data });
        });
    }
    static deleteSetPieceSpecialist(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const specialist = yield prisma.setPieceSpecialists.findUnique({ where: { id } });
            if (!specialist)
                throw new NotFoundError('Specialist not found');
            yield prisma.setPieceSpecialists.delete({ where: { id } });
            return true;
        });
    }
    // --- CLUB TACTICS & STRATEGY ---
    static getTactics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const formation = yield prisma.clubFormation.findFirst({ where: { clubId } });
            const strategy = yield prisma.clubStrategy.findFirst({ where: { clubId } });
            return { formation, strategy };
        });
    }
    static updateTactics(clubId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { formation, style, intensity, width, tempo, approach, defensiveStyle, attackingStyle, setPieces, marking } = data;
            let updatedFormation = null;
            let updatedStrategy = null;
            if (formation || style || intensity !== undefined || width !== undefined || tempo !== undefined) {
                const existing = yield prisma.clubFormation.findFirst({ where: { clubId } });
                const formationData = {};
                if (formation !== undefined)
                    formationData.formation = formation;
                if (style !== undefined)
                    formationData.style = style;
                if (intensity !== undefined)
                    formationData.intensity = intensity;
                if (width !== undefined)
                    formationData.width = width;
                if (tempo !== undefined)
                    formationData.tempo = tempo;
                if (existing) {
                    updatedFormation = yield prisma.clubFormation.update({ where: { id: existing.id }, data: formationData });
                }
                else {
                    updatedFormation = yield prisma.clubFormation.create({ data: Object.assign({ clubId }, formationData) });
                }
            }
            if (approach || defensiveStyle || attackingStyle || setPieces || marking) {
                const existing = yield prisma.clubStrategy.findFirst({ where: { clubId } });
                const strategyData = {};
                if (approach !== undefined)
                    strategyData.approach = approach;
                if (defensiveStyle !== undefined)
                    strategyData.defensiveStyle = defensiveStyle;
                if (attackingStyle !== undefined)
                    strategyData.attackingStyle = attackingStyle;
                if (setPieces !== undefined)
                    strategyData.setPieces = setPieces;
                if (marking !== undefined)
                    strategyData.marking = marking;
                if (existing) {
                    updatedStrategy = yield prisma.clubStrategy.update({ where: { id: existing.id }, data: strategyData });
                }
                else {
                    updatedStrategy = yield prisma.clubStrategy.create({ data: Object.assign({ clubId }, strategyData) });
                }
            }
            return { formation: updatedFormation, strategy: updatedStrategy };
        });
    }
}
exports.ClubTacticsService = ClubTacticsService;
