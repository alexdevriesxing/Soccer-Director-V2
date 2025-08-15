import express, { Request } from 'express';
import { t } from '../utils/i18n';
import youthAcademyService from '../services/youthAcademyService';
const router = express.Router();

// POST /api/youth/scout
router.post('/scout', async (req: Request, res) => {
  try {
    const { clubId } = req.body;
    if (!clubId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const players = await youthAcademyService.scoutYouthPlayers(clubId);
    res.json({ players });
  } catch (error: any) {
    res.status(500).json({ error: t('error.failed_to_scout_youth', (req as any).language || 'en') });
  }
});

// POST /api/youth/promote
router.post('/promote', async (req: Request, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const result = await youthAcademyService.promoteYouthPlayer(playerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: t('error.failed_to_promote_youth', (req as any).language || 'en') });
  }
});

// POST /api/youth/release
router.post('/release', async (req: Request, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const result = await youthAcademyService.releaseYouthPlayer(playerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: t('error.failed_to_release_youth', (req as any).language || 'en') });
  }
});

// GET /api/youth/tournaments
router.get('/tournaments', async (req: Request, res) => {
  try {
    const { clubId } = req.query;
    if (!clubId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const tournaments = await youthAcademyService.getYouthTournaments(Number(clubId));
    res.json({ tournaments });
  } catch (error: any) {
    res.status(500).json({ error: t('error.failed_to_fetch_youth_tournaments', (req as any).language || 'en') });
  }
});

// GET /api/youth/trainers
router.get('/trainers', async (req: Request, res) => {
  try {
    const { clubId } = req.query;
    if (!clubId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const trainers = await youthAcademyService.getAvailableTrainers(Number(clubId));
    res.json({ trainers });
  } catch (error: any) {
    res.status(500).json({ error: t('error.failed_to_fetch_trainers', (req as any).language || 'en') });
  }
});

// GET /api/youth/:clubId/scouting-reports
router.get('/:clubId/scouting-reports', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const reports = await youthAcademyService.scoutYouthPlayers(clubId);
    res.json(reports);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_scouting_reports', (req as any).language || 'en') });
  }
});

// POST /api/youth/:clubId/promote-player
router.post('/:clubId/promote-player', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { playerId, targetClubId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    
    const result = await youthAcademyService.promoteYouthPlayer(playerId, targetClubId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Player not found') {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }
    if (error.message.includes('too old')) {
      return res.status(400).json({ error: t('error.player_too_old', (req as any).language || 'en') });
    }
    if (error.message.includes('No target club')) {
      return res.status(400).json({ error: t('error.no_target_club', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_promote_player', (req as any).language || 'en') });
  }
});

// POST /api/youth/:clubId/release-player
router.post('/:clubId/release-player', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    
    const result = await youthAcademyService.releaseYouthPlayer(playerId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Player not found') {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }
    if (error.message.includes('too old')) {
      return res.status(400).json({ error: t('error.player_too_old', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_release_player', (req as any).language || 'en') });
  }
});

// GET /api/youth/:clubId/tournaments
router.get('/:clubId/tournaments', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const tournaments = await youthAcademyService.getYouthTournaments(clubId);
    res.json(tournaments);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_tournaments', (req as any).language || 'en') });
  }
});

// POST /api/youth/:clubId/join-tournament
router.post('/:clubId/join-tournament', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { tournamentId } = req.body;
    
    if (!tournamentId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    
    const result = await youthAcademyService.joinYouthTournament(clubId, tournamentId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    if (error.message === 'Tournament not found') {
      return res.status(404).json({ error: t('error.tournament_not_found', (req as any).language || 'en') });
    }
    if (error.message.includes('already entered')) {
      return res.status(400).json({ error: t('error.already_entered_tournament', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_join_tournament', (req as any).language || 'en') });
  }
});

// POST /api/youth/:clubId/trigger-intake
router.post('/:clubId/trigger-intake', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { type = 'manual' } = req.body;
    
    const result = await youthAcademyService.triggerYouthIntake(clubId, type);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    if (error.message.includes('already occurred')) {
      return res.status(400).json({ error: t('error.intake_already_occurred', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_trigger_intake', (req as any).language || 'en') });
  }
});

// GET /api/youth/:clubId/development-plans
router.get('/:clubId/development-plans', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const plans = await youthAcademyService.getYouthDevelopmentPlans(clubId);
    res.json(plans);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_development_plans', (req as any).language || 'en') });
  }
});

// POST /api/youth/:clubId/development-plan
router.post('/:clubId/development-plan', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { playerId, focus, mentorId } = req.body;
    
    if (!playerId || !focus) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    
    const plan = await youthAcademyService.setYouthDevelopmentPlan(playerId, focus, mentorId);
    res.json(plan);
  } catch (error: any) {
    if (error.message === 'Player not found') {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }
    if (error.message.includes('too old')) {
      return res.status(400).json({ error: t('error.player_too_old', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_set_development_plan', (req as any).language || 'en') });
  }
});

// GET /api/youth/:clubId/analytics
router.get('/:clubId/analytics', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const analytics = await youthAcademyService.getYouthAcademyAnalytics(clubId);
    res.json(analytics);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_analytics', (req as any).language || 'en') });
  }
});

// POST /api/youth/:clubId/automate
router.post('/:clubId/automate', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const results = await youthAcademyService.automateYouthAcademy(clubId);
    res.json(results);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_automate_youth_academy', (req as any).language || 'en') });
  }
});

export default router; 