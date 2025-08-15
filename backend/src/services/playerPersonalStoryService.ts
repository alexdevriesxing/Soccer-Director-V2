// Player Personal Story Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a personal story for a player
export const createPersonalStory = async (playerId: number, type: string, description: string, startDate: Date, endDate?: Date) => {
  return prisma.playerPersonalStory.create({
    data: { playerId, type, description, startDate, endDate }
  });
};

// Update a personal story (e.g., set endDate or description)
export const updatePersonalStory = async (storyId: number, data: { endDate?: Date; description?: string }) => {
  return prisma.playerPersonalStory.update({
    where: { id: storyId },
    data
  });
};

// Fetch all personal stories for a player
export const getPersonalStoriesForPlayer = async (playerId: number) => {
  return prisma.playerPersonalStory.findMany({ where: { playerId } });
};

// Utility: Maybe trigger a personal story for a player (to be called in weekly simulation)
export async function maybeTriggerPersonalStory(playerId: number) {
  // 5% chance per week
  if (Math.random() < 0.05) {
    const types = ['family', 'adversity', 'ambition'];
    const type = types[Math.floor(Math.random() * types.length)];
    let description = '';
    let effects: any = {};
    if (type === 'family') {
      description = 'Family member fell ill, affecting focus.';
      effects = { morale: -5 };
    } else if (type === 'adversity') {
      description = 'Overcame a tough period in training.';
      effects = { morale: +5 };
    } else if (type === 'ambition') {
      description = 'Expressed ambition to play for a top club.';
      effects = { ambition: +1 };
    }
    const story = await createPersonalStory(playerId, type, description, new Date());
    return { story, effects };
  }
  return null;
} 