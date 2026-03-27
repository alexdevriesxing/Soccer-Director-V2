import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MatchAutoPreset, MatchBenchPriority, MatchFormation, MatchLineupPolicy } from '../contracts';
import { SquadPlayer } from '../types';
import {
  buildAutoSelection,
  hasDisciplinaryDirective,
  hasLimitedMinutesDirective,
  hasRestRecoveryDirective,
  isPlayerUnavailable,
  STARTING_XI_SIZE
} from '../utils/matchPrep';

interface UseMatchPrepSelectionOptions {
  squad: SquadPlayer[];
  formation: MatchFormation;
  lineupPolicy: MatchLineupPolicy;
  benchPriority: MatchBenchPriority;
  matchLocked: boolean;
  sessionKey: string | null;
}

export function useMatchPrepSelection({
  squad,
  formation,
  lineupPolicy,
  benchPriority,
  matchLocked,
  sessionKey
}: UseMatchPrepSelectionOptions) {
  const [startingPlayerIds, setStartingPlayerIds] = useState<number[]>([]);
  const [benchPlayerIds, setBenchPlayerIds] = useState<number[]>([]);
  const [captainPlayerId, setCaptainPlayerId] = useState<number | null>(null);
  const hasInitializedSelectionRef = useRef(false);

  useEffect(() => {
    hasInitializedSelectionRef.current = false;
    setStartingPlayerIds([]);
    setBenchPlayerIds([]);
    setCaptainPlayerId(null);
  }, [sessionKey]);

  const unavailablePlayerIds = useMemo(
    () => new Set(squad.filter((player) => isPlayerUnavailable(player)).map((player) => player.id)),
    [squad]
  );
  const restRecoveryPlayerIds = useMemo(
    () => new Set(squad.filter((player) => hasRestRecoveryDirective(player)).map((player) => player.id)),
    [squad]
  );
  const limitedMinutesPlayerIds = useMemo(
    () => new Set(squad.filter((player) => hasLimitedMinutesDirective(player)).map((player) => player.id)),
    [squad]
  );
  const disciplinaryPlayerIds = useMemo(
    () => new Set(squad.filter((player) => hasDisciplinaryDirective(player)).map((player) => player.id)),
    [squad]
  );

  const applyAutoSelection = useCallback((preset: MatchAutoPreset) => {
    const next = buildAutoSelection(squad, formation, preset, benchPriority);
    setStartingPlayerIds(next.starters);
    setBenchPlayerIds(next.bench);
    setCaptainPlayerId(next.captain);
  }, [benchPriority, formation, squad]);

  useEffect(() => {
    const availableCount = squad.filter((player) => !isPlayerUnavailable(player)).length;
    if (!matchLocked && !hasInitializedSelectionRef.current && availableCount >= STARTING_XI_SIZE) {
      const preset: MatchAutoPreset = lineupPolicy === 'ROTATE' ? 'ROTATE' : 'BEST_XI';
      applyAutoSelection(preset);
      hasInitializedSelectionRef.current = true;
    }
  }, [applyAutoSelection, lineupPolicy, matchLocked, squad]);

  useEffect(() => {
    if (unavailablePlayerIds.size === 0) {
      return;
    }

    setStartingPlayerIds((current) => current.filter((playerId) => !unavailablePlayerIds.has(playerId)));
    setBenchPlayerIds((current) => current.filter((playerId) => !unavailablePlayerIds.has(playerId)));
  }, [unavailablePlayerIds]);

  useEffect(() => {
    if (startingPlayerIds.length === 0) {
      if (captainPlayerId !== null) {
        setCaptainPlayerId(null);
      }
      return;
    }

    if (captainPlayerId === null || !startingPlayerIds.includes(captainPlayerId)) {
      setCaptainPlayerId(startingPlayerIds[0]);
    }
  }, [captainPlayerId, startingPlayerIds]);

  const toggleStarter = useCallback((playerId: number) => {
    if (unavailablePlayerIds.has(playerId) || restRecoveryPlayerIds.has(playerId)) {
      return;
    }
    setBenchPlayerIds((current) => current.filter((id) => id !== playerId));
    setStartingPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }
      if (current.length >= STARTING_XI_SIZE) {
        return current;
      }
      return [...current, playerId];
    });
  }, [restRecoveryPlayerIds, unavailablePlayerIds]);

  const toggleBench = useCallback((playerId: number, benchLimit: number) => {
    if (unavailablePlayerIds.has(playerId)) {
      return;
    }
    if (startingPlayerIds.includes(playerId)) {
      return;
    }
    setBenchPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }
      if (current.length >= benchLimit) {
        return current;
      }
      return [...current, playerId];
    });
  }, [startingPlayerIds, unavailablePlayerIds]);

  return {
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
  };
}
