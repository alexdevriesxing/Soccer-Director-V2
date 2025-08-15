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
exports.transferListingService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TransferListingService {
    listPlayer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const player = yield tx.player.findUnique({
                    where: { id: params.playerId },
                    include: { club: true }
                });
                if (!player)
                    throw new Error('Player not found');
                if (player.clubId !== params.clubId) {
                    throw new Error('Player does not belong to your club');
                }
                const existingListing = yield tx.transferListing.findFirst({
                    where: {
                        playerId: params.playerId,
                        status: 'ACTIVE'
                    }
                });
                if (existingListing) {
                    throw new Error('Player is already listed for transfer');
                }
                return tx.transferListing.create({
                    data: {
                        playerId: params.playerId,
                        clubId: params.clubId,
                        askingPrice: params.askingPrice,
                        listingType: params.listingType,
                        loanFee: params.loanFee,
                        wageContribution: params.wageContribution,
                        status: 'ACTIVE'
                    },
                    include: {
                        player: true,
                        club: true
                    }
                });
            }));
        });
    }
    getActiveListings() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            const where = { status: 'ACTIVE' };
            if (filters.position) {
                where.player = { position: filters.position };
            }
            if (filters.minPrice !== undefined) {
                where.askingPrice = { gte: filters.minPrice };
            }
            if (filters.maxPrice !== undefined) {
                where.askingPrice = Object.assign(Object.assign({}, where.askingPrice), { lte: filters.maxPrice });
            }
            if (filters.clubId) {
                where.clubId = filters.clubId;
            }
            if (filters.leagueId) {
                where.club = { leagueId: filters.leagueId };
            }
            return prisma.transferListing.findMany({
                where,
                include: {
                    player: {
                        include: {
                            club: {
                                include: {
                                    league: true
                                }
                            }
                        }
                    },
                    club: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    cancelListing(listingId, clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const listing = yield tx.transferListing.findUnique({
                    where: { id: listingId }
                });
                if (!listing)
                    throw new Error('Listing not found');
                if (listing.clubId !== clubId) {
                    throw new Error('Not authorized to cancel this listing');
                }
                if (listing.status !== 'ACTIVE') {
                    throw new Error('Only active listings can be cancelled');
                }
                return tx.transferListing.update({
                    where: { id: listingId },
                    data: { status: 'CANCELLED' }
                });
            }));
        });
    }
}
exports.transferListingService = new TransferListingService();
