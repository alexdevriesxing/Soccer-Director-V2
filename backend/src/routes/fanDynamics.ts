import express from 'express';
import FanDynamicsService from '../services/fanDynamicsService';
import * as fanService from '../services/fanService';

const router = express.Router();

// Get fan satisfaction for a club
router.get('/satisfaction/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const satisfaction = await FanDynamicsService.calculateFanSatisfaction(clubId);
    res.json(satisfaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fan satisfaction' });
  }
});

// Get fan groups for a club
router.get('/groups/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const groups = await FanDynamicsService.getFanGroups(clubId);
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fan groups' });
  }
});

// Create a new fan group
router.post('/groups/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { name, size } = req.body;
    if (!name || !size) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const group = await FanDynamicsService.createFanGroup(clubId, name, size);
    res.status(201).json({ group });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fan group' });
  }
});

// Update fan group satisfaction
router.put('/groups/:groupId/satisfaction', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const { satisfaction } = req.body;
    if (satisfaction === undefined) {
      res.status(400).json({ error: 'Missing satisfaction value' });
      return;
    }
    await FanDynamicsService.updateFanGroupSatisfaction(groupId, satisfaction);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fan group satisfaction' });
  }
});

// Get fan reactions
router.get('/reactions/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const reactions = await FanDynamicsService.triggerAutomaticFanReactions(clubId);
    res.json({ reactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fan reactions' });
  }
});

// Get fan analytics
router.get('/analytics/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const analytics = await FanDynamicsService.getFanAnalytics(clubId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fan analytics' });
  }
});

// Fan demands endpoint
router.post('/demands/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { type, description } = req.body;
    if (!type || !description) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const event = await fanService.triggerFanReaction(clubId, type, description);
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fan demand' });
  }
});

// Get overall sentiment
router.get('/sentiment/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const sentiment = await fanService.calculateOverallSentiment(clubId);
    res.json({ clubId, sentiment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fan sentiment' });
  }
});

export default router;