// Youth Intake Service (stubbed)
// TODO: Re-implement against competition-based schema. This in-memory stub avoids Prisma schema mismatches.
import { generateScoutingReport } from './youthScoutingService';

type IntakeEvent = { id: number; clubId: number; type: string; year: number };
let intakeSeq = 1;
const intakeEvents: IntakeEvent[] = [];

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

const personalityOptions = [
  'LAZY',
  'BELOW_AVERAGE',
  'PROFESSIONAL',
  'DRIVEN',
  'NATURAL'
];

async function generateYouthPlayers(clubId: number, count: number) {
  // Try to use scouting reports
  const reports = await generateScoutingReport(clubId);
  const scoutedProspects = reports.flatMap(r => r.prospects);
  const players: Array<{
    id: number;
    clubId: number;
    firstName: string;
    lastName: string;
    position: string;
    age: number;
    skill: number;
    talent: number;
    personality: string;
    nationality: string;
  }> = [];
  let playerSeq = 1;
  for (let i = 0; i < count; i++) {
    let playerData;
    if (scoutedProspects.length > 0 && Math.random() < 0.7) {
      // 70% chance to use a scouted prospect if available
      const prospect = scoutedProspects.splice(Math.floor(Math.random() * scoutedProspects.length), 1)[0];
      const [firstName, ...rest] = String(prospect.name).split(' ');
      const lastName = rest.join(' ') || 'Youth';
      playerData = {
        firstName,
        lastName,
        position: prospect.position,
        age: prospect.age,
        skill: prospect.skill,
        talent: prospect.talent,
        personality: prospect.personality,
        nationality: prospect.nationality
      };
    } else {
      // Fallback to random
      const firstName = randomFromArray(firstNames);
      const lastName = randomFromArray(lastNames);
      const position = randomFromArray(positions);
      const age = getRandomInt(15, 18);
      const skill = getRandomInt(35, 55);
      const talent = getRandomInt(skill + 10, 90);
      const personality = randomFromArray(personalityOptions);
      const nationality = randomFromArray(nationalities);
      playerData = { firstName, lastName, position, age, skill, talent, personality, nationality };
    }
    players.push({
      id: playerSeq++,
      clubId,
      firstName: playerData.firstName,
      lastName: playerData.lastName,
      position: playerData.position,
      age: playerData.age,
      skill: playerData.skill,
      talent: playerData.talent,
      personality: playerData.personality,
      nationality: playerData.nationality,
    });
  }
  return players;
}

export const triggerIntakeEvent = async (clubId: number, type: string, year: number) => {
  const event: IntakeEvent = { id: intakeSeq++, clubId, type, year };
  intakeEvents.push(event);
  const newPlayers = await generateYouthPlayers(clubId, 5);
  return { event, newPlayers };
};

export const getIntakeHistory = async (clubId: number) => {
  return intakeEvents.filter(e => e.clubId === clubId).sort((a, b) => b.year - a.year);
};

// Automation logic placeholder
export const automateIntake = async (clubId: number) => {
  const year = new Date().getFullYear();
  const existing = intakeEvents.find(e => e.clubId === clubId && e.year === year);
  if (!existing) {
    const event: IntakeEvent = { id: intakeSeq++, clubId, year, type: 'auto' };
    intakeEvents.push(event);
    await generateYouthPlayers(clubId, 5);
    return { event, generated: 5 };
  }
  return { event: existing, generated: 0 };
};