// Player Habit Service - stub since playerHabit model doesn't exist

interface PlayerHabit {
  id: number;
  playerId: number;
  type: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: number;
}

const habitsStore: Map<number, PlayerHabit> = new Map();
let nextId = 1;

export async function getPlayerHabits(playerId: number) {
  return Array.from(habitsStore.values()).filter(h => h.playerId === playerId);
}

export async function addPlayerHabit(data: {
  playerId: number;
  type: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: number;
}) {
  const habit: PlayerHabit = {
    id: nextId++,
    ...data
  };
  habitsStore.set(habit.id, habit);
  return habit;
}

export async function removePlayerHabit(habitId: number) {
  habitsStore.delete(habitId);
}

export async function updatePlayerHabit(habitId: number, data: Partial<PlayerHabit>) {
  const existing = habitsStore.get(habitId);
  if (!existing) throw new Error('Habit not found');
  const updated = { ...existing, ...data };
  habitsStore.set(habitId, updated);
  return updated;
}

// Generate random habit for development simulation
export async function generateRandomHabit(playerId: number) {
  const habits = [
    { type: 'training', description: 'Dedicated to extra training', impact: 'positive' as const, severity: 7 },
    { type: 'lifestyle', description: 'Party lifestyle affecting performance', impact: 'negative' as const, severity: 5 },
    { type: 'discipline', description: 'Natural leader in the dressing room', impact: 'positive' as const, severity: 8 }
  ];
  const randomHabit = habits[Math.floor(Math.random() * habits.length)];
  return addPlayerHabit({ playerId, ...randomHabit });
}