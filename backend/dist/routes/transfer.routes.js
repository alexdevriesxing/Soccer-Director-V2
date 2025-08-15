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
const express_1 = require("express");
const transferListing_service_1 = require("../services/transferListing.service");
const transferOffer_service_1 = require("../services/transferOffer.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// List a player for transfer/loan
router.post('/listings', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)({
    body: zod_1.z.object({
        playerId: zod_1.z.number().int().positive(),
        askingPrice: zod_1.z.number().min(0),
        listingType: zod_1.z.enum(['TRANSFER', 'LOAN', 'BOTH']),
        loanFee: zod_1.z.number().min(0).optional(),
        wageContribution: zod_1.z.number().min(0).optional()
    })
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listing = yield transferListing_service_1.transferListingService.listPlayer(Object.assign(Object.assign({}, req.body), { clubId: req.user.clubId }));
        res.status(201).json(listing);
    }
    catch (error) {
        logger_1.logger.error('Error creating transfer listing:', error);
        next(error);
    }
}));
// Get active transfer listings
router.get('/listings', (0, validation_middleware_1.validate)({
    query: zod_1.z.object({
        position: zod_1.z.string().optional(),
        minPrice: zod_1.z.string().optional(),
        maxPrice: zod_1.z.string().optional(),
        clubId: zod_1.z.string().optional(),
        leagueId: zod_1.z.string().optional()
    })
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {};
        if (req.query.position)
            filters.position = req.query.position;
        if (req.query.minPrice)
            filters.minPrice = parseFloat(req.query.minPrice);
        if (req.query.maxPrice)
            filters.maxPrice = parseFloat(req.query.maxPrice);
        if (req.query.clubId)
            filters.clubId = parseInt(req.query.clubId);
        if (req.query.leagueId)
            filters.leagueId = parseInt(req.query.leagueId);
        const listings = yield transferListing_service_1.transferListingService.getActiveListings(filters);
        res.json(listings);
    }
    catch (error) {
        logger_1.logger.error('Error fetching transfer listings:', error);
        next(error);
    }
}));
// Cancel a transfer listing
router.delete('/listings/:id', auth_middleware_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = parseInt(req.params.id);
        if (isNaN(listingId)) {
            return res.status(400).json({ message: 'Invalid listing ID' });
        }
        yield transferListing_service_1.transferListingService.cancelListing(listingId, req.user.clubId);
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error('Error cancelling transfer listing:', error);
        next(error);
    }
}));
// Make a transfer/loan offer
router.post('/offers', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)({
    body: zod_1.z.object({
        transferListingId: zod_1.z.number().int().positive(),
        amount: zod_1.z.number().min(0),
        wageContribution: zod_1.z.number().min(0).optional(),
        isLoanOffer: zod_1.z.boolean().default(false),
        loanDuration: zod_1.z.number().int().positive().max(24).optional(),
        isLoanWithOption: zod_1.z.boolean().default(false),
        optionToBuyFee: zod_1.z.number().min(0).optional()
    })
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = yield transferOffer_service_1.transferOfferService.createOffer(Object.assign(Object.assign({}, req.body), { biddingClubId: req.user.clubId }));
        res.status(201).json(offer);
    }
    catch (error) {
        logger_1.logger.error('Error creating transfer offer:', error);
        next(error);
    }
}));
// Respond to transfer offer
router.post('/offers/:id/respond', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)({
    body: zod_1.z.object({
        response: zod_1.z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
        counterOffer: zod_1.z.number().min(0).optional()
    })
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offerId = parseInt(req.params.id);
        if (isNaN(offerId)) {
            return res.status(400).json({ message: 'Invalid offer ID' });
        }
        const result = yield transferOffer_service_1.transferOfferService.respondToOffer(offerId, req.body.response, req.body.counterOffer);
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error('Error responding to transfer offer:', error);
        next(error);
    }
}));
// Get club's transfer offers
router.get('/offers', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)({
    query: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED']).optional()
    })
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offers = yield transferOffer_service_1.transferOfferService.getClubOffers(req.user.clubId, req.query.status);
        res.json(offers);
    }
    catch (error) {
        logger_1.logger.error('Error fetching transfer offers:', error);
        next(error);
    }
}));
exports.default = router;
