// Youth Scouting Service (stubbed to avoid schema mismatches)
// TODO: Replace with competition-based youth scouting implementation aligned with Prisma schema
// For now, avoid direct Prisma calls that reference removed models/fields.

// In-memory placeholder store during transition
type Scout = { id: number; clubId: number; name: string; region: string | null; ability: number; network: number };
const inMemoryScouts: Scout[] = [];
let scoutSeq = 1;

export const assignScout = async (clubId: number, name: string, region: string, ability: number, network: number) => {
  const scout: Scout = { id: scoutSeq++, clubId, name, region, ability, network };
  inMemoryScouts.push(scout);
  return scout;
};

export const getScouts = async (clubId: number) => {
  return inMemoryScouts.filter(s => s.clubId === clubId);
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const positions = ['GK', 'DEF', 'MID', 'FWD'];
const nationalities = ['Netherlands', 'Germany', 'France', 'England', 'Spain', 'Italy'];
const firstNames = ['Jan', 'Piet', 'Kees', 'Erik', 'Marco', 'Sven', 'Lars', 'Tom', 'Daan', 'Jens'];
const lastNames = ['de Jong', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos'];

export const generateScoutingReport = async (clubId: number) => {
  const scouts = inMemoryScouts.filter(s => s.clubId === clubId);
  const reports = [];
  for (const scout of scouts) {
    const numProspects = Math.max(1, Math.floor((scout.ability + scout.network) / 40)); // 1-5 prospects
    const prospects = [];
    for (let i = 0; i < numProspects; i++) {
      const name = `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`;
      const position = randomFromArray(positions);
      const age = getRandomInt(15, 18);
      // Ability influences minimum skill, network influences max potential
      const minSkill = Math.floor(scout.ability * 0.3) + 30;
      const maxSkill = Math.floor(scout.ability * 0.7) + 50;
      const skill = getRandomInt(minSkill, maxSkill);
      const maxTalent = Math.floor(scout.network * 0.7) + 60;
      const talent = getRandomInt(skill + 10, maxTalent);
      const personality = randomFromArray(['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL']);
      const nationality = scout.region || randomFromArray(nationalities);
      prospects.push({ name, position, age, skill, talent, personality, nationality });
    }
    reports.push({ scout: { id: scout.id, name: scout.name, region: scout.region }, prospects });
  }
  return reports;
};

// Automation logic placeholder
export const automateScouting = async (clubId: number) => {
  const scouts = inMemoryScouts.filter(s => s.clubId === clubId);
  const regions = ['Netherlands', 'Germany', 'France', 'England', 'Spain', 'Italy'];
  const regionCounts: Record<string, number> = {};
  for (const region of regions) regionCounts[region] = 0;
  // Simple balancing
  for (const scout of scouts) {
    if (!scout.region) {
      const targetRegion = Object.entries(regionCounts).sort((a, b) => a[1] - b[1])[0]?.[0] || regions[0];
      scout.region = targetRegion;
      regionCounts[targetRegion]++;
    }
  }
  return { assigned: scouts.length };
};