import express from 'express';
import { TacticalFamiliarityService } from '../services/tacticalFamiliarityService';

const router = express.Router();

// GET /api/tactical-familiarity/:clubId/:tactic
router.get('/:clubId/:tactic', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const tactic = req.params.tactic;
    const familiarity = await TacticalFamiliarityService.getTacticalFamiliarity(clubId, tactic);
    res.json({ familiarity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tactical familiarity' });
  }
});

// POST /api/tactical-familiarity/:clubId/:tactic
router.post('/:clubId/:tactic', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const tactic = req.params.tactic;
    const { familiarity, notes } = req.body;
    const result = await TacticalFamiliarityService.setTacticalFamiliarity(clubId, tactic, familiarity, notes);
    res.json({ familiarity: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set tactical familiarity' });
  }
});

// POST /api/tactical-familiarity/:clubId/:tactic/calculate
router.post('/:clubId/:tactic/calculate', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const tactic = req.params.tactic;
    const { context } = req.body;
    const familiarity = await TacticalFamiliarityService.calculateTacticalFamiliarity(clubId, tactic, context);
    res.json({ familiarity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate tactical familiarity' });
  }
});

export default router; 