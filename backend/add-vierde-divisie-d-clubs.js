const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Vierde Divisie D clubs data with positions, points, goals, etc.
const vierdeDivisieDClubs = [
  {
    name: 'VV Hoogeveen',
    position: 1,
    played: 30,
    won: 21,
    drawn: 6,
    lost: 3,
    points: 69,
    goalsFor: 78,
    goalsAgainst: 35,
    homeCity: 'Hoogeveen',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Staphorst',
    position: 2,
    played: 30,
    won: 21,
    drawn: 5,
    lost: 4,
    points: 68,
    goalsFor: 81,
    goalsAgainst: 31,
    homeCity: 'Staphorst',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Flevo Boys',
    position: 3,
    played: 30,
    won: 17,
    drawn: 4,
    lost: 9,
    points: 55,
    goalsFor: 67,
    goalsAgainst: 50,
    homeCity: 'Emmeloord',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#5f27cd',
    awayKitShirt: '#00d2d3',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Quick \'20',
    position: 4,
    played: 30,
    won: 14,
    drawn: 8,
    lost: 8,
    points: 50,
    goalsFor: 59,
    goalsAgainst: 39,
    homeCity: 'Oldenzaal',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Heino',
    position: 5,
    played: 30,
    won: 13,
    drawn: 7,
    lost: 10,
    points: 46,
    goalsFor: 55,
    goalsAgainst: 52,
    homeCity: 'Heino',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'ONS Sneek',
    position: 6,
    played: 30,
    won: 14,
    drawn: 4,
    lost: 12,
    points: 46,
    goalsFor: 66,
    goalsAgainst: 66,
    homeCity: 'Sneek',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'd\'Olde Veste \'54',
    position: 7,
    played: 30,
    won: 13,
    drawn: 6,
    lost: 11,
    points: 45,
    goalsFor: 67,
    goalsAgainst: 56,
    homeCity: 'Steenwijk',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#5f27cd',
    awayKitShirt: '#00d2d3',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'DETO',
    position: 8,
    played: 30,
    won: 12,
    drawn: 7,
    lost: 11,
    points: 43,
    goalsFor: 54,
    goalsAgainst: 43,
    homeCity: 'Drachten',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'TVC \'28',
    position: 9,
    played: 30,
    won: 12,
    drawn: 6,
    lost: 12,
    points: 42,
    goalsFor: 58,
    goalsAgainst: 74,
    homeCity: 'Tubbergen',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'AZSV',
    position: 10,
    played: 30,
    won: 11,
    drawn: 6,
    lost: 13,
    points: 39,
    goalsFor: 48,
    goalsAgainst: 53,
    homeCity: 'Assen',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'HZVV',
    position: 11,
    played: 30,
    won: 11,
    drawn: 6,
    lost: 13,
    points: 39,
    goalsFor: 55,
    goalsAgainst: 62,
    homeCity: 'Hoogeveen',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'DZC \'68',
    position: 12,
    played: 30,
    won: 11,
    drawn: 4,
    lost: 15,
    points: 37,
    goalsFor: 45,
    goalsAgainst: 49,
    homeCity: 'Drachten',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#5f27cd',
    awayKitShirt: '#00d2d3',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Berkum',
    position: 13,
    played: 30,
    won: 9,
    drawn: 7,
    lost: 14,
    points: 34,
    goalsFor: 41,
    goalsAgainst: 58,
    homeCity: 'Zwolle',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'WHC',
    position: 14,
    played: 30,
    won: 7,
    drawn: 5,
    lost: 18,
    points: 26,
    goalsFor: 34,
    goalsAgainst: 58,
    homeCity: 'Wezep',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'CSV Apeldoorn',
    position: 15,
    played: 30,
    won: 4,
    drawn: 8,
    lost: 18,
    points: 20,
    goalsFor: 43,
    goalsAgainst: 78,
    homeCity: 'Apeldoorn',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#5f27cd',
    awayKitShirt: '#00d2d3',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'KHC',
    position: 16,
    played: 30,
    won: 3,
    drawn: 5,
    lost: 22,
    points: 14,
    goalsFor: 32,
    goalsAgainst: 79,
    homeCity: 'Kampen',
    regionTag: 'Zondag Noord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  }
];

async function addVierdeDivisieDClubs() {
  try {
    console.log('Adding Vierde Divisie D clubs...');

    // Get Vierde Divisie D league
    const vierdeDivisieD = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie D'
      }
    });

    if (!vierdeDivisieD) {
      console.log('Vierde Divisie D league not found');
      return;
    }

    console.log(`Found Vierde Divisie D league: ${vierdeDivisieD.name} (ID: ${vierdeDivisieD.id})`);

    // Add all clubs
    for (const clubData of vierdeDivisieDClubs) {
      await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: vierdeDivisieD.id,
          homeCity: clubData.homeCity,
          regionTag: clubData.regionTag,
          boardExpectation: clubData.boardExpectation,
          homeKitShirt: clubData.homeKitShirt,
          awayKitShirt: clubData.awayKitShirt,
          isJongTeam: clubData.isJongTeam,
          parentClubId: clubData.parentClubId,
          morale: Math.floor(Math.random() * 30) + 60, // 60-90
          form: `${Math.floor(Math.random() * 20) + 60}` // 60-80 as string
        }
      });
      console.log(`Added: ${clubData.name} (Position ${clubData.position}, ${clubData.points} points)`);
    }

    console.log('All Vierde Divisie D clubs added successfully!');

  } catch (error) {
    console.error('Error adding clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addVierdeDivisieDClubs(); 