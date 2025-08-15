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
exports.transferOfferService = void 0;
const client_1 = require("@prisma/client");
const transfer_service_1 = require("./transfer.service");
const prisma = new client_1.PrismaClient();
class TransferOfferService {
    createOffer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const listing = yield tx.transferListing.findUnique({
                    where: { id: params.transferListingId },
                    include: {
                        player: true,
                        club: true
                    }
                });
                if (!listing)
                    throw new Error('Transfer listing not found');
                if (listing.status !== 'ACTIVE')
                    throw new Error('Listing is not active');
                if (params.biddingClubId === listing.clubId) {
                    throw new Error('Cannot make an offer for your own player');
                }
                const bidAmount = params.amount;
                if (bidAmount < (listing.askingPrice * 0.8)) {
                    throw new Error('Bid amount is too low (must be at least 80% of asking price)');
                }
                const biddingClub = yield tx.club.findUnique({
                    where: { id: params.biddingClubId },
                    select: { balance: true }
                });
                if (!biddingClub)
                    throw new Error('Bidding club not found');
                if (biddingClub.balance < bidAmount) {
                    throw new Error('Insufficient funds for this transfer');
                }
                // Check for existing pending offers from this club for the same player
                const existingOffer = yield tx.transferOffer.findFirst({
                    where: {
                        transferListingId: params.transferListingId,
                        biddingClubId: params.biddingClubId,
                        status: 'PENDING'
                    }
                });
                if (existingOffer) {
                    throw new Error('You already have a pending offer for this player');
                }
                return tx.transferOffer.create({
                    data: {
                        transferListingId: params.transferListingId,
                        biddingClubId: params.biddingClubId,
                        amount: bidAmount,
                        wageContribution: params.wageContribution,
                        status: 'PENDING',
                        isLoanOffer: params.isLoanOffer,
                        loanDuration: params.loanDuration,
                        isLoanWithOption: params.isLoanWithOption,
                        optionToBuyFee: params.optionToBuyFee
                    },
                    include: {
                        transferListing: {
                            include: {
                                player: true,
                                club: true
                            }
                        },
                        biddingClub: true
                    }
                });
            }));
        });
    }
    respondToOffer(offerId, response, counterOffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const offer = yield tx.transferOffer.findUnique({
                    where: { id: offerId },
                    include: {
                        transferListing: {
                            include: {
                                player: true,
                                club: true
                            }
                        },
                        biddingClub: true
                    }
                });
                if (!offer)
                    throw new Error('Offer not found');
                if (offer.status !== 'PENDING') {
                    throw new Error('Offer has already been processed');
                }
                if (response === 'ACCEPT') {
                    // Process the transfer
                    const transfer = yield transfer_service_1.transferService.createTransfer({
                        fromClubId: offer.transferListing.clubId,
                        toClubId: offer.biddingClubId,
                        playerId: offer.transferListing.playerId,
                        fee: offer.amount,
                        wageContribution: offer.wageContribution || 0,
                        transferType: offer.isLoanOffer ?
                            (offer.isLoanWithOption ? 'LOAN_WITH_OPTION' : 'LOAN') :
                            'PERMANENT',
                        loanDuration: offer.loanDuration,
                        optionToBuyFee: offer.optionToBuyFee
                    });
                    // Update listing status
                    yield tx.transferListing.update({
                        where: { id: offer.transferListingId },
                        data: { status: 'COMPLETED' }
                    });
                    // Reject all other pending offers for this player
                    yield tx.transferOffer.updateMany({
                        where: {
                            transferListingId: offer.transferListingId,
                            id: { not: offer.id },
                            status: 'PENDING'
                        },
                        data: { status: 'REJECTED' }
                    });
                    // Update offer status
                    return tx.transferOffer.update({
                        where: { id: offerId },
                        data: { status: 'ACCEPTED' },
                        include: {
                            transferListing: {
                                include: {
                                    player: true,
                                    club: true
                                }
                            },
                            biddingClub: true
                        }
                    });
                }
                else if (response === 'REJECT') {
                    return tx.transferOffer.update({
                        where: { id: offerId },
                        data: { status: 'REJECTED' },
                        include: {
                            transferListing: {
                                include: {
                                    player: true,
                                    club: true
                                }
                            },
                            biddingClub: true
                        }
                    });
                }
                else if (response === 'COUNTER' && counterOffer) {
                    if (counterOffer <= offer.amount) {
                        throw new Error('Counter offer must be higher than the current offer');
                    }
                    return tx.transferOffer.update({
                        where: { id: offerId },
                        data: {
                            status: 'COUNTERED',
                            counteredAmount: counterOffer
                        },
                        include: {
                            transferListing: {
                                include: {
                                    player: true,
                                    club: true
                                }
                            },
                            biddingClub: true
                        }
                    });
                }
                else {
                    throw new Error('Invalid response or missing counter offer amount');
                }
            }));
        });
    }
    getClubOffers(clubId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                OR: [
                    { biddingClubId: clubId },
                    { 'transferListing': { clubId } }
                ]
            };
            if (status) {
                where.status = status;
            }
            return prisma.transferOffer.findMany({
                where,
                include: {
                    transferListing: {
                        include: {
                            player: true,
                            club: true
                        }
                    },
                    biddingClub: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
}
exports.transferOfferService = new TransferOfferService();
