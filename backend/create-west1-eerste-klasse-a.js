const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createWest1EersteKlasseA() {
  try {
    console.log('Creating West 1 Eerste Klasse A...\n');

    // Create the league
    const league = await prisma.league.create({
      data: {
        name: 'West 1 Eerste Klasse A',
        tier: 'AMATEUR',
        region: 'West 1',
        division: 'Eerste Klasse A',
        season: '2024/2025'
      }
    });

    console.log(`Created league: ${league.name} (ID: ${league.id})\n`);

    // Club data with stats
    const clubsData = [
      { name: 'SV Hoofddorp', position: 1, played: 26, won: 18, drawn: 2, lost: 6, points: 56, goalsFor: 65, goalsAgainst: 36 },
      { name: 'FC Aalsmeer', position: 2, played: 26, won: 15, drawn: 7, lost: 4, points: 52, goalsFor: 65, goalsAgainst: 43 },
      { name: 'RKVV Velsen', position: 3, played: 26, won: 13, drawn: 5, lost: 8, points: 44, goalsFor: 55, goalsAgainst: 41 },
      { name: 'VIOS W', position: 4, played: 26, won: 13, drawn: 3, lost: 10, points: 42, goalsFor: 39, goalsAgainst: 43 },
      { name: 'CSV BOL', position: 5, played: 26, won: 11, drawn: 8, lost: 7, points: 41, goalsFor: 42, goalsAgainst: 40 },
      { name: 'Sporting Martinus', position: 6, played: 26, won: 11, drawn: 7, lost: 8, points: 40, goalsFor: 60, goalsAgainst: 41 },
      { name: 'Vitesse \'22', position: 7, played: 26, won: 10, drawn: 4, lost: 12, points: 34, goalsFor: 41, goalsAgainst: 38 },
      { name: 'VV ZOB', position: 8, played: 26, won: 8, drawn: 9, lost: 9, points: 33, goalsFor: 45, goalsAgainst: 50 },
      { name: 'SV Hillegom', position: 9, played: 26, won: 9, drawn: 5, lost: 12, points: 32, goalsFor: 49, goalsAgainst: 49 },
      { name: 'HBOK', position: 10, played: 26, won: 9, drawn: 4, lost: 13, points: 31, goalsFor: 47, goalsAgainst: 51 },
      { name: 'VV HSV', position: 11, played: 26, won: 8, drawn: 5, lost: 13, points: 29, goalsFor: 40, goalsAgainst: 60 },
      { name: 'VV De Zouaven', position: 12, played: 26, won: 8, drawn: 4, lost: 14, points: 28, goalsFor: 33, goalsAgainst: 57 },
      { name: 'ZSGOWMS', position: 13, played: 26, won: 7, drawn: 4, lost: 15, points: 25, goalsFor: 44, goalsAgainst: 59 },
      { name: 'VV AGB', position: 14, played: 26, won: 6, drawn: 5, lost: 15, points: 23, goalsFor: 48, goalsAgainst: 65 }
    ];

    console.log('Creating clubs and their stats...\n');

    for (const clubData of clubsData) {
      // Create the club
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: league.id,
          regionTag: 'West 1'
        }
      });

      // Create club finances
      await prisma.clubFinances.create({
        data: {
          clubId: club.id,
          season: '2024/2025',
          week: 1,
          balance: 50000,
          transferBudget: 10000,
          wageBudget: 15000,
          gateReceiptsTotal: 5000,
          sponsorshipTotal: 8000,
          tvRightsTotal: 2000,
          prizeMoneyTotal: 0,
          transferIncome: 0,
          playerWagesTotal: 12000,
          staffWagesTotal: 3000,
          transferExpenses: 0,
          facilityCosts: 2000,
          maintenanceCosts: 1000,
          debtTotal: 0,
          equityValue: 0,
          marketValue: 0
        }
      });

      // Create club season stats
      await prisma.clubSeasonStats.create({
        data: {
          clubId: club.id,
          leagueId: league.id,
          season: '2024/2025',
          position: clubData.position,
          played: clubData.played,
          won: clubData.won,
          drawn: clubData.drawn,
          lost: clubData.lost,
          points: clubData.points,
          goalsFor: clubData.goalsFor,
          goalsAgainst: clubData.goalsAgainst,
          goalDifference: clubData.goalsFor - clubData.goalsAgainst
        }
      });

      console.log(`Created club: ${club.name} (Position: ${clubData.position}, Points: ${clubData.points})`);
    }

    console.log(`\n✅ Successfully created West 1 Eerste Klasse A with ${clubsData.length} clubs!`);
    console.log(`League ID: ${league.id}`);

  } catch (error) {
    console.error('Error creating West 1 Eerste Klasse A:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWest1EersteKlasseA(); 