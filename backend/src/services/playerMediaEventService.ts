// Player Media Event Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a media event for a player
export const createMediaEvent = async (playerId: number, type: string, headline: string, content: string) => {
  return prisma.playerMediaEvent.create({
    data: { playerId, type, headline, content }
  });
};

// Update a media event (e.g., set headline or content)
export const updateMediaEvent = async (eventId: number, data: { headline?: string; content?: string }) => {
  return prisma.playerMediaEvent.update({
    where: { id: eventId },
    data
  });
};

// Fetch all media events for a player
export const getMediaEventsForPlayer = async (playerId: number) => {
  return prisma.playerMediaEvent.findMany({ where: { playerId } });
};

// Utility: Maybe trigger a media event for a player (to be called after habit/story events)
export async function maybeTriggerMediaEvent(playerId: number, context: string) {
  // 20% chance to trigger a scandal after a poor habit
  if (context === 'scandal' && Math.random() < 0.2) {
    const event = await createMediaEvent(playerId, 'scandal', 'Caught on camera at nightclub', 'Player was seen partying after a loss.');
    return { event, effect: { reputation: -5, morale: -3 } };
  }
  // 10% chance to trigger a viral interview after an ambition story
  if (context === 'ambition' && Math.random() < 0.1) {
    const event = await createMediaEvent(playerId, 'interview', 'Ambitious interview goes viral', 'Player expressed desire to play for a top club.');
    return { event, effect: { reputation: +3 } };
  }
  return null;
} 