import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const router = express.Router();

// GET /api/football-quotes
router.get('/', async (_req: Request, res: Response) => {
  // Use __dirname to resolve from the routes directory
  const quotesPath = path.resolve(__dirname, '../../locales/footballQuotes.json');

  try {
    // Check if file exists before reading
    if (!existsSync(quotesPath)) {
      // Fallback if file missing
      return res.json([
        { text: "Football is a simple game...", author: "Gary Lineker" },
        { text: "The ball is round...", author: "Sepp Herberger" }
      ]);
    }

    const data = await fs.readFile(quotesPath, 'utf8');
    const quotes = JSON.parse(data);
    return res.json(quotes);

  } catch (error) {
    console.error(`[football-quotes] Error:`, error);
    // Fallback on error
    return res.json([
      { text: "Football is a simple game...", author: "Gary Lineker" }
    ]);
  }
});

export default router;