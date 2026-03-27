// Stub in-memory store
const chemistryStore = new Map<number, any>();

export const SquadChemistryService = {
  getSquadChemistry: async (clubId: number) => {
    return chemistryStore.get(clubId) || { clubId, score: 50, notes: '' };
  },

  updateSquadChemistry: async (clubId: number, score: number, notes?: string) => {
    const chemistry = { clubId, score, notes };
    chemistryStore.set(clubId, chemistry);
    return chemistry;
  },

  calculateSquadChemistry: async (_clubId: number, _context: any) => {
    return 50; // Stub implementation
  },

  // Alias for compatibility
  setSquadChemistry: async (clubId: number, score: number, notes?: string) => {
    return SquadChemistryService.updateSquadChemistry(clubId, score, notes);
  }
};