// Youth Competition Service - stub since youthCompetition model doesn't exist

interface YouthCompetition {
  id: number;
  name: string;
  type: string;
  season: string;
  entries: number[];
}

const competitionsStore: Map<number, YouthCompetition> = new Map();
let nextId = 1;

export async function getYouthCompetitions(_clubId: number) {
  return Array.from(competitionsStore.values());
}

export async function createYouthCompetition(name: string, type: string, season: string) {
  const competition: YouthCompetition = {
    id: nextId++,
    name,
    type,
    season,
    entries: []
  };
  competitionsStore.set(competition.id, competition);
  return competition;
}

export async function enterCompetition(competitionId: number, clubId: number) {
  const competition = competitionsStore.get(competitionId);
  if (!competition) throw new Error('Competition not found');
  competition.entries.push(clubId);
  competitionsStore.set(competitionId, competition);
  return competition;
}

export async function getCompetitionById(id: number) {
  return competitionsStore.get(id) || null;
}

export const listCompetitions = getYouthCompetitions;
export const getCompetitionResults = async (_competitionId: number) => { return []; }; // Stub