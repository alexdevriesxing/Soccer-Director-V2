import express from 'express';
import { PrismaClient } from '@prisma/client';
// import { TransferService } from '../services/transferService';
import TrainingService from '../services/trainingService';

const router = express.Router();
const prisma = new PrismaClient();

// Get club overview
router.get('/club/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId);
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: { players: true }
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch club data' });
  }
});

// Get squad management data (deprecated)
router.get('/club/:clubId/squad', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition/clubs endpoints aligned with the updated competition-based schema.'
  });
});

// Get upcoming fixtures (paginated)
// Query params: page (default 1), limit (default 25)
router.get('/club/:clubId/fixtures', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based schedules/rounds endpoints aligned with the updated schema.'
  });
});

// Simulate a match
router.post('/fixture/:fixtureId/simulate', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based match/round simulation endpoints aligned with the updated schema.'
  });
});

// Get transfer market (paginated)
// Query params: page (default 1), limit (default 25)
router.get('/transfers/market', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use new transfer listings/offers endpoints aligned with the updated schema.'
  });
});

// Create transfer offer
router.post('/transfers/offer', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use new transfer offers endpoint aligned with the updated schema.'
  });
});

// Respond to transfer offer
router.post('/transfers/:offerId/respond', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use new transfer offers endpoint aligned with the updated schema.'
  });
});

// Get transfer offers for club (paginated)
// Query params: page (default 1), limit (default 25)
router.get('/club/:clubId/transfers', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use new transfer listings/offers endpoints aligned with the updated schema.'
  });
});

// Set training focus
router.post('/player/:playerId/training', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const { clubId, focus, isExtra } = req.body;
    
    const trainingFocus = await TrainingService.setTrainingFocus({
      playerId,
      clubId,
      focus,
      isExtra,
      startDate: new Date()
    });
    
    res.json(trainingFocus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set training focus' });
  }
});

// Conduct training session
router.post('/club/:clubId/training', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId);
    const { sessionType } = req.body;
    
    const results = await TrainingService.conductTrainingSession(clubId, sessionType);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to conduct training session' });
  }
});

// Get training progress
// In GET /player/:playerId/training, get the player's clubId first
router.get('/player/:playerId/training', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    if (typeof player.currentClubId !== 'number') {
      return res.status(400).json({ error: 'Player does not belong to a club' });
    }
    const progress = await TrainingService.getTrainingResults(player.currentClubId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training progress' });
  }
});

// End training focus
router.delete('/player/:playerId/training', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    // await TrainingService.setTrainingFocus(playerId, null, null, null);
    res.json({ message: 'Training focus ended' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end training focus' });
  }
});

// --- Club-wide training focus endpoints ---
// Get club training focus
router.get('/club/:clubId/training-focus', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based training endpoints aligned with the updated schema.'
  });
});
// Set club training focus
router.post('/club/:clubId/training-focus', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based training endpoints aligned with the updated schema.'
  });
});

// Get league table (paginated)
// Query params: page (default 1), limit (default 25)
router.get('/league/:leagueId/table', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition standings endpoints aligned with the updated schema.'
  });
});

// Get match events
router.get('/fixture/:fixtureId/events', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based event/statistics endpoints aligned with the updated schema.'
  });
});

// Get club finances
router.get('/club/:clubId/finances', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition/club finance endpoints aligned with the updated schema.'
  });
});

// Get player details
router.get('/player/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        currentClub: true
      }
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get transfer history
    // const transferHistory = await TransferService.getPlayerTransferHistory(playerId);

    res.json({
      player,
      // transferHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player details' });
  }
});

// Update player contract (wage, contractExpiry)
router.patch('/player/:playerId/contract', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const { wage, contractExpiry } = req.body;
    if (wage !== undefined && (typeof wage !== 'number' || wage < 0)) {
      return res.status(400).json({ error: 'Invalid wage' });
    }
    let expiryDate: Date | undefined = undefined;
    if (contractExpiry) {
      expiryDate = new Date(contractExpiry);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({ error: 'Invalid contract expiry date' });
      }
    }
    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        ...(wage !== undefined ? { weeklyWage: wage } : {}),
        ...(expiryDate ? { contractEnd: expiryDate } : {})
      }
    });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player contract' });
  }
});

// Get news feed
router.get('/news', async (req, res) => {
  try {
    // Mock news feed - in a real implementation this would come from a news service
    const news = [
      {
        id: 1,
        title: 'Transfer Deadline Day Approaches',
        content: 'Clubs are making final moves in the transfer market as deadline day looms.',
        date: new Date(),
        type: 'transfer'
      },
      {
        id: 2,
        title: 'Injury Crisis Hits Top Club',
        content: 'Several key players are sidelined with injuries, affecting team performance.',
        date: new Date(),
        type: 'injury'
      },
      {
        id: 3,
        title: 'Young Talent Emerges',
        content: 'A promising young player has been called up to the first team.',
        date: new Date(),
        type: 'youth'
      }
    ];

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get game statistics
router.get('/stats', async (_req, res) => {
  try {
    const [totalClubs, totalPlayers, totalCompetitions, totalFixtures] = await Promise.all([
      prisma.club.count(),
      prisma.player.count(),
      prisma.competition.count(),
      prisma.fixture.count()
    ]);
    res.json({ totalClubs, totalPlayers, totalCompetitions, totalFixtures });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game statistics' });
  }
});

// Trigger weekly simulation
router.post('/simulate/week/:weekNumber', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based round simulation endpoints aligned with the updated schema.'
  });
});

// --- Season Progression Endpoints ---
// Advance one week: simulate all matches for the current week, update tables, and return summary
router.post('/season/advance-week', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based season progression via rounds in the updated schema.'
  });
});

// Advance to end of season: simulate all remaining weeks, trigger end-of-season logic, and return summary
router.post('/season/advance-to-end', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based season progression endpoints aligned with the updated schema.'
  });
});

// Get best XI for a club
router.get('/club/:clubId/best-xi', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based squad selection endpoints aligned with the updated schema.'
  });
});

// Set starting XI for a club
router.post('/club/:clubId/starting-xi', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based squad selection endpoints aligned with the updated schema.'
  });
});

// Get current starting XI for a club
router.get('/club/:clubId/starting-xi', async (_req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based squad selection endpoints aligned with the updated schema.'
  });
});

// --- Season Summary Endpoint ---
router.get('/season/summary', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based season summary endpoints aligned with the updated schema.'
  });
});

// Attendance analytics endpoint
router.get('/attendance/analytics', async (req, res) => {
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'Use competition-based analytics endpoints aligned with the updated schema.'
  });
});

export default router; 