import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import PlayerMoraleService from '../services/playerMoraleService';

const router = express.Router();
const prisma = new PrismaClient();

// --- PLAYER MORALE ---

// GET /api/player-morale/player/:playerId/calculate
router.get('/player/:playerId/calculate', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const morale = await PlayerMoraleService.calculatePlayerMorale(playerId);
    res.json({ playerId, morale });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_morale', (req as any).language || 'en') });
  }
});

// GET /api/player-morale/club/:clubId/stats
router.get('/club/:clubId/stats', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const stats = await PlayerMoraleService.getClubMoraleStats(clubId);
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_morale_stats', (req as any).language || 'en') });
  }
});

// POST /api/player-morale/club/:clubId/update-all
router.post('/club/:clubId/update-all', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const result = await PlayerMoraleService.updateClubMorale(clubId);
    res.json({ message: 'Club morale updated successfully', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_morale', (req as any).language || 'en') });
  }
});

// GET /api/player-morale/club/:clubId/at-risk
router.get('/club/:clubId/at-risk', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const atRisk = await PlayerMoraleService.getPlayersAtRisk(clubId);
    res.json({ atRisk });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_at_risk_players', (req as any).language || 'en') });
  }
});

// --- PLAYER REQUESTS ---

// POST /api/player-morale/requests
router.post('/requests', async (req, res) => {
  try {
    const { playerId, type, priority, description, demands } = req.body;
    
    if (!playerId || !type || !priority || !description) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const request = await PlayerMoraleService.createPlayerRequest({
      playerId,
      type,
      priority,
      description,
      demands: demands || {},
      status: 'pending',
      createdAt: new Date()
    });

    res.status(201).json({ request });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_request', (req as any).language || 'en') });
  }
});

// GET /api/player-morale/club/:clubId/requests
router.get('/club/:clubId/requests', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { status, priority } = req.query;
    
    let requests = await PlayerMoraleService.getClubRequests(clubId);
    
    if (status) {
      requests = requests.filter((r: any) => r.status === status);
    }
    
    if (priority) {
      requests = requests.filter((r: any) => r.priority === priority);
    }

    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_requests', (req as any).language || 'en') });
  }
});

// GET /api/player-morale/player/:playerId/requests
router.get('/player/:playerId/requests', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const requests = await PlayerMoraleService.getPlayerRequests(playerId);
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_player_requests', (req as any).language || 'en') });
  }
});

// POST /api/player-morale/requests/:requestId/respond
router.post('/requests/:requestId/respond', async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    const { response, details } = req.body;
    
    if (!response || !['accepted', 'rejected', 'negotiating'].includes(response)) {
      return res.status(400).json({ error: t('validation.invalid_response', (req as any).language || 'en') });
    }

    const updatedRequest = await PlayerMoraleService.respondToRequest(requestId, response, details);
    res.json({ request: updatedRequest, message: `Request ${response}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_respond_to_request', (req as any).language || 'en') });
  }
});

// POST /api/player-morale/club/:clubId/trigger-automatic-requests
router.post('/club/:clubId/trigger-automatic-requests', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const requests = await PlayerMoraleService.triggerAutomaticRequests(clubId);
    res.json({ message: 'Automatic requests triggered', requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_trigger_requests', (req as any).language || 'en') });
  }
});

// --- REQUEST ANALYTICS ---

// GET /api/player-morale/club/:clubId/request-analytics
router.get('/club/:clubId/request-analytics', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { startDate, endDate } = req.query;
    
    const where: any = { player: { clubId } };
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const requests = await prisma.playerRequest.findMany({
      where,
      include: { player: true },
      orderBy: { createdAt: 'desc' }
    });

    const analytics = {
      totalRequests: requests.length,
      byType: requests.reduce((acc: any, req: any) => {
        acc[req.type] = (acc[req.type] || 0) + 1;
        return acc;
      }, {}),
      byPriority: requests.reduce((acc: any, req: any) => {
        acc[req.priority] = (acc[req.priority] || 0) + 1;
        return acc;
      }, {}),
      byStatus: requests.reduce((acc: any, req: any) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {}),
      averageResponseTime: requests
        .filter((r: any) => r.resolvedAt)
        .reduce((sum: number, r: any) => {
          return sum + (r.resolvedAt!.getTime() - r.createdAt.getTime());
        }, 0) / requests.filter((r: any) => r.resolvedAt).length || 0
    };

    res.json({ analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_request_analytics', (req as any).language || 'en') });
  }
});

// --- MORALE FACTORS ANALYSIS ---

// GET /api/player-morale/player/:playerId/factors
router.get('/player/:playerId/factors', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: {
          include: {
            finances: { orderBy: { season: 'desc' }, take: 1 },
            facilities: true
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }

    // Calculate individual factors (simplified version)
    const clubPlayers = await prisma.player.findMany({ where: { clubId: player.clubId! } });
    const avgWage = clubPlayers.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) / clubPlayers.length;
    
    const factors = {
      playtime: 75, // Simplified - would need actual appearance data
      wage: Math.min(100, Math.max(0, 50 + ((player.wage || 0) / avgWage - 1) * 50)),
      teamPerformance: 70, // Simplified - would need actual team stats
      individualPerformance: Math.min(100, player.skill + (player.morale || 0) * 0.1),
      contractStatus: Math.max(0, Math.min(100, (player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24) / 3.65)),
      managerRelationship: 70 + (player.personality === 'PROFESSIONAL' ? 20 : 0),
      facilities: player.club?.facilities && player.club.facilities.length > 0 ? 
        Math.min(100, player.club.facilities.reduce((sum: number, f: any) => sum + (f.level || 0), 0) * 10) : 50,
      location: 80
    };

    res.json({ factors });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_morale_factors', (req as any).language || 'en') });
  }
});

// --- MORALE TRENDS ---

// GET /api/player-morale/club/:clubId/trends
router.get('/club/:clubId/trends', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { weeks = 10 } = req.query;
    
    const players = await prisma.player.findMany({ where: { clubId } });
    const trends = [];

    for (let week = 0; week < parseInt(weeks as string, 10); week++) {
      const weekDate = new Date(Date.now() - week * 7 * 24 * 60 * 60 * 1000);
      
      // Simplified trend calculation - in reality would use historical morale data
      const avgMorale = players.reduce((sum: number, p: any) => sum + (p.morale || 50), 0) / players.length;
      
      trends.push({
        week: week + 1,
        date: weekDate,
        averageMorale: avgMorale + (Math.random() - 0.5) * 10, // Add some variation
        unhappyPlayers: players.filter((p: any) => (p.morale || 50) < 50).length,
        happyPlayers: players.filter((p: any) => (p.morale || 50) >= 70).length
      });
    }

    res.json({ trends: trends.reverse() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_morale_trends', (req as any).language || 'en') });
  }
});

// --- MORALE COMPARISONS ---

// GET /api/player-morale/club/:clubId/comparisons
router.get('/club/:clubId/comparisons', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const comparisons = {
      byPosition: players.reduce((acc: any, p: any) => {
        if (!acc[p.position]) acc[p.position] = { count: 0, totalMorale: 0 };
        acc[p.position].count++;
        acc[p.position].totalMorale += p.morale || 50;
        return acc;
      }, {}),
      byAge: players.reduce((acc: any, p: any) => {
        const ageGroup = p.age < 23 ? 'young' : p.age < 28 ? 'prime' : p.age < 32 ? 'experienced' : 'veteran';
        if (!acc[ageGroup]) acc[ageGroup] = { count: 0, totalMorale: 0 };
        acc[ageGroup].count++;
        acc[ageGroup].totalMorale += p.morale || 50;
        return acc;
      }, {}),
      bySkill: players.reduce((acc: any, p: any) => {
        const skillGroup = p.skill < 60 ? 'low' : p.skill < 75 ? 'medium' : p.skill < 85 ? 'high' : 'elite';
        if (!acc[skillGroup]) acc[skillGroup] = { count: 0, totalMorale: 0 };
        acc[skillGroup].count++;
        acc[skillGroup].totalMorale += p.morale || 50;
        return acc;
      }, {})
    };

    // Calculate averages
    for (const category of Object.values(comparisons)) {
      for (const group of Object.values(category as any)) {
        (group as any).averageMorale = (group as any).count > 0 ? 
          Math.round((group as any).totalMorale / (group as any).count) : 0;
      }
    }

    res.json({ comparisons });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_morale_comparisons', (req as any).language || 'en') });
  }
});

// --- MORALE PREDICTIONS ---

// POST /api/player-morale/club/:clubId/predict-morale
router.post('/club/:clubId/predict-morale', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { weeks = 4 } = req.body;
    
    const players = await prisma.player.findMany({ where: { clubId } });
    const predictions = [];

    for (const player of players) {
      const currentMorale = player.morale || 50;
      const playerPredictions = [];

      for (let week = 1; week <= weeks; week++) {
        // Simple prediction model based on current factors
        let predictedMorale = currentMorale;
        
        // Contract expiry impact
        const daysUntilExpiry = Math.ceil((player.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 90) {
          predictedMorale -= (90 - daysUntilExpiry) * 0.5;
        }

        // Age impact
        if (player.age > 30) {
          predictedMorale -= (player.age - 30) * 0.3;
        }

        // Skill vs wage balance
        const clubPlayers = await prisma.player.findMany({ where: { clubId } });
        const avgWage = clubPlayers.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) / clubPlayers.length;
        const wageRatio = avgWage > 0 ? (player.wage || 0) / avgWage : 1;
        if (wageRatio < 0.7) {
          predictedMorale -= 10;
        }

        predictedMorale = Math.max(0, Math.min(100, predictedMorale));
        
        playerPredictions.push({
          week,
          predictedMorale: Math.round(predictedMorale)
        });
      }

      predictions.push({
        playerId: player.id,
        playerName: player.name,
        currentMorale,
        predictions: playerPredictions
      });
    }

    res.json({ predictions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_predict_morale', (req as any).language || 'en') });
  }
});

export default router; 