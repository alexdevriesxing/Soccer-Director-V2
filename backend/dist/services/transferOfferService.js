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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TransferOfferService {
    /**
     * Create a new transfer offer with negotiation details.
     */
    static createOffer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ playerId, fromClubId, toClubId, initiator, fee, clauses, deadline }) {
            const offer = yield prisma.transferOffer.create({
                data: {
                    playerId,
                    fromClubId,
                    toClubId,
                    initiator,
                    status: 'pending',
                    fee,
                    clauses,
                    deadline,
                    history: JSON.stringify([])
                }
            });
            return offer;
        });
    }
    /**
     * Respond to an existing offer (accept, reject, counter, withdraw).
     */
    static respondToOffer(offerId, response, update) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const offer = yield prisma.transferOffer.findUnique({ where: { id: offerId } });
            if (!offer)
                throw new Error('Offer not found');
            // Update history
            const history = Array.isArray(offer.history) ? offer.history : JSON.parse(offer.history);
            history.push(Object.assign({ timestamp: new Date().toISOString(), response }, update));
            const updatedOffer = yield prisma.transferOffer.update({
                where: { id: offerId },
                data: {
                    status: response,
                    fee: (_a = update.fee) !== null && _a !== void 0 ? _a : offer.fee,
                    clauses: (update.clauses === null || update.clauses === undefined) ? client_1.Prisma.JsonNull : update.clauses,
                    deadline: (_b = update.deadline) !== null && _b !== void 0 ? _b : offer.deadline,
                    initiator: (_c = update.initiator) !== null && _c !== void 0 ? _c : offer.initiator,
                    history: JSON.stringify(history)
                }
            });
            return updatedOffer;
        });
    }
    /**
     * Get a transfer offer by ID.
     */
    static getOfferById(offerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.transferOffer.findUnique({ where: { id: offerId } });
        });
    }
    /**
     * Get all offers for a player.
     */
    static getOffersForPlayer(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.transferOffer.findMany({ where: { playerId }, orderBy: { createdAt: 'desc' } });
        });
    }
    /**
     * Get all offers for a club (as buyer or seller).
     */
    static getOffersForClub(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.transferOffer.findMany({
                where: {
                    OR: [
                        { fromClubId: clubId },
                        { toClubId: clubId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
}
exports.default = TransferOfferService;
