import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// --- CONFIG ---
const FOOTBALL_DATA_API_KEY = 'YOUR_API_KEY_HERE'; // Get from https://www.football-data.org/client/register
const DATA_DIR = path.join(__dirname, '../../data');

// --- DATA SOURCES ---
const DATA_SOURCES = {
  // Football-Data.org API (live/recent data)
  FOOTBALL_DATA_API: {
    baseUrl: 'https://api.football-data.org/v4',
    headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY }
  },
  
  // Sample real club data (you can replace with actual CSV downloads)
  SAMPLE_CLUBS: [
    {
      name: 'Ajax',
      homeCity: 'Amsterdam',
      stadium: 'Johan Cruyff Arena',
      regionTag: 'NLD',
      leagueId: 1,
      founded: 1900,
      colors: { home: 'Red-White', away: 'White-Red' }
    },
    {
      name: 'PSV Eindhoven',
      homeCity: 'Eindhoven',
      stadium: 'Philips Stadion',
      regionTag: 'NLD',
      leagueId: 1,
      founded: 1913,
      colors: { home: 'Red-White', away: 'White-Red' }
    },
    {
      name: 'Feyenoord',
      homeCity: 'Rotterdam',
      stadium: 'De Kuip',
      regionTag: 'NLD',
      leagueId: 1,
      founded: 1908,
      colors: { home: 'Red-White', away: 'White-Red' }
    },
    {
      name: 'AZ Alkmaar',
      homeCity: 'Alkmaar',
      stadium: 'AFAS Stadion',
      regionTag: 'NLD',
      leagueId: 1,
      founded: 1967,
      colors: { home: 'Red-White', away: 'White-Red' }
    },
    {
      name: 'FC Twente',
      homeCity: 'Enschede',
      stadium: 'De Grolsch Veste',
      regionTag: 'NLD',
      leagueId: 1,
      founded: 1965,
      colors: { home: 'Red-White', away: 'White-Red' }
    }
  ],
  
  // Sample real player data
  SAMPLE_PLAYERS: [
    {
      name: 'Steven Bergwijn',
      position: 'FWD',
      age: 26,
      nationality: 'Netherlands',
      skill: 78,
      potential: 82,
      wage: 45000,
      clubName: 'Ajax'
    },
    {
      name: 'Cody Gakpo',
      position: 'FWD',
      age: 25,
      nationality: 'Netherlands',
      skill: 80,
      potential: 85,
      wage: 55000,
      clubName: 'PSV Eindhoven'
    },
    {
      name: 'Orkun Kökçü',
      position: 'MID',
      age: 23,
      nationality: 'Turkey',
      skill: 76,
      potential: 84,
      wage: 40000,
      clubName: 'Feyenoord'
    },
    {
      name: 'Vangelis Pavlidis',
      position: 'FWD',
      age: 25,
      nationality: 'Greece',
      skill: 75,
      potential: 80,
      wage: 35000,
      clubName: 'AZ Alkmaar'
    },
    {
      name: 'Michel Vlap',
      position: 'MID',
      age: 26,
      nationality: 'Netherlands',
      skill: 74,
      potential: 78,
      wage: 30000,
      clubName: 'FC Twente'
    }
  ]
};

// --- UTILITY FUNCTIONS ---

function createLeagueIfNotExists(name: string, country: string, level: number = 1) {
  return prisma.league.upsert({
    where: { id: 1 }, // Use a fixed ID for the first league
    update: {},
    create: {
      id: 1,
      name,
      tier: `Tier ${level}`,
      region: country,
      division: level.toString(),
      season: '2024/25'
    }
  });
}

function createClubWithHistory(clubData: any) {
  return prisma.club.upsert({
    where: { id: clubData.id || 1 }, // Use ID instead of name
    update: {},
    create: {
      id: clubData.id || 1,
      name: clubData.name,
      homeCity: clubData.homeCity,
      stadium: clubData.stadium,
      regionTag: clubData.regionTag,
      leagueId: clubData.leagueId,
      homeKitShirt: clubData.colors?.home || 'Red',
      awayKitShirt: clubData.colors?.away || 'White',
      homeKitShorts: 'White',
      awayKitShorts: 'Red',
      homeKitSocks: 'Red',
      awayKitSocks: 'White',
      morale: 70,
      form: 'WWDLW',
      boardExpectation: 'mid_table',
      regulatoryStatus: 'compliant',
      complianceDeadline: null
    }
  });
}

function createPlayerWithHistory(playerData: any, clubId: number) {
  const contractStart = new Date();
  const contractExpiry = new Date();
  contractExpiry.setFullYear(contractExpiry.getFullYear() + 3);
  
  return prisma.player.upsert({
    where: { id: playerData.id || 1 }, // Use ID instead of name
    update: {},
    create: {
      id: playerData.id || 1,
      name: playerData.name,
      clubId,
      position: playerData.position,
      age: playerData.age,
      nationality: playerData.nationality,
      skill: playerData.skill,
      potential: playerData.potential,
      currentPotential: playerData.potential,
      talent: playerData.skill + 10,
      personality: 'PROFESSIONAL' as any, // Cast to any to avoid enum issues
      wage: playerData.wage,
      contractExpiry,
      contractStart,
      morale: 70,
      injured: false,
      internationalCaps: 0,
      onInternationalDuty: false,
      developmentPath: 'scouted',
      academyLevel: 0,
      improvementRate: 0.02
    }
  });
}

// --- IMPORT FUNCTIONS ---

async function importFromFootballDataAPI() {
  console.log('Importing from Football-Data.org API...');
  
  if (FOOTBALL_DATA_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  Skipping API import - no API key provided');
    return;
  }
  
  try {
    // Import Eredivisie clubs and players
    const leagues = [
      { code: 'DED', name: 'Eredivisie', country: 'Netherlands' },
      { code: 'PL', name: 'Premier League', country: 'England' },
      { code: 'BL1', name: 'Bundesliga', country: 'Germany' }
    ];
    
    for (const league of leagues) {
      console.log(`Importing ${league.name}...`);
      
      // Create league
      const dbLeague = await createLeagueIfNotExists(league.name, league.country);
      
      // Get clubs
      const clubsRes = await axios.get(
        `${DATA_SOURCES.FOOTBALL_DATA_API.baseUrl}/competitions/${league.code}/teams?season=2023`,
        { headers: DATA_SOURCES.FOOTBALL_DATA_API.headers }
      );
      
      for (const club of clubsRes.data.teams) {
        // Create club
        const dbClub = await prisma.club.upsert({
          where: { id: club.id },
          update: {},
          create: {
            id: club.id,
            name: club.name,
            homeCity: club.area?.name || null,
            stadium: club.venue || null,
            regionTag: club.area?.code || null,
            leagueId: dbLeague.id,
            morale: 70,
            form: 'WWDLW',
            boardExpectation: 'mid_table',
            regulatoryStatus: 'compliant'
          }
        });
        
        // Get squad
        try {
          const squadRes = await axios.get(
            `${DATA_SOURCES.FOOTBALL_DATA_API.baseUrl}/teams/${club.id}`,
            { headers: DATA_SOURCES.FOOTBALL_DATA_API.headers }
          );
          
          for (const player of squadRes.data.squad) {
            await prisma.player.upsert({
              where: { id: player.id },
              update: {},
              create: {
                id: player.id,
                name: player.name,
                clubId: dbClub.id,
                position: player.position || 'MID',
                age: player.dateOfBirth ? 
                  new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() : 25,
                nationality: player.nationality || 'Netherlands',
                wage: 0,
                contractExpiry: new Date(),
                contractStart: new Date(),
                skill: 60,
                potential: 70,
                currentPotential: 65,
                talent: 60,
                personality: 'PROFESSIONAL' as any,
                morale: 70,
                injured: false,
                internationalCaps: player.nationalTeam ? 1 : 0,
                onInternationalDuty: false
              }
            });
          }
        } catch (error) {
          console.log(`⚠️  Could not fetch squad for ${club.name}: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ API import failed:', error);
  }
}

async function importFromSampleData() {
  console.log('Importing from sample data...');
  
  try {
    // Create Eredivisie league
    const league = await createLeagueIfNotExists('Eredivisie', 'Netherlands', 1);
    
    // Import clubs
    for (let i = 0; i < DATA_SOURCES.SAMPLE_CLUBS.length; i++) {
      const clubData = DATA_SOURCES.SAMPLE_CLUBS[i];
      const club = await createClubWithHistory({
        ...clubData,
        id: i + 1,
        leagueId: league.id
      });
      
      console.log(`✅ Created club: ${club.name}`);
    }
    
    // Import players
    for (let i = 0; i < DATA_SOURCES.SAMPLE_PLAYERS.length; i++) {
      const playerData = DATA_SOURCES.SAMPLE_PLAYERS[i];
      const club = await prisma.club.findFirst({
        where: { name: playerData.clubName }
      });
      
      if (club) {
        const player = await createPlayerWithHistory({
          ...playerData,
          id: i + 1
        }, club.id);
        console.log(`✅ Created player: ${player.name} (${player.position})`);
      }
    }
  } catch (error) {
    console.error('❌ Sample data import failed:', error);
  }
}

async function importHistoricalMatches() {
  console.log('Importing historical matches...');
  
  try {
    // Sample historical matches (you can replace with real CSV data)
    const historicalMatches = [
      {
        homeClub: 'Ajax',
        awayClub: 'PSV Eindhoven',
        homeGoals: 2,
        awayGoals: 1,
        date: new Date('2024-01-15'),
        competition: 'Eredivisie',
        season: '2023/24'
      },
      {
        homeClub: 'Feyenoord',
        awayClub: 'AZ Alkmaar',
        homeGoals: 3,
        awayGoals: 0,
        date: new Date('2024-01-20'),
        competition: 'Eredivisie',
        season: '2023/24'
      },
      {
        homeClub: 'FC Twente',
        awayClub: 'Ajax',
        homeGoals: 1,
        awayGoals: 2,
        date: new Date('2024-01-25'),
        competition: 'Eredivisie',
        season: '2023/24'
      }
    ];
    
    for (const match of historicalMatches) {
      const homeClub = await prisma.club.findFirst({ where: { name: match.homeClub } });
      const awayClub = await prisma.club.findFirst({ where: { name: match.awayClub } });
      
      if (homeClub && awayClub) {
        await prisma.fixture.create({
          data: {
            homeClubId: homeClub.id,
            awayClubId: awayClub.id,
            homeGoals: match.homeGoals,
            awayGoals: match.awayGoals,
            played: true,
            date: match.date,
            week: 1,
            type: 'league'
          }
        });
        
        console.log(`✅ Created match: ${match.homeClub} ${match.homeGoals}-${match.awayGoals} ${match.awayClub}`);
      }
    }
  } catch (error) {
    console.error('❌ Historical matches import failed:', error);
  }
}

async function importFromCSV(csvPath: string) {
  console.log(`Importing from CSV: ${csvPath}`);
  
  try {
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  CSV file not found: ${csvPath}`);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Parse CSV (assuming standard format: Date,Home,Away,HomeGoals,AwayGoals)
    for (let i = 1; i < lines.length; i++) { // Skip header
      const columns = lines[i].split(',');
      if (columns.length >= 5) {
        const [date, home, away, homeGoals, awayGoals] = columns;
        
        // Find or create clubs
        const homeClub = await prisma.club.upsert({
          where: { id: i * 2 - 1 }, // Generate unique ID
          update: {},
          create: {
            id: i * 2 - 1,
            name: home.trim(),
            homeCity: null,
            stadium: null,
            regionTag: 'NLD',
            leagueId: 1,
            morale: 70,
            form: 'WWDLW',
            boardExpectation: 'mid_table',
            regulatoryStatus: 'compliant'
          }
        });
        
        const awayClub = await prisma.club.upsert({
          where: { id: i * 2 }, // Generate unique ID
          update: {},
          create: {
            id: i * 2,
            name: away.trim(),
            homeCity: null,
            stadium: null,
            regionTag: 'NLD',
            leagueId: 1,
            morale: 70,
            form: 'WWDLW',
            boardExpectation: 'mid_table',
            regulatoryStatus: 'compliant'
          }
        });
        
        // Create fixture
        await prisma.fixture.create({
          data: {
            homeClubId: homeClub.id,
            awayClubId: awayClub.id,
            homeGoals: parseInt(homeGoals) || 0,
            awayGoals: parseInt(awayGoals) || 0,
            played: true,
            date: new Date(date),
            week: 1,
            type: 'league'
          }
        });
      }
    }
    
    console.log(`✅ Imported ${lines.length - 1} matches from CSV`);
  } catch (error) {
    console.error('❌ CSV import failed:', error);
  }
}

// --- MAIN IMPORT FUNCTION ---
async function importRealData() {
  console.log('🚀 Starting real football data import...\n');
  
  try {
    // 1. Import from sample data (always works)
    await importFromSampleData();
    console.log('');
    
    // 2. Import from Football-Data.org API (if API key provided)
    await importFromFootballDataAPI();
    console.log('');
    
    // 3. Import historical matches
    await importHistoricalMatches();
    console.log('');
    
    // 4. Import from CSV files (if they exist)
    const csvFiles = [
      path.join(DATA_DIR, 'eredivisie-2023-24.csv'),
      path.join(DATA_DIR, 'premier-league-2023-24.csv')
    ];
    
    for (const csvFile of csvFiles) {
      if (fs.existsSync(csvFile)) {
        await importFromCSV(csvFile);
      }
    }
    
    console.log('✅ Import complete!');
    console.log('\n📊 Summary:');
    console.log('- Clubs imported');
    console.log('- Players imported');
    console.log('- Historical matches imported');
    console.log('\n💡 Next steps:');
    console.log('1. Get a Football-Data.org API key for live data');
    console.log('2. Download CSV files from football.csv repositories');
    console.log('3. Run this script again to import more data');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// --- RUN ---
importRealData(); 