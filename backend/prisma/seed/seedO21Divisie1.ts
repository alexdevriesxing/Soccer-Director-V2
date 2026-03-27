import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 1 clubs data
const o21Divisie1Clubs = [
  { name: 'SC Cambuur Onder 21', city: 'Leeuwarden' },
  { name: 'FC Twente/Heracles Onder 21', city: 'Enschede' },
  { name: 'PEC Zwolle Onder 21', city: 'Zwolle' },
  { name: 'Go Ahead Eagles Onder 21', city: 'Deventer' },
  { name: 'Feyenoord Onder 21', city: 'Rotterdam' },
  { name: 'FC Groningen Onder 21', city: 'Groningen' },
  { name: 'Willem II Onder 21', city: 'Tilburg' },
  { name: 'De Graafschap Onder 21', city: 'Doetinchem' }
];

export async function seedO21Divisie1(prisma: PrismaClient) {
  // Get or Create O21 Divisie 1 league
  let o21Divisie1 = await prisma.league.findFirst({
    where: {
      name: 'O21 Divisie 1'
    }
  });

  if (!o21Divisie1) {
    o21Divisie1 = await prisma.league.create({
      data: {
        name: 'O21 Divisie 1',
        tier: 6,
        level: 'O21 Divisie 1',
      }
    });
  }

  // Add all clubs
  for (const clubData of o21Divisie1Clubs) {
    const club = await prisma.club.create({
      data: {
        name: clubData.name,
        leagueId: o21Divisie1.id,
        city: clubData.city,
        boardExpectation: 'Mid-table',
        primaryColor: '#5f27cd',
        secondaryColor: '#00d2d3',
        isJongTeam: true,
        parentClubId: null,
        morale: 75,
        form: ''
      }
    });
    await generatePlayersForClub(prisma, club.id, { o21: true });
    console.log(`Added: ${clubData.name}`);
  }

  console.log('All O21 Divisie 1 clubs added successfully!');
}