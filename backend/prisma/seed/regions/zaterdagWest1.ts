import { PrismaClient } from '@prisma/client';

export async function seedZaterdagWest1(prisma: PrismaClient, zaterdagLeagues: any[]) {
  // Zaterdag West 1 5e klasse A
  const vijfdeKlasseA_ZaterdagWest1 = zaterdagLeagues.find(l => l.division === 'Vijfde Klasse A');
  if (vijfdeKlasseA_ZaterdagWest1) {
    const vijfdeKlasseAClubs_ZaterdagWest1 = [
      { name: 'VV Zwanenburg', homeCity: 'Zwanenburg', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Blauw Wit W', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'De Wherevogels', homeCity: 'Purmerend', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'ZCFC', homeCity: 'Zaandam', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV DTS', homeCity: 'Oosthuizen', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Opperdoes', homeCity: 'Opperdoes', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'De Blokkers', homeCity: 'Hoorn', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sporting Krommenie', homeCity: 'Krommenie', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Wieringermeer', homeCity: 'Slootdorp', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'ASC De Volewijckers', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SC Purmerland', homeCity: 'Purmerland', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Jisp', homeCity: 'Jisp', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Koedijk', homeCity: 'Koedijk', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Kadoelen', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 47, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
    ];
    for (const clubData of vijfdeKlasseAClubs_ZaterdagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseA_ZaterdagWest1.id,
        },
      });
    }
  }

  // Zaterdag West 1 5e klasse B
  const vijfdeKlasseB_ZaterdagWest1 = zaterdagLeagues.find(l => l.division === 'Vijfde Klasse B');
  if (vijfdeKlasseB_ZaterdagWest1) {
    const vijfdeKlasseBClubs_ZaterdagWest1 = [
      { name: 'vv Schoten', homeCity: 'Haarlem', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Onze Gezellen', homeCity: 'Haarlem', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Overbos', homeCity: 'Hoofddorp', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SVIJ', homeCity: 'IJmuiden', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Spaarnwoude', homeCity: 'Halfweg', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Terrasvogels', homeCity: 'Santpoort-Noord', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RCH', homeCity: 'Heemstede', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'vv UNO', homeCity: 'Hoofddorp', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Wijk aan Zee', homeCity: 'Wijk aan Zee', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'DSK', homeCity: 'Haarlem', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RKVV Velsen', homeCity: 'Driehuis', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Vogelenzang', homeCity: 'Vogelenzang', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'FC Velsenoord', homeCity: 'IJmuiden', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Waterloo', homeCity: 'Heemstede', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 47, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
    ];
    for (const clubData of vijfdeKlasseBClubs_ZaterdagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseB_ZaterdagWest1.id,
        },
      });
    }
  }

  // Zaterdag West 1 5e klasse C
  const vijfdeKlasseC_ZaterdagWest1 = zaterdagLeagues.find(l => l.division === 'Vijfde Klasse C');
  if (vijfdeKlasseC_ZaterdagWest1) {
    const vijfdeKlasseCClubs_ZaterdagWest1 = [
      { name: 'GeuzenMiddenmeer', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Tos Actief', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'ZSGOWMS', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Zuidoost United', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'AFC IJburg', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Zeeburgia', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Atletico Club Amsterdam', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'ASC Germaan/De Eland', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV RAP', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'ASV Blauw-Wit', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'FC Amsterdam', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sloterdijk AVV', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sporting Martinus', homeCity: 'Amstelveen', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
    ];
    for (const clubData of vijfdeKlasseCClubs_ZaterdagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseC_ZaterdagWest1.id,
        },
      });
    }
  }

  // Zaterdag West 1 5e klasse D
  const vijfdeKlasseD_ZaterdagWest1 = zaterdagLeagues.find(l => l.division === 'Vijfde Klasse D');
  if (vijfdeKlasseD_ZaterdagWest1) {
    const vijfdeKlasseDClubs_ZaterdagWest1 = [
      { name: "SC AH 78", homeCity: 'Huizen', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Eminent Boys', homeCity: 'Amsterdam', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sporting Almere', homeCity: 'Almere', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "SC 't Gooi", homeCity: 'Hilversum', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VIOD Tienhoven', homeCity: 'Tienhoven', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV De Vecht', homeCity: 'Loenen aan de Vecht', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'ASV 65', homeCity: 'Ankeveen', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Kockengen', homeCity: 'Kockengen', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Eemboys', homeCity: 'Baarn', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'HMS', homeCity: 'Utrecht', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
    ];
    for (const clubData of vijfdeKlasseDClubs_ZaterdagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseD_ZaterdagWest1.id,
        },
      });
    }
  }

  // Zaterdag West 1 5e klasse E
  const vijfdeKlasseE_ZaterdagWest1 = zaterdagLeagues.find(l => l.division === 'Vijfde Klasse E');
  if (vijfdeKlasseE_ZaterdagWest1) {
    const vijfdeKlasseEClubs_ZaterdagWest1 = [
      { name: 'VV Schalkwijk', homeCity: 'Schalkwijk', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "VVZ 49", homeCity: 'Soest', regionTag: 'Zaterdag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Panter', homeCity: 'Utrecht', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Cobu Boys', homeCity: 'Utrecht', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'DVSA', homeCity: 'Amerongen', regionTag: 'Zaterdag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "VV 't Vliegdorp", homeCity: 'Soesterberg', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SVF', homeCity: 'Cothen', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SVMM', homeCity: 'Maarn', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Oranje Wit Elst', homeCity: 'Elst', regionTag: 'Zaterdag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Austerlitz', homeCity: 'Austerlitz', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'FZO', homeCity: 'Zeist', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Aurora', homeCity: 'Werkhoven', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Faja Lobi KDS', homeCity: 'Utrecht', regionTag: 'Zaterdag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
    ];
    for (const clubData of vijfdeKlasseEClubs_ZaterdagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseE_ZaterdagWest1.id,
        },
      });
    }
  }
}
