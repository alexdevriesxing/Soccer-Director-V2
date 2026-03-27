import express from 'express';
import { MatchSimulationService } from '../services/matchSimulationService';
import { WebSocketService } from '../services/websocketService';

const router = express.Router();

// POST /api/matches/:id/simulate
router.post('/:id/simulate', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const result = await MatchSimulationService.simulateMatch(fixtureId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate match.' });
  }
});

// POST /api/fixtures/:id/tactical-change
router.post('/:id/tactical-change', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const { minute, changeType, description, effectiveness = 0 } = req.body;
    if (!minute || !changeType || !description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const tacticalChange = await req.app.get('prisma').realTimeTacticalChanges.create({
      data: {
        fixtureId,
        minute,
        changeType,
        description,
        effectiveness,
      },
    });
    return res.json(tacticalChange);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record tactical change.' });
  }
});

// GET /api/fixtures/live
router.get('/live', async (req, res) => {
  try {
    // Get all currently live matches from the WebSocket service
    const liveMatches = WebSocketService.getLiveMatches();

    // If no live matches, return empty array
    if (!liveMatches || liveMatches.length === 0) {
      return res.json([]);
    }

    // Get fixture details for each live match
    const prisma = req.app.get('prisma');
    const fixturePromises = liveMatches.map(matchId =>
      prisma.fixture.findUnique({
        where: { id: matchId },
        include: {
          homeClub: true,
          awayClub: true,
          league: true
        }
      })
    );

    const fixtures = await Promise.all(fixturePromises);

    // Filter out any null values and add live match status
    const liveFixtures = fixtures
      .filter(fixture => fixture !== null)
      .map(fixture => ({
        ...fixture,
        isLive: true,
        currentMinute: WebSocketService.getCurrentMinute(fixture.id) || 0,
        score: {
          home: fixture.homeGoals || 0,
          away: fixture.awayGoals || 0
        }
      }));

    return res.json(liveFixtures);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return res.status(500).json({ error: 'Failed to fetch live matches.' });
  }
});

// GET /api/fixtures/:id/analysis
router.get('/:id/analysis', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.id, 10);
    const analysis = await req.app.get('MatchSimulationService').getMatchAnalysis(fixtureId);
    if (!analysis) return res.status(404).json({ error: 'No analysis found for this fixture.' });
    return res.json({ analysis });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch match analysis.' });
  }
});

export default router; 