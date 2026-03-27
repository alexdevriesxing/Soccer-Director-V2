import express from 'express';

const router = express.Router();

// In-memory storage for regulatory data (models don't exist)
interface RegulatoryWarning {
  id: number;
  clubId: number;
  type: string;
  severity: string;
  message: string;
  deadline?: Date;
  resolved: boolean;
}

const warningsStore: Map<number, RegulatoryWarning> = new Map();
let nextWarningId = 1;

// Get warnings for a club
router.get('/warnings/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const warnings = Array.from(warningsStore.values()).filter(w => w.clubId === clubId);
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warnings' });
  }
});

// Get compliance status for a club
router.get('/compliance/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const warnings = Array.from(warningsStore.values()).filter(w => w.clubId === clubId && !w.resolved);

    res.json({
      clubId,
      status: warnings.length === 0 ? 'compliant' : 'warning',
      activeWarnings: warnings.length,
      warnings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch compliance status' });
  }
});

// Request bailout (stub)
router.post('/bailout/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    res.json({
      clubId,
      status: 'pending',
      message: 'Bailout request submitted (stub)'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process bailout request' });
  }
});

// Get bankruptcy status (stub)
router.get('/bankruptcy/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    res.json({
      clubId,
      status: 'healthy',
      message: 'Club is not in bankruptcy proceedings'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bankruptcy status' });
  }
});

// Create a warning (internal use)
router.post('/warnings', async (req, res) => {
  try {
    const { clubId, type, severity, message, deadline } = req.body;
    const warning: RegulatoryWarning = {
      id: nextWarningId++,
      clubId,
      type,
      severity,
      message,
      deadline: deadline ? new Date(deadline) : undefined,
      resolved: false
    };
    warningsStore.set(warning.id, warning);
    res.status(201).json(warning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create warning' });
  }
});

export default router;