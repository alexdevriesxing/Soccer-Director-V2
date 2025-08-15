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
exports.automateCompetitions = exports.getCompetitionResults = exports.enterCompetition = exports.listCompetitions = void 0;
// Youth Competition Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const listCompetitions = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Filter by eligibility, region, etc.
    return prisma.youthCompetition.findMany({});
});
exports.listCompetitions = listCompetitions;
const enterCompetition = (clubId, competitionId) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Add logic to link club to competition (requires relation table if many-to-many)
    return { success: true, clubId, competitionId };
});
exports.enterCompetition = enterCompetition;
const getCompetitionResults = (competitionId) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Implement logic to fetch results/standings
    return prisma.youthCompetition.findUnique({ where: { id: competitionId } });
});
exports.getCompetitionResults = getCompetitionResults;
// Automation logic placeholder
const automateCompetitions = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    const year = new Date().getFullYear();
    const eligible = yield prisma.youthTournaments.findMany({ where: { year } });
    for (const comp of eligible) {
        const already = yield prisma.youthCompetitionEntry.findFirst({ where: { clubId, tournamentId: comp.id } });
        if (!already) {
            yield prisma.youthCompetitionEntry.create({ data: { clubId, tournamentId: comp.id, year } });
        }
    }
    return { entered: eligible.length };
});
exports.automateCompetitions = automateCompetitions;
