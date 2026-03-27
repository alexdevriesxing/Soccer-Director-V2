import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PlayerSearchFilters } from '../types/player.types';
import PlayerService from '../services/player.service';

const prisma = new PrismaClient();
const playerService = new PlayerService(prisma);

export const getPlayer = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);
    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    const player = await playerService.getPlayer(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
    return;
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const searchPlayers = async (req: Request, res: Response) => {
  try {
    const {
      name,
      position,
      minAge,
      maxAge,
      minValue,
      maxValue,
      nationality,
      clubId,
      contractExpiring,
      sortBy,
      sortOrder,
      page,
      pageSize
    } = req.query;

    const filters: PlayerSearchFilters = {
      ...(name && { name: name as string }),
      ...(position && { position: position as any }), // Cast as any to avoid strict union check for query params
      ...(minAge && { minAge: parseInt(minAge as string) }),
      ...(maxAge && { maxAge: parseInt(maxAge as string) }),
      ...(minValue && { minValue: parseFloat(minValue as string) }),
      ...(maxValue && { maxValue: parseFloat(maxValue as string) }),
      ...(nationality && { nationality: nationality as string }),
      ...(clubId && { clubId: parseInt(clubId as string) }),
      ...(contractExpiring && { contractExpiring: contractExpiring === 'true' }),
      ...(sortBy && { sortBy: sortBy as any }), // Cast as any to avoid strict union check
      ...(sortOrder && { sortOrder: sortOrder as 'asc' | 'desc' }),
      ...(page && { page: parseInt(page as string) }),
      ...(pageSize && { pageSize: parseInt(pageSize as string) }),
    };

    const result = await playerService.searchPlayers(filters);
    res.json(result);
    return;
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);
    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const stats = await playerService.getStats(playerId);
    res.json(stats);
    return;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const updateTrainingFocus = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);
    const { focus, intensity } = req.body;

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }
    if (!focus || typeof intensity !== 'number') {
      res.status(400).json({ error: 'Invalid training data' });
      return;
    }

    await playerService.updateTraining(playerId, focus, intensity);
    res.json({ success: true });
    return;
  } catch (error) {
    console.error('Error updating training focus:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
