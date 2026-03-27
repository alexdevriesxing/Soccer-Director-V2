import React from 'react';
import { Link } from 'react-router-dom';
import { MatchBenchPriority, MatchFormation, MatchLineupPolicy, MatchPreMatchInstruction } from '../../contracts';
import RetroHighlightCanvas from '../RetroHighlightCanvas';
import { MatchPayload, SquadPlayer } from '../../types';

interface LiveMatchPanelProps {
  payload: MatchPayload;
  formation: MatchFormation;
  lineupPolicy: MatchLineupPolicy;
  benchPriority: MatchBenchPriority;
  preMatchInstruction: MatchPreMatchInstruction;
  squadById: Map<number, SquadPlayer>;
  matchId?: string;
  loading: boolean;
  subOutPlayerId: number | null;
  subInPlayerId: number | null;
  substitutionReason: 'FRESH_LEGS' | 'TACTICAL_TWEAK' | 'PROTECT_BOOKING';
  onSubOutChange: (playerId: number | null) => void;
  onSubInChange: (playerId: number | null) => void;
  onSubstitutionReasonChange: (reason: 'FRESH_LEGS' | 'TACTICAL_TWEAK' | 'PROTECT_BOOKING') => void;
  onMentalityChange: (intensity: number) => void;
  onPressingChange: (intensity: number) => void;
  onHalftimeTalk: (choice: 'PRAISE' | 'DEMAND_MORE' | 'CALM_FOCUS') => void;
  onSubstitution: () => void | Promise<void>;
}

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const pill: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 999,
  padding: '6px 10px',
  color: '#d8fff0',
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: 'uppercase'
};

const buttonBase: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.6)',
  background: 'rgba(132, 222, 181, 0.14)',
  color: '#e8fff3',
  borderRadius: 8,
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid rgba(132, 222, 181, 0.35)',
  background: 'rgba(5, 18, 12, 0.75)',
  color: '#ecfff5',
  padding: '10px 12px'
};

function resolvePlayerLabel(playerId: number, squadById: Map<number, SquadPlayer>): string {
  const player = squadById.get(playerId);
  if (!player) {
    return `#${playerId}`;
  }
  return `${player.fullName} (${player.position})`;
}

const LiveMatchPanel: React.FC<LiveMatchPanelProps> = ({
  payload,
  formation,
  lineupPolicy,
  benchPriority,
  preMatchInstruction,
  squadById,
  matchId,
  loading,
  subOutPlayerId,
  subInPlayerId,
  substitutionReason,
  onSubOutChange,
  onSubInChange,
  onSubstitutionReasonChange,
  onMentalityChange,
  onPressingChange,
  onHalftimeTalk,
  onSubstitution
}) => {
  const matchPrep = payload.match?.matchPrep;
  const liveState = payload.match?.liveState;
  const currentStarters = liveState?.currentStartingPlayerIds ?? matchPrep?.startingPlayerIds ?? [];
  const currentBench = liveState?.currentBenchPlayerIds ?? matchPrep?.benchPlayerIds ?? [];
  const canUseTactics = Boolean(liveState) && (liveState.remainingTacticalChanges ?? 0) > 0 && liveState.segment !== 'FULL_TIME';
  const canUseSubstitution = Boolean(liveState) && (liveState.remainingSubstitutions ?? 0) > 0 && currentBench.length > 0 && currentStarters.length > 0;
  const canUseHalftimeTalk = Boolean(liveState) && liveState.segment === 'HALFTIME' && !liveState.halftimeTalkUsed;

  return (
    <section style={{ display: 'grid', gap: 14 }}>
      <div style={card}>
        <div data-testid="match-center-locked-prep">
          <h3 style={{ marginTop: 0 }}>Locked Match Prep</h3>
          <div style={{ color: '#c8eedb' }}>
            Formation: {matchPrep?.formation || formation}
            {' '}| Lineup: {matchPrep?.lineupPolicy || lineupPolicy}
            {' '}| Bench: {matchPrep?.benchPriority || benchPriority}
            {' '}| Preset: {matchPrep?.preMatchInstruction || preMatchInstruction}
          </div>
          <div style={{ color: '#bde8d2', marginTop: 6, fontSize: 13 }}>
            XI {matchPrep?.startingPlayerIds?.length ?? 0}
            {' '}| Bench {matchPrep?.benchPlayerIds?.length ?? 0}
            {' '}| Captain{' '}
            {matchPrep?.captainPlayerId
              ? squadById.get(matchPrep.captainPlayerId)?.fullName ?? `#${matchPrep.captainPlayerId}`
              : '-'}
          </div>
        </div>
      </div>

      {liveState && (
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Matchday Control</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span style={pill}>{liveState.segment.replace('_', ' ')}</span>
            <span style={pill}>Minute {liveState.currentMinute}'</span>
            <span style={pill}>Mentality {liveState.mentality.replaceAll('_', ' ')}</span>
            <span style={pill}>Pressing {liveState.pressing.replaceAll('_', ' ')}</span>
            <span style={pill}>Tactical Changes Left {liveState.remainingTacticalChanges}</span>
            <span style={pill}>Subs Left {liveState.remainingSubstitutions}</span>
            <span style={pill}>Halftime {liveState.halftimeTalkChoice ? liveState.halftimeTalkChoice.replace('_', ' ') : 'Pending'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ border: '1px solid rgba(132, 222, 181, 0.18)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#9fd8bc' }}>On Pitch</div>
              <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                {currentStarters.map((playerId) => (
                  <div key={`starter-${playerId}`} style={{ color: '#ebfff4', fontSize: 13 }}>
                    {resolvePlayerLabel(playerId, squadById)}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid rgba(132, 222, 181, 0.18)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#9fd8bc' }}>Bench</div>
              <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                {currentBench.length === 0 && <div style={{ color: '#bde8d2', fontSize: 13 }}>No bench options left.</div>}
                {currentBench.map((playerId) => (
                  <div key={`bench-${playerId}`} style={{ color: '#ebfff4', fontSize: 13 }}>
                    {resolvePlayerLabel(playerId, squadById)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {canUseHalftimeTalk && (
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Halftime Decision</h3>
          <p style={{ marginTop: 0, color: '#bde8d2' }}>
            The first half is in. Pick the dressing-room tone before the second half resumes.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button data-testid="match-center-halftime-praise" style={buttonBase} onClick={() => onHalftimeTalk('PRAISE')} disabled={loading}>Praise Levels</button>
            <button data-testid="match-center-halftime-demand" style={buttonBase} onClick={() => onHalftimeTalk('DEMAND_MORE')} disabled={loading}>Demand More</button>
            <button data-testid="match-center-halftime-calm" style={buttonBase} onClick={() => onHalftimeTalk('CALM_FOCUS')} disabled={loading}>Calm and Refocus</button>
          </div>
        </div>
      )}

      <div style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Tactical Changes</h3>
        <p style={{ marginTop: 0, color: '#bde8d2' }}>
          Tactical changes now persist in the live state and alter the match context, not just the next highlight.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <button data-testid="match-center-intervention-mentality-positive" style={buttonBase} onClick={() => onMentalityChange(1)} disabled={loading || !canUseTactics}>Go Positive</button>
          <button data-testid="match-center-intervention-mentality-attack" style={buttonBase} onClick={() => onMentalityChange(3)} disabled={loading || !canUseTactics}>All-Out Attack</button>
          <button data-testid="match-center-intervention-mentality-protect" style={buttonBase} onClick={() => onMentalityChange(0)} disabled={loading || !canUseTactics}>Protect Lead</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button data-testid="match-center-intervention-pressing-high" style={buttonBase} onClick={() => onPressingChange(3)} disabled={loading || !canUseTactics}>High Press</button>
          <button data-testid="match-center-intervention-pressing-mid" style={buttonBase} onClick={() => onPressingChange(2)} disabled={loading || !canUseTactics}>Mid Block</button>
          <button data-testid="match-center-intervention-pressing-drop" style={buttonBase} onClick={() => onPressingChange(1)} disabled={loading || !canUseTactics}>Drop Off</button>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Substitution Console</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#9fd8bc', fontSize: 12, textTransform: 'uppercase' }}>Off</span>
            <select
              data-testid="match-center-sub-out-select"
              style={selectStyle}
              value={subOutPlayerId ?? ''}
              onChange={(event) => onSubOutChange(event.target.value ? Number(event.target.value) : null)}
              disabled={loading || !canUseSubstitution}
            >
              <option value="">Select starter</option>
              {currentStarters.map((playerId) => (
                <option key={`sub-out-${playerId}`} value={playerId}>{resolvePlayerLabel(playerId, squadById)}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#9fd8bc', fontSize: 12, textTransform: 'uppercase' }}>On</span>
            <select
              data-testid="match-center-sub-in-select"
              style={selectStyle}
              value={subInPlayerId ?? ''}
              onChange={(event) => onSubInChange(event.target.value ? Number(event.target.value) : null)}
              disabled={loading || !canUseSubstitution}
            >
              <option value="">Select bench player</option>
              {currentBench.map((playerId) => (
                <option key={`sub-in-${playerId}`} value={playerId}>{resolvePlayerLabel(playerId, squadById)}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#9fd8bc', fontSize: 12, textTransform: 'uppercase' }}>Reason</span>
            <select
              data-testid="match-center-sub-reason-select"
              style={selectStyle}
              value={substitutionReason}
              onChange={(event) => onSubstitutionReasonChange(event.target.value as 'FRESH_LEGS' | 'TACTICAL_TWEAK' | 'PROTECT_BOOKING')}
              disabled={loading || !canUseSubstitution}
            >
              <option value="FRESH_LEGS">Fresh Legs</option>
              <option value="TACTICAL_TWEAK">Tactical Tweak</option>
              <option value="PROTECT_BOOKING">Protect Booking</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 10 }}>
          <button
            data-testid="match-center-intervention-substitution"
            style={buttonBase}
            onClick={() => void onSubstitution()}
            disabled={loading || !canUseSubstitution || !subOutPlayerId || !subInPlayerId}
          >
            Make Substitution
          </button>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Match Highlights</h3>
        <div style={{ marginBottom: 10, color: '#bde8d2' }}>
          Status: {payload.match?.status}
          {' '}| xG {payload.match?.homeXg.toFixed(2)} - {payload.match?.awayXg.toFixed(2)}
          {' '}| Possession {payload.match?.homePossession}% - {payload.match?.awayPossession}%
        </div>
        <RetroHighlightCanvas
          highlights={payload.highlights}
          homeScore={payload.match?.homeScore ?? 0}
          awayScore={payload.match?.awayScore ?? 0}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link
          data-testid="match-center-finalize-post-match"
          style={{ ...buttonBase, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          to={matchId ? `/post-match/${matchId}` : '/hq'}
        >
          Finalize Post-Match
        </Link>
      </div>
    </section>
  );
};

export default LiveMatchPanel;
