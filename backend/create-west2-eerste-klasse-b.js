const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const leagueName = 'West 2 Eerste Klasse B';
const regionTag = 'West 2';
const division = 'Eerste Klasse B';
const season = '2024/2025';

const clubsData = [
  { name: 'VUC', position: 1, played: 24, won: 16, drawn: 4, lost: 4, points: 52, goalsFor: 63, goalsAgainst: 28 },
  { name: 'SV ARC', position: 2, played: 24, won: 13, drawn: 5, lost: 6, points: 44, goalsFor: 42, goalsAgainst: 31 },
  { name: 'VELO', position: 3, played: 24, won: 13, drawn: 4, lost: 7, points: 43, goalsFor: 43, goalsAgainst: 32 },
  { name: 'SV RKDEO', position: 4, played: 24, won: 11, drawn: 6, lost: 7, points: 39, goalsFor: 35, goalsAgainst: 33 },
  { name: 'FC Skillz', position: 5, played: 24, won: 11, drawn: 4, lost: 9, points: 37, goalsFor: 32, goalsAgainst: 34 },
  { name: 'SV DSO', position: 6, played: 24, won: 9, drawn: 4, lost: 11, points: 31, goalsFor: 33, goalsAgainst: 35 },
  { name: "Valken '68", position: 7, played: 24, won: 8, drawn: 6, lost: 10, points: 30, goalsFor: 43, goalsAgainst: 39 },
  { name: 'Alphense Boys', position: 8, played: 24, won: 9, drawn: 2, lost: 13, points: 29, goalsFor: 44, goalsAgainst: 47 },
  { name: 'SC Monster', position: 9, played: 24, won: 8, drawn: 5, lost: 11, points: 29, goalsFor: 27, goalsAgainst: 36 },
  { name: 'HVV', position: 10, played: 24, won: 7, drawn: 7, lost: 10, points: 28, goalsFor: 25, goalsAgainst: 28 },
  { name: 'LFC', position: 11, played: 24, won: 6, drawn: 8, lost: 10, points: 26, goalsFor: 30, goalsAgainst: 35 },
  { name: 'SV Wippolder', position: 12, played: 24, won: 7, drawn: 4, lost: 13, points: 25, goalsFor: 29, goalsAgainst: 51 },
  { name: "Voorschoten '97", position: 13, played: 24, won: 6, drawn: 5, lost: 13, points: 23, goalsFor: 27, goalsAgainst: 44 }
];

async function cleanupAndCreate() {
  try {
    // 1. Delete duplicate leagues and clubs
    const leagues = await prisma.league.findMany({
      where: {
        name: leagueName,
        region: regionTag,
        division: division,
        season: season
      }
    });
    for (const league of leagues) {
      // Delete all clubs and related data in this league
      const leagueClubs = await prisma.club.findMany({ where: { leagueId: league.id } });
      for (const club of leagueClubs) {
        await prisma.clubFinances.deleteMany({ where: { clubId: club.id } });
        await prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } });
        await prisma.fixture.deleteMany({ where: { OR: [{ homeClubId: club.id }, { awayClubId: club.id }] } });
        await prisma.club.delete({ where: { id: club.id } });
      }
      await prisma.league.delete({ where: { id: league.id } });
      console.log(`Deleted duplicate league: ${league.name} (ID: ${league.id})`);
    }

    // 2. Create the new league
    const league = await prisma.league.create({
      data: {
        name: leagueName,
        tier: 'AMATEUR',
        region: regionTag,
        division: division,
        season: season
      }
    });
    console.log(`Created league: ${league.name} (ID: ${league.id})`);

    // 3. Add clubs and stats
    for (const clubData of clubsData) {
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          leagueId: league.id,
          regionTag: regionTag
        }
      });
      await prisma.clubFinances.create({
        data: {
          clubId: club.id,
          season: season,
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
      await prisma.clubSeasonStats.create({
        data: {
          clubId: club.id,
          leagueId: league.id,
          season: season,
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
    console.log('✅ West 2 Eerste Klasse B setup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndCreate(); 