import React, { useEffect, useState } from 'react';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import V2Shell from '../components/V2Shell';
import { getCareerState, submitWeekPlan } from '../api';
import { useActiveCareer } from '../useActiveCareer';

const WeekPlannerPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();

  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [trainingFocus, setTrainingFocus] = useState('BALANCED');
  const [rotationIntensity, setRotationIntensity] = useState('MEDIUM');
  const [tacticalMentality, setTacticalMentality] = useState('BALANCED');
  const [transferStance, setTransferStance] = useState('OPPORTUNISTIC');
  const [scoutingPriority, setScoutingPriority] = useState('LOCAL');
  const [latestMatchInsight, setLatestMatchInsight] = useState<{
    fixtureId: string;
    matchDate: string | null;
    opponentClubName: string | null;
    scoreline: string;
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendedWeekPlan: {
      trainingFocus: string;
      rotationIntensity: string;
      tacticalMentality: string;
    };
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!careerId) return;

    getCareerState(careerId)
      .then((state) => {
        setWeekNumber(state.weekNumber);
        setLatestMatchInsight(state.latestMatchInsight ?? null);
        if (state.weekPlan) {
          setTrainingFocus(state.weekPlan.trainingFocus);
          setRotationIntensity(state.weekPlan.rotationIntensity);
          setTacticalMentality(state.weekPlan.tacticalMentality);
          setTransferStance(state.weekPlan.transferStance);
          setScoutingPriority(state.weekPlan.scoutingPriority);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load week state.');
      });
  }, [careerId]);

  const handleApplyRecommendation = () => {
    if (!latestMatchInsight) {
      return;
    }
    setTrainingFocus(latestMatchInsight.recommendedWeekPlan.trainingFocus);
    setRotationIntensity(latestMatchInsight.recommendedWeekPlan.rotationIntensity);
    setTacticalMentality(latestMatchInsight.recommendedWeekPlan.tacticalMentality);
    setMessage('Latest match recommendation applied to the planner form.');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!careerId) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await submitWeekPlan(careerId, {
        trainingFocus,
        rotationIntensity,
        tacticalMentality,
        transferStance,
        scoutingPriority
      });
      setMessage('Week plan saved. Autosave updated.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit week plan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!careerId) {
    return (
      <V2Shell title="Week Planner">
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
    <V2Shell title="Week Planner">
      <section className="v2-grid v2-grid--two" style={{ alignItems: 'start' }}>
        <div className="v2-panel" style={{ maxWidth: 620 }}>
          <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Weekly Rhythm</p>
          <h2 className="v2-panel__title">Planning Setup</h2>
          <p className="v2-panel__subtitle" style={{ marginBottom: 14 }}>
            Configure the planning phase for week {weekNumber ?? '-'} and set the tone for training, tactics and recruitment.
          </p>

          <label className="v2-field">
            <span className="v2-field__label">Training Focus</span>
            <select data-testid="week-planner-training-focus" className="v2-select" value={trainingFocus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTrainingFocus(e.target.value)}>
              <option value="BALANCED">Balanced</option>
              <option value="FITNESS">Fitness</option>
              <option value="TACTICAL">Tactical</option>
              <option value="ATTACKING">Attacking</option>
              <option value="DEFENSIVE">Defensive</option>
            </select>
            <span className="v2-field__hint">Steers training gains and fatigue patterns for the coming week.</span>
          </label>

          <label className="v2-field">
            <span className="v2-field__label">Rotation Intensity</span>
            <select data-testid="week-planner-rotation-intensity" className="v2-select" value={rotationIntensity} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRotationIntensity(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <span className="v2-field__hint">Controls squad freshness versus chemistry continuity.</span>
          </label>

          <label className="v2-field">
            <span className="v2-field__label">Tactical Mentality</span>
            <select data-testid="week-planner-tactical-mentality" className="v2-select" value={tacticalMentality} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTacticalMentality(e.target.value)}>
              <option value="CAUTIOUS">Cautious</option>
              <option value="BALANCED">Balanced</option>
              <option value="AGGRESSIVE">Aggressive</option>
            </select>
            <span className="v2-field__hint">Impacts match approach and board expectations for results vs style.</span>
          </label>

          <label className="v2-field">
            <span className="v2-field__label">Transfer Stance</span>
            <select className="v2-select" value={transferStance} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTransferStance(e.target.value)}>
              <option value="OPPORTUNISTIC">Opportunistic</option>
              <option value="SELL_TO_BALANCE">Sell to Balance</option>
              <option value="INVEST">Invest</option>
            </select>
            <span className="v2-field__hint">Sets recruitment aggressiveness and budget pressure.</span>
          </label>

          <label className="v2-field">
            <span className="v2-field__label">Scouting Priority</span>
            <select className="v2-select" value={scoutingPriority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setScoutingPriority(e.target.value)}>
              <option value="LOCAL">Local</option>
              <option value="NATIONAL">National</option>
              <option value="INTERNATIONAL">International</option>
              <option value="YOUTH">Youth</option>
            </select>
            <span className="v2-field__hint">Determines which talent pools feed the transfer and academy pipeline.</span>
          </label>

          <div className="v2-inline-actions" style={{ marginTop: 4 }}>
            <button
              data-testid="week-planner-save-button"
              onClick={handleSubmit}
              disabled={submitting}
              className="v2-button v2-button--primary"
            >
              {submitting ? 'Saving...' : 'Save Week Plan'}
            </button>
          </div>

          <div className="v2-stack" style={{ marginTop: 10 }}>
            {message && <div className="v2-message v2-message--success">{message}</div>}
            {error && <div className="v2-message v2-message--error">{error}</div>}
          </div>
        </div>

        <aside className="v2-stack" style={{ gap: 14 }}>
          {latestMatchInsight && (
            <section data-testid="week-planner-latest-match-insight" className="v2-panel v2-panel--soft">
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Latest Match Insight</p>
              <h3 className="v2-panel__title" style={{ marginBottom: 6 }}>{latestMatchInsight.scoreline}</h3>
              <p className="v2-panel__subtitle" style={{ marginBottom: 10 }}>
                {latestMatchInsight.opponentClubName ?? 'Previous opponent'} • {latestMatchInsight.matchDate ? new Date(latestMatchInsight.matchDate).toLocaleString() : 'Recent fixture'}
              </p>
              <p style={{ marginTop: 0, color: '#bee8d3' }}>{latestMatchInsight.summary}</p>

              <div className="v2-stack" style={{ gap: 10 }}>
                {latestMatchInsight.strengths.length > 0 && (
                  <div className="v2-metric">
                    <p className="v2-metric__label">Keep</p>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {latestMatchInsight.strengths.map((item) => <p key={item} className="v2-metric__value">{item}</p>)}
                    </div>
                  </div>
                )}
                {latestMatchInsight.concerns.length > 0 && (
                  <div className="v2-metric">
                    <p className="v2-metric__label">Fix</p>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {latestMatchInsight.concerns.map((item) => <p key={item} className="v2-metric__value">{item}</p>)}
                    </div>
                  </div>
                )}
                <div className="v2-metric">
                  <p className="v2-metric__label">Recommended Plan</p>
                  <p className="v2-metric__value">
                    {latestMatchInsight.recommendedWeekPlan.trainingFocus} / {latestMatchInsight.recommendedWeekPlan.rotationIntensity} / {latestMatchInsight.recommendedWeekPlan.tacticalMentality}
                  </p>
                </div>
              </div>

              <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  data-testid="week-planner-apply-match-recommendation"
                  className="v2-button v2-button--secondary"
                  onClick={handleApplyRecommendation}
                >
                  Apply Recommendation
                </button>
              </div>
            </section>
          )}

          <aside className="v2-panel v2-panel--soft">
            <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Quick Guide</p>
            <h3 className="v2-panel__title">What changes week to week?</h3>
            <div className="v2-stack" style={{ gap: 10, marginTop: 10 }}>
              <div className="v2-metric">
                <p className="v2-metric__label">Training + Rotation</p>
                <p className="v2-metric__value">Affects fitness trend, morale swings and match readiness.</p>
              </div>
              <div className="v2-metric">
                <p className="v2-metric__label">Mentality</p>
                <p className="v2-metric__value">Shapes risk profile in match simulation outcomes.</p>
              </div>
              <div className="v2-metric">
                <p className="v2-metric__label">Transfers + Scouting</p>
                <p className="v2-metric__value">Influences market shortlist quality and budget posture.</p>
              </div>
            </div>
          </aside>
        </aside>
      </section>
    </V2Shell>
  );
};

export default WeekPlannerPage;
