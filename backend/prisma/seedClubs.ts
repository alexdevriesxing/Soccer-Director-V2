import { PrismaClient, Prisma, LeagueLevel, CompetitionType } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

// Define types based on Prisma schema
type ClubData = Omit<Prisma.ClubCreateInput, 'competitions'> & {
  level: string;
  reputation: number;
  financialStatus: number;
  primaryColor: string | null;
  secondaryColor: string | null;
  balance: number;
  transferBudget: number;
  wageBudget: number;
  averageAttendance: number | null;
  isUserControlled: boolean;
  isActive: boolean;
  leagueId: number;
};

type CompetitionData = Prisma.CompetitionCreateInput & {
  level: LeagueLevel;
  type: CompetitionType;
  promotionSpots: number;
  relegationSpots: number;
};

type TeamInCompetitionData = Omit<Prisma.TeamInCompetitionCreateInput, 'team' | 'competition'> & {
  team: { connect: { id: number } };
  competition: { connect: { id: number } };
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  season: string;
  isActive: boolean;
};

const prisma = new PrismaClient();

// League configurations
const LEAGUE_CONFIG = {
  EREDIVISIE: { 
    name: 'Eredivisie', 
    teams: 18, 
    reputation: { min: 70, max: 100 },
    type: 'LEAGUE' as const,
    promotionSpots: 0,
    relegationSpots: 3
  },
  KKD: { 
    name: 'Keuken Kampioen Divisie', 
    teams: 20, 
    reputation: { min: 50, max: 75 },
    type: 'LEAGUE' as const,
    promotionSpots: 2,
    relegationSpots: 2
  },
  TWEEDE_DIVISIE: { 
    name: 'Tweede Divisie', 
    teams: 18, 
    reputation: { min: 35, max: 55 },
    type: 'LEAGUE' as const,
    promotionSpots: 1,
    relegationSpots: 2
  },
  DERDE_DIVISIE: { 
    name: 'Derde Divisie', 
    teams: 36, 
    reputation: { min: 25, max: 45 },
    type: 'LEAGUE' as const,
    promotionSpots: 1,
    relegationSpots: 2
  },
  ZA_1: { 
    name: 'Zaterdag Hoofdklasse', 
    teams: 100, 
    reputation: { min: 15, max: 35 },
    type: 'LEAGUE' as const,
    promotionSpots: 1,
    relegationSpots: 1
  },
  ZO_1: { 
    name: 'Zondag Hoofdklasse', 
    teams: 100, 
    reputation: { min: 15, max: 35 },
    type: 'LEAGUE' as const,
    promotionSpots: 1,
    relegationSpots: 1
  },
  ZA_AMATEURS: { 
    name: 'Zaterdag Amateurs', 
    teams: 200, 
    reputation: { min: 5, max: 25 },
    type: 'LEAGUE' as const,
    promotionSpots: 0,
    relegationSpots: 0
  },
  ZONDAG_AMATEURS: { 
    name: 'Zondag Amateurs', 
    teams: 200, 
    reputation: { min: 5, max: 25 },
    type: 'LEAGUE' as const,
    promotionSpots: 0,
    relegationSpots: 0
  }
} as const;

// Helper function to parse club data from markdown
function parseClubData(filePath: string): ClubData[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const clubs: ClubData[] = [];
    
    // This is a simplified parser - adjust based on your markdown structure
    const clubSections = content.split('## ').slice(1);
    
    for (const section of clubSections) {
      try {
        const lines = section.split('\n').filter(line => line.trim());
        if (lines.length === 0) continue;
        
        const clubName = lines[0].trim();
        if (!clubName) continue;
        
        const clubData: Record<string, string> = {};
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('- **') && line.includes(':')) {
            const [key, ...valueParts] = line.replace(/^[-*\s]+/, '').split(':');
            const value = valueParts.join(':').trim();
            if (key) {
              clubData[key.trim().toLowerCase()] = value;
            }
          }
        }
        
        // Map the parsed data to ClubData
        const club: ClubData = {
          name: clubName,
          shortName: clubData['short name'] || 
                     clubName.split(' ').map(w => w[0]).join('').toUpperCase(),
          founded: clubData.founded ? parseInt(clubData.founded, 10) : null,
          city: clubData.city || null,
          stadium: clubData.stadium || null,
          capacity: clubData.capacity ? parseInt(clubData.capacity.replace(/,/g, ''), 10) : 0,
          primaryColor: clubData.colors ? clubData.colors.split('/')[0].trim() : null,
          secondaryColor: clubData.colors && clubData.colors.includes('/') 
            ? clubData.colors.split('/')[1].trim() 
            : null,
          level: 'ZONDAG_AMATEURS', // Default level
          leagueId: 1, // Will be updated based on competition assignment
          reputation: 50, // Default reputation
          financialStatus: 50, // Default financial status
          balance: 1000000, // Default balance
          transferBudget: 100000, // Default transfer budget
          wageBudget: 50000, // Default wage budget
          averageAttendance: null, // Will be calculated based on capacity
          isUserControlled: false, // Default to false
          isActive: true, // Default to active
        };
        
        clubs.push(club);
      } catch (error) {
        console.error(`Error parsing club section: ${error}`);
        continue;
      }
    }
    
    return clubs;
  } catch (error) {
    console.error(`Error reading club data file: ${error}`);
    return [];
  }
}

async function main() {
  try {
    // 1. Parse club data from markdown file
    console.log('Parsing club data...');
    const clubsData = parseClubData(path.join(__dirname, 'clubdata.md'));
    
    if (clubsData.length === 0) {
      throw new Error('No club data found in the markdown file');
    }
    
    console.log(`Parsed ${clubsData.length} clubs`);
    
    // 2. Create competitions
    const competitions: CompetitionData[] = Object.entries(LEAGUE_CONFIG).map(([level, config]) => ({
      name: config.name,
      level: level as LeagueLevel,
      type: config.type,
      country: 'Netherlands',
      season: '2025/2026',
      isActive: true,
      promotionSpots: config.promotionSpots,
      relegationSpots: config.relegationSpots,
      leagueId: 1 // Temporary, will be updated after league creation
    }));
    
    // 3. Create competitions in database
    console.log('Creating competitions...');
    const createdCompetitions = [];
    
    // First create all competitions without dependencies
    for (const comp of competitions) {
      const competition = await prisma.competition.upsert({
        where: { name: comp.name },
        update: { ...comp },
        create: { ...comp }
      });
      createdCompetitions.push(competition);
    }
    
    console.log(`Created/updated ${createdCompetitions.length} competitions`);
    
    // 4. Create clubs in database
    console.log('Creating clubs...');
    const createdClubs = [];
    
    for (const clubData of clubsData) {
      const { level, leagueId, ...clubProps } = clubData;
      
      const club = await prisma.club.upsert({
        where: { name: clubData.name },
        update: clubProps,
        create: clubProps
      });
      
      createdClubs.push(club);
    }
    
    console.log(`Created/updated ${createdClubs.length} clubs`);
    
    // 5. Assign clubs to competitions based on reputation
    console.log('Assigning clubs to competitions...');
    const teamAssignments: TeamInCompetitionData[] = [];
    
    for (const club of createdClubs) {
      // Find appropriate competition based on reputation
      const clubReputation = club.reputation || 0;
      let assignedLevel: LeagueLevel = 'ZONDAG_AMATEURS'; // Default to lowest level
      
      for (const [level, config] of Object.entries(LEAGUE_CONFIG)) {
        if (clubReputation >= config.reputation.min) {
          assignedLevel = level as LeagueLevel;
          break;
        }
      }
      
      const competition = createdCompetitions.find(c => c.level === assignedLevel);
      if (!competition) continue;
      
      teamAssignments.push({
        team: { connect: { id: club.id } },
        competition: { connect: { id: competition.id } },
        season: '2025/2026',
        isActive: true,
        position: 0, // Will be updated later
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      });
    }
    
    // 6. Create team assignments in database
    console.log('Creating team assignments...');
    const createdAssignments = [];
    
    for (const assignment of teamAssignments) {
      const assignmentData = {
        ...assignment,
        team: assignment.team,
        competition: assignment.competition
      };
      
      const created = await prisma.teamInCompetition.create({
        data: assignmentData
      });
      
      createdAssignments.push(created);
    }
    
    console.log(`Created ${createdAssignments.length} team assignments`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Fatal error during seeding:', e);
      process.exit(1);
    });
}

export { main };
