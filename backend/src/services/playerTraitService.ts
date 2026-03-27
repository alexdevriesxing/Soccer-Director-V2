// Player Trait Service - Stubbed
// Stub in-memory store
const traitsStore = new Map<number, any[]>();

export const PlayerTraitService = {
  getPlayerTraits: async (playerId: number) => {
    return traitsStore.get(playerId) || [];
  },

  assignTrait: async (playerId: number, trait: string) => {
    const traits = traitsStore.get(playerId) || [];
    const newTrait = { id: Date.now(), playerId, trait, revealed: false };
    traits.push(newTrait);
    traitsStore.set(playerId, traits);
    return newTrait;
  },

  revealTrait: async (traitId: number) => {
    // In-memory update
    for (const traits of traitsStore.values()) {
      const trait = traits.find(t => t.id === traitId);
      if (trait) {
        trait.revealed = true;
        return trait;
      }
    }
    throw new Error('Trait not found');
  }
};

export const getTraitsForPlayer = PlayerTraitService.getPlayerTraits;
export const assignTrait = PlayerTraitService.assignTrait;
export const revealTrait = PlayerTraitService.revealTrait;