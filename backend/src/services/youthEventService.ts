import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Youth Event Service - handles youth academy events
// Stubbed models that don't exist in schema

interface YouthEvent {
  id: number;
  clubId: number;
  type: string;
  description: string;
  players: number[];
  date: Date;
}

const eventsStore: Map<number, YouthEvent> = new Map();
let nextEventId = 1;

export async function getYouthPlayers(clubId: number) {
  // Get young players (age < 21) from the club
  const players = await prisma.player.findMany({
    where: {
      currentClubId: clubId,
      age: { lt: 21 }
    }
  });
  return players;
}

export async function triggerYouthEvent(clubId: number, eventType: string) {
  const players = await getYouthPlayers(clubId);

  if (players.length === 0) {
    return { message: 'No youth players available for events' };
  }

  const event: YouthEvent = {
    id: nextEventId++,
    clubId,
    type: eventType,
    description: `${eventType} event triggered`,
    players: players.map(p => p.id),
    date: new Date()
  };

  eventsStore.set(event.id, event);

  // Select a random player for the event
  const selectedPlayer = players[Math.floor(Math.random() * players.length)];
  const playerName = `${selectedPlayer.firstName} ${selectedPlayer.lastName}`;

  let result: any = { event, playerName };

  switch (eventType) {
    case 'breakthrough':
      result.description = `${playerName} has shown exceptional talent in training!`;
      result.potentialIncrease = Math.floor(Math.random() * 5) + 1;
      break;
    case 'injury':
      result.description = `${playerName} suffered an injury during youth training`;
      result.injuryDuration = Math.floor(Math.random() * 4) + 1; // weeks
      break;
    case 'promotion':
      result.description = `${playerName} is ready for first-team consideration`;
      break;
    case 'development':
      result.description = `${playerName} has improved their skills`;
      result.skillIncrease = Math.floor(Math.random() * 3) + 1;
      break;
    default:
      result.description = `Youth event: ${eventType}`;
  }

  return result;
}

export async function getYouthEvents(clubId: number) {
  return Array.from(eventsStore.values()).filter(e => e.clubId === clubId);
}

export async function processWeeklyYouthDevelopment(clubId: number) {
  const players = await getYouthPlayers(clubId);
  const results: any[] = [];

  for (const _player of players) {
    // Small chance of development event each week
    if (Math.random() < 0.1) {
      const event = await triggerYouthEvent(clubId, 'development');
      results.push(event);
    }
  }

  return { processed: players.length, events: results };
  return { processed: players.length, events: results };
}

export const generateOffFieldEvent = async (_clubId: number) => { return { description: 'Nothing happened' }; };
export const getEventsForClub = getYouthEvents;
export const interveneInEvent = async (_eventId: number, _decision: string) => { return { success: true }; };