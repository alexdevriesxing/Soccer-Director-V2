import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import { FanService } from '../services/fanService';

const router = express.Router();

// GET /api/fan/groups/:clubId
router.get('/groups/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const groups = await FanService.getFanGroups(clubId);
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_fan_groups') });
  }
});

// GET /api/fan/events/:fanGroupId
router.get('/events/:fanGroupId', async (req, res) => {
  try {
    const fanGroupId = parseInt(req.params.fanGroupId, 10);
    const events = await FanService.getFanEvents(fanGroupId);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_fan_events') });
  }
});

// GET /api/fan/sentiment/:fanGroupId
router.get('/sentiment/:fanGroupId', async (req, res) => {
  try {
    const fanGroupId = parseInt(req.params.fanGroupId, 10);
    const sentiment = await FanService.getFanSentiments(fanGroupId);
    res.json({ sentiment });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_fan_sentiment') });
  }
});

// POST /api/fan/event
router.post('/event', async (req, res) => {
  try {
    const { fanGroupId, type, description, date } = req.body;
    const event = await FanService.createFanEvent({ fanGroupId, type, description, date });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_fan_event') });
  }
});

// POST /api/fan/protest
router.post('/protest', async (req, res) => {
  try {
    const { fanGroupId, description, date } = req.body;
    const event = await FanService.triggerFanEvent(fanGroupId, 'protest', description, date ? new Date(date) : new Date());
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_fan_protest') });
  }
});

export default router; 