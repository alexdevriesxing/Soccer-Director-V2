import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import SquadProfilePanel from '../components/squad/SquadProfilePanel';
import SquadTablePanel from '../components/squad/SquadTablePanel';
import V2Shell from '../components/V2Shell';
import {
  ActivePlayerMedicalPlanCode,
  DevelopmentPlanFocus,
  DevelopmentPlanTarget,
  PlayerStatusDirectiveAction,
  RetrainablePosition,
  SquadRoleAssignment
} from '../contracts';
import {
  assignSquadRole,
  getSquad,
  getSquadPlayerProfile,
  releaseSquadPlayer,
  renewSquadContract,
  setSquadPlayerDevelopmentPlan,
  setSquadPlayerMedicalPlan,
  setSquadPlayerRegistrationAction,
  setSquadPlayerRetrainingPlan,
  setSquadPlayerStatusAction
} from '../api';
import { SquadPlayer, SquadPlayerProfile } from '../types';
import { useActiveCareer } from '../useActiveCareer';
import {
  formatAssignedRole,
  formatDevelopmentFocus,
  formatDevelopmentTarget,
  formatMedicalAvailabilityRecommendation,
  formatMedicalPlanLabel,
  formatMoney,
  formatPlayerStatusDirectiveLabel,
  formatRetrainingPosition,
  formatSigned,
  recommendedRetrainingTarget,
  recommendedDevelopmentFocus,
  recommendedDevelopmentTarget
} from '../utils/squadFormatting';

type BusyAction = 'RENEW' | 'RELEASE' | 'ROLE' | 'STATUS' | 'DEV_PLAN' | 'MEDICAL' | 'REGISTRATION' | 'RETRAINING' | null;

const SquadPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyPlayerId, setBusyPlayerId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<SquadPlayerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const [devPlanFocusDraft, setDevPlanFocusDraft] = useState<DevelopmentPlanFocus>('TACTICAL');
  const [devPlanTargetDraft, setDevPlanTargetDraft] = useState<DevelopmentPlanTarget>('MATCH_SHARPNESS');
  const [medicalPlanDraft, setMedicalPlanDraft] = useState<ActivePlayerMedicalPlanCode>('INJURY_PREVENTION');
  const [retrainingTargetDraft, setRetrainingTargetDraft] = useState<RetrainablePosition>('CM');
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const focusPlayerId = useMemo(() => {
    const raw = searchParams.get('focusPlayerId');
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value;
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      if (!careerId) {
        setRows([]);
        setSelectedPlayerId(null);
        setSelectedProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        setError(null);
        const players = await getSquad(careerId);
        setRows(players);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load squad.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [careerId]);

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedPlayerId(null);
      setSelectedProfile(null);
      return;
    }

    if (focusPlayerId && rows.some((row) => row.id === focusPlayerId)) {
      setSelectedPlayerId(focusPlayerId);
      return;
    }

    if (!selectedPlayerId || !rows.some((row) => row.id === selectedPlayerId)) {
      setSelectedPlayerId(rows[0]?.id ?? null);
    }
  }, [focusPlayerId, rows, selectedPlayerId]);

  useEffect(() => {
    if (!focusPlayerId || loading || rows.length === 0) {
      return;
    }

    const target = rows.find((row) => row.id === focusPlayerId);
    if (!target) {
      return;
    }

    const el = rowRefs.current[focusPlayerId];
    if (!el) {
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusPlayerId, loading, rows]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!careerId || !selectedPlayerId) {
        setSelectedProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        setProfileError(null);
        const profile = await getSquadPlayerProfile(careerId, selectedPlayerId);
        setSelectedProfile(profile);
      } catch (err: unknown) {
        setSelectedProfile(null);
        setProfileError(err instanceof Error ? err.message : 'Failed to load player profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [careerId, selectedPlayerId, profileVersion]);

  useEffect(() => {
    if (!selectedProfile) {
      return;
    }
    setDevPlanFocusDraft(selectedProfile.developmentPlan?.focus ?? recommendedDevelopmentFocus(selectedProfile));
    setDevPlanTargetDraft(selectedProfile.developmentPlan?.target ?? recommendedDevelopmentTarget(selectedProfile));
    setMedicalPlanDraft(selectedProfile.medical.activePlan?.planCode ?? selectedProfile.medical.recommendedPlanCode);
    setRetrainingTargetDraft(selectedProfile.retraining?.targetPosition as RetrainablePosition ?? recommendedRetrainingTarget(selectedProfile.position));
  }, [selectedProfile]);

  const refreshSquad = useCallback(
    async (idForSelection?: number | null) => {
      if (!careerId) return;

      const players = await getSquad(careerId);
      setRows(players);
      if (idForSelection && players.some((row) => row.id === idForSelection)) {
        setSelectedPlayerId(idForSelection);
        return;
      }
      if (players.length === 0) {
        setSelectedPlayerId(null);
        return;
      }
      if (!selectedPlayerId || !players.some((row) => row.id === selectedPlayerId)) {
        setSelectedPlayerId(players[0].id);
      }
    },
    [careerId, selectedPlayerId]
  );

  const selectedRow = rows.find((row) => row.id === selectedPlayerId) ?? null;

  const handleRenew = useCallback(async (player: SquadPlayer, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId) return;

    setBusyPlayerId(player.id);
    setBusyAction('RENEW');
    setNotice(null);
    setError(null);
    try {
      const result = await renewSquadContract(careerId, player.id, {
        years: player.contractRisk === 'CRITICAL' ? 3 : 2,
        wageAdjustmentPct: player.contractRisk === 'CRITICAL' ? 8 : 5
      });
      setNotice(`Renewed ${result.playerName}. New contract end: ${new Date(result.contractEnd || '').toLocaleDateString()}.`);
      await refreshSquad(player.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to renew contract.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad]);

  const handleRelease = useCallback(async (player: SquadPlayer, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId) return;

    const confirmed = window.confirm(`Release ${player.fullName}? This may reduce squad depth.`);
    if (!confirmed) return;

    setBusyPlayerId(player.id);
    setBusyAction('RELEASE');
    setNotice(null);
    setError(null);
    try {
      const result = await releaseSquadPlayer(careerId, player.id, { compensationWeeks: 8 });
      setNotice(`Released ${result.playerName}. Budget impact: ${formatMoney(result.budgetImpact)}.`);
      await refreshSquad(null);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to release player.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad]);

  const handleRoleAssignment = useCallback(async (
    roleAssignment: SquadRoleAssignment,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow) return;

    setBusyPlayerId(selectedRow.id);
    setBusyAction('ROLE');
    setNotice(null);
    setError(null);
    try {
      const result = await assignSquadRole(careerId, selectedRow.id, { roleAssignment });
      const moralePart = result.moraleDelta !== 0 ? ` Morale ${formatSigned(result.moraleDelta)}.` : '';
      const boardPart = result.boardDelta !== 0 ? ` Board ${formatSigned(result.boardDelta)}.` : '';
      setNotice(
        `${result.playerName}: ${formatAssignedRole(result.previousRoleAssignment)} -> ${formatAssignedRole(result.roleAssignment)}.${moralePart}${boardPart} ${result.note}`.trim()
      );
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update squad role.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad, selectedRow]);

  const handleSaveDevelopmentPlan = useCallback(async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow) return;

    setBusyPlayerId(selectedRow.id);
    setBusyAction('DEV_PLAN');
    setNotice(null);
    setError(null);
    try {
      const result = await setSquadPlayerDevelopmentPlan(careerId, selectedRow.id, {
        focus: devPlanFocusDraft,
        target: devPlanTargetDraft
      });
      const moraleDelta = Number(result.immediateMoraleDelta || 0);
      const moralePart = moraleDelta !== 0 ? ` Immediate morale ${formatSigned(moraleDelta)}.` : '';
      setNotice(
        `${result.playerName}: development plan set to ${formatDevelopmentFocus(result.focus)} / ${formatDevelopmentTarget(result.target)}.${moralePart} ${result.note}`.trim()
      );
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update development plan.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, devPlanFocusDraft, devPlanTargetDraft, refreshSquad, selectedRow]);

  const handlePlayerStatusAction = useCallback(async (
    action: PlayerStatusDirectiveAction,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow) return;

    if (action === 'DISCIPLINARY_NOTE') {
      const confirmed = window.confirm(`Apply a disciplinary note to ${selectedRow.fullName}? This will reduce morale.`);
      if (!confirmed) return;
    }

    setBusyPlayerId(selectedRow.id);
    setBusyAction('STATUS');
    setNotice(null);
    setError(null);
    try {
      const result = await setSquadPlayerStatusAction(careerId, selectedRow.id, { action });
      const deltaParts = [
        Number(result.moraleDelta || 0) !== 0 ? `Morale ${formatSigned(Number(result.moraleDelta || 0))}` : null,
        Number(result.fitnessDelta || 0) !== 0 ? `Fitness ${formatSigned(Number(result.fitnessDelta || 0))}` : null,
        Number(result.formDelta || 0) !== 0 ? `Form ${formatSigned(Number(result.formDelta || 0))}` : null,
        Number(result.boardDelta || 0) !== 0 ? `Board ${formatSigned(Number(result.boardDelta || 0))}` : null
      ].filter(Boolean).join(' • ');
      const directivePart = result.directiveCode
        ? `${formatPlayerStatusDirectiveLabel(result.directiveCode)} active through week ${result.expiresWeekNumber}.`
        : 'Directive cleared.';
      setNotice(`${result.playerName}: ${directivePart}${deltaParts ? ` ${deltaParts}.` : ''} ${result.note}`.trim());
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update player status.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad, selectedRow]);

  const handleSaveMedicalPlan = useCallback(async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow) return;

    setBusyPlayerId(selectedRow.id);
    setBusyAction('MEDICAL');
    setNotice(null);
    setError(null);
    try {
      const result = await setSquadPlayerMedicalPlan(careerId, selectedRow.id, {
        planCode: medicalPlanDraft
      });
      const deltaParts = [
        result.immediateMoraleDelta !== 0 ? `Morale ${formatSigned(result.immediateMoraleDelta)}` : null,
        result.immediateFitnessDelta !== 0 ? `Fitness ${formatSigned(result.immediateFitnessDelta)}` : null,
        result.immediateFormDelta !== 0 ? `Form ${formatSigned(result.immediateFormDelta)}` : null
      ].filter(Boolean).join(' • ');
      setNotice(
        `${result.playerName}: ${result.planCode ? formatMedicalPlanLabel(result.planCode) : 'Medical plan'} active${result.expiresWeekNumber ? ` through week ${result.expiresWeekNumber}` : ''}.`
        + `${deltaParts ? ` ${deltaParts}.` : ''} ${result.note} Availability guidance: ${formatMedicalAvailabilityRecommendation(result.availabilityRecommendation)}.`
      );
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update medical plan.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, medicalPlanDraft, refreshSquad, selectedRow]);

  const handleClearMedicalPlan = useCallback(async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow) return;

    setBusyPlayerId(selectedRow.id);
    setBusyAction('MEDICAL');
    setNotice(null);
    setError(null);
    try {
      const result = await setSquadPlayerMedicalPlan(careerId, selectedRow.id, {
        planCode: 'CLEAR_PLAN'
      });
      setNotice(`${result.playerName}: ${result.note}`);
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clear medical plan.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad, selectedRow]);

  const handleRegistrationAction = useCallback(async (action: 'REGISTER' | 'UNREGISTER', event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow) return;

    setBusyPlayerId(selectedRow.id);
    setBusyAction('REGISTRATION');
    setNotice(null);
    setError(null);
    try {
      const result = await setSquadPlayerRegistrationAction(careerId, selectedRow.id, { action });
      const deltas = [
        result.moraleDelta !== 0 ? `Morale ${formatSigned(result.moraleDelta)}` : null,
        result.boardDelta !== 0 ? `Board ${formatSigned(result.boardDelta)}` : null
      ].filter(Boolean).join(' • ');
      setNotice(
        `${result.playerName}: ${result.isRegistered ? 'registered' : 'unregistered'} (${result.registeredCount}/${result.registrationLimit}).${deltas ? ` ${deltas}.` : ''} ${result.note}`.trim()
      );
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update registration.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad, selectedRow]);

  const handleSaveRetrainingPlan = useCallback(async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (!careerId || !selectedRow || !selectedProfile) return;

    setBusyPlayerId(selectedRow.id);
    setBusyAction('RETRAINING');
    setNotice(null);
    setError(null);
    try {
      const currentTarget = selectedProfile.retraining?.targetPosition ?? null;
      const requestedTarget = retrainingTargetDraft === (selectedProfile.position as RetrainablePosition)
        ? null
        : retrainingTargetDraft;
      const result = await setSquadPlayerRetrainingPlan(careerId, selectedRow.id, {
        targetPosition: requestedTarget
      });
      const moralePart = result.immediateMoraleDelta !== 0 ? ` Immediate morale ${formatSigned(result.immediateMoraleDelta)}.` : '';
      const targetPart = result.targetPosition ? ` -> ${formatRetrainingPosition(result.targetPosition)}` : '';
      setNotice(
        `${result.playerName}: retraining ${formatRetrainingPosition(result.currentPosition)}${targetPart}.${moralePart} ${result.note}`.trim()
      );
      if (!result.targetPosition && currentTarget) {
        setRetrainingTargetDraft(recommendedRetrainingTarget(selectedProfile.position));
      }
      await refreshSquad(selectedRow.id);
      setProfileVersion((value) => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update retraining.');
    } finally {
      setBusyPlayerId(null);
      setBusyAction(null);
    }
  }, [careerId, refreshSquad, retrainingTargetDraft, selectedProfile, selectedRow]);

  if (!careerId) {
    return (
      <V2Shell title="Squad">
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
    <V2Shell title="Squad">
      <div className="v2-stack">
        {loading && (
          <div className="v2-panel v2-panel--soft">
            <p className="v2-panel__subtitle">Loading squad...</p>
          </div>
        )}

        {notice && (
          <div className="v2-panel v2-panel--soft">
            <p className="v2-panel__subtitle" style={{ color: '#b5f8d8' }}>{notice}</p>
          </div>
        )}

        {error && (
          <div className="v2-panel v2-panel--danger">
            <p className="v2-panel__subtitle" style={{ color: '#ffb9b9' }}>{error}</p>
          </div>
        )}

        {focusPlayerId && !loading && rows.length > 0 && !rows.some((row) => row.id === focusPlayerId) && (
          <div className="v2-panel v2-panel--warm">
            <p className="v2-panel__subtitle" style={{ color: '#ffd28a' }}>
              Focused player is no longer in the current squad.
            </p>
          </div>
        )}

        <div className="v2-squad-layout">
          <SquadTablePanel
            rows={rows}
            selectedPlayerId={selectedPlayerId}
            focusPlayerId={focusPlayerId}
            rowRefs={rowRefs}
            busyPlayerId={busyPlayerId}
            busyAction={busyAction}
            onSelectPlayer={setSelectedPlayerId}
            onRenew={handleRenew}
            onRelease={handleRelease}
          />

          <SquadProfilePanel
            selectedRow={selectedRow}
            selectedProfile={selectedProfile}
            profileLoading={profileLoading}
            profileError={profileError}
            busyPlayerId={busyPlayerId}
            busyAction={busyAction}
            devPlanFocusDraft={devPlanFocusDraft}
            devPlanTargetDraft={devPlanTargetDraft}
            medicalPlanDraft={medicalPlanDraft}
            retrainingTargetDraft={retrainingTargetDraft}
            onDevelopmentFocusChange={setDevPlanFocusDraft}
            onDevelopmentTargetChange={setDevPlanTargetDraft}
            onMedicalPlanChange={setMedicalPlanDraft}
            onRetrainingTargetChange={setRetrainingTargetDraft}
            onRoleAssignment={handleRoleAssignment}
            onSaveDevelopmentPlan={handleSaveDevelopmentPlan}
            onSaveMedicalPlan={handleSaveMedicalPlan}
            onClearMedicalPlan={handleClearMedicalPlan}
            onPlayerStatusAction={handlePlayerStatusAction}
            onRegistrationAction={handleRegistrationAction}
            onSaveRetrainingPlan={handleSaveRetrainingPlan}
          />
        </div>
      </div>
    </V2Shell>
  );
};

export default SquadPage;
