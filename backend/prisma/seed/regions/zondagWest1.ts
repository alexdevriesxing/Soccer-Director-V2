import { PrismaClient } from '@prisma/client';

export async function seedZondagWest1(prisma: PrismaClient, zondagLeagues: any[]) {
  // Zondag West 1 2e Klasse A
  const tweedeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.level === 'Tweede Klasse A');
  if (tweedeKlasseA_ZondagWest1) {
    const tweedeKlasseAClubs_ZondagWest1 = [
      { name: 'JVC', city: 'Julianadorp', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'FC Uitgeest', city: 'Uitgeest', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Egmond', city: 'Egmond aan den Hoef', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Westfriezen', city: 'Zwaag', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Limmen', city: 'Limmen', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'LSVV', city: 'Lisse', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'KFC', city: 'Koog aan de Zaan', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SVA', city: 'Assendelft', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Always Forward', city: 'Hoorn', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'DSOV', city: 'Vijfhuizen', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'IVV', city: 'Landsmeer', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Fortuna Wormerveer', city: 'Wormerveer', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Meervogels 31", city: 'Akersloot', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Flevo', city: 'Middenmeer', boardExpectation: 'Avoid relegation', morale: 47, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of tweedeKlasseAClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseA_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 2e Klasse B
  const tweedeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.level === 'Tweede Klasse B');
  if (tweedeKlasseB_ZondagWest1) {
    const tweedeKlasseBClubs_ZondagWest1 = [
      { name: 'SV TOP', city: 'Oss', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV De Meer', city: 'Amsterdam', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RSV Antibarbari', city: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Nieuwkuijk', city: 'Nieuwkuijk', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Zwaluw VFC', city: 'Vught', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "RKSV RODA 23", city: 'Amstelveen', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RKSV DCG', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SDO', city: 'Bussum', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'FC Abcoude', city: 'Abcoude', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Beuningse Boys', city: 'Beuningen', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'WV-HEDW', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Leones', city: 'Beneden-Leeuwen', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SC Woezik', city: 'Wijchen', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of tweedeKlasseBClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseB_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 3e Klasse A
  const derdeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.level === 'Derde Klasse A');
  if (derdeKlasseA_ZondagWest1) {
    const derdeKlasseAClubs_ZondagWest1 = [
      { name: 'ZAP', city: 'Breezand', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Schagen United', city: 'Schagen', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'FC Den Helder', city: 'Den Helder', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV DWB', city: 'Aartswoud', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "VVS 46", city: 'Spanbroek', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Grasshoppers', city: 'Hoogwoud', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'De Valken', city: 'Hem', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Spartanen', city: 'Wognum', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RKSV Sint George', city: 'Spierdijk', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 's.v. Enkhuizen', city: 'Enkhuizen', boardExpectation: 'Mid-table finish', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Kleine Sluis', city: 'Anna Paulowna', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Dirkshorn', city: 'Dirkshorn', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VVW', city: 'Wervershoof', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'DWOW', city: 'Wieringerwerf', boardExpectation: 'Avoid relegation', morale: 47, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of derdeKlasseAClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseA_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 3e Klasse B
  const derdeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.level === 'Derde Klasse B');
  if (derdeKlasseB_ZondagWest1) {
    const derdeKlasseBClubs_ZondagWest1 = [
      { name: 'BVC Bloemendaal', city: 'Bloemendaal', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Bergen', city: 'Bergen', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Assendelft', city: 'Assendelft', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RKVV Saenden', city: 'Wormerveer', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV ROAC', city: 'Rijpwetering', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV De Meteoor', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'AVV Swift', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Tos Actief', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sporting Krommenie', city: 'Krommenie', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SC Hercules Zaandam', city: 'Zaandam', boardExpectation: 'Mid-table finish', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Alliance '22", city: 'Haarlem', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "WSV '30", city: 'Wormer', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'DSS', city: 'Haarlem', boardExpectation: 'Avoid relegation', morale: 48, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of derdeKlasseBClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseB_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 4e Klasse A
  const vierdeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.level === 'Vierde Klasse A');
  if (vierdeKlasseA_ZondagWest1) {
    const vierdeKlasseAClubs_ZondagWest1 = [
      { name: 'Alkmaarsche Boys', city: 'Alkmaar', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Alcmaria Victrix', city: 'Alkmaar', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Winkel', city: 'Winkel', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Texel 94", city: 'Den Burg', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Hugo Boys', city: 'Heerhugowaard', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Hollandia T', city: 'Tuitjenhorn', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Con Zelo', city: 'Waarland', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV De Koog', city: 'De Koog', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'KSV Heerhugowaard', city: 'Heerhugowaard', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Succes', city: 'Hippolytushoef', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Duinrand S', city: 'Schoorl', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Oudesluis', city: 'Oudesluis', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of vierdeKlasseAClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseA_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 4e Klasse B
  const vierdeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.level === 'Vierde Klasse B');
  if (vierdeKlasseB_ZondagWest1) {
    const vierdeKlasseBClubs_ZondagWest1 = [
      { name: 'SV De Rijp', city: 'De Rijp', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Ilpendam', city: 'Ilpendam', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Victoria O', city: 'Obdam', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "SC Spirit 30", city: 'Oudkarspel', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SEW', city: 'Nibbixwoud', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RKEDO', city: 'De Goorn', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Woudia', city: 'Westwoud', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SC Dynamo', city: 'Ursem', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Strandvogels', city: 'Onderdijk', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV ALC', city: 'Sint Pancras', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Kwiek 78", city: 'Avenhorn', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV MOC', city: 'Midwoud', boardExpectation: 'Avoid relegation', morale: 49, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of vierdeKlasseBClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseB_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 4e Klasse C
  const vierdeKlasseC_ZondagWest1 = zondagLeagues.find(l => l.level === 'Vierde Klasse C');
  if (vierdeKlasseC_ZondagWest1) {
    const vierdeKlasseCClubs_ZondagWest1 = [
      { name: 'SV Rood-Wit Zaanstad', city: 'Zaandam', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RCZ', city: 'Zaandam', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV DIOS', city: 'Nieuw-Vennep', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV BSM', city: 'Maarssen', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'HOV/DJSCR', city: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'COAL', city: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Eendracht 82", city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'AVV TOG', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Nieuw-West United', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'PVC', city: 'Utrecht', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "VV CTO 70", city: 'Duivendrecht', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of vierdeKlasseCClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseC_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 5e Klasse A
  const vijfdeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.level === 'Vijfde Klasse A');
  if (vijfdeKlasseA_ZondagWest1) {
    const vijfdeKlasseAClubs_ZondagWest1 = [
      { name: 'VV Callantsoog', city: 'Callantsoog', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Geel Zwart 30", city: 't Zand', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Petten', city: 'Petten', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Nieuwe Niedorp', city: 'Nieuwe Niedorp', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Vesdo', city: 'Schagerbrug', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VZV', city: 't Veld', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Zeemacht', city: 'Den Helder', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Wieringerwaard', city: 'Wieringerwaard', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'AGSV', city: 'Aartswoud', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sint Boys', city: 'Sint Maarten', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Kaagvogels', city: 'Kolhorn', boardExpectation: 'Avoid relegation', morale: 50, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of vijfdeKlasseAClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseA_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 5e Klasse B
  const vijfdeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.level === 'Vijfde Klasse B');
  if (vijfdeKlasseB_ZondagWest1) {
    const vijfdeKlasseBClubs_ZondagWest1 = [
      { name: 'HSV Sport 1889', city: 'Hoorn', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV KGB', city: 'Bovenkarspel', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Oosthuizen', city: 'Oosthuizen', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'RKVV Zwaagdijk', city: 'Zwaagdijk', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Berkhout', city: 'Berkhout', boardExpectation: 'Play-off spot', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "Apollo 68", city: 'Hensbroek', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV DESS', city: 'Andijk', boardExpectation: 'Mid-table finish', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Hauwert 65', city: 'Hauwert', boardExpectation: 'Mid-table finish', morale: 53, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SSV', city: 'Stompetoren', boardExpectation: 'Mid-table finish', morale: 52, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV WBSV', city: 'Westbeemster', boardExpectation: 'Avoid relegation', morale: 51, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of vijfdeKlasseBClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseB_ZondagWest1.id,
        },
      });
    }
  }

  // Zondag West 1 5e Klasse C
  const vijfdeKlasseC_ZondagWest1 = zondagLeagues.find(l => l.level === 'Vijfde Klasse C');
  if (vijfdeKlasseC_ZondagWest1) {
    const vijfdeKlasseCClubs_ZondagWest1 = [
      { name: 'ZVV Zaandijk', city: 'Zaandijk', boardExpectation: 'Promotion', morale: 60, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'HFC Heemstede', city: 'Heemstede', boardExpectation: 'Promotion', morale: 59, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'SV Rivierwijkers', city: 'Utrecht', boardExpectation: 'Play-off spot', morale: 58, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'OSC (A)', city: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 57, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'VV Kismet', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 56, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: "SV Geel Wit 20", city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 55, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
      { name: 'Sloterdijk AVV', city: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 54, form: '', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4',  },
    ];
    for (const clubData of vijfdeKlasseCClubs_ZondagWest1) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseC_ZondagWest1.id,
        },
      });
    }
  }
} 