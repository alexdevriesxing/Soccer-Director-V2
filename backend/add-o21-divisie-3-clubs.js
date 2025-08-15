const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// O21 Divisie 3 clubs data
const o21Divisie3Clubs = [
  {
    name: 'Fortuna Sittard O21',
    position: 1,
    played: 12,
    won: 8,
    drawn: 3,
    lost: 1,
    points: 27,
    goalsFor: 29,
    goalsAgainst: 10,
    goalDifference: 19,
    homeCity: 'Sittard',
    regionTag: 'O21',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'Ijsselmeervogels O21',
    position: 2,
    played: 12,
    won: 6,
    drawn: 3,
    lost: 3,
    points: 21,
    goalsFor: 27,
    goalsAgainst: 25,
    goalDifference: 2,
    homeCity: 'Spakenburg',
    regionTag: 'O21',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'FC Dordrecht O21',
    position: 3,
    played: 12,
    won: 4,
    drawn: 4,
    lost: 4,
    points: 16,
    goalsFor: 23,
    goalsAgainst: 21,
    goalDifference: 2,
    homeCity: 'Dordrecht',
    regionTag: 'O21',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'Telstar O21',
    position: 4,
    played: 12,
    won: 4,
    drawn: 4,
    lost: 4,
    points: 16,
    goalsFor: 21,
    goalsAgainst: 25,
    goalDifference: -4,
    homeCity: 'Velsen',
    regionTag: 'O21',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'FC Eindhoven O21',
    position: 5,
    played: 12,
    won: 4,
    drawn: 3,
    lost: 5,
    points: 15,
    goalsFor: 19,
    goalsAgainst: 22,
    goalDifference: -3,
    homeCity: 'Eindhoven',
    regionTag: 'O21',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'MVV O21',
    position: 6,
    played: 12,
    won: 3,
    drawn: 3,
    lost: 6,
    points: 12,
    goalsFor: 19,
    goalsAgainst: 23,
    goalDifference: -4,
    homeCity: 'Maastricht',
    regionTag: 'O21',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'Roda JC O21',
    position: 7,
    played: 12,
    won: 3,
    drawn: 3,
    lost: 6,
    points: 12,
    goalsFor: 20,
    goalsAgainst: 30,
    goalDifference: -10,
    homeCity: 'Kerkrade',
    regionTag: 'O21',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  },
  {
    name: 'FC Den Bosch O21',
    position: 8,
    played: 12,
    won: 2,
    drawn: 5,
    lost: 5,
    points: 11,
    goalsFor: 22,
    goalsAgainst: 24,
    goalDifference: -2,
    homeCity: 'Den Bosch',
    regionTag: 'O21',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null
  }
];

async function addO21Divisie3Clubs() {
  try {
    console.log('Adding O21 Divisie 3 clubs...');

    // Get O21 Divisie 3 league
    const o21Divisie3 = await prisma.league.findFirst({
      where: {
        name: 'O21 Divisie 3'
      }
    });

    if (!o21Divisie3) {
      console.log('O21 Divisie 3 league not found');
      return;
    }

    console.log(`Found O21 Divisie 3 league: ${o21Divisie3.name} (ID: ${o21Divisie3.id})`);

    // Add each club
    for (const clubData of o21Divisie3Clubs) {
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: o21Divisie3.id,
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

    console.log('\nO21 Divisie 3 clubs added successfully!');
    console.log(`Total clubs in O21 Divisie 3: ${o21Divisie3Clubs.length}`);

  } catch (error) {
    console.error('Error adding O21 Divisie 3 clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addO21Divisie3Clubs(); 