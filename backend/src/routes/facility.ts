import express from 'express';
import { getFacilitiesForClub, upgradeFacility, getUpgradeProgress } from '../services/facilityService';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/facility/:clubId
router.get('/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const facilities = await getFacilitiesForClub(clubId);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_facilities', (req as any).language || 'en') });
  }
});

// POST /api/facility/upgrade
router.post('/upgrade', async (req, res) => {
  try {
    const { facilityId } = req.body;
    const facility = await upgradeFacility(facilityId);
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_upgrade_facility', (req as any).language || 'en') });
  }
});

// GET /api/facility/:clubId/progress
router.get('/:clubId/progress', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const progress = await getUpgradeProgress(clubId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_upgrade_progress', (req as any).language || 'en') });
  }
});

// GET /api/facility/:clubId/ticket-price
// Note: Using ClubFacility model which doesn't have ticketPrice - returning stub
router.get('/:facilityId/ticket-price', async (req, res) => {
  try {
    const clubId = parseInt(req.params.facilityId, 10);
    const facility = await prisma.clubFacility.findUnique({ where: { clubId } });
    if (!facility) {
      res.status(404).json({ error: t('error.facility_not_found', (req as any).language || 'en') });
      return;
    }
    // ticketPrice not in current schema - return default
    res.json({ ticketPrice: 25, message: 'Ticket pricing coming soon' });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_ticket_price', (req as any).language || 'en') });
  }
});

// PATCH /api/facility/:facilityId/ticket-price
// Note: Ticket price management is not yet implemented in the schema
router.patch('/:facilityId/ticket-price', async (req, res) => {
  try {
    const { ticketPrice } = req.body;
    if (typeof ticketPrice !== 'number' || ticketPrice < 1 || ticketPrice > 500) {
      res.status(400).json({ error: 'Invalid ticket price' });
      return;
    }
    // ticketPrice not in current schema - return stub success
    res.json({ ticketPrice, message: 'Ticket price updated (feature coming soon)' });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_ticket_price', (req as any).language || 'en') });
  }
});

export default router;