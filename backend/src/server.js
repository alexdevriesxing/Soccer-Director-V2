const express = require('express');
const cors = require('cors');
const clubsRouter = require('./routes/clubs');
const playersRouter = require('./routes/players');
const leaguesRouter = require('./routes/leagues');
const o21Router = require('./routes/o21');
const gameRouter = require('./routes/game');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/clubs', clubsRouter);
app.use('/api/players', playersRouter);
app.use('/api/leagues', leaguesRouter);
app.use('/api/o21', o21Router);
app.use('/api/game', gameRouter);

// League table endpoint
app.get('/api/league-table/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const id = parseInt(leagueId, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid league ID' });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        clubs: {
          orderBy: { name: 'asc' }
        }
      }
    });
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Create table data from clubs
    const tableData = league.clubs.map((club, index) => ({
      position: index + 1,
      name: club.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    }));
    
    res.json({
      league: league.name,
      table: tableData
    });
  } catch (error) {
    console.error('Error fetching league table:', error);
    res.status(500).json({ error: 'Failed to fetch league table' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Football Director API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});

module.exports = app; 