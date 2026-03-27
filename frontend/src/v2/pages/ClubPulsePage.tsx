import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import V2Shell from '../components/V2Shell';
import { getClubPulse } from '../api';
import { ClubPulseSnapshot } from '../types';
import { useActiveCareer } from '../useActiveCareer';

function pulseToneClass(tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string {
  if (tone === 'POSITIVE') return 'v2-pulse-headline v2-pulse-headline--positive';
  if (tone === 'NEGATIVE') return 'v2-pulse-headline v2-pulse-headline--negative';
  return 'v2-pulse-headline';
}

function pulseScoreClass(value: number, inverted = false): string {
  if (inverted) {
    if (value >= 72) return 'v2-pulse-score v2-pulse-score--danger';
    if (value >= 52) return 'v2-pulse-score v2-pulse-score--warning';
    return 'v2-pulse-score v2-pulse-score--positive';
  }
  if (value >= 72) return 'v2-pulse-score v2-pulse-score--positive';
  if (value >= 46) return 'v2-pulse-score v2-pulse-score--warning';
  return 'v2-pulse-score v2-pulse-score--danger';
}

function resultChipClass(result: ClubPulseSnapshot['recentResults'][number]['outcome']): string {
  if (result === 'WIN') return 'v2-chip v2-chip--success';
  if (result === 'LOSS') return 'v2-chip v2-chip--danger';
  return 'v2-chip';
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

const ClubPulsePage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const [pulse, setPulse] = useState<ClubPulseSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!careerId) {
      setLoading(false);
      setPulse(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getClubPulse(careerId);
      setPulse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load club pulse.');
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!careerId) {
    return (
      <V2Shell title="Club Pulse">
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
      title="Club Pulse"
      actions={<Link className="v2-link-button v2-link-button--secondary" to="/inbox">Open Inbox</Link>}
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

        {pulse && (
          <>
            <section className="v2-grid v2-grid--stats" data-testid="club-pulse-summary">
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Fan Sentiment</p>
                <p className="v2-stat-card__value">{pulse.fanSentimentLabel}</p>
                <div className={pulseScoreClass(pulse.fanSentimentScore)}>{pulse.fanSentimentScore}/100</div>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Media Pressure</p>
                <p className="v2-stat-card__value">{pulse.mediaPressureLabel}</p>
                <div className={pulseScoreClass(pulse.mediaPressureScore, true)}>{pulse.mediaPressureScore}/100</div>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Projected Attendance</p>
                <p className="v2-stat-card__value">{pulse.projectedAttendance ? pulse.projectedAttendance.toLocaleString() : '-'}</p>
                <div className="v2-soft">{pulse.projectedAttendancePct ? `${pulse.projectedAttendancePct}% of club baseline` : 'Attendance baseline unavailable'}</div>
              </div>
              <div className="v2-stat-card">
                <p className="v2-stat-card__label">Top Headline</p>
                <p className="v2-stat-card__value v2-stat-card__value--compact">{pulse.topHeadline || 'No major headline'}</p>
              </div>
            </section>

            <section className="v2-grid v2-grid--two-up">
              <article className="v2-panel v2-panel--soft">
                <h3 className="v2-panel__title">Fan Mood</h3>
                <p className="v2-soft">{pulse.fanSummary}</p>
                <div className="v2-chip-row" style={{ marginTop: 10 }}>
                  <span className="v2-chip">Label: {pulse.fanSentimentLabel}</span>
                  <span className="v2-chip">Score: {pulse.fanSentimentScore}/100</span>
                </div>
              </article>

              <article className="v2-panel v2-panel--soft">
                <h3 className="v2-panel__title">Media Climate</h3>
                <p className="v2-soft">{pulse.mediaSummary}</p>
                <div className="v2-chip-row" style={{ marginTop: 10 }}>
                  <span className="v2-chip">Label: {pulse.mediaPressureLabel}</span>
                  <span className="v2-chip">Score: {pulse.mediaPressureScore}/100</span>
                  <span className="v2-chip v2-chip--warm">Board: {pulse.boardStatus.jobSecurity}</span>
                </div>
              </article>
            </section>

            <section className="v2-panel">
              <h3 className="v2-panel__title">Recent Results Context</h3>
              {pulse.recentResults.length > 0 ? (
                <div className="v2-chip-row">
                  {pulse.recentResults.map((result) => (
                    <span key={result.fixtureId} className={resultChipClass(result.outcome)}>
                      {result.outcome}: {result.scoreline} vs {result.opponentClubName ?? 'Opponent'}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="v2-message v2-message--subtle">No completed user fixtures yet.</div>
              )}
            </section>

            <section className="v2-panel">
              <h3 className="v2-panel__title">Pulse Headlines</h3>
              <div className="v2-pulse-feed" data-testid="club-pulse-headlines">
                {pulse.headlines.map((headline) => (
                  <article key={headline.id} className={pulseToneClass(headline.tone)}>
                    <div className="v2-pulse-headline__meta">
                      <span className="v2-chip">{headline.category}</span>
                      {headline.weekNumber ? <span className="v2-chip">Week {headline.weekNumber}</span> : null}
                      {headline.createdAt ? <span className="v2-chip">{formatDateTime(headline.createdAt)}</span> : null}
                    </div>
                    <h4 className="v2-pulse-headline__title">{headline.title}</h4>
                    <p className="v2-pulse-headline__summary">{headline.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </V2Shell>
  );
};

export default ClubPulsePage;
