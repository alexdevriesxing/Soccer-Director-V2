import { Router } from 'express';
import { transferListingService } from '../services/transferListing.service';
import { transferOfferService } from '../services/transferOffer.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

// List a player for transfer/loan
router.post(
  '/listings',
  authenticate,
  validate({
    body: z.object({
      playerId: z.number().int().positive(),
      askingPrice: z.number().min(0),
      listingType: z.enum(['TRANSFER', 'LOAN', 'BOTH']),
      loanFee: z.number().min(0).optional(),
      wageContribution: z.number().min(0).optional()
    })
  }),
  async (req, res, next) => {
    try {
      const listing = await transferListingService.listPlayer({
        ...req.body,
        clubId: req.user.clubId
      });
      res.status(201).json(listing);
    } catch (error) {
      logger.error('Error creating transfer listing:', error);
      next(error);
    }
  }
);

// Get active transfer listings
router.get(
  '/listings',
  validate({
    query: z.object({
      position: z.string().optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
      clubId: z.string().optional(),
      leagueId: z.string().optional()
    })
  }),
  async (req, res, next) => {
    try {
      const filters: any = {};
      
      if (req.query.position) filters.position = req.query.position as string;
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
      if (req.query.clubId) filters.clubId = parseInt(req.query.clubId as string);
      if (req.query.leagueId) filters.leagueId = parseInt(req.query.leagueId as string);
      
      const listings = await transferListingService.getActiveListings(filters);
      res.json(listings);
    } catch (error) {
      logger.error('Error fetching transfer listings:', error);
      next(error);
    }
  }
);

// Cancel a transfer listing
router.delete(
  '/listings/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
      }
      
      await transferListingService.cancelListing(listingId, req.user.clubId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error cancelling transfer listing:', error);
      next(error);
    }
  }
);

// Make a transfer/loan offer
router.post(
  '/offers',
  authenticate,
  validate({
    body: z.object({
      transferListingId: z.number().int().positive(),
      amount: z.number().min(0),
      wageContribution: z.number().min(0).optional(),
      isLoanOffer: z.boolean().default(false),
      loanDuration: z.number().int().positive().max(24).optional(),
      isLoanWithOption: z.boolean().default(false),
      optionToBuyFee: z.number().min(0).optional()
    })
  }),
  async (req, res, next) => {
    try {
      const offer = await transferOfferService.createOffer({
        ...req.body,
        biddingClubId: req.user.clubId
      });
      res.status(201).json(offer);
    } catch (error) {
      logger.error('Error creating transfer offer:', error);
      next(error);
    }
  }
);

// Respond to transfer offer
router.post(
  '/offers/:id/respond',
  authenticate,
  validate({
    body: z.object({
      response: z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
      counterOffer: z.number().min(0).optional()
    })
  }),
  async (req, res, next) => {
    try {
      const offerId = parseInt(req.params.id);
      if (isNaN(offerId)) {
        return res.status(400).json({ message: 'Invalid offer ID' });
      }
      
      const result = await transferOfferService.respondToOffer(
        offerId,
        req.body.response,
        req.body.counterOffer
      );
      
      res.json(result);
    } catch (error) {
      logger.error('Error responding to transfer offer:', error);
      next(error);
    }
  }
);

// Get club's transfer offers
router.get(
  '/offers',
  authenticate,
  validate({
    query: z.object({
      status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED']).optional()
    })
  }),
  async (req, res, next) => {
    try {
      const offers = await transferOfferService.getClubOffers(
        req.user.clubId,
        req.query.status as any
      );
      res.json(offers);
    } catch (error) {
      logger.error('Error fetching transfer offers:', error);
      next(error);
    }
  }
);

export default router;
