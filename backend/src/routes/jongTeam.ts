import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// --- ADMIN GATING (scaffold for real auth) ---
// TODO: Integrate real authentication/authorization
const isAdmin = (req: any) => {
  if (req.user && req.user.role) return req.user.role === 'admin';
  if (req.session && req.session.user && req.session.user.role) return req.session.user.role === 'admin';
  // Fallback: allow all for now
  return true;
};

// GET /api/jong-team/:parentClubId
router.get('/:parentClubId', async (req, res) => {
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    // Find the Jong team for this parent club
    const jongTeam = await prisma.club.findFirst({
      where: { parentClubId },
      include: { league: true }
    });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    // League table
    const leagueTable = await prisma.clubSeasonStats.findMany({
      where: { leagueId: jongTeam.leagueId },
      include: { club: true },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });
    // Fixtures
    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [
          { homeClubId: jongTeam.id },
          { awayClubId: jongTeam.id }
        ]
      },
      orderBy: { week: 'asc' }
    });
    res.json({ jongTeam, leagueTable, fixtures });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_jong_team', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:parentClubId/squad
router.get('/:parentClubId/squad', async (req, res) => {
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const jongTeam = await prisma.club.findFirst({ where: { parentClubId } });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    const players = await prisma.player.findMany({
      where: { clubId: jongTeam.id },
      orderBy: { skill: 'desc' }
    });
    res.json({ players });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_squad', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:parentClubId/first-squad
router.get('/:parentClubId/first-squad', async (req, res) => {
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const players = await prisma.player.findMany({
      where: {
        clubId: parentClubId,
        age: { lte: 21 }
      },
      orderBy: { skill: 'desc' }
    });
    res.json({ players });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_first_squad', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:parentClubId/league-table
router.get('/:parentClubId/league-table', async (req, res) => {
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const jongTeam = await prisma.club.findFirst({ where: { parentClubId } });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    const leagueTable = await prisma.clubSeasonStats.findMany({
      where: { leagueId: jongTeam.leagueId },
      include: { club: true },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });
    res.json({ leagueTable });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_league_table', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:parentClubId/fixtures
router.get('/:parentClubId/fixtures', async (req, res) => {
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const jongTeam = await prisma.club.findFirst({ where: { parentClubId } });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [
          { homeClubId: jongTeam.id },
          { awayClubId: jongTeam.id }
        ]
      },
      orderBy: { week: 'asc' }
    });
    res.json({ fixtures });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_fixtures', (req as any).language || 'en') });
  }
});

// --- CREATE JONG TEAM ---
// POST /api/jong-team/:parentClubId
router.post('/:parentClubId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const {
      name,
      leagueId,
      homeCity,
      regionTag,
      boardExpectation,
      morale,
      form,
      isJongTeam,
      homeKitShirt,
      homeKitShorts,
      homeKitSocks,
      awayKitShirt,
      awayKitShorts,
      awayKitSocks,
      eligibleForPromotion,
      regulatoryStatus,
      noSameDivisionAsParent,
      academyReputation
    } = req.body;
    // Only one Jong team per parent
    const existing = await prisma.club.findFirst({ where: { parentClubId } });
    if (existing) return res.status(400).json({ error: t('error.jong_team_exists', (req as any).language || 'en') });
    const jongTeam = await prisma.club.create({
      data: {
        name,
        leagueId,
        parentClubId,
        isJongTeam: isJongTeam !== undefined ? isJongTeam : true,
        homeCity: homeCity || null,
        regionTag: regionTag || 'unknown',
        boardExpectation: boardExpectation || 'Survive',
        morale: morale !== undefined ? morale : 30,
        form: form || '',
        homeKitShirt: homeKitShirt || '#cccccc',
        homeKitShorts: homeKitShorts || '#cccccc',
        homeKitSocks: homeKitSocks || '#cccccc',
        awayKitShirt: awayKitShirt || '#eeeeee',
        awayKitShorts: awayKitShorts || '#eeeeee',
        awayKitSocks: awayKitSocks || '#eeeeee',
        eligibleForPromotion: eligibleForPromotion !== undefined ? eligibleForPromotion : true,
        regulatoryStatus: regulatoryStatus || 'compliant',
        noSameDivisionAsParent: noSameDivisionAsParent !== undefined ? noSameDivisionAsParent : false,
        academyReputation: academyReputation !== undefined ? academyReputation : 0
      }
    });
    res.status(201).json({ jongTeam });
  } catch (error) {
    console.error('Error creating Jong team:', error);
    res.status(500).json({ error: t('error.failed_to_create_jong_team', (req as any).language || 'en') });
  }
});

// --- UPDATE JONG TEAM ---
// PATCH /api/jong-team/:jongTeamId
router.patch('/:jongTeamId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { name, leagueId } = req.body;
    const jongTeam = await prisma.club.update({
      where: { id: jongTeamId },
      data: { name, leagueId }
    });
    res.json({ jongTeam });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_jong_team', (req as any).language || 'en') });
  }
});

// --- DELETE JONG TEAM ---
// DELETE /api/jong-team/:jongTeamId
router.delete('/:jongTeamId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Remove all players from this team first
    await prisma.player.updateMany({ where: { clubId: jongTeamId }, data: { clubId: null } });
    await prisma.club.delete({ where: { id: jongTeamId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_jong_team', (req as any).language || 'en') });
  }
});

// --- MOVE PLAYER TO JONG TEAM ---
// POST /api/jong-team/:jongTeamId/add-player/:playerId
router.post('/:jongTeamId/add-player/:playerId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const playerId = parseInt(req.params.playerId, 10);
    // Check Jong team exists
    const jongTeam = await prisma.club.findUnique({ where: { id: jongTeamId } });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    // Move player
    const player = await prisma.player.update({ where: { id: playerId }, data: { clubId: jongTeamId } });
    res.json({ player });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_move_player', (req as any).language || 'en') });
  }
});

// --- PROMOTE PLAYER TO FIRST TEAM ---
// POST /api/jong-team/:parentClubId/promote-player/:playerId
router.post('/:parentClubId/promote-player/:playerId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const playerId = parseInt(req.params.playerId, 10);
    // Move player to parent club
    const player = await prisma.player.update({ where: { id: playerId }, data: { clubId: parentClubId } });
    res.json({ player });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_promote_player', (req as any).language || 'en') });
  }
});

// --- BULK MOVE PLAYERS TO JONG TEAM ---
// POST /api/jong-team/:jongTeamId/add-players
router.post('/:jongTeamId/add-players', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { playerIds } = req.body;
    if (!Array.isArray(playerIds) || playerIds.length === 0) return res.status(400).json({ error: 'No playerIds provided' });
    await prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: jongTeamId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_move_players', (req as any).language || 'en') });
  }
});

// --- BULK PROMOTE PLAYERS TO FIRST TEAM ---
// POST /api/jong-team/:parentClubId/promote-players
router.post('/:parentClubId/promote-players', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const { playerIds } = req.body;
    if (!Array.isArray(playerIds) || playerIds.length === 0) return res.status(400).json({ error: 'No playerIds provided' });
    await prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: parentClubId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_promote_players', (req as any).language || 'en') });
  }
});

// --- AUTO-PROMOTE ELIGIBLE PLAYERS ---
// POST /api/jong-team/:jongTeamId/auto-promote
router.post('/:jongTeamId/auto-promote', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { parentClubId, minSkill = 70, maxAge = 21 } = req.body;
    // Find eligible players
    const eligible = await prisma.player.findMany({
      where: { clubId: jongTeamId, skill: { gte: minSkill }, age: { lte: maxAge } }
    });
    const playerIds = eligible.map((p: any) => p.id);
    if (playerIds.length === 0) return res.json({ promoted: [] });
    await prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: parentClubId } });
    res.json({ promoted: playerIds });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_auto_promote', (req as any).language || 'en') });
  }
});

// --- AUTO-DEMOTE ELIGIBLE PLAYERS ---
// POST /api/jong-team/:parentClubId/auto-demote
router.post('/:parentClubId/auto-demote', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const parentClubId = parseInt(req.params.parentClubId, 10);
    const { jongTeamId, maxSkill = 65, maxAge = 21 } = req.body;
    // Find eligible players
    const eligible = await prisma.player.findMany({
      where: { clubId: parentClubId, skill: { lte: maxSkill }, age: { lte: maxAge } }
    });
    const playerIds = eligible.map((p: any) => p.id);
    if (playerIds.length === 0) return res.json({ demoted: [] });
    await prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: jongTeamId } });
    res.json({ demoted: playerIds });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_auto_demote', (req as any).language || 'en') });
  }
});

// --- JONG TEAM STAFF MANAGEMENT ---
// POST /api/jong-team/:jongTeamId/staff
router.post('/:jongTeamId/staff', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const clubId = parseInt(req.params.jongTeamId, 10);
    const { name, role, skill, hiredDate } = req.body;
    const staff = await prisma.staff.create({
      data: { name, role, skill, hiredDate, clubId }
    });
    res.status(201).json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_staff', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/staff
router.get('/:jongTeamId/staff', async (req, res) => {
  try {
    const clubId = parseInt(req.params.jongTeamId, 10);
    const staff = await prisma.staff.findMany({ where: { clubId } });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/staff/:staffId
router.patch('/:jongTeamId/staff/:staffId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const { name, role, skill, hiredDate } = req.body;
    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: { name, role, skill, hiredDate }
    });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_staff', (req as any).language || 'en') });
  }
});

// DELETE /api/jong-team/:jongTeamId/staff/:staffId
router.delete('/:jongTeamId/staff/:staffId', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const staffId = parseInt(req.params.staffId, 10);
    await prisma.staff.delete({ where: { id: staffId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_staff', (req as any).language || 'en') });
  }
});

// --- JONG TEAM ANALYTICS ---
// GET /api/jong-team/:jongTeamId/analytics
router.get('/:jongTeamId/analytics', async (req, res) => {
  try {
    const clubId = parseInt(req.params.jongTeamId, 10);
    // Player development: skill, morale over time
    const players = await prisma.player.findMany({ where: { clubId } });
    const playerDevelopment = players.map((p: any) => ({
      id: p.id,
      name: p.name,
      skill: p.skill,
      morale: p.morale
    }));
    // Staff impact: average skill by role
    const staff = await prisma.staff.findMany({ where: { clubId } });
    const staffByRole = staff.reduce((acc: Record<string, number[]>, s: any) => {
      if (!acc[s.role]) acc[s.role] = [];
      acc[s.role].push(s.skill);
      return acc;
    }, {} as Record<string, number[]>);
    const staffImpact = Object.entries(staffByRole).map(([role, skills]) => ({
      role,
      avgSkill: (skills as number[]).reduce((a: number, b: number) => a + b, 0) / (skills as number[]).length
    }));
    // Squad performance: win/loss, goals, league position trends
    const fixtures = await prisma.fixture.findMany({
      where: { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
      orderBy: { week: 'asc' }
    });
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    fixtures.forEach((fx: any) => {
      const isHome = fx.homeClubId === clubId;
      const gf = isHome ? fx.homeGoals : fx.awayGoals;
      const ga = isHome ? fx.awayGoals : fx.homeGoals;
      if (gf == null || ga == null) return;
      goalsFor += gf;
      goalsAgainst += ga;
      if (gf > ga) wins++; else if (gf === ga) draws++; else losses++;
    });
    // League position trend (use played as week)
    const stats = await prisma.clubSeasonStats.findMany({
      where: { clubId },
      orderBy: { played: 'asc' }
    });
    const leagueTrend = stats.map((s: any) => ({ played: s.played, position: s.position }));
    res.json({
      playerDevelopment,
      staffImpact,
      squadPerformance: { wins, draws, losses, goalsFor, goalsAgainst, leagueTrend }
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_analytics', (req as any).language || 'en') });
  }
});

// --- JONG TEAM FINANCES ---
// GET /api/jong-team/:jongTeamId/finances
router.get('/:jongTeamId/finances', async (req, res) => {
  try {
    const clubId = parseInt(req.params.jongTeamId, 10);
    // Player wages
    const players = await prisma.player.findMany({ where: { clubId } });
    const playerWages = players.reduce((sum: number, p: any) => sum + (p.wage || 0), 0);
    // Staff wages (sum from active StaffContract for this club)
    const staff = await prisma.staff.findMany({ where: { clubId } });
    let staffWages = 0;
    for (const s of staff) {
      const contract = await prisma.staffContract.findFirst({ where: { staffId: s.id, clubId, isActive: true } });
      if (contract && contract.wage) staffWages += contract.wage;
    }
    // Transfer/wage budget (from ClubFinances)
    const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
    // Parent club impact
    const jongTeam = await prisma.club.findUnique({ where: { id: clubId } });
    let parentFinances = null;
    if (jongTeam?.parentClubId) {
      parentFinances = await prisma.clubFinances.findFirst({ where: { clubId: jongTeam.parentClubId }, orderBy: { season: 'desc' } });
    }
    res.json({
      playerWages,
      staffWages,
      transferBudget: finances?.transferBudget ?? 0,
      wageBudget: finances?.wageBudget ?? 0,
      parentClubImpact: parentFinances ? {
        balance: parentFinances.balance,
        wageBudget: parentFinances.wageBudget,
        transferBudget: parentFinances.transferBudget
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_finances', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/finances
router.patch('/:jongTeamId/finances', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const clubId = parseInt(req.params.jongTeamId, 10);
    const { transferBudget, wageBudget } = req.body;
    const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
    if (!finances) return res.status(404).json({ error: 'No finances found for this Jong team.' });
    const updated = await prisma.clubFinances.update({
      where: { id: finances.id },
      data: { transferBudget, wageBudget }
    });
    res.json({ finances: updated });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_finances', (req as any).language || 'en') });
  }
});

// --- JONG TEAM NOTIFICATIONS ---
// GET /api/jong-team/:jongTeamId/notifications
router.get('/:jongTeamId/notifications', async (req, res) => {
  try {
    const clubId = parseInt(req.params.jongTeamId, 10);
    // Players eligible for promotion (age <= 21, skill >= 70)
    const eligiblePlayers = await prisma.player.findMany({
      where: { clubId, age: { lte: 21 }, skill: { gte: 70 } }
    });
    // Player contracts expiring in next 30 days
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringPlayers = await prisma.player.findMany({
      where: { clubId, contractExpiry: { gte: now, lte: soon } }
    });
    // Staff contracts expiring in next 30 days
    const staff = await prisma.staff.findMany({ where: { clubId } });
    const expiringStaff = [];
    for (const s of staff) {
      const contract = await prisma.staffContract.findFirst({ where: { staffId: s.id, clubId, isActive: true, endDate: { gte: now, lte: soon } } });
      if (contract) expiringStaff.push({ ...s, contract });
    }
    // Recent injuries/returns (last 14 days)
    const recentInjuries = await prisma.playerInjury.findMany({
      where: {
        player: { clubId },
        OR: [
          { startDate: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
          { endDate: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), lte: now } }
        ]
      },
      include: { player: true }
    });
    res.json({
      eligiblePlayers,
      expiringPlayers,
      expiringStaff,
      recentInjuries
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_notifications', (req as any).language || 'en') });
  }
});

// --- JONG TEAM SQUAD REGISTRATION ---
// POST /api/jong-team/:jongTeamId/register-squad
router.post('/:jongTeamId/register-squad', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { season, competition, registeredPlayers } = req.body;
    if (!season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    // TODO: Add eligibility checks (overage, foreign, etc.)
    const registration = await prisma.squadRegistration.create({
      data: {
        clubId: jongTeamId,
        season,
        competition,
        registeredPlayers: JSON.stringify(registeredPlayers),
      },
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_register_squad', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/registration-status
router.get('/:jongTeamId/registration-status', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const registrations = await prisma.squadRegistration.findMany({
      where: { clubId: jongTeamId },
      orderBy: { registrationDate: 'desc' },
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_squad_registrations', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/eligible-players
router.get('/:jongTeamId/eligible-players', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Example: Only players <= 21, not injured, not on loan
    const players = await prisma.player.findMany({
      where: {
        clubId: jongTeamId,
        age: { lte: 21 },
        injured: false,
        loans: { none: { endDate: { gte: new Date() } } },
      },
      orderBy: { skill: 'desc' },
    });
    res.json({ players });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_eligible_players', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/registration
router.patch('/:jongTeamId/registration', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { registrationId, registeredPlayers } = req.body;
    if (!registrationId || !registeredPlayers || !Array.isArray(registeredPlayers)) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    // TODO: Add eligibility checks
    const updated = await prisma.squadRegistration.update({
      where: { id: registrationId },
      data: { registeredPlayers: JSON.stringify(registeredPlayers) },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_registration', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/registration-rules
router.get('/:jongTeamId/registration-rules', async (req, res) => {
  try {
    // Example rules, could be dynamic in future
    const rules = {
      maxPlayers: 25,
      maxOverage: 3,
      maxForeign: 5,
      minHomegrown: 8,
      ageLimit: 21,
    };
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_registration_rules', (req as any).language || 'en') });
  }
});

// --- JONG TEAM TRAINING MANAGEMENT ---
// GET /api/jong-team/:jongTeamId/training-focus
router.get('/:jongTeamId/training-focus', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const jongTeam = await prisma.club.findUnique({ where: { id: jongTeamId } });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    res.json({ trainingFocus: jongTeam.trainingFocus });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_training_focus', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/training-focus
router.patch('/:jongTeamId/training-focus', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { trainingFocus } = req.body;
    if (!trainingFocus) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const updated = await prisma.club.update({ where: { id: jongTeamId }, data: { trainingFocus } });
    res.json({ trainingFocus: updated.trainingFocus });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_training_focus', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/training-logs
router.get('/:jongTeamId/training-logs', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Get all players in Jong team
    const players = await prisma.player.findMany({ where: { clubId: jongTeamId } });
    // For each player, get their trainingFocuses (logs)
    const logs = await Promise.all(players.map(async (player: any) => {
      const focuses = await prisma.trainingFocus.findMany({ where: { playerId: player.id } });
      return { playerId: player.id, playerName: player.name, focuses };
    }));
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_training_logs', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/player/:playerId/training-plan
router.patch('/:jongTeamId/player/:playerId/training-plan', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const playerId = parseInt(req.params.playerId, 10);
    const { focus, mentorId } = req.body;
    if (!focus) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    // Check if a plan exists for this player
    const existing = await prisma.youthPlayerDevelopmentPlan.findFirst({ where: { playerId } });
    let plan;
    if (existing) {
      plan = await prisma.youthPlayerDevelopmentPlan.update({ where: { id: existing.id }, data: { focus, mentorId } });
    } else {
      plan = await prisma.youthPlayerDevelopmentPlan.create({ data: { playerId, focus, mentorId } });
    }
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_training_plan', (req as any).language || 'en') });
  }
});

// --- JONG TEAM TACTICS & MATCH PREPARATION ---
// GET /api/jong-team/:jongTeamId/tactics
router.get('/:jongTeamId/tactics', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const formation = await prisma.clubFormation.findFirst({ where: { clubId: jongTeamId } });
    const strategy = await prisma.clubStrategy.findFirst({ where: { clubId: jongTeamId } });
    res.json({ formation, strategy });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_tactics', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/tactics
router.patch('/:jongTeamId/tactics', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { formation, style, intensity, width, tempo, approach, defensiveStyle, attackingStyle, setPieces, marking } = req.body;
    let updatedFormation = null;
    let updatedStrategy = null;
    if (formation || style || intensity || width || tempo) {
      const existing = await prisma.clubFormation.findFirst({ where: { clubId: jongTeamId } });
      if (existing) {
        updatedFormation = await prisma.clubFormation.update({ where: { id: existing.id }, data: { formation, style, intensity, width, tempo } });
      } else {
        updatedFormation = await prisma.clubFormation.create({ data: { clubId: jongTeamId, formation, style, intensity, width, tempo } });
      }
    }
    if (approach || defensiveStyle || attackingStyle || setPieces || marking) {
      const existing = await prisma.clubStrategy.findFirst({ where: { clubId: jongTeamId } });
      if (existing) {
        updatedStrategy = await prisma.clubStrategy.update({ where: { id: existing.id }, data: { approach, defensiveStyle, attackingStyle, setPieces, marking } });
      } else {
        updatedStrategy = await prisma.clubStrategy.create({ data: { clubId: jongTeamId, approach, defensiveStyle, attackingStyle, setPieces, marking } });
      }
    }
    res.json({ formation: updatedFormation, strategy: updatedStrategy });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_tactics', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/chemistry
router.get('/:jongTeamId/chemistry', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const chemistry = await prisma.squadChemistry.findFirst({ where: { clubId: jongTeamId } });
    const tactical = await prisma.tacticalFamiliarity.findMany({ where: { clubId: jongTeamId } });
    res.json({ chemistry, tactical });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_chemistry', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/chemistry
router.patch('/:jongTeamId/chemistry', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { score, notes, tactic, familiarity } = req.body;
    let updatedChemistry = null;
    let updatedTactical = null;
    if (score !== undefined) {
      const existing = await prisma.squadChemistry.findFirst({ where: { clubId: jongTeamId } });
      if (existing) {
        updatedChemistry = await prisma.squadChemistry.update({ where: { id: existing.id }, data: { score, notes } });
      } else {
        updatedChemistry = await prisma.squadChemistry.create({ data: { clubId: jongTeamId, score, notes } });
      }
    }
    if (tactic && familiarity !== undefined) {
      const existing = await prisma.tacticalFamiliarity.findFirst({ where: { clubId: jongTeamId, tactic } });
      if (existing) {
        updatedTactical = await prisma.tacticalFamiliarity.update({ where: { id: existing.id }, data: { familiarity, notes } });
      } else {
        updatedTactical = await prisma.tacticalFamiliarity.create({ data: { clubId: jongTeamId, tactic, familiarity, notes } });
      }
    }
    res.json({ chemistry: updatedChemistry, tactical: updatedTactical });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_chemistry', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/starting-xi
router.get('/:jongTeamId/starting-xi', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const startingXI = await prisma.startingXI.findUnique({ where: { clubId: jongTeamId }, include: { slots: true } });
    res.json({ startingXI });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_starting_xi', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/starting-xi
router.patch('/:jongTeamId/starting-xi', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { slots } = req.body; // [{ playerId, position, order }]
    if (!Array.isArray(slots) || slots.length !== 11) return res.status(400).json({ error: 'Starting XI must have 11 players.' });
    let startingXI = await prisma.startingXI.findUnique({ where: { clubId: jongTeamId } });
    if (!startingXI) {
      startingXI = await prisma.startingXI.create({ data: { clubId: jongTeamId } });
    }
    // Remove old slots
    await prisma.startingXISlot.deleteMany({ where: { startingXIId: startingXI.id } });
    // Add new slots
    for (const slot of slots) {
      await prisma.startingXISlot.create({ data: { startingXIId: startingXI.id, playerId: slot.playerId, position: slot.position, order: slot.order } });
    }
    const updatedXI = await prisma.startingXI.findUnique({ where: { clubId: jongTeamId }, include: { slots: true } });
    res.json({ startingXI: updatedXI });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_starting_xi', (req as any).language || 'en') });
  }
});

// --- JONG TEAM TRANSFER & LOAN MANAGEMENT ---
// GET /api/jong-team/:jongTeamId/transfer-offers
router.get('/:jongTeamId/transfer-offers', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Get all players in Jong team
    const players = await prisma.player.findMany({ where: { clubId: jongTeamId } });
    const playerIds = players.map((p: any) => p.id);
    const offers = await prisma.transferOffer.findMany({ where: { playerId: { in: playerIds } }, orderBy: { createdAt: 'desc' } });
    res.json({ offers });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_transfer_offers', (req as any).language || 'en') });
  }
});

// POST /api/jong-team/:jongTeamId/transfer-offer
router.post('/:jongTeamId/transfer-offer', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { playerId, toClubId, fee, clauses, deadline } = req.body;
    if (!playerId || !toClubId || !fee || !deadline) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player || player.clubId !== jongTeamId) return res.status(404).json({ error: 'Player not found in Jong team' });
    const offer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId: jongTeamId,
        toClubId,
        initiator: 'user',
        status: 'pending',
        fee,
        clauses: clauses || {},
        deadline: new Date(deadline),
        history: [],
      },
    });
    res.status(201).json({ offer });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_transfer_offer', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/loans
router.get('/:jongTeamId/loans', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const players = await prisma.player.findMany({ where: { clubId: jongTeamId } });
    const playerIds = players.map((p: any) => p.id);
    const loans = await prisma.loan.findMany({ where: { playerId: { in: playerIds } }, orderBy: { startDate: 'desc' } });
    res.json({ loans });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_loans', (req as any).language || 'en') });
  }
});

// POST /api/jong-team/:jongTeamId/loan
router.post('/:jongTeamId/loan', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { playerId, toClubId, startDate, endDate, wageContribution } = req.body;
    if (!playerId || !toClubId || !startDate || !endDate) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player || player.clubId !== jongTeamId) return res.status(404).json({ error: 'Player not found in Jong team' });
    const loan = await prisma.loan.create({
      data: {
        playerId,
        fromClubId: jongTeamId,
        toClubId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        wageContribution: wageContribution || 0,
      },
    });
    res.status(201).json({ loan });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_loan', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/loan/:loanId/recall
router.patch('/:jongTeamId/loan/:loanId/recall', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const loanId = parseInt(req.params.loanId, 10);
    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    const updated = await prisma.loan.update({ where: { id: loanId }, data: { endDate: new Date() } });
    res.json({ loan: updated });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_recall_loan', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/loan/:loanId/terminate
router.patch('/:jongTeamId/loan/:loanId/terminate', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const loanId = parseInt(req.params.loanId, 10);
    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    const updated = await prisma.loan.update({ where: { id: loanId }, data: { endDate: new Date(), wageContribution: 0 } });
    res.json({ loan: updated });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_terminate_loan', (req as any).language || 'en') });
  }
});

// --- JONG TEAM YOUTH ACADEMY & INTAKE ---
// GET /api/jong-team/:jongTeamId/youth-intake
router.get('/:jongTeamId/youth-intake', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const events = await prisma.youthIntakeEvent.findMany({ where: { clubId: jongTeamId }, orderBy: { year: 'desc' } });
    // For each event, get generated players (if tracked)
    // (Assume players with clubId and age <= 18, created in the event year)
    const players = await prisma.player.findMany({ where: { clubId: jongTeamId, age: { lte: 18 } } });
    res.json({ events, players });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_youth_intake', (req as any).language || 'en') });
  }
});

// POST /api/jong-team/:jongTeamId/youth-intake
router.post('/:jongTeamId/youth-intake', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { year, type, count } = req.body;
    if (!year || !type || !count) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    // Create youth intake event
    const event = await prisma.youthIntakeEvent.create({ data: { clubId: jongTeamId, year, type } });
    // Generate new youth players
    const players = [];
    for (let i = 0; i < count; i++) {
      const player = await prisma.player.create({
        data: {
          name: `Youth ${Math.floor(Math.random() * 10000)}`,
          clubId: jongTeamId,
          position: ['GK', 'DEF', 'MID', 'FWD'][Math.floor(Math.random() * 4)],
          age: 16 + Math.floor(Math.random() * 3),
          skill: Math.floor(Math.random() * 20) + 40,
          talent: Math.floor(Math.random() * 30) + 50,
          personality: 'BELOW_AVERAGE',
          nationality: 'Netherlands',
          wage: 0,
          contractExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
          potential: 80,
          currentPotential: 65,
          contractStart: new Date(),
        }
      });
      players.push(player);
    }
    res.status(201).json({ event, players });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_trigger_youth_intake', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/youth-scouts
router.get('/:jongTeamId/youth-scouts', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const scouts = await prisma.youthScout.findMany({ where: { clubId: jongTeamId } });
    res.json({ scouts });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_youth_scouts', (req as any).language || 'en') });
  }
});

// POST /api/jong-team/:jongTeamId/youth-scout
router.post('/:jongTeamId/youth-scout', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const { name, region, ability, network } = req.body;
    if (!name || !region || !ability || !network) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const scout = await prisma.youthScout.create({ data: { clubId: jongTeamId, name, region, ability, network } });
    res.status(201).json({ scout });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_add_youth_scout', (req as any).language || 'en') });
  }
});

// --- JONG TEAM ACHIEVEMENTS & HISTORY ---
// GET /api/jong-team/:jongTeamId/achievements
router.get('/:jongTeamId/achievements', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Example: Find youth tournaments won, notable alumni (players who played for Jong team and reached high skill)
    const trophies = await prisma.youthTournaments.findMany({ where: { winnerId: jongTeamId }, orderBy: { year: 'desc' } });
    const alumni = await prisma.player.findMany({ where: { clubId: jongTeamId, skill: { gte: 75 } }, orderBy: { skill: 'desc' }, take: 10 });
    res.json({ trophies, alumni });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_achievements', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/history
router.get('/:jongTeamId/history', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Example: Find league finishes, historical squads
    const stats = await prisma.clubSeasonStats.findMany({ where: { clubId: jongTeamId }, orderBy: { season: 'desc' } });
    // For each season, get squad (players who were at the club that season)
    // (Assume current squad for now)
    const squad = await prisma.player.findMany({ where: { clubId: jongTeamId } });
    res.json({ stats, squad });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_history', (req as any).language || 'en') });
  }
});

// --- JONG TEAM SETTINGS & CUSTOMIZATION ---
// GET /api/jong-team/:jongTeamId/settings
router.get('/:jongTeamId/settings', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const jongTeam = await prisma.club.findUnique({ where: { id: jongTeamId } });
    if (!jongTeam) return res.status(404).json({ error: t('error.jong_team_not_found', (req as any).language || 'en') });
    // Return relevant settings fields
    const settings = {
      name: jongTeam.name,
      homeKitShirt: jongTeam.homeKitShirt,
      homeKitShorts: jongTeam.homeKitShorts,
      homeKitSocks: jongTeam.homeKitSocks,
      awayKitShirt: jongTeam.awayKitShirt,
      awayKitShorts: jongTeam.awayKitShorts,
      awayKitSocks: jongTeam.awayKitSocks,
      homeCity: jongTeam.homeCity,
      stadium: jongTeam.stadium,
      regionTag: jongTeam.regionTag
    };
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_settings', (req as any).language || 'en') });
  }
});

// PATCH /api/jong-team/:jongTeamId/settings
router.patch('/:jongTeamId/settings', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: t('error.unauthorized', (req as any).language || 'en') });
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    const allowedFields = [
      'name', 'homeKitShirt', 'homeKitShorts', 'homeKitSocks',
      'awayKitShirt', 'awayKitShorts', 'awayKitSocks',
      'homeCity', 'stadium', 'regionTag'
    ];
    const data: { [key: string]: any } = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (Object.keys(data).length === 0) return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    const updated = await prisma.club.update({ where: { id: jongTeamId }, data });
    res.json({ settings: updated });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_settings', (req as any).language || 'en') });
  }
});

// --- JONG TEAM ADVANCED ANALYTICS & EVENTS ---
// GET /api/jong-team/:jongTeamId/advanced-analytics
router.get('/:jongTeamId/advanced-analytics', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Player improvement curves (skill over time)
    const players = await prisma.player.findMany({ where: { clubId: jongTeamId } });
    const playerIds = players.map((p: any) => p.id);
    const moraleLogs = await prisma.playerMoraleLog.findMany({ where: { playerId: { in: playerIds } }, orderBy: { date: 'asc' } });
    // Staff impact (average skill by role)
    const staff = await prisma.staff.findMany({ where: { clubId: jongTeamId } });
    const staffByRole: Record<string, number[]> = staff.reduce((acc: Record<string, number[]>, s: any) => {
      if (!acc[s.role]) acc[s.role] = [];
      acc[s.role].push(s.skill);
      return acc;
    }, {});
    const staffImpact = Object.entries(staffByRole).map(([role, skills]) => ({
      role,
      avgSkill: (skills as number[]).reduce((a: number, b: number) => a + b, 0) / (skills as number[]).length
    }));
    // Chemistry and tactical familiarity
    const chemistry = await prisma.squadChemistry.findFirst({ where: { clubId: jongTeamId } });
    const tactical = await prisma.tacticalFamiliarity.findMany({ where: { clubId: jongTeamId } });
    res.json({
      playerImprovement: moraleLogs,
      staffImpact,
      chemistry,
      tactical
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_advanced_analytics', (req as any).language || 'en') });
  }
});

// GET /api/jong-team/:jongTeamId/events
router.get('/:jongTeamId/events', async (req, res) => {
  try {
    const jongTeamId = parseInt(req.params.jongTeamId, 10);
    // Example: Get recent training, match, board, and fan events
    // For now, fetch recent player morale logs, match events, and board meetings
    const moraleLogs = await prisma.playerMoraleLog.findMany({
      where: { player: { clubId: jongTeamId } },
      orderBy: { date: 'desc' },
      take: 20
    });
    const matchEvents = await prisma.matchEvent.findMany({
      where: { clubId: jongTeamId },
      orderBy: { minute: 'desc' },
      take: 20
    });
    const boardMeetings = await prisma.boardMeeting.findMany({
      where: { clubId: jongTeamId },
      orderBy: { date: 'desc' },
      take: 10
    });
    res.json({ moraleLogs, matchEvents, boardMeetings });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_events', (req as any).language || 'en') });
  }
});

export default router; 