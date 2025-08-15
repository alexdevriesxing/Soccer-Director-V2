import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// GET /api/football-quotes
router.get('/', (req, res) => {
  // Use __dirname to resolve from the routes directory
  const quotesPath = path.resolve(__dirname, '../../locales/footballQuotes.json');

  // Check if file exists before reading
  if (!fs.existsSync(quotesPath)) {
    console.error(`[football-quotes] File not found: ${quotesPath}`);
    return res.status(500).json({ error: 'Football quotes file not found.' });
  }

  fs.readFile(quotesPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`[football-quotes] Failed to read file: ${quotesPath}`, err);
      return res.status(500).json({ error: 'Failed to load football quotes.' });
    }
    try {
      const quotes = JSON.parse(data);
      res.json({ quotes });
    } catch (e) {
      console.error(`[football-quotes] Invalid JSON in file: ${quotesPath}`, e);
      res.status(500).json({ error: 'Invalid football quotes data.' });
    }
  });
});

export default router; 