"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const i18n_1 = require("../utils/i18n");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// --- ADMIN GATING (scaffold for real auth) ---
// TODO: Integrate real authentication/authorization
const isAdmin = (req) => {
    if (req.user && req.user.role)
        return req.user.role === 'admin';
    if (req.session && req.session.user && req.session.user.role)
        return req.session.user.role === 'admin';
    // Fallback: allow all for now
    return true;
};
// GET /api/jong-team/:parentClubId
router.get('/:parentClubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        // Find the Jong team for this parent club
        const jongTeam = yield prisma.club.findFirst({
            where: { parentClubId },
            include: { league: true }
        });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
        // League table
        const leagueTable = yield prisma.clubSeasonStats.findMany({
            where: { leagueId: jongTeam.leagueId },
            include: { club: true },
            orderBy: [
                { points: 'desc' },
                { goalDifference: 'desc' },
                { goalsFor: 'desc' }
            ]
        });
        // Fixtures
        const fixtures = yield prisma.fixture.findMany({
            where: {
                OR: [
                    { homeClubId: jongTeam.id },
                    { awayClubId: jongTeam.id }
                ]
            },
            orderBy: { week: 'asc' }
        });
        res.json({ jongTeam, leagueTable, fixtures });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_jong_team', req.language || 'en') });
    }
}));
// GET /api/jong-team/:parentClubId/squad
router.get('/:parentClubId/squad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const jongTeam = yield prisma.club.findFirst({ where: { parentClubId } });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
        const players = yield prisma.player.findMany({
            where: { clubId: jongTeam.id },
            orderBy: { skill: 'desc' }
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad', req.language || 'en') });
    }
}));
// GET /api/jong-team/:parentClubId/first-squad
router.get('/:parentClubId/first-squad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const players = yield prisma.player.findMany({
            where: {
                clubId: parentClubId,
                age: { lte: 21 }
            },
            orderBy: { skill: 'desc' }
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_first_squad', req.language || 'en') });
    }
}));
// GET /api/jong-team/:parentClubId/league-table
router.get('/:parentClubId/league-table', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const jongTeam = yield prisma.club.findFirst({ where: { parentClubId } });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
        const leagueTable = yield prisma.clubSeasonStats.findMany({
            where: { leagueId: jongTeam.leagueId },
            include: { club: true },
            orderBy: [
                { points: 'desc' },
                { goalDifference: 'desc' },
                { goalsFor: 'desc' }
            ]
        });
        res.json({ leagueTable });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_league_table', req.language || 'en') });
    }
}));
// GET /api/jong-team/:parentClubId/fixtures
router.get('/:parentClubId/fixtures', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const jongTeam = yield prisma.club.findFirst({ where: { parentClubId } });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
        const fixtures = yield prisma.fixture.findMany({
            where: {
                OR: [
                    { homeClubId: jongTeam.id },
                    { awayClubId: jongTeam.id }
                ]
            },
            orderBy: { week: 'asc' }
        });
        res.json({ fixtures });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_fixtures', req.language || 'en') });
    }
}));
// --- CREATE JONG TEAM ---
// POST /api/jong-team/:parentClubId
router.post('/:parentClubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const { name, leagueId, homeCity, regionTag, boardExpectation, morale, form, isJongTeam, homeKitShirt, homeKitShorts, homeKitSocks, awayKitShirt, awayKitShorts, awayKitSocks, eligibleForPromotion, regulatoryStatus, noSameDivisionAsParent, academyReputation } = req.body;
        // Only one Jong team per parent
        const existing = yield prisma.club.findFirst({ where: { parentClubId } });
        if (existing)
            return res.status(400).json({ error: (0, i18n_1.t)('error.jong_team_exists', req.language || 'en') });
        const jongTeam = yield prisma.club.create({
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
    }
    catch (error) {
        console.error('Error creating Jong team:', error);
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_jong_team', req.language || 'en') });
    }
}));
// --- UPDATE JONG TEAM ---
// PATCH /api/jong-team/:jongTeamId
router.patch('/:jongTeamId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { name, leagueId } = req.body;
        const jongTeam = yield prisma.club.update({
            where: { id: jongTeamId },
            data: { name, leagueId }
        });
        res.json({ jongTeam });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_jong_team', req.language || 'en') });
    }
}));
// --- DELETE JONG TEAM ---
// DELETE /api/jong-team/:jongTeamId
router.delete('/:jongTeamId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Remove all players from this team first
        yield prisma.player.updateMany({ where: { clubId: jongTeamId }, data: { clubId: null } });
        yield prisma.club.delete({ where: { id: jongTeamId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_jong_team', req.language || 'en') });
    }
}));
// --- MOVE PLAYER TO JONG TEAM ---
// POST /api/jong-team/:jongTeamId/add-player/:playerId
router.post('/:jongTeamId/add-player/:playerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const playerId = parseInt(req.params.playerId, 10);
        // Check Jong team exists
        const jongTeam = yield prisma.club.findUnique({ where: { id: jongTeamId } });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
        // Move player
        const player = yield prisma.player.update({ where: { id: playerId }, data: { clubId: jongTeamId } });
        res.json({ player });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_move_player', req.language || 'en') });
    }
}));
// --- PROMOTE PLAYER TO FIRST TEAM ---
// POST /api/jong-team/:parentClubId/promote-player/:playerId
router.post('/:parentClubId/promote-player/:playerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const playerId = parseInt(req.params.playerId, 10);
        // Move player to parent club
        const player = yield prisma.player.update({ where: { id: playerId }, data: { clubId: parentClubId } });
        res.json({ player });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_promote_player', req.language || 'en') });
    }
}));
// --- BULK MOVE PLAYERS TO JONG TEAM ---
// POST /api/jong-team/:jongTeamId/add-players
router.post('/:jongTeamId/add-players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { playerIds } = req.body;
        if (!Array.isArray(playerIds) || playerIds.length === 0)
            return res.status(400).json({ error: 'No playerIds provided' });
        yield prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: jongTeamId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_move_players', req.language || 'en') });
    }
}));
// --- BULK PROMOTE PLAYERS TO FIRST TEAM ---
// POST /api/jong-team/:parentClubId/promote-players
router.post('/:parentClubId/promote-players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const { playerIds } = req.body;
        if (!Array.isArray(playerIds) || playerIds.length === 0)
            return res.status(400).json({ error: 'No playerIds provided' });
        yield prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: parentClubId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_promote_players', req.language || 'en') });
    }
}));
// --- AUTO-PROMOTE ELIGIBLE PLAYERS ---
// POST /api/jong-team/:jongTeamId/auto-promote
router.post('/:jongTeamId/auto-promote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { parentClubId, minSkill = 70, maxAge = 21 } = req.body;
        // Find eligible players
        const eligible = yield prisma.player.findMany({
            where: { clubId: jongTeamId, skill: { gte: minSkill }, age: { lte: maxAge } }
        });
        const playerIds = eligible.map((p) => p.id);
        if (playerIds.length === 0)
            return res.json({ promoted: [] });
        yield prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: parentClubId } });
        res.json({ promoted: playerIds });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_auto_promote', req.language || 'en') });
    }
}));
// --- AUTO-DEMOTE ELIGIBLE PLAYERS ---
// POST /api/jong-team/:parentClubId/auto-demote
router.post('/:parentClubId/auto-demote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const parentClubId = parseInt(req.params.parentClubId, 10);
        const { jongTeamId, maxSkill = 65, maxAge = 21 } = req.body;
        // Find eligible players
        const eligible = yield prisma.player.findMany({
            where: { clubId: parentClubId, skill: { lte: maxSkill }, age: { lte: maxAge } }
        });
        const playerIds = eligible.map((p) => p.id);
        if (playerIds.length === 0)
            return res.json({ demoted: [] });
        yield prisma.player.updateMany({ where: { id: { in: playerIds } }, data: { clubId: jongTeamId } });
        res.json({ demoted: playerIds });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_auto_demote', req.language || 'en') });
    }
}));
// --- JONG TEAM STAFF MANAGEMENT ---
// POST /api/jong-team/:jongTeamId/staff
router.post('/:jongTeamId/staff', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const clubId = parseInt(req.params.jongTeamId, 10);
        const { name, role, skill, hiredDate } = req.body;
        const staff = yield prisma.staff.create({
            data: { name, role, skill, hiredDate, clubId }
        });
        res.status(201).json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_staff', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/staff
router.get('/:jongTeamId/staff', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.jongTeamId, 10);
        const staff = yield prisma.staff.findMany({ where: { clubId } });
        res.json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/staff/:staffId
router.patch('/:jongTeamId/staff/:staffId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const staffId = parseInt(req.params.staffId, 10);
        const { name, role, skill, hiredDate } = req.body;
        const staff = yield prisma.staff.update({
            where: { id: staffId },
            data: { name, role, skill, hiredDate }
        });
        res.json({ staff });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_staff', req.language || 'en') });
    }
}));
// DELETE /api/jong-team/:jongTeamId/staff/:staffId
router.delete('/:jongTeamId/staff/:staffId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const staffId = parseInt(req.params.staffId, 10);
        yield prisma.staff.delete({ where: { id: staffId } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_staff', req.language || 'en') });
    }
}));
// --- JONG TEAM ANALYTICS ---
// GET /api/jong-team/:jongTeamId/analytics
router.get('/:jongTeamId/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.jongTeamId, 10);
        // Player development: skill, morale over time
        const players = yield prisma.player.findMany({ where: { clubId } });
        const playerDevelopment = players.map((p) => ({
            id: p.id,
            name: p.name,
            skill: p.skill,
            morale: p.morale
        }));
        // Staff impact: average skill by role
        const staff = yield prisma.staff.findMany({ where: { clubId } });
        const staffByRole = staff.reduce((acc, s) => {
            if (!acc[s.role])
                acc[s.role] = [];
            acc[s.role].push(s.skill);
            return acc;
        }, {});
        const staffImpact = Object.entries(staffByRole).map(([role, skills]) => ({
            role,
            avgSkill: skills.reduce((a, b) => a + b, 0) / skills.length
        }));
        // Squad performance: win/loss, goals, league position trends
        const fixtures = yield prisma.fixture.findMany({
            where: { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
            orderBy: { week: 'asc' }
        });
        let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
        fixtures.forEach((fx) => {
            const isHome = fx.homeClubId === clubId;
            const gf = isHome ? fx.homeGoals : fx.awayGoals;
            const ga = isHome ? fx.awayGoals : fx.homeGoals;
            if (gf == null || ga == null)
                return;
            goalsFor += gf;
            goalsAgainst += ga;
            if (gf > ga)
                wins++;
            else if (gf === ga)
                draws++;
            else
                losses++;
        });
        // League position trend (use played as week)
        const stats = yield prisma.clubSeasonStats.findMany({
            where: { clubId },
            orderBy: { played: 'asc' }
        });
        const leagueTrend = stats.map((s) => ({ played: s.played, position: s.position }));
        res.json({
            playerDevelopment,
            staffImpact,
            squadPerformance: { wins, draws, losses, goalsFor, goalsAgainst, leagueTrend }
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_analytics', req.language || 'en') });
    }
}));
// --- JONG TEAM FINANCES ---
// GET /api/jong-team/:jongTeamId/finances
router.get('/:jongTeamId/finances', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const clubId = parseInt(req.params.jongTeamId, 10);
        // Player wages
        const players = yield prisma.player.findMany({ where: { clubId } });
        const playerWages = players.reduce((sum, p) => sum + (p.wage || 0), 0);
        // Staff wages (sum from active StaffContract for this club)
        const staff = yield prisma.staff.findMany({ where: { clubId } });
        let staffWages = 0;
        for (const s of staff) {
            const contract = yield prisma.staffContract.findFirst({ where: { staffId: s.id, clubId, isActive: true } });
            if (contract && contract.wage)
                staffWages += contract.wage;
        }
        // Transfer/wage budget (from ClubFinances)
        const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
        // Parent club impact
        const jongTeam = yield prisma.club.findUnique({ where: { id: clubId } });
        let parentFinances = null;
        if (jongTeam === null || jongTeam === void 0 ? void 0 : jongTeam.parentClubId) {
            parentFinances = yield prisma.clubFinances.findFirst({ where: { clubId: jongTeam.parentClubId }, orderBy: { season: 'desc' } });
        }
        res.json({
            playerWages,
            staffWages,
            transferBudget: (_a = finances === null || finances === void 0 ? void 0 : finances.transferBudget) !== null && _a !== void 0 ? _a : 0,
            wageBudget: (_b = finances === null || finances === void 0 ? void 0 : finances.wageBudget) !== null && _b !== void 0 ? _b : 0,
            parentClubImpact: parentFinances ? {
                balance: parentFinances.balance,
                wageBudget: parentFinances.wageBudget,
                transferBudget: parentFinances.transferBudget
            } : null
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_finances', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/finances
router.patch('/:jongTeamId/finances', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const clubId = parseInt(req.params.jongTeamId, 10);
        const { transferBudget, wageBudget } = req.body;
        const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
        if (!finances)
            return res.status(404).json({ error: 'No finances found for this Jong team.' });
        const updated = yield prisma.clubFinances.update({
            where: { id: finances.id },
            data: { transferBudget, wageBudget }
        });
        res.json({ finances: updated });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_finances', req.language || 'en') });
    }
}));
// --- JONG TEAM NOTIFICATIONS ---
// GET /api/jong-team/:jongTeamId/notifications
router.get('/:jongTeamId/notifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.jongTeamId, 10);
        // Players eligible for promotion (age <= 21, skill >= 70)
        const eligiblePlayers = yield prisma.player.findMany({
            where: { clubId, age: { lte: 21 }, skill: { gte: 70 } }
        });
        // Player contracts expiring in next 30 days
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringPlayers = yield prisma.player.findMany({
            where: { clubId, contractExpiry: { gte: now, lte: soon } }
        });
        // Staff contracts expiring in next 30 days
        const staff = yield prisma.staff.findMany({ where: { clubId } });
        const expiringStaff = [];
        for (const s of staff) {
            const contract = yield prisma.staffContract.findFirst({ where: { staffId: s.id, clubId, isActive: true, endDate: { gte: now, lte: soon } } });
            if (contract)
                expiringStaff.push(Object.assign(Object.assign({}, s), { contract }));
        }
        // Recent injuries/returns (last 14 days)
        const recentInjuries = yield prisma.playerInjury.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_notifications', req.language || 'en') });
    }
}));
// --- JONG TEAM SQUAD REGISTRATION ---
// POST /api/jong-team/:jongTeamId/register-squad
router.post('/:jongTeamId/register-squad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { season, competition, registeredPlayers } = req.body;
        if (!season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // TODO: Add eligibility checks (overage, foreign, etc.)
        const registration = yield prisma.squadRegistration.create({
            data: {
                clubId: jongTeamId,
                season,
                competition,
                registeredPlayers: JSON.stringify(registeredPlayers),
            },
        });
        res.status(201).json(registration);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_register_squad', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/registration-status
router.get('/:jongTeamId/registration-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const registrations = yield prisma.squadRegistration.findMany({
            where: { clubId: jongTeamId },
            orderBy: { registrationDate: 'desc' },
        });
        res.json(registrations);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad_registrations', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/eligible-players
router.get('/:jongTeamId/eligible-players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Example: Only players <= 21, not injured, not on loan
        const players = yield prisma.player.findMany({
            where: {
                clubId: jongTeamId,
                age: { lte: 21 },
                injured: false,
                loans: { none: { endDate: { gte: new Date() } } },
            },
            orderBy: { skill: 'desc' },
        });
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_eligible_players', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/registration
router.patch('/:jongTeamId/registration', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { registrationId, registeredPlayers } = req.body;
        if (!registrationId || !registeredPlayers || !Array.isArray(registeredPlayers)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // TODO: Add eligibility checks
        const updated = yield prisma.squadRegistration.update({
            where: { id: registrationId },
            data: { registeredPlayers: JSON.stringify(registeredPlayers) },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_registration', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/registration-rules
router.get('/:jongTeamId/registration-rules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_registration_rules', req.language || 'en') });
    }
}));
// --- JONG TEAM TRAINING MANAGEMENT ---
// GET /api/jong-team/:jongTeamId/training-focus
router.get('/:jongTeamId/training-focus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const jongTeam = yield prisma.club.findUnique({ where: { id: jongTeamId } });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
        res.json({ trainingFocus: jongTeam.trainingFocus });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_training_focus', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/training-focus
router.patch('/:jongTeamId/training-focus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { trainingFocus } = req.body;
        if (!trainingFocus)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const updated = yield prisma.club.update({ where: { id: jongTeamId }, data: { trainingFocus } });
        res.json({ trainingFocus: updated.trainingFocus });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_training_focus', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/training-logs
router.get('/:jongTeamId/training-logs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Get all players in Jong team
        const players = yield prisma.player.findMany({ where: { clubId: jongTeamId } });
        // For each player, get their trainingFocuses (logs)
        const logs = yield Promise.all(players.map((player) => __awaiter(void 0, void 0, void 0, function* () {
            const focuses = yield prisma.trainingFocus.findMany({ where: { playerId: player.id } });
            return { playerId: player.id, playerName: player.name, focuses };
        })));
        res.json({ logs });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_training_logs', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/player/:playerId/training-plan
router.patch('/:jongTeamId/player/:playerId/training-plan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const playerId = parseInt(req.params.playerId, 10);
        const { focus, mentorId } = req.body;
        if (!focus)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        // Check if a plan exists for this player
        const existing = yield prisma.youthPlayerDevelopmentPlan.findFirst({ where: { playerId } });
        let plan;
        if (existing) {
            plan = yield prisma.youthPlayerDevelopmentPlan.update({ where: { id: existing.id }, data: { focus, mentorId } });
        }
        else {
            plan = yield prisma.youthPlayerDevelopmentPlan.create({ data: { playerId, focus, mentorId } });
        }
        res.json({ plan });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_training_plan', req.language || 'en') });
    }
}));
// --- JONG TEAM TACTICS & MATCH PREPARATION ---
// GET /api/jong-team/:jongTeamId/tactics
router.get('/:jongTeamId/tactics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const formation = yield prisma.clubFormation.findFirst({ where: { clubId: jongTeamId } });
        const strategy = yield prisma.clubStrategy.findFirst({ where: { clubId: jongTeamId } });
        res.json({ formation, strategy });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_tactics', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/tactics
router.patch('/:jongTeamId/tactics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { formation, style, intensity, width, tempo, approach, defensiveStyle, attackingStyle, setPieces, marking } = req.body;
        let updatedFormation = null;
        let updatedStrategy = null;
        if (formation || style || intensity || width || tempo) {
            const existing = yield prisma.clubFormation.findFirst({ where: { clubId: jongTeamId } });
            if (existing) {
                updatedFormation = yield prisma.clubFormation.update({ where: { id: existing.id }, data: { formation, style, intensity, width, tempo } });
            }
            else {
                updatedFormation = yield prisma.clubFormation.create({ data: { clubId: jongTeamId, formation, style, intensity, width, tempo } });
            }
        }
        if (approach || defensiveStyle || attackingStyle || setPieces || marking) {
            const existing = yield prisma.clubStrategy.findFirst({ where: { clubId: jongTeamId } });
            if (existing) {
                updatedStrategy = yield prisma.clubStrategy.update({ where: { id: existing.id }, data: { approach, defensiveStyle, attackingStyle, setPieces, marking } });
            }
            else {
                updatedStrategy = yield prisma.clubStrategy.create({ data: { clubId: jongTeamId, approach, defensiveStyle, attackingStyle, setPieces, marking } });
            }
        }
        res.json({ formation: updatedFormation, strategy: updatedStrategy });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_tactics', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/chemistry
router.get('/:jongTeamId/chemistry', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const chemistry = yield prisma.squadChemistry.findFirst({ where: { clubId: jongTeamId } });
        const tactical = yield prisma.tacticalFamiliarity.findMany({ where: { clubId: jongTeamId } });
        res.json({ chemistry, tactical });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_chemistry', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/chemistry
router.patch('/:jongTeamId/chemistry', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { score, notes, tactic, familiarity } = req.body;
        let updatedChemistry = null;
        let updatedTactical = null;
        if (score !== undefined) {
            const existing = yield prisma.squadChemistry.findFirst({ where: { clubId: jongTeamId } });
            if (existing) {
                updatedChemistry = yield prisma.squadChemistry.update({ where: { id: existing.id }, data: { score, notes } });
            }
            else {
                updatedChemistry = yield prisma.squadChemistry.create({ data: { clubId: jongTeamId, score, notes } });
            }
        }
        if (tactic && familiarity !== undefined) {
            const existing = yield prisma.tacticalFamiliarity.findFirst({ where: { clubId: jongTeamId, tactic } });
            if (existing) {
                updatedTactical = yield prisma.tacticalFamiliarity.update({ where: { id: existing.id }, data: { familiarity, notes } });
            }
            else {
                updatedTactical = yield prisma.tacticalFamiliarity.create({ data: { clubId: jongTeamId, tactic, familiarity, notes } });
            }
        }
        res.json({ chemistry: updatedChemistry, tactical: updatedTactical });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_chemistry', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/starting-xi
router.get('/:jongTeamId/starting-xi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const startingXI = yield prisma.startingXI.findUnique({ where: { clubId: jongTeamId }, include: { slots: true } });
        res.json({ startingXI });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_starting_xi', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/starting-xi
router.patch('/:jongTeamId/starting-xi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { slots } = req.body; // [{ playerId, position, order }]
        if (!Array.isArray(slots) || slots.length !== 11)
            return res.status(400).json({ error: 'Starting XI must have 11 players.' });
        let startingXI = yield prisma.startingXI.findUnique({ where: { clubId: jongTeamId } });
        if (!startingXI) {
            startingXI = yield prisma.startingXI.create({ data: { clubId: jongTeamId } });
        }
        // Remove old slots
        yield prisma.startingXISlot.deleteMany({ where: { startingXIId: startingXI.id } });
        // Add new slots
        for (const slot of slots) {
            yield prisma.startingXISlot.create({ data: { startingXIId: startingXI.id, playerId: slot.playerId, position: slot.position, order: slot.order } });
        }
        const updatedXI = yield prisma.startingXI.findUnique({ where: { clubId: jongTeamId }, include: { slots: true } });
        res.json({ startingXI: updatedXI });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_starting_xi', req.language || 'en') });
    }
}));
// --- JONG TEAM TRANSFER & LOAN MANAGEMENT ---
// GET /api/jong-team/:jongTeamId/transfer-offers
router.get('/:jongTeamId/transfer-offers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Get all players in Jong team
        const players = yield prisma.player.findMany({ where: { clubId: jongTeamId } });
        const playerIds = players.map((p) => p.id);
        const offers = yield prisma.transferOffer.findMany({ where: { playerId: { in: playerIds } }, orderBy: { createdAt: 'desc' } });
        res.json({ offers });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_transfer_offers', req.language || 'en') });
    }
}));
// POST /api/jong-team/:jongTeamId/transfer-offer
router.post('/:jongTeamId/transfer-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { playerId, toClubId, fee, clauses, deadline } = req.body;
        if (!playerId || !toClubId || !fee || !deadline) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const player = yield prisma.player.findUnique({ where: { id: playerId } });
        if (!player || player.clubId !== jongTeamId)
            return res.status(404).json({ error: 'Player not found in Jong team' });
        const offer = yield prisma.transferOffer.create({
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
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_transfer_offer', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/loans
router.get('/:jongTeamId/loans', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const players = yield prisma.player.findMany({ where: { clubId: jongTeamId } });
        const playerIds = players.map((p) => p.id);
        const loans = yield prisma.loan.findMany({ where: { playerId: { in: playerIds } }, orderBy: { startDate: 'desc' } });
        res.json({ loans });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_loans', req.language || 'en') });
    }
}));
// POST /api/jong-team/:jongTeamId/loan
router.post('/:jongTeamId/loan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { playerId, toClubId, startDate, endDate, wageContribution } = req.body;
        if (!playerId || !toClubId || !startDate || !endDate) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const player = yield prisma.player.findUnique({ where: { id: playerId } });
        if (!player || player.clubId !== jongTeamId)
            return res.status(404).json({ error: 'Player not found in Jong team' });
        const loan = yield prisma.loan.create({
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
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_loan', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/loan/:loanId/recall
router.patch('/:jongTeamId/loan/:loanId/recall', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const loanId = parseInt(req.params.loanId, 10);
        const loan = yield prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan)
            return res.status(404).json({ error: 'Loan not found' });
        const updated = yield prisma.loan.update({ where: { id: loanId }, data: { endDate: new Date() } });
        res.json({ loan: updated });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_recall_loan', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/loan/:loanId/terminate
router.patch('/:jongTeamId/loan/:loanId/terminate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const loanId = parseInt(req.params.loanId, 10);
        const loan = yield prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan)
            return res.status(404).json({ error: 'Loan not found' });
        const updated = yield prisma.loan.update({ where: { id: loanId }, data: { endDate: new Date(), wageContribution: 0 } });
        res.json({ loan: updated });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_terminate_loan', req.language || 'en') });
    }
}));
// --- JONG TEAM YOUTH ACADEMY & INTAKE ---
// GET /api/jong-team/:jongTeamId/youth-intake
router.get('/:jongTeamId/youth-intake', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const events = yield prisma.youthIntakeEvent.findMany({ where: { clubId: jongTeamId }, orderBy: { year: 'desc' } });
        // For each event, get generated players (if tracked)
        // (Assume players with clubId and age <= 18, created in the event year)
        const players = yield prisma.player.findMany({ where: { clubId: jongTeamId, age: { lte: 18 } } });
        res.json({ events, players });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_youth_intake', req.language || 'en') });
    }
}));
// POST /api/jong-team/:jongTeamId/youth-intake
router.post('/:jongTeamId/youth-intake', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { year, type, count } = req.body;
        if (!year || !type || !count)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        // Create youth intake event
        const event = yield prisma.youthIntakeEvent.create({ data: { clubId: jongTeamId, year, type } });
        // Generate new youth players
        const players = [];
        for (let i = 0; i < count; i++) {
            const player = yield prisma.player.create({
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
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_trigger_youth_intake', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/youth-scouts
router.get('/:jongTeamId/youth-scouts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const scouts = yield prisma.youthScout.findMany({ where: { clubId: jongTeamId } });
        res.json({ scouts });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_youth_scouts', req.language || 'en') });
    }
}));
// POST /api/jong-team/:jongTeamId/youth-scout
router.post('/:jongTeamId/youth-scout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const { name, region, ability, network } = req.body;
        if (!name || !region || !ability || !network)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const scout = yield prisma.youthScout.create({ data: { clubId: jongTeamId, name, region, ability, network } });
        res.status(201).json({ scout });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_add_youth_scout', req.language || 'en') });
    }
}));
// --- JONG TEAM ACHIEVEMENTS & HISTORY ---
// GET /api/jong-team/:jongTeamId/achievements
router.get('/:jongTeamId/achievements', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Example: Find youth tournaments won, notable alumni (players who played for Jong team and reached high skill)
        const trophies = yield prisma.youthTournaments.findMany({ where: { winnerId: jongTeamId }, orderBy: { year: 'desc' } });
        const alumni = yield prisma.player.findMany({ where: { clubId: jongTeamId, skill: { gte: 75 } }, orderBy: { skill: 'desc' }, take: 10 });
        res.json({ trophies, alumni });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_achievements', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/history
router.get('/:jongTeamId/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Example: Find league finishes, historical squads
        const stats = yield prisma.clubSeasonStats.findMany({ where: { clubId: jongTeamId }, orderBy: { season: 'desc' } });
        // For each season, get squad (players who were at the club that season)
        // (Assume current squad for now)
        const squad = yield prisma.player.findMany({ where: { clubId: jongTeamId } });
        res.json({ stats, squad });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_history', req.language || 'en') });
    }
}));
// --- JONG TEAM SETTINGS & CUSTOMIZATION ---
// GET /api/jong-team/:jongTeamId/settings
router.get('/:jongTeamId/settings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const jongTeam = yield prisma.club.findUnique({ where: { id: jongTeamId } });
        if (!jongTeam)
            return res.status(404).json({ error: (0, i18n_1.t)('error.jong_team_not_found', req.language || 'en') });
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
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_settings', req.language || 'en') });
    }
}));
// PATCH /api/jong-team/:jongTeamId/settings
router.patch('/:jongTeamId/settings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isAdmin(req))
        return res.status(403).json({ error: (0, i18n_1.t)('error.unauthorized', req.language || 'en') });
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        const allowedFields = [
            'name', 'homeKitShirt', 'homeKitShorts', 'homeKitSocks',
            'awayKitShirt', 'awayKitShorts', 'awayKitSocks',
            'homeCity', 'stadium', 'regionTag'
        ];
        const data = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined)
                data[key] = req.body[key];
        }
        if (Object.keys(data).length === 0)
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        const updated = yield prisma.club.update({ where: { id: jongTeamId }, data });
        res.json({ settings: updated });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_settings', req.language || 'en') });
    }
}));
// --- JONG TEAM ADVANCED ANALYTICS & EVENTS ---
// GET /api/jong-team/:jongTeamId/advanced-analytics
router.get('/:jongTeamId/advanced-analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Player improvement curves (skill over time)
        const players = yield prisma.player.findMany({ where: { clubId: jongTeamId } });
        const playerIds = players.map((p) => p.id);
        const moraleLogs = yield prisma.playerMoraleLog.findMany({ where: { playerId: { in: playerIds } }, orderBy: { date: 'asc' } });
        // Staff impact (average skill by role)
        const staff = yield prisma.staff.findMany({ where: { clubId: jongTeamId } });
        const staffByRole = staff.reduce((acc, s) => {
            if (!acc[s.role])
                acc[s.role] = [];
            acc[s.role].push(s.skill);
            return acc;
        }, {});
        const staffImpact = Object.entries(staffByRole).map(([role, skills]) => ({
            role,
            avgSkill: skills.reduce((a, b) => a + b, 0) / skills.length
        }));
        // Chemistry and tactical familiarity
        const chemistry = yield prisma.squadChemistry.findFirst({ where: { clubId: jongTeamId } });
        const tactical = yield prisma.tacticalFamiliarity.findMany({ where: { clubId: jongTeamId } });
        res.json({
            playerImprovement: moraleLogs,
            staffImpact,
            chemistry,
            tactical
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_advanced_analytics', req.language || 'en') });
    }
}));
// GET /api/jong-team/:jongTeamId/events
router.get('/:jongTeamId/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jongTeamId = parseInt(req.params.jongTeamId, 10);
        // Example: Get recent training, match, board, and fan events
        // For now, fetch recent player morale logs, match events, and board meetings
        const moraleLogs = yield prisma.playerMoraleLog.findMany({
            where: { player: { clubId: jongTeamId } },
            orderBy: { date: 'desc' },
            take: 20
        });
        const matchEvents = yield prisma.matchEvent.findMany({
            where: { clubId: jongTeamId },
            orderBy: { minute: 'desc' },
            take: 20
        });
        const boardMeetings = yield prisma.boardMeeting.findMany({
            where: { clubId: jongTeamId },
            orderBy: { date: 'desc' },
            take: 10
        });
        res.json({ moraleLogs, matchEvents, boardMeetings });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_events', req.language || 'en') });
    }
}));
exports.default = router;
