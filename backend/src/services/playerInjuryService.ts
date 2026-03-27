// Player Injury Service - Stubbed
// Stub in-memory store
const injuriesStore = new Map<number, any[]>();

export const PlayerInjuryService = {
  getPlayerInjuries: async (playerId: number) => {
    return injuriesStore.get(playerId) || [];
  },

  createInjury: async (playerId: number, type: string, duration: number) => {
    const injuries = injuriesStore.get(playerId) || [];
    const injury = { id: Date.now(), playerId, type, duration, active: true };
    injuries.push(injury);
    injuriesStore.set(playerId, injuries);
    return injury;
  },

  logInjury: async (playerId: number, type: string, _severity: string, startDate: Date, endDate?: Date, _description?: string) => {
    // Compatibility wrapper
    const duration = endDate ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) : 7;
    return PlayerInjuryService.createInjury(playerId, type, duration);
  }
};
export const logInjury = PlayerInjuryService.logInjury;
export const getInjuriesForPlayer = PlayerInjuryService.getPlayerInjuries;