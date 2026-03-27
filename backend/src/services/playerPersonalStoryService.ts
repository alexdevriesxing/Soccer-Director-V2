// Player Personal Story Service
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// Create a personal story for a player
// Player Personal Story Service - Stubbed

// Stub in-memory store
const storiesStore = new Map<number, any[]>();

export const PlayerPersonalStoryService = {
  getStories: async (playerId: number) => {
    return storiesStore.get(playerId) || [];
  },

  createStory: async (playerId: number, type: string, description: string, startDate: Date, endDate?: Date) => {
    const stories = storiesStore.get(playerId) || [];
    const story = { id: Date.now(), playerId, type, description, startDate, endDate };
    stories.push(story);
    storiesStore.set(playerId, stories);
    return story;
  }
};

export const getPersonalStoriesForPlayer = PlayerPersonalStoryService.getStories;
export const createPersonalStory = PlayerPersonalStoryService.createStory;

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