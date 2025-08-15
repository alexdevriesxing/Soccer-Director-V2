import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order to avoid FK constraint errors
  await prisma.gateReceipt.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.staffContract.deleteMany();
  await prisma.clubFinances.deleteMany();
  await prisma.tVRights.deleteMany();
  await prisma.trainingFocus.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.player.deleteMany();
  await prisma.clubFormation.deleteMany();
  await prisma.clubStrategy.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.club.deleteMany();
  await prisma.league.deleteMany();

  // Seed professional leagues (national)
  const eredivisie = await prisma.league.create({
    data: {
      name: 'Eredivisie',
      tier: 'EREDIVISIE',
      season: '2024-2025',
    },
  });

  const eersteDivisie = await prisma.league.create({
    data: {
      name: 'Eerste Divisie',
      tier: 'EERSTE_DIVISIE',
      season: '2024-2025',
    },
  });

  const tweedeDivisie = await prisma.league.create({
    data: {
      name: 'Tweede Divisie',
      tier: 'TWEEDE_DIVISIE',
      season: '2024-2025',
    },
  });

  const derdeDivisie = await prisma.league.create({
    data: {
      name: 'Derde Divisie',
      tier: 'DERDE_DIVISIE',
      season: '2024-2025',
    },
  });

  const vierdeDivisie = await prisma.league.create({
    data: {
      name: 'Vierde Divisie',
      tier: 'VIERDE_DIVISIE',
      season: '2024-2025',
    },
  });

  // Seed regional amateur leagues - Zaterdag (Saturday) divisions
  const zaterdagRegions = ['Noord', 'Oost', 'Zuid'];
  const zondagRegions = ['Noord', 'Oost', 'West 1', 'West 2', 'Zuid 1', 'Zuid 2'];
  const amateurDivisions = ['Eerste Klasse', 'Tweede Klasse', 'Derde Klasse', 'Vierde Klasse'];

  const zaterdagLeagues: any[] = [];
  const zondagLeagues: any[] = [];

  // Create Zaterdag leagues
  for (const region of zaterdagRegions) {
    for (const division of amateurDivisions) {
      const league = await prisma.league.create({
        data: {
          name: `Zaterdag ${region} ${division}`,
          tier: 'AMATEUR',
          region: `Zaterdag ${region}`,
          division: division,
          season: '2024-2025',
        },
      });
      zaterdagLeagues.push(league);
    }
  }

  // Create special 5e klasse leagues for Zaterdag Noord (A through G)
  const vijfdeKlasseGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  for (const group of vijfdeKlasseGroups) {
    const league = await prisma.league.create({
      data: {
        name: `Zaterdag Noord 5e Klasse ${group}`,
        tier: 'AMATEUR',
        region: 'Zaterdag Noord',
        division: `Vijfde Klasse ${group}`,
        season: '2024-2025',
      },
    });
    zaterdagLeagues.push(league);
  }

  // Create special 5e klasse leagues for Zondag Noord (A through D)
  const zondagNoordVijfdeKlasseGroups = ['A', 'B', 'C', 'D'];
  for (const group of zondagNoordVijfdeKlasseGroups) {
    const league = await prisma.league.create({
      data: {
        name: `Zondag Noord 5e Klasse ${group}`,
        tier: 'AMATEUR',
        region: 'Zondag Noord',
        division: `Vijfde Klasse ${group}`,
        season: '2024-2025',
      },
    });
    zondagLeagues.push(league);
  }

  // Create Zondag leagues
  for (const region of zondagRegions) {
    for (const division of amateurDivisions) {
      const league = await prisma.league.create({
        data: {
          name: `Zondag ${region} ${division}`,
          tier: 'AMATEUR',
          region: `Zondag ${region}`,
          division: division,
          season: '2024-2025',
        },
      });
      zondagLeagues.push(league);
    }
  }

  // Seed Eredivisie clubs
  const eredivisieClubs = [
    { name: 'AFC Ajax', homeCity: 'Amsterdam', boardExpectation: 'Win the league', morale: 85, form: 'WWWDL', regionTag: 'West 1' },
    { name: 'PSV Eindhoven', homeCity: 'Eindhoven', boardExpectation: 'Challenge for the title', morale: 82, form: 'WWWWD', regionTag: 'Zuid' },
    { name: 'Feyenoord', homeCity: 'Rotterdam', boardExpectation: 'Qualify for Europe', morale: 80, form: 'WDLWW', regionTag: 'West 2' },
    { name: 'AZ Alkmaar', homeCity: 'Alkmaar', boardExpectation: 'Top 6 finish', morale: 78, form: 'DLWWW', regionTag: 'West 1' },
    { name: 'FC Twente', homeCity: 'Enschede', boardExpectation: 'Top 8 finish', morale: 75, form: 'LWWDL', regionTag: 'Oost' },
    { name: 'SC Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 72, form: 'DLWWD', regionTag: 'Noord' },
    { name: 'FC Utrecht', homeCity: 'Utrecht', boardExpectation: 'Top 10 finish', morale: 70, form: 'WDLWL', regionTag: 'West 1' },
    { name: 'Vitesse', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 65, form: 'LDLWW', regionTag: 'Oost' },
    { name: 'Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 68, form: 'WLDLW', regionTag: 'West 2' },
    { name: 'Heracles Almelo', homeCity: 'Almelo', boardExpectation: 'Avoid relegation', morale: 65, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'PEC Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 67, form: 'LWDLL', regionTag: 'Oost' },
    { name: 'NEC Nijmegen', homeCity: 'Nijmegen', boardExpectation: 'Avoid relegation', morale: 66, form: 'DLWDL', regionTag: 'Oost' },
    { name: 'Go Ahead Eagles', homeCity: 'Deventer', boardExpectation: 'Avoid relegation', morale: 64, form: 'LDLWL', regionTag: 'Oost' },
    { name: 'Fortuna Sittard', homeCity: 'Sittard', boardExpectation: 'Avoid relegation', morale: 63, form: 'LLDWL', regionTag: 'Zuid' },
    { name: 'RKC Waalwijk', homeCity: 'Waalwijk', boardExpectation: 'Avoid relegation', morale: 62, form: 'DLWLL', regionTag: 'Zuid' },
    { name: 'FC Volendam', homeCity: 'Volendam', boardExpectation: 'Avoid relegation', morale: 60, form: 'LLDLL', regionTag: 'West 1' },
    { name: 'Excelsior', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 61, form: 'LDLWL', regionTag: 'West 2' },
    { name: 'Almere City FC', homeCity: 'Almere', boardExpectation: 'Avoid relegation', morale: 58, form: 'LLDLL', regionTag: 'West 1' }
  ];

  const createdEredivisieClubs: any[] = [];
  for (const clubData of eredivisieClubs) {
    const club = await prisma.club.create({
      data: {
        ...clubData,
        leagueId: eredivisie.id,
      },
    });
    createdEredivisieClubs.push(club);
  }

  // Seed Eerste Divisie clubs (national level)
  const eersteDivisieClubs = [
    { name: 'Willem II', homeCity: 'Tilburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD', regionTag: 'Zuid' },
    { name: 'FC Groningen', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 82, form: 'WWWDL', regionTag: 'Noord' },
    { name: 'Roda JC', homeCity: 'Kerkrade', boardExpectation: 'Play-off spot', morale: 78, form: 'WWDLW', regionTag: 'Zuid' },
    { name: 'NAC Breda', homeCity: 'Breda', boardExpectation: 'Play-off spot', morale: 76, form: 'WDLWW', regionTag: 'Zuid' },
    { name: 'FC Emmen', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 74, form: 'DLWWW', regionTag: 'Noord' },
    { name: 'Helmond Sport', homeCity: 'Helmond', boardExpectation: 'Mid-table finish', morale: 70, form: 'LWWDL', regionTag: 'Zuid' },
    { name: 'MVV Maastricht', homeCity: 'Maastricht', boardExpectation: 'Mid-table finish', morale: 68, form: 'DLWWD', regionTag: 'Zuid' },
    { name: 'FC Den Bosch', homeCity: 'Den Bosch', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW', regionTag: 'Zuid' },
    { name: 'FC Dordrecht', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 64, form: 'LWWDL', regionTag: 'West 2' },
    { name: 'Jong Ajax', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWLL', regionTag: 'West 1' },
    { name: 'Jong PSV', homeCity: 'Eindhoven', boardExpectation: 'Mid-table finish', morale: 60, form: 'LLDWL', regionTag: 'Zuid' },
    { name: 'Jong AZ', homeCity: 'Alkmaar', boardExpectation: 'Mid-table finish', morale: 58, form: 'LDLWL', regionTag: 'West 1' },
    { name: 'Jong FC Utrecht', homeCity: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'LLDLL', regionTag: 'West 1' },
    { name: 'Jong Feyenoord', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL', regionTag: 'West 2' },
    { name: 'Jong Vitesse', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 52, form: 'LDLWL', regionTag: 'Oost' },
    { name: 'Jong Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDLL', regionTag: 'West 2' },
    { name: 'Jong FC Twente', homeCity: 'Enschede', boardExpectation: 'Avoid relegation', morale: 48, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'Jong SC Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL', regionTag: 'Noord' },
    { name: 'Jong PEC Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL', regionTag: 'Oost' }
  ];

  for (const clubData of eersteDivisieClubs) {
    await prisma.club.create({
      data: {
        ...clubData,
        leagueId: eersteDivisie.id,
      },
    });
  }

  // Seed Zaterdag Noord clubs with real data
  const zaterdagNoordLeagues = zaterdagLeagues.filter(l => l.region === 'Zaterdag Noord');

  // 1e klasse H
  const eersteKlasseH = zaterdagNoordLeagues.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasseH) {
    const eersteKlasseHClubs = [
      { name: 'Be Quick 1887', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'Blauw Wit \'34', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'Broekster Boys', homeCity: 'Broeksterwoude', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'VV Buitenpost', homeCity: 'Buitenpost', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'Drachtster Boys', homeCity: 'Drachten', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'Heerenveense Boys', homeCity: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: 'Oranje Nassau G.', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'PKC \'83', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'VV Rolder Boys', homeCity: 'Rolde', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'SC Stiens', homeCity: 'Stiens', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: 'Velocitas 1897', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'VV Winsum', homeCity: 'Winsum', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
      { name: 'WVV 1896', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
    ];

    for (const clubData of eersteKlasseHClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasseH.id,
        },
      });
    }
  }

  // 2e klasse I
  const tweedeKlasseI = zaterdagNoordLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseI) {
    const tweedeKlasseIClubs = [
      { name: 'Achilles 1894', homeCity: 'Assen', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'Be Quick \'28', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'SV Bedum', homeCity: 'Bedum', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'VV Gorecht', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'SV Gramsbergen', homeCity: 'Gramsbergen', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'VV Grijpskerk', homeCity: 'Grijpskerk', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'VV Helpman', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'VV Hoogezand', homeCity: 'Hoogezand', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'LTC', homeCity: 'Assen', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'FC Meppel', homeCity: 'Meppel', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'S.V. Nieuwleusen', homeCity: 'Nieuwleusen', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'VV Noordscheschut', homeCity: 'Noordscheschut', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'VEV \'67', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: 'WVF', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
    ];

    for (const clubData of tweedeKlasseIClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseI.id,
        },
      });
    }
  }

  // 2e klasse J
  const tweedeKlasseJ = zaterdagNoordLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseJ) {
    const tweedeKlasseJClubs = [
      { name: 'VV Balk', homeCity: 'Balk', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'FC Burgum', homeCity: 'Burgum', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'SC Bolsward', homeCity: 'Bolsward', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'FVC', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'GAVC', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'VV Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'LAC Frisia 1883', homeCity: 'Leeuwarden', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'SC Leovardia', homeCity: 'Leeuwarden', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'SV Marum', homeCity: 'Marum', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'Surhústerfean FC', homeCity: 'Surhuisterveen', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'Sneek Wit Zwart', homeCity: 'Sneek', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'FC Wolvega', homeCity: 'Wolvega', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'ZMVV Zeerobben', homeCity: 'Zeerobben', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];

    for (const clubData of tweedeKlasseJClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseJ.id,
        },
      });
    }
  }

  // 3e klasse P
  const derdeKlasseP = zaterdagNoordLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseP) {
    const derdeKlassePClubs = [
      { name: 'AVC', homeCity: 'Friesland', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'SC Berlikum', homeCity: 'Berlikum', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'CVVO', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Dronrijp', homeCity: 'Dronrijp', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'DWP', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'SC Joure', homeCity: 'Joure', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'Leeuwarder Zwaluwen', homeCity: 'Leeuwarden', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Minnertsga', homeCity: 'Minnertsga', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Nijland', homeCity: 'Nijland', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'QVC', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Sint Annaparochie', homeCity: 'Sint Annaparochie', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VVI', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Workum', homeCity: 'Workum', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];

    for (const clubData of derdeKlassePClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseP.id,
        },
      });
    }
  }

  // 3e klasse Q
  const derdeKlasseQ = zaterdagNoordLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseQ) {
    const derdeKlasseQClubs = [
      { name: 'Be Quick Dokkum', homeCity: 'Dokkum', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Drachten', homeCity: 'Drachten', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Eastermar', homeCity: 'Eastermar', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Hardegarijp', homeCity: 'Hardegarijp', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'VV Kollum', homeCity: 'Kollum', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'SC Kootstertille', homeCity: 'Kootstertille', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Noordbergum', homeCity: 'Noordbergum', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'ONR', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'SV Oosterwolde', homeCity: 'Oosterwolde', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Opende', homeCity: 'Opende', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Rijperkerk', homeCity: 'Rijperkerk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'RWF', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'SC Twijzel', homeCity: 'Twijzel', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'VV Zuidhorn', homeCity: 'Zuidhorn', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];

    for (const clubData of derdeKlasseQClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseQ.id,
        },
      });
    }
  }

  // 3e klasse R
  const derdeKlasseR = zaterdagNoordLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseR) {
    const derdeKlasseRClubs = [
      { name: 'Aduard 2000', homeCity: 'Aduard', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'Be Quick 1887', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'SV Borger', homeCity: 'Borger', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'DVC Appingedam', homeCity: 'Appingedam', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'Groen-Geel', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Groningen', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'HS \'88', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'The Knickerbockers', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'FC Lewenborg', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'SC Loppersum', homeCity: 'Loppersum', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'Lycurgus', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VV Veendam 1894', homeCity: 'Veendam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Wildervank', homeCity: 'Wildervank', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'FC Zuidlaren', homeCity: 'Zuidlaren', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];

    for (const clubData of derdeKlasseRClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseR.id,
        },
      });
    }
  }

  // 4e klasse A
  const vierdeKlasseA = zaterdagNoordLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseA) {
    const vierdeKlasseAClubs = [
      { name: 'VV Creil-Bant', homeCity: 'Creil', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Delfstrahuizen', homeCity: 'Delfstrahuizen', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'DESZ', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'SV Ens', homeCity: 'Ens', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Heeg', homeCity: 'Heeg', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'HJSC', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Nagele', homeCity: 'Nagele', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Olympia \'28', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Oudehaske', homeCity: 'Oudehaske', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Sleat', homeCity: 'Sleat', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'SVN\'69', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'FC Ulu Spor', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'VHK', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseAClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseA.id,
        },
      });
    }
  }

  // 4e klasse B
  const vierdeKlasseB = zaterdagNoordLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseB) {
    const vierdeKlasseBClubs = [
      { name: 'SF Deinum', homeCity: 'Deinum', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV DTD', homeCity: 'Friesland', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Foarút', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'SC Franeker', homeCity: 'Franeker', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'IJVC', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Irnsum', homeCity: 'Irnsum', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Makkum', homeCity: 'Makkum', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Marrum', homeCity: 'Marrum', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'MKV\'29', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Scharnegoutum \'70', homeCity: 'Scharnegoutum', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'SDS', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SSS \'68', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'VV Waterpoort Boys', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'Wykels Hallum', homeCity: 'Hallum', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseBClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseB.id,
        },
      });
    }
  }

  // 4e klasse C
  const vierdeKlasseC = zaterdagNoordLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseC) {
    const vierdeKlasseCClubs = [
      { name: 'VV Anjum', homeCity: 'Anjum', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'FC Birdaard', homeCity: 'Birdaard', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Dokkum', homeCity: 'Dokkum', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Drogeham', homeCity: 'Drogeham', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'Friese Boys', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Harkema-Opeinde', homeCity: 'Harkema-Opeinde', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'SC Lions \'66', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'ONT', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Rottevalle', homeCity: 'Rottevalle', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VC Trynwâlden', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'V en V \'68', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SC Veenwouden', homeCity: 'Veenwouden', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'VIOD', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'VV Zwaagwesteinde', homeCity: 'Zwaagwesteinde', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseCClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseC.id,
        },
      });
    }
  }

  // 4e klasse D
  const vierdeKlasseD = zaterdagNoordLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseD) {
    const vierdeKlasseDClubs = [
      { name: 'VV Bakkeveen', homeCity: 'Bakkeveen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'SC Boornbergum \'80', homeCity: 'Boornbergum', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'FC Grootegast', homeCity: 'Grootegast', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'SV Haulerwijk', homeCity: 'Haulerwijk', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'HFC\'15', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Niekerk', homeCity: 'Niekerk', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'ODV', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV ONB', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Stânfries', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'TLC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Veenhuizen', homeCity: 'Veenhuizen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'VV Waskemeer', homeCity: 'Waskemeer', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'VV Westerkwartier', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'SV De Wilper Boys', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseDClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseD.id,
        },
      });
    }
  }

  // 4e klasse E
  const vierdeKlasseE = zaterdagNoordLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseE) {
    const vierdeKlasseEClubs = [
      { name: 'Corenos', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Haren', homeCity: 'Haren', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'de Heracliden', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Holwierde', homeCity: 'Holwierde', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'Mamio', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Middelstum', homeCity: 'Middelstum', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'NEC Delfzijl', homeCity: 'Delfzijl', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Noordwolde', homeCity: 'Noordwolde', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'Omlandia', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Poolster', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV SGV', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'WVV', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'ZEC', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'ZNC', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseEClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseE.id,
        },
      });
    }
  }

  // 4e klasse F
  const vierdeKlasseF = zaterdagNoordLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseF) {
    const vierdeKlasseFClubs = [
      { name: 'FC Assen', homeCity: 'Assen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Bargeres', homeCity: 'Bargeres', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'CEC', homeCity: 'Drenthe', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'CSVC', homeCity: 'Drenthe', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'Damacota', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'SC Elim', homeCity: 'Elim', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'Fit Boys', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Hollandscheveld', homeCity: 'Hollandscheveld', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'FC Klazienaveen', homeCity: 'Klazienaveen', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'Onstwedder Boys', homeCity: 'Onstwedde', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'SCN', homeCity: 'Drenthe', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SJS', homeCity: 'Drenthe', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'SVBO', homeCity: 'Drenthe', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'VCG', homeCity: 'Drenthe', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseFClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseF.id,
        },
      });
    }
  }

  // Seed Tweede Divisie clubs (national level)
  const tweedeDivisieClubs = [
    { name: 'Quick Boys', homeCity: 'Katwijk', boardExpectation: 'Championship', morale: 85, form: 'WWWWD', regionTag: 'West 2' },
    { name: 'Rijnsburgse Boys', homeCity: 'Rijnsburg', boardExpectation: 'Promotion', morale: 80, form: 'WWWDL', regionTag: 'West 2' },
    { name: 'AFC', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 75, form: 'WWDLW', regionTag: 'West 1' },
    { name: 'VV Katwijk', homeCity: 'Katwijk', boardExpectation: 'Play-off spot', morale: 72, form: 'WDLWW', regionTag: 'West 2' },
    { name: 'SV Spakenburg', homeCity: 'Spakenburg', boardExpectation: 'Mid-table finish', morale: 70, form: 'DLWWW', regionTag: 'West 1' },
    { name: 'Jong Almere City', homeCity: 'Almere', boardExpectation: 'Mid-table finish', morale: 68, form: 'LWWDL', regionTag: 'West 1' },
    { name: 'GVVV', homeCity: 'Veenendaal', boardExpectation: 'Mid-table finish', morale: 66, form: 'DLWWD', regionTag: 'West 1' },
    { name: 'Koninklijke HFC', homeCity: 'Haarlem', boardExpectation: 'Mid-table finish', morale: 64, form: 'WWDLW', regionTag: 'West 1' },
    { name: 'BVV Barendrecht', homeCity: 'Barendrecht', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL', regionTag: 'West 2' },
    { name: 'De Treffers', homeCity: 'Groesbeek', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'HHC Hardenberg', homeCity: 'Hardenberg', boardExpectation: 'Avoid relegation', morale: 58, form: 'LLDWL', regionTag: 'Oost' },
    { name: 'ACV', homeCity: 'Assen', boardExpectation: 'Avoid relegation', morale: 56, form: 'LDLWL', regionTag: 'Noord' },
    { name: 'RKAV Volendam', homeCity: 'Volendam', boardExpectation: 'Avoid relegation', morale: 54, form: 'LLDLL', regionTag: 'West 1' },
    { name: 'Excelsior Maassluis', homeCity: 'Maassluis', boardExpectation: 'Avoid relegation', morale: 52, form: 'DLWLL', regionTag: 'West 2' },
    { name: 'VV Noordwijk', homeCity: 'Noordwijk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL', regionTag: 'West 2' },
    { name: 'Jong Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL', regionTag: 'West 2' },
    { name: 'SVV Scheveningen', homeCity: 'Scheveningen', boardExpectation: 'Avoid relegation', morale: 45, form: 'DLWLL', regionTag: 'West 2' },
    { name: 'ADO \'20', homeCity: 'Heemskerk', boardExpectation: 'Avoid relegation', morale: 42, form: 'LDLWL', regionTag: 'West 1' }
  ];

  for (const clubData of tweedeDivisieClubs) {
    await prisma.club.create({
      data: {
        ...clubData,
        leagueId: tweedeDivisie.id,
      },
    });
  }

  // Seed Derde Divisie clubs (national level)
  const derdeDivisieClubs = [
    { name: 'VV IJsselmeervogels', homeCity: 'Spakenburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD', regionTag: 'West 1' },
    { name: 'Harkemase Boys', homeCity: 'Harkema', boardExpectation: 'Play-off spot', morale: 78, form: 'WWWDL', regionTag: 'Noord' },
    { name: 'Sportlust \'46', homeCity: 'Woerden', boardExpectation: 'Play-off spot', morale: 76, form: 'WWDLW', regionTag: 'West 1' },
    { name: 'DVS \'33 Ermelo', homeCity: 'Ermelo', boardExpectation: 'Play-off spot', morale: 74, form: 'WDLWW', regionTag: 'Oost' },
    { name: 'Sparta Nijkerk', homeCity: 'Nijkerk', boardExpectation: 'Mid-table finish', morale: 70, form: 'DLWWW', regionTag: 'Oost' },
    { name: 'USV Hercules', homeCity: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 68, form: 'LWWDL', regionTag: 'West 1' },
    { name: 'DOVO', homeCity: 'Veenendaal', boardExpectation: 'Play-off spot', morale: 72, form: 'DLWWD', regionTag: 'West 1' },
    { name: 'SC Genemuiden', homeCity: 'Genemuiden', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW', regionTag: 'Oost' },
    { name: 'SV Urk', homeCity: 'Urk', boardExpectation: 'Mid-table finish', morale: 64, form: 'LWWDL', regionTag: 'Oost' },
    { name: 'VV Eemdijk', homeCity: 'Bunschoten', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWD', regionTag: 'Oost' },
    { name: 'TEC', homeCity: 'Tiel', boardExpectation: 'Mid-table finish', morale: 60, form: 'WWDLW', regionTag: 'Oost' },
    { name: 'Rohda Raalte', homeCity: 'Raalte', boardExpectation: 'Avoid relegation', morale: 58, form: 'LWWDL', regionTag: 'Oost' },
    { name: 'HSC \'21', homeCity: 'Haaksbergen', boardExpectation: 'Avoid relegation', morale: 56, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'SV Huizen', homeCity: 'Huizen', boardExpectation: 'Avoid relegation', morale: 54, form: 'LLDWL', regionTag: 'West 1' },
    { name: 'Excelsior \'31', homeCity: 'Rijssen', boardExpectation: 'Avoid relegation', morale: 52, form: 'LDLWL', regionTag: 'Oost' },
    { name: 'Ajax (amateurs)', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDLL', regionTag: 'West 1' },
    { name: 'RKVV DEM', homeCity: 'Deventer', boardExpectation: 'Avoid relegation', morale: 48, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'HBC', homeCity: 'Heemstede', boardExpectation: 'Avoid relegation', morale: 45, form: 'LDLWL', regionTag: 'West 1' },
  ];

  for (const clubData of derdeDivisieClubs) {
    await prisma.club.create({
      data: {
        ...clubData,
        leagueId: derdeDivisie.id,
      },
    });
  }

  // Seed Vierde Divisie clubs (national level)
  const vierdeDivisieClubs = [
    { name: 'VV Scherpenzeel 3a', homeCity: 'Scherpenzeel', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD', regionTag: 'Oost' },
    { name: 'JOS Watergraafsmeer 2', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 78, form: 'WWWDL', regionTag: 'West 1' },
    { name: 'SV Kampong 1b', homeCity: 'Utrecht', boardExpectation: 'Play-off spot', morale: 72, form: 'WWDLW', regionTag: 'West 1' },
    { name: 'SJC 3b', homeCity: 'Noordwijk', boardExpectation: 'Play-off spot', morale: 70, form: 'WDLWW', regionTag: 'West 2' },
    { name: 'VV Hoogland', homeCity: 'Hoogland', boardExpectation: 'Mid-table finish', morale: 68, form: 'DLWWW', regionTag: 'West 1' },
    { name: 'AFC \'34', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 66, form: 'LWWDL', regionTag: 'West 1' },
    { name: 'HVV Hollandia', homeCity: 'Hoorn', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWD', regionTag: 'West 1' },
    { name: 'AVV Swift', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'WWDLW', regionTag: 'West 1' },
    { name: 'SDV Barneveld', homeCity: 'Barneveld', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL', regionTag: 'Oost' },
    { name: 'VPV Purmersteijn', homeCity: 'Purmerend', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWLL', regionTag: 'West 1' },
    { name: 'ODIN \'59', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 56, form: 'LLDWL', regionTag: 'West 1' },
    { name: 'DVVA', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 54, form: 'LDLWL', regionTag: 'West 1' },
    { name: 'VVOG 1a', homeCity: 'Harderwijk', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDLL', regionTag: 'Oost' },
    { name: 'Ter Leede', homeCity: 'Sassenheim', boardExpectation: 'Avoid relegation', morale: 50, form: 'DLWLL', regionTag: 'West 2' },
    { name: 'VV Kolping Boys', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL', regionTag: 'West 1' },
    { name: 'HSV De Zuidvogels', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDLL', regionTag: 'West 1' },
  ];

  for (const clubData of vierdeDivisieClubs) {
    await prisma.club.create({
      data: {
        ...clubData,
        leagueId: vierdeDivisie.id,
      },
    });
  }

  // Get all clubs for financial seeding
  const allClubs = await prisma.club.findMany();

  // Seed club finances for all clubs
  for (const club of allClubs) {
    // Determine financial tier based on league
    let balance, transferBudget, wageBudget, sponsorshipTotal;

    if (club.leagueId === eredivisie.id) {
      balance = 20000000 + Math.random() * 80000000; // €20M-100M
      transferBudget = 10000000 + Math.random() * 40000000; // €10M-50M
      wageBudget = 30000000 + Math.random() * 70000000; // €30M-100M
      sponsorshipTotal = 5000000 + Math.random() * 15000000; // €5M-20M
    } else if (club.leagueId === eersteDivisie.id) {
      balance = 5000000 + Math.random() * 15000000; // €5M-20M
      transferBudget = 2000000 + Math.random() * 8000000; // €2M-10M
      wageBudget = 8000000 + Math.random() * 22000000; // €8M-30M
      sponsorshipTotal = 1000000 + Math.random() * 4000000; // €1M-5M
    } else if (club.leagueId === tweedeDivisie.id) {
      balance = 1000000 + Math.random() * 4000000; // €1M-5M
      transferBudget = 500000 + Math.random() * 1500000; // €500K-2M
      wageBudget = 2000000 + Math.random() * 5000000; // €2M-7M
      sponsorshipTotal = 200000 + Math.random() * 800000; // €200K-1M
    } else if (club.leagueId === derdeDivisie.id || club.leagueId === vierdeDivisie.id) {
      balance = 500000 + Math.random() * 1500000; // €500K-2M
      transferBudget = 200000 + Math.random() * 500000; // €200K-700K
      wageBudget = 1000000 + Math.random() * 2000000; // €1M-3M
      sponsorshipTotal = 100000 + Math.random() * 300000; // €100K-400K
    } else {
      // Amateur clubs
      balance = 50000 + Math.random() * 200000; // €50K-250K
      transferBudget = 10000 + Math.random() * 50000; // €10K-60K
      wageBudget = 100000 + Math.random() * 300000; // €100K-400K
      sponsorshipTotal = 5000 + Math.random() * 20000; // €5K-25K
    }

    await prisma.clubFinances.create({
      data: {
        clubId: club.id,
        balance: Math.floor(balance),
        season: '2024-2025',
        week: 1,
        gateReceiptsTotal: 0,
        sponsorshipTotal: Math.floor(sponsorshipTotal),
        tvRightsTotal: 0,
        prizeMoneyTotal: 0,
        transferIncome: 0,
        playerWagesTotal: 0,
        staffWagesTotal: 0,
        transferExpenses: 0,
        facilityCosts: 0,
        maintenanceCosts: 0,
        transferBudget: Math.floor(transferBudget),
        wageBudget: Math.floor(wageBudget),
      }
    });
  }

  // Seed formations and strategies for all clubs
  const formations = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2', '4-1-4-1'];
  const styles = ['possession', 'attacking', 'defensive', 'balanced', 'counter', 'direct'];
  const approaches = ['possession', 'pressing', 'counter', 'direct', 'balanced'];

  for (const club of allClubs) {
    const formation = formations[Math.floor(Math.random() * formations.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const approach = approaches[Math.floor(Math.random() * approaches.length)];

    await prisma.clubFormation.create({
      data: {
        clubId: club.id,
        formation,
        style,
        intensity: 60 + Math.floor(Math.random() * 30),
        width: 50 + Math.floor(Math.random() * 40),
        tempo: 50 + Math.floor(Math.random() * 40)
      }
    });

    await prisma.clubStrategy.create({
      data: {
        clubId: club.id,
        approach,
        defensiveStyle: ['high_line', 'mid_block', 'low_block'][Math.floor(Math.random() * 3)],
        attackingStyle: ['build_up', 'direct', 'wing_play', 'central'][Math.floor(Math.random() * 4)],
        setPieces: ['mixed', 'short', 'long'][Math.floor(Math.random() * 3)],
        marking: ['zonal', 'man', 'mixed'][Math.floor(Math.random() * 3)]
      }
    });
  }

  // 5e klasse A
  const vijfdeKlasseA = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse A');
  if (vijfdeKlasseA) {
    const vijfdeKlasseAClubs = [
      { name: 'VV Arum', homeCity: 'Arum', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'RKVV Bakhuizen', homeCity: 'Bakhuizen', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'SV Hielpen', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'LSC 1890', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'SV Mulier', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'VV Nieuweschoot', homeCity: 'Nieuweschoot', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'NOK', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'SV Oeverzwaluwen', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'TOP \'63', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'UDIROS', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'SV de Wâlde', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'VV Woudsend', homeCity: 'Woudsend', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
    ];

    for (const clubData of vijfdeKlasseAClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseA.id,
        },
      });
    }
  }

  // 5e klasse B
  const vijfdeKlasseB = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse B');
  if (vijfdeKlasseB) {
    const vijfdeKlasseBClubs = [
      { name: 'VV Beetgum', homeCity: 'Beetgum', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'VV Blija', homeCity: 'Blija', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'CVO', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'VV Holwerd', homeCity: 'Holwerd', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'VV de Lauwers', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'VV Oostergo', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'VV Ouwe Syl', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'Ropta Boys', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'VV Ternaard', homeCity: 'Ternaard', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'VCR', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'VV de Wâlden', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'VV Wardy', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
      { name: 'WTOC', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
    ];

    for (const clubData of vijfdeKlasseBClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseB.id,
        },
      });
    }
  }

  // 5e klasse C
  const vijfdeKlasseC = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse C');
  if (vijfdeKlasseC) {
    const vijfdeKlasseCClubs = [
      { name: 'ASC \'75', homeCity: 'Friesland', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'VV Blue Boys', homeCity: 'Friesland', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'SV Donkerbroek', homeCity: 'Donkerbroek', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'GSVV', homeCity: 'Friesland', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'SV Houtigehage', homeCity: 'Houtigehage', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'VV Jistrum', homeCity: 'Jistrum', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'VV Suameer', homeCity: 'Suameer', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'SV Suawoude', homeCity: 'Suawoude', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'VV De Sweach', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'TFS', homeCity: 'Friesland', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'VVT', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'WWS', homeCity: 'Friesland', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
    ];

    for (const clubData of vijfdeKlasseCClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseC.id,
        },
      });
    }
  }

  // 5e klasse D
  const vijfdeKlasseD = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse D');
  if (vijfdeKlasseD) {
    const vijfdeKlasseDClubs = [
      { name: 'VV Eenrum', homeCity: 'Eenrum', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'VV Ezinge', homeCity: 'Ezinge', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'De Fivel', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'VV Kloosterburen', homeCity: 'Kloosterburen', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'VV KRC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'LEO', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'Noordpool UFC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'OKVC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'Rood Zwart Baflo', homeCity: 'Baflo', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'SIOS', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'VV Stedum', homeCity: 'Stedum', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'VVSV \'09', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
      { name: 'VV Warffum', homeCity: 'Warffum', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
      { name: 'VV Zeester', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 39, form: 'DLWLL' },
    ];

    for (const clubData of vijfdeKlasseDClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseD.id,
        },
      });
    }
  }

  // 5e klasse E
  const vijfdeKlasseE = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse E');
  if (vijfdeKlasseE) {
    const vijfdeKlasseEClubs = [
      { name: 'Amicitia VMC', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'Asser Boys', homeCity: 'Assen', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'Blauw Geel \'15', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'BSVV', homeCity: 'Bovensmilde', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'GEO', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'VV Glimmen', homeCity: 'Glimmen', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'GRC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'VV Gruno', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'TEO', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'VV Nieuw Roden', homeCity: 'Nieuw Roden', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'Oosterparkers', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'SV Tynaarlo', homeCity: 'Tynaarlo', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
      { name: 'VAKO', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
      { name: 'VVK', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 39, form: 'DLWLL' },
    ];

    for (const clubData of vijfdeKlasseEClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseE.id,
        },
      });
    }
  }

  // 5e klasse F
  const vijfdeKlasseF = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse F');
  if (vijfdeKlasseF) {
    const vijfdeKlasseFClubs = [
      { name: 'SC Angelslo', homeCity: 'Emmen', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'Bato', homeCity: 'Drenthe', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'VV Emmen', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'VV Harkstede', homeCity: 'Harkstede', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'HSC', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'VV Meeden', homeCity: 'Meeden', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'SV Mussel', homeCity: 'Mussel', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'NWVV', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'SC Scheemda', homeCity: 'Scheemda', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'SETA', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'VVS Oostwold', homeCity: 'Oostwold', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'Wagenborger Boys', homeCity: 'Wagenborgen', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
      { name: 'VV Westerlee', homeCity: 'Westerlee', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
    ];

    for (const clubData of vijfdeKlasseFClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseF.id,
        },
      });
    }
  }

  // 5e klasse G
  const vijfdeKlasseG = zaterdagNoordLeagues.find(l => l.division === 'Vijfde Klasse G');
  if (vijfdeKlasseG) {
    const vijfdeKlasseGClubs = [
      { name: 'VV Beilen', homeCity: 'Beilen', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
      { name: 'SV Blokzijl', homeCity: 'Blokzijl', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
      { name: 'SC Espel', homeCity: 'Espel', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
      { name: 'SV Nieuw Balinge', homeCity: 'Nieuw Balinge', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
      { name: 'NKVV', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
      { name: 'RKO', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
      { name: 'VV Steenwijker Boys', homeCity: 'Steenwijk', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
      { name: 'SVBS \'77', homeCity: 'Drenthe', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
      { name: 'VV Tiendeveen', homeCity: 'Tiendeveen', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
      { name: 'VV Tollebeek', homeCity: 'Tollebeek', boardExpectation: 'Mid-table finish', morale: 47, form: 'DLWLL' },
      { name: 'TONEGO', homeCity: 'Drenthe', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
      { name: 'VVAK', homeCity: 'Drenthe', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
      { name: 'FC Amboina', homeCity: 'Assen', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
      { name: 'SVDB', homeCity: 'Ekehaar', boardExpectation: 'Avoid relegation', morale: 39, form: 'DLWLL' },
    ];

    for (const clubData of vijfdeKlasseGClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseG.id,
        },
      });
    }
  }

  console.log('Database seeded successfully with Dutch regional league structure!');
  console.log(`Created ${createdEredivisieClubs.length} Eredivisie clubs`);
  console.log(`Created ${zaterdagLeagues.length} Zaterdag regional leagues`);
  console.log(`Created ${zondagLeagues.length} Zondag regional leagues`);
  console.log(`Created ${tweedeDivisieClubs.length} Tweede Divisie clubs`);
  console.log(`Created ${derdeDivisieClubs.length} Derde Divisie clubs`);
  console.log(`Created ${vierdeDivisieClubs.length} Vierde Divisie clubs`);
  console.log(`Created ${allClubs.length} total clubs`);

  // Seed Zaterdag Oost clubs with real data
  const zaterdagOostLeagues = zaterdagLeagues.filter(l => l.region === 'Zaterdag Oost');

  // 1e klasse
  const eersteKlasse_Oost = zaterdagOostLeagues.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasse_Oost) {
    const eersteKlasseClubs_Oost = [
      { name: "Achilles '12", homeCity: 'Hengelo', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'DOS Kampen', homeCity: 'Kampen', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'asv Dronten', homeCity: 'Dronten', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'DZOH', homeCity: 'Dronten', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'SV Epe', homeCity: 'Epe', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'Go-Ahead Kampen', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: 'VV Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'Hulzense Boys', homeCity: 'Hulzen', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'KHC', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'VV Noordscheschut', homeCity: 'Noordscheschut', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: "Quick '20", homeCity: 'Oldenzaal', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'SVI', homeCity: 'Steenwijk', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
      { name: 'SVZW', homeCity: 'Wierden', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
      { name: 'WHC', homeCity: 'Wezep', boardExpectation: 'Avoid relegation', morale: 45, form: 'DLWLL' },
    ];
    for (const clubData of eersteKlasseClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasse_Oost.id,
        },
      });
    }
  }

  // 2e klasse
  const tweedeKlasse_Oost = zaterdagOostLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasse_Oost) {
    const tweedeKlasseClubs_Oost = [
      { name: 'AGOVV', homeCity: 'Apeldoorn', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: "SV Batavia '90", homeCity: 'Lelystad', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: "Be Quick '28", homeCity: 'Zutphen', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'DESZ', homeCity: 'Zutphen', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'SV Hatto Heim', homeCity: 'Hattem', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'VV Hierden', homeCity: 'Hierden', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'FC Horst', homeCity: 'Horst', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'IJVV', homeCity: 'IJsselmuiden', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'OWIOS', homeCity: 'Oldenzaal', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'Unicum', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: "VSCO '61", homeCity: 'Vriezenveen', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'WVF', homeCity: 'Wierden', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'ZAC', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];
    for (const clubData of tweedeKlasseClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasse_Oost.id,
        },
      });
    }
  }

  // 2e klasse J
  const tweedeKlasseJ_Oost = zaterdagOostLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseJ_Oost) {
    const tweedeKlasseJClubs_Oost = [
      { name: 'VV Den Ham', homeCity: '', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: "DOS '37", homeCity: '', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'SC Elim', homeCity: '', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'Enter Vooruit', homeCity: '', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'SV Gramsbergen', homeCity: '', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'FC Meppel', homeCity: '', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'S.V. Nieuwleusen', homeCity: '', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'Oranje Nassau A.', homeCity: '', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'PH Almelo', homeCity: '', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'Sparta Enschede', homeCity: '', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'HVV Tubantia', homeCity: '', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'Vroomshoopse Boys', homeCity: '', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'RKSV De Zweef', homeCity: '', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];
    for (const clubData of tweedeKlasseJClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseJ_Oost.id,
        },
      });
    }
  }

  // 3e klasse A
  const derdeKlasseA_Oost = zaterdagOostLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseA_Oost) {
    const derdeKlasseAClubs_Oost = [
      { name: 'VV Den Ham', homeCity: 'Den Ham', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: "DOS '37", homeCity: 'Kampen', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'SC Elim', homeCity: 'Elim', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'Enter Vooruit', homeCity: 'Enter', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'SV Gramsbergen', homeCity: 'Gramsbergen', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'FC Meppel', homeCity: 'Meppel', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'S.V. Nieuwleusen', homeCity: 'Nieuwleusen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'Oranje Nassau A.', homeCity: 'Almelo', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'PH Almelo', homeCity: 'Almelo', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'Sparta Enschede', homeCity: 'Enschede', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'HVV Tubantia', homeCity: 'Hengelo', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'Vroomshoopse Boys', homeCity: 'Vroomshoop', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'RKSV De Zweef', homeCity: 'Hengelo', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];
    for (const clubData of derdeKlasseAClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseA_Oost.id,
        },
      });
    }
  }

  // 3e klasse B
  const derdeKlasseB_Oost = zaterdagOostLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseB_Oost) {
    const derdeKlasseBClubs_Oost = [
      { name: "DSV '61", homeCity: 'Dronten', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: "EFC '58", homeCity: 'Epe', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Elspeet', homeCity: 'Elspeet', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'ESC', homeCity: 'Epe', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'SC Hoevelaken', homeCity: 'Hoevelaken', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'KVVA', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: "SV Lelystad '67", homeCity: 'Lelystad', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: "Swift '64", homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Terschuurse Boys', homeCity: 'Terschuur', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VVOP', homeCity: 'Oldenzaal', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Zeewolde', homeCity: 'Zeewolde', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: "Zwart Wit '63", homeCity: 'Kampen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
    ];
    for (const clubData of derdeKlasseBClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseB_Oost.id,
        },
      });
    }
  }

  // 3e klasse C
  const derdeKlasseC_Oost = zaterdagOostLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseC_Oost) {
    const derdeKlasseCClubs_Oost = [
      { name: "ASC '62", homeCity: 'Assen', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Avereest', homeCity: 'Avereest', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'Dieze West', homeCity: 'Zwolle', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'DVC Dedemsvaart', homeCity: 'Dedemsvaart', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: "VV Hardenberg '85", homeCity: 'Hardenberg', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Hattem', homeCity: 'Hattem', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Heerde', homeCity: 'Heerde', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'SC Lutten', homeCity: 'Lutten', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: "Olympia '28", homeCity: 'Hengelo', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'FC Ommen', homeCity: 'Ommen', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'SC Rouveen', homeCity: 'Rouveen', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VHK', homeCity: 'Hengelo', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'Zwolsche Boys', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];
    for (const clubData of derdeKlasseCClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseC_Oost.id,
        },
      });
    }
  }

  // 3e klasse D
  const derdeKlasseD_Oost = zaterdagOostLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseD_Oost) {
    const derdeKlasseDClubs_Oost = [
      { name: "ATC '65", homeCity: 'Almelo', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Bergentheim', homeCity: 'Bergentheim', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Bruchterveld', homeCity: 'Bruchterveld', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Daarlerveen', homeCity: 'Daarlerveen', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'DES', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'ZVV De Esch', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Hellendoorn', homeCity: 'Hellendoorn', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: "Juventa '12", homeCity: 'Hengelo', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Kloosterhaar', homeCity: 'Kloosterhaar', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Mariënberg', homeCity: 'Mariënberg', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'vv Rigtersbleek', homeCity: 'Enschede', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'SVVN', homeCity: 'Vriezenveen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'SV Wilhelminaschool', homeCity: 'Enschede', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];
    for (const clubData of derdeKlasseDClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseD_Oost.id,
        },
      });
    }
  }

  // 3e klasse E
  const derdeKlasseE_Oost = zaterdagOostLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseE_Oost) {
    const derdeKlasseEClubs_Oost = [
      { name: "AVW '66", homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'Be Quick Z.', homeCity: 'Zutphen', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'SC Brummen', homeCity: 'Brummen', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'DVOV', homeCity: 'Deventer', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'SP Eefde', homeCity: 'Eefde', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'Eerbeekse Boys', homeCity: 'Eerbeek', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Oeken', homeCity: 'Oeken', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Oene', homeCity: 'Oene', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'SP Teuge', homeCity: 'Teuge', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'Sv Twello', homeCity: 'Twello', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VIOS Vaassen', homeCity: 'Vaassen', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'FC Zutphen', homeCity: 'Zutphen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: "ZZC '20", homeCity: 'Zutphen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];
    for (const clubData of derdeKlasseEClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseE_Oost.id,
        },
      });
    }
  }

  // 4e klasse A
  const vierdeKlasseA_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseA_Oost) {
    const vierdeKlasseAClubs_Oost = [
      { name: 'VV Alverna', homeCity: 'Alverna', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'AWC', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'Beuningse Boys', homeCity: 'Beuningen', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: "BVC '12", homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'Elistha', homeCity: 'Elst', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'Kolping-Dynamo', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'SV Leones', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'CSV Oranje Blauw', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'Quick 1888', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'De Treffers', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'SC Valburg', homeCity: 'Valburg', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SC Woezik', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseAClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseA_Oost.id,
        },
      });
    }
  }

  // 4e klasse B
  const vierdeKlasseB_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseB_Oost) {
    const vierdeKlasseBClubs_Oost = [
      { name: 'VV Arnhemia', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'Arnhemse Boys', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'SV DFS', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Dodewaard', homeCity: 'Dodewaard', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'Excelsior Z.', homeCity: 'Zetten', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Kesteren', homeCity: 'Kesteren', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'FC Lienden', homeCity: 'Lienden', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'SV de Paasberg', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'SDOO', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'SVHA', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Uchta', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'ASV Zuid Arnhem', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseBClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseB_Oost.id,
        },
      });
    }
  }

  // 4e klasse C
  const vierdeKlasseC_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseC_Oost) {
    const vierdeKlasseCClubs_Oost = [
      { name: 'VV Barneveld', homeCity: 'Barneveld', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'CHRC', homeCity: 'Ede', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Ede/Victoria', homeCity: 'Ede', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'KSV Fortissimo', homeCity: 'Ede', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'GVC', homeCity: 'Ede', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'SV Harskamp', homeCity: 'Harskamp', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'CVV Redichem', homeCity: 'Ede', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: "Rood-Wit '58", homeCity: 'Ede', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: "SDS '55", homeCity: 'Ede', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Stroe', homeCity: 'Stroe', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'WVV Wageningen', homeCity: 'Wageningen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SV Wodanseck', homeCity: 'Ede', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseCClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseC_Oost.id,
        },
      });
    }
  }

  // 4e klasse D
  const vierdeKlasseD_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseD_Oost) {
    const vierdeKlasseDClubs_Oost = [
      { name: 'Apeldoornse Boys', homeCity: 'Apeldoorn', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'BAS', homeCity: 'Apeldoorn', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: "EZC '84", homeCity: 'Epe', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: "SV 't Harde", homeCity: "'t Harde", boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Hulshorst', homeCity: 'Hulshorst', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'Noord Veluwse Boys', homeCity: 'Apeldoorn', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'SV Prins Bernhard', homeCity: 'Apeldoorn', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'SEH', homeCity: 'Epe', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV De Veluwse Boys', homeCity: 'Apeldoorn', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VEVO', homeCity: 'Epe', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'WZC Wapenveld', homeCity: 'Wapenveld', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: "ZVV '56", homeCity: 'Apeldoorn', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseDClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseD_Oost.id,
        },
      });
    }
  }

  // 4e klasse E
  const vierdeKlasseE_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseE_Oost) {
    const vierdeKlasseEClubs_Oost = [
      { name: 'Alcides', homeCity: 'Kampen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: "CSV '28", homeCity: 'Kampen', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: "VV 's-Heerenbroek", homeCity: "'s-Heerenbroek", boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'HTC', homeCity: 'Kampen', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Kampen', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'MSC', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'Reaal Dronten', homeCity: 'Dronten', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'FC Ulu Spor', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VSW', homeCity: 'Kampen', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Wijthmen', homeCity: 'Wijthmen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Wilsum', homeCity: 'Wilsum', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SV Zalk', homeCity: 'Zalk', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseEClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseE_Oost.id,
        },
      });
    }
  }

  // 4e klasse F
  const vierdeKlasseF_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseF_Oost) {
    const vierdeKlasseFClubs_Oost = [
      { name: "ASV '57", homeCity: 'Almelo', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'BZSV de Blauwwitters', homeCity: 'Almelo', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'RKSV Bornerbroek', homeCity: 'Bornerbroek', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'SP Daarle', homeCity: 'Daarle', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'AVC Heracles', homeCity: 'Almelo', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'SC Lemele', homeCity: 'Lemele', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'SV Mariënheem', homeCity: 'Mariënheem', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: "MVV '69", homeCity: 'Almelo', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'Sportclub Rijssen', homeCity: 'Rijssen', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'SV Rijssen', homeCity: 'Rijssen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: "SVV '56", homeCity: 'Almelo', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'Voorwaarts V', homeCity: 'Almelo', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseFClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseF_Oost.id,
        },
      });
    }
  }

  // 4e klasse G
  const vierdeKlasseG_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseG_Oost) {
    const vierdeKlasseGClubs_Oost = [
      { name: 'cvv Achilles', homeCity: 'Enschede', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'FC Aramea', homeCity: 'Enschede', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'FC Berghuizen', homeCity: 'Enschede', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Drienerlo', homeCity: 'Enschede', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'GVV Eilermark', homeCity: 'Enschede', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'EMOS', homeCity: 'Enschede', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'SC Enschede', homeCity: 'Enschede', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: "SV Juliana '32", homeCity: 'Enschede', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'SV Losser', homeCity: 'Losser', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'PW 1885', homeCity: 'Enschede', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'Sportlust Glanerbrug', homeCity: 'Glanerbrug', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: "SVV '91", homeCity: 'Enschede', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseGClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseG_Oost.id,
        },
      });
    }
  }

  // 4e klasse H
  const vierdeKlasseH_Oost = zaterdagOostLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseH_Oost) {
    const vierdeKlasseHClubs_Oost = [
      { name: 'SV Almen', homeCity: 'Almen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: "Blauw Wit '66", homeCity: 'Deventer', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'Sportclub Deventer', homeCity: 'Deventer', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'EGVV', homeCity: 'Deventer', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'GFC', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'SV Harfsen', homeCity: 'Harfsen', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'SV Helios', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: "HSC '21", homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'Koninklijke UD', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'FC RDC', homeCity: 'Deventer', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Terborg', homeCity: 'Terborg', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'FC Winterswijk', homeCity: 'Winterswijk', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseHClubs_Oost) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseH_Oost.id,
        },
      });
    }
  }

  // Create Zaterdag West 1 leagues
  const zaterdagWest1Leagues = [];
  for (let i = 1; i <= 5; i++) {
    const division = i === 1 ? 'Eerste Klasse' : 
                    i === 2 ? 'Tweede Klasse' : 
                    i === 3 ? 'Derde Klasse' : 
                    i === 4 ? 'Vierde Klasse' : 'Vijfde Klasse';
    
    const league = await prisma.league.create({
      data: {
        name: `Zaterdag West 1 ${division}`,
        region: 'Zaterdag West 1',
        division: division,
        tier: `Level ${i + 3}`, // Eerste Klasse = level 4, etc.
        season: '2024/2025',
      },
    });
    zaterdagWest1Leagues.push(league);
  }

  // Add Zaterdag West 1 clubs
  const zaterdagWest1LeaguesFiltered = zaterdagLeagues.filter(l => l.region === 'Zaterdag West 1');

  // 1e klasse A
  const eersteKlasseA_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasseA_West) {
    const eersteKlasseAClubs_West = [
      { name: 'SV Argon', homeCity: 'Mijdrecht', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'FC De Bilt', homeCity: 'De Bilt', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'CSV BOL', homeCity: 'Bussum', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'HBOK', homeCity: 'Hoorn', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'VV De Meern', homeCity: 'De Meern', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'VV Monnickendam', homeCity: 'Monnickendam', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: "MSV '19", homeCity: 'Maassluis', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'NSC Nijkerk', homeCity: 'Nijkerk', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'VV Nunspeet', homeCity: 'Nunspeet', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'GC & FC Olympia', homeCity: 'Haarlem', boardExpectation: 'Mid-table finish', morale: 55, form: 'DLWLL' },
      { name: "RODA '46", homeCity: 'Krommenie', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: 'SDC Putten', homeCity: 'Putten', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'ZOB', homeCity: 'Zaandam', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
      { name: 'HSV De Zuidvogels', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
    ];
    for (const clubData of eersteKlasseAClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasseA_West.id,
        },
      });
    }
  }

  // 2e klasse A
  const tweedeKlasseA_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseA_West) {
    const tweedeKlasseAClubs_West = [
      { name: 'AFC', homeCity: 'Amsterdam', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'AMVJ', homeCity: 'Amsterdam', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'ASV Arsenal', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'DVVA', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'DWS', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'EVC', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'CSV Jong Holland', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'Koninklijke HFC', homeCity: 'Haarlem', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'SV Marken', homeCity: 'Marken', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'OSV', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'FC Weesp', homeCity: 'Weesp', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'SV Zandvoort', homeCity: 'Zandvoort', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: "Zwaluwen '30", homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];
    for (const clubData of tweedeKlasseAClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseA_West.id,
        },
      });
    }
  }

  // 2e klasse B
  const tweedeKlasseB_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseB_West) {
    const tweedeKlasseBClubs_West = [
      { name: 'VV Benschop', homeCity: 'Benschop', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'BFC', homeCity: 'Breukelen', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'FC Breukelen', homeCity: 'Breukelen', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'SC Buitenboys', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'CSW', homeCity: 'Woerden', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'DESTO', homeCity: 'Woerden', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'EDO', homeCity: 'Woerden', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'SV Geinoord', homeCity: 'Nieuwegein', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'SV Loosdrecht', homeCity: 'Loosdrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VV Maarssen', homeCity: 'Maarssen', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'PVCV Vleuten', homeCity: 'Vleuten', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'HC & FC Victoria', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'ASC Waterwijk', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];
    for (const clubData of tweedeKlasseBClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseB_West.id,
        },
      });
    }
  }

  // 2e klasse C
  const tweedeKlasseC_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseC_West) {
    const tweedeKlasseCClubs_West = [
      { name: 'CDW', homeCity: 'Woerden', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'CJVV', homeCity: 'Woerden', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: "FC Delta Sports '95", homeCity: 'Woerden', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'VV Dieren', homeCity: 'Dieren', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'VV Jonathan', homeCity: 'Woerden', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'VV Lunteren', homeCity: 'Lunteren', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: "De Merino's", homeCity: 'Woerden', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'ASC Nieuwland', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'SV Otterlo', homeCity: 'Otterlo', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: "OVC '85", homeCity: 'Otterlo', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'SV de Valleivogels', homeCity: 'Woerden', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'Veensche Boys', homeCity: 'Woerden', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'VRC', homeCity: 'Woerden', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: 'VV Woudenberg', homeCity: 'Woudenberg', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
    ];
    for (const clubData of tweedeKlasseCClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseC_West.id,
        },
      });
    }
  }

  // 3e klasse A
  const derdeKlasseA_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseA_West) {
    const derdeKlasseAClubs_West = [
      { name: 'VV Aalsmeer', homeCity: 'Aalsmeer', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Alphen', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Bodegraven', homeCity: 'Bodegraven', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Boskoop', homeCity: 'Boskoop', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'VV Gouda', homeCity: 'Gouda', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Hazerswoude', homeCity: 'Hazerswoude', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Reeuwijk', homeCity: 'Reeuwijk', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Rijnsburg', homeCity: 'Rijnsburg', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Sassenheim', homeCity: 'Sassenheim', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Ter Aar', homeCity: 'Ter Aar', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Waddinxveen', homeCity: 'Waddinxveen', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VV Zoeterwoude', homeCity: 'Zoeterwoude', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
    ];
    for (const clubData of derdeKlasseAClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseA_West.id,
        },
      });
    }
  }

  // 3e klasse B
  const derdeKlasseB_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseB_West) {
    const derdeKlasseBClubs_West = [
      { name: 'VV Abcoude', homeCity: 'Abcoude', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Amstelveen', homeCity: 'Amstelveen', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Amsterdam', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Badhoevedorp', homeCity: 'Badhoevedorp', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'VV Diemen', homeCity: 'Diemen', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Duivendrecht', homeCity: 'Duivendrecht', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Hilversum', homeCity: 'Hilversum', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Laren', homeCity: 'Laren', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Muiden', homeCity: 'Muiden', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Naarden', homeCity: 'Naarden', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Ouderkerk', homeCity: 'Ouderkerk aan de Amstel', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VV Weesp', homeCity: 'Weesp', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
    ];
    for (const clubData of derdeKlasseBClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseB_West.id,
        },
      });
    }
  }

  // 3e klasse C
  const derdeKlasseC_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseC_West) {
    const derdeKlasseCClubs_West = [
      { name: 'VV Alkmaar', homeCity: 'Alkmaar', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Beverwijk', homeCity: 'Beverwijk', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Castricum', homeCity: 'Castricum', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Egmond', homeCity: 'Egmond aan Zee', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'VV Heemskerk', homeCity: 'Heemskerk', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Heiloo', homeCity: 'Heiloo', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Limmen', homeCity: 'Limmen', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Schagen', homeCity: 'Schagen', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Uitgeest', homeCity: 'Uitgeest', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Velsen', homeCity: 'Velsen', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Wervershoof', homeCity: 'Wervershoof', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VV Zaandam', homeCity: 'Zaandam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
    ];
    for (const clubData of derdeKlasseCClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseC_West.id,
        },
      });
    }
  }

  // 3e klasse D
  const derdeKlasseD_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseD_West) {
    const derdeKlasseDClubs_West = [
      { name: 'VV Amstelveen', homeCity: 'Amstelveen', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Amsterdam', homeCity: 'Amsterdam', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Badhoevedorp', homeCity: 'Badhoevedorp', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Diemen', homeCity: 'Diemen', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'VV Duivendrecht', homeCity: 'Duivendrecht', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Hilversum', homeCity: 'Hilversum', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Laren', homeCity: 'Laren', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Muiden', homeCity: 'Muiden', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Naarden', homeCity: 'Naarden', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Ouderkerk', homeCity: 'Ouderkerk aan de Amstel', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Weesp', homeCity: 'Weesp', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VV Zaandam', homeCity: 'Zaandam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
    ];
    for (const clubData of derdeKlasseDClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseD_West.id,
        },
      });
    }
  }

  // 4e klasse A
  const vierdeKlasseA_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseA_West) {
    const vierdeKlasseAClubs_West = [
      { name: 'VV Aalsmeer', homeCity: 'Aalsmeer', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Alphen', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Bodegraven', homeCity: 'Bodegraven', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Boskoop', homeCity: 'Boskoop', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Gouda', homeCity: 'Gouda', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Hazerswoude', homeCity: 'Hazerswoude', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Reeuwijk', homeCity: 'Reeuwijk', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Rijnsburg', homeCity: 'Rijnsburg', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Sassenheim', homeCity: 'Sassenheim', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Ter Aar', homeCity: 'Ter Aar', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Waddinxveen', homeCity: 'Waddinxveen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'VV Zoeterwoude', homeCity: 'Zoeterwoude', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseAClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseA_West.id,
        },
      });
    }
  }

  // 4e klasse B
  const vierdeKlasseB_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseB_West) {
    const vierdeKlasseBClubs_West = [
      { name: 'VV Abcoude', homeCity: 'Abcoude', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Amstelveen', homeCity: 'Amstelveen', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Amsterdam', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Badhoevedorp', homeCity: 'Badhoevedorp', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Diemen', homeCity: 'Diemen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Duivendrecht', homeCity: 'Duivendrecht', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Hilversum', homeCity: 'Hilversum', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Laren', homeCity: 'Laren', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Muiden', homeCity: 'Muiden', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Naarden', homeCity: 'Naarden', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Ouderkerk', homeCity: 'Ouderkerk aan de Amstel', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'VV Weesp', homeCity: 'Weesp', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseBClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseB_West.id,
        },
      });
    }
  }

  // 4e klasse C
  const vierdeKlasseC_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseC_West) {
    const vierdeKlasseCClubs_West = [
      { name: 'VV Alkmaar', homeCity: 'Alkmaar', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Beverwijk', homeCity: 'Beverwijk', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Castricum', homeCity: 'Castricum', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Egmond', homeCity: 'Egmond aan Zee', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Heemskerk', homeCity: 'Heemskerk', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Heiloo', homeCity: 'Heiloo', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Limmen', homeCity: 'Limmen', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Schagen', homeCity: 'Schagen', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Uitgeest', homeCity: 'Uitgeest', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Velsen', homeCity: 'Velsen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Wervershoof', homeCity: 'Wervershoof', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'VV Zaandam', homeCity: 'Zaandam', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseCClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseC_West.id,
        },
      });
    }
  }

  // 4e klasse D
  const vierdeKlasseD_West = zaterdagWest1LeaguesFiltered.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseD_West) {
    const vierdeKlasseDClubs_West = [
      { name: 'VV Amstelveen', homeCity: 'Amstelveen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Amsterdam', homeCity: 'Amsterdam', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Badhoevedorp', homeCity: 'Badhoevedorp', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'VV Diemen', homeCity: 'Diemen', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Duivendrecht', homeCity: 'Duivendrecht', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Hilversum', homeCity: 'Hilversum', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Laren', homeCity: 'Laren', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Muiden', homeCity: 'Muiden', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Naarden', homeCity: 'Naarden', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Ouderkerk', homeCity: 'Ouderkerk aan de Amstel', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Weesp', homeCity: 'Weesp', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'VV Zaandam', homeCity: 'Zaandam', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];
    for (const clubData of vierdeKlasseDClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseD_West.id,
        },
      });
    }
  }

  // 5e klasse A
  const vijfdeKlasseA_West = zaterdagWest1Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseA_West) {
    const vijfdeKlasseAClubs_West = [
      { name: 'VV Aalsmeer', homeCity: 'Aalsmeer', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'VV Alphen', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'VV Bodegraven', homeCity: 'Bodegraven', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'VV Boskoop', homeCity: 'Boskoop', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'VV Gouda', homeCity: 'Gouda', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: 'VV Hazerswoude', homeCity: 'Hazerswoude', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VV Reeuwijk', homeCity: 'Reeuwijk', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: 'VV Rijnsburg', homeCity: 'Rijnsburg', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'VV Sassenheim', homeCity: 'Sassenheim', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: 'VV Ter Aar', homeCity: 'Ter Aar', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'VV Waddinxveen', homeCity: 'Waddinxveen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'VV Zoeterwoude', homeCity: 'Zoeterwoude', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
    ];
    for (const clubData of vijfdeKlasseAClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseA_West.id,
        },
      });
    }
  }

  // 5e klasse B
  const vijfdeKlasseB_West = zaterdagWest1Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseB_West) {
    const vijfdeKlasseBClubs_West = [
      { name: 'VV Abcoude', homeCity: 'Abcoude', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'VV Amstelveen', homeCity: 'Amstelveen', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'VV Amsterdam', homeCity: 'Amsterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'VV Badhoevedorp', homeCity: 'Badhoevedorp', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'VV Diemen', homeCity: 'Diemen', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: 'VV Duivendrecht', homeCity: 'Duivendrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VV Hilversum', homeCity: 'Hilversum', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: 'VV Laren', homeCity: 'Laren', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'VV Muiden', homeCity: 'Muiden', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: 'VV Naarden', homeCity: 'Naarden', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'VV Ouderkerk', homeCity: 'Ouderkerk aan de Amstel', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'VV Weesp', homeCity: 'Weesp', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
    ];
    for (const clubData of vijfdeKlasseBClubs_West) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseB_West.id,
        },
      });
    }
  }

  // Create Zaterdag West 2 leagues
  const zaterdagWest2Leagues = [];
  for (let i = 1; i <= 5; i++) {
    const division = i === 1 ? 'Eerste Klasse' : 
                    i === 2 ? 'Tweede Klasse' : 
                    i === 3 ? 'Derde Klasse' : 
                    i === 4 ? 'Vierde Klasse' : 'Vijfde Klasse';
    
    const league = await prisma.league.create({
      data: {
        name: `Zaterdag West 2 ${division}`,
        region: 'Zaterdag West 2',
        division: division,
        tier: `Level ${i + 3}`, // Eerste Klasse = level 4, etc.
        season: '2024/2025',
      },
    });
    zaterdagWest2Leagues.push(league);
  }

  // Add Zaterdag West 2 clubs
  // 1e klasse C
  const eersteKlasseC_West2 = zaterdagWest2Leagues.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasseC_West2) {
    const eersteKlasseCClubs_West2 = [
      { name: 'ARC', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'Alphense Boys', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'DSO', homeCity: 'Delft', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'HVV', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'LFC', homeCity: 'Leiden', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'RKDEO', homeCity: 'Delft', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: 'FC Skillz', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'SC Monster', homeCity: 'Monster', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'VELO', homeCity: 'Wassenaar', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'VUC', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 55, form: 'DLWLL' },
      { name: "Valken '68", homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: "Voorschoten '97", homeCity: 'Voorschoten', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'SV Wippolder', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
    ];
    for (const clubData of eersteKlasseCClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasseC_West2.id,
        },
      });
    }
  }

  // 1e klasse D
  const eersteKlasseD_West2 = zaterdagWest2Leagues.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasseD_West2) {
    const eersteKlasseDClubs_West2 = [
      { name: 'BVCB', homeCity: 'Barendrecht', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'DCV', homeCity: 'Dordrecht', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'Heinenoord', homeCity: 'Heinenoord', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'Jodan Boys', homeCity: 'Dordrecht', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'NSVV', homeCity: 'Nieuw-Beijerland', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'VV Nieuw-Lekkerland', homeCity: 'Nieuw-Lekkerland', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: 'Nieuwenhoorn', homeCity: 'Nieuwenhoorn', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'Oranje Wit', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'VV Papendrecht', homeCity: 'Papendrecht', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'SHO', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 55, form: 'DLWLL' },
      { name: 'Sparta AV', homeCity: 'Dordrecht', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: "Spartaan'20", homeCity: 'Dordrecht', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'VV Spijkenisse', homeCity: 'Spijkenisse', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
      { name: 'VOC', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
    ];
    for (const clubData of eersteKlasseDClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasseD_West2.id,
        },
      });
    }
  }

  // 2e klasse C
  const tweedeKlasseC_West2 = zaterdagWest2Leagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseC_West2) {
    const tweedeKlasseCClubs_West2 = [
      { name: "Alexandria'66", homeCity: 'Wassenaar', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'Alphia', homeCity: 'Den Haag', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'CVV Zwervers', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'SV Donk', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'Die Haghe', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'VV Foreholte', homeCity: 'Voorburg', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'Gr.Wil II VAC', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'Koudekerk', homeCity: 'Koudekerk aan den Rijn', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'Nieuwerkerk', homeCity: 'Nieuwerkerk aan den IJssel', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'SV Nootdorp', homeCity: 'Nootdorp', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'OLIVEO', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'RCL', homeCity: 'Leiden', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: "SVC '08", homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: "TAC '90", homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
    ];
    for (const clubData of tweedeKlasseCClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseC_West2.id,
        },
      });
    }
  }

  // 2e klasse D
  const tweedeKlasseD_West2 = zaterdagWest2Leagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseD_West2) {
    const tweedeKlasseDClubs_West2 = [
      { name: 'Binnenmaas', homeCity: 'Binnenmaas', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'Brielle', homeCity: 'Brielle', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'CION', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'Den Hoorn', homeCity: 'Den Hoorn', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'HBSS', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: "HVC '10", homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'Hellevoetsluis', homeCity: 'Hellevoetsluis', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'Honselersdijk', homeCity: 'Honselersdijk', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'Rhoon', homeCity: 'Rhoon', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VFC', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'Verburch', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'Westlandia', homeCity: 'Naaldwijk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'Zuidland', homeCity: 'Zuidland', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
    ];
    for (const clubData of tweedeKlasseDClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseD_West2.id,
        },
      });
    }
  }

  // 3e klasse E
  const derdeKlasseE_West2 = zaterdagWest2Leagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseE_West2) {
    const derdeKlasseEClubs_West2 = [
      { name: 'Aarlanderveen', homeCity: 'Aarlanderveen', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'ASC', homeCity: 'Leiden', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: "BSC '68", homeCity: 'Leiden', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'DoCoS', homeCity: 'Leiden', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'ESTO', homeCity: 'Leiden', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Groeneweg', homeCity: 'Leiden', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'Haastrecht', homeCity: 'Haastrecht', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'Meerburg', homeCity: 'Leiden', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'Olympia', homeCity: 'Leiden', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'TAVV', homeCity: 'Leiden', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'Teylingen', homeCity: 'Sassenheim', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'UVS', homeCity: 'Leiden', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'Zoetermeer', homeCity: 'Zoetermeer', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'Zwammerdam', homeCity: 'Zwammerdam', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];
    for (const clubData of derdeKlasseEClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseE_West2.id,
        },
      });
    }
  }

  // 3e klasse F
  const derdeKlasseF_West2 = zaterdagWest2Leagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseF_West2) {
    const derdeKlasseFClubs_West2 = [
      { name: "Ariston '80", homeCity: 'Den Haag', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'DHC Delft', homeCity: 'Delft', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'DSVP', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'Duindorp SV', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'DWO', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'GDA', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'KMD', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Lyra', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'HVV Laakkwartier', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: "MVV '27", homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'PGS/VOGEL', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VV Schipluiden', homeCity: 'Schipluiden', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'Vitesse Delft', homeCity: 'Delft', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'VV Wilhelmus', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];
    for (const clubData of derdeKlasseFClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseF_West2.id,
        },
      });
    }
  }

  // 3e klasse G
  const derdeKlasseG_West2 = zaterdagWest2Leagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseG_West2) {
    const derdeKlasseGClubs_West2 = [
      { name: 'CVV Berkel', homeCity: 'Berkel en Rodenrijs', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'CKC', homeCity: 'Capelle aan den IJssel', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'CWO', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: "Excelsior '20", homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'Hermes DVS', homeCity: 'Schiedam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Hillegersberg', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Kethel Spaland', homeCity: 'Schiedam', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'Neptunus-Schiebroek', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'OVV', homeCity: 'Overschie', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'SVS Capelle', homeCity: 'Capelle aan den IJssel', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'Soccer Boys', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: "Victoria '04", homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Vierpolders', homeCity: 'Vierpolders', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'CSV Zwarte Pijl', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];
    for (const clubData of derdeKlasseGClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseG_West2.id,
        },
      });
    }
  }

  // 5e klasse A
  const vijfdeKlasseA_West2 = zaterdagWest2Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseA_West2) {
    const vijfdeKlasseAClubs_West2 = [
      { name: 'AVV Alphen', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'SV Bernardus', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'SVO Buytenpark', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'DVC Delft', homeCity: 'Delft', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'DVV Delft', homeCity: 'Delft', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: 'Football Factory', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'Hazerswoudse Boys', homeCity: 'Hazerswoude', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: "SV Kickers '69", homeCity: 'Alphen aan den Rijn', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'MMO', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: 'SV Ommoord', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'RVV Overschie', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'SEP', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
      { name: 'Van Nispen', homeCity: 'Alphen aan den Rijn', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDLL' },
      { name: 'VV Woubrugge', homeCity: 'Woubrugge', boardExpectation: 'Avoid relegation', morale: 40, form: 'DLWLL' },
    ];
    for (const clubData of vijfdeKlasseAClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseA_West2.id,
        },
      });
    }
  }

  // 5e klasse B
  const vijfdeKlasseB_West2 = zaterdagWest2Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseB_West2) {
    const vijfdeKlasseBClubs_West2 = [
      { name: 'ASW', homeCity: 'Gouda', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'CVC Reeuwijk', homeCity: 'Reeuwijk', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'SV Gouda', homeCity: 'Gouda', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'VV Gouderak', homeCity: 'Gouderak', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'VV Kamerik', homeCity: 'Kamerik', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: 'VV Linschoten', homeCity: 'Linschoten', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VV Moerkapelle', homeCity: 'Moerkapelle', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: 'VV Moordrecht', homeCity: 'Moordrecht', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'VV de Rijnstreek', homeCity: 'Gouda', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: "SV Siveo '60", homeCity: 'Gouda', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'VV Sportief', homeCity: 'Gouda', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'VV Stolwijk', homeCity: 'Stolwijk', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
      { name: 'WDS', homeCity: 'Gouda', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDLL' },
      { name: 'SC Woerden', homeCity: 'Woerden', boardExpectation: 'Avoid relegation', morale: 40, form: 'DLWLL' },
    ];
    for (const clubData of vijfdeKlasseBClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseB_West2.id,
        },
      });
    }
  }

  // 5e klasse C
  const vijfdeKlasseC_West2 = zaterdagWest2Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseC_West2) {
    const vijfdeKlasseCClubs_West2 = [
      { name: 'Celeritas', homeCity: 'Den Haag', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'HDV', homeCity: 'Den Haag', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'HPSV', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'VV Haagse Hout', homeCity: 'Den Haag', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'SV Houtwijk', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: 'Quick Steps', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'REMO', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: 'Semper Altius', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'SCSV De Ster', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: 'Toofan', homeCity: 'Den Haag', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'VCS', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'WIK', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
      { name: 'SCSV Wanica Star', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDLL' },
      { name: 'SV Madestein', homeCity: 'Den Haag', boardExpectation: 'Avoid relegation', morale: 40, form: 'DLWLL' },
    ];
    for (const clubData of vijfdeKlasseCClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseC_West2.id,
        },
      });
    }
  }

  // 5e klasse D
  const vijfdeKlasseD_West2 = zaterdagWest2Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseD_West2) {
    const vijfdeKlasseDClubs_West2 = [
      { name: 'SV Bolnes', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'DRL', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'Deltasport', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'De Egelantier Boys', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'FCB-HWD', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: "MSV '71", homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'NOCKralingen', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: 'VV Rijnmond Hoogvliet Sport', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'Rotterdam United', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: "SCO '63", homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'SVV', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'Swift Boys', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
      { name: 'TransvaliaZW', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDLL' },
      { name: 'IJVV De Zwervers', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 40, form: 'DLWLL' },
    ];
    for (const clubData of vijfdeKlasseDClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseD_West2.id,
        },
      });
    }
  }

  // 5e klasse E
  const vijfdeKlasseE_West2 = zaterdagWest2Leagues.find(l => l.division === 'Vijfde Klasse');
  if (vijfdeKlasseE_West2) {
    const vijfdeKlasseEClubs_West2 = [
      { name: 'VV Abbenbroek', homeCity: 'Abbenbroek', boardExpectation: 'Promotion', morale: 66, form: 'WWWWD' },
      { name: 'FC Vlotbrug', homeCity: 'Vlotbrug', boardExpectation: 'Promotion', morale: 64, form: 'WWWDL' },
      { name: 'RKVV FIOS', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WWDLW' },
      { name: 'MSV en AV Flakkee', homeCity: 'Goedereede', boardExpectation: 'Play-off spot', morale: 60, form: 'WDLWW' },
      { name: 'VV Melissant', homeCity: 'Melissant', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWW' },
      { name: 'NBSVV', homeCity: 'Nieuw-Beijerland', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'NTVV', homeCity: 'Nieuw-Beijerland', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWD' },
      { name: 'OFB', homeCity: 'Oud-Beijerland', boardExpectation: 'Mid-table finish', morale: 52, form: 'WWDLW' },
      { name: 'OHVV', homeCity: 'Oud-Beijerland', boardExpectation: 'Mid-table finish', morale: 50, form: 'LWWDL' },
      { name: 'VV Rockanje', homeCity: 'Rockanje', boardExpectation: 'Mid-table finish', morale: 48, form: 'DLWLL' },
      { name: 'VV SNS', homeCity: 'Spijkenisse', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDWL' },
      { name: 'Fortuna Be Quick', homeCity: 'Spijkenisse', boardExpectation: 'Avoid relegation', morale: 44, form: 'LDLWL' },
      { name: 'SV Simonshaven', homeCity: 'Simonshaven', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDLL' },
      { name: 'VV WFB', homeCity: 'Westvoorne', boardExpectation: 'Avoid relegation', morale: 40, form: 'DLWLL' },
    ];
    for (const clubData of vijfdeKlasseEClubs_West2) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vijfdeKlasseE_West2.id,
        },
      });
    }
  }

  // Seed Zaterdag Zuid clubs
  const zaterdagZuidLeagues = zaterdagLeagues.filter(l => l.region === 'Zaterdag Zuid');

  // 1e klasse D
  const eersteKlasseD = zaterdagZuidLeagues.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasseD) {
    const eersteKlasseDClubs = [
      { name: 'Achilles \'29', homeCity: 'Groesbeek', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'VV Almkerk', homeCity: 'Almkerk', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'VV Bennekom', homeCity: 'Bennekom', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'DTS Ede', homeCity: 'Ede', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'DUNO D.', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'DZC \'68', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: 'LRC Leerdam', homeCity: 'Leerdam', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'Nivo Sparta', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'SV Oranje Wit', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'VV Scherpenzeel', homeCity: 'Scherpenzeel', boardExpectation: 'Mid-table finish', morale: 55, form: 'DLWLL' },
      { name: 'VV Sliedrecht', homeCity: 'Sliedrecht', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: 'SVL', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'SVW', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
    ];

    for (const clubData of eersteKlasseDClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasseD.id,
        },
      });
    }
  }

  // 2e klasse G
  const tweedeKlasseG = zaterdagZuidLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseG) {
    const tweedeKlasseGClubs = [
      { name: 'VV Arnemuiden', homeCity: 'Arnemuiden', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'FC Axel', homeCity: 'Axel', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'DBGC', homeCity: 'Dordrecht', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'VV Hellevoetsluis', homeCity: 'Hellevoetsluis', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'VV de Meeuwen', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'SV MZC \'11', homeCity: 'Middelburg', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'NSVV', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'RCS', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'SSV \'65', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VCK', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'SV Walcheren', homeCity: 'Middelburg', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'WHS', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'VV Yerseke', homeCity: 'Yerseke', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: 'VV Zuidland', homeCity: 'Zuidland', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
    ];

    for (const clubData of tweedeKlasseGClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseG.id,
        },
      });
    }
  }

  // 2e klasse H
  const tweedeKlasseH = zaterdagZuidLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseH) {
    const tweedeKlasseHClubs = [
      { name: 'VV Alblasserdam', homeCity: 'Alblasserdam', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'VV Altena', homeCity: 'Altena', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'EBOH', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'GJS', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'GRC \'14', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'VV Heukelum', homeCity: 'Heukelum', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'VV Papendrecht', homeCity: 'Papendrecht', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'Roda Boys/B', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'VV Schelluinen', homeCity: 'Schelluinen', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VV Streefkerk', homeCity: 'Streefkerk', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL' },
      { name: 'VV Tricht', homeCity: 'Tricht', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'VV Wieldrecht', homeCity: 'Wieldrecht', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'Wilhelmina \'26', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: 'VV Woudrichem', homeCity: 'Woudrichem', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
    ];

    for (const clubData of tweedeKlasseHClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseH.id,
        },
      });
    }
  }

  // 3e klasse A
  const derdeKlasseA = zaterdagZuidLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseA) {
    const derdeKlasseAClubs = [
      { name: 'VV Bevelanders', homeCity: 'Goes', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'FC Dauwendaele', homeCity: 'Middelburg', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'GPC Vlissingen', homeCity: 'Vlissingen', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV \'s-Heer Arendskerke', homeCity: '\'s-Heer Arendskerke', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'Lewedorpse Boys', homeCity: 'Lewedorp', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'Luctor Heinkenszand', homeCity: 'Heinkenszand', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'SV Nieuwdorp', homeCity: 'Nieuwdorp', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV de Noormannen', homeCity: 'Middelburg', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'De Patrijzen', homeCity: 'Middelburg', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Serooskerke', homeCity: 'Serooskerke', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Veere', homeCity: 'Veere', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'VC Vlissingen', homeCity: 'Vlissingen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Zaamslag', homeCity: 'Zaamslag', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'Zeelandia Middelburg', homeCity: 'Middelburg', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];

    for (const clubData of derdeKlasseAClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseA.id,
        },
      });
    }
  }

  // 3e klasse B
  const derdeKlasseB = zaterdagZuidLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseB) {
    const derdeKlasseBClubs = [
      { name: 'Bruse Boys', homeCity: 'Bergen op Zoom', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Den Bommel', homeCity: 'Den Bommel', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'DVV \'09', homeCity: 'Dordrecht', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'RKSV Halsteren', homeCity: 'Halsteren', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'De Jonge Spartaan', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Kapelle', homeCity: 'Kapelle', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Kogelvangers', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Kruiningen', homeCity: 'Kruiningen', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'MOC \'17', homeCity: 'Middelburg', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'VV Prinsenland', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'SKNWK', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'Tholense Boys', homeCity: 'Tholen', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'ZSC \'62', homeCity: 'Zierikzee', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];

    for (const clubData of derdeKlasseBClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseB.id,
        },
      });
    }
  }

  // 3e klasse C
  const derdeKlasseC = zaterdagZuidLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseC) {
    const derdeKlasseCClubs = [
      { name: 'VV De Fendert', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'DFC', homeCity: 'Dordrecht', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'VV Groote Lindt', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Hekelingen', homeCity: 'Hekelingen', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'IFC', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'VV Internos', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Klundert', homeCity: 'Klundert', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'OSV Oud-Beijerland', homeCity: 'Oud-Beijerland', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Rhoon', homeCity: 'Rhoon', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'SEOLTO', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'SSS', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'ZBC \'97', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Zwaluwe', homeCity: 'Zwaluwe', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];

    for (const clubData of derdeKlasseCClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseC.id,
        },
      });
    }
  }

  // 3e klasse D
  const derdeKlasseD = zaterdagZuidLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseD) {
    const derdeKlasseDClubs = [
      { name: 'VV De Alblas', homeCity: 'Alblasserdam', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'VV Ameide', homeCity: 'Ameide', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'ASV Arkel', homeCity: 'Arkel', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Bergambacht', homeCity: 'Bergambacht', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'VV Dilettant', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'Vv Drechtstreek', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'SC Everstein', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'VV Haastrecht', homeCity: 'Haastrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'VV Hardinxveld', homeCity: 'Hardinxveld', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'HSSC \'61', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Lekkerkerk', homeCity: 'Lekkerkerk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'SV Meerkerk', homeCity: 'Meerkerk', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Schoonhoven', homeCity: 'Schoonhoven', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
      { name: 'VVAC', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 44, form: 'DLWLL' },
    ];

    for (const clubData of derdeKlasseDClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseD.id,
        },
      });
    }
  }

  // 3e klasse E
  const derdeKlasseE = zaterdagZuidLeagues.find(l => l.division === 'Derde Klasse');
  if (derdeKlasseE) {
    const derdeKlasseEClubs = [
      { name: 'BLC', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 70, form: 'WWWWD' },
      { name: 'SV Capelle', homeCity: 'Capelle aan den IJssel', boardExpectation: 'Promotion', morale: 68, form: 'WWWDL' },
      { name: 'DESK', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 66, form: 'WWDLW' },
      { name: 'VV Dongen', homeCity: 'Dongen', boardExpectation: 'Play-off spot', morale: 64, form: 'WDLWW' },
      { name: 'GDC', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWWW' },
      { name: 'GVV \'63', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'LWWDL' },
      { name: 'VV Haaften', homeCity: 'Haaften', boardExpectation: 'Mid-table finish', morale: 58, form: 'DLWWD' },
      { name: 'MVV \'58', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'WWDLW' },
      { name: 'NEO \'25', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'LWWDL' },
      { name: 'ONI', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'DLWLL' },
      { name: 'VV Sleeuwijk', homeCity: 'Sleeuwijk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDWL' },
      { name: 'Sparta \'30', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LDLWL' },
      { name: 'VV Vuren', homeCity: 'Vuren', boardExpectation: 'Avoid relegation', morale: 46, form: 'LLDLL' },
    ];

    for (const clubData of derdeKlasseEClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: derdeKlasseE.id,
        },
      });
    }
  }

  // 4e klasse A
  const vierdeKlasseA_Zuid = zaterdagZuidLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseA_Zuid) {
    const vierdeKlasseAClubs = [
      { name: 'Apollo \'69', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Cadzand', homeCity: 'Cadzand', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'DwO \'15', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'Hansweertse Boys', homeCity: 'Hansweert', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'HKW \'21', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'Jong Ambon', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'VV Krabbendijke', homeCity: 'Krabbendijke', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'MZVC', homeCity: 'Middelburg', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Nieuwland', homeCity: 'Nieuwland', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Rillandia', homeCity: 'Rilland', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Schoondijke', homeCity: 'Schoondijke', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'VV Spui', homeCity: 'Spui', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'SC Waarde', homeCity: 'Waarde', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'VV Wemeldinge', homeCity: 'Wemeldinge', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseAClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseA_Zuid.id,
        },
      });
    }
  }

  // 4e klasse B
  const vierdeKlasseB_Zuid = zaterdagZuidLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseB_Zuid) {
    const vierdeKlasseBClubs = [
      { name: 'ASV Brouwershaven', homeCity: 'Brouwershaven', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Colijnsplaatse Boys', homeCity: 'Colijnsplaat', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'SV Duiveland', homeCity: 'Duiveland', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'FIOS', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'GOES', homeCity: 'Goes', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'VV Herkingen \'55', homeCity: 'Herkingen', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'NOAD \'67', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'SV Smerdiek', homeCity: 'Middelburg', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'SNS', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'SPS', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'SC Stavenisse', homeCity: 'Stavenisse', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'FC De Westhoek \'20', homeCity: 'Westhoek', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'WIK \'57', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'VV Wolfaartsdijk', homeCity: 'Wolfaartsdijk', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseBClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseB_Zuid.id,
        },
      });
    }
  }

  // 4e klasse C
  const vierdeKlasseC_Zuid = zaterdagZuidLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseC_Zuid) {
    const vierdeKlasseCClubs = [
      { name: 'RSC Alliance', homeCity: 'Roosendaal', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Baronie', homeCity: 'Breda', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'FC Bergen', homeCity: 'Bergen op Zoom', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'BSV Boeimeer', homeCity: 'Breda', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'DVO \'60', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'Lepelstraatse Boys', homeCity: 'Lepelstraat', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'RKSV Rood-Wit Willebrord', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'VV Steenbergen', homeCity: 'Steenbergen', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'The Gunners', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'VV Vrederust', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VVC \'68', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'SC Welberg', homeCity: 'Welberg', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];

    for (const clubData of vierdeKlasseCClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseC_Zuid.id,
        },
      });
    }
  }

  // 4e klasse D
  const vierdeKlasseD_Zuid = zaterdagZuidLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseD_Zuid) {
    const vierdeKlasseDClubs = [
      { name: 'DHV', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Dubbeldam', homeCity: 'Dordrecht', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'DVVC', homeCity: 'Dordrecht', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'GSC/ODS', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'Irene \'58', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'Olympia \'60', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'RFC', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'RWB', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'SCO', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'SSC \'55', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'SSW', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'TSC', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
    ];

    for (const clubData of vierdeKlasseDClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseD_Zuid.id,
        },
      });
    }
  }

  // 4e klasse E
  const vierdeKlasseE_Zuid = zaterdagZuidLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseE_Zuid) {
    const vierdeKlasseEClubs = [
      { name: 'ASH', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'VV Asperen', homeCity: 'Asperen', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Beesd', homeCity: 'Beesd', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'BZC \'14', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'VV Groot Ammers', homeCity: 'Groot Ammers', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'GVV', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'Herovina', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'Leerdam Sport \'55', homeCity: 'Leerdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'VV Lekvogels', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'SV Noordeloos', homeCity: 'Noordeloos', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'VV Peursum', homeCity: 'Peursum', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'RVV Rhelico', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'SVS \'65', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
      { name: 'GVV Unitas', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
    ];

    for (const clubData of vierdeKlasseEClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseE_Zuid.id,
        },
      });
    }
  }

  // 4e klasse F
  const vierdeKlasseF_Zuid = zaterdagZuidLeagues.find(l => l.division === 'Vierde Klasse');
  if (vierdeKlasseF_Zuid) {
    const vierdeKlasseFClubs = [
      { name: 'DBN \'22', homeCity: 'Rotterdam', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
      { name: 'FC Drunen', homeCity: 'Drunen', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
      { name: 'VV Kerkwijk', homeCity: 'Kerkwijk', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
      { name: 'RKSV Margriet', homeCity: 'Rotterdam', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
      { name: 'NOAD \'32', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
      { name: 'OSS \'20', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
      { name: 'OVC \'26', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
      { name: 'SV Rood-Wit Veldhoven', homeCity: 'Veldhoven', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
      { name: 'FC Tilburg', homeCity: 'Tilburg', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
      { name: 'SV TOP', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWLL' },
      { name: 'TSVV Merlijn', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
      { name: 'WSV Well', homeCity: 'Well', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
      { name: 'Willem II (amateurs)', homeCity: 'Tilburg', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
    ];

    for (const clubData of vierdeKlasseFClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: vierdeKlasseF_Zuid.id,
        },
      });
    }
  }

  // Seed Zondag Noord clubs with real data
  const zondagNoordLeagues = zondagLeagues.filter(l => l.region === 'Zondag Noord');

  // 1e klasse H
  const eersteKlasseH_Zondag = zondagNoordLeagues.find(l => l.division === 'Eerste Klasse');
  if (eersteKlasseH_Zondag) {
    const eersteKlasseHClubs_Zondag = [
      { name: 'VV Dalen', homeCity: 'Dalen', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
      { name: 'SV Dalfsen', homeCity: 'Dalfsen', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
      { name: 'EHS \'85', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
      { name: 'CVV Germanicus', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
      { name: 'Sportclub Markelo', homeCity: 'Markelo', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
      { name: 'MVV \'29', homeCity: 'Musselkanaal', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
      { name: 'Raptim', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
      { name: 'RSC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
      { name: 'VV Sellingen', homeCity: 'Sellingen', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
      { name: 'De Tukkers', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
      { name: 'Twedo', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
      { name: 'VV Valthermond', homeCity: 'Valthermond', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
      { name: 'WKE \'16', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
    ];

    for (const clubData of eersteKlasseHClubs_Zondag) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: eersteKlasseH_Zondag.id,
        },
      });
    }
  }

  // 2e klasse G
  const tweedeKlasseG = zondagNoordLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseG) {
    const tweedeKlasseGClubs = [
      { name: 'VV Dalen', homeCity: 'Dalen', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'SV Dalfsen', homeCity: 'Dalfsen', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'EHS \'85', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'CVV Germanicus', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'Sportclub Markelo', homeCity: 'Markelo', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'MVV \'29', homeCity: 'Musselkanaal', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'Raptim', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'RSC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'VV Sellingen', homeCity: 'Sellingen', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'De Tukkers', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'Twedo', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'VV Valthermond', homeCity: 'Valthermond', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: 'WKE \'16', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
    ];

    for (const clubData of tweedeKlasseGClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseG.id,
        },
      });
    }
  }

  // 2e klasse H
  const tweedeKlasseH = zondagNoordLeagues.find(l => l.division === 'Tweede Klasse');
  if (tweedeKlasseH) {
    const tweedeKlasseHClubs = [
      { name: 'MVV Alcides', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
      { name: 'VV Annen', homeCity: 'Annen', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
      { name: 'GSAVV Forward', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
      { name: 'GOMOS', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
      { name: 'VV Gorredijk', homeCity: 'Gorredijk', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
      { name: 'GRC Groningen', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
      { name: 'GVAV-Rapiditas', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
      { name: 'VV Jubbega', homeCity: 'Jubbega', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
      { name: 'LSC 1890', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
      { name: 'VV Oldeholtpade', homeCity: 'Oldeholtpade', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
      { name: 'VV Peize', homeCity: 'Peize', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
      { name: 'VV Steenwijker Boys', homeCity: 'Steenwijk', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
      { name: 'SV Steenwijkerwold', homeCity: 'Steenwijkerwold', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
      { name: 'VV VKW', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
    ];

    for (const clubData of tweedeKlasseHClubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          leagueId: tweedeKlasseH.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 