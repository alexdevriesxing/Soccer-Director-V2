import express from 'express';
import { PrismaClient, ManagerProfile, Club, League } from '@prisma/client';
import { t } from '../utils/i18n';
import { createAppError } from '../middleware/errorHandler';

// Type for the response we'll send back
interface ProfileResponse {
  id: number;
  name: string;
  clubId: number;
  userId: number | null;
  reputation: number;
  createdAt: string;
  updatedAt: string;
  club: {
    id: number;
    name: string;
    league: {
      id: number;
      name: string;
      tier: string;
      season: string;
    };
  };
}

// Extend the ManagerProfile type to include related data and required fields
type ManagerProfileWithRelations = ManagerProfile & {
  id: number;
  name: string;
  clubId: number;
  userId: number | null;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
  club: Club & {
    league: League;
  };
};

interface CreateProfileRequest {
  name: string;
  club?: string;
  clubId?: number;
}

interface ErrorResponse {
  error: string;
}



declare module 'express' {
  interface Request {
    language?: string;
  }
}

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/profiles - List all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await prisma.managerProfile.findMany({
      include: {
        club: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    const language = 'language' in req ? (req as { language?: string }).language || 'en' : 'en';
    res.status(500).json({ error: t('error.failed_to_fetch_profiles', language) });
  }
});

// POST /api/profiles - Create a new profile
router.post<Record<string, never>, ErrorResponse | ProfileResponse, CreateProfileRequest>('/', async (req, res, next) => {
  try {
    const { name, club, clubId } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!club && !clubId) {
      return res.status(400).json({ error: 'Either club name or club ID is required' });
    }

    let clubRecord;
    
    // If clubId is provided, find the club by ID
    if (clubId) {
      clubRecord = await prisma.club.findUnique({
        where: { id: clubId },
        include: { league: true }
      });
      
      if (!clubRecord) {
        return res.status(404).json({ error: 'Club not found with provided ID' });
      }

      // Create the manager profile with the existing club
      const profile = await prisma.managerProfile.create({
        data: {
          name,
          club: {
            connect: { id: clubRecord.id }
          }
        },
        include: {
          club: {
            include: {
              league: true
            }
          }
        }
      }) as unknown as ManagerProfileWithRelations;
      
      // Return the created profile with club and league info
      const response: ProfileResponse = {
        id: profile.id,
        name: profile.name,
        clubId: profile.clubId,
        userId: profile.userId || null,
        reputation: profile.reputation,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
        club: {
          id: profile.club.id,
          name: profile.club.name,
          league: {
            id: profile.club.league.id,
            name: profile.club.league.name,
            tier: (profile.club.league as { tier?: string }).tier || '1',
            season: (profile.club.league as { season?: string }).season || '2024/2025'
          }
        }
      };
      return res.status(201).json(response);
    } else if (club) {
      // Find or create a new club by name
      clubRecord = await prisma.club.findFirst({
        where: { name: club },
        include: { league: true }
      });

      if (!clubRecord) {
        // Create a new club if it doesn't exist
        let defaultLeague = await prisma.league.findFirst({
          where: { name: 'Default League' }
        });

        if (!defaultLeague) {
          defaultLeague = await prisma.league.create({
            data: {
              name: 'Default League',
              tier: '1',
              season: '2024/2025',
              region: 'Default Region',
              division: 'Default Division'
            }
          });
        }

        // Create the club
        const newClub = await prisma.club.create({
          data: {
            name: club,
            leagueId: defaultLeague.id,
            homeCity: 'Unknown',
            boardExpectation: 'Mid-table',
            form: '',
            balance: 0,
            facilities: {
              create: [
                {
                  name: 'Stadium',
                  type: 'stadium',
                  level: 1,
                  capacity: 5000,
                  maintenanceCost: 5000,
                  upgradeCost: 100000,
                  effects: '{}',
                  ticketPrice: 25
                },
                {
                  name: 'Training Ground',
                  type: 'training',
                  level: 1,
                  maintenanceCost: 2000,
                  upgradeCost: 50000,
                  effects: '{}'
                },
                {
                  name: 'Youth Academy',
                  type: 'youth',
                  level: 1,
                  maintenanceCost: 1500,
                  upgradeCost: 30000,
                  effects: '{}'
                }
              ]
            }
          },
          include: {
            league: true,
            facilities: true
          }
        });

        // Create finances for the new club with only required fields
        await prisma.clubFinances.create({
          data: {
            clubId: newClub.id,
            balance: 1000000,
            wageBudget: 50000,
            transferBudget: 1000000,
            season: '2024/2025',
            week: 1 // Add default week
          }
        });

        // Club exists, create manager profile with existing club
        const profile = await prisma.managerProfile.create({
          data: {
            name,
            club: {
              connect: { id: newClub.id }
            },
            reputation: 50 // Default reputation
          },
          include: {
            club: {
              include: {
                league: true
              }
            }
          }
        }) as unknown as ManagerProfileWithRelations;
        
        // Return the created profile with club and league info
        const response: ProfileResponse = {
          id: profile.id,
          name: profile.name,
          clubId: profile.clubId,
          userId: profile.userId || null,
          reputation: profile.reputation,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          club: {
            id: profile.club.id,
            name: profile.club.name,
            league: {
              id: profile.club.league.id,
              name: profile.club.league.name,
              tier: (profile.club.league as { tier?: string }).tier || '1',
              season: (profile.club.league as { season?: string }).season || '2024/2025'
            }
          }
        };
        return res.status(201).json(response);
      } else {
        // Club exists, create manager profile with existing club
        const profile = await prisma.managerProfile.create({
          data: {
            name,
            club: {
              connect: { id: clubRecord.id }
            },
            reputation: 50 // Default reputation
          },
          include: {
            club: {
              include: {
                league: true
              }
            }
          }
        }) as unknown as ManagerProfileWithRelations;
        
        // Format the response to match our ProfileResponse type
        const response: ProfileResponse = {
          id: profile.id,
          name: profile.name,
          clubId: profile.clubId,
          userId: profile.userId || null,
          reputation: profile.reputation,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          club: {
            id: profile.club.id,
            name: profile.club.name,
            league: {
              id: profile.club.league.id,
              name: profile.club.league.name,
              tier: (profile.club.league as { tier?: string }).tier || '1',
              season: (profile.club.league as { season?: string }).season || '2024/2025'
            }
          }
        };

        return res.status(201).json(response);
      }
    } else {
      return res.status(400).json({ error: 'Either club name or club ID is required' });
    }
  } catch (error) {
    // Pass the error to the error handler middleware
    const appError = createAppError(error);
    appError.translationKey = 'error.failed_to_create_profile';
    next(appError);
  }
});

export default router;
