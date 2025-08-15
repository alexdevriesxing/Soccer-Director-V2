import { PrismaClient } from '@prisma/client';
import { getRandomFrom as getRandomFromBase } from './generatePlayers';

const prisma = new PrismaClient();

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// List of representative European cup clubs (one per country, e.g., Champions League/Europa League/Conference League participants)
const europeanCupClubs = [
  { name: 'Real Madrid', country: 'Spain' },
  { name: 'Manchester City', country: 'England' },
  { name: 'Bayern Munich', country: 'Germany' },
  { name: 'Paris Saint-Germain', country: 'France' },
  { name: 'Inter Milan', country: 'Italy' },
  { name: 'Ajax', country: 'Netherlands' },
  { name: 'Benfica', country: 'Portugal' },
  { name: 'Celtic', country: 'Scotland' },
  { name: 'Red Star Belgrade', country: 'Serbia' },
  { name: 'Shakhtar Donetsk', country: 'Ukraine' },
  { name: 'FC Copenhagen', country: 'Denmark' },
  { name: 'Galatasaray', country: 'Turkey' },
  { name: 'RB Salzburg', country: 'Austria' },
  { name: 'Club Brugge', country: 'Belgium' },
  { name: 'Slavia Prague', country: 'Czech Republic' },
  { name: 'Dinamo Zagreb', country: 'Croatia' },
  { name: 'Young Boys', country: 'Switzerland' },
  { name: 'Olympiacos', country: 'Greece' },
  { name: 'Ferencváros', country: 'Hungary' },
  { name: 'Sheriff Tiraspol', country: 'Moldova' },
  { name: 'Ludogorets Razgrad', country: 'Bulgaria' },
  { name: 'Legia Warsaw', country: 'Poland' },
  { name: 'HJK Helsinki', country: 'Finland' },
  { name: 'Maccabi Haifa', country: 'Israel' },
  { name: 'Bodø/Glimt', country: 'Norway' },
  { name: 'Dinamo Batumi', country: 'Georgia' },
  { name: 'Qarabağ', country: 'Azerbaijan' },
  { name: 'Astana', country: 'Kazakhstan' },
  { name: 'LASK', country: 'Austria' },
  { name: 'Ludogorets', country: 'Bulgaria' },
  { name: 'Partizan', country: 'Serbia' },
  { name: 'FCSB', country: 'Romania' },
  { name: 'Dinamo Minsk', country: 'Belarus' },
  { name: 'Riga FC', country: 'Latvia' },
  { name: 'Levadia Tallinn', country: 'Estonia' },
  { name: 'Lincoln Red Imps', country: 'Gibraltar' },
  { name: 'The New Saints', country: 'Wales' },
  { name: 'Shamrock Rovers', country: 'Ireland' },
  { name: 'Valur', country: 'Iceland' },
  { name: 'Zrinjski Mostar', country: 'Bosnia and Herzegovina' },
  { name: 'Sūduva', country: 'Lithuania' },
  { name: 'Drita', country: 'Kosovo' },
  { name: 'Flora Tallinn', country: 'Estonia' },
  { name: 'Tre Penne', country: 'San Marino' },
  { name: 'Fola Esch', country: 'Luxembourg' },
  { name: 'Ballkani', country: 'Kosovo' },
  { name: 'Pyunik', country: 'Armenia' },
  { name: 'Dinamo Tbilisi', country: 'Georgia' },
  { name: 'Saburtalo', country: 'Georgia' },
  { name: 'La Fiorita', country: 'San Marino' },
  { name: 'Santa Coloma', country: 'Andorra' },
  { name: 'Inter Club d’Escaldes', country: 'Andorra' },
  { name: 'Birkirkara', country: 'Malta' },
  { name: 'Lincoln Red Imps', country: 'Gibraltar' },
  { name: 'Dudelange', country: 'Luxembourg' },
  { name: 'Shkupi', country: 'North Macedonia' },
  { name: 'RFS', country: 'Latvia' },
  { name: 'Panevėžys', country: 'Lithuania' },
  { name: 'Petrocub', country: 'Moldova' },
  { name: 'Hibernians', country: 'Malta' },
  { name: 'Dinamo Brest', country: 'Belarus' },
  { name: 'Sileks', country: 'North Macedonia' },
  { name: 'Fola Esch', country: 'Luxembourg' },
  { name: 'La Fiorita', country: 'San Marino' },
  { name: 'Santa Coloma', country: 'Andorra' },
];

// Add extra clubs for non-European nationalities
const extraClubs = [
  { name: 'Santos', country: 'Brazil' },
  { name: 'Boca Juniors', country: 'Argentina' },
  { name: 'Orlando Pirates', country: 'South Africa' },
  { name: 'Sydney FC', country: 'Australia' },
  { name: 'LA Galaxy', country: 'USA' },
  { name: 'Toronto FC', country: 'Canada' },
  { name: 'Al Ahly', country: 'Egypt' },
  { name: 'Ulsan Hyundai', country: 'Korea Republic' },
  { name: 'Kashima Antlers', country: 'Japan' },
  { name: 'Guangzhou FC', country: 'China' },
];

const allClubs = [...europeanCupClubs, ...extraClubs];

// Nationality pools
const nationalityPools = [
  // Europe (sample, expand as needed)
  'Spain', 'England', 'Germany', 'France', 'Italy', 'Netherlands', 'Portugal', 'Scotland', 'Serbia', 'Ukraine', 'Denmark', 'Turkey', 'Austria', 'Belgium', 'Czech Republic', 'Croatia', 'Switzerland', 'Greece', 'Hungary', 'Moldova', 'Bulgaria', 'Poland', 'Finland', 'Israel', 'Norway', 'Georgia', 'Azerbaijan', 'Kazakhstan', 'Romania', 'Belarus', 'Latvia', 'Estonia', 'Gibraltar', 'Wales', 'Ireland', 'Iceland', 'Bosnia and Herzegovina', 'Lithuania', 'Kosovo', 'San Marino', 'Luxembourg', 'Armenia', 'North Macedonia',
  // Non-Europe
  'Brazil', 'Argentina', 'South Africa', 'Australia', 'USA', 'Canada', 'Egypt', 'Korea Republic', 'Japan', 'China',
  // African countries (sample)
  'Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Morocco', 'Algeria', 'Tunisia', 'Cameroon', 'Mali', 'South Africa',
];

// Name pools (expand as needed)
const firstNames = ['Alex', 'Carlos', 'Miguel', 'Lucas', 'Diego', 'Sergio', 'Marco', 'Antonio', 'Giuseppe', 'Pierre', 'Jean', 'François', 'Thomas', 'John', 'David', 'Mohamed', 'Ahmed', 'Samuel', 'Emmanuel', 'Kwame', 'Kofi', 'Omar', 'Ali', 'Youssef', 'Hassan', 'Mahmoud', 'Khaled', 'Sami', 'Fadi', 'Tariq', 'Jin', 'Min', 'Yuki', 'Takumi', 'Wei', 'Li', 'Chen', 'Jorge', 'Mateo', 'Lucas', 'Martin', 'Nicolas', 'Gabriel', 'Matheus', 'Rafael', 'Bruno', 'Kevin', 'Tim', 'Mike', 'Tom'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Martins', 'Ferreira', 'Ribeiro', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Gomes', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Kim', 'Lee', 'Park', 'Choi', 'Yamamoto', 'Tanaka', 'Suzuki', 'Wang', 'Zhang', 'Liu', 'Chen', 'Mohamed', 'Diallo', 'Traoré', 'Diop', 'Ndiaye', 'Camara', 'Touré', 'Mensah', 'Owusu', 'Osei', 'Abebe', 'Al-Farsi', 'Al-Masri', 'Al-Haddad', 'Al-Khalil', 'Al-Amin', 'Al-Sayed', 'Al-Sharif', 'Al-Tamimi', 'Al-Zahrani', 'Al-Qahtani'];

function getRandomFrom<T>(arr: T[]): T {
  return getRandomFromBase(arr as string[]) as T;
}

// Helper: Assign reputation levels to clubs based on their league/tier
function getClubReputationLevel(leagueName: string): number {
  if (!leagueName) return 0;
  const name = leagueName.toLowerCase();
  if (name.includes('eredivisie')) return 5;
  if (name.includes('eerste divisie')) return 4;
  if (name.includes('tweede divisie')) return 3;
  if (name.includes('derde divisie')) return 2;
  if (name.includes('vierde divisie')) return 1;
  if (name.includes('vijfde klasse')) return 0;
  return 0;
}

// Helper: Assign reputation levels to players based on skill
function getPlayerReputationLevel(skill: number): number {
  if (skill >= 80) return 5;
  if (skill >= 70) return 4;
  if (skill >= 60) return 3;
  if (skill >= 50) return 2;
  if (skill >= 40) return 1;
  return 0;
}

// Helper: Determine if a player will sign for a club based on reputation and age
function canSignForClub(playerRep: number, clubRep: number, age: number): boolean {
  // Top players never join lowest clubs
  if (playerRep >= 4 && clubRep <= 1) return false;
  // Top internationals never join amateur
  if (playerRep === 5 && clubRep < 3) return false;
  // Young players are picky, older players relax
  if (age < 28) {
    return clubRep >= playerRep - 1;
  } else if (age < 33) {
    return clubRep >= playerRep - 2;
  } else {
    return clubRep >= playerRep - 3;
  }
}

// Helper: Assign a random Dutch region (weighted by population)
function getRandomDutchRegion() {
  // Rough population weights: West > Zuid > Noord > Oost
  const regions = [
    { tag: 'West 1', weight: 30 },
    { tag: 'West 2', weight: 20 },
    { tag: 'Zuid', weight: 20 },
    { tag: 'Noord', weight: 15 },
    { tag: 'Oost', weight: 15 },
  ];
  const total = regions.reduce((sum, r) => sum + r.weight, 0);
  let r = Math.random() * total;
  for (const region of regions) {
    if (r < region.weight) return region.tag;
    r -= region.weight;
  }
  return 'West 1';
}

// Helper: Board expectation ambition match
function boardAmbitionScore(board: string, personality: string, ambition: number) {
  if (!board) return 0;
  if ((board.includes('Win') || board.includes('Promotion')) && (personality === 'PROFESSIONAL' || personality === 'DRIVEN' || ambition >= 4)) return 10;
  if ((board.includes('Mid-table') || board.includes('Top half')) && ambition <= 3) return 5;
  if (board.includes('Avoid relegation') && (personality === 'LAZY' || ambition <= 2)) return 5;
  return 0;
}

// Helper: Wage fit (use morale as proxy for finances)
function wageFitsClub(wage: number, morale: number) {
  // Assume morale 70+ = can pay up to 8000, 60+ = 6000, 50+ = 4000, else 2000
  if (morale >= 70) return wage <= 8000;
  if (morale >= 60) return wage <= 6000;
  if (morale >= 50) return wage <= 4000;
  return wage <= 2000;
}

export async function seedForeignPlayers(prisma: any) {
  // Create or find the 'Foreign Clubs' league
  let league = await prisma.league.findFirst({ where: { name: 'Foreign Clubs' } });
  if (!league) {
    league = await prisma.league.create({
      data: {
        name: 'Foreign Clubs',
        tier: 'foreign',
        region: 'Europe',
        division: 'none',
        season: '2024/25',
      },
    });
  }
  // Create clubs if not exist (assign to Foreign Clubs league)
  const clubMap: Record<string, any> = {};
  for (const club of allClubs as { name: string; country: string }[]) {
    let dbClub = await prisma.club.findFirst({ where: { name: club.name } });
    if (!dbClub) {
      dbClub = await prisma.club.create({
        data: {
          name: club.name,
          leagueId: league.id,
          homeCity: club.country,
          boardExpectation: 'Compete',
          morale: 70,
          form: '',
          regionTag: club.country,
          homeKitShirt: '#cccccc',
          homeKitShorts: '#cccccc',
          homeKitSocks: '#cccccc',
          awayKitShirt: '#eeeeee',
          awayKitShorts: '#eeeeee',
          awayKitSocks: '#eeeeee',
          isJongTeam: false,
          eligibleForPromotion: false,
        },
      });
    }
    clubMap[club.name] = dbClub;
  }

  // Distribute 2000 players among clubs
  const totalPlayers = 2000;
  const playersPerClub = Math.floor(totalPlayers / allClubs.length);
  let playerCount = 0;
  const nationalityCount: Record<string, number> = {};
  for (const club of allClubs as { name: string; country: string }[]) {
    for (let i = 0; i < playersPerClub; i++) {
      const nationality = getRandomFrom(nationalityPools);
      const name = `${getRandomFrom(firstNames)} ${getRandomFrom(lastNames)}`;
      const position = getRandomFrom(['GK', 'DEF', 'MID', 'FWD']);
      const age = getRandomInt(18, 34);
      const skill = getRandomInt(55, 90);
      const morale = getRandomInt(60, 90);
      const wage = getRandomInt(2000, 20000);
      const contractExpiry = new Date();
      contractExpiry.setFullYear(contractExpiry.getFullYear() + getRandomInt(1, 4));
      const improvementChance = age <= 22 ? 0.25 : age <= 28 ? 0.10 : 0.03;
      const talent = getRandomInt(30, 100);
      const personalities = ['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL'];
      const personality = getRandomFrom(personalities);
      await prisma.player.create({
        data: {
          name,
          clubId: clubMap[club.name].id,
          position,
          skill,
          age,
          nationality,
          morale,
          injured: false,
          internationalCaps: 0,
          onInternationalDuty: false,
          wage,
          contractExpiry,
          contractStart: new Date(),
          improvementChance,
          talent,
          personality,
          potential: skill + getRandomInt(0, 10),
          currentPotential: skill
        },
      });
      nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1;
      playerCount++;
    }
  }
  // If not exactly 2000, add the remainder to random clubs
  while (playerCount < totalPlayers) {
    const club = getRandomFrom(allClubs) as { name: string; country: string };
    const nationality = getRandomFrom(nationalityPools);
    const name = `${getRandomFrom(firstNames)} ${getRandomFrom(lastNames)}`;
    const position = getRandomFrom(['GK', 'DEF', 'MID', 'FWD']);
    const age = getRandomInt(18, 34);
    const skill = getRandomInt(55, 90);
    const morale = getRandomInt(60, 90);
    const wage = getRandomInt(2000, 20000);
    const contractExpiry = new Date();
    contractExpiry.setFullYear(contractExpiry.getFullYear() + getRandomInt(1, 4));
    const improvementChance = age <= 22 ? 0.25 : age <= 28 ? 0.10 : 0.03;
    const talent = getRandomInt(30, 100);
    const personalities = ['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL'];
    const personality = getRandomFrom(personalities);
    await prisma.player.create({
      data: {
        name,
        clubId: clubMap[club.name].id,
        position,
        skill,
        age,
        nationality,
        morale,
        injured: false,
        internationalCaps: 0,
        onInternationalDuty: false,
        wage,
        contractExpiry,
        contractStart: new Date(),
        improvementChance,
        talent,
        personality,
        potential: skill + getRandomInt(0, 10),
        currentPotential: skill
      },
    });
    nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1;
    playerCount++;
  }

  // Distribute 2000 lower-stat players among clubs
  const totalLowerPlayers = 2000;
  const lowerPlayersPerClub = Math.floor(totalLowerPlayers / allClubs.length);
  let lowerPlayerCount = 0;
  const lowerNationalityCount: Record<string, number> = {};
  for (const club of allClubs as { name: string; country: string }[]) {
    for (let i = 0; i < lowerPlayersPerClub; i++) {
      const nationality = getRandomFrom(nationalityPools);
      const name = `${getRandomFrom(firstNames)} ${getRandomFrom(lastNames)}`;
      const position = getRandomFrom(['GK', 'DEF', 'MID', 'FWD']);
      const age = getRandomInt(16, 28);
      const skill = getRandomInt(35, 60);
      const morale = getRandomInt(50, 80);
      const wage = getRandomInt(500, 4000);
      const contractExpiry = new Date();
      contractExpiry.setFullYear(contractExpiry.getFullYear() + getRandomInt(1, 3));
      const improvementChance = age <= 22 ? 0.25 : age <= 28 ? 0.10 : 0.03;
      const talent = getRandomInt(10, 50);
      const personalities = ['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL'];
      const personality = getRandomFrom(personalities);
      await prisma.player.create({
        data: {
          name,
          clubId: clubMap[club.name].id,
          position,
          skill,
          age,
          nationality,
          morale,
          injured: false,
          internationalCaps: 0,
          onInternationalDuty: false,
          wage,
          contractExpiry,
          contractStart: new Date(),
          improvementChance,
          talent,
          personality,
          potential: skill + getRandomInt(0, 10),
          currentPotential: skill
        },
      });
      lowerNationalityCount[nationality] = (lowerNationalityCount[nationality] || 0) + 1;
      lowerPlayerCount++;
    }
  }
  // If not exactly 2000, add the remainder to random clubs
  while (lowerPlayerCount < totalLowerPlayers) {
    const club = getRandomFrom(allClubs) as { name: string; country: string };
    const nationality = getRandomFrom(nationalityPools);
    const name = `${getRandomFrom(firstNames)} ${getRandomFrom(lastNames)}`;
    const position = getRandomFrom(['GK', 'DEF', 'MID', 'FWD']);
    const age = getRandomInt(16, 28);
    const skill = getRandomInt(35, 60);
    const morale = getRandomInt(50, 80);
    const wage = getRandomInt(500, 4000);
    const contractExpiry = new Date();
    contractExpiry.setFullYear(contractExpiry.getFullYear() + getRandomInt(1, 3));
    const improvementChance = age <= 22 ? 0.25 : age <= 28 ? 0.10 : 0.03;
    const talent = getRandomInt(10, 50);
    const personalities = ['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL'];
    const personality = getRandomFrom(personalities);
    await prisma.player.create({
      data: {
        name,
        clubId: clubMap[club.name].id,
        position,
        skill,
        age,
        nationality,
        morale,
        injured: false,
        internationalCaps: 0,
        onInternationalDuty: false,
        wage,
        contractExpiry,
        contractStart: new Date(),
        improvementChance,
        talent,
        personality,
        potential: skill + getRandomInt(0, 10),
        currentPotential: skill
      },
    });
    lowerNationalityCount[nationality] = (lowerNationalityCount[nationality] || 0) + 1;
    lowerPlayerCount++;
  }

  console.log('Seeded foreign players:');
  for (const [nat, count] of Object.entries(nationalityCount)) {
    console.log(`${nat}: ${count}`);
  }
  console.log('Seeded lower-stat foreign players:');
  for (const [nat, count] of Object.entries(lowerNationalityCount)) {
    console.log(`${nat}: ${count}`);
  }

  // Add 1000 Dutch free agent players (no club)
  const dutchFirstNames = ['Daan', 'Luuk', 'Jesse', 'Sem', 'Finn', 'Lars', 'Milan', 'Bram', 'Thijs', 'Ruben', 'Sven', 'Ties', 'Jens', 'Mees', 'Gijs', 'Teun', 'Noah', 'Sam', 'Tom', 'Max'];
  const dutchLastNames = ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Bruin'];
  let dutchFreeAgentCount = 0;
  for (let i = 0; i < 1000; i++) {
    const name = `${getRandomFrom(dutchFirstNames)} ${getRandomFrom(dutchLastNames)}`;
    const position = getRandomFrom(['GK', 'DEF', 'MID', 'FWD']);
    const age = getRandomInt(16, 36);
    const skill = getRandomInt(40, 85);
    const morale = getRandomInt(50, 90);
    const wage = getRandomInt(1000, 8000);
    const personality = getRandomFrom(['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL']);
    // Ambition: weighted random (1-5, most players 2-4)
    const ambition = (() => {
      const r = Math.random();
      if (r < 0.15) return 1;
      if (r < 0.40) return 2;
      if (r < 0.75) return 3;
      if (r < 0.92) return 4;
      return 5;
    })();
    await prisma.player.create({
      data: {
        name,
        position,
        age,
        skill,
        morale,
        wage,
        nationality: 'Netherlands',
        contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contractStart: new Date(),
        personality,
        improvementChance: age <= 22 ? 0.25 : age <= 28 ? 0.10 : 0.03,
        talent: getRandomInt(10, 90),
        ambition, // store ambition
        potential: skill + getRandomInt(0, 10),
        currentPotential: skill
      },
    });
    dutchFreeAgentCount++;
  }
  console.log(`Seeded ${dutchFreeAgentCount} Dutch free agent players (no club)`);

  // Assign Dutch free agents to clubs with advanced realism
  const dutchFreeAgents = await prisma.player.findMany({
    where: { nationality: 'Netherlands', clubId: null },
  });
  const allDutchClubs = await prisma.club.findMany({
    where: {
      league: {
        name: {
          in: [
            'Eredivisie',
            'Eerste Divisie',
            'Tweede Divisie',
            'Derde Divisie',
            'Vierde Divisie',
            'Vijfde Klasse',
          ],
        },
      },
    },
    include: { league: true },
  });
  let assignedCount = 0;
  for (const player of dutchFreeAgents) {
    const playerRep = getPlayerReputationLevel(player.skill);
    const age = player.age;
    const ambition = player.ambition ?? 3;
    const personality = player.personality;
    const wage = player.wage;
    // Assign a region to the player (hidden var)
    const playerRegion = getRandomDutchRegion();
    // International experience
    const isInternational = player.internationalCaps && player.internationalCaps > 0;
    // Determine max drop based on age, ambition, international
    let maxDrop = 0;
    if (isInternational) maxDrop = 0;
    else if (age < 25) maxDrop = ambition >= 4 ? 0 : 1;
    else if (age < 31) maxDrop = ambition >= 5 ? 0 : (ambition >= 4 ? 1 : 2);
    else maxDrop = ambition >= 5 ? 1 : (ambition >= 4 ? 2 : 3);
    const minClubRep = playerRep === 5 || isInternational ? 3 : Math.max(0, playerRep - maxDrop);
    // Score clubs
    let bestScore = -9999;
    let bestClub: any = null;
    for (const club of allDutchClubs) {
      const clubRep = getClubReputationLevel(club.league?.name || '');
      if (playerRep >= 4 && clubRep <= 1) continue;
      if ((playerRep === 5 || isInternational) && clubRep < 3) continue;
      if (!(clubRep >= minClubRep && clubRep <= playerRep + 1)) continue;
      // Region bonus
      let score = 0;
      if (club.regionTag && club.regionTag.includes(playerRegion)) score += 20;
      // Position need bonus
      const posCount = await prisma.player.count({ where: { clubId: club.id, position: player.position } });
      if (posCount < 2) score += 10;
      // Morale/wage fit
      if (!wageFitsClub(wage, club.morale)) { score -= 20; continue; }
      if (club.morale > 70) score += 10;
      // Form bonus
      if (club.form && club.form.startsWith('W')) score += 10;
      // Board expectation/personality fit
      score += boardAmbitionScore(club.boardExpectation, personality, ambition);
      // Wildcard: 0.5% chance to override and allow (unless top international)
      if (score < 0 && Math.random() < 0.005 && playerRep < 5 && !isInternational) score = 1;
      if (score > bestScore) {
        bestScore = score;
        bestClub = club;
      }
    }
    if (bestClub && bestScore > 0) {
      await prisma.player.update({ where: { id: player.id }, data: { clubId: bestClub.id } });
      assignedCount++;
    }
  }
  console.log(`Assigned ${assignedCount} Dutch free agents to clubs with advanced realism.`);

  console.log('Done!');
}

if (require.main === module) {
  seedForeignPlayers(prisma).then(() => {
    console.log('✅ Foreign players and Dutch free agents seeded!');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} 