import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import PlayerContractService from '../services/playerContractService';

const router = express.Router();
const prisma = new PrismaClient();

// --- CONTRACT NEGOTIATIONS ---

// POST /api/player-contracts/negotiate
router.post('/negotiate', async (req, res) => {
  try {
    const { playerId, clubId, proposedWage, proposedLength, proposedBonuses, proposedClauses, agentFee, deadline } = req.body;
    
    if (!playerId || !clubId || !proposedWage || !proposedLength || !deadline) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const negotiation = await PlayerContractService.createContractNegotiation({
      playerId,
      clubId,
      proposedWage,
      proposedLength,
      proposedBonuses: proposedBonuses || {},
      proposedClauses: proposedClauses || {},
      agentFee: agentFee || 0,
      status: 'pending',
      deadline: new Date(deadline)
    });

    res.status(201).json({ negotiation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_negotiation', (req as any).language || 'en') });
  }
});

// POST /api/player-contracts/:negotiationId/accept
router.post('/:negotiationId/accept', async (req, res) => {
  try {
    const negotiationId = parseInt(req.params.negotiationId, 10);
    const player = await PlayerContractService.acceptContract(negotiationId);
    res.json({ player, message: 'Contract accepted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_accept_contract', (req as any).language || 'en') });
  }
});

// POST /api/player-contracts/:negotiationId/reject
router.post('/:negotiationId/reject', async (req, res) => {
  try {
    const negotiationId = parseInt(req.params.negotiationId, 10);
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const negotiation = await PlayerContractService.rejectContract(negotiationId, reason);
    res.json({ negotiation, message: 'Contract rejected' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_reject_contract', (req as any).language || 'en') });
  }
});

// POST /api/player-contracts/:negotiationId/counter-offer
router.post('/:negotiationId/counter-offer', async (req, res) => {
  try {
    const negotiationId = parseInt(req.params.negotiationId, 10);
    const { counterOffer } = req.body;
    
    if (!counterOffer) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const negotiation = await PlayerContractService.makeCounterOffer(negotiationId, counterOffer);
    res.json({ negotiation, message: 'Counter offer made' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_make_counter_offer', (req as any).language || 'en') });
  }
});

// GET /api/player-contracts/club/:clubId/negotiations
router.get('/club/:clubId/negotiations', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const negotiations = await PlayerContractService.getClubNegotiations(clubId);
    res.json({ negotiations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_negotiations', (req as any).language || 'en') });
  }
});

// GET /api/player-contracts/player/:playerId/negotiations
router.get('/player/:playerId/negotiations', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const negotiations = await PlayerContractService.getPlayerNegotiations(playerId);
    res.json({ negotiations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_negotiations', (req as any).language || 'en') });
  }
});

// --- CONTRACT RENEWALS ---

// POST /api/player-contracts/club/:clubId/trigger-renewals
router.post('/club/:clubId/trigger-renewals', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    await PlayerContractService.triggerRenewalNegotiations(clubId);
    res.json({ message: 'Renewal negotiations triggered' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_trigger_renewals', (req as any).language || 'en') });
  }
});

// GET /api/player-contracts/club/:clubId/expiring
router.get('/club/:clubId/expiring', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { daysThreshold = 180 } = req.query;
    const expiringPlayers = await PlayerContractService.getExpiringContracts(clubId, parseInt(daysThreshold as string, 10));
    res.json({ expiringPlayers });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_expiring_contracts', (req as any).language || 'en') });
  }
});

// GET /api/player-contracts/player/:playerId/renewal-eligibility
router.get('/player/:playerId/renewal-eligibility', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const isEligible = await PlayerContractService.checkRenewalEligibility(playerId);
    res.json({ isEligible });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_check_eligibility', (req as any).language || 'en') });
  }
});

// --- CONTRACT BONUSES ---

// POST /api/player-contracts/process-match-bonuses
router.post('/process-match-bonuses', async (req, res) => {
  try {
    const { playerId, matchStats } = req.body;
    
    if (!playerId || !matchStats) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    await PlayerContractService.processMatchBonuses(playerId, matchStats);
    res.json({ message: 'Match bonuses processed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_process_bonuses', (req as any).language || 'en') });
  }
});

// GET /api/player-contracts/club/:clubId/bonuses
router.get('/club/:clubId/bonuses', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { startDate, endDate } = req.query;
    
    const where: any = { clubId };
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const bonuses = await prisma.playerContractBonus.findMany({
      where,
      include: { player: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalBonuses = bonuses.reduce((sum: number, bonus: any) => sum + bonus.amount, 0);
    
    res.json({ bonuses, totalBonuses });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_bonuses', (req as any).language || 'en') });
  }
});

// --- CONTRACT STATISTICS ---

// GET /api/player-contracts/club/:clubId/stats
router.get('/club/:clubId/stats', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const stats = await PlayerContractService.getContractStats(clubId);
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_contract_stats', (req as any).language || 'en') });
  }
});

// GET /api/player-contracts/club/:clubId/wage-analysis
router.get('/club/:clubId/wage-analysis', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const totalWage = players.reduce((sum: number, p: any) => sum + (p.wage || 0), 0);
    const avgWage = players.length > 0 ? totalWage / players.length : 0;
    
    const analysis = {
      totalWage,
      averageWage: avgWage,
      wageEfficiency: players.length > 0 ? players.reduce((sum: number, p: any) => sum + (p.skill || 0), 0) / totalWage : 0,
      topEarners: players
        .sort((a: any, b: any) => (b.wage || 0) - (a.wage || 0))
        .slice(0, 5)
        .map((p: any) => ({ id: p.id, name: p.name, wage: p.wage, skill: p.skill })),
      valueForMoney: players
        .filter((p: any) => p.wage && p.skill)
        .sort((a: any, b: any) => (b.skill / b.wage) - (a.skill / a.wage))
        .slice(0, 5)
        .map((p: any) => ({ id: p.id, name: p.name, wage: p.wage, skill: p.skill, ratio: p.skill / p.wage }))
    };
    
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_wage_analysis', (req as any).language || 'en') });
  }
});

// --- CONTRACT CALCULATIONS ---

// POST /api/player-contracts/calculate-value
router.post('/calculate-value', async (req, res) => {
  try {
    const { wage, length, bonuses } = req.body;
    
    if (!wage || !length) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const totalValue = PlayerContractService.calculateContractValue(wage, length, bonuses);
    res.json({ totalValue, breakdown: { baseWage: wage * length, bonuses: totalValue - (wage * length) } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_value', (req as any).language || 'en') });
  }
});

// --- CONTRACT HISTORY ---

// GET /api/player-contracts/player/:playerId/history
router.get('/player/:playerId/history', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId, 10);
    
    const negotiations = await prisma.contractNegotiation.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' }
    });

    const bonuses = await prisma.playerContractBonus.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' }
    });

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    
    res.json({
      currentContract: player ? {
        wage: player.wage,
        contractExpiry: player.contractExpiry,
        contractStart: player.contractStart
      } : null,
      negotiations,
      bonuses
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_contract_history', (req as any).language || 'en') });
  }
});

// --- CONTRACT AUTOMATION ---

// POST /api/player-contracts/club/:clubId/auto-renewals
router.post('/club/:clubId/auto-renewals', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { autoAcceptThreshold = 70 } = req.body;
    
    const expiringPlayers = await PlayerContractService.getExpiringContracts(clubId, 90);
    const results = [];

    for (const player of expiringPlayers) {
      // Calculate renewal probability based on player factors
      let probability = 50;
      if (player.morale && player.morale > 80) probability += 20;
      if (player.skill > 80) probability += 15;
      if (player.age < 25) probability += 10;
      if (player.ambition && player.ambition > 4) probability -= 15;

      if (probability >= autoAcceptThreshold) {
        try {
          const proposedWage = Math.floor((player.wage || 0) * 1.1); // 10% raise
          await PlayerContractService.createContractNegotiation({
            playerId: player.id,
            clubId: player.clubId!,
            proposedWage,
            proposedLength: 2,
            proposedBonuses: {
              appearance_bonus: Math.floor(proposedWage * 0.1),
              goal_bonus: player.position === 'FWD' ? Math.floor(proposedWage * 0.2) : 0,
              clean_sheet_bonus: player.position === 'GK' || player.position === 'DEF' ? Math.floor(proposedWage * 0.15) : 0
            },
            proposedClauses: {},
            agentFee: Math.floor(proposedWage * 0.05),
            status: 'pending',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
          results.push({ playerId: player.id, action: 'negotiation_created', probability });
                 } catch (error: any) {
           results.push({ playerId: player.id, action: 'failed', error: error.message });
         }
      } else {
        results.push({ playerId: player.id, action: 'skipped', probability });
      }
    }

    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_process_auto_renewals', (req as any).language || 'en') });
  }
});

export default router; 