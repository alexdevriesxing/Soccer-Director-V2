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

// GET /api/facility/:facilityId/ticket-price
router.get('/:facilityId/ticket-price', async (req, res) => {
  try {
    const facilityId = parseInt(req.params.facilityId, 10);
    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    if (!facility || facility.type !== 'stadium') {
      return res.status(404).json({ error: t('error.facility_not_found', (req as any).language || 'en') });
    }
    res.json({ ticketPrice: facility.ticketPrice });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_ticket_price', (req as any).language || 'en') });
  }
});

// PATCH /api/facility/:facilityId/ticket-price
router.patch('/:facilityId/ticket-price', async (req, res) => {
  try {
    const facilityId = parseInt(req.params.facilityId, 10);
    const { ticketPrice } = req.body;
    if (typeof ticketPrice !== 'number' || ticketPrice < 1 || ticketPrice > 500) {
      return res.status(400).json({ error: 'Invalid ticket price' });
    }
    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    if (!facility || facility.type !== 'stadium') {
      return res.status(404).json({ error: t('error.facility_not_found', (req as any).language || 'en') });
    }
    const updated = await prisma.facility.update({ where: { id: facilityId }, data: { ticketPrice } });
    res.json({ ticketPrice: updated.ticketPrice });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_ticket_price', (req as any).language || 'en') });
  }
});

export default router; 