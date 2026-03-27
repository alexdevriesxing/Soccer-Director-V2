// Stub in-memory store
const familiarityStore = new Map<string, any>();

export const TacticalFamiliarityService = {
  getTacticalFamiliarity: async (clubId: number, tactic: string) => {
    const key = `${clubId} -${tactic} `;
    return familiarityStore.get(key) || { clubId, tactic, familiarity: 0, notes: '' };
  },

  updateTacticalFamiliarity: async (clubId: number, tactic: string, familiarity: number, notes?: string) => {
    const key = `${clubId} -${tactic} `;
    const data = { clubId, tactic, familiarity, notes };
    familiarityStore.set(key, data);
    return data;
  },

  calculateTacticalFamiliarity: async (_clubId: number, _tactic: string, _context: any) => {
    return 50; // Stub implementation
  },

  // Alias for compatibility
  setTacticalFamiliarity: async (clubId: number, tactic: string, familiarity: number, notes?: string) => {
    return TacticalFamiliarityService.updateTacticalFamiliarity(clubId, tactic, familiarity, notes);
  }
};