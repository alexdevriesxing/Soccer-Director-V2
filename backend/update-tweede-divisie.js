const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tweede Divisie clubs data with positions, points, goals, etc.
const tweedeDivisieClubs = [
  {
    name: 'Quick Boys',
    position: 1,
    played: 34,
    won: 25,
    drawn: 4,
    lost: 5,
    points: 79,
    goalsFor: 81,
    goalsAgainst: 33,
    homeCity: 'Katwijk',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Rijnsburgse Boys',
    position: 2,
    played: 34,
    won: 22,
    drawn: 6,
    lost: 6,
    points: 72,
    goalsFor: 80,
    goalsAgainst: 38,
    homeCity: 'Rijnsburg',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'AFC',
    position: 3,
    played: 34,
    won: 20,
    drawn: 5,
    lost: 9,
    points: 65,
    goalsFor: 68,
    goalsAgainst: 40,
    homeCity: 'Amsterdam',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Top half',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Katwijk',
    position: 4,
    played: 34,
    won: 17,
    drawn: 7,
    lost: 10,
    points: 58,
    goalsFor: 58,
    goalsAgainst: 49,
    homeCity: 'Katwijk',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Top half',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Spakenburg',
    position: 5,
    played: 34,
    won: 17,
    drawn: 6,
    lost: 11,
    points: 57,
    goalsFor: 66,
    goalsAgainst: 44,
    homeCity: 'Bunschoten-Spakenburg',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Top half',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Jong Almere City FC',
    position: 6,
    played: 34,
    won: 16,
    drawn: 8,
    lost: 10,
    points: 56,
    goalsFor: 88,
    goalsAgainst: 53,
    homeCity: 'Almere',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Develop players',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null // Will be set after finding Almere City FC
  },
  {
    name: 'GVVV',
    position: 7,
    played: 34,
    won: 16,
    drawn: 5,
    lost: 13,
    points: 53,
    goalsFor: 57,
    goalsAgainst: 57,
    homeCity: 'Veenendaal',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Mid table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Koninklijke HFC',
    position: 8,
    played: 34,
    won: 14,
    drawn: 10,
    lost: 10,
    points: 52,
    goalsFor: 43,
    goalsAgainst: 37,
    homeCity: 'Haarlem',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Mid table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'BVV Barendrecht',
    position: 9,
    played: 34,
    won: 14,
    drawn: 6,
    lost: 14,
    points: 48,
    goalsFor: 55,
    goalsAgainst: 60,
    homeCity: 'Barendrecht',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Mid table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'De Treffers',
    position: 10,
    played: 34,
    won: 13,
    drawn: 9,
    lost: 12,
    points: 48,
    goalsFor: 62,
    goalsAgainst: 69,
    homeCity: 'Groesbeek',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Mid table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'HHC Hardenberg',
    position: 11,
    played: 34,
    won: 14,
    drawn: 5,
    lost: 15,
    points: 47,
    goalsFor: 43,
    goalsAgainst: 50,
    homeCity: 'Hardenberg',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Mid table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'ACV',
    position: 12,
    played: 34,
    won: 12,
    drawn: 7,
    lost: 15,
    points: 43,
    goalsFor: 43,
    goalsAgainst: 53,
    homeCity: 'Assen',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'RKAV Volendam',
    position: 13,
    played: 34,
    won: 12,
    drawn: 5,
    lost: 17,
    points: 41,
    goalsFor: 62,
    goalsAgainst: 74,
    homeCity: 'Volendam',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Excelsior Maassluis',
    position: 14,
    played: 34,
    won: 10,
    drawn: 9,
    lost: 15,
    points: 39,
    goalsFor: 32,
    goalsAgainst: 48,
    homeCity: 'Maassluis',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Noordwijk',
    position: 15,
    played: 34,
    won: 10,
    drawn: 8,
    lost: 16,
    points: 38,
    goalsFor: 64,
    goalsAgainst: 69,
    homeCity: 'Noordwijk',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Jong Sparta Rotterdam',
    position: 16,
    played: 34,
    won: 12,
    drawn: 2,
    lost: 20,
    points: 38,
    goalsFor: 65,
    goalsAgainst: 76,
    homeCity: 'Rotterdam',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Develop players',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: true,
    parentClubId: null // Will be set after finding Sparta Rotterdam
  },
  {
    name: 'SVV Scheveningen',
    position: 17,
    played: 34,
    won: 4,
    drawn: 4,
    lost: 26,
    points: 16,
    goalsFor: 24,
    goalsAgainst: 76,
    homeCity: 'Scheveningen',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'ADO \'20',
    position: 18,
    played: 34,
    won: 3,
    drawn: 4,
    lost: 27,
    points: 13,
    goalsFor: 25,
    goalsAgainst: 90,
    homeCity: 'Heemskerk',
    regionTag: 'ZaterdagWest1',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  }
];

async function updateTweedeDivisie() {
  try {
    console.log('Updating Tweede Divisie clubs...');

    // Get Tweede Divisie league
    const tweedeDivisie = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'Tweede Divisie'
        }
      }
    });

    if (!tweedeDivisie) {
      console.log('Tweede Divisie league not found');
      return;
    }

    console.log(`Found Tweede Divisie league: ${tweedeDivisie.name} (ID: ${tweedeDivisie.id})`);

    // Find parent clubs for Jong teams
    const almereCity = await prisma.club.findFirst({
      where: {
        name: {
          contains: 'Almere City'
        }
      }
    });

    const spartaRotterdam = await prisma.club.findFirst({
      where: {
        name: {
          contains: 'Sparta Rotterdam'
        }
      }
    });

    // Set parent club IDs for Jong teams
    tweedeDivisieClubs.forEach(club => {
      if (club.name === 'Jong Almere City FC' && almereCity) {
        club.parentClubId = almereCity.id;
      } else if (club.name === 'Jong Sparta Rotterdam' && spartaRotterdam) {
        club.parentClubId = spartaRotterdam.id;
      }
    });

    // Get existing clubs in Tweede Divisie
    const existingClubs = await prisma.club.findMany({
      where: {
        leagueId: tweedeDivisie.id
      }
    });

    console.log(`Found ${existingClubs.length} existing clubs in Tweede Divisie`);

    // Update or create clubs
    for (const clubData of tweedeDivisieClubs) {
      // Check if club already exists
      const existingClub = existingClubs.find(club => club.name === clubData.name);
      
      const updateData = {
        homeCity: clubData.homeCity,
        regionTag: clubData.regionTag,
        boardExpectation: clubData.boardExpectation,
        homeKitShirt: clubData.homeKitShirt,
        awayKitShirt: clubData.awayKitShirt,
        isJongTeam: clubData.isJongTeam,
        parentClubId: clubData.parentClubId,
        morale: Math.floor(Math.random() * 30) + 60, // 60-90
        form: `${Math.floor(Math.random() * 20) + 60}` // 60-80 as string
      };

      if (existingClub) {
        // Update existing club
        const updatedClub = await prisma.club.update({
          where: { id: existingClub.id },
          data: updateData
        });
        console.log(`Updated: ${updatedClub.name} (ID: ${updatedClub.id})`);
      } else {
        // Create new club
        const newClub = await prisma.club.create({
          data: {
            name: clubData.name,
            leagueId: tweedeDivisie.id,
            ...updateData
          }
        });
        console.log(`Created: ${newClub.name} (ID: ${newClub.id})`);
      }
      
      if (clubData.isJongTeam && clubData.parentClubId) {
        console.log(`  - Jong team for: ${clubData.parentClubId}`);
      }
    }

    console.log('\\nTweede Divisie update completed successfully!');

    // Verify the update
    const updatedClubs = await prisma.club.findMany({
      where: {
        leagueId: tweedeDivisie.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\nVerification: ${updatedClubs.length} clubs in Tweede Divisie`);
    updatedClubs.forEach(club => {
      console.log(`${club.name} - ${club.homeCity} (${club.regionTag})`);
    });

  } catch (error) {
    console.error('Error updating Tweede Divisie:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTweedeDivisie(); 