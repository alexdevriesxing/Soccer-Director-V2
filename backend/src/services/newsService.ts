import { PrismaClient, NewsItem, ManagerDecision } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate news items for a match and store them in the database.
 * @param matchId The ID of the match (fixture)
 * @param clubId The club involved
 * @param playerId Optional player involved
 * @param type The type of news (e.g., 'result', 'injury')
 * @param headline The news headline
 * @param content The news content
 */
export async function createNewsItem({ matchId, clubId, playerId, type, headline, content }: {
  matchId?: number;
  clubId?: number;
  playerId?: number;
  type: string;
  headline: string;
  content: string;
}): Promise<NewsItem> {
  try {
    return await prisma.newsItem.create({
      data: {
        fixtureId: matchId,
        clubId,
        playerId,
        type,
        headline,
        content,
      },
    });
  } catch (error) {
    throw new Error('Failed to create news item: ' + (error as Error).message);
  }
}

/**
 * Generate a manager decision for a match and store it in the database.
 * @param matchId The ID of the match (fixture)
 * @param clubId The club involved
 * @param playerId Optional player involved
 * @param type The type of decision (e.g., 'tactical', 'discipline')
 * @param description The decision description
 * @param options The options for the manager (array of strings)
 */
export async function createManagerDecision({ matchId, clubId, playerId, type, description, options }: {
  matchId?: number;
  clubId?: number;
  playerId?: number;
  type: string;
  description: string;
  options: string[];
}): Promise<ManagerDecision> {
  try {
    return await prisma.managerDecision.create({
      data: {
        fixtureId: matchId,
        clubId,
        playerId,
        type,
        description,
        options,
      },
    });
  } catch (error) {
    throw new Error('Failed to create manager decision: ' + (error as Error).message);
  }
}

/**
 * Fetch all news items for a given match.
 */
export async function getNewsItemsByMatch(matchId: number): Promise<NewsItem[]> {
  return prisma.newsItem.findMany({ where: { fixtureId: matchId }, orderBy: { createdAt: 'asc' } });
}

/**
 * Fetch all manager decisions for a given match.
 */
export async function getManagerDecisionsByMatch(matchId: number): Promise<ManagerDecision[]> {
  return prisma.managerDecision.findMany({ where: { fixtureId: matchId }, orderBy: { createdAt: 'asc' } });
}

/**
 * Resolve a manager decision by setting the selected option and marking as resolved.
 */
export async function resolveManagerDecision(decisionId: number, selectedOption: string): Promise<ManagerDecision> {
  return prisma.managerDecision.update({
    where: { id: decisionId },
    data: { selectedOption, resolved: true },
  });
} 