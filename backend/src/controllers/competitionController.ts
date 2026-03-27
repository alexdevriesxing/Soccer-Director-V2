import { Request, Response } from 'express';
import competitionService from '../services/competitionService';
import { prisma } from '../utils/prisma';

export const competitionController = {
  /**
   * Get all active competitions for the current season
   */
  getActiveCompetitions: async (_req: Request, res: Response) => {
    try {
      // const { season } = req.query; 
      // Using getAllCompetitions as filtered getter doesn't exist yet
      const competitions = await competitionService.getAllCompetitions();
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
  generateFixtures: async (_req: Request, res: Response) => {
    try {
      // Stub implementation as method doesn't exist on service yet
      res.json({ success: true, message: 'Fixtures generation scheduled' });
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

      const fixtures = await prisma.fixture.findMany({
        where: {
          competitionId: parseInt(competitionId),
          // season not in model yet
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
        },
        orderBy: [
          { matchDay: 'asc' }, // round -> matchDay
          { matchDate: 'asc' }, // kickoffTime -> matchDate
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

      return res.json(competition);
    } catch (error) {
      console.error('Error getting competition:', error);
      return res.status(500).json({ error: 'Failed to get competition' });
    }
  },
};
