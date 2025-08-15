import express from 'express';

const router = express.Router();

// --- PRE-MATCH REPORT ---
// GET /api/fixtures/:id/pre-match-report
router.get('/fixtures/:id/pre-match-report', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based pre-match analysis endpoints aligned with the updated schema.'
  });
});

// --- OPPONENT ANALYSIS ---
// GET /api/clubs/:id/opponent-analysis
router.get('/clubs/:id/opponent-analysis', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based opponent analysis endpoints aligned with the updated schema.'
  });
});

export default router; 