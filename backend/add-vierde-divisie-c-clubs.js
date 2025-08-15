const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Vierde Divisie C clubs data with positions, points, goals, etc.
const vierdeDivisieCClubs = [
  {
    name: 'UDI \'19',
    position: 1,
    played: 30,
    won: 21,
    drawn: 5,
    lost: 4,
    points: 68,
    goalsFor: 66,
    goalsAgainst: 33,
    homeCity: 'Uden',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RKSV Groene Ster',
    position: 2,
    played: 30,
    won: 20,
    drawn: 7,
    lost: 3,
    points: 67,
    goalsFor: 69,
    goalsAgainst: 24,
    homeCity: 'Roosendaal',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RBC',
    position: 3,
    played: 30,
    won: 15,
    drawn: 10,
    lost: 5,
    points: 55,
    goalsFor: 66,
    goalsAgainst: 32,
    homeCity: 'Roosendaal',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'SV Orion',
    position: 4,
    played: 30,
    won: 13,
    drawn: 6,
    lost: 11,
    points: 45,
    goalsFor: 39,
    goalsAgainst: 44,
    homeCity: 'Wijchen',
    regionTag: 'ZondagOost',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RKSV Wittenhorst',
    position: 5,
    played: 30,
    won: 13,
    drawn: 3,
    lost: 14,
    points: 42,
    goalsFor: 57,
    goalsAgainst: 48,
    homeCity: 'Horst',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'SV AWC',
    position: 6,
    played: 30,
    won: 11,
    drawn: 9,
    lost: 10,
    points: 42,
    goalsFor: 48,
    goalsAgainst: 44,
    homeCity: 'Waalwijk',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Baronie',
    position: 7,
    played: 30,
    won: 11,
    drawn: 8,
    lost: 11,
    points: 41,
    goalsFor: 36,
    goalsAgainst: 40,
    homeCity: 'Breda',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'SV Juliana \'31',
    position: 8,
    played: 30,
    won: 10,
    drawn: 10,
    lost: 10,
    points: 40,
    goalsFor: 40,
    goalsAgainst: 32,
    homeCity: 'Malden',
    regionTag: 'ZondagOost',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'MASV',
    position: 9,
    played: 30,
    won: 10,
    drawn: 8,
    lost: 12,
    points: 38,
    goalsFor: 40,
    goalsAgainst: 54,
    homeCity: 'Maastricht',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Dongen',
    position: 10,
    played: 30,
    won: 11,
    drawn: 4,
    lost: 15,
    points: 37,
    goalsFor: 45,
    goalsAgainst: 50,
    homeCity: 'Dongen',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'SV Valkenswaard',
    position: 11,
    played: 30,
    won: 9,
    drawn: 7,
    lost: 14,
    points: 34,
    goalsFor: 42,
    goalsAgainst: 60,
    homeCity: 'Valkenswaard',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'SV Venray',
    position: 12,
    played: 30,
    won: 9,
    drawn: 6,
    lost: 15,
    points: 33,
    goalsFor: 43,
    goalsAgainst: 53,
    homeCity: 'Venray',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RKSV Mierlo-Hout',
    position: 13,
    played: 30,
    won: 10,
    drawn: 3,
    lost: 17,
    points: 33,
    goalsFor: 52,
    goalsAgainst: 72,
    homeCity: 'Mierlo',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'EVV',
    position: 14,
    played: 30,
    won: 8,
    drawn: 7,
    lost: 15,
    points: 31,
    goalsFor: 38,
    goalsAgainst: 50,
    homeCity: 'Echt',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RKSV Nuenen',
    position: 15,
    played: 30,
    won: 8,
    drawn: 7,
    lost: 15,
    points: 31,
    goalsFor: 45,
    goalsAgainst: 64,
    homeCity: 'Nuenen',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RKVV Best Vooruit',
    position: 16,
    played: 30,
    won: 9,
    drawn: 4,
    lost: 17,
    points: 31,
    goalsFor: 35,
    goalsAgainst: 61,
    homeCity: 'Best',
    regionTag: 'ZondagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  }
];

async function addVierdeDivisieCClubs() {
  try {
    console.log('Adding Vierde Divisie C clubs...');
    
    // Get Vierde Divisie C league
    const vierdeDivisieC = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie C'
      }
    });

    if (!vierdeDivisieC) {
      console.log('Vierde Divisie C league not found');
      return;
    }

    console.log(`Found Vierde Divisie C league: ${vierdeDivisieC.name} (ID: ${vierdeDivisieC.id})`);

    // Add each club to the league
    for (const clubData of vierdeDivisieCClubs) {
      try {
        const club = await prisma.club.create({
          data: {
            name: clubData.name,
            leagueId: vierdeDivisieC.id,
            homeCity: clubData.homeCity,
            boardExpectation: clubData.boardExpectation,
            regionTag: clubData.regionTag,
            homeKitShirt: clubData.homeKitShirt,
            awayKitShirt: clubData.awayKitShirt,
            isJongTeam: clubData.isJongTeam,
            parentClubId: clubData.parentClubId
          }
        });
        console.log(`✅ Added: ${club.name}`);
      } catch (err) {
        console.log(`❌ Failed to add ${clubData.name}: ${err.message}`);
      }
    }

    // Verify final state
    const updatedLeague = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie C'
      },
      include: {
        clubs: {
          orderBy: { name: 'asc' }
        }
      }
    });

    console.log(`\n✅ Final state: ${updatedLeague.clubs.length} clubs in Vierde Divisie C`);
    updatedLeague.clubs.forEach(club => {
      console.log(`- ${club.name}`);
    });

    console.log('\n🎉 Vierde Divisie C clubs added successfully!');

  } catch (error) {
    console.error('Error adding clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addVierdeDivisieCClubs(); 