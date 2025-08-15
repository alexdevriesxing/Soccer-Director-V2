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
const competitionService_1 = require("../services/competitionService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET /api/competitions?season=YYYY/YYYY
router.get('/competitions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const season = String(req.query.season || '').trim();
        if (!season)
            return res.status(400).json({ error: 'season (query) is required' });
        const comps = yield competitionService_1.competitionService.getActiveCompetitions(season);
        return res.json(comps);
    }
    catch (error) {
        console.error('Error fetching competitions:', error);
        return res.status(500).json({ error: 'Failed to fetch competitions' });
    }
}));
// POST /api/competitions/:competitionId/fixtures/generate?season=YYYY/YYYY
router.post('/competitions/:competitionId/fixtures/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const competitionId = Number(req.params.competitionId);
        const season = String(req.query.season || '').trim();
        if (!competitionId || !season) {
            return res.status(400).json({ error: 'competitionId (path) and season (query) are required' });
        }
        yield competitionService_1.competitionService.generateLeagueFixtures(competitionId, season);
        return res.json({ message: 'Fixtures generated', competitionId, season });
    }
    catch (error) {
        console.error('Error generating fixtures:', error);
        return res.status(500).json({ error: 'Failed to generate fixtures' });
    }
}));
// GET /api/competitions/:competitionId/table?season=YYYY/YYYY
router.get('/competitions/:competitionId/table', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const competitionId = Number(req.params.competitionId);
        const season = String(req.query.season || '').trim();
        if (!competitionId || !season) {
            return res.status(400).json({ error: 'competitionId (path) and season (query) are required' });
        }
        const table = yield competitionService_1.competitionService.getLeagueTable(competitionId, season);
        return res.json(table);
    }
    catch (error) {
        console.error('Error fetching league table:', error);
        return res.status(500).json({ error: 'Failed to fetch league table' });
    }
}));
// GET /api/teams/:teamId/fixtures?season=YYYY/YYYY
router.get('/teams/:teamId/fixtures', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season || '').trim();
        if (!teamId || !season) {
            return res.status(400).json({ error: 'teamId (path) and season (query) are required' });
        }
        const fixtures = yield prisma.fixture.findMany({
            where: {
                season,
                OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
            },
            include: {
                competition: true,
                homeTeam: true,
                awayTeam: true,
            },
            orderBy: [{ matchDate: 'asc' }],
        });
        return res.json(fixtures);
    }
    catch (error) {
        console.error('Error fetching team fixtures:', error);
        return res.status(500).json({ error: 'Failed to fetch team fixtures' });
    }
}));
// GET /api/teams/:teamId/fixtures/next?season=YYYY/YYYY
router.get('/teams/:teamId/fixtures/next', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = Number(req.params.teamId);
        const season = String(req.query.season || '').trim();
        if (!teamId || !season) {
            return res.status(400).json({ error: 'teamId (path) and season (query) are required' });
        }
        const nextFixture = yield prisma.fixture.findFirst({
            where: {
                season,
                isPlayed: false,
                OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
            },
            include: {
                competition: true,
                homeTeam: true,
                awayTeam: true,
            },
            orderBy: [{ matchDate: 'asc' }],
        });
        return res.json(nextFixture);
    }
    catch (error) {
        console.error('Error fetching next team fixture:', error);
        return res.status(500).json({ error: 'Failed to fetch next team fixture' });
    }
}));
exports.default = router;
