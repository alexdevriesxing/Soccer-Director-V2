// Player Relationship Service - Stubbed
// Stub in-memory store
const relationshipsStore = new Map<number, any[]>();

export const PlayerRelationshipService = {
  getRelationships: async (playerId: number) => {
    return relationshipsStore.get(playerId) || [];
  },

  createRelationship: async (playerId: number, targetId: number, type: string) => {
    const rels = relationshipsStore.get(playerId) || [];
    const rel = { id: Date.now(), playerId, targetId, type, strength: 50 };
    rels.push(rel);
    relationshipsStore.set(playerId, rels);
    return rel;
  }
};
export const getRelationships = PlayerRelationshipService.getRelationships;
export const createRelationship = PlayerRelationshipService.createRelationship;
export const updateRelationship = async (id: number, data: any) => { return { id, ...data }; };