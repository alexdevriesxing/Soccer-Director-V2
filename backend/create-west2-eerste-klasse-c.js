const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const leagueName = 'West 2 Eerste Klasse C';
const regionTag = 'West 2';
const division = 'Eerste Klasse C';
const season = '2024/2025';

const clubsData = [
  { name: 'De Jodan Boys', position: 1, played: 26, won: 16, drawn: 4, lost: 6, points: 52, goalsFor: 59, goalsAgainst: 28 },
  { name: 'VV SHO', position: 2, played: 26, won: 15, drawn: 6, lost: 5, points: 51, goalsFor: 64, goalsAgainst: 43 },
  { name: 'VOC', position: 3, played: 26, won: 16, drawn: 2, lost: 8, points: 50, goalsFor: 70, goalsAgainst: 53 },
  { name: 'VV Spijkenisse', position: 4, played: 26, won: 13, drawn: 6, lost: 7, points: 45, goalsFor: 48, goalsAgainst: 39 },
  { name: 'VV Nieuw-Lekkerland', position: 5, played: 26, won: 11, drawn: 10, lost: 5, points: 43, goalsFor: 47, goalsAgainst: 38 },
  { name: 'Nieuwenhoorn', position: 6, played: 26, won: 12, drawn: 7, lost: 7, points: 43, goalsFor: 48, goalsAgainst: 43 },
  { name: 'NSVV', position: 7, played: 26, won: 10, drawn: 6, lost: 10, points: 36, goalsFor: 33, goalsAgainst: 35 },
  { name: 'SV Heinenoord', position: 8, played: 26, won: 9, drawn: 7, lost: 10, points: 34, goalsFor: 59, goalsAgainst: 53 },
  { name: 'VV Papendrecht', position: 9, played: 26, won: 10, drawn: 3, lost: 13, points: 33, goalsFor: 47, goalsAgainst: 50 },
  { name: 'Oranje Wit', position: 10, played: 26, won: 9, drawn: 4, lost: 13, points: 31, goalsFor: 39, goalsAgainst: 43 },
  { name: 'RV&AV Sparta', position: 11, played: 26, won: 9, drawn: 3, lost: 14, points: 30, goalsFor: 40, goalsAgainst: 56 },
  { name: 'BVCB', position: 12, played: 26, won: 7, drawn: 7, lost: 12, points: 28, goalsFor: 35, goalsAgainst: 41 },
  { name:  'RKSV Spartaan \'20', position: 13, played: 26, won: 6, drawn: 4, lost: 16, points: 22, goalsFor: 29, goalsAgainst: 57 },
  { name: 'DCV', position: 14, played: 26, won: 3, drawn: 3, lost: 20, points: 12, goalsFor: 26, goalsAgainst: 65 }
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
    console.log('✅ West 2 Eerste Klasse C setup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndCreate(); 