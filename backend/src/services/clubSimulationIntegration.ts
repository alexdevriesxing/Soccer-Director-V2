import { BoardroomService } from './boardroomService';
import { FanService } from './fanService';

interface MatchResult {
  result: string;
  [key: string]: any;
}
interface BoardContext {
  recentResults: any[];
  finances: any;
  crisis?: boolean;
  [key: string]: any;
}
interface Transfer {
  type: string;
  star?: boolean;
  [key: string]: any;
}
interface BoardDecision {
  unpopular?: boolean;
  [key: string]: any;
}

/**
 * Call after a match is played.
 * Updates fan sentiment, triggers fan/board events, recalculates satisfaction.
 */
export async function onMatchPlayed({ clubId, fanGroupId, matchResult, boardContext }: {
  clubId: number;
  fanGroupId: number;
  matchResult: MatchResult;
  boardContext: BoardContext;
}) {
  // Update fan sentiment
  const sentiment = await FanService.calculateFanSentiment(fanGroupId, { matchResults: [matchResult], transfers: [], boardDecisions: [] });
  await FanService.triggerFanEventIfNeeded(fanGroupId, { sentiment, recentEvents: [matchResult] });
  // Recalculate board satisfaction
  await BoardroomService.calculateBoardSatisfaction(clubId);
  await BoardroomService.triggerBoardMeetingIfNeeded(clubId, boardContext);
}

/**
 * Call after a transfer (in or out).
 */
export async function onTransfer({ clubId, fanGroupId, transfer, boardContext }: {
  clubId: number;
  fanGroupId: number;
  transfer: Transfer;
  boardContext: BoardContext;
}) {
  // Update fan sentiment
  const sentiment = await FanService.calculateFanSentiment(fanGroupId, { matchResults: [], transfers: [transfer], boardDecisions: [] });
  await FanService.triggerFanEventIfNeeded(fanGroupId, { sentiment, recentEvents: [transfer] });
  // Recalculate board satisfaction
  await BoardroomService.calculateBoardSatisfaction(clubId);
}

/**
 * Call after a board decision (e.g., sacking manager, stadium expansion).
 */
export async function onBoardDecision({ clubId, fanGroupId, boardDecision }: {
  clubId: number;
  fanGroupId: number;
  boardDecision: BoardDecision;
}) {
  // Update fan sentiment
  const sentiment = await FanService.calculateFanSentiment(fanGroupId, { matchResults: [], transfers: [], boardDecisions: [boardDecision] });
  await FanService.triggerFanEventIfNeeded(fanGroupId, { sentiment, recentEvents: [boardDecision] });
  // Recalculate board satisfaction
  await BoardroomService.calculateBoardSatisfaction(clubId);
}

/**
 * Call at the end of each week (or month) for regular updates.
 */
export async function onWeeklyUpdate({ clubId, fanGroupId, clubPerformance, engagement }: {
  clubId: number;
  fanGroupId: number;
  clubPerformance: number;
  engagement: number;
}) {
  await BoardroomService.updateBoardObjectives(clubId);
  await BoardroomService.handleBoardMemberTurnover(clubId);
  await FanService.updateFanGroupSize(fanGroupId, { clubPerformance, engagement });
  // Optionally, apply fan pressure
  const sentiment = await FanService.calculateFanSentiment(fanGroupId, { matchResults: [], transfers: [], boardDecisions: [] });
  await FanService.applyFanPressure(clubId, { sentiment });
} 