import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import LiveMatchPanel from '../components/match-center/LiveMatchPanel';
import MatchPrepPanel from '../components/match-center/MatchPrepPanel';
import V2Shell from '../components/V2Shell';
import {
  MatchFormation,
  MATCH_FORMATION_CONFIGS,
  MatchBenchPriority,
  MatchLineupPolicy,
  MatchPreMatchInstruction
} from '../contracts';
import { getHighlights, getSquad, intervene, startMatch } from '../api';
import { useMatchPrepSelection } from '../hooks/useMatchPrepSelection';
import { MatchPayload, SquadPlayer } from '../types';
import { useActiveCareer } from '../useActiveCareer';
import {
  BENCH_SIZE,
  countSelectedFormationGroups,
  extractCareerIdFromMatchId,
  hasRestRecoveryDirective,
  isPlayerUnavailable,
  MIN_BENCH_SIZE,
  resolvePlayableAutoSelection,
  selectionMatchesFormation,
  STARTING_XI_SIZE,
  toNumber
} from '../utils/matchPrep';

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const MatchCenterPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const { matchId } = useParams<{ matchId: string }>();
  const routeCareerId = useMemo(() => extractCareerIdFromMatchId(matchId), [matchId]);

  const [payload, setPayload] = useState<MatchPayload | null>(null);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [formation, setFormation] = useState<MatchFormation>('4-3-3');
  const [lineupPolicy, setLineupPolicy] = useState<MatchLineupPolicy>('BALANCED');
  const [benchPriority, setBenchPriority] = useState<MatchBenchPriority>('BALANCED');
  const [preMatchInstruction, setPreMatchInstruction] = useState<MatchPreMatchInstruction>('BALANCED');
  const [subOutPlayerId, setSubOutPlayerId] = useState<number | null>(null);
  const [subInPlayerId, setSubInPlayerId] = useState<number | null>(null);
  const [substitutionReason, setSubstitutionReason] = useState<'FRESH_LEGS' | 'TACTICAL_TWEAK' | 'PROTECT_BOOKING'>('FRESH_LEGS');
  const [loading, setLoading] = useState(false);
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedPrepSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (routeCareerId && careerId !== routeCareerId) {
      setCareerId(routeCareerId);
    }
  }, [careerId, routeCareerId, setCareerId]);

  const loadHighlights = useCallback(async () => {
    if (!careerId || !matchId) {
      setPayload(null);
      return;
    }
    if (routeCareerId && careerId !== routeCareerId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getHighlights(careerId, matchId);
      setPayload(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch highlights.';
      const isPreKickoff = /not started/i.test(message);
      if (!isPreKickoff) {
        setError(message);
      }
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [careerId, matchId, routeCareerId]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  const {
    startingPlayerIds,
    benchPlayerIds,
    captainPlayerId,
    setCaptainPlayerId,
    setStartingPlayerIds,
    setBenchPlayerIds,
    applyAutoSelection,
    toggleStarter,
    toggleBench,
    unavailablePlayerIds,
    restRecoveryPlayerIds,
    limitedMinutesPlayerIds,
    disciplinaryPlayerIds
  } = useMatchPrepSelection({
    squad,
    formation,
    lineupPolicy,
    benchPriority,
    matchLocked: Boolean(payload?.match),
    sessionKey: careerId && matchId ? `${careerId}:${matchId}` : null
  });

  const loadSquad = useCallback(async () => {
    if (!careerId) {
      setSquad([]);
      return;
    }
    if (routeCareerId && careerId !== routeCareerId) {
      return;
    }

    setLoadingSquad(true);
    try {
      const players = await getSquad(careerId);
      setSquad(players);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load squad for match prep.';
      setError(message);
    } finally {
      setLoadingSquad(false);
    }
  }, [careerId, routeCareerId]);

  useEffect(() => {
    loadSquad();
  }, [loadSquad]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.scrollTo !== 'function' ||
      /jsdom/i.test(window.navigator.userAgent)
    ) {
      return;
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [careerId, matchId]);

  useEffect(() => {
    if (
      !payload?.match ||
      typeof window === 'undefined' ||
      typeof window.scrollTo !== 'function' ||
      /jsdom/i.test(window.navigator.userAgent)
    ) {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [payload?.match]);

  useEffect(() => {
    initializedPrepSessionRef.current = null;
  }, [careerId, matchId]);

  const squadById = useMemo(() => new Map(squad.map((player) => [player.id, player])), [squad]);
  const liveState = payload?.match?.liveState;

  useEffect(() => {
    if (!liveState) {
      setSubOutPlayerId(null);
      setSubInPlayerId(null);
      return;
    }
    setSubOutPlayerId((current) =>
      current && liveState.currentStartingPlayerIds.includes(current)
        ? current
        : liveState.currentStartingPlayerIds[0] ?? null
    );
    setSubInPlayerId((current) =>
      current && liveState.currentBenchPlayerIds.includes(current)
        ? current
        : liveState.currentBenchPlayerIds[0] ?? null
    );
  }, [liveState]);

  const sortedSquad = useMemo(
    () =>
      [...squad].sort((a, b) => {
        const aUnavailable = isPlayerUnavailable(a) ? 1 : 0;
        const bUnavailable = isPlayerUnavailable(b) ? 1 : 0;
        if (aUnavailable !== bUnavailable) {
          return aUnavailable - bUnavailable;
        }
        const abilityDelta = toNumber(b.currentAbility, 0) - toNumber(a.currentAbility, 0);
        if (abilityDelta !== 0) {
          return abilityDelta;
        }
        return a.fullName.localeCompare(b.fullName);
      }),
    [squad]
  );

  const restRecoveryStarterIds = useMemo(
    () => startingPlayerIds.filter((playerId) => restRecoveryPlayerIds.has(playerId)),
    [restRecoveryPlayerIds, startingPlayerIds]
  );
  const limitedMinutesStarterIds = useMemo(
    () => startingPlayerIds.filter((playerId) => limitedMinutesPlayerIds.has(playerId)),
    [limitedMinutesPlayerIds, startingPlayerIds]
  );
  const disciplinarySelectedIds = useMemo(
    () => [...startingPlayerIds, ...benchPlayerIds].filter((playerId) => disciplinaryPlayerIds.has(playerId)),
    [benchPlayerIds, disciplinaryPlayerIds, startingPlayerIds]
  );
  const hasUnavailableSelection = useMemo(() => {
    const selectedIds = [...startingPlayerIds, ...benchPlayerIds];
    return selectedIds.some((playerId) => unavailablePlayerIds.has(playerId));
  }, [benchPlayerIds, startingPlayerIds, unavailablePlayerIds]);

  const availableSquadCount = squad.length - unavailablePlayerIds.size;
  const formationCheck = useMemo(
    () => selectionMatchesFormation(startingPlayerIds, squadById, formation),
    [formation, squadById, startingPlayerIds]
  );
  const currentStarterCounts = useMemo(
    () => countSelectedFormationGroups(startingPlayerIds, squadById),
    [squadById, startingPlayerIds]
  );
  const hasFormationMismatch =
    startingPlayerIds.length === STARTING_XI_SIZE &&
    !formationCheck.valid;
  const canStartMatch =
    Boolean(matchId) &&
    startingPlayerIds.length === STARTING_XI_SIZE &&
    benchPlayerIds.length >= MIN_BENCH_SIZE &&
    !hasUnavailableSelection &&
    restRecoveryStarterIds.length === 0 &&
    !hasFormationMismatch;

  useEffect(() => {
    if (!careerId || !matchId || loadingSquad || payload?.match) {
      return;
    }
    if (routeCareerId && careerId !== routeCareerId) {
      return;
    }
    if (squad.length === 0) {
      return;
    }

    const sessionKey = `${careerId}:${matchId}`;
    if (initializedPrepSessionRef.current === sessionKey) {
      return;
    }
    initializedPrepSessionRef.current = sessionKey;

    const preset = lineupPolicy === 'ROTATE' ? 'ROTATE' : 'BEST_XI';
    const playableSelection = resolvePlayableAutoSelection(squad, formation, preset, benchPriority);
    if (!playableSelection) {
      return;
    }

    setFormation(playableSelection.formation);
    setStartingPlayerIds(playableSelection.starters);
    setBenchPlayerIds(playableSelection.bench);
    setCaptainPlayerId(playableSelection.captain);
  }, [
    benchPriority,
    careerId,
    formation,
    lineupPolicy,
    loadingSquad,
    matchId,
    payload?.match,
    routeCareerId,
    setBenchPlayerIds,
    setCaptainPlayerId,
    setStartingPlayerIds,
    squad
  ]);

  const handleStart = useCallback(async () => {
    if (!careerId || !matchId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await startMatch(careerId, matchId, {
        formation,
        lineupPolicy,
        benchPriority,
        preMatchInstruction,
        startingPlayerIds,
        benchPlayerIds,
        captainPlayerId
      });
      setPayload(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start match.');
    } finally {
      setLoading(false);
    }
  }, [benchPlayerIds, benchPriority, captainPlayerId, careerId, formation, lineupPolicy, matchId, preMatchInstruction, startingPlayerIds]);

  const handleIntervention = useCallback(
    async (requestPayload: Parameters<typeof intervene>[2]) => {
      if (!careerId || !matchId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await intervene(careerId, matchId, requestPayload);
        setPayload(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to apply intervention.');
      } finally {
        setLoading(false);
      }
    },
    [careerId, matchId]
  );

  const fixtureTitle = payload?.fixture
    ? `${payload.fixture.homeClubName ?? `Club ${payload.fixture.homeClubId}`} vs ${payload.fixture.awayClubName ?? `Club ${payload.fixture.awayClubId}`}`
    : null;
  const fixtureLeague = payload?.fixture?.leagueName || (payload?.fixture?.leagueId ? `League ${payload.fixture.leagueId}` : null);
  const fixtureKickoff = payload?.fixture?.matchDate
    ? (() => {
      const date = new Date(payload.fixture.matchDate);
      return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
    })()
    : '-';

  if (!careerId) {
    return (
      <V2Shell title="Match Center">
        <ActiveCareerRequired
          resolving={resolving}
          resolveError={resolveError}
          careers={careers}
          onSelectCareer={setCareerId}
        />
      </V2Shell>
    );
  }

  return (
    <V2Shell title="Match Center">
      {error && <p style={{ color: '#ffb9b9' }}>{error}</p>}

      {(loading || loadingSquad) && !payload?.fixture && (
        <section style={{ ...card, marginBottom: 12 }}>
          <p style={{ margin: 0, color: '#bde8d2' }}>
            {loadingSquad ? 'Loading squad for match prep...' : 'Loading match center...'}
          </p>
        </section>
      )}

      {payload?.fixture && (
        <section style={{ ...card, marginBottom: 12 }}>
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>{fixtureTitle}</h3>
          <div style={{ color: '#c8eedb' }}>
            {fixtureLeague ? `League: ${fixtureLeague}` : 'League: -'} | Week {payload.fixture.weekNumber ?? '-'} | Kickoff {fixtureKickoff}
          </div>
          <div style={{ color: '#bde8d2', marginTop: 4 }}>
            Managed Club Side:{' '}
            {payload.fixture.isControlledClubHome === null
              ? '-'
              : payload.fixture.isControlledClubHome
                ? 'HOME'
                : 'AWAY'}
            {' '}| Opponent: {payload.fixture.opponentClubName ?? '-'}
          </div>
        </section>
      )}

      {!payload?.match && (
        <MatchPrepPanel
          squad={squad}
          squadById={squadById}
          sortedSquad={sortedSquad}
          formation={formation}
          formationCounts={currentStarterCounts}
          requiredFormationCounts={MATCH_FORMATION_CONFIGS[formation].starterTargets}
          lineupPolicy={lineupPolicy}
          benchPriority={benchPriority}
          preMatchInstruction={preMatchInstruction}
          startingPlayerIds={startingPlayerIds}
          benchPlayerIds={benchPlayerIds}
          captainPlayerId={captainPlayerId}
          loading={loading}
          loadingSquad={loadingSquad}
          availableSquadCount={availableSquadCount}
          hasUnavailableSelection={hasUnavailableSelection}
          restRecoveryStarterIds={restRecoveryStarterIds}
          limitedMinutesStarterIds={limitedMinutesStarterIds}
          disciplinarySelectedIds={disciplinarySelectedIds}
          hasFormationMismatch={hasFormationMismatch}
          canStartMatch={canStartMatch}
          onFormationChange={setFormation}
          onLineupPolicyChange={setLineupPolicy}
          onBenchPriorityChange={setBenchPriority}
          onPreMatchInstructionChange={setPreMatchInstruction}
          onCaptainChange={setCaptainPlayerId}
          onAutoBestXi={() => applyAutoSelection('BEST_XI')}
          onAutoRotate={() => applyAutoSelection('ROTATE')}
          onToggleStarter={toggleStarter}
          onToggleBench={(playerId) => toggleBench(playerId, BENCH_SIZE)}
          onStart={handleStart}
          isPlayerUnavailable={isPlayerUnavailable}
          hasRestRecoveryDirective={hasRestRecoveryDirective}
        />
      )}

      {payload?.match && (
        <LiveMatchPanel
          payload={payload}
          formation={payload.match.matchPrep?.formation || formation}
          lineupPolicy={lineupPolicy}
          benchPriority={benchPriority}
          preMatchInstruction={preMatchInstruction}
          squadById={squadById}
          matchId={matchId}
          loading={loading}
          subOutPlayerId={subOutPlayerId}
          subInPlayerId={subInPlayerId}
          substitutionReason={substitutionReason}
          onSubOutChange={setSubOutPlayerId}
          onSubInChange={setSubInPlayerId}
          onSubstitutionReasonChange={setSubstitutionReason}
          onMentalityChange={(intensity) => handleIntervention({ type: 'MENTALITY_SHIFT', intensity, note: 'live-mentality' })}
          onPressingChange={(intensity) => handleIntervention({ type: 'PRESSING_INTENSITY', intensity, note: 'live-pressing' })}
          onHalftimeTalk={(teamTalk) => handleIntervention({ type: 'HALFTIME_TEAM_TALK', teamTalk })}
          onSubstitution={() => {
            if (!subOutPlayerId || !subInPlayerId) return Promise.resolve();
            return handleIntervention({
              type: 'SUBSTITUTION_TRIGGER',
              outPlayerId: subOutPlayerId,
              inPlayerId: subInPlayerId,
              substitutionReason
            });
          }}
        />
      )}
    </V2Shell>
  );
};

export default MatchCenterPage;
