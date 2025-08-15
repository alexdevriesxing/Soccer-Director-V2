const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const divisions = [
  {
    division: 'Tweede Klasse A',
    clubs: [
      { name: "Unicum Lelystad", played: 24, won: 18, drawn: 2, lost: 4, points: 56, goalsFor: 74, goalsAgainst: 30 },
      { name: "De Foresters", played: 24, won: 17, drawn: 3, lost: 4, points: 54, goalsFor: 111, goalsAgainst: 33 },
      { name: "Olympia Haarlem", played: 24, won: 15, drawn: 5, lost: 4, points: 50, goalsFor: 81, goalsAgainst: 35 },
      { name: "Stormvogels IJVV", played: 24, won: 15, drawn: 1, lost: 8, points: 46, goalsFor: 73, goalsAgainst: 35 },
      { name: "CSV Jong Holland", played: 24, won: 13, drawn: 7, lost: 4, points: 46, goalsFor: 66, goalsAgainst: 32 },
      { name: "ASV Arsenal", played: 24, won: 10, drawn: 6, lost: 8, points: 36, goalsFor: 55, goalsAgainst: 59 },
      { name: "Always Forward", played: 24, won: 10, drawn: 5, lost: 9, points: 35, goalsFor: 74, goalsAgainst: 55 },
      { name: "ASC Waterwijk", played: 24, won: 10, drawn: 4, lost: 10, points: 34, goalsFor: 64, goalsAgainst: 62 },
      { name: "Buitenboys", played: 24, won: 10, drawn: 2, lost: 12, points: 32, goalsFor: 52, goalsAgainst: 56 },
      { name: "SCPB '22", played: 24, won: 9, drawn: 4, lost: 11, points: 31, goalsFor: 77, goalsAgainst: 71 },
      { name: "ASV De Dijk", played: 24, won: 3, drawn: 3, lost: 18, points: 12, goalsFor: 36, goalsAgainst: 90 },
      { name: "VV Monnickendam", played: 24, won: 3, drawn: 2, lost: 19, points: 11, goalsFor: 36, goalsAgainst: 104 },
      { name: "Zwaluwen '30", played: 24, won: 1, drawn: 0, lost: 23, points: 3, goalsFor: 23, goalsAgainst: 160 }
    ]
  },
  {
    division: 'Tweede Klasse B',
    clubs: [
      { name: "Legmeervogels", played: 26, won: 18, drawn: 5, lost: 3, points: 59, goalsFor: 50, goalsAgainst: 23 },
      { name: "FC De Bilt", played: 26, won: 16, drawn: 8, lost: 2, points: 56, goalsFor: 57, goalsAgainst: 19 },
      { name: "ucs EDO", played: 26, won: 12, drawn: 6, lost: 8, points: 42, goalsFor: 41, goalsAgainst: 27 },
      { name: "VV De Meern", played: 26, won: 10, drawn: 7, lost: 9, points: 37, goalsFor: 35, goalsAgainst: 36 },
      { name: "Montfoort SV '19", played: 26, won: 9, drawn: 8, lost: 9, points: 35, goalsFor: 38, goalsAgainst: 38 },
      { name: "PVCV", played: 26, won: 10, drawn: 5, lost: 11, points: 35, goalsFor: 47, goalsAgainst: 48 },
      { name: "SV Nieuw Utrecht", played: 26, won: 9, drawn: 7, lost: 10, points: 34, goalsFor: 44, goalsAgainst: 49 },
      { name: "SV Nieuwkoop", played: 26, won: 8, drawn: 9, lost: 9, points: 33, goalsFor: 29, goalsAgainst: 28 },
      { name: "SV Argon", played: 26, won: 7, drawn: 11, lost: 8, points: 32, goalsFor: 32, goalsAgainst: 31 },
      { name: "CSW", played: 26, won: 8, drawn: 8, lost: 10, points: 32, goalsFor: 29, goalsAgainst: 38 },
      { name: "FC Oudewater", played: 26, won: 8, drawn: 6, lost: 12, points: 30, goalsFor: 36, goalsAgainst: 42 },
      { name: "VV Jonathan", played: 26, won: 7, drawn: 6, lost: 13, points: 27, goalsFor: 41, goalsAgainst: 51 },
      { name: "Elinkwijk", played: 26, won: 5, drawn: 8, lost: 13, points: 23, goalsFor: 39, goalsAgainst: 58 },
      { name: "FC Breukelen", played: 26, won: 5, drawn: 6, lost: 15, points: 21, goalsFor: 42, goalsAgainst: 72 }
    ]
  },
  {
    division: 'Derde Klasse A',
    clubs: [
      { name: "VSV", played: 24, won: 19, drawn: 3, lost: 2, points: 60, goalsFor: 55, goalsAgainst: 20 },
      { name: "HCSC", played: 24, won: 17, drawn: 3, lost: 4, points: 54, goalsFor: 75, goalsAgainst: 31 },
      { name: "Reiger Boys", played: 24, won: 14, drawn: 3, lost: 7, points: 45, goalsFor: 62, goalsAgainst: 41 },
      { name: "SDOB", played: 24, won: 14, drawn: 3, lost: 7, points: 45, goalsFor: 61, goalsAgainst: 42 },
      { name: "FC Castricum", played: 24, won: 12, drawn: 5, lost: 7, points: 41, goalsFor: 69, goalsAgainst: 37 },
      { name: "hfc EDO", played: 24, won: 10, drawn: 3, lost: 11, points: 33, goalsFor: 44, goalsAgainst: 52 },
      { name: "Sporting Andijk", played: 24, won: 9, drawn: 2, lost: 13, points: 29, goalsFor: 46, goalsAgainst: 60 },
      { name: "vv IJmuiden", played: 24, won: 8, drawn: 5, lost: 11, points: 29, goalsFor: 28, goalsAgainst: 47 },
      { name: "FC Purmerend", played: 24, won: 7, drawn: 7, lost: 10, points: 28, goalsFor: 36, goalsAgainst: 47 },
      { name: "SV Zandvoort", played: 24, won: 8, drawn: 2, lost: 14, points: 26, goalsFor: 41, goalsAgainst: 67 },
      { name: "EVC", played: 24, won: 7, drawn: 3, lost: 14, points: 24, goalsFor: 44, goalsAgainst: 50 },
      { name: "FC Medemblik", played: 24, won: 5, drawn: 4, lost: 15, points: 19, goalsFor: 36, goalsAgainst: 64 },
      { name: "OSV", played: 24, won: 3, drawn: 3, lost: 18, points: 12, goalsFor: 36, goalsAgainst: 75 }
    ]
  },
  {
    division: 'Derde Klasse B',
    clubs: [
      { name: "Kagia", played: 26, won: 17, drawn: 2, lost: 7, points: 53, goalsFor: 52, goalsAgainst: 28 },
      { name: "Amstelveen Heemraad", played: 26, won: 15, drawn: 6, lost: 5, points: 51, goalsFor: 60, goalsAgainst: 37 },
      { name: "SDZ", played: 26, won: 15, drawn: 5, lost: 6, points: 50, goalsFor: 66, goalsAgainst: 33 },
      { name: "RKDES", played: 26, won: 14, drawn: 6, lost: 6, points: 48, goalsFor: 48, goalsAgainst: 22 },
      { name: "EMM '21", played: 26, won: 13, drawn: 7, lost: 6, points: 46, goalsFor: 61, goalsAgainst: 21 },
      { name: "Wartburgia", played: 26, won: 13, drawn: 6, lost: 7, points: 45, goalsFor: 62, goalsAgainst: 48 },
      { name: "AFC DWS", played: 26, won: 13, drawn: 4, lost: 9, points: 43, goalsFor: 56, goalsAgainst: 46 },
      { name: "SC Buitenveldert", played: 26, won: 12, drawn: 5, lost: 9, points: 41, goalsFor: 51, goalsAgainst: 38 },
      { name: "SCW", played: 26, won: 10, drawn: 4, lost: 12, points: 34, goalsFor: 44, goalsAgainst: 43 },
      { name: "AFC", played: 26, won: 10, drawn: 2, lost: 14, points: 32, goalsFor: 47, goalsAgainst: 66 },
      { name: "FC Almere", played: 26, won: 7, drawn: 5, lost: 14, points: 26, goalsFor: 45, goalsAgainst: 67 },
      { name: "KDO", played: 26, won: 7, drawn: 3, lost: 16, points: 24, goalsFor: 48, goalsAgainst: 74 },
      { name: "FC VVC", played: 26, won: 6, drawn: 3, lost: 17, points: 21, goalsFor: 47, goalsAgainst: 62 },
      { name: "AMVJ", played: 26, won: 0, drawn: 2, lost: 24, points: 2, goalsFor: 16, goalsAgainst: 118 }
    ]
  },
  {
    division: 'Derde Klasse C',
    clubs: [
      { name: "SV Zeist", played: 26, won: 18, drawn: 4, lost: 4, points: 58, goalsFor: 76, goalsAgainst: 30 },
      { name: "SO Soest", played: 26, won: 16, drawn: 3, lost: 7, points: 51, goalsFor: 52, goalsAgainst: 31 },
      { name: "VV Hees", played: 26, won: 14, drawn: 5, lost: 7, points: 47, goalsFor: 39, goalsAgainst: 30 },
      { name: "ASC Nieuwland", played: 26, won: 12, drawn: 7, lost: 7, points: 43, goalsFor: 59, goalsAgainst: 39 },
      { name: "SC Hoevelaken", played: 26, won: 12, drawn: 6, lost: 8, points: 42, goalsFor: 56, goalsAgainst: 35 },
      { name: "SV Olympia '25", played: 26, won: 12, drawn: 5, lost: 9, points: 41, goalsFor: 54, goalsAgainst: 40 },
      { name: "SV Eemnes", played: 26, won: 12, drawn: 5, lost: 9, points: 41, goalsFor: 38, goalsAgainst: 44 },
      { name: "SV Loosdrecht", played: 26, won: 9, drawn: 5, lost: 12, points: 32, goalsFor: 44, goalsAgainst: 46 },
      { name: "SV Laren '99", played: 26, won: 8, drawn: 8, lost: 10, points: 32, goalsFor: 29, goalsAgainst: 46 },
      { name: "TOV", played: 26, won: 7, drawn: 8, lost: 11, points: 29, goalsFor: 32, goalsAgainst: 41 },
      { name: "Terschuurse Boys", played: 26, won: 8, drawn: 5, lost: 13, points: 29, goalsFor: 28, goalsAgainst: 50 },
      { name: "SV 's-Graveland", played: 26, won: 6, drawn: 8, lost: 12, points: 26, goalsFor: 40, goalsAgainst: 59 },
      { name: "VVZA", played: 26, won: 6, drawn: 3, lost: 17, points: 21, goalsFor: 45, goalsAgainst: 67 },
      { name: "Saestum", played: 26, won: 6, drawn: 0, lost: 20, points: 18, goalsFor: 37, goalsAgainst: 71 }
    ]
  },
  {
    division: 'Derde Klasse D',
    clubs: [
      { name: "VVIJ", played: 26, won: 20, drawn: 3, lost: 3, points: 63, goalsFor: 80, goalsAgainst: 25 },
      { name: "SCH '44", played: 26, won: 20, drawn: 2, lost: 4, points: 62, goalsFor: 96, goalsAgainst: 39 },
      { name: "FC Delta Sports '95", played: 26, won: 17, drawn: 5, lost: 4, points: 56, goalsFor: 59, goalsAgainst: 31 },
      { name: "SC Everstein", played: 26, won: 13, drawn: 4, lost: 9, points: 43, goalsFor: 59, goalsAgainst: 55 },
      { name: "COV DESTO", played: 26, won: 13, drawn: 2, lost: 11, points: 41, goalsFor: 51, goalsAgainst: 54 },
      { name: "VV Benschop", played: 26, won: 11, drawn: 6, lost: 9, points: 39, goalsFor: 57, goalsAgainst: 42 },
      { name: "IJFC", played: 26, won: 11, drawn: 5, lost: 10, points: 38, goalsFor: 49, goalsAgainst: 39 },
      { name: "Odysseus '91", played: 26, won: 10, drawn: 4, lost: 12, points: 34, goalsFor: 41, goalsAgainst: 49 },
      { name: "Zwaluwen Utrecht 1911", played: 26, won: 10, drawn: 3, lost: 13, points: 33, goalsFor: 49, goalsAgainst: 66 },
      { name: "VV Groot-Ammers", played: 26, won: 7, drawn: 6, lost: 13, points: 27, goalsFor: 47, goalsAgainst: 61 },
      { name: "VV Schoonhoven", played: 26, won: 5, drawn: 10, lost: 11, points: 25, goalsFor: 32, goalsAgainst: 42 },
      { name: "VV Heukelum", played: 26, won: 7, drawn: 3, lost: 16, points: 24, goalsFor: 43, goalsAgainst: 70 },
      { name: "VV Maarssen", played: 26, won: 6, drawn: 4, lost: 16, points: 22, goalsFor: 50, goalsAgainst: 71 },
      { name: "Lekvogels", played: 26, won: 2, drawn: 3, lost: 21, points: 9, goalsFor: 22, goalsAgainst: 91 }
    ]
  }
];

const region = 'West 1';
const season = '2024/2025';
const tierMap = {
  'Tweede Klasse A': 'AMATEUR',
  'Tweede Klasse B': 'AMATEUR',
  'Derde Klasse A': 'AMATEUR',
  'Derde Klasse B': 'AMATEUR',
  'Derde Klasse C': 'AMATEUR',
  'Derde Klasse D': 'AMATEUR',
};

async function main() {
  for (const div of divisions) {
    // Delete existing league and clubs for this division
    const existingLeague = await prisma.league.findFirst({
      where: { region, division: div.division },
      include: { clubs: true }
    });
    if (existingLeague) {
      for (const club of existingLeague.clubs) {
        await prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } });
        await prisma.clubFinances.deleteMany({ where: { clubId: club.id } });
        await prisma.fixture.deleteMany({ where: { homeClubId: club.id } });
        await prisma.fixture.deleteMany({ where: { awayClubId: club.id } });
        await prisma.gateReceipt.deleteMany({ where: { clubId: club.id } });
        await prisma.sponsorship.deleteMany({ where: { clubId: club.id } });
        await prisma.facility.deleteMany({ where: { clubId: club.id } });
        await prisma.staff.deleteMany({ where: { clubId: club.id } });
        await prisma.staffContract.deleteMany({ where: { clubId: club.id } });
        await prisma.clubFormation.deleteMany({ where: { clubId: club.id } });
        await prisma.clubStrategy.deleteMany({ where: { clubId: club.id } });
        await prisma.shareHolding.deleteMany({ where: { clubId: club.id } });
        await prisma.transfer.deleteMany({ where: { fromClubId: club.id } });
        await prisma.transfer.deleteMany({ where: { toClubId: club.id } });
        await prisma.loan.deleteMany({ where: { fromClubId: club.id } });
        await prisma.loan.deleteMany({ where: { toClubId: club.id } });
        await prisma.mortgage.deleteMany({ where: { clubId: club.id } });
        await prisma.creditFacility.deleteMany({ where: { clubId: club.id } });
        await prisma.investorOffer.deleteMany({ where: { clubId: club.id } });
        await prisma.governmentBailout.deleteMany({ where: { clubId: club.id } });
        await prisma.regulatoryWarning.deleteMany({ where: { clubId: club.id } });
        await prisma.bankruptcyEvent.deleteMany({ where: { clubId: club.id } });
        await prisma.player.deleteMany({ where: { clubId: club.id } });
        await prisma.club.delete({ where: { id: club.id } });
      }
      await prisma.league.delete({ where: { id: existingLeague.id } });
    }
    // Create league
    const league = await prisma.league.create({
      data: {
        name: `${region} ${div.division}`,
        region,
        division: div.division,
        tier: tierMap[div.division],
        season,
        clubs: {
          create: div.clubs.map(club => ({ name: club.name }))
        }
      },
      include: { clubs: true }
    });
    // Add stats for each club
    for (let i = 0; i < div.clubs.length; i++) {
      const club = league.clubs[i];
      const clubData = div.clubs[i];
      await prisma.clubSeasonStats.create({
        data: {
          clubId: club.id,
          leagueId: league.id,
          season,
          position: i + 1,
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
    }
    console.log(`Created ${region} ${div.division}`);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); }); 