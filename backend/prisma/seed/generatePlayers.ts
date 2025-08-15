import { PrismaClient } from '@prisma/client';

const dutchFirstNames = [
  'Jan', 'Piet', 'Klaas', 'Henk', 'Willem', 'Johan', 'Marco', 'Ruud', 'Dennis', 'Patrick', 'Frank', 'Ronald', 'Edwin', 'Jaap', 'Clarence', 'Lars', 'Tim', 'Kevin', 'Mike', 'Tom',
  'Sven', 'Bart', 'Daan', 'Jasper', 'Bas', 'Rik', 'Niels', 'Jeroen', 'Martijn', 'Stefan', 'Sander', 'Rob', 'Erik', 'Mark', 'Joost', 'Maarten', 'Bram', 'Thijs', 'Luuk', 'Gijs', 'Timo'
];
const dutchLastNames = [
  'de Vries', 'Jansen', 'de Jong', 'van den Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer',
  'van der Meer', 'van der Linden', 'van Dam', 'van der Veen', 'van der Heijden', 'van der Wal', 'van der Laan', 'van der Meulen', 'van der Pol', 'van der Hoek'
];

const foreignPools = [
  { country: 'England', first: ['Jack', 'Harry', 'Charlie', 'George', 'Oscar', 'James', 'William', 'Thomas', 'Henry', 'Oliver'], last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Evans', 'Thomas'] },
  { country: 'Turkey', first: ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Yusuf', 'Murat'], last: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Öztürk'] },
  { country: 'Morocco', first: ['Mohamed', 'Youssef', 'Omar', 'Ahmed', 'Rachid', 'Said', 'Khalid', 'Abdel', 'Hicham', 'Nabil'], last: ['El Amrani', 'Bouazza', 'El Idrissi', 'Ait Ben', 'El Yousfi', 'Bennani', 'El Fassi', 'El Ghazali', 'El Haddaoui', 'El Khatib'] },
  { country: 'France', first: ['Lucas', 'Hugo', 'Louis', 'Gabriel', 'Arthur', 'Jules', 'Adam', 'Raphaël', 'Léo', 'Paul'], last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'] },
  { country: 'Germany', first: ['Lukas', 'Leon', 'Finn', 'Jonas', 'Paul', 'Elias', 'Noah', 'Ben', 'Maximilian', 'Felix'], last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schäfer'] },
  { country: 'Belgium', first: ['Lucas', 'Louis', 'Liam', 'Noah', 'Jules', 'Arthur', 'Adam', 'Victor', 'Gabriel', 'Hugo'], last: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Goossens', 'Lambert', 'Dupont', 'Simon'] },
  { country: 'Spain', first: ['Alejandro', 'Daniel', 'Pablo', 'Adrián', 'David', 'Javier', 'Sergio', 'Carlos', 'Diego', 'Álvaro'], last: ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'González', 'Rodríguez', 'Fernández', 'Moreno', 'Muñoz'] },
  { country: 'Indonesia', first: ['Agus', 'Budi', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hadi', 'Indra', 'Joko', 'Kartika'], last: ['Santoso', 'Wijaya', 'Saputra', 'Putra', 'Pratama', 'Utami', 'Wibowo', 'Setiawan', 'Sari', 'Susanto'] },
  { country: 'Africa', first: ['Samuel', 'Emmanuel', 'Kwame', 'Kofi', 'Abdul', 'Mohammed', 'Ibrahim', 'Moussa', 'Amadou', 'Youssouf'], last: ['Mensah', 'Owusu', 'Osei', 'Abebe', 'Diallo', 'Traoré', 'Diop', 'Ndiaye', 'Camara', 'Touré'] },
  { country: 'Arab', first: ['Omar', 'Ali', 'Youssef', 'Ahmed', 'Hassan', 'Mahmoud', 'Khaled', 'Sami', 'Fadi', 'Tariq'], last: ['Al-Farsi', 'Al-Masri', 'Al-Haddad', 'Al-Khalil', 'Al-Amin', 'Al-Sayed', 'Al-Sharif', 'Al-Tamimi', 'Al-Zahrani', 'Al-Qahtani'] }
];

const positions = [
  { pos: 'GK', count: 3 },
  { pos: 'DEF', count: 8 },
  { pos: 'MID', count: 8 },
  { pos: 'FWD', count: 6 }
];

export function getRandomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNationality(index: number, total: number): string {
  // 65% Dutch, 35% foreign (mixed)
  if (index < Math.floor(total * 0.65)) return 'Netherlands';
  // Pick a random foreign pool
  const pool = foreignPools[getRandomInt(0, foreignPools.length - 1)];
  return pool.country;
}

function getName(nationality: string): string {
  if (nationality === 'Netherlands') {
    return `${getRandomFrom(dutchFirstNames)} ${getRandomFrom(dutchLastNames)}`;
  }
  const pool = foreignPools.find(p => p.country === nationality);
  if (pool) {
    return `${getRandomFrom(pool.first)} ${getRandomFrom(pool.last)}`;
  }
  // fallback
  return `${getRandomFrom(dutchFirstNames)} ${getRandomFrom(dutchLastNames)}`;
}

function getRandomPersonality(): 'LAZY' | 'BELOW_AVERAGE' | 'PROFESSIONAL' | 'DRIVEN' | 'NATURAL' {
  const roll = Math.random();
  if (roll < 0.05) return 'LAZY';
  if (roll < 0.35) return 'BELOW_AVERAGE';
  if (roll < 0.75) return 'PROFESSIONAL';
  if (roll < 0.95) return 'DRIVEN';
  return 'NATURAL';
}

export async function generatePlayersForClub(prisma: PrismaClient, clubId: number, options: { o21?: boolean } = {}) {
  const squadSize = 25;
  let playerIndex = 0;
  for (const { pos, count } of positions) {
    for (let i = 0; i < count; i++) {
      if (playerIndex >= squadSize) break;
      const nationality = getNationality(playerIndex, squadSize);
      const name = getName(nationality);
      const age = options.o21 ? getRandomInt(16, 21) : getRandomInt(18, 34);
      // Skill: O21 (45-75), others (50-90, with some variance)
      const skill = options.o21
        ? getRandomInt(45, 75)
        : getRandomInt(50, 90) + (pos === 'GK' ? getRandomInt(-5, 5) : 0);
      const morale = getRandomInt(60, 90);
      const wage = options.o21 ? getRandomInt(500, 2000) : getRandomInt(1500, 10000);
      const contractExpiry = new Date();
      contractExpiry.setFullYear(contractExpiry.getFullYear() + getRandomInt(1, 4));
      // Skill improvement chance by age
      let improvementChance = 0.01;
      if (age >= 16 && age <= 22) improvementChance = 0.25;
      else if (age >= 23 && age <= 28) improvementChance = 0.10;
      else if (age >= 29 && age <= 32) improvementChance = 0.05;
      // 33+ stays at 0.01
      const talent = getRandomInt(0, 100);
      const personality = getRandomPersonality();
      await prisma.player.create({
        data: {
          name,
          clubId,
          position: pos,
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
        }
      });
      playerIndex++;
    }
  }
  // Fill up to 25 if needed
  while (playerIndex < squadSize) {
    const nationality = getNationality(playerIndex, squadSize);
    const name = getName(nationality);
    const pos = getRandomFrom(['DEF', 'MID', 'FWD']);
    const age = options.o21 ? getRandomInt(16, 21) : getRandomInt(18, 34);
    const skill = options.o21
      ? getRandomInt(45, 75)
      : getRandomInt(50, 90);
    const morale = getRandomInt(60, 90);
    const wage = options.o21 ? getRandomInt(500, 2000) : getRandomInt(1500, 10000);
    const contractExpiry = new Date();
    contractExpiry.setFullYear(contractExpiry.getFullYear() + getRandomInt(1, 4));
    let improvementChance = 0.01;
    if (age >= 16 && age <= 22) improvementChance = 0.25;
    else if (age >= 23 && age <= 28) improvementChance = 0.10;
    else if (age >= 29 && age <= 32) improvementChance = 0.05;
    const talent = getRandomInt(0, 100);
    const personality = getRandomPersonality();
    await prisma.player.create({
      data: {
        name,
        clubId,
        position: pos,
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
      }
    });
    playerIndex++;
  }
} 