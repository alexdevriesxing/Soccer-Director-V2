const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const divisions = [
  {
    division: 'Vierde Klasse A',
    clubs: [
      { name: "OFCOFC", played: 26, won: 18, drawn: 1, lost: 7, points: 55, goalsFor: 81, goalsAgainst: 35 },
      { name: "Jong Hercules", played: 26, won: 17, drawn: 3, lost: 6, points: 54, goalsFor: 73, goalsAgainst: 37 },
      { name: "SVW '27", played: 26, won: 16, drawn: 2, lost: 8, points: 50, goalsFor: 81, goalsAgainst: 45 },
      { name: "ZVC '22", played: 26, won: 13, drawn: 5, lost: 8, points: 44, goalsFor: 53, goalsAgainst: 35 },
      { name: "SV Marken", played: 26, won: 12, drawn: 3, lost: 11, points: 39, goalsFor: 67, goalsAgainst: 65 },
      { name: "DZS", played: 26, won: 11, drawn: 4, lost: 11, points: 37, goalsFor: 64, goalsAgainst: 62 },
      { name: "SV Vrone", played: 26, won: 10, drawn: 4, lost: 12, points: 34, goalsFor: 46, goalsAgainst: 45 },
      { name: "VV Egmond", played: 26, won: 9, drawn: 7, lost: 10, points: 34, goalsFor: 36, goalsAgainst: 48 },
      { name: "VV Westzaan", played: 26, won: 10, drawn: 3, lost: 13, points: 33, goalsFor: 40, goalsAgainst: 51 },
      { name: "RKSV TOB", played: 26, won: 9, drawn: 6, lost: 11, points: 33, goalsFor: 44, goalsAgainst: 70 },
      { name: "Sporting Adrichem", played: 26, won: 7, drawn: 9, lost: 10, points: 30, goalsFor: 45, goalsAgainst: 51 },
      { name: "Kolping Boys", played: 26, won: 9, drawn: 3, lost: 14, points: 30, goalsFor: 43, goalsAgainst: 65 },
      { name: "Alcmaria Victrix", played: 26, won: 7, drawn: 2, lost: 17, points: 23, goalsFor: 36, goalsAgainst: 74 },
      { name: "ADO '20", played: 26, won: 4, drawn: 8, lost: 14, points: 20, goalsFor: 31, goalsAgainst: 57 }
    ]
  },
  {
    division: 'Vierde Klasse B',
    clubs: [
      { name: "SV Real Sranang", played: 26, won: 19, drawn: 3, lost: 4, points: 60, goalsFor: 108, goalsAgainst: 40 },
      { name: "RKAVIC", played: 26, won: 18, drawn: 4, lost: 4, points: 58, goalsFor: 85, goalsAgainst: 45 },
      { name: "SV Diemen", played: 26, won: 16, drawn: 6, lost: 4, points: 54, goalsFor: 58, goalsAgainst: 32 },
      { name: "asv DTA Fortius", played: 26, won: 14, drawn: 5, lost: 7, points: 47, goalsFor: 82, goalsAgainst: 62 },
      { name: "CVV Vlug en Vaardig", played: 26, won: 13, drawn: 6, lost: 7, points: 45, goalsFor: 68, goalsAgainst: 53 },
      { name: "SC Urban Talent", played: 26, won: 10, drawn: 7, lost: 9, points: 37, goalsFor: 58, goalsAgainst: 50 },
      { name: "SV United-DAVO", played: 26, won: 9, drawn: 8, lost: 9, points: 35, goalsFor: 46, goalsAgainst: 53 },
      { name: "VVH/Velserbroek", played: 26, won: 10, drawn: 5, lost: 11, points: 35, goalsFor: 47, goalsAgainst: 61 },
      { name: "SV De Meteoor", played: 26, won: 8, drawn: 7, lost: 11, points: 31, goalsFor: 50, goalsAgainst: 63 },
      { name: "Haarlem Kennemerland", played: 26, won: 9, drawn: 2, lost: 15, points: 29, goalsFor: 62, goalsAgainst: 60 },
      { name: "SV De Meer", played: 26, won: 8, drawn: 4, lost: 14, points: 28, goalsFor: 48, goalsAgainst: 76 },
      { name: "JOS Watergraafsmeer", played: 26, won: 6, drawn: 4, lost: 16, points: 22, goalsFor: 50, goalsAgainst: 77 },
      { name: "VVA/Spartaan", played: 26, won: 5, drawn: 2, lost: 19, points: 14, goalsFor: 42, goalsAgainst: 78 },
      { name: "SV Hoofddorp", played: 26, won: 1, drawn: 9, lost: 16, points: 12, goalsFor: 40, goalsAgainst: 94 }
    ]
  },
  {
    division: 'Vierde Klasse C',
    clubs: [
      { name: "HSV Wasmeer", played: 22, won: 18, drawn: 2, lost: 2, points: 56, goalsFor: 68, goalsAgainst: 29 },
      { name: "Altius", played: 22, won: 15, drawn: 3, lost: 4, points: 48, goalsFor: 78, goalsAgainst: 33 },
      { name: "Forza Almere", played: 22, won: 13, drawn: 1, lost: 8, points: 40, goalsFor: 61, goalsAgainst: 44 },
      { name: "VV Nederhorst", played: 22, won: 10, drawn: 5, lost: 7, points: 35, goalsFor: 47, goalsAgainst: 40 },
      { name: "SV Baarn", played: 22, won: 9, drawn: 2, lost: 11, points: 29, goalsFor: 56, goalsAgainst: 56 },
      { name: "SV NVC", played: 22, won: 8, drawn: 5, lost: 9, points: 29, goalsFor: 36, goalsAgainst: 46 },
      { name: "VVJ", played: 22, won: 7, drawn: 5, lost: 10, points: 26, goalsFor: 38, goalsAgainst: 52 },
      { name: "Hertha", played: 22, won: 7, drawn: 4, lost: 11, points: 25, goalsFor: 39, goalsAgainst: 46 },
      { name: "SV Ouderkerk", played: 22, won: 7, drawn: 3, lost: 12, points: 24, goalsFor: 46, goalsAgainst: 57 },
      { name: "SVM Maartensdijk", played: 22, won: 7, drawn: 2, lost: 13, points: 23, goalsFor: 42, goalsAgainst: 55 },
      { name: "NiTA osv", played: 22, won: 5, drawn: 5, lost: 12, points: 20, goalsFor: 32, goalsAgainst: 44 },
      { name: "FC Weesp", played: 22, won: 5, drawn: 5, lost: 12, points: 20, goalsFor: 40, goalsAgainst: 81 }
    ]
  },
  {
    division: 'Vierde Klasse D',
    clubs: [
      { name: "VV Veenendaal", played: 24, won: 21, drawn: 1, lost: 2, points: 64, goalsFor: 77, goalsAgainst: 32 },
      { name: "HVCHVC", played: 24, won: 15, drawn: 5, lost: 4, points: 50, goalsFor: 57, goalsAgainst: 33 },
      { name: "DOSC", played: 24, won: 15, drawn: 2, lost: 7, points: 47, goalsFor: 61, goalsAgainst: 40 },
      { name: "SV Achterveld", played: 24, won: 14, drawn: 4, lost: 6, points: 46, goalsFor: 72, goalsAgainst: 36 },
      { name: "VV Musketiers", played: 24, won: 13, drawn: 2, lost: 9, points: 40, goalsFor: 55, goalsAgainst: 48 },
      { name: "KVVA", played: 24, won: 10, drawn: 4, lost: 10, points: 34, goalsFor: 63, goalsAgainst: 58 },
      { name: "Quick 1890 AFC", played: 24, won: 10, drawn: 3, lost: 11, points: 33, goalsFor: 49, goalsAgainst: 35 },
      { name: "VV SEC", played: 24, won: 10, drawn: 1, lost: 13, points: 31, goalsFor: 45, goalsAgainst: 65 },
      { name: "VV HDS", played: 24, won: 8, drawn: 3, lost: 13, points: 27, goalsFor: 28, goalsAgainst: 46 },
      { name: "DEV Doorn", played: 24, won: 5, drawn: 10, lost: 9, points: 25, goalsFor: 34, goalsAgainst: 44 },
      { name: "VV De Posthoorn", played: 24, won: 6, drawn: 3, lost: 15, points: 21, goalsFor: 41, goalsAgainst: 65 },
      { name: "Amsvorde", played: 24, won: 4, drawn: 4, lost: 16, points: 16, goalsFor: 34, goalsAgainst: 71 },
      { name: "APWC", played: 24, won: 3, drawn: 2, lost: 19, points: 11, goalsFor: 36, goalsAgainst: 79 }
    ]
  },
  {
    division: 'Vierde Klasse E',
    clubs: [
      { name: "SV Odijk", played: 26, won: 20, drawn: 4, lost: 2, points: 64, goalsFor: 86, goalsAgainst: 32 },
      { name: "FC Driebergen", played: 26, won: 16, drawn: 6, lost: 4, points: 54, goalsFor: 74, goalsAgainst: 33 },
      { name: "JSV Nieuwegein", played: 26, won: 16, drawn: 2, lost: 8, points: 50, goalsFor: 81, goalsAgainst: 51 },
      { name: "CVV Vriendenschaar", played: 26, won: 15, drawn: 5, lost: 6, points: 50, goalsFor: 52, goalsAgainst: 27 },
      { name: "ZSC Patria", played: 26, won: 14, drawn: 6, lost: 6, points: 48, goalsFor: 66, goalsAgainst: 55 },
      { name: "SV Lopik", played: 26, won: 13, drawn: 4, lost: 9, points: 43, goalsFor: 54, goalsAgainst: 31 },
      { name: "OSM '75", played: 26, won: 13, drawn: 2, lost: 11, points: 41, goalsFor: 63, goalsAgainst: 53 },
      { name: "Bunnik '73", played: 26, won: 11, drawn: 4, lost: 11, points: 37, goalsFor: 56, goalsAgainst: 69 },
      { name: "Focus '07", played: 26, won: 11, drawn: 2, lost: 13, points: 35, goalsFor: 50, goalsAgainst: 45 },
      { name: "Voorwaarts U", played: 26, won: 10, drawn: 1, lost: 15, points: 31, goalsFor: 42, goalsAgainst: 67 },
      { name: "ASV UVV", played: 26, won: 8, drawn: 6, lost: 12, points: 30, goalsFor: 49, goalsAgainst: 45 },
      { name: "VV 't Goy", played: 26, won: 4, drawn: 4, lost: 18, points: 16, goalsFor: 28, goalsAgainst: 70 },
      { name: "Brederodes", played: 26, won: 4, drawn: 2, lost: 20, points: 14, goalsFor: 31, goalsAgainst: 87 },
      { name: "DVSU", played: 26, won: 3, drawn: 0, lost: 23, points: 9, goalsFor: 24, goalsAgainst: 91 }
    ]
  }
];

const region = 'West 1';
const season = '2024/2025';
const tier = 'AMATEUR';

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
        tier,
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