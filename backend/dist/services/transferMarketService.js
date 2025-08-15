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
exports.TransferMarketService = void 0;
const i18n_1 = require("../utils/i18n");
class TransferMarketService {
    constructor(prisma, io) {
        this.prisma = prisma;
        this.io = io;
    }
    /**
     * List a player on the transfer market
     */
    listPlayer(playerId, askingPrice, clubId, transferDeadline) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield this.prisma.player.findUnique({
                where: { id: playerId },
                include: { club: true }
            });
            if (!player) {
                throw new Error((0, i18n_1.t)('errors.playerNotFound'));
            }
            if (player.clubId !== clubId) {
                throw new Error((0, i18n_1.t)('errors.notPlayerOwner'));
            }
            const existingListing = yield this.prisma.transfer.findFirst({
                where: {
                    playerId,
                    status: { in: ['LISTED', 'UNDER_OFFER'] }
                }
            });
            if (existingListing) {
                throw new Error((0, i18n_1.t)('errors.playerAlreadyListed'));
            }
            const transfer = yield this.prisma.transfer.create({
                data: {
                    playerId,
                    fromClubId: clubId,
                    askingPrice,
                    status: 'LISTED',
                    deadline: transferDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
                    history: [{
                            type: 'LISTED',
                            timestamp: new Date(),
                            details: { askingPrice, transferDeadline }
                        }]
                },
                include: {
                    player: true,
                    club: true,
                    offers: true
                }
            });
            // Notify about the new listing
            if (this.io) {
                this.io.emit('transfer:playerListed', transfer);
            }
            return transfer;
        });
    }
    /**
     * Make a transfer offer for a player
     */
    makeOffer(playerId_1, fromClubId_1, toClubId_1, fee_1, wage_1, contractLength_1) {
        return __awaiter(this, arguments, void 0, function* (playerId, fromClubId, toClubId, fee, wage, contractLength, clauses = {}) {
            // Validate the offer
            const [player, fromClub, toClub] = yield Promise.all([
                this.prisma.player.findUnique({ where: { id: playerId } }),
                this.prisma.club.findUnique({ where: { id: fromClubId } }),
                this.prisma.club.findUnique({ where: { id: toClubId } })
            ]);
            if (!player)
                throw new Error((0, i18n_1.t)('errors.playerNotFound'));
            if (!fromClub)
                throw new Error((0, i18n_1.t)('errors.clubNotFound', { id: fromClubId }));
            if (!toClub)
                throw new Error((0, i18n_1.t)('errors.clubNotFound', { id: toClubId }));
            // Check if player is listed for transfer
            const transfer = yield this.prisma.transfer.findFirst({
                where: {
                    playerId,
                    status: 'LISTED',
                    deadline: { gt: new Date() }
                }
            });
            if (!transfer) {
                throw new Error((0, i18n_1.t)('errors.playerNotListed'));
            }
            // Create the offer
            const offer = yield this.prisma.transferOffer.create({
                data: {
                    playerId,
                    fromClubId,
                    toClubId,
                    transferId: transfer.id,
                    fee,
                    wage,
                    contractLength,
                    clauses,
                    status: 'PENDING',
                    history: [{
                            type: 'OFFER_MADE',
                            timestamp: new Date(),
                            details: { fee, wage, contractLength, clauses }
                        }]
                },
                include: {
                    player: true,
                    fromClub: true,
                    toClub: true,
                    transfer: true
                }
            });
            // Update transfer status
            yield this.prisma.transfer.update({
                where: { id: transfer.id },
                data: { status: 'UNDER_OFFER' }
            });
            // Notify about the new offer
            if (this.io) {
                this.io.emit('transfer:offerMade', offer);
                this.io.to(`club:${toClubId}`).emit('transfer:offerReceived', offer);
            }
            return offer;
        });
    }
    /**
     * Respond to a transfer offer
     */
    respondToOffer(offerId, response, userId, counterOffer, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const offer = yield this.prisma.transferOffer.findUnique({
                where: { id: offerId },
                include: {
                    player: true,
                    fromClub: true,
                    toClub: true,
                    transfer: true
                }
            });
            if (!offer) {
                throw new Error((0, i18n_1.t)('errors.offerNotFound'));
            }
            // Verify user has permission to respond to this offer
            const club = yield this.prisma.club.findFirst({
                where: {
                    id: offer.toClubId,
                    userId
                }
            });
            if (!club) {
                throw new Error((0, i18n_1.t)('errors.unauthorized'));
            }
            // Update offer status
            const updatedOffer = yield this.prisma.transferOffer.update({
                where: { id: offerId },
                data: {
                    status: response,
                    updatedAt: new Date(),
                    history: [
                        ...(offer.history || []),
                        {
                            type: `OFFER_${response}`,
                            timestamp: new Date(),
                            details: { response, message, counterOffer }
                        }
                    ]
                },
                include: {
                    player: true,
                    fromClub: true,
                    toClub: true,
                    transfer: true
                }
            });
            // Handle the response
            if (response === 'ACCEPTED') {
                yield this.processTransfer(updatedOffer);
            }
            else if (response === 'COUNTERED' && counterOffer) {
                // Create a new counter offer
                yield this.makeOffer(offer.playerId, offer.toClubId, // The original toClub becomes the fromClub in the counter
                offer.fromClubId, // The original fromClub becomes the toClub in the counter
                counterOffer.fee, counterOffer.wage, counterOffer.contractLength, offer.clauses);
            }
            // Notify about the response
            if (this.io) {
                this.io.emit('transfer:offerUpdated', updatedOffer);
                this.io.to(`club:${offer.fromClubId}`).emit('transfer:offerResponse', {
                    offerId: offer.id,
                    response,
                    message,
                    counterOffer
                });
            }
            return {
                status: response,
                message,
                counterOffer: response === 'COUNTERED' ? counterOffer : undefined
            };
        });
    }
    /**
     * Process a transfer after an offer is accepted
     */
    processTransfer(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$transaction([
                // Update player's club
                this.prisma.player.update({
                    where: { id: offer.playerId },
                    data: {
                        clubId: offer.fromClubId,
                        wage: offer.wage,
                        contractExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + (offer.contractLength || 1)))
                    }
                }),
                // Update transfer status
                this.prisma.transfer.update({
                    where: { id: offer.transferId },
                    data: {
                        status: 'SOLD',
                        soldFor: offer.fee,
                        soldTo: offer.fromClubId,
                        soldAt: new Date()
                    }
                }),
                // Update club balances
                this.prisma.club.update({
                    where: { id: offer.toClubId },
                    data: { balance: { decrement: offer.fee } }
                }),
                this.prisma.club.update({
                    where: { id: offer.fromClubId },
                    data: { balance: { increment: offer.fee } }
                })
            ]);
        });
    }
    /**
     * Get transfer offers for a club
     */
    getClubTransferOffers(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, type = 'all', status) {
            const where = {};
            if (type === 'incoming' || type === 'all') {
                where.OR = [
                    ...(where.OR || []),
                    { toClubId: clubId }
                ];
            }
            if (type === 'outgoing' || type === 'all') {
                where.OR = [
                    ...(where.OR || []),
                    { fromClubId: clubId }
                ];
            }
            if (status) {
                where.status = status;
            }
            return this.prisma.transferOffer.findMany({
                where,
                include: {
                    player: true,
                    fromClub: true,
                    toClub: true,
                    transfer: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        });
    }
    /**
     * Get transfer history for a player
     */
    getPlayerTransferHistory(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.transferOffer.findMany({
                where: {
                    playerId,
                    status: { in: ['ACCEPTED', 'REJECTED'] }
                },
                include: {
                    player: true,
                    fromClub: true,
                    toClub: true,
                    transfer: true
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });
        });
    }
    /**
     * Withdraw a player from the transfer market
     */
    withdrawPlayer(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const listing = yield this.prisma.transfer.findFirst({
                where: {
                    playerId,
                    status: { in: ['LISTED', 'UNDER_OFFER'] }
                },
                include: {
                    player: true,
                    club: true,
                    offers: true
                }
            });
            if (!listing) {
                throw new Error((0, i18n_1.t)('errors.noActiveListing'));
            }
            // Update the listing status
            const updatedListing = yield this.prisma.transfer.update({
                where: { id: listing.id },
                data: {
                    status: 'WITHDRAWN',
                    updatedAt: new Date(),
                    history: [
                        ...(listing.history || []),
                        {
                            type: 'WITHDRAWN',
                            timestamp: new Date(),
                            details: {}
                        }
                    ]
                },
                include: {
                    player: true,
                    club: true,
                    offers: true
                }
            });
            // Reject all pending offers
            yield this.prisma.transferOffer.updateMany({
                where: {
                    transferId: listing.id,
                    status: 'PENDING'
                },
                data: {
                    status: 'REJECTED',
                    updatedAt: new Date(),
                    history: {
                        push: {
                            type: 'OFFER_REJECTED',
                            timestamp: new Date(),
                            details: { reason: 'Listing withdrawn' }
                        }
                    }
                }
            });
            // Notify about the withdrawal
            if (this.io) {
                this.io.emit('transfer:playerWithdrawn', updatedListing);
            }
            return updatedListing;
        });
    }
    /**
     * Get transfer market statistics
     */
    getTransferMarketStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalListings, activeListings, totalTransfers, totalOffers, highestTransfer] = yield Promise.all([
                this.prisma.transfer.count(),
                this.prisma.transfer.count({
                    where: { status: { in: ['LISTED', 'UNDER_OFFER'] } }
                }),
                this.prisma.transfer.count({
                    where: { status: 'SOLD' }
                }),
                this.prisma.transferOffer.count(),
                this.prisma.transfer.findFirst({
                    where: { status: 'SOLD' },
                    orderBy: { soldFor: 'desc' },
                    include: { player: true }
                })
            ]);
            return {
                totalListings,
                activeListings,
                totalTransfers,
                totalOffers,
                highestTransfer: highestTransfer ? {
                    player: highestTransfer.player,
                    fee: highestTransfer.soldFor,
                    date: highestTransfer.soldAt
                } : null
            };
        });
    }
}
exports.TransferMarketService = TransferMarketService;
