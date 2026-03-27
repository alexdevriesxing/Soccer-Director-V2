import express, { Request, Response } from 'express';
import { t } from '../utils/i18n';
import clubService from '../services/clubService';

const router = express.Router();

// GET /api/clubs - List all clubs
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, leagueId } = req.query as { search?: string; leagueId?: string };
    const clubs = await clubService.getClubsWithLeagues({
      search,
      leagueId: leagueId ? parseInt(leagueId, 10) : undefined
    });
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: t('error.failed_to_fetch_clubs', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id - Get single club
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const club = await clubService.getClubById(id);
    res.json(club);
  } catch (error: any) {
    if (error.message === 'Club not found') {
      res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
      return;
    }
    res.status(500).json({ error: t('error.failed_to_fetch_club', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/squad - Get club squad
router.get('/:id/squad', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const squad = await clubService.getSquad(clubId);
    res.json(squad);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_squad', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/finances - Get club finances
router.get('/:id/finances', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const finances = await clubService.getClubFinances(clubId);
    res.json(finances);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_finances', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/facilities - Get club facilities
router.get('/:id/facilities', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const facilities = await clubService.getClubFacilities(clubId);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_facilities', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/staff - Get club staff
router.get('/:id/staff', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const staff = await clubService.getClubStaff(clubId);
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff', (req as any).language || 'en') });
  }
});

// GET /api/clubs/:id/overview - Get comprehensive club overview
router.get('/:id/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const clubId = parseInt(req.params.id, 10);
    // Use getClubById for now - getClubOverview not implemented
    const overview = await clubService.getClubById(clubId);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_overview', (req as any).language || 'en') });
  }
});

export default router;