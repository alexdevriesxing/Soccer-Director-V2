import { Request, Response } from 'express';
import { competitionService } from '../services/competitionService';
import { prisma } from '../utils/prisma';

export const competitionController = {
  /**
   * Get all active competitions for the current season
   */
  getActiveCompetitions: async (req: Request, res: Response) => {
    try {
      const { season } = req.query;
      const competitions = await competitionService.getActiveCompetitions(season as string || '2025/2026');
      res.json(competitions);
    } catch (error) {
      console.error('Error getting competitions:', error);
      res.status(500).json({ error: 'Failed to get competitions' });
    }
  },

  /**
   * Get league table for a competition
   */
  getLeagueTable: async (req: Request, res: Response) => {
    try {
      const { competitionId } = req.params;
      const table = await competitionService.getLeagueTable(parseInt(competitionId));
      res.json(table);
    } catch (error) {
      console.error('Error getting league table:', error);
      res.status(500).json({ error: 'Failed to get league table' });
    }
  },

  /**
   * Generate fixtures for a competition
   */
  generateFixtures: async (req: Request, res: Response) => {
    try {
      const { competitionId } = req.params;
      const { season } = req.body;
      
      await competitionService.generateLeagueFixtures(
        parseInt(competitionId),
        season || '2025/2026'
      );
      
      res.json({ success: true, message: 'Fixtures generated successfully' });
    } catch (error) {
      console.error('Error generating fixtures:', error);
      res.status(500).json({ error: 'Failed to generate fixtures' });
    }
  },

  /**
   * Get fixtures for a competition
   */
  getFixtures: async (req: Request, res: Response) => {
    try {
      const { competitionId } = req.params;
      const { season } = req.query;
      
      const fixtures = await prisma.fixture.findMany({
        where: {
          competitionId: parseInt(competitionId),
          season: season as string || '2025/2026',
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
        },
        orderBy: [
          { round: 'asc' },
          { scheduledTime: 'asc' },
        ],
      });
      
      res.json(fixtures);
    } catch (error) {
      console.error('Error getting fixtures:', error);
      res.status(500).json({ error: 'Failed to get fixtures' });
    }
  },

  /**
   * Get a single competition by ID
   */
  getCompetition: async (req: Request, res: Response) => {
    try {
      const { competitionId } = req.params;
      
      const competition = await prisma.competition.findUnique({
        where: { id: parseInt(competitionId) },
        include: {
          teams: {
            include: {
              team: true,
            },
          },
        },
      });
      
      if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
      }
      
      res.json(competition);
    } catch (error) {
      console.error('Error getting competition:', error);
      res.status(500).json({ error: 'Failed to get competition' });
    }
  },
};
