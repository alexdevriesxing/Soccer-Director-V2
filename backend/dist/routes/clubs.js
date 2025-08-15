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
const clubService_1 = __importDefault(require("../services/clubService"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// GET /api/clubs
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, leagueId } = req.query;
        const clubs = yield clubService_1.default.getClubsWithLeagues({
            search,
            leagueId: leagueId ? parseInt(leagueId, 10) : undefined
        });
        res.json(clubs);
    }
    catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_clubs', req.language || 'en') });
    }
}));
// POST /api/clubs
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const { name, leagueId } = req.body;
        if (!name || leagueId == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const clubCreateInput = {
            name,
            league: { connect: { id: leagueId } },
            homeCity: req.body.homeCity,
            boardExpectation: req.body.boardExpectation,
            morale: (_a = req.body.morale) !== null && _a !== void 0 ? _a : 70,
            form: (_b = req.body.form) !== null && _b !== void 0 ? _b : '',
            regulatoryStatus: (_c = req.body.regulatoryStatus) !== null && _c !== void 0 ? _c : 'compliant',
            complianceDeadline: req.body.complianceDeadline,
            regionTag: req.body.regionTag,
            homeKitShirt: (_d = req.body.homeKitShirt) !== null && _d !== void 0 ? _d : '#ff6b6b',
            homeKitShorts: (_e = req.body.homeKitShorts) !== null && _e !== void 0 ? _e : '#cc5555',
            homeKitSocks: (_f = req.body.homeKitSocks) !== null && _f !== void 0 ? _f : '#ff6b6b',
            awayKitShirt: (_g = req.body.awayKitShirt) !== null && _g !== void 0 ? _g : '#4ecdc4',
            awayKitShorts: (_h = req.body.awayKitShorts) !== null && _h !== void 0 ? _h : '#3da89e',
            awayKitSocks: (_j = req.body.awayKitSocks) !== null && _j !== void 0 ? _j : '#4ecdc4',
            isJongTeam: (_k = req.body.isJongTeam) !== null && _k !== void 0 ? _k : false,
            noSameDivisionAsParent: (_l = req.body.noSameDivisionAsParent) !== null && _l !== void 0 ? _l : false,
            eligibleForPromotion: (_m = req.body.eligibleForPromotion) !== null && _m !== void 0 ? _m : true,
            trainingFocus: req.body.trainingFocus
        };
        if (req.body.parentClubId) {
            clubCreateInput.parentClub = { connect: { id: req.body.parentClubId } };
        }
        const club = yield clubService_1.default.createClub(clubCreateInput);
        res.status(201).json(club);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_club', req.language || 'en') });
    }
}));
// GET /api/clubs/:id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const club = yield clubService_1.default.getClubById(id);
        res.json(club);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_club', req.language || 'en') });
    }
}));
// PUT /api/clubs/:id
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const club = yield clubService_1.default.updateClub(id, req.body);
        res.json(club);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_club', req.language || 'en') });
    }
}));
// DELETE /api/clubs/:id
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        yield clubService_1.default.deleteClub(id);
        res.status(204).send();
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_club', req.language || 'en') });
    }
}));
// POST /api/clubs/:id/squad-registration
router.post('/:id/squad-registration', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { season, competition, registeredPlayers } = req.body;
        if (!season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const registration = yield prisma.squadRegistration.create({
            data: {
                clubId,
                season,
                competition,
                registeredPlayers,
            },
        });
        res.status(201).json(registration);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_register_squad', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/squad-registrations
router.get('/:id/squad-registrations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const registrations = yield prisma.squadRegistration.findMany({
            where: { clubId },
            orderBy: { registrationDate: 'desc' },
        });
        res.json(registrations);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad_registrations', req.language || 'en') });
    }
}));
// POST /api/clubs/:id/squad
router.post('/:id/squad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const player = yield require('../services/playerService').default.assignPlayerToClub(playerId, clubId);
        res.status(200).json(player);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_assign_player', req.language || 'en') });
    }
}));
// DELETE /api/clubs/:id/squad/:playerId
router.delete('/:id/squad/:playerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const playerId = parseInt(req.params.playerId, 10);
        // Optionally check if player belongs to clubId first
        const player = yield require('../services/playerService').default.removePlayerFromClub(playerId);
        res.status(200).json(player);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_remove_player', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/squad
router.get('/:id/squad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { page = '1', limit = '25' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const squad = yield clubService_1.default.getSquad(id, pageNum, limitNum);
        res.json(squad);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/squad-analytics
router.get('/:id/squad-analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const analytics = yield clubService_1.default.getSquadAnalytics(id);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad_analytics', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/finances
router.get('/:id/finances', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const finances = yield clubService_1.default.getClubFinances(id);
        res.json(finances);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_finances', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/financial-analytics
router.get('/:id/financial-analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const analytics = yield clubService_1.default.getFinancialAnalytics(id);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_financial_analytics', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/facilities
router.get('/:id/facilities', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const facilities = yield clubService_1.default.getClubFacilities(id);
        res.json(facilities);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_facilities', req.language || 'en') });
    }
}));
// POST /api/clubs/:id/facilities/:facilityId/upgrade
router.post('/:id/facilities/:facilityId/upgrade', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const facilityId = parseInt(req.params.facilityId, 10);
        const upgradeRequest = yield clubService_1.default.upgradeFacility(clubId, facilityId);
        res.status(201).json({ upgradeRequest });
    }
    catch (error) {
        if (error.message === 'Club not found' || error.message === 'Facility not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.facility_not_found', req.language || 'en') });
        }
        if (error.message === 'Insufficient funds for facility upgrade') {
            return res.status(400).json({ error: (0, i18n_1.t)('error.insufficient_funds', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_upgrade_facility', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/staff
router.get('/:id/staff', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const staff = yield clubService_1.default.getClubStaff(id);
        res.json(staff);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff', req.language || 'en') });
    }
}));
// POST /api/clubs/:id/staff
router.post('/:id/staff', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, role, skill, wage } = req.body;
        if (!name || !role || !skill || !wage) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const staff = yield clubService_1.default.hireStaff(id, { name, role, skill, wage });
        res.status(201).json({ staff });
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        if (error.message === 'Insufficient wage budget') {
            return res.status(400).json({ error: (0, i18n_1.t)('error.insufficient_wage_budget', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_hire_staff', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/transfer-offers
router.get('/:id/transfer-offers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const offers = yield clubService_1.default.getTransferOffers(id);
        res.json({ offers });
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_transfer_offers', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/loans
router.get('/:id/loans', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const loans = yield clubService_1.default.getLoans(id);
        res.json({ loans });
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_loans', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/youth-academy
router.get('/:id/youth-academy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const academy = yield clubService_1.default.getYouthAcademy(id);
        res.json(academy);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_youth_academy', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/board-expectations
router.get('/:id/board-expectations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const expectations = yield clubService_1.default.getBoardExpectations(id);
        res.json(expectations);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_expectations', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/analytics
router.get('/:id/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const analytics = yield clubService_1.default.getClubAnalytics(id);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_club_analytics', req.language || 'en') });
    }
}));
// POST /api/clubs/:id/starting-xi
router.post('/clubs/:id/starting-xi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { startingXI } = req.body;
        if (!startingXI || typeof startingXI !== 'object') {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // Upsert StartingXI for the club
        let record = yield prisma.startingXI.findFirst({ where: { clubId } });
        if (record) {
            record = yield prisma.startingXI.update({ where: { id: record.id }, data: { slots: startingXI } });
        }
        else {
            record = yield prisma.startingXI.create({ data: { clubId, slots: startingXI } });
        }
        res.status(201).json({ startingXI: record });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_save_starting_xi', req.language || 'en') });
    }
}));
// GET /api/clubs/:id/history
router.get('/clubs/:id/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.id, 10);
        const stats = yield prisma.clubSeasonStats.findMany({
            where: { clubId },
            orderBy: { season: 'desc' },
            include: {
                league: true
            }
        });
        const history = stats.map(s => {
            var _a;
            return ({
                season: s.season,
                league: ((_a = s.league) === null || _a === void 0 ? void 0 : _a.name) || '-',
                position: s.position,
                points: s.points,
                won: s.won,
                drawn: s.drawn,
                lost: s.lost,
                goalsFor: s.goalsFor,
                goalsAgainst: s.goalsAgainst,
                goalDifference: s.goalDifference
            });
        });
        res.json({ history });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_club_history', req.language || 'en') });
    }
}));
exports.default = router;
