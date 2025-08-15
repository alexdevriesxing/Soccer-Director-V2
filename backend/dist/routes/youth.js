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
const youthAcademyService_1 = __importDefault(require("../services/youthAcademyService"));
const router = express_1.default.Router();
// POST /api/youth/scout
router.post('/scout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId } = req.body;
        if (!clubId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const players = yield youthAcademyService_1.default.scoutYouthPlayers(clubId);
        res.json({ players });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_scout_youth', req.language || 'en') });
    }
}));
// POST /api/youth/promote
router.post('/promote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const result = yield youthAcademyService_1.default.promoteYouthPlayer(playerId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_promote_youth', req.language || 'en') });
    }
}));
// POST /api/youth/release
router.post('/release', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const result = yield youthAcademyService_1.default.releaseYouthPlayer(playerId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_release_youth', req.language || 'en') });
    }
}));
// GET /api/youth/tournaments
router.get('/tournaments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId } = req.query;
        if (!clubId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const tournaments = yield youthAcademyService_1.default.getYouthTournaments(Number(clubId));
        res.json({ tournaments });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_youth_tournaments', req.language || 'en') });
    }
}));
// GET /api/youth/trainers
router.get('/trainers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clubId } = req.query;
        if (!clubId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const trainers = yield youthAcademyService_1.default.getAvailableTrainers(Number(clubId));
        res.json({ trainers });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_trainers', req.language || 'en') });
    }
}));
// GET /api/youth/:clubId/scouting-reports
router.get('/:clubId/scouting-reports', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const reports = yield youthAcademyService_1.default.scoutYouthPlayers(clubId);
        res.json(reports);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_scouting_reports', req.language || 'en') });
    }
}));
// POST /api/youth/:clubId/promote-player
router.post('/:clubId/promote-player', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { playerId, targetClubId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const result = yield youthAcademyService_1.default.promoteYouthPlayer(playerId, targetClubId);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        if (error.message.includes('too old')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.player_too_old', req.language || 'en') });
        }
        if (error.message.includes('No target club')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.no_target_club', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_promote_player', req.language || 'en') });
    }
}));
// POST /api/youth/:clubId/release-player
router.post('/:clubId/release-player', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const result = yield youthAcademyService_1.default.releaseYouthPlayer(playerId);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        if (error.message.includes('too old')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.player_too_old', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_release_player', req.language || 'en') });
    }
}));
// GET /api/youth/:clubId/tournaments
router.get('/:clubId/tournaments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const tournaments = yield youthAcademyService_1.default.getYouthTournaments(clubId);
        res.json(tournaments);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_tournaments', req.language || 'en') });
    }
}));
// POST /api/youth/:clubId/join-tournament
router.post('/:clubId/join-tournament', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { tournamentId } = req.body;
        if (!tournamentId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const result = yield youthAcademyService_1.default.joinYouthTournament(clubId, tournamentId);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        if (error.message === 'Tournament not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.tournament_not_found', req.language || 'en') });
        }
        if (error.message.includes('already entered')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.already_entered_tournament', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_join_tournament', req.language || 'en') });
    }
}));
// POST /api/youth/:clubId/trigger-intake
router.post('/:clubId/trigger-intake', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { type = 'manual' } = req.body;
        const result = yield youthAcademyService_1.default.triggerYouthIntake(clubId, type);
        res.status(201).json(result);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        if (error.message.includes('already occurred')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.intake_already_occurred', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_trigger_intake', req.language || 'en') });
    }
}));
// GET /api/youth/:clubId/development-plans
router.get('/:clubId/development-plans', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const plans = yield youthAcademyService_1.default.getYouthDevelopmentPlans(clubId);
        res.json(plans);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_development_plans', req.language || 'en') });
    }
}));
// POST /api/youth/:clubId/development-plan
router.post('/:clubId/development-plan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const { playerId, focus, mentorId } = req.body;
        if (!playerId || !focus) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const plan = yield youthAcademyService_1.default.setYouthDevelopmentPlan(playerId, focus, mentorId);
        res.json(plan);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        if (error.message.includes('too old')) {
            return res.status(400).json({ error: (0, i18n_1.t)('error.player_too_old', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_set_development_plan', req.language || 'en') });
    }
}));
// GET /api/youth/:clubId/analytics
router.get('/:clubId/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const analytics = yield youthAcademyService_1.default.getYouthAcademyAnalytics(clubId);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_analytics', req.language || 'en') });
    }
}));
// POST /api/youth/:clubId/automate
router.post('/:clubId/automate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const results = yield youthAcademyService_1.default.automateYouthAcademy(clubId);
        res.json(results);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_automate_youth_academy', req.language || 'en') });
    }
}));
exports.default = router;
