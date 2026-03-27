import { PrismaClient } from '@prisma/client';

export async function seedZaterdagWest1(prisma: PrismaClient, zaterdagLeagues: any[]) {
  // Zaterdag West 1 5e klasse A
  const vijfdeKlasseA_ZaterdagWest1 = zaterdagLeagues.find(l => l.level === 'Vijfde Klasse A');
  if (vijfdeKlasseA_ZaterdagWest1) {
    const vijfdeKlasseAClubs_ZaterdagWest1 = [
      { name: 'VV Zwanenburg', city: 'Zwanenburg', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Blauw Wit W', city: 'Amsterdam', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'De Wherevogels', city: 'Purmerend', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'ZCFC', city: 'Zaandam', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV DTS', city: 'Oosthuizen', boardExpectation: 'Mid-table finish', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Opperdoes', city: 'Opperdoes', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'De Blokkers', city: 'Hoorn', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sporting Krommenie', city: 'Krommenie', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Wieringermeer', city: 'Slootdorp', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'ASC De Volewijckers', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SC Purmerland', city: 'Purmerland', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Jisp', city: 'Jisp', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Koedijk', city: 'Koedijk', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Kadoelen', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 47, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
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
  const vijfdeKlasseB_ZaterdagWest1 = zaterdagLeagues.find(l => l.level === 'Vijfde Klasse B');
  if (vijfdeKlasseB_ZaterdagWest1) {
    const vijfdeKlasseBClubs_ZaterdagWest1 = [
      { name: 'vv Schoten', city: 'Haarlem', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Onze Gezellen', city: 'Haarlem', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Overbos', city: 'Hoofddorp', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SVIJ', city: 'IJmuiden', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Spaarnwoude', city: 'Halfweg', boardExpectation: 'Mid-table finish', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Terrasvogels', city: 'Santpoort-Noord', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RCH', city: 'Heemstede', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'vv UNO', city: 'Hoofddorp', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Wijk aan Zee', city: 'Wijk aan Zee', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'DSK', city: 'Haarlem', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RKVV Velsen', city: 'Driehuis', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Vogelenzang', city: 'Vogelenzang', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'FC Velsenoord', city: 'IJmuiden', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Waterloo', city: 'Heemstede', boardExpectation: 'Avoid relegation', morale: 47, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
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
  const vijfdeKlasseC_ZaterdagWest1 = zaterdagLeagues.find(l => l.level === 'Vijfde Klasse C');
  if (vijfdeKlasseC_ZaterdagWest1) {
    const vijfdeKlasseCClubs_ZaterdagWest1 = [
      { name: 'GeuzenMiddenmeer', city: 'Amsterdam', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Tos Actief', city: 'Amsterdam', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'ZSGOWMS', city: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Zuidoost United', city: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'AFC IJburg', city: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Zeeburgia', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Atletico Club Amsterdam', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'ASC Germaan/De Eland', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV RAP', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'ASV Blauw-Wit', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'FC Amsterdam', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sloterdijk AVV', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sporting Martinus', city: 'Amstelveen', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
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
  const vijfdeKlasseD_ZaterdagWest1 = zaterdagLeagues.find(l => l.level === 'Vijfde Klasse D');
  if (vijfdeKlasseD_ZaterdagWest1) {
    const vijfdeKlasseDClubs_ZaterdagWest1 = [
      { name: "SC AH 78", city: 'Huizen', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Eminent Boys', city: 'Amsterdam', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sporting Almere', city: 'Almere', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "SC 't Gooi", city: 'Hilversum', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VIOD Tienhoven', city: 'Tienhoven', boardExpectation: 'Mid-table finish', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV De Vecht', city: 'Loenen aan de Vecht', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'ASV 65', city: 'Ankeveen', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Kockengen', city: 'Kockengen', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Eemboys', city: 'Baarn', boardExpectation: 'Avoid relegation', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'HMS', city: 'Utrecht', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
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
  const vijfdeKlasseE_ZaterdagWest1 = zaterdagLeagues.find(l => l.level === 'Vijfde Klasse E');
  if (vijfdeKlasseE_ZaterdagWest1) {
    const vijfdeKlasseEClubs_ZaterdagWest1 = [
      { name: 'VV Schalkwijk', city: 'Schalkwijk', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "VVZ 49", city: 'Soest', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Panter', city: 'Utrecht', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Cobu Boys', city: 'Utrecht', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'DVSA', city: 'Amerongen', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "VV 't Vliegdorp", city: 'Soesterberg', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SVF', city: 'Cothen', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SVMM', city: 'Maarn', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Oranje Wit Elst', city: 'Elst', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Austerlitz', city: 'Austerlitz', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'FZO', city: 'Zeist', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Aurora', city: 'Werkhoven', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Faja Lobi KDS', city: 'Utrecht', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
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
