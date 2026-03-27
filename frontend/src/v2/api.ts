import {
  ActivePlayerMedicalPlanCode,
  ClubOperationKey,
  DevelopmentPlanFocus,
  DevelopmentPlanTarget,
  MatchBenchPriority,
  MatchFormation,
  MatchLineupPolicy,
  MatchPreMatchInstruction,
  PlayerStatusDirectiveAction,
  RetrainablePosition,
  SquadRegistrationAction,
  SquadRoleAssignment
} from './contracts';
import {
  ApiResponse,
  ClubPulseSnapshot,
  CareerState,
  CareerLeagueOption,
  CareerSummary,
  BoardStatusSnapshot,
  ClubChoice,
  ClubOperationsUpgradeResult,
  ContractActionResult,
  FinanceSnapshot,
  InboxEvent,
  InboxRespondResult,
  LeagueRules,
  MatchPayload,
  PostMatchPayload,
  StandingsRow,
  SquadPlayer,
  SquadPlayerProfile,
  SquadDevelopmentPlanResult,
  SquadMedicalPlanResult,
  SquadRegistrationActionResult,
  SquadPlayerStatusActionResult,
  SquadRetrainingResult,
  SquadRoleAssignmentResult,
  TransferDealResult,
  TransferLoanBuyOptionResult,
  TransferMarketPayload,
  TransferNegotiationResult,
  TransferSaleResult,
  TransferScoutResult,
  TransferShortlistResult
} from './types';

const API_BASE = process.env.REACT_APP_API_BASE || '';

async function parseJsonResponse<T>(response: Response, path: string): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  if (!contentType.includes('application/json')) {
    const looksLikeHtml = /^\s*</.test(bodyText);
    const endpoint = `${API_BASE}/api/v2${path}`;
    const reason = looksLikeHtml
      ? `received HTML instead of JSON from ${endpoint}. Ensure the backend server is running.`
      : `received non-JSON response from ${endpoint}.`;
    throw new Error(`API request failed (HTTP ${response.status}): ${reason}`);
  }

  try {
    return JSON.parse(bodyText) as ApiResponse<T>;
  } catch {
    throw new Error(`API request failed: invalid JSON response from ${API_BASE}/api/v2${path}.`);
  }
}

async function v2Request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v2${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      },
      cache: 'no-store',
      ...init
    });
  } catch {
    throw new Error('Unable to reach the backend API. Start the backend server and retry.');
  }

  const payload = await parseJsonResponse<T>(response, path);
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || `API request failed (HTTP ${response.status}).`);
  }
  return payload.data;
}

export function listCareers(): Promise<CareerSummary[]> {
  return v2Request<CareerSummary[]>('/careers');
}

export function deleteCareer(careerId: string): Promise<{ id: string; managerName: string; deleted: boolean }> {
  return v2Request<{ id: string; managerName: string; deleted: boolean }>(`/careers/${careerId}`, {
    method: 'DELETE'
  });
}

export function listV2Clubs(): Promise<ClubChoice[]> {
  return v2Request<ClubChoice[]>('/clubs');
}

export function createCareer(data: { managerName: string; controlledClubId: number }): Promise<CareerState> {
  return v2Request<CareerState>('/careers', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function getCareerState(careerId: string): Promise<CareerState> {
  return v2Request<CareerState>(`/careers/${careerId}/state`);
}

export function getBoardStatus(careerId: string): Promise<BoardStatusSnapshot> {
  return v2Request<BoardStatusSnapshot>(`/careers/${careerId}/board`);
}

export function getClubPulse(careerId: string): Promise<ClubPulseSnapshot> {
  return v2Request<ClubPulseSnapshot>(`/careers/${careerId}/pulse`);
}

export function submitWeekPlan(
  careerId: string,
  data: {
    trainingFocus: string;
    rotationIntensity: string;
    tacticalMentality: string;
    transferStance: string;
    scoutingPriority: string;
  }
): Promise<unknown> {
  return v2Request(`/careers/${careerId}/week-plan`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function advanceWeek(careerId: string): Promise<CareerState> {
  return v2Request<CareerState>(`/careers/${careerId}/week-advance`, {
    method: 'POST'
  });
}

export function listInbox(careerId: string, status?: string): Promise<InboxEvent[]> {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  return v2Request<InboxEvent[]>(`/careers/${careerId}/inbox${suffix}`);
}

export function respondInbox(careerId: string, eventId: string, optionId: string): Promise<InboxRespondResult> {
  return v2Request<InboxRespondResult>(`/careers/${careerId}/inbox/${eventId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ optionId })
  });
}

export function startMatch(
  careerId: string,
  matchId: string,
  payload?: {
    formation?: MatchFormation;
    lineupPolicy?: MatchLineupPolicy;
    benchPriority?: MatchBenchPriority;
    preMatchInstruction?: MatchPreMatchInstruction;
    startingPlayerIds?: number[];
    benchPlayerIds?: number[];
    captainPlayerId?: number | null;
  }
): Promise<MatchPayload> {
  return v2Request<MatchPayload>(`/careers/${careerId}/matches/${matchId}/start`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}

export function intervene(
  careerId: string,
  matchId: string,
  payload: {
    type: 'MENTALITY_SHIFT' | 'PRESSING_INTENSITY' | 'SUBSTITUTION_TRIGGER' | 'HALFTIME_TEAM_TALK';
    intensity?: number;
    minute?: number;
    note?: string;
    outPlayerId?: number;
    inPlayerId?: number;
    teamTalk?: 'PRAISE' | 'DEMAND_MORE' | 'CALM_FOCUS';
    substitutionReason?: 'FRESH_LEGS' | 'TACTICAL_TWEAK' | 'PROTECT_BOOKING';
  }
): Promise<MatchPayload> {
  return v2Request<MatchPayload>(`/careers/${careerId}/matches/${matchId}/intervene`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getHighlights(careerId: string, matchId: string): Promise<MatchPayload> {
  return v2Request<MatchPayload>(`/careers/${careerId}/matches/${matchId}/highlights`);
}

export function getPostMatch(careerId: string, matchId: string): Promise<PostMatchPayload> {
  return v2Request<PostMatchPayload>(`/careers/${careerId}/matches/${matchId}/post`);
}

export function getStandings(careerId: string, leagueId: number): Promise<StandingsRow[]> {
  return v2Request<StandingsRow[]>(`/careers/${careerId}/standings/${leagueId}`);
}

export function listCareerLeagues(careerId: string): Promise<CareerLeagueOption[]> {
  return v2Request<CareerLeagueOption[]>(`/careers/${careerId}/leagues`);
}

export function getLeagueRules(careerId: string, leagueId: number): Promise<LeagueRules> {
  return v2Request<LeagueRules>(`/careers/${careerId}/standings/${leagueId}/rules`);
}

export function getSquad(careerId: string): Promise<SquadPlayer[]> {
  return v2Request<SquadPlayer[]>(`/careers/${careerId}/squad`);
}

export function getSquadPlayerProfile(careerId: string, playerId: number): Promise<SquadPlayerProfile> {
  return v2Request<SquadPlayerProfile>(`/careers/${careerId}/squad/${playerId}`);
}

export function assignSquadRole(
  careerId: string,
  playerId: number,
  payload: { roleAssignment: SquadRoleAssignment }
): Promise<SquadRoleAssignmentResult> {
  return v2Request<SquadRoleAssignmentResult>(`/careers/${careerId}/squad/${playerId}/role`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function setSquadPlayerDevelopmentPlan(
  careerId: string,
  playerId: number,
  payload: {
    focus: DevelopmentPlanFocus;
    target: DevelopmentPlanTarget;
  }
): Promise<SquadDevelopmentPlanResult> {
  return v2Request<SquadDevelopmentPlanResult>(`/careers/${careerId}/squad/${playerId}/development-plan`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function setSquadPlayerMedicalPlan(
  careerId: string,
  playerId: number,
  payload: { planCode: ActivePlayerMedicalPlanCode | 'CLEAR_PLAN' }
): Promise<SquadMedicalPlanResult> {
  return v2Request<SquadMedicalPlanResult>(`/careers/${careerId}/squad/${playerId}/medical-plan`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function setSquadPlayerStatusAction(
  careerId: string,
  playerId: number,
  payload: { action: PlayerStatusDirectiveAction }
): Promise<SquadPlayerStatusActionResult> {
  return v2Request<SquadPlayerStatusActionResult>(`/careers/${careerId}/squad/${playerId}/status`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function setSquadPlayerRegistrationAction(
  careerId: string,
  playerId: number,
  payload: { action: SquadRegistrationAction }
): Promise<SquadRegistrationActionResult> {
  return v2Request<SquadRegistrationActionResult>(`/careers/${careerId}/squad/${playerId}/registration`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function setSquadPlayerRetrainingPlan(
  careerId: string,
  playerId: number,
  payload: { targetPosition?: RetrainablePosition | null }
): Promise<SquadRetrainingResult> {
  return v2Request<SquadRetrainingResult>(`/careers/${careerId}/squad/${playerId}/retraining`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function renewSquadContract(
  careerId: string,
  playerId: number,
  payload?: { years?: number; wageAdjustmentPct?: number }
): Promise<ContractActionResult> {
  return v2Request<ContractActionResult>(`/careers/${careerId}/squad/${playerId}/renew`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}

export function releaseSquadPlayer(
  careerId: string,
  playerId: number,
  payload?: { compensationWeeks?: number }
): Promise<ContractActionResult> {
  return v2Request<ContractActionResult>(`/careers/${careerId}/squad/${playerId}/release`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}

export function getFinances(careerId: string): Promise<FinanceSnapshot> {
  return v2Request<FinanceSnapshot>(`/careers/${careerId}/finances`);
}

export function upgradeClubOperation(careerId: string, operationKey: ClubOperationKey): Promise<ClubOperationsUpgradeResult> {
  return v2Request<ClubOperationsUpgradeResult>(`/careers/${careerId}/finances/operations`, {
    method: 'POST',
    body: JSON.stringify({ operationKey })
  });
}

export function getTransferMarket(
  careerId: string,
  options?: { limit?: number; position?: string; affordableOnly?: boolean }
): Promise<TransferMarketPayload> {
  const params = new URLSearchParams();
  if (options?.limit !== undefined) params.set('limit', String(options.limit));
  if (options?.position && options.position !== 'ALL') params.set('position', options.position);
  if (options?.affordableOnly) params.set('affordableOnly', 'true');
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return v2Request<TransferMarketPayload>(`/careers/${careerId}/transfer-market${suffix}`);
}

export function signTransfer(careerId: string, playerId: number): Promise<TransferDealResult> {
  return v2Request<TransferDealResult>(`/careers/${careerId}/transfer-market/sign`, {
    method: 'POST',
    body: JSON.stringify({ playerId })
  });
}

export function updateTransferShortlist(
  careerId: string,
  payload: { playerId: number; shortlisted?: boolean }
): Promise<TransferShortlistResult> {
  return v2Request<TransferShortlistResult>(`/careers/${careerId}/transfer-market/shortlist`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function requestTransferScoutReport(careerId: string, playerId: number): Promise<TransferScoutResult> {
  return v2Request<TransferScoutResult>(`/careers/${careerId}/transfer-market/scout`, {
    method: 'POST',
    body: JSON.stringify({ playerId })
  });
}

export function submitTransferOffer(
  careerId: string,
  payload: {
    playerId: number;
    kind: 'PERMANENT' | 'LOAN';
    transferFee?: number;
    weeklyWage?: number;
    loanFee?: number;
    wageContributionPct?: number;
    buyOptionFee?: number;
    loanDurationWeeks?: number;
    sellOnPct?: number;
  }
): Promise<TransferNegotiationResult> {
  return v2Request<TransferNegotiationResult>(`/careers/${careerId}/transfer-market/offer`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function respondTransferOffer(
  careerId: string,
  payload: {
    negotiationId: string;
    action: 'ACCEPT_COUNTER' | 'REVISE' | 'WITHDRAW';
    transferFee?: number;
    weeklyWage?: number;
    loanFee?: number;
    wageContributionPct?: number;
    buyOptionFee?: number;
    loanDurationWeeks?: number;
  }
): Promise<TransferNegotiationResult> {
  return v2Request<TransferNegotiationResult>(`/careers/${careerId}/transfer-market/offer/respond`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function triggerLoanBuyOption(careerId: string, loanId: number): Promise<TransferLoanBuyOptionResult> {
  return v2Request<TransferLoanBuyOptionResult>(`/careers/${careerId}/transfer-market/loan-buy-option`, {
    method: 'POST',
    body: JSON.stringify({ loanId })
  });
}

export function sellTransfer(careerId: string, playerId: number): Promise<TransferSaleResult> {
  return v2Request<TransferSaleResult>(`/careers/${careerId}/transfer-market/sell`, {
    method: 'POST',
    body: JSON.stringify({ playerId })
  });
}

export function saveSlot(careerId: string, slotId: string): Promise<unknown> {
  return v2Request(`/careers/${careerId}/save/${slotId}`, {
    method: 'POST'
  });
}

export function loadSlot(careerId: string, slotId: string): Promise<unknown> {
  return v2Request(`/careers/${careerId}/load/${slotId}`, {
    method: 'POST'
  });
}
