import { gunzipSync, gzipSync } from 'node:zlib';

export const COMPRESSED_SAVE_SNAPSHOT_PREFIX = 'gz:';
export const MAX_MANUAL_SAVE_SLOTS_PER_CAREER = 8;

export interface SaveSnapshot {
  career: {
    currentDate: string;
    currentPhase: string;
    season: string;
    weekNumber: number;
    activeLeagueId: number | null;
  };
  clubStates: Array<Record<string, unknown>>;
  leagueStates: Array<Record<string, unknown>>;
  playerStates: Array<Record<string, unknown>>;
  fixtures: Array<Record<string, unknown>>;
  weekPlans: Array<Record<string, unknown>>;
  inboxEvents: Array<Record<string, unknown>>;
  eventDecisions: Array<Record<string, unknown>>;
  matches: Array<Record<string, unknown>>;
  highlights: Array<Record<string, unknown>>;
}

export function compressSaveSnapshotPayload(snapshotPayload: string): string {
  const compressedPayload = `${COMPRESSED_SAVE_SNAPSHOT_PREFIX}${gzipSync(snapshotPayload, {
    level: 9
  }).toString('base64')}`;

  return compressedPayload.length < snapshotPayload.length
    ? compressedPayload
    : snapshotPayload;
}

export function decodeSaveSnapshotPayload(snapshotPayload: string): string {
  if (!snapshotPayload.startsWith(COMPRESSED_SAVE_SNAPSHOT_PREFIX)) {
    return snapshotPayload;
  }

  return gunzipSync(
    Buffer.from(snapshotPayload.slice(COMPRESSED_SAVE_SNAPSHOT_PREFIX.length), 'base64')
  ).toString('utf8');
}

export function parseSaveSnapshot(snapshotPayload: string): Partial<SaveSnapshot> {
  return JSON.parse(decodeSaveSnapshotPayload(snapshotPayload)) as Partial<SaveSnapshot>;
}

export function normalizeSaveSnapshot(rawSnapshot: Partial<SaveSnapshot>): SaveSnapshot {
  return {
    career: rawSnapshot.career as SaveSnapshot['career'],
    clubStates: Array.isArray(rawSnapshot.clubStates) ? rawSnapshot.clubStates : [],
    leagueStates: Array.isArray(rawSnapshot.leagueStates) ? rawSnapshot.leagueStates : [],
    playerStates: Array.isArray(rawSnapshot.playerStates) ? rawSnapshot.playerStates : [],
    fixtures: Array.isArray(rawSnapshot.fixtures) ? rawSnapshot.fixtures : [],
    weekPlans: Array.isArray(rawSnapshot.weekPlans) ? rawSnapshot.weekPlans : [],
    inboxEvents: Array.isArray(rawSnapshot.inboxEvents) ? rawSnapshot.inboxEvents : [],
    eventDecisions: Array.isArray(rawSnapshot.eventDecisions) ? rawSnapshot.eventDecisions : [],
    matches: Array.isArray(rawSnapshot.matches) ? rawSnapshot.matches : [],
    highlights: Array.isArray(rawSnapshot.highlights) ? rawSnapshot.highlights : []
  };
}
