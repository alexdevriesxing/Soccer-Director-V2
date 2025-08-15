const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const o21Divisie4BClubs = [
  { name: 'VVV O21', position: 1, played: 12, won: 11, drawn: 0, lost: 1, points: 33, goalsFor: 47, goalsAgainst: 9, goalDifference: 38, homeCity: 'Venlo', regionTag: 'O21', boardExpectation: 'Promotion', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Quick Boys O21', position: 2, played: 11, won: 6, drawn: 1, lost: 4, points: 19, goalsFor: 35, goalsAgainst: 25, goalDifference: 10, homeCity: 'Katwijk', regionTag: 'O21', boardExpectation: 'Promotion', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Hercules O21', position: 3, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 26, goalsAgainst: 25, goalDifference: 1, homeCity: 'Utrecht', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Westlandia O21', position: 4, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 24, goalsAgainst: 28, goalDifference: -4, homeCity: 'Naaldwijk', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Alphense Boys O21', position: 5, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 25, goalsAgainst: 38, goalDifference: -13, homeCity: 'Alphen aan den Rijn', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Excelsior M. O21', position: 6, played: 11, won: 4, drawn: 1, lost: 6, points: 13, goalsFor: 24, goalsAgainst: 33, goalDifference: -9, homeCity: 'Maassluis', regionTag: 'O21', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Alexandria’66 O21', position: 7, played: 12, won: 3, drawn: 4, lost: 5, points: 13, goalsFor: 29, goalsAgainst: 38, goalDifference: -9, homeCity: 'Rotterdam', regionTag: 'O21', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null },
  { name: 'Spartaan’20 O21', position: 8, played: 12, won: 3, drawn: 1, lost: 8, points: 10, goalsFor: 14, goalsAgainst: 28, goalDifference: -14, homeCity: 'Rotterdam', regionTag: 'O21', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4', isJongTeam: true, parentClubId: null }
];

async function addO21Divisie4BClubs() {
  try {
    console.log('Adding O21 Divisie 4B clubs...');
    const o21Divisie4B = await prisma.league.findFirst({ where: { name: 'O21 Divisie 4B' } });
    if (!o21Divisie4B) {
      console.log('O21 Divisie 4B league not found');
      return;
    }
    for (const clubData of o21Divisie4BClubs) {
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: o21Divisie4B.id,
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
    console.log('O21 Divisie 4B clubs added successfully!');
  } catch (error) {
    console.error('Error adding O21 Divisie 4B clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addO21Divisie4BClubs(); 