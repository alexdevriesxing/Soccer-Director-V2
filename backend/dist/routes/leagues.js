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
const i18n_1 = require("../utils/i18n");
const leagueService_1 = __importDefault(require("../services/leagueService"));
const router = express_1.default.Router();
// POST /api/leagues
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, tier, season } = req.body;
        if (!name || !tier || !season) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const league = yield leagueService_1.default.createLeague({
            name,
            tier,
            season,
            region: req.body.region,
            division: req.body.division,
            clubs: undefined,
            fixtures: undefined,
            seasonHistories: undefined,
            tvRights: undefined,
            seasonStats: undefined
        });
        res.status(201).json(league);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_league', req.language || 'en') });
    }
}));
// GET /api/leagues/:id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const league = yield leagueService_1.default.getLeagueById(id);
        res.json(league);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_league', req.language || 'en') });
    }
}));
// PUT /api/leagues/:id
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const league = yield leagueService_1.default.updateLeague(id, req.body);
        res.json(league);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_league', req.language || 'en') });
    }
}));
// DELETE /api/leagues/:id
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        yield leagueService_1.default.deleteLeague(id);
        res.status(204).send();
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_league', req.language || 'en') });
    }
}));
// POST /api/leagues/:id/register-club
router.post('/:id/register-club', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leagueId = parseInt(req.params.id, 10);
        const { clubId, season } = req.body;
        if (!clubId || !season) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const registration = yield leagueService_1.default.registerClubForLeague(clubId, leagueId, season);
        res.status(201).json({ registration });
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        if (error.message.includes('already registered')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.club_already_registered', req.language || 'en') });
        }
        if (error.message.includes('League is full')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.league_full', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_register_club', req.language || 'en') });
    }
}));
// GET /api/leagues/:id/rules
router.get('/:id/rules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const rules = yield leagueService_1.default.getLeagueRules(id);
        res.json(rules);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_rules', req.language || 'en') });
    }
}));
// GET /api/leagues/:id/standings
router.get('/:id/standings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { season } = req.query;
        const standings = yield leagueService_1.default.getLeagueStandings(id, season);
        res.json(standings);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_standings', req.language || 'en') });
    }
}));
// GET /api/leagues/:id/fixtures
router.get('/:id/fixtures', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { season } = req.query;
        const fixtures = yield leagueService_1.default.getLeagueFixtures(id, season);
        res.json(fixtures);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_fixtures', req.language || 'en') });
    }
}));
// POST /api/leagues/:id/generate-fixtures
router.post('/:id/generate-fixtures', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { season } = req.body;
        if (!season) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const result = yield leagueService_1.default.generateLeagueFixtures(id, season);
        res.status(201).json(result);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        if (error.message.includes('Need at least 2 clubs')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.insufficient_clubs', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_generate_fixtures', req.language || 'en') });
    }
}));
// POST /api/leagues/:id/promotion-relegation
router.post('/:id/promotion-relegation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const result = yield leagueService_1.default.processPromotionRelegation(id);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_process_promotion_relegation', req.language || 'en') });
    }
}));
// GET /api/leagues/:id/statistics
router.get('/:id/statistics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const statistics = yield leagueService_1.default.getLeagueStatistics(id);
        res.json(statistics);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_statistics', req.language || 'en') });
    }
}));
// GET /api/leagues/:id/history
router.get('/:id/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const history = yield leagueService_1.default.getLeagueHistory(id);
        res.json(history);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_history', req.language || 'en') });
    }
}));
// GET /api/leagues/:id/rankings
router.get('/:id/rankings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const rankings = yield leagueService_1.default.getLeagueRankings(id);
        res.json(rankings);
    }
    catch (error) {
        if (error.message === 'League not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.league_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_rankings', req.language || 'en') });
    }
}));
// GET /api/cup-competitions
router.get('/cup-competitions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cups = yield leagueService_1.default.getCupCompetitions();
        res.json(cups);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_cup_competitions', req.language || 'en') });
    }
}));
// GET /api/cup-competitions/:id/fixtures
router.get('/cup-competitions/:id/fixtures', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const cup = yield leagueService_1.default.getCupFixtures(id);
        res.json(cup);
    }
    catch (error) {
        if (error.message === 'Cup competition not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.cup_competition_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_cup_fixtures', req.language || 'en') });
    }
}));
exports.default = router;
