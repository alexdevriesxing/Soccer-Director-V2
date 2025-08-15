import { PrismaClient } from '@prisma/client';

export async function seedZondagWest1(prisma: PrismaClient, zondagLeagues: any[]) {
  // Zondag West 1 2e Klasse A
  const tweedeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.division === 'Tweede Klasse A');
  if (tweedeKlasseA_ZondagWest1) {
    const tweedeKlasseAClubs_ZondagWest1 = [
      { name: 'JVC', homeCity: 'Julianadorp', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'FC Uitgeest', homeCity: 'Uitgeest', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Egmond', homeCity: 'Egmond aan den Hoef', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Westfriezen', homeCity: 'Zwaag', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Limmen', homeCity: 'Limmen', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'LSVV', homeCity: 'Lisse', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'KFC', homeCity: 'Koog aan de Zaan', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SVA', homeCity: 'Assendelft', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Always Forward', homeCity: 'Hoorn', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'DSOV', homeCity: 'Vijfhuizen', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'IVV', homeCity: 'Landsmeer', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Fortuna Wormerveer', homeCity: 'Wormerveer', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Meervogels 31", homeCity: 'Akersloot', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Flevo', homeCity: 'Middenmeer', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 47, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const tweedeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.division === 'Tweede Klasse B');
  if (tweedeKlasseB_ZondagWest1) {
    const tweedeKlasseBClubs_ZondagWest1 = [
      { name: 'SV TOP', homeCity: 'Oss', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV De Meer', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RSV Antibarbari', homeCity: 'Rotterdam', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Nieuwkuijk', homeCity: 'Nieuwkuijk', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Zwaluw VFC', homeCity: 'Vught', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "RKSV RODA 23", homeCity: 'Amstelveen', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RKSV DCG', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SDO', homeCity: 'Bussum', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'FC Abcoude', homeCity: 'Abcoude', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Beuningse Boys', homeCity: 'Beuningen', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'WV-HEDW', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Leones', homeCity: 'Beneden-Leeuwen', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SC Woezik', homeCity: 'Wijchen', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const derdeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.division === 'Derde Klasse A');
  if (derdeKlasseA_ZondagWest1) {
    const derdeKlasseAClubs_ZondagWest1 = [
      { name: 'ZAP', homeCity: 'Breezand', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Schagen United', homeCity: 'Schagen', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'FC Den Helder', homeCity: 'Den Helder', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV DWB', homeCity: 'Aartswoud', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "VVS 46", homeCity: 'Spanbroek', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Grasshoppers', homeCity: 'Hoogwoud', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'De Valken', homeCity: 'Hem', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Spartanen', homeCity: 'Wognum', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RKSV Sint George', homeCity: 'Spierdijk', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 's.v. Enkhuizen', homeCity: 'Enkhuizen', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Kleine Sluis', homeCity: 'Anna Paulowna', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Dirkshorn', homeCity: 'Dirkshorn', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VVW', homeCity: 'Wervershoof', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'DWOW', homeCity: 'Wieringerwerf', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 47, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const derdeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.division === 'Derde Klasse B');
  if (derdeKlasseB_ZondagWest1) {
    const derdeKlasseBClubs_ZondagWest1 = [
      { name: 'BVC Bloemendaal', homeCity: 'Bloemendaal', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Bergen', homeCity: 'Bergen', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Assendelft', homeCity: 'Assendelft', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RKVV Saenden', homeCity: 'Wormerveer', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV ROAC', homeCity: 'Rijpwetering', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV De Meteoor', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'AVV Swift', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Tos Actief', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sporting Krommenie', homeCity: 'Krommenie', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SC Hercules Zaandam', homeCity: 'Zaandam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Alliance '22", homeCity: 'Haarlem', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "WSV '30", homeCity: 'Wormer', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'DSS', homeCity: 'Haarlem', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 48, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const vierdeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.division === 'Vierde Klasse A');
  if (vierdeKlasseA_ZondagWest1) {
    const vierdeKlasseAClubs_ZondagWest1 = [
      { name: 'Alkmaarsche Boys', homeCity: 'Alkmaar', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Alcmaria Victrix', homeCity: 'Alkmaar', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Winkel', homeCity: 'Winkel', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Texel 94", homeCity: 'Den Burg', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Hugo Boys', homeCity: 'Heerhugowaard', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Hollandia T', homeCity: 'Tuitjenhorn', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Con Zelo', homeCity: 'Waarland', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV De Koog', homeCity: 'De Koog', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'KSV Heerhugowaard', homeCity: 'Heerhugowaard', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Succes', homeCity: 'Hippolytushoef', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Duinrand S', homeCity: 'Schoorl', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Oudesluis', homeCity: 'Oudesluis', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const vierdeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.division === 'Vierde Klasse B');
  if (vierdeKlasseB_ZondagWest1) {
    const vierdeKlasseBClubs_ZondagWest1 = [
      { name: 'SV De Rijp', homeCity: 'De Rijp', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Ilpendam', homeCity: 'Ilpendam', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Victoria O', homeCity: 'Obdam', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "SC Spirit 30", homeCity: 'Oudkarspel', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SEW', homeCity: 'Nibbixwoud', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RKEDO', homeCity: 'De Goorn', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Woudia', homeCity: 'Westwoud', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SC Dynamo', homeCity: 'Ursem', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Strandvogels', homeCity: 'Onderdijk', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV ALC', homeCity: 'Sint Pancras', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Kwiek 78", homeCity: 'Avenhorn', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV MOC', homeCity: 'Midwoud', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 49, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const vierdeKlasseC_ZondagWest1 = zondagLeagues.find(l => l.division === 'Vierde Klasse C');
  if (vierdeKlasseC_ZondagWest1) {
    const vierdeKlasseCClubs_ZondagWest1 = [
      { name: 'SV Rood-Wit Zaanstad', homeCity: 'Zaandam', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RCZ', homeCity: 'Zaandam', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV DIOS', homeCity: 'Nieuw-Vennep', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV BSM', homeCity: 'Maarssen', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'HOV/DJSCR', homeCity: 'Rotterdam', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'COAL', homeCity: 'Rotterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Eendracht 82", homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'AVV TOG', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Nieuw-West United', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'PVC', homeCity: 'Utrecht', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "VV CTO 70", homeCity: 'Duivendrecht', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const vijfdeKlasseA_ZondagWest1 = zondagLeagues.find(l => l.division === 'Vijfde Klasse A');
  if (vijfdeKlasseA_ZondagWest1) {
    const vijfdeKlasseAClubs_ZondagWest1 = [
      { name: 'VV Callantsoog', homeCity: 'Callantsoog', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Geel Zwart 30", homeCity: 't Zand', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Petten', homeCity: 'Petten', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Nieuwe Niedorp', homeCity: 'Nieuwe Niedorp', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Vesdo', homeCity: 'Schagerbrug', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VZV', homeCity: 't Veld', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Zeemacht', homeCity: 'Den Helder', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Wieringerwaard', homeCity: 'Wieringerwaard', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'AGSV', homeCity: 'Aartswoud', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sint Boys', homeCity: 'Sint Maarten', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Kaagvogels', homeCity: 'Kolhorn', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 50, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const vijfdeKlasseB_ZondagWest1 = zondagLeagues.find(l => l.division === 'Vijfde Klasse B');
  if (vijfdeKlasseB_ZondagWest1) {
    const vijfdeKlasseBClubs_ZondagWest1 = [
      { name: 'HSV Sport 1889', homeCity: 'Hoorn', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV KGB', homeCity: 'Bovenkarspel', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Oosthuizen', homeCity: 'Oosthuizen', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'RKVV Zwaagdijk', homeCity: 'Zwaagdijk', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Berkhout', homeCity: 'Berkhout', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "Apollo 68", homeCity: 'Hensbroek', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV DESS', homeCity: 'Andijk', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Hauwert 65', homeCity: 'Hauwert', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 53, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SSV', homeCity: 'Stompetoren', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 52, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV WBSV', homeCity: 'Westbeemster', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 51, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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
  const vijfdeKlasseC_ZondagWest1 = zondagLeagues.find(l => l.division === 'Vijfde Klasse C');
  if (vijfdeKlasseC_ZondagWest1) {
    const vijfdeKlasseCClubs_ZondagWest1 = [
      { name: 'ZVV Zaandijk', homeCity: 'Zaandijk', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 60, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'HFC Heemstede', homeCity: 'Heemstede', regionTag: 'Zondag West 1', boardExpectation: 'Promotion', morale: 59, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'SV Rivierwijkers', homeCity: 'Utrecht', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 58, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'OSC (A)', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Play-off spot', morale: 57, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'VV Kismet', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 56, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: "SV Geel Wit 20", homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Mid-table finish', morale: 55, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
      { name: 'Sloterdijk AVV', homeCity: 'Amsterdam', regionTag: 'Zondag West 1', boardExpectation: 'Avoid relegation', morale: 54, form: '', homeKitShirt: '#ff6b6b', homeKitShorts: '#cc5555', homeKitSocks: '#ff6b6b', awayKitShirt: '#4ecdc4', awayKitShorts: '#3da89e', awayKitSocks: '#4ecdc4' },
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