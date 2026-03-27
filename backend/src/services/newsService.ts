// News Service - uses in-memory storage since NewsItem and ManagerDecision models don't exist

interface NewsItem {
  id: number;
  clubId: number;
  title: string;
  content: string;
  type: string;
  date: Date;
  isRead: boolean;
}

interface ManagerDecision {
  id: number;
  clubId: number;
  type: string;
  description: string;
  options: string[];
  deadline: Date;
  resolved: boolean;
  chosenOption?: string;
}

const newsStore: Map<number, NewsItem> = new Map();
const decisionsStore: Map<number, ManagerDecision> = new Map();
let nextNewsId = 1;
let nextDecisionId = 1;

// Create a news item
export async function createNewsItem(data: {
  clubId: number;
  title: string;
  content: string;
  type: string;
}): Promise<NewsItem> {
  const item: NewsItem = {
    id: nextNewsId++,
    clubId: data.clubId,
    title: data.title,
    content: data.content,
    type: data.type,
    date: new Date(),
    isRead: false
  };
  newsStore.set(item.id, item);
  return item;
}

// Get news items for a club
export async function getNewsForClub(clubId: number, limit = 20): Promise<NewsItem[]> {
  return Array.from(newsStore.values())
    .filter(n => n.clubId === clubId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

// Mark news as read
export async function markNewsAsRead(newsId: number): Promise<void> {
  const item = newsStore.get(newsId);
  if (item) {
    item.isRead = true;
    newsStore.set(newsId, item);
  }
}

// Create a manager decision
export async function createDecision(data: {
  clubId: number;
  type: string;
  description: string;
  options: string[];
  deadline: Date;
}): Promise<ManagerDecision> {
  const decision: ManagerDecision = {
    id: nextDecisionId++,
    clubId: data.clubId,
    type: data.type,
    description: data.description,
    options: data.options,
    deadline: data.deadline,
    resolved: false
  };
  decisionsStore.set(decision.id, decision);
  return decision;
}

// Get pending decisions for a club
export async function getPendingDecisions(clubId: number): Promise<ManagerDecision[]> {
  return Array.from(decisionsStore.values())
    .filter(d => d.clubId === clubId && !d.resolved);
}

// Resolve a decision
export async function resolveDecision(decisionId: number, chosenOption: string): Promise<ManagerDecision> {
  const decision = decisionsStore.get(decisionId);
  if (!decision) throw new Error('Decision not found');

  decision.resolved = true;
  decision.chosenOption = chosenOption;
  decisionsStore.set(decisionId, decision);
  return decision;
}

// Generate automatic news based on events
export async function generateTransferNews(clubId: number, playerName: string, fromClub: string, toClub: string, fee: number): Promise<NewsItem> {
  return createNewsItem({
    clubId,
    title: `Transfer: ${playerName}`,
    content: `${playerName} has moved from ${fromClub} to ${toClub} for €${fee.toLocaleString()}.`,
    type: 'transfer'
  });
}

export async function generateMatchNews(clubId: number, homeTeam: string, awayTeam: string, homeScore: number, awayScore: number): Promise<NewsItem> {
  return createNewsItem({
    clubId,
    title: `Match Result: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
    content: `${homeTeam} faced ${awayTeam} in an exciting match that ended ${homeScore}-${awayScore}.`,
    type: 'match'
  });
}