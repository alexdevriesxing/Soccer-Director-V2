"use strict";
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
router.get('/', async (req, res) => {
    try {
        const { search, leagueId } = req.query;
        const clubs = await clubService_1.default.getClubsWithLeagues({
            search,
            leagueId: leagueId ? parseInt(leagueId, 10) : undefined
        });
        res.json(clubs);
    }
    catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_clubs', req.language || 'en') });
    }
});
router.post('/', async (req, res) => {
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
            morale: req.body.morale ?? 70,
            form: req.body.form ?? '',
            regulatoryStatus: req.body.regulatoryStatus ?? 'compliant',
            complianceDeadline: req.body.complianceDeadline,
            regionTag: req.body.regionTag,
            homeKitShirt: req.body.homeKitShirt ?? '#ff6b6b',
            homeKitShorts: req.body.homeKitShorts ?? '#cc5555',
            homeKitSocks: req.body.homeKitSocks ?? '#ff6b6b',
            awayKitShirt: req.body.awayKitShirt ?? '#4ecdc4',
            awayKitShorts: req.body.awayKitShorts ?? '#3da89e',
            awayKitSocks: req.body.awayKitSocks ?? '#4ecdc4',
            isJongTeam: req.body.isJongTeam ?? false,
            noSameDivisionAsParent: req.body.noSameDivisionAsParent ?? false,
            eligibleForPromotion: req.body.eligibleForPromotion ?? true,
            trainingFocus: req.body.trainingFocus
        };
        if (req.body.parentClubId) {
            clubCreateInput.parentClub = { connect: { id: req.body.parentClubId } };
        }
        const club = await clubService_1.default.createClub(clubCreateInput);
        res.status(201).json(club);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_club', req.language || 'en') });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const club = await clubService_1.default.getClubById(id);
        res.json(club);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_club', req.language || 'en') });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const club = await clubService_1.default.updateClub(id, req.body);
        res.json(club);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_update_club', req.language || 'en') });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await clubService_1.default.deleteClub(id);
        res.status(204).send();
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_delete_club', req.language || 'en') });
    }
});
router.post('/:id/squad-registration', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { season, competition, registeredPlayers } = req.body;
        if (!season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const registration = await prisma.squadRegistration.create({
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
});
router.get('/:id/squad-registrations', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const registrations = await prisma.squadRegistration.findMany({
            where: { clubId },
            orderBy: { registrationDate: 'desc' },
        });
        res.json(registrations);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad_registrations', req.language || 'en') });
    }
});
router.post('/:id/squad', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const player = await require('../services/playerService').default.assignPlayerToClub(playerId, clubId);
        res.status(200).json(player);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_assign_player', req.language || 'en') });
    }
});
router.delete('/:id/squad/:playerId', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const playerId = parseInt(req.params.playerId, 10);
        const player = await require('../services/playerService').default.removePlayerFromClub(playerId);
        res.status(200).json(player);
    }
    catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_remove_player', req.language || 'en') });
    }
});
router.get('/:id/squad', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { page = '1', limit = '25' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const squad = await clubService_1.default.getSquad(id, pageNum, limitNum);
        res.json(squad);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad', req.language || 'en') });
    }
});
router.get('/:id/squad-analytics', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const analytics = await clubService_1.default.getSquadAnalytics(id);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_squad_analytics', req.language || 'en') });
    }
});
router.get('/:id/finances', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const finances = await clubService_1.default.getClubFinances(id);
        res.json(finances);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_finances', req.language || 'en') });
    }
});
router.get('/:id/financial-analytics', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const analytics = await clubService_1.default.getFinancialAnalytics(id);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_financial_analytics', req.language || 'en') });
    }
});
router.get('/:id/facilities', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const facilities = await clubService_1.default.getClubFacilities(id);
        res.json(facilities);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_facilities', req.language || 'en') });
    }
});
router.post('/:id/facilities/:facilityId/upgrade', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const facilityId = parseInt(req.params.facilityId, 10);
        const upgradeRequest = await clubService_1.default.upgradeFacility(clubId, facilityId);
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
});
router.get('/:id/staff', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const staff = await clubService_1.default.getClubStaff(id);
        res.json(staff);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_staff', req.language || 'en') });
    }
});
router.post('/:id/staff', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, role, skill, wage } = req.body;
        if (!name || !role || !skill || !wage) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        const staff = await clubService_1.default.hireStaff(id, { name, role, skill, wage });
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
});
router.get('/:id/transfer-offers', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const offers = await clubService_1.default.getTransferOffers(id);
        res.json({ offers });
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_transfer_offers', req.language || 'en') });
    }
});
router.get('/:id/loans', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const loans = await clubService_1.default.getLoans(id);
        res.json({ loans });
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_loans', req.language || 'en') });
    }
});
router.get('/:id/youth-academy', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const academy = await clubService_1.default.getYouthAcademy(id);
        res.json(academy);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_youth_academy', req.language || 'en') });
    }
});
router.get('/:id/board-expectations', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const expectations = await clubService_1.default.getBoardExpectations(id);
        res.json(expectations);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_expectations', req.language || 'en') });
    }
});
router.get('/:id/analytics', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const analytics = await clubService_1.default.getClubAnalytics(id);
        res.json(analytics);
    }
    catch (error) {
        if (error.message === 'Club not found') {
            return res.status(404).json({ error: (0, i18n_1.t)('error.club_not_found', req.language || 'en') });
        }
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_club_analytics', req.language || 'en') });
    }
});
router.post('/clubs/:id/starting-xi', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const { startingXI } = req.body;
        if (!startingXI || typeof startingXI !== 'object') {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        let record = await prisma.startingXI.findFirst({ where: { clubId } });
        if (record) {
            record = await prisma.startingXI.update({ where: { id: record.id }, data: { slots: startingXI } });
        }
        else {
            record = await prisma.startingXI.create({ data: { clubId, slots: startingXI } });
        }
        res.status(201).json({ startingXI: record });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_save_starting_xi', req.language || 'en') });
    }
});
router.get('/clubs/:id/history', async (req, res) => {
    try {
        const clubId = parseInt(req.params.id, 10);
        const stats = await prisma.clubSeasonStats.findMany({
            where: { clubId },
            orderBy: { season: 'desc' },
            include: {
                league: true
            }
        });
        const history = stats.map(s => ({
            season: s.season,
            league: s.league?.name || '-',
            position: s.position,
            points: s.points,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
            goalsFor: s.goalsFor,
            goalsAgainst: s.goalsAgainst,
            goalDifference: s.goalDifference
        }));
        res.json({ history });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_club_history', req.language || 'en') });
    }
});
exports.default = router;
//# sourceMappingURL=clubs.js.map