import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import YouthDevelopmentService from '../services/youthDevelopmentService';

const router = express.Router();
const prisma = new PrismaClient();

// --- YOUTH ACADEMY MANAGEMENT ---

// POST /api/youth-development/academy
router.post('/academy', async (req, res) => {
  try {
    const { clubId, level = 1 } = req.body;
    
    if (!clubId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const academy = await YouthDevelopmentService.createYouthAcademy(clubId, level);
    res.status(201).json({ academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_academy', (req as any).language || 'en') });
  }
});

// GET /api/youth-development/club/:clubId/academy
router.get('/club/:clubId/academy', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const academy = await YouthDevelopmentService.getYouthAcademy(clubId);
    if (!academy) {
      return res.status(404).json({ error: t('error.academy_not_found', (req as any).language || 'en') });
    }
    
    res.json({ academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_academy', (req as any).language || 'en') });
  }
});

// PUT /api/youth-development/club/:clubId/academy/upgrade
router.put('/club/:clubId/academy/upgrade', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const academy = await YouthDevelopmentService.upgradeYouthAcademy(clubId);
    res.json({ academy });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_upgrade_academy', (req as any).language || 'en') });
  }
});

// --- YOUTH PLAYER MANAGEMENT ---

// POST /api/youth-development/club/:clubId/intake
router.post('/club/:clubId/intake', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { count = 5 } = req.body;
    
    const players = await YouthDevelopmentService.generateYouthIntake(clubId, count);
    res.status(201).json({ players });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_generate_intake', (req as any).language || 'en') });
  }
});

// GET /api/youth-development/club/:clubId/players
router.get('/club/:clubId/players', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { age = 21, developmentPath } = req.query;
    
    const where: any = { 
      clubId, 
      age: { lte: parseInt(age as string, 10) }
    };
    
    if (developmentPath) {
      where.developmentPath = developmentPath;
    }
    
    const players = await prisma.player.findMany({
      where,
      orderBy: { skill: 'desc' }
    });
    
    res.json({ players });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_players', (req as any).language || 'en') });
  }
});

// POST /api/youth-development/players/:playerId/mentor
router.post('/players/:playerId/mentor', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const { mentorId } = req.body;
    
    if (!mentorId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    await YouthDevelopmentService.assignMentor(playerId, mentorId);
    res.json({ message: 'Mentor assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_assign_mentor', (req as any).language || 'en') });
  }
});

// POST /api/youth-development/players/:playerId/promote
router.post('/players/:playerId/promote', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const { clubId } = req.body;
    
    if (!clubId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    await YouthDevelopmentService.promoteYouthPlayer(playerId, clubId);
    res.json({ message: 'Player promoted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_promote_player', (req as any).language || 'en') });
  }
});

// POST /api/youth-development/club/:clubId/development
router.post('/club/:clubId/development', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const results = await YouthDevelopmentService.processYouthDevelopment(clubId);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_process_development', (req as any).language || 'en') });
  }
});

// --- YOUTH TOURNAMENTS ---

// POST /api/youth-development/tournaments
router.post('/tournaments', async (req, res) => {
  try {
    const { name, ageGroup, participants, startDate, endDate } = req.body;
    
    if (!name || !participants || !startDate || !endDate) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    // Ensure participants is an array of numbers
    const participantIds = Array.isArray(participants) ? participants.map(Number) : [];

    const tournament = await YouthDevelopmentService.createYouthTournament(
      name,
      participantIds,
      new Date(startDate),
      new Date(endDate)
    );
    
    res.status(201).json({ tournament });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_tournament', (req as any).language || 'en') });
  }
});

// GET /api/youth-development/club/:clubId/tournaments
router.get('/club/:clubId/tournaments', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const tournaments = await YouthDevelopmentService.getYouthTournaments(clubId);
    res.json({ tournaments });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_tournaments', (req as any).language || 'en') });
  }
});

// PUT /api/youth-development/tournaments/:tournamentId/status
router.put('/tournaments/:tournamentId/status', async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.tournamentId, 10);
    const { status, results } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const updated = await prisma.youthTournaments.update({
      where: { id: tournamentId },
      data: { 
        // results: results ? JSON.stringify(results) : undefined // Remove, not in schema
      }
    });
    
    res.json({ tournament: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_tournament', (req as any).language || 'en') });
  }
});

// --- SCOUTING NETWORK ---

// POST /api/youth-development/club/:clubId/scouting
router.post('/club/:clubId/scouting', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { regions } = req.body;
    
    if (!regions || !Array.isArray(regions)) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const network = await YouthDevelopmentService.createScoutingNetwork(clubId, regions);
    res.status(201).json({ network });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_scouting', (req as any).language || 'en') });
  }
});

// GET /api/youth-development/club/:clubId/scouting
router.get('/club/:clubId/scouting', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const network = await YouthDevelopmentService.getScoutingNetwork(clubId);
    res.json({ network });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_scouting', (req as any).language || 'en') });
  }
});

// POST /api/youth-development/club/:clubId/scouting/discover
router.post('/club/:clubId/scouting/discover', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const discoveredPlayers = await YouthDevelopmentService.scoutForYouthPlayers(clubId);
    res.json({ discoveredPlayers });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_discover_players', (req as any).language || 'en') });
  }
});

// PUT /api/youth-development/scouts/:scoutId
router.put('/scouts/:scoutId', async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId, 10);
    const { name, region, ability, network } = req.body;
    
    const updated = await prisma.youthScout.update({
      where: { id: scoutId },
      data: { name, region, ability, network }
    });
    
    res.json({ scout: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_scout', (req as any).language || 'en') });
  }
});

// DELETE /api/youth-development/scouts/:scoutId
router.delete('/scouts/:scoutId', async (req, res) => {
  try {
    const scoutId = parseInt(req.params.scoutId, 10);
    
    await prisma.youthScout.delete({ where: { id: scoutId } });
    res.json({ message: 'Scout removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_remove_scout', (req as any).language || 'en') });
  }
});

// --- YOUTH DEVELOPMENT ANALYTICS ---

// GET /api/youth-development/club/:clubId/analytics
router.get('/club/:clubId/analytics', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const analytics = await YouthDevelopmentService.getYouthDevelopmentAnalytics(clubId);
    res.json({ analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_analytics', (req as any).language || 'en') });
  }
});

// GET /api/youth-development/club/:clubId/players/ready-for-promotion
router.get('/club/:clubId/players/ready-for-promotion', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const players = await prisma.player.findMany({
      where: {
        clubId,
        age: { gte: 18, lte: 21 },
        skill: { gte: 70 },
        developmentPath: { in: ['youth_academy', 'scouted'] }
      },
      orderBy: { skill: 'desc' }
    });
    
    res.json({ players });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_ready_players', (req as any).language || 'en') });
  }
});

// GET /api/youth-development/club/:clubId/players/needs-attention
router.get('/club/:clubId/players/needs-attention', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const players = await prisma.player.findMany({
      where: {
        clubId,
        age: { gte: 19, lte: 21 },
        skill: { lt: 50 },
        developmentPath: { in: ['youth_academy', 'scouted'] }
      },
      orderBy: { skill: 'asc' }
    });
    
    res.json({ players });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_attention_players', (req as any).language || 'en') });
  }
});

// --- YOUTH DEVELOPMENT PROGRAMS ---

// POST /api/youth-development/club/:clubId/programs
// router.post('/club/:clubId/programs', async (req, res) => {
//   // Feature not supported: 'developmentPrograms' does not exist in schema
//   return res.status(501).json({ error: 'Development programs are not supported in the current schema.' });
// });

// GET /api/youth-development/club/:clubId/programs
// router.get('/club/:clubId/programs', async (req, res) => {
//   // Feature not supported: 'developmentPrograms' does not exist in schema
//   return res.status(501).json({ error: 'Development programs are not supported in the current schema.' });
// });

// POST /api/youth-development/players/:playerId/program
router.post('/players/:playerId/program', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const { programId } = req.body;
    
    if (!programId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    // Apply program benefits to player
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }

    // Simple program effect - increase skill and morale
    await prisma.player.update({
      where: { id: playerId },
      data: { 
        skill: { increment: 2 },
        morale: { increment: 5 }
      }
    });
    
    res.json({ message: 'Program applied successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_apply_program', (req as any).language || 'en') });
  }
});

// --- YOUTH DEVELOPMENT REPORTS ---

// GET /api/youth-development/club/:clubId/report
router.get('/club/:clubId/report', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { season = '2024/25' } = req.query;
    
    const academy = await YouthDevelopmentService.getYouthAcademy(clubId);
    const network = await YouthDevelopmentService.getScoutingNetwork(clubId);
    const analytics = await YouthDevelopmentService.getYouthDevelopmentAnalytics(clubId);
    
    const youthPlayers = await prisma.player.findMany({
      where: { 
        clubId, 
        age: { lte: 21 },
        OR: [
          { developmentPath: 'youth_academy' },
          { developmentPath: 'scouted' }
        ]
      },
      orderBy: { skill: 'desc' }
    });

    const youthPlayersSafe = youthPlayers || [];
    const report = {
      season,
      academy: academy ? {
        level: academy.level,
        facilities: academy.facilities,
        coaches: academy.coaches.length,
        currentIntake: academy.currentIntake.length
      } : null,
      scouting: network ? {
        scouts: network.scouts.length,
        regions: network.regions,
        coverage: network.coverage,
        efficiency: network.efficiency,
        totalDiscoveries: network?.scouts?.reduce((sum: number, s: any) => sum + s.discoveries, 0) || 0
      } : null,
      players: {
        total: youthPlayersSafe.length,
        byAge: {
          '15-17': youthPlayersSafe.filter((p: any) => p.age >= 15 && p.age <= 17).length,
          '18-19': youthPlayersSafe.filter((p: any) => p.age >= 18 && p.age <= 19).length,
          '20-21': youthPlayersSafe.filter((p: any) => p.age >= 20 && p.age <= 21).length
        },
        byPosition: {
          GK: youthPlayersSafe.filter((p: any) => p.position === 'GK').length,
          DEF: youthPlayersSafe.filter((p: any) => p.position === 'DEF').length,
          MID: youthPlayersSafe.filter((p: any) => p.position === 'MID').length,
          FWD: youthPlayersSafe.filter((p: any) => p.position === 'FWD').length
        },
        byPotential: {
          high: youthPlayersSafe.filter((p: any) => p.potential >= 80).length,
          medium: youthPlayersSafe.filter((p: any) => p.potential >= 70 && p.potential < 80).length,
          low: youthPlayersSafe.filter((p: any) => p.potential < 70).length
        },
        withMentors: youthPlayersSafe.filter((p: any) => p.mentorId).length
      },
      development: {
        averageImprovement: youthPlayersSafe.reduce((sum: number, p: any) => sum + (p.improvementRate || 0), 0) / (youthPlayersSafe.length || 1),
        readyForPromotion: youthPlayersSafe.filter((p: any) => p.skill >= 70 && p.age >= 18).length,
        needsAttention: youthPlayersSafe.filter((p: any) => p.skill < 50 && p.age >= 19).length
      },
      recommendations: generateYouthRecommendations(academy || {}, network || {}, youthPlayersSafe)
    };

    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_generate_report', (req as any).language || 'en') });
  }
});

// Generate youth development recommendations
function generateYouthRecommendations(academy: any, network: any, players: any[]): string[] {
  const recommendations = [];

  if (!academy) {
    recommendations.push('Consider establishing a youth academy to develop young talent');
  } else if (academy.level < 3) {
    recommendations.push('Upgrade youth academy to improve player development');
  }

  if (!network) {
    recommendations.push('Establish a scouting network to discover young talent');
  } else if (network.scouts.length < 3) {
    recommendations.push('Expand scouting network to cover more regions');
  }

  const readyForPromotion = players.filter((p: any) => p.skill >= 70 && p.age >= 18).length;
  if (readyForPromotion > 0) {
    recommendations.push(`Consider promoting ${readyForPromotion} player(s) to the first team`);
  }

  const needsAttention = players.filter((p: any) => p.skill < 50 && p.age >= 19).length;
  if (needsAttention > 0) {
    recommendations.push(`${needsAttention} player(s) need special attention or may need to be released`);
  }

  const withMentors = players.filter((p: any) => p.mentorId).length;
  const totalPlayers = players.length;
  if (withMentors < totalPlayers * 0.5) {
    recommendations.push('Assign mentors to more youth players to improve development');
  }

  return recommendations;
}

export default router; 