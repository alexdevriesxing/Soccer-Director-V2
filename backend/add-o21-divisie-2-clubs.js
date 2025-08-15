const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// O21 Divisie 2 clubs data with positions, points, goals, etc.
const o21Divisie2Clubs = [
  {
    name: 'Willem II O21',
    position: 1,
    played: 12,
    won: 9,
    drawn: 1,
    lost: 2,
    points: 28,
    goalsFor: 34,
    goalsAgainst: 12,
    goalDifference: 22,
    homeCity: 'Tilburg',
    regionTag: 'O21',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'De Graafschap O21',
    position: 2,
    played: 12,
    won: 8,
    drawn: 1,
    lost: 3,
    points: 25,
    goalsFor: 25,
    goalsAgainst: 17,
    goalDifference: 8,
    homeCity: 'Doetinchem',
    regionTag: 'O21',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'FC Volendam O21',
    position: 3,
    played: 12,
    won: 8,
    drawn: 0,
    lost: 4,
    points: 24,
    goalsFor: 27,
    goalsAgainst: 21,
    goalDifference: 6,
    homeCity: 'Volendam',
    regionTag: 'O21',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'Heerenveen O21',
    position: 4,
    played: 12,
    won: 6,
    drawn: 3,
    lost: 3,
    points: 21,
    goalsFor: 23,
    goalsAgainst: 17,
    goalDifference: 6,
    homeCity: 'Heerenveen',
    regionTag: 'O21',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'N.E.C. O21',
    position: 5,
    played: 12,
    won: 5,
    drawn: 2,
    lost: 5,
    points: 17,
    goalsFor: 27,
    goalsAgainst: 25,
    goalDifference: 2,
    homeCity: 'Nijmegen',
    regionTag: 'O21',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'NAC O21',
    position: 6,
    played: 12,
    won: 3,
    drawn: 1,
    lost: 8,
    points: 10,
    goalsFor: 19,
    goalsAgainst: 29,
    goalDifference: -10,
    homeCity: 'Breda',
    regionTag: 'O21',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'Excelsior R. O21',
    position: 7,
    played: 12,
    won: 1,
    drawn: 4,
    lost: 7,
    points: 7,
    goalsFor: 17,
    goalsAgainst: 30,
    goalDifference: -13,
    homeCity: 'Rotterdam',
    regionTag: 'O21',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'FC Emmen O21',
    position: 8,
    played: 12,
    won: 2,
    drawn: 0,
    lost: 10,
    points: 6,
    goalsFor: 13,
    goalsAgainst: 34,
    goalDifference: -21,
    homeCity: 'Emmen',
    regionTag: 'O21',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  }
];

async function addO21Divisie2Clubs() {
  try {
    console.log('Adding O21 Divisie 2 clubs...');

    // Get O21 Divisie 2 league
    const o21Divisie2 = await prisma.league.findFirst({
      where: {
        name: 'O21 Divisie 2'
      }
    });

    if (!o21Divisie2) {
      console.log('O21 Divisie 2 league not found');
      return;
    }

    console.log(`Found O21 Divisie 2 league: ${o21Divisie2.name} (ID: ${o21Divisie2.id})`);

    // Add each club
    for (const clubData of o21Divisie2Clubs) {
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: o21Divisie2.id,
          homeCity: clubData.homeCity,
          regionTag: clubData.regionTag,
          boardExpectation: clubData.boardExpectation,
          homeKitShirt: clubData.homeKitShirt,
          awayKitShirt: clubData.awayKitShirt,
          isJongTeam: clubData.isJongTeam,
          parentClubId: clubData.parentClubId
        }
      });

      console.log(`Added ${club.name} (Position: ${clubData.position}, Points: ${clubData.points})`);
    }

    console.log('\nO21 Divisie 2 clubs added successfully!');
    console.log(`Total clubs in O21 Divisie 2: ${o21Divisie2Clubs.length}`);

  } catch (error) {
    console.error('Error adding O21 Divisie 2 clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addO21Divisie2Clubs(); 