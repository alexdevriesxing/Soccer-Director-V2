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
exports.TransferService = exports.OfferStatus = exports.ListingStatus = exports.ForbiddenError = exports.BadRequestError = exports.NotFoundError = void 0;
exports.getTransferListingWithRelations = getTransferListingWithRelations;
exports.getTransferOfferWithRelations = getTransferOfferWithRelations;
const client_1 = require("@prisma/client");
// Custom error classes for the transfer service
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
// Export enums for external use
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["COMPLETED"] = "COMPLETED";
    ListingStatus["CANCELLED"] = "CANCELLED";
    ListingStatus["EXPIRED"] = "EXPIRED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "PENDING";
    OfferStatus["ACCEPTED"] = "ACCEPTED";
    OfferStatus["REJECTED"] = "REJECTED";
    OfferStatus["WITHDRAWN"] = "WITHDRAWN";
    OfferStatus["EXPIRED"] = "EXPIRED";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
/**
 * Service class for handling transfer-related operations
 */
class TransferService {
    /**
     * Get the Prisma client instance
     */
    static get prisma() {
        if (!TransferService.instance) {
            TransferService.instance = new client_1.PrismaClient();
        }
        return TransferService.instance;
    }
    /**
     * Get the Socket.IO server instance
     */
    static get io() {
        if (!TransferService.ioInstance) {
            throw new Error('Socket.IO instance not initialized. Call initialize() first.');
        }
        return TransferService.ioInstance;
    }
    /**
     * Initialize the service with required dependencies
     * @param ioInstance Socket.IO server instance
     */
    static initialize(ioInstance) {
        if (ioInstance) {
            TransferService.ioInstance = ioInstance;
        }
    }
    /**
     * Helper function to safely emit socket.io events
     * @param event Event name
     * @param data Event data
     * @param room Optional room to emit to
     */
    static emitSocketEvent(event, data, room) {
        try {
            if (room) {
                this.io.to(room).emit(event, data);
            }
            else {
                this.io.emit(event, data);
            }
        }
        catch (error) {
            console.error('Error emitting socket event:', error);
        }
    }
}
exports.TransferService = TransferService;
TransferService.ioInstance = null;
// Helper functions
function getTransferListingWithRelations(prisma, id) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.transferListing.findUnique({
            where: { id },
            include: {
                player: true,
                club: true,
                transferOffers: true
            }
        });
    });
}
function getTransferOfferWithRelations(prisma, id) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.transferOffer.findUnique({
            where: { id },
            include: {
                listing: true,
                toClub: true
            }
        });
    });
}
