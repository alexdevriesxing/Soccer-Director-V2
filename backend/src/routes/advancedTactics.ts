import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import AdvancedTacticsService from '../services/advancedTacticsService';

const router = express.Router();
const prisma = new PrismaClient();

// --- TACTICAL FORMATION MANAGEMENT ---

// POST /api/advanced-tactics/formations
router.post('/formations', async (req, res) => {
  try {
    const { clubId, name, formation, style, intensity, width, tempo } = req.body;
    
    if (!clubId || !name || !formation || !style || intensity === undefined || width === undefined || tempo === undefined) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const tacticalFormation = await AdvancedTacticsService.createTacticalFormation(
      clubId,
      name,
      formation,
      style,
      intensity,
      width,
      tempo
    );

    res.status(201).json({ formation: tacticalFormation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_formation', (req as any).language || 'en') });
  }
});

// GET /api/advanced-tactics/club/:clubId/formation
router.get('/club/:clubId/formation', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const formation = await AdvancedTacticsService.getTacticalFormation(clubId);
    if (!formation) {
      return res.status(404).json({ error: t('error.formation_not_found', (req as any).language || 'en') });
    }
    
    res.json({ formation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_formation', (req as any).language || 'en') });
  }
});

// PUT /api/advanced-tactics/formations/:formationId
router.put('/formations/:formationId', async (req, res) => {
  try {
    const formationId = parseInt(req.params.formationId, 10);
    const updates = req.body;
    
    const formation = await AdvancedTacticsService.updateTacticalFormation(formationId, updates);
    res.json({ formation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_formation', (req as any).language || 'en') });
  }
});

// DELETE /api/advanced-tactics/formations/:formationId
router.delete('/formations/:formationId', async (req, res) => {
  try {
    const formationId = parseInt(req.params.formationId, 10);
    
    await prisma.clubFormation.delete({ where: { id: formationId } });
    res.json({ message: 'Formation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_delete_formation', (req as any).language || 'en') });
  }
});

// --- PLAYER ASSIGNMENT ---

// POST /api/advanced-tactics/formations/:formationId/positions/:positionId/assign
router.post('/formations/:formationId/positions/:positionId/assign', async (req, res) => {
  try {
    const formationId = parseInt(req.params.formationId, 10);
    const positionId = parseInt(req.params.positionId, 10);
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    await AdvancedTacticsService.assignPlayerToPosition(formationId, positionId, playerId);
    res.json({ message: 'Player assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_assign_player', (req as any).language || 'en') });
  }
});

// POST /api/advanced-tactics/formations/:formationId/positions/:positionId/instructions
router.post('/formations/:formationId/positions/:positionId/instructions', async (req, res) => {
  try {
    const formationId = parseInt(req.params.formationId, 10);
    const positionId = parseInt(req.params.positionId, 10);
    const { type, value, priority } = req.body;
    
    if (!type || value === undefined || priority === undefined) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const instruction = { type, value, priority };
    await AdvancedTacticsService.addPlayerInstruction(formationId, positionId, instruction);
    res.json({ message: 'Instruction added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_add_instruction', (req as any).language || 'en') });
  }
});

// --- TACTICAL ANALYSIS ---

// GET /api/advanced-tactics/club/:clubId/analysis
router.get('/club/:clubId/analysis', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const analysis = await AdvancedTacticsService.analyzeTacticalFormation(clubId);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_formation', (req as any).language || 'en') });
  }
});

// GET /api/advanced-tactics/club/:clubId/analysis/strengths
router.get('/club/:clubId/analysis/strengths', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const analysis = await AdvancedTacticsService.analyzeTacticalFormation(clubId);
    res.json({ strengths: analysis.strengths });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_strengths', (req as any).language || 'en') });
  }
});

// GET /api/advanced-tactics/club/:clubId/analysis/weaknesses
router.get('/club/:clubId/analysis/weaknesses', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const analysis = await AdvancedTacticsService.analyzeTacticalFormation(clubId);
    res.json({ weaknesses: analysis.weaknesses });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_weaknesses', (req as any).language || 'en') });
  }
});

// GET /api/advanced-tactics/club/:clubId/analysis/recommendations
router.get('/club/:clubId/analysis/recommendations', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const analysis = await AdvancedTacticsService.analyzeTacticalFormation(clubId);
    res.json({ recommendations: analysis.recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_recommendations', (req as any).language || 'en') });
  }
});

// --- MATCH PREPARATION ---

// POST /api/advanced-tactics/club/:clubId/prepare-match
router.post('/club/:clubId/prepare-match', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { opponentId, fixtureId } = req.body;
    
    if (!opponentId || !fixtureId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const preparation = await AdvancedTacticsService.prepareForMatch(clubId, opponentId, fixtureId);
    res.json({ preparation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_prepare_match', (req as any).language || 'en') });
  }
});

// GET /api/advanced-tactics/club/:clubId/opponent-analysis/:opponentId
router.get('/club/:clubId/opponent-analysis/:opponentId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const opponentId = parseInt(req.params.opponentId, 10);
    
    const opponent = await prisma.club.findUnique({ where: { id: opponentId } });
    if (!opponent) {
      return res.status(404).json({ error: t('error.opponent_not_found', (req as any).language || 'en') });
    }

    const opponentFormation = await AdvancedTacticsService.getTacticalFormation(opponentId);
    const analysis = await AdvancedTacticsService['analyzeOpponent'](opponent, opponentFormation);
    
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_opponent', (req as any).language || 'en') });
  }
});

// --- FORMATION TEMPLATES ---

// GET /api/advanced-tactics/templates
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        name: '4-3-3 Attacking',
        formation: '4-3-3',
        style: 'possession',
        intensity: 8,
        width: 7,
        tempo: 7,
        description: 'High-pressing, possession-based attacking formation'
      },
      {
        name: '4-4-2 Balanced',
        formation: '4-4-2',
        style: 'balanced',
        intensity: 6,
        width: 6,
        tempo: 6,
        description: 'Traditional balanced formation'
      },
      {
        name: '3-5-2 Defensive',
        formation: '3-5-2',
        style: 'counter-attack',
        intensity: 5,
        width: 8,
        tempo: 5,
        description: 'Defensive formation with wing-backs'
      },
      {
        name: '4-2-3-1 Modern',
        formation: '4-2-3-1',
        style: 'possession',
        intensity: 7,
        width: 6,
        tempo: 7,
        description: 'Modern possession-based formation'
      },
      {
        name: '5-3-2 Ultra Defensive',
        formation: '5-3-2',
        style: 'defensive',
        intensity: 4,
        width: 5,
        tempo: 4,
        description: 'Ultra-defensive formation'
      }
    ];
    
    res.json({ templates });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_templates', (req as any).language || 'en') });
  }
});

// POST /api/advanced-tactics/club/:clubId/apply-template
router.post('/club/:clubId/apply-template', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { templateName } = req.body;
    
    if (!templateName) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const templates = [
      {
        name: '4-3-3 Attacking',
        formation: '4-3-3',
        style: 'possession',
        intensity: 8,
        width: 7,
        tempo: 7
      },
      {
        name: '4-4-2 Balanced',
        formation: '4-4-2',
        style: 'balanced',
        intensity: 6,
        width: 6,
        tempo: 6
      },
      {
        name: '3-5-2 Defensive',
        formation: '3-5-2',
        style: 'counter-attack',
        intensity: 5,
        width: 8,
        tempo: 5
      },
      {
        name: '4-2-3-1 Modern',
        formation: '4-2-3-1',
        style: 'possession',
        intensity: 7,
        width: 6,
        tempo: 7
      },
      {
        name: '5-3-2 Ultra Defensive',
        formation: '5-3-2',
        style: 'defensive',
        intensity: 4,
        width: 5,
        tempo: 4
      }
    ];

    const template = templates.find(t => t.name === templateName);
    if (!template) {
      return res.status(404).json({ error: t('error.template_not_found', (req as any).language || 'en') });
    }

    // Delete existing formation if any
    const existingFormation = await prisma.clubFormation.findFirst({ where: { clubId } });
    if (existingFormation) {
      await prisma.clubFormation.delete({ where: { id: existingFormation.id } });
    }

    const formation = await AdvancedTacticsService.createTacticalFormation(
      clubId,
      template.name,
      template.formation,
      template.style,
      template.intensity,
      template.width,
      template.tempo
    );

    res.json({ formation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_apply_template', (req as any).language || 'en') });
  }
});

// --- TACTICAL FAMILIARITY ---

// GET /api/advanced-tactics/club/:clubId/familiarity
router.get('/club/:clubId/familiarity', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const familiarity = await prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
    res.json({ familiarity: familiarity?.familiarity || 50 });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_familiarity', (req as any).language || 'en') });
  }
});

// PUT /api/advanced-tactics/club/:clubId/familiarity
router.put('/club/:clubId/familiarity', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { familiarity } = req.body;
    
    if (familiarity === undefined) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const existing = await prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
    let updated;
    
    if (existing) {
      updated = await prisma.tacticalFamiliarity.update({
        where: { id: existing.id },
        data: { familiarity }
      });
    } else {
      updated = await prisma.tacticalFamiliarity.create({
        data: { clubId, familiarity, tactic: 'default' }
      });
    }

    res.json({ familiarity: updated.familiarity });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_familiarity', (req as any).language || 'en') });
  }
});

// --- SQUAD CHEMISTRY ---

// GET /api/advanced-tactics/club/:clubId/chemistry
router.get('/club/:clubId/chemistry', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const chemistry = await prisma.squadChemistry.findFirst({ where: { clubId } });
    res.json({ chemistry: chemistry?.score || 50 });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_chemistry', (req as any).language || 'en') });
  }
});

// PUT /api/advanced-tactics/club/:clubId/chemistry
router.put('/club/:clubId/chemistry', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { score, notes } = req.body;
    
    if (score === undefined) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const existing = await prisma.squadChemistry.findFirst({ where: { clubId } });
    let updated;
    
    if (existing) {
      updated = await prisma.squadChemistry.update({
        where: { id: existing.id },
        data: { score, notes }
      });
    } else {
      updated = await prisma.squadChemistry.create({
        data: { clubId, score, notes }
      });
    }

    res.json({ chemistry: updated.score });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_chemistry', (req as any).language || 'en') });
  }
});

// --- SET PIECES ---

// GET /api/advanced-tactics/club/:clubId/set-pieces
router.get('/club/:clubId/set-pieces', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const setPieces = {
      corners: {
        takers: players.filter((p: any) => p.skill > 70).slice(0, 2).map((p: any) => ({ id: p.id, name: p.name })),
        targets: players.filter((p: any) => p.position === 'DEF' || p.position === 'FWD').slice(0, 3).map((p: any) => ({ id: p.id, name: p.name }))
      },
      freeKicks: {
        takers: players.filter((p: any) => p.skill > 75).slice(0, 2).map((p: any) => ({ id: p.id, name: p.name }))
      },
      penalties: {
        taker: players.filter((p: any) => p.skill > 70).sort((a: any, b: any) => b.skill - a.skill)[0] || null
      }
    };
    
    res.json({ setPieces });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_set_pieces', (req as any).language || 'en') });
  }
});

// --- SUBSTITUTION PLANS ---

// GET /api/advanced-tactics/club/:clubId/substitutions
router.get('/club/:clubId/substitutions', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const substitutions = {
      tactical: players.filter((p: any) => p.skill > 65 && !p.injured).slice(0, 3).map((p: any) => ({ id: p.id, name: p.name, position: p.position })),
      fitness: players.filter((p: any) => p.age > 30).slice(0, 2).map((p: any) => ({ id: p.id, name: p.name, position: p.position })),
      impact: players.filter((p: any) => p.skill > 70 && p.position === 'FWD').slice(0, 2).map((p: any) => ({ id: p.id, name: p.name, position: p.position }))
    };
    
    res.json({ substitutions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_substitutions', (req as any).language || 'en') });
  }
});

// --- TACTICAL REPORTS ---

// GET /api/advanced-tactics/club/:clubId/report
router.get('/club/:clubId/report', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { season = '2024/25' } = req.query;
    
    const formation = await AdvancedTacticsService.getTacticalFormation(clubId);
    const analysis = formation ? await AdvancedTacticsService.analyzeTacticalFormation(clubId) : null;
    const familiarity = await prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
    const chemistry = await prisma.squadChemistry.findFirst({ where: { clubId } });
    
    const recentFixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
        played: true
      },
      orderBy: { week: 'desc' },
      take: 10
    });

    const report = {
      season,
      formation: formation ? {
        name: formation.name,
        formation: formation.formation,
        style: formation.style,
        intensity: formation.intensity,
        width: formation.width,
        tempo: formation.tempo
      } : null,
      analysis: analysis ? {
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations
      } : null,
      familiarity: familiarity?.familiarity || 50,
      chemistry: chemistry?.score || 50,
      recentPerformance: {
        totalMatches: recentFixtures.length,
        wins: recentFixtures.filter((f: any) => {
          const isHome = f.homeClubId === clubId;
          const goalsScored = isHome ? f.homeGoals : f.awayGoals;
          const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
          return goalsScored > goalsConceded;
        }).length,
        draws: recentFixtures.filter((f: any) => {
          const isHome = f.homeClubId === clubId;
          const goalsScored = isHome ? f.homeGoals : f.awayGoals;
          const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
          return goalsScored === goalsConceded;
        }).length,
        losses: recentFixtures.filter((f: any) => {
          const isHome = f.homeClubId === clubId;
          const goalsScored = isHome ? f.homeGoals : f.awayGoals;
          const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
          return goalsScored < goalsConceded;
        }).length
      }
    };

    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_generate_report', (req as any).language || 'en') });
  }
});

export default router; 