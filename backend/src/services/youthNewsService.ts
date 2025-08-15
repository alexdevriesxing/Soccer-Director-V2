// Youth News Service (stubbed)
// TODO: Replace with implementation aligned to current Prisma schema once models are defined

type YouthNews = {
  id: number;
  playerId?: number;
  clubId?: number;
  type: string;
  headline: string;
  content: string;
  createdAt: Date;
};

let newsSeq = 1;
const inMemoryNews: YouthNews[] = [];

// Create a news item
export const createNews = async (data: { playerId?: number; clubId?: number; type: string; headline: string; content: string }) => {
  const item: YouthNews = { id: newsSeq++, createdAt: new Date(), ...data };
  inMemoryNews.push(item);
  return item;
};

// Fetch all news for a player
export const getNewsForPlayer = async (playerId: number) => {
  return inMemoryNews.filter(n => n.playerId === playerId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Fetch all news for a club
export const getNewsForClub = async (clubId: number) => {
  return inMemoryNews.filter(n => n.clubId === clubId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Search news by type or keyword
export const searchNews = async (query: { type?: string; keyword?: string }) => {
  let results = inMemoryNews.slice();
  if (query.type) results = results.filter(n => n.type === query.type);
  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    results = results.filter(n => n.headline.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw));
  }
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};