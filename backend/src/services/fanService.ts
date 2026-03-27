// Stub service for Fan models that don't exist in Prisma schema
// Uses in-memory storage

interface FanGroup {
  id: number;
  clubId: number;
  name: string;
  size: number;
  satisfaction: number;
}

interface FanEvent {
  id: number;
  clubId: number;
  type: string;
  description: string;
  date: Date;
}

interface FanSentiment {
  id: number;
  clubId: number;
  sentiment: number;
  date: Date;
}

const fanGroups: Map<number, FanGroup> = new Map();
const fanEvents: Map<number, FanEvent> = new Map();
const fanSentiments: Map<number, FanSentiment> = new Map();
let nextGroupId = 1;
let nextEventId = 1;
let nextSentimentId = 1;

// Fan Group operations
export const getFanGroups = async (clubId: number) =>
  Array.from(fanGroups.values()).filter(g => g.clubId === clubId);

export const createFanGroup = async (data: Omit<FanGroup, 'id'>) => {
  const group = { ...data, id: nextGroupId++ };
  fanGroups.set(group.id, group);
  return group;
};

export const updateFanGroup = async (id: number, data: Partial<FanGroup>) => {
  const existing = fanGroups.get(id);
  if (!existing) throw new Error('Fan group not found');
  const updated = { ...existing, ...data };
  fanGroups.set(id, updated);
  return updated;
};

export const deleteFanGroup = async (id: number) => {
  fanGroups.delete(id);
};

// Fan Event operations
export const getFanEvents = async (clubId: number) =>
  Array.from(fanEvents.values()).filter(e => e.clubId === clubId);

export const createFanEvent = async (data: Omit<FanEvent, 'id'>) => {
  const event = { ...data, id: nextEventId++ };
  fanEvents.set(event.id, event);
  return event;
};

export const updateFanEvent = async (id: number, data: Partial<FanEvent>) => {
  const existing = fanEvents.get(id);
  if (!existing) throw new Error('Fan event not found');
  const updated = { ...existing, ...data };
  fanEvents.set(id, updated);
  return updated;
};

export const deleteFanEvent = async (id: number) => {
  fanEvents.delete(id);
};

// Fan Sentiment operations
export const getFanSentiment = async (clubId: number) =>
  Array.from(fanSentiments.values()).filter(s => s.clubId === clubId);

export const createFanSentiment = async (data: Omit<FanSentiment, 'id'>) => {
  const sentiment = { ...data, id: nextSentimentId++ };
  fanSentiments.set(sentiment.id, sentiment);
  return sentiment;
};

export const updateFanSentiment = async (id: number, data: Partial<FanSentiment>) => {
  const existing = fanSentiments.get(id);
  if (!existing) throw new Error('Fan sentiment not found');
  const updated = { ...existing, ...data };
  fanSentiments.set(id, updated);
  return updated;
};

export const deleteFanSentiment = async (id: number) => {
  fanSentiments.delete(id);
};

// Utility functions
export const calculateOverallSentiment = async (clubId: number): Promise<number> => {
  const sentiments = await getFanSentiment(clubId);
  if (sentiments.length === 0) return 50;
  const total = sentiments.reduce((sum, s) => sum + s.sentiment, 0);
  return Math.round(total / sentiments.length);
};

export const triggerFanReaction = async (clubId: number, eventType: string, description: string): Promise<FanEvent> => {
  return createFanEvent({
    clubId,
    type: eventType,
    description,
    date: new Date()
  });
};