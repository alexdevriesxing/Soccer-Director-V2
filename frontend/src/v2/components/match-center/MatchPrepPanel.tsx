import React from 'react';
import { Link } from 'react-router-dom';
import {
  MatchBenchPriority,
  MatchFormation,
  MatchLineupPolicy,
  MatchPrepPositionCounts,
  MatchPreMatchInstruction,
  MATCH_BENCH_PRIORITIES,
  MATCH_BENCH_PRIORITY_DETAILS,
  MATCH_FORMATIONS,
  MATCH_FORMATION_CONFIGS,
  MATCH_LINEUP_POLICIES,
  MATCH_LINEUP_POLICY_DETAILS,
  MATCH_PRE_MATCH_INSTRUCTIONS,
  MATCH_PRE_MATCH_INSTRUCTION_DETAILS
} from '../../contracts';
import { SquadPlayer } from '../../types';
import {
  BENCH_SIZE,
  resolvePlayerStatus,
  STARTING_XI_SIZE,
  toNumber
} from '../../utils/matchPrep';

interface MatchPrepPanelProps {
  squad: SquadPlayer[];
  squadById: Map<number, SquadPlayer>;
  sortedSquad: SquadPlayer[];
  formation: MatchFormation;
  formationCounts: MatchPrepPositionCounts;
  requiredFormationCounts: MatchPrepPositionCounts;
  lineupPolicy: MatchLineupPolicy;
  benchPriority: MatchBenchPriority;
  preMatchInstruction: MatchPreMatchInstruction;
  startingPlayerIds: number[];
  benchPlayerIds: number[];
  captainPlayerId: number | null;
  loading: boolean;
  loadingSquad: boolean;
  availableSquadCount: number;
  hasUnavailableSelection: boolean;
  restRecoveryStarterIds: number[];
  limitedMinutesStarterIds: number[];
  disciplinarySelectedIds: number[];
  hasFormationMismatch: boolean;
  canStartMatch: boolean;
  onFormationChange: (value: MatchFormation) => void;
  onLineupPolicyChange: (value: MatchLineupPolicy) => void;
  onBenchPriorityChange: (value: MatchBenchPriority) => void;
  onPreMatchInstructionChange: (value: MatchPreMatchInstruction) => void;
  onCaptainChange: (value: number | null) => void;
  onAutoBestXi: () => void;
  onAutoRotate: () => void;
  onToggleStarter: (playerId: number) => void;
  onToggleBench: (playerId: number) => void;
  onStart: () => void;
  isPlayerUnavailable: (player: SquadPlayer) => boolean;
  hasRestRecoveryDirective: (player: SquadPlayer) => boolean;
}

const MatchPrepPanel: React.FC<MatchPrepPanelProps> = ({
  squad,
  squadById,
  sortedSquad,
  formation,
  formationCounts,
  requiredFormationCounts,
  lineupPolicy,
  benchPriority,
  preMatchInstruction,
  startingPlayerIds,
  benchPlayerIds,
  captainPlayerId,
  loading,
  loadingSquad,
  availableSquadCount,
  hasUnavailableSelection,
  restRecoveryStarterIds,
  limitedMinutesStarterIds,
  disciplinarySelectedIds,
  hasFormationMismatch,
  canStartMatch,
  onFormationChange,
  onLineupPolicyChange,
  onBenchPriorityChange,
  onPreMatchInstructionChange,
  onCaptainChange,
  onAutoBestXi,
  onAutoRotate,
  onToggleStarter,
  onToggleBench,
  onStart,
  isPlayerUnavailable,
  hasRestRecoveryDirective
}) => {
  const formationMeta = MATCH_FORMATION_CONFIGS[formation];
  const lineupMeta = MATCH_LINEUP_POLICY_DETAILS[lineupPolicy];
  const benchMeta = MATCH_BENCH_PRIORITY_DETAILS[benchPriority];
  const tacticalMeta = MATCH_PRE_MATCH_INSTRUCTION_DETAILS[preMatchInstruction];

  return (
    <div style={{ ...card, maxWidth: 900 }}>
      <h3 style={{ marginTop: 0 }}>Match Preparation</h3>
      <p style={{ marginTop: 0, color: '#bde8d2' }}>
        Choose a shape, set the tactical tone, and lock a matchday group that fits the plan. Kickoff requires 11 starters, at least 3 bench options, and a valid formation shape using registered, eligible players.
      </p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label style={labelStyle}>
          Formation
          <select
            data-testid="match-center-formation-select"
            value={formation}
            onChange={(e) => onFormationChange(e.target.value as MatchFormation)}
            style={selectStyle}
          >
            {MATCH_FORMATIONS.map((value) => (
              <option key={value} value={value}>{MATCH_FORMATION_CONFIGS[value].label}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Lineup Policy
          <select value={lineupPolicy} onChange={(e) => onLineupPolicyChange(e.target.value as MatchLineupPolicy)} style={selectStyle}>
            {MATCH_LINEUP_POLICIES.map((value) => (
              <option key={value} value={value}>{MATCH_LINEUP_POLICY_DETAILS[value].label}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Bench Priority
          <select value={benchPriority} onChange={(e) => onBenchPriorityChange(e.target.value as MatchBenchPriority)} style={selectStyle}>
            {MATCH_BENCH_PRIORITIES.map((value) => (
              <option key={value} value={value}>{MATCH_BENCH_PRIORITY_DETAILS[value].label}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Tactical Preset
          <select
            value={preMatchInstruction}
            onChange={(e) => onPreMatchInstructionChange(e.target.value as MatchPreMatchInstruction)}
            style={selectStyle}
          >
            {MATCH_PRE_MATCH_INSTRUCTIONS.map((value) => (
              <option key={value} value={value}>{MATCH_PRE_MATCH_INSTRUCTION_DETAILS[value].label}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={summaryGrid}>
        <div style={summaryCard}>
          <div style={summaryLabel}>Shape</div>
          <div style={summaryValue}>{formationMeta.label}</div>
          <div style={summaryHint}>{formationMeta.summary}</div>
          <div style={summaryMeta}>
            Needs {requiredFormationCounts.DEF} DEF / {requiredFormationCounts.MID} MID / {requiredFormationCounts.ATT} ATT
          </div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Lineup Policy</div>
          <div style={summaryValue}>{lineupMeta.label}</div>
          <div style={summaryHint}>{lineupMeta.summary}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Bench Priority</div>
          <div style={summaryValue}>{benchMeta.label}</div>
          <div style={summaryHint}>{benchMeta.summary}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Tactical Preset</div>
          <div style={summaryValue}>{tacticalMeta.label}</div>
          <div style={summaryHint}>{tacticalMeta.summary}</div>
        </div>
      </div>

      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <button
            style={utilityButton}
            type="button"
            onClick={onAutoBestXi}
            disabled={loadingSquad || availableSquadCount < STARTING_XI_SIZE}
          >
            Auto Best XI
          </button>
          <button
            style={utilityButton}
            type="button"
            onClick={onAutoRotate}
            disabled={loadingSquad || availableSquadCount < STARTING_XI_SIZE}
          >
            Auto Rotate
          </button>
          <label style={{ ...labelStyle, minWidth: 220 }}>
            Captain
            <select
              value={captainPlayerId ?? ''}
              onChange={(e) => onCaptainChange(Number(e.target.value) || null)}
              style={selectStyle}
              disabled={startingPlayerIds.length === 0}
            >
              <option value="">Select captain</option>
              {startingPlayerIds.map((playerId) => {
                const player = squadById.get(playerId);
                if (!player) return null;
                return (
                  <option key={playerId} value={playerId}>
                    {player.fullName} ({player.position})
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div style={{ color: '#9ed4bb', fontSize: 13, marginBottom: 10 }}>
          Auto-pick honors the selected formation, excludes injured, suspended, and unregistered players, and soft-manages availability directives through starter/bench weighting.
        </div>

        <div style={{ ...card, marginBottom: 10, padding: 10, borderColor: hasFormationMismatch ? 'rgba(255, 173, 120, 0.52)' : 'rgba(132, 222, 181, 0.24)' }}>
          <div style={{ color: hasFormationMismatch ? '#ffd7b0' : '#c8eedb', fontWeight: 700, marginBottom: 6 }}>Formation Check</div>
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {(['GK', 'DEF', 'MID', 'ATT'] as const).map((group) => {
              const required = requiredFormationCounts[group];
              const current = formationCounts[group];
              const aligned = current === required;
              return (
                <div key={group} style={{ ...miniStat, borderColor: aligned ? 'rgba(132, 222, 181, 0.24)' : 'rgba(255, 173, 120, 0.45)' }}>
                  <div style={summaryLabel}>{group}</div>
                  <div style={{ ...summaryValue, fontSize: 18 }}>{current} / {required}</div>
                  <div style={summaryHint}>{aligned ? 'On shape' : 'Needs adjustment'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {(hasFormationMismatch || restRecoveryStarterIds.length > 0 || limitedMinutesStarterIds.length > 0 || disciplinarySelectedIds.length > 0) && (
          <div style={{ ...card, marginBottom: 10, padding: 10, borderColor: 'rgba(255, 210, 138, 0.45)' }}>
            <div style={{ color: '#ffe0a8', fontWeight: 700, marginBottom: 6 }}>Selection Warnings</div>
            <div style={{ display: 'grid', gap: 4, color: '#f5dfb6', fontSize: 13 }}>
              {hasFormationMismatch && (
                <div>
                  Current XI does not match {formationMeta.label}. Required DEF {requiredFormationCounts.DEF} / MID {requiredFormationCounts.MID} / ATT {requiredFormationCounts.ATT}; current DEF {formationCounts.DEF} / MID {formationCounts.MID} / ATT {formationCounts.ATT}.
                </div>
              )}
              {restRecoveryStarterIds.map((playerId) => (
                <div key={`rest-${playerId}`}>
                  {squadById.get(playerId)?.fullName ?? `#${playerId}`} is marked Rest & Recovery and cannot start.
                </div>
              ))}
              {limitedMinutesStarterIds.map((playerId) => (
                <div key={`limit-${playerId}`}>
                  {squadById.get(playerId)?.fullName ?? `#${playerId}`} has a Limited Minutes directive but is in the Starting XI.
                </div>
              ))}
              {disciplinarySelectedIds.map((playerId) => (
                <div key={`discipline-${playerId}`}>
                  {squadById.get(playerId)?.fullName ?? `#${playerId}`} has an active disciplinary note (morale risk).
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ color: '#bde8d2', marginBottom: 8 }}>
          Starters: {startingPlayerIds.length}/{STARTING_XI_SIZE} | Bench: {benchPlayerIds.length}/{BENCH_SIZE}
        </div>

        <div style={squadTableWrap}>
          <table style={squadTable}>
            <thead>
              <tr>
                <th style={thStyle}>Player</th>
                <th style={thStyle}>Pos</th>
                <th style={thStyle}>Ability</th>
                <th style={thStyle}>Fitness</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Starter</th>
                <th style={thStyle}>Bench</th>
              </tr>
            </thead>
            <tbody>
              {sortedSquad.map((player) => {
                const isStarter = startingPlayerIds.includes(player.id);
                const isBench = benchPlayerIds.includes(player.id);
                const unavailable = isPlayerUnavailable(player);
                const restRecovery = hasRestRecoveryDirective(player);
                const canAddStarter = isStarter || startingPlayerIds.length < STARTING_XI_SIZE;
                const canAddBench = isBench || benchPlayerIds.length < BENCH_SIZE;
                return (
                  <tr key={player.id} style={{ opacity: unavailable ? 0.6 : 1 }}>
                    <td style={tdStyle}>{player.fullName}</td>
                    <td style={tdStyle}>{player.position}</td>
                    <td style={tdStyle}>{toNumber(player.currentAbility, 0)}</td>
                    <td style={tdStyle}>{toNumber(player.fitness, 0)}</td>
                    <td style={tdStyle}>{resolvePlayerStatus(player)}</td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        style={isStarter ? selectionButtonActive : selectionButton}
                        disabled={unavailable || restRecovery || (!isStarter && (!canAddStarter || isBench))}
                        onClick={() => onToggleStarter(player.id)}
                      >
                        {isStarter ? 'Starter' : 'Add'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        style={isBench ? selectionButtonActive : selectionButton}
                        disabled={unavailable || (!isBench && (!canAddBench || isStarter))}
                        onClick={() => onToggleBench(player.id)}
                      >
                        {isBench ? 'Bench' : 'Add'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
        <button
          data-testid="match-center-start-button"
          onClick={onStart}
          disabled={loading || loadingSquad || !canStartMatch}
          style={startButton}
        >
          {loading ? 'Starting...' : 'Lock Prep and Start Match'}
        </button>
        <Link style={{ color: '#bde8d2' }} to="/hq">Back to HQ</Link>
      </div>
      {!canStartMatch && (
        <p style={{ marginTop: 8, color: '#ffd5ae' }}>
          {availableSquadCount < 14
            ? 'Not enough eligible players. You need at least 14 registered, non-injured, non-suspended players for match prep.'
            : hasFormationMismatch
              ? `Formation ${formationMeta.label} is not satisfied. Adjust the XI or auto-pick again.`
              : restRecoveryStarterIds.length > 0
                ? 'Players marked Rest & Recovery cannot start. Move them to the bench or clear the directive.'
                : hasUnavailableSelection
                  ? 'Ineligible players are selected. Remove injured, suspended, or unregistered players before kickoff.'
                  : 'Match start requires exactly 11 starters and at least 3 eligible bench players.'}
        </p>
      )}
      {squad.length === 0 && <p style={{ marginTop: 8, color: '#ffd5ae' }}>Squad data is not available for match prep.</p>}
    </div>
  );
};

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  color: '#d6f7e8',
  fontSize: 13
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.35)',
  color: '#effff6',
  border: '1px solid rgba(132, 222, 181, 0.5)',
  borderRadius: 8,
  padding: '8px 10px'
};

const utilityButton: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.6)',
  background: 'rgba(132, 222, 181, 0.25)',
  color: '#ecfff5',
  borderRadius: 8,
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer'
};

const squadTableWrap: React.CSSProperties = {
  maxHeight: 300,
  overflowY: 'auto',
  border: '1px solid rgba(132, 222, 181, 0.25)',
  borderRadius: 8
};

const squadTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 12,
  color: '#bde8d2',
  padding: '8px 6px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.25)'
};

const tdStyle: React.CSSProperties = {
  padding: '8px 6px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.14)',
  color: '#effff6',
  fontSize: 13
};

const selectionButton: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.5)',
  background: 'rgba(132, 222, 181, 0.12)',
  color: '#e8fff3',
  borderRadius: 6,
  padding: '6px 8px',
  cursor: 'pointer',
  fontSize: 12,
  minWidth: 60
};

const selectionButtonActive: React.CSSProperties = {
  ...selectionButton,
  background: 'rgba(132, 222, 181, 0.45)',
  color: '#0a2017',
  fontWeight: 700
};

const startButton: React.CSSProperties = {
  border: 'none',
  borderRadius: 8,
  background: '#72d7ab',
  color: '#0a2017',
  fontWeight: 700,
  padding: '10px 14px',
  cursor: 'pointer'
};

const summaryGrid: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
};

const summaryCard: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.24)',
  borderRadius: 10,
  padding: 12,
  background: 'rgba(8, 20, 14, 0.38)'
};

const miniStat: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.2)',
  borderRadius: 10,
  padding: 10,
  background: 'rgba(8, 20, 14, 0.3)'
};

const summaryLabel: React.CSSProperties = {
  fontSize: 11,
  color: '#9fdcc0',
  textTransform: 'uppercase',
  letterSpacing: 0.9
};

const summaryValue: React.CSSProperties = {
  marginTop: 4,
  fontSize: 20,
  fontWeight: 800,
  color: '#effff6'
};

const summaryHint: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: '#bde8d2',
  lineHeight: 1.4
};

const summaryMeta: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: '#8fd2b4'
};

export default MatchPrepPanel;
