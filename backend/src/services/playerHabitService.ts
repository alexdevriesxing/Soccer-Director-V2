// Player Habit Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a habit for a player
export const createHabit = async (playerId: number, habit: string, value: string) => {
  return prisma.playerHabit.create({
    data: { playerId, habit, value }
  });
};

// Update a habit (e.g., set value or lastUpdated)
export const updateHabit = async (habitId: number, data: { value?: string; lastUpdated?: Date }) => {
  return prisma.playerHabit.update({
    where: { id: habitId },
    data
  });
};

// Fetch all habits for a player
export const getHabitsForPlayer = async (playerId: number) => {
  return prisma.playerHabit.findMany({ where: { playerId } });
};

// Utility: Maybe update player habits after a match (to be called in match simulation)
export async function maybeUpdatePlayerHabitsAfterMatch(playerId: number, result: 'win' | 'loss') {
  // 10% chance to worsen nightlife after a win, 10% chance to improve diet after a loss
  let effect = null;
  if (result === 'win' && Math.random() < 0.1) {
    // Worsen nightlife
    await updateHabitForType(playerId, 'nightlife', 'poor');
    effect = { nightlife: 'poor' };
  } else if (result === 'loss' && Math.random() < 0.1) {
    // Improve diet
    await updateHabitForType(playerId, 'diet', 'good');
    effect = { diet: 'good' };
  }
  return effect;
}

// Helper to update a specific habit type for a player
async function updateHabitForType(playerId: number, habit: string, value: string) {
  const existing = await prisma.playerHabit.findFirst({ where: { playerId, habit } });
  if (existing) {
    await prisma.playerHabit.update({ where: { id: existing.id }, data: { value, lastUpdated: new Date() } });
  } else {
    await prisma.playerHabit.create({ data: { playerId, habit, value } });
  }
} 