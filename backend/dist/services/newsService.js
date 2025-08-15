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
exports.createNewsItem = createNewsItem;
exports.createManagerDecision = createManagerDecision;
exports.getNewsItemsByMatch = getNewsItemsByMatch;
exports.getManagerDecisionsByMatch = getManagerDecisionsByMatch;
exports.resolveManagerDecision = resolveManagerDecision;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Generate news items for a match and store them in the database.
 * @param matchId The ID of the match (fixture)
 * @param clubId The club involved
 * @param playerId Optional player involved
 * @param type The type of news (e.g., 'result', 'injury')
 * @param headline The news headline
 * @param content The news content
 */
function createNewsItem(_a) {
    return __awaiter(this, arguments, void 0, function* ({ matchId, clubId, playerId, type, headline, content }) {
        try {
            return yield prisma.newsItem.create({
                data: {
                    fixtureId: matchId,
                    clubId,
                    playerId,
                    type,
                    headline,
                    content,
                },
            });
        }
        catch (error) {
            throw new Error('Failed to create news item: ' + error.message);
        }
    });
}
/**
 * Generate a manager decision for a match and store it in the database.
 * @param matchId The ID of the match (fixture)
 * @param clubId The club involved
 * @param playerId Optional player involved
 * @param type The type of decision (e.g., 'tactical', 'discipline')
 * @param description The decision description
 * @param options The options for the manager (array of strings)
 */
function createManagerDecision(_a) {
    return __awaiter(this, arguments, void 0, function* ({ matchId, clubId, playerId, type, description, options }) {
        try {
            return yield prisma.managerDecision.create({
                data: {
                    fixtureId: matchId,
                    clubId,
                    playerId,
                    type,
                    description,
                    options,
                },
            });
        }
        catch (error) {
            throw new Error('Failed to create manager decision: ' + error.message);
        }
    });
}
/**
 * Fetch all news items for a given match.
 */
function getNewsItemsByMatch(matchId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.newsItem.findMany({ where: { fixtureId: matchId }, orderBy: { createdAt: 'asc' } });
    });
}
/**
 * Fetch all manager decisions for a given match.
 */
function getManagerDecisionsByMatch(matchId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.managerDecision.findMany({ where: { fixtureId: matchId }, orderBy: { createdAt: 'asc' } });
    });
}
/**
 * Resolve a manager decision by setting the selected option and marking as resolved.
 */
function resolveManagerDecision(decisionId, selectedOption) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.managerDecision.update({
            where: { id: decisionId },
            data: { selectedOption, resolved: true },
        });
    });
}
