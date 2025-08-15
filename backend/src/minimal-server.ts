import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leaguesRouter from './routes/leagues';
import clubsRouter from './routes/clubs';

declare const process: {
  env: {
    PORT?: string;
  };
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-minimal'
  });
});

// Test route
app.get('/api/test', (_req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/leagues', leaguesRouter);
app.use('/api/clubs', clubsRouter);

// Football quotes endpoint
app.get('/api/football-quotes', (_req, res) => {
  const quotes = [
    { quote: "Football is a simple game. Twenty-two men chase a ball for 90 minutes and at the end, the Germans always win.", author: "Gary Lineker" },
    { quote: "The game is about glory, it is about doing things in style and with a flourish, about going out and beating the other lot, not waiting for them to die of boredom.", author: "Danny Blanchflower" },
    { quote: "Some people think football is a matter of life and death. I assure you, it's much more serious than that.", author: "Bill Shankly" },
    { quote: "The more difficult the victory, the greater the happiness in winning.", author: "Pele" },
    { quote: "You can change your wife, your politics, your religion, but never, never can you change your favorite football team.", author: "Eric Cantona" }
  ];
  
  res.json({ quotes });
});

// Error handling
// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
