import express, { Request, Response } from 'express';
import v2GameService from '../services/v2GameService';
import { WeekPlanPayload, InterventionPayload, MatchPrepPayload } from '../domain';

const router = express.Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: 'v2',
    timestamp: new Date().toISOString()
  });
});

router.get('/clubs', async (_req: Request, res: Response) => {
  try {
    const data = await v2GameService.listClubChoices();
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list clubs.';
    return res.status(500).json({ success: false, error: message });
  }
});

router.post('/careers', async (req: Request, res: Response) => {
  try {
    const managerName = String(req.body.managerName || '').trim();
    const controlledClubId = Number(req.body.controlledClubId);
    if (!managerName || Number.isNaN(controlledClubId)) {
      return res.status(400).json({
        success: false,
        error: 'managerName and controlledClubId are required.'
      });
    }

    const career = await v2GameService.createCareer({ managerName, controlledClubId });
    return res.status(201).json({ success: true, data: career });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create career.';
    return res.status(500).json({ success: false, error: message });
  }
});

router.get('/careers', async (_req: Request, res: Response) => {
  try {
    const careers = await v2GameService.listCareers();
    return res.json({ success: true, data: careers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list careers.';
    return res.status(500).json({ success: false, error: message });
  }
});

router.delete('/careers/:careerId', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.deleteCareer(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete career.';
    return res.status(404).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/state', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getCareerState(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch career state.';
    return res.status(404).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/board', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getBoardStatus(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch board status.';
    return res.status(404).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/pulse', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getClubPulse(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch club pulse.';
    return res.status(404).json({ success: false, error: message });
  }
});

router.put('/careers/:careerId/week-plan', async (req: Request, res: Response) => {
  try {
    const payload = req.body as WeekPlanPayload;
    const data = await v2GameService.submitWeekPlan(req.params.careerId, payload);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit week plan.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/week-advance', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.advanceWeek(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to advance week.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/inbox', async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const data = await v2GameService.listInbox(req.params.careerId, status);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list inbox events.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/inbox/:eventId/respond', async (req: Request, res: Response) => {
  try {
    const optionId = String(req.body.optionId || '');
    if (!optionId) {
      return res.status(400).json({ success: false, error: 'optionId is required.' });
    }
    const data = await v2GameService.respondToEvent(req.params.careerId, req.params.eventId, optionId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to respond to event.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/matches/:matchId/start', async (req: Request, res: Response) => {
  try {
    const payload = req.body as MatchPrepPayload | undefined;
    const data = await v2GameService.startMatch(req.params.careerId, req.params.matchId, payload);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to start match.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/matches/:matchId/intervene', async (req: Request, res: Response) => {
  try {
    const payload = req.body as InterventionPayload;
    const data = await v2GameService.intervene(req.params.careerId, req.params.matchId, payload);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply intervention.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/matches/:matchId/highlights', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getMatchHighlights(req.params.careerId, req.params.matchId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load match highlights.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/matches/:matchId/post', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getPostMatch(req.params.careerId, req.params.matchId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch post-match recap.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/leagues', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.listCareerLeagues(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load career leagues.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/standings/:leagueId', async (req: Request, res: Response) => {
  try {
    const leagueId = Number(req.params.leagueId);
    if (Number.isNaN(leagueId)) {
      return res.status(400).json({ success: false, error: 'leagueId must be numeric.' });
    }
    const data = await v2GameService.getStandings(req.params.careerId, leagueId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load standings.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/standings/:leagueId/rules', async (req: Request, res: Response) => {
  try {
    const leagueId = Number(req.params.leagueId);
    if (Number.isNaN(leagueId)) {
      return res.status(400).json({ success: false, error: 'leagueId must be numeric.' });
    }
    const data = await v2GameService.getLeagueRules(req.params.careerId, leagueId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load league rules.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/transfer-market', async (req: Request, res: Response) => {
  try {
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
    const position = typeof req.query.position === 'string' ? req.query.position : undefined;
    const affordableOnly = typeof req.query.affordableOnly === 'string'
      ? req.query.affordableOnly.toLowerCase() === 'true'
      : undefined;

    const data = await v2GameService.getTransferMarket(req.params.careerId, {
      limit,
      position,
      affordableOnly
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load transfer market.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/sign', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.body?.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.signTransferTarget(req.params.careerId, playerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete transfer.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/shortlist', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.body?.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const shortlisted = typeof req.body?.shortlisted === 'boolean' ? req.body.shortlisted : undefined;
    const data = await v2GameService.setTransferShortlistStatus(req.params.careerId, { playerId, shortlisted });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update shortlist.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/scout', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.body?.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.requestTransferScoutingReport(req.params.careerId, playerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to request scouting report.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/offer', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.submitTransferOffer(req.params.careerId, {
      playerId: Number(req.body?.playerId),
      kind: typeof req.body?.kind === 'string' ? req.body.kind : 'PERMANENT',
      transferFee: req.body?.transferFee,
      weeklyWage: req.body?.weeklyWage,
      loanFee: req.body?.loanFee,
      wageContributionPct: req.body?.wageContributionPct,
      buyOptionFee: req.body?.buyOptionFee,
      loanDurationWeeks: req.body?.loanDurationWeeks,
      sellOnPct: req.body?.sellOnPct
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit transfer offer.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/offer/respond', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.respondToTransferOffer(req.params.careerId, {
      negotiationId: typeof req.body?.negotiationId === 'string' ? req.body.negotiationId : '',
      action: typeof req.body?.action === 'string' ? req.body.action : '',
      transferFee: req.body?.transferFee,
      weeklyWage: req.body?.weeklyWage,
      loanFee: req.body?.loanFee,
      wageContributionPct: req.body?.wageContributionPct,
      buyOptionFee: req.body?.buyOptionFee,
      loanDurationWeeks: req.body?.loanDurationWeeks
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to respond to transfer negotiation.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/loan-buy-option', async (req: Request, res: Response) => {
  try {
    const loanId = Number(req.body?.loanId);
    if (!Number.isFinite(loanId) || loanId <= 0) {
      return res.status(400).json({ success: false, error: 'loanId must be a valid number.' });
    }
    const data = await v2GameService.triggerIncomingLoanBuyOption(req.params.careerId, loanId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to trigger buy option.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/transfer-market/sell', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.body?.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.sellTransferTarget(req.params.careerId, playerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete outgoing transfer.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/squad', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getSquad(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load squad.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/squad/:playerId', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.getSquadPlayerProfile(req.params.careerId, playerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load squad player profile.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/role', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.assignSquadRole(req.params.careerId, playerId, {
      roleAssignment: req.body?.roleAssignment
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update squad role.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/development-plan', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.setPlayerDevelopmentPlan(req.params.careerId, playerId, {
      focus: req.body?.focus,
      target: req.body?.target
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update development plan.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/medical-plan', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.setPlayerMedicalPlan(req.params.careerId, playerId, {
      planCode: req.body?.planCode
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update medical plan.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/status', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.setPlayerStatusDirective(req.params.careerId, playerId, {
      action: req.body?.action
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update player status.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/registration', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.setPlayerRegistration(req.params.careerId, playerId, {
      action: req.body?.action
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update squad registration.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/retraining', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }
    const data = await v2GameService.setPlayerRetrainingPlan(req.params.careerId, playerId, {
      targetPosition: req.body?.targetPosition
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update retraining plan.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/renew', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }

    const years = req.body?.years !== undefined ? Number(req.body.years) : undefined;
    const wageAdjustmentPct = req.body?.wageAdjustmentPct !== undefined ? Number(req.body.wageAdjustmentPct) : undefined;
    const data = await v2GameService.renewSquadContract(req.params.careerId, playerId, {
      years,
      wageAdjustmentPct
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to renew contract.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/squad/:playerId/release', async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return res.status(400).json({ success: false, error: 'playerId must be a valid number.' });
    }

    const compensationWeeks = req.body?.compensationWeeks !== undefined
      ? Number(req.body.compensationWeeks)
      : undefined;
    const data = await v2GameService.releaseSquadPlayer(req.params.careerId, playerId, {
      compensationWeeks
    });
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to release player.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.get('/careers/:careerId/finances', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.getFinances(req.params.careerId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load finances.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/finances/operations', async (req: Request, res: Response) => {
  try {
    const operationKey = String(req.body.operationKey || '');
    if (!operationKey) {
      return res.status(400).json({ success: false, error: 'operationKey is required.' });
    }
    const data = await v2GameService.upgradeClubOperation(req.params.careerId, operationKey);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upgrade club operations.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/save/:slotId', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.saveSlot(req.params.careerId, req.params.slotId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save slot.';
    return res.status(400).json({ success: false, error: message });
  }
});

router.post('/careers/:careerId/load/:slotId', async (req: Request, res: Response) => {
  try {
    const data = await v2GameService.loadSlot(req.params.careerId, req.params.slotId);
    return res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load slot.';
    return res.status(400).json({ success: false, error: message });
  }
});

export default router;
