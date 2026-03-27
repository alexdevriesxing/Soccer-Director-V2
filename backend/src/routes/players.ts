import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/players
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { clubId, position, limit = '50' } = req.query;

    const where: any = {};
    if (clubId) where.currentClubId = parseInt(clubId as string, 10);
    if (position) where.position = position;

    const players = await prisma.player.findMany({
      where,
      take: parseInt(limit as string, 10),
      orderBy: { value: 'desc' }
    });

    res.json({
      data: players // Return wrapped in data property to match tests
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// POST /api/players
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const player = await prisma.player.create({
      data: req.body
    });
    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(400).json({ error: 'Validation error: Failed to create player' });
  }
});

// GET /api/players/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        currentClub: true,
        mentoringAsMentor: {
          where: { status: 'ACTIVE' },
          include: { mentee: { select: { id: true, firstName: true, lastName: true, age: true } } }
        },
        mentoringAsMentee: {
          where: { status: 'ACTIVE' },
          include: { mentor: { select: { id: true, firstName: true, lastName: true, age: true } } }
        }
      }
    });

    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// GET /api/players/:id/stats
router.get('/:id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    // PlayerSeasonStats model not yet implemented - return stats from player record
    const player = await prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        appearances: true,
        goals: true,
        assists: true,
        yellowCards: true,
        redCards: true,
        cleanSheets: true
      }
    });

    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    // Return current stats as the only season
    const stats = [{
      season: '2024/2025',
      playerId: id,
      appearances: player.appearances,
      goals: player.goals,
      assists: player.assists,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      cleanSheets: player.cleanSheets
    }];

    res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// PUT /api/players/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const player = await prisma.player.update({
      where: { id },
      data: req.body
    });

    res.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});
// DELETE /api/players/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.player.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
