import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import ContractWeekWrapDigestCard from '../components/ContractWeekWrapDigestCard';
import V2Shell from '../components/V2Shell';
import { advanceWeek, getCareerState } from '../api';
import { CareerState } from '../types';
import { useActiveCareer } from '../useActiveCareer';

function boardRiskLabel(boardConfidence: number | null | undefined): 'STABLE' | 'WATCH' | 'PRESSURE' | 'CRITICAL' {
  const value = typeof boardConfidence === 'number' ? boardConfidence : 50;
  if (value < 30) return 'CRITICAL';
  if (value < 45) return 'PRESSURE';
  if (value < 60) return 'WATCH';
  return 'STABLE';
}

function formatKickoff(value?: string): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString();
}

function boardObjectiveColor(status: 'ON_TRACK' | 'AT_RISK' | 'FAILED'): string {
  if (status === 'ON_TRACK') return '#9ef3c8';
  if (status === 'AT_RISK') return '#ffd37a';
  return '#ff9f9f';
}

function boardRiskBadgeClass(label: ReturnType<typeof boardRiskLabel>): string {
  if (label === 'CRITICAL') return 'v2-badge v2-badge--danger';
  if (label === 'PRESSURE') return 'v2-badge v2-badge--warning';
  if (label === 'WATCH') return 'v2-badge v2-badge--medium';
  return 'v2-badge v2-badge--success';
}

const HQPage: React.FC = () => {
  const navigate = useNavigate();
  const [career, setCareer] = useState<CareerState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();

  const load = useCallback(async () => {
    if (!careerId) {
      setLoading(false);
      setError('No active career selected.');
      return;
    }

    try {
      setError(null);
      const data = await getCareerState(careerId);
      setCareer(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load career state.');
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdvanceWeek = async () => {
    if (!careerId) return;
    setAdvancing(true);
    setError(null);
    try {
      const updated = await advanceWeek(careerId);
      setCareer(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to advance week.');
    } finally {
      setAdvancing(false);
    }
  };

  const continueLabel = (() => {
    if (advancing) {
      return 'Processing...';
    }
    if (!career) {
      return 'Continue Weekly Loop';
    }
    switch (career.currentPhase) {
      case 'TERMINATED':
        return 'Career Ended by Board';
      case 'PLANNING':
        return career.pendingActions?.needsWeekPlan ? 'Continue: Open Week Planner' : 'Continue: Advance to Events';
      case 'EVENT':
        return career.pendingEvents > 0 ? 'Continue: Resolve Inbox Events' : 'Continue: Advance to Match Prep';
      case 'MATCH_PREP':
        return 'Continue: Open Match Center';
      case 'MATCH':
        return 'Continue: Return to Match';
      case 'POST_MATCH':
        return 'Continue: Open Post-Match';
      case 'WEEK_WRAP':
        return 'Continue: Start Next Week';
      default:
        return 'Continue Weekly Loop';
    }
  })();

  const handleContinueLoop = async () => {
    if (!career) return;

    switch (career.currentPhase) {
      case 'TERMINATED':
        setError('This career has been terminated by the board. Start a new career or load another save.');
        navigate('/new-career');
        return;
      case 'PLANNING':
        if (career.pendingActions?.needsWeekPlan) {
          navigate('/week-planner');
          return;
        }
        await handleAdvanceWeek();
        return;
      case 'EVENT':
        if (career.pendingEvents > 0) {
          navigate('/inbox');
          return;
        }
        await handleAdvanceWeek();
        return;
      case 'MATCH_PREP':
      case 'MATCH':
        if (career.nextUserFixture?.id) {
          navigate(`/match-center/${career.nextUserFixture.id}`);
          return;
        }
        setError('No user fixture available for match flow.');
        return;
      case 'POST_MATCH':
        if (career.nextUserFixture?.id) {
          navigate(`/post-match/${career.nextUserFixture.id}`);
          return;
        }
        await handleAdvanceWeek();
        return;
      case 'WEEK_WRAP':
        await handleAdvanceWeek();
        return;
      default:
        await handleAdvanceWeek();
    }
  };

  const careerTerminated = career?.currentPhase === 'TERMINATED';

  if (!careerId) {
    return (
      <V2Shell title="HQ">
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
    <V2Shell
      title="Manager HQ"
      actions={
        <button
          onClick={() => navigate('/new-career')}
          className="v2-button v2-button--secondary"
        >
          Change Career
        </button>
      }
    >
      <div className="v2-stack">
        {loading && (
          <div className="v2-grid v2-grid--stats">
            <div className="v2-skeleton" />
            <div className="v2-skeleton" />
            <div className="v2-skeleton" />
          </div>
        )}
        {error && <div className="v2-message v2-message--error">{error}</div>}

        {career && (
          <>
            <section className="v2-grid v2-grid--stats">
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Manager</p>
                <p className="v2-stat-card__value">{career.managerName}</p>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Club</p>
                <p className="v2-stat-card__value">{career.club?.name || `#${career.controlledClubId}`}</p>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Season</p>
                <p className="v2-stat-card__value" data-testid="hq-season-value">{career.season}</p>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Week</p>
                <p className="v2-stat-card__value" data-testid="hq-week-value">{career.weekNumber}</p>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Phase</p>
                <p className="v2-stat-card__value v2-stat-card__value--compact" data-testid="hq-phase-value">{career.currentPhase}</p>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Pending Events</p>
                <p className="v2-stat-card__value">
                  {career.pendingEvents} ({career.urgentPendingEvents} urgent)
                </p>
              </div>
            </section>

            <section className="v2-stack">
              {careerTerminated && (
                <div className="v2-panel v2-panel--danger">
                  <h3 className="v2-panel__title">Board Dismissal</h3>
                  <div className="v2-soft">
                    This career has ended due to board dismissal. You can still inspect records, then start a new career or load another save.
                  </div>
                  <div className="v2-inline-actions" style={{ marginTop: 10 }}>
                    <Link className="v2-link-button v2-link-button--danger" to="/new-career">
                      Open Career Setup
                    </Link>
                  </div>
                </div>
              )}

              <div className="v2-panel">
                <div className="v2-inline-actions" style={{ justifyContent: 'space-between' }}>
                  <h3 className="v2-panel__title" style={{ marginBottom: 0 }}>Current Club State</h3>
                  <span className={boardRiskBadgeClass(boardRiskLabel(career.clubState?.boardConfidence))}>
                    {boardRiskLabel(career.clubState?.boardConfidence)}
                  </span>
                </div>
                <div className="v2-metric-grid">
                  <div className="v2-metric">
                    <p className="v2-metric__label">Morale</p>
                    <p className="v2-metric__value">{career.clubState?.morale ?? '-'}</p>
                  </div>
                  <div className="v2-metric">
                    <p className="v2-metric__label">Fitness Trend</p>
                    <p className="v2-metric__value">{career.clubState?.fitnessTrend ?? '-'}</p>
                  </div>
                  <div className="v2-metric">
                    <p className="v2-metric__label">Board Confidence</p>
                    <p className="v2-metric__value">{career.clubState?.boardConfidence ?? '-'}</p>
                  </div>
                  <div className="v2-metric">
                    <p className="v2-metric__label">Budget Balance</p>
                    <p className="v2-metric__value">{career.clubState?.budgetBalance ?? '-'}</p>
                  </div>
                  <div className="v2-metric">
                    <p className="v2-metric__label">Form</p>
                    <p className="v2-metric__value">{career.clubState?.form ?? '-'}</p>
                  </div>
                </div>
                {boardRiskLabel(career.clubState?.boardConfidence) === 'CRITICAL' ? (
                  <div className="v2-message v2-message--warning" style={{ marginTop: 10 }}>
                    Board pressure is critical. Expect urgent interventions and lower tolerance for poor results.
                  </div>
                ) : null}
              </div>

              {career.boardStatus && (
                <div className="v2-panel">
                  <h3 className="v2-panel__title">Board Objectives & Job Security</h3>
                  <div className="v2-chip-row" style={{ marginBottom: 8 }}>
                    <span className="v2-chip">Security: {career.boardStatus.jobSecurity}</span>
                    <span className="v2-chip">Score: {career.boardStatus.jobSecurityScore}/100</span>
                    <span className="v2-chip">Confidence: {career.boardStatus.boardConfidence}</span>
                    <span className="v2-chip v2-chip--warm">Risk: {career.boardStatus.boardRiskLevel}</span>
                  </div>
                  {career.boardStatus.reviewWindowWeeks ? (
                    <div className="v2-message v2-message--warning" style={{ marginBottom: 8 }}>
                      Review Window: {career.boardStatus.reviewWindowWeeks} week{career.boardStatus.reviewWindowWeeks === 1 ? '' : 's'}
                    </div>
                  ) : null}
                  <div className="v2-soft" style={{ marginBottom: 10 }}>{career.boardStatus.summary}</div>
                  <div className="v2-grid" style={{ gap: 8 }}>
                    {career.boardStatus.objectives.map((objective) => (
                      <div key={objective.id} className="v2-objective-row">
                        <div className="v2-objective-row__header">
                          <div className="v2-objective-row__title">{objective.title}</div>
                          <div style={{ color: boardObjectiveColor(objective.status), fontWeight: 800, fontSize: 13 }}>
                            {objective.status}
                          </div>
                        </div>
                        <div className="v2-objective-row__meta">Target: {objective.target}</div>
                        <div className="v2-objective-row__meta">Current: {objective.current}</div>
                        <div className="v2-objective-row__submeta">
                          Progress: {objective.progressPct}% | Weight: {objective.weight}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {career.clubPulseSummary && (
                <div className="v2-panel v2-panel--soft" data-testid="hq-club-pulse-panel">
                  <div className="v2-inline-actions" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className="v2-panel__title" style={{ marginBottom: 4 }}>Club Pulse</h3>
                      <div className="v2-soft">{career.clubPulseSummary.topHeadline || career.clubPulseSummary.fanSummary}</div>
                    </div>
                    <Link className="v2-link-button v2-link-button--secondary" to="/club-pulse">Open Pulse</Link>
                  </div>
                  <div className="v2-chip-row" style={{ marginTop: 10 }}>
                    <span className="v2-chip">Fans: {career.clubPulseSummary.fanSentimentLabel} ({career.clubPulseSummary.fanSentimentScore})</span>
                    <span className="v2-chip">Media: {career.clubPulseSummary.mediaPressureLabel} ({career.clubPulseSummary.mediaPressureScore})</span>
                    <span className="v2-chip">Attendance: {career.clubPulseSummary.projectedAttendance ? career.clubPulseSummary.projectedAttendance.toLocaleString() : '-'}</span>
                  </div>
                </div>
              )}

              {career.lastContractWeekWrapDigest && (
                <ContractWeekWrapDigestCard
                  digest={career.lastContractWeekWrapDigest}
                  title="Recent Contract Week Wrap"
                  testId="hq-contract-week-wrap-digest"
                />
              )}

              <div className="v2-panel">
                <h3 className="v2-panel__title">Next User Fixture</h3>
                {career.nextUserFixture ? (
                  <div className="v2-stack" style={{ gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
                        {career.nextUserFixture.homeClubName ?? `Club ${career.nextUserFixture.homeClubId}`}
                        {' vs '}
                        {career.nextUserFixture.awayClubName ?? `Club ${career.nextUserFixture.awayClubId}`}
                      </div>
                      <div className="v2-chip-row" style={{ marginTop: 8 }}>
                        <span className="v2-chip">
                          {career.nextUserFixture.isControlledClubHome === null
                            ? 'Managed Side: -'
                            : career.nextUserFixture.isControlledClubHome
                              ? 'Managed Side: HOME'
                              : 'Managed Side: AWAY'}
                        </span>
                        <span className="v2-chip">Opponent: {career.nextUserFixture.opponentClubName ?? '-'}</span>
                        <span className="v2-chip">League: {career.nextUserFixture.leagueName ?? `League ${career.nextUserFixture.leagueId}`}</span>
                        <span className="v2-chip">Kickoff: {formatKickoff(career.nextUserFixture.matchDate)}</span>
                        <span className="v2-chip v2-chip--warm">Status: {career.nextUserFixture.status}</span>
                      </div>
                    </div>
                    <div className="v2-inline-actions">
                      <Link data-testid="hq-open-match-center" className="v2-link-button v2-link-button--secondary" to={`/match-center/${career.nextUserFixture.id}`}>
                        Open Match Center
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="v2-message v2-message--subtle">No user fixture scheduled for this week.</div>
                )}
              </div>
            </section>

            <section className="v2-inline-actions">
              <button
                data-testid="hq-continue-button"
                onClick={handleContinueLoop}
                disabled={advancing || careerTerminated}
                className="v2-button v2-button--primary"
              >
                {continueLabel}
              </button>
              <button
                data-testid="hq-advance-button"
                onClick={handleAdvanceWeek}
                disabled={advancing || careerTerminated}
                className="v2-button v2-button--secondary"
              >
                {advancing ? 'Processing...' : 'Advance Week / Phase'}
              </button>
              <Link className="v2-link-button v2-link-button--secondary" to="/week-planner">Open Week Planner</Link>
              <Link className="v2-link-button v2-link-button--secondary" to="/inbox">Open Inbox</Link>
              {career.activeLeagueId && <Link className="v2-link-button v2-link-button--secondary" to="/standings">Open Standings</Link>}
            </section>
          </>
        )}
      </div>
    </V2Shell>
  );
};

export default HQPage;
