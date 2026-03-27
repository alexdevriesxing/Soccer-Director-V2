// Player Media Event Service
// Player Media Event Service - Stubbed
// Stub in-memory store
const mediaStore = new Map<number, any[]>();

export const PlayerMediaEventService = {
  getEvents: async (playerId: number) => {
    return mediaStore.get(playerId) || [];
  },

  createEvent: async (playerId: number, description: string) => {
    const events = mediaStore.get(playerId) || [];
    const event = { id: Date.now(), playerId, description, date: new Date() };
    events.push(event);
    mediaStore.set(playerId, events);
    return event;
  }
};
export const getMediaEventsForPlayer = PlayerMediaEventService.getEvents;
export const createMediaEvent = PlayerMediaEventService.createEvent;

// Utility: Maybe trigger a media event for a player (to be called after habit/story events)
export async function maybeTriggerMediaEvent(playerId: number, context: string) {
  // 20% chance to trigger a scandal after a poor habit
  if (context === 'scandal' && Math.random() < 0.2) {
    const event = await createMediaEvent(playerId, 'Caught on camera at nightclub'); // Simplified for stub
    return { event, effect: { reputation: -5, morale: -3 } };
  }
  // 10% chance to trigger a viral interview after an ambition story
  if (context === 'ambition' && Math.random() < 0.1) {
    const event = await createMediaEvent(playerId, 'Ambitious interview goes viral');
    return { event, effect: { reputation: +3 } };
  }
  return null;
} 