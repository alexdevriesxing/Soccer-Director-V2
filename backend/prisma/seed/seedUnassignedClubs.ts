import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// List of unassigned clubs (including FC Amboina)
const unassignedClubNames = [
  'Abbenes', 'AD \'69', 'Aeolus', 'AGSV', 'Allen Weerbaar', 'Altweerterheide', 'Amelandia', 'America',
  'Ammerstolse SV', 'Amsterdamse Bos', 'Anadolu\'90', 'AS \'80', 'ASV \'55', 'Beemster', 'Besiktas',
  'Blokkers', 'Bodegraven', 'Boeimeer', 'Boekoel', 'Borssele', 'Crescentia', 'Delfia', 'DEVO \'58',
  'Dierense Boys', 'DIO Groningen', 'DIVA\'83', 'DOB', 'Domstad Majella', 'DOS \'63', 'DRC',
  'DRC 2012', 'DSZ', 'DVSV', 'DZC \'09', 'EBC', 'Echteld', 'Edesche Boys', 'EDON', 'EEC', 'Egchel',
  'EGVV', 'EMM Randwijk', 'Emmen', 'EMS', 'Erica \'86', 'EWC \'46', 'Excelsior', 'FIT',
  'Flamingo\'s \'64', 'Froombosch', 'FSG', 'Gazelle', 'Geinburgia', 'Gersloot', 'GFC \'33',
  'Godlinze', 'Graftdijk', 'GSV Gouda', 'GSV Grootschermer', 'GVB', 'Haarlo', 'Hansweertse Boys',
  'Heerewaarden', 'Helenaveen/Griendtsveen', 'HMS', 'HOSV', 'HSV\'69', 'HVZ', 'IASON',
  'IJsselstreek', 'ISC', 'Italian Boys', 'Jonker Boys', 'Kieviten', 'Klein Dochteren', 'Knollendam',
  'Kreileroord', 'KSD/Marine', 'Kwadijk', 'Leidschenveen', 'Lottum', 'Marvilde', 'Menos',
  'Moerstraten', 'Monnik', 'Muiden', 'Muiderberg', 'NFC', 'Nieuweschans', 'Nieuwolda', 'Noordbergum',
  'Odin', 'Oldenzaal', 'Onderdendam', 'Only Friends', 'Oosterend', 'Oranje Blauw \'14', 'Oudega',
  'Ouwe Schoen', 'OVC \'26', 'Overvecht De Dreef', 'OZW', 'Parkstad', 'PKC \'85', 'Potetos',
  'Pretoria Rotterdam', 'Rap', 'Raptim G.', 'RDM', 'RKIVV', 'Rust Roest', 'Schoten', 'SCR', 'SDV',
  'SDW', 'SGO', 'Sibbe', 'Sint Jacob', 'Sporting Almere', 'Sporting S.', 'Sterrenwijk', 'Stevensweert',
  'SVDB', 'SVVH', 'Swift Boys', 'Taurus', 'TEO', 'THB', 'Twisk', 'Tzum', 'Tzummarum', 'Uni VV',
  'Utrecht United', 'V en L', 'VCA', 'Vechtzoom', 'VEV', 'VEW', 'Vianen', 'Vierhouten \'82', 'VOB',
  'Voorwaarts R.', 'VOS', 'Vosmeer', 'VSC', 'VSV\'31', 'VVU Ardahanspor', 'Waalstad', 'Walburgia',
  'Wapenveld', 'Waterloo', 'Welsum', 'Westendorp', 'Westerbeekse Boys', 'Westerbroek', 'Willemsoord',
  'Wiron', 'Wodanseck', 'WSW', 'Zandpol', 'Zierikzee', 'Zuiderburen', 'Zuidermeer', 'Zuidlaarderveen',
  'FC Amboina'
];

export async function seedUnassignedClubs(prisma: PrismaClient) {
  // Create or find the 'Unassigned Clubs' league
  let league = await prisma.league.findFirst({ where: { tier: 'unassigned' } });
  if (!league) {
    league = await prisma.league.create({
      data: {
        name: 'Unassigned Clubs',
        tier: 'unassigned',
        region: 'none',
        division: 'none',
        season: '2024/25',
      },
    });
  }

  for (const name of unassignedClubNames) {
    const existing = await prisma.club.findFirst({ where: { name } });
    if (!existing) {
      await prisma.club.create({
        data: {
          name,
          leagueId: league.id,
          homeCity: null,
          boardExpectation: 'Survive',
          morale: 30,
          form: '',
          regionTag: 'unknown',
          homeKitShirt: '#cccccc',
          homeKitShorts: '#cccccc',
          homeKitSocks: '#cccccc',
          awayKitShirt: '#eeeeee',
          awayKitShorts: '#eeeeee',
          awayKitSocks: '#eeeeee',
          isJongTeam: false,
          eligibleForPromotion: true,
        },
      });
    }
  }
  // Add a 'Free Agent' club if not present
  const freeAgentClubName = 'Free Agent';
  const freeAgentClub = await prisma.club.findFirst({ where: { name: freeAgentClubName } });
  if (!freeAgentClub) {
    await prisma.club.create({
      data: {
        name: freeAgentClubName,
        leagueId: league.id,
        homeCity: null,
        boardExpectation: 'None',
        morale: 0,
        form: '',
        regionTag: 'none',
        homeKitShirt: '#888888',
        homeKitShorts: '#888888',
        homeKitSocks: '#888888',
        awayKitShirt: '#888888',
        awayKitShorts: '#888888',
        awayKitSocks: '#888888',
        isJongTeam: false,
        eligibleForPromotion: false,
      },
    });
    console.log('✅ Free Agent club seeded.');
  }
  console.log('✅ Unassigned clubs seeded.');
} 