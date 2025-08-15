import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 1 clubs data
const o21Divisie1Clubs = [
  { name: 'SC Cambuur Onder 21', homeCity: 'Leeuwarden' },
  { name: 'FC Twente/Heracles Onder 21', homeCity: 'Enschede' },
  { name: 'PEC Zwolle Onder 21', homeCity: 'Zwolle' },
  { name: 'Go Ahead Eagles Onder 21', homeCity: 'Deventer' },
  { name: 'Feyenoord Onder 21', homeCity: 'Rotterdam' },
  { name: 'FC Groningen Onder 21', homeCity: 'Groningen' },
  { name: 'Willem II Onder 21', homeCity: 'Tilburg' },
  { name: 'De Graafschap Onder 21', homeCity: 'Doetinchem' }
];

export async function seedO21Divisie1(prisma: PrismaClient) {
  // Get O21 Divisie 1 league
  const o21Divisie1 = await prisma.league.findFirst({
    where: {
      name: 'O21 Divisie 1'
    }
  });

  if (!o21Divisie1) {
    console.log('O21 Divisie 1 league not found');
    return;
  }

  // Add all clubs
  for (const clubData of o21Divisie1Clubs) {
    const club = await prisma.club.create({
      data: {
        name: clubData.name,
        leagueId: o21Divisie1.id,
        homeCity: clubData.homeCity,
        regionTag: 'O21',
        boardExpectation: 'Mid-table',
        homeKitShirt: '#5f27cd',
        awayKitShirt: '#00d2d3',
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