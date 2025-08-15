import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/regulatory/warnings/:clubId
router.get('/warnings/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const warnings = await prisma.regulatoryWarning.findMany({ where: { clubId } });
    res.json({ warnings });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_regulatory_warnings') });
  }
});

// GET /api/regulatory/status/:clubId
router.get('/status/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { regulatoryStatus: true, complianceDeadline: true } });
    res.json({ status: club?.regulatoryStatus, complianceDeadline: club?.complianceDeadline });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_regulatory_status') });
  }
});

// GET /api/regulatory/bailouts/:clubId
router.get('/bailouts/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const bailouts = await prisma.governmentBailout.findMany({ where: { clubId } });
    res.json({ bailouts });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_bailouts') });
  }
});

// GET /api/regulatory/bankruptcy/:clubId
router.get('/bankruptcy/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const events = await prisma.bankruptcyEvent.findMany({ where: { clubId } });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_bankruptcy_events') });
  }
});

export default router; 