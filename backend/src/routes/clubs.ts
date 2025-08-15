import express, { Request } from 'express';
import { t } from '../utils/i18n';
import clubService from '../services/clubService';
import { PrismaClient, Club, League, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

type CreateClubRequest = {
  name: string;
  leagueId: number;
  homeCity?: string;
  boardExpectation?: string;
  morale?: number;
  form?: string;
  regulatoryStatus?: string;
  complianceDeadline?: Date | string;
  regionTag?: string;
  homeKitShirt?: string;
  homeKitShorts?: string;
  homeKitSocks?: string;
  awayKitShirt?: string;
  awayKitShorts?: string;
  awayKitSocks?: string;
  isJongTeam?: boolean;
  noSameDivisionAsParent?: boolean;
  eligibleForPromotion?: boolean;
  trainingFocus?: string;
  parentClubId?: number;
};

type ErrorResponse = {
  error: string;
};

// GET /api/clubs
router.get('/', async (req: Request<{}, {}, {}, { search?: string; leagueId?: string }>, res) => {
  try {
    const { search, leagueId } = req.query;
    const clubs = await clubService.getClubsWithLeagues({
      search,
      leagueId: leagueId ? parseInt(leagueId, 10) : undefined
    });
    res.json(clubs);
  } catch (error: any) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: t('error.failed_to_fetch_clubs', (req as any).language || 'en') });
  }
});

// POST /api/clubs
router.post<{}, {}, CreateClubRequest>('/', async (req, res) => {
  try {
    const { name, leagueId } = req.body;
    if (!name || leagueId == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const clubCreateInput: Prisma.ClubCreateInput = {
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
    const club = await clubService.createClub(clubCreateInput);
    res.status(201).json(club);
  } catch (error: any) {
    res.status(500).json({ error: t('error.failed_to_create_club', (req as Request).language || 'en') });
  }
});

// GET /api/clubs/:id
router.get<{ id: string }>('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const club = await clubService.getClubById(id);
    res.json(club);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_club', (req as any).language || 'en') });
  }
});

// PUT /api/clubs/:id
router.put('/:id', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const club = await clubService.updateClub(id, req.body);
    res.json(club);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_update_club', (req as any).language || 'en') });
  }
});

// DELETE /api/clubs/:id
router.delete('/:id', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await clubService.deleteClub(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_delete_club', (req as any).language || 'en') });
  }
});

// POST /api/clubs/:id/squad-registration
router.post('/:id/squad-registration', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const { season, competition, registeredPlayers } = req.body;
    if (!season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
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
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_register_squad', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/squad-registrations
router.get('/:id/squad-registrations', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const registrations = await prisma.squadRegistration.findMany({
      where: { clubId },
      orderBy: { registrationDate: 'desc' },
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_squad_registrations', (req as any).language || 'en') });
  }
});

// POST /api/clubs/:id/squad
router.post('/:id/squad', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    const player = await require('../services/playerService').default.assignPlayerToClub(playerId, clubId);
    res.status(200).json(player);
  } catch (error: any) {
    if (error.message === 'Player not found') {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_assign_player', (req as any).language || 'en') });
  }
});

// DELETE /api/clubs/:id/squad/:playerId
router.delete('/:id/squad/:playerId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const playerId = parseInt(req.params.playerId, 10);
    // Optionally check if player belongs to clubId first
    const player = await require('../services/playerService').default.removePlayerFromClub(playerId);
    res.status(200).json(player);
  } catch (error: any) {
    if (error.message === 'Player not found') {
      return res.status(404).json({ error: t('error.player_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_remove_player', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/squad
router.get('/:id/squad', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { page = '1', limit = '25' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    const squad = await clubService.getSquad(id, pageNum, limitNum);
    res.json(squad);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_squad', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/squad-analytics
router.get('/:id/squad-analytics', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const analytics = await clubService.getSquadAnalytics(id);
    res.json(analytics);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_squad_analytics', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/finances
router.get('/:id/finances', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const finances = await clubService.getClubFinances(id);
    res.json(finances);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_finances', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/financial-analytics
router.get('/:id/financial-analytics', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const analytics = await clubService.getFinancialAnalytics(id);
    res.json(analytics);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_financial_analytics', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/facilities
router.get('/:id/facilities', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const facilities = await clubService.getClubFacilities(id);
    res.json(facilities);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_facilities', (req as any).language || 'en') });
  }
});

// POST /api/clubs/:id/facilities/:facilityId/upgrade
router.post('/:id/facilities/:facilityId/upgrade', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const facilityId = parseInt(req.params.facilityId, 10);
    
    const upgradeRequest = await clubService.upgradeFacility(clubId, facilityId);
    res.status(201).json({ upgradeRequest });
  } catch (error: any) {
    if (error.message === 'Club not found' || error.message === 'Facility not found') {
      return res.status(404).json({ error: t('error.facility_not_found', (req as any).language || 'en') });
    }
    if (error.message === 'Insufficient funds for facility upgrade') {
      return res.status(400).json({ error: t('error.insufficient_funds', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_upgrade_facility', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/staff
router.get('/:id/staff', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const staff = await clubService.getClubStaff(id);
    res.json(staff);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_staff', (req as any).language || 'en') });
  }
});

// POST /api/clubs/:id/staff
router.post('/:id/staff', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, role, skill, wage } = req.body;
    
    if (!name || !role || !skill || !wage) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    
    const staff = await clubService.hireStaff(id, { name, role, skill, wage });
    res.status(201).json({ staff });
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    if (error.message === 'Insufficient wage budget') {
      return res.status(400).json({ error: t('error.insufficient_wage_budget', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_hire_staff', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/transfer-offers
router.get('/:id/transfer-offers', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const offers = await clubService.getTransferOffers(id);
    res.json({ offers });
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_transfer_offers', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/loans
router.get('/:id/loans', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const loans = await clubService.getLoans(id);
    res.json({ loans });
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_loans', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/youth-academy
router.get('/:id/youth-academy', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const academy = await clubService.getYouthAcademy(id);
    res.json(academy);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_youth_academy', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/board-expectations
router.get('/:id/board-expectations', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const expectations = await clubService.getBoardExpectations(id);
    res.json(expectations);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_board_expectations', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/analytics
router.get('/:id/analytics', async (req: Request, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const analytics = await clubService.getClubAnalytics(id);
    res.json(analytics);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }
    res.status(500).json({ error: t('error.failed_to_fetch_club_analytics', (req as any).language || 'en') });
  }
});

// POST /api/clubs/:id/starting-xi
router.post('/clubs/:id/starting-xi', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const { startingXI } = req.body;
    if (!startingXI || typeof startingXI !== 'object') {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    // Upsert StartingXI for the club
    let record = await prisma.startingXI.findFirst({ where: { clubId } });
    if (record) {
      record = await prisma.startingXI.update({ where: { id: record.id }, data: { slots: startingXI } });
    } else {
      record = await prisma.startingXI.create({ data: { clubId, slots: startingXI } });
    }
    res.status(201).json({ startingXI: record });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_save_starting_xi', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/history
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
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_club_history', (req as any).language || 'en') });
  }
});

export default router; 