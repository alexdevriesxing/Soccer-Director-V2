const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const o21Divisie4AClubs = [
  { name: 'AFC O21', position: 1, played: 12, won: 10, drawn: 1, lost: 1, points: 31, goalsFor: 44, goalsAgainst: 14, goalDifference: 30, homeCity: 'Amsterdam', regionTag: 'O21', boardExpectation: 'Promotion', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'HHC Hardenberg O21', position: 2, played: 12, won: 7, drawn: 0, lost: 5, points: 21, goalsFor: 30, goalsAgainst: 21, goalDifference: 9, homeCity: 'Hardenberg', regionTag: 'O21', boardExpectation: 'Promotion', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Zeeburgia O21', position: 3, played: 12, won: 5, drawn: 4, lost: 3, points: 19, goalsFor: 24, goalsAgainst: 24, goalDifference: 0, homeCity: 'Amsterdam', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'AFC’34 O21', position: 4, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 22, goalsAgainst: 28, goalDifference: -6, homeCity: 'Alkmaar', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Hollandia O21', position: 5, played: 12, won: 4, drawn: 3, lost: 5, points: 15, goalsFor: 28, goalsAgainst: 28, goalDifference: 0, homeCity: 'Hoorn', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Kon. HFC O21', position: 6, played: 12, won: 4, drawn: 2, lost: 6, points: 14, goalsFor: 29, goalsAgainst: 34, goalDifference: -5, homeCity: 'Haarlem', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'DEM O21', position: 7, played: 12, won: 4, drawn: 1, lost: 7, points: 13, goalsFor: 24, goalsAgainst: 29, goalDifference: -5, homeCity: 'Beverwijk', regionTag: 'O21', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'De Dijk O21', position: 8, played: 12, won: 3, drawn: 0, lost: 9, points: 9, goalsFor: 18, goalsAgainst: 41, goalDifference: -23, homeCity: 'Amsterdam', regionTag: 'O21', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null }
];

async function addO21Divisie4AClubs() {
  try {
    console.log('Adding O21 Divisie 4A clubs...');
    const o21Divisie4A = await prisma.league.findFirst({ where: { name: 'O21 Divisie 4A' } });
    if (!o21Divisie4A) {
      console.log('O21 Divisie 4A league not found');
      return;
    }
    for (const clubData of o21Divisie4AClubs) {
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: o21Divisie4A.id,
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
    console.log('O21 Divisie 4A clubs added successfully!');
  } catch (error) {
    console.error('Error adding O21 Divisie 4A clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addO21Divisie4AClubs(); 