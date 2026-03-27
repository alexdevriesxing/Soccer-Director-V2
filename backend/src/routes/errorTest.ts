import express from 'express';

const router = express.Router();

// Test route for simulating errors (development only)
router.get('/not-found', async (_req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

router.get('/server-error', async (_req, res) => {
  res.status(500).json({ error: 'Internal server error (test)' });
});

router.get('/bad-request', async (_req, res) => {
  res.status(400).json({ error: 'Bad request (test)' });
});

router.get('/unauthorized', async (_req, res) => {
  res.status(401).json({ error: 'Unauthorized (test)' });
});

router.get('/throw-error', async (_req, _res) => {
  throw new Error('This is a test error');
});

export default router;
