"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const leagueService_1 = __importDefault(require("../services/leagueService"));
const i18n_1 = require("../utils/i18n");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const getLanguage = (req) => {
    return req.language || 'en';
};
const handleError = (res, error, errorKey, language) => {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({
        success: false,
        error: (0, i18n_1.t)(errorKey, language) || errorMessage
    });
};
const validateLeagueId = (id, res) => {
    const leagueId = parseInt(id, 10);
    if (isNaN(leagueId)) {
        return {
            id: 0,
            error: res.status(400).json({
                success: false,
                error: 'Invalid league ID'
            })
        };
    }
    return { id: leagueId };
};
router.get('/structure', async (_req, res) => {
    try {
        const leagues = await prisma.competition.findMany({
            where: {
                isActive: true,
                type: 'LEAGUE'
            },
            select: {
                id: true,
                name: true,
                country: true,
                level: true,
                season: true
            },
            orderBy: [
                { country: 'asc' },
                { level: 'asc' },
                { name: 'asc' }
            ]
        });
        const structure = leagues.reduce((acc, league) => {
            const country = league.country || 'Unknown';
            const level = league.level || 'UNKNOWN';
            if (!acc[country]) {
                acc[country] = {};
            }
            if (!acc[country][level]) {
                acc[country][level] = [];
            }
            acc[country][level].push({
                id: league.id,
                name: league.name,
                season: league.season
            });
            return acc;
        }, {});
        return res.json(structure);
    }
    catch (error) {
        console.error('Error fetching league structure:', error);
        return res.status(500).json({
            error: 'Failed to fetch league structure',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/', async (req, res) => {
    const language = getLanguage(req);
    try {
        const { country, level, season } = req.query;
        const where = {
            type: 'LEAGUE',
            isActive: true
        };
        if (country && typeof country === 'string') {
            where.country = { contains: country, mode: 'insensitive' };
        }
        if (level) {
            const validLevels = new Set(Object.values(client_1.LeagueLevel));
            if (validLevels.has(level)) {
                where.level = level;
            }
        }
        if (season && typeof season === 'string') {
            where.season = season;
        }
        const leagues = await prisma.competition.findMany({
            where,
            include: {
                teams: true
            }
        });
        return res.json({ success: true, data: leagues });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_leagues', language);
    }
});
router.post('/', async (req, res) => {
    const language = getLanguage(req);
    try {
        const league = await leagueService_1.default.createLeague({
            name: req.body.name,
            country: req.body.country,
            level: req.body.level,
            season: req.body.season,
            type: req.body.type,
            isActive: req.body.isActive ?? true
        });
        return res.status(201).json({ success: true, data: league });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_create_league', language);
    }
});
router.get('/filter', async (req, res) => {
    const language = getLanguage(req);
    try {
        const { country, level, season } = req.query;
        const where = {
            type: 'LEAGUE',
            isActive: true,
            ...(country && { country: { contains: country, mode: 'insensitive' } }),
            ...(level && { level: level }),
            ...(season && { season: season })
        };
        const leagues = await prisma.competition.findMany({
            where,
            include: {
                teams: true
            }
        });
        return res.json({ success: true, data: leagues });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_leagues', language);
    }
});
router.get('/:id', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const league = await prisma.competition.findUnique({
            where: { id: Number(id), type: 'LEAGUE' },
            include: {
                teams: {
                    include: {
                        team: true
                    },
                    orderBy: {
                        position: 'asc'
                    }
                },
                fixtures: true
            }
        });
        if (!league) {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.league_not_found', language)
            });
        }
        return res.json({ success: true, data: league });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_league', language);
    }
});
router.get('/:id/table', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const season = req.query.season || new Date().getFullYear().toString();
        const standings = await leagueService_1.default.getLeagueStandings(Number(id), season);
        if (!standings) {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.league_table_not_found', language)
            });
        }
        return res.json({ success: true, data: standings });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_league_table', language);
    }
});
router.put('/:id', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const league = await leagueService_1.default.getLeagueById(id);
        if (!league) {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.league_not_found', language)
            });
        }
        const updatedLeague = await leagueService_1.default.updateLeague(id, {
            name: req.body.name ?? league.name,
            country: req.body.country ?? league.country,
            level: req.body.level ?? league.level,
            season: req.body.season ?? league.season,
            type: req.body.type ?? league.type,
            isActive: req.body.isActive ?? league.isActive
        });
        return res.json({ success: true, data: updatedLeague });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_update_league', language);
    }
});
router.delete('/:id', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const league = await leagueService_1.default.getLeagueById(id);
        if (!league) {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.league_not_found', language)
            });
        }
        await leagueService_1.default.deleteLeague(id);
        return res.json({
            success: true,
            message: (0, i18n_1.t)('success.league_deleted', language)
        });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_delete_league', language);
    }
});
router.post('/:id/register-club', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const { clubId, season } = req.body;
        const result = await leagueService_1.default.registerClubForLeague(Number(clubId), Number(id), season);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_register_club', language);
    }
});
router.get('/:id/standings', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const season = req.query.season || new Date().getFullYear().toString();
        const standings = await leagueService_1.default.getLeagueStandings(Number(id), season);
        return res.json({ success: true, data: standings });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_standings', language);
    }
});
router.get('/:id/fixtures', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const season = req.query.season || new Date().getFullYear().toString();
        const matchday = req.query.matchday;
        const fixtures = await leagueService_1.default.getLeagueFixtures(Number(id), season);
        if (!fixtures) {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.fixtures_not_found', language)
            });
        }
        const filteredFixtures = matchday
            ? fixtures.fixtures.filter(f => f.matchDay === parseInt(matchday, 10))
            : fixtures.fixtures;
        return res.json({
            success: true,
            data: {
                ...fixtures,
                fixtures: filteredFixtures
            }
        });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_fixtures', language);
    }
});
router.get('/:id/statistics', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const statistics = await leagueService_1.default.getLeagueStatistics(Number(id));
        return res.json({ success: true, data: statistics });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_statistics', language);
    }
});
router.get('/:id/history', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const history = await leagueService_1.default.getLeagueHistory(Number(id));
        return res.json({ success: true, data: history });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_history', language);
    }
});
router.get('/:id/rankings', async (req, res) => {
    const language = getLanguage(req);
    const { id, error: idError } = validateLeagueId(req.params.id, res);
    if (idError)
        return idError;
    try {
        const league = await leagueService_1.default.getLeagueById(id);
        if (!league) {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.league_not_found', language)
            });
        }
        const season = req.query.season || new Date().getFullYear().toString();
        const rankings = await leagueService_1.default.getLeagueStandings(id, season);
        return res.json({ success: true, data: rankings });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_rankings', language);
    }
});
router.get('/cup-competitions', async (req, res) => {
    const language = getLanguage(req);
    try {
        const cups = await leagueService_1.default.getCupCompetitions();
        return res.json({ success: true, data: cups });
    }
    catch (error) {
        return handleError(res, error, 'error.failed_to_fetch_cup_competitions', language);
    }
});
router.get('/cup-competitions/:id/fixtures', async (req, res) => {
    const language = getLanguage(req);
    try {
        const { id, error: idError } = validateLeagueId(req.params.id, res);
        if (idError)
            return idError;
        const cupFixtures = await leagueService_1.default.getCupFixtures(id);
        return res.json({ success: true, data: cupFixtures });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage === 'Cup competition not found') {
            return res.status(404).json({
                success: false,
                error: (0, i18n_1.t)('error.cup_competition_not_found', language)
            });
        }
        return handleError(res, error, 'error.failed_to_fetch_cup_fixtures', language);
    }
});
exports.default = router;
//# sourceMappingURL=leagues.js.map