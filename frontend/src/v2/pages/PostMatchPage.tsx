import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import V2Shell from '../components/V2Shell';
import { getPostMatch } from '../api';
import { PostMatchPayload } from '../types';
import { useActiveCareer } from '../useActiveCareer';

function extractCareerIdFromMatchId(matchId: string | undefined): string | null {
  if (!matchId) return null;
  const marker = ':fx:';
  const markerIndex = matchId.indexOf(marker);
  if (markerIndex <= 0) return null;
  return matchId.slice(0, markerIndex);
}

function formatKickoff(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function formatSigned(value: number, digits = 0): string {
  const rounded = Number(value.toFixed(digits));
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded.toFixed(digits)}`;
}

function formatRating(value: number): string {
  return value.toFixed(1);
}

function describeManagedResult(homeScore: number, awayScore: number, managedSide: 'home' | 'away'): string {
  const managedScore = managedSide === 'home' ? homeScore : awayScore;
  const opponentScore = managedSide === 'home' ? awayScore : homeScore;
  if (managedScore > opponentScore) return 'Win';
  if (managedScore < opponentScore) return 'Loss';
  return 'Draw';
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function interventionLabel(type: string): string {
  switch (type) {
    case 'MENTALITY_SHIFT':
      return 'Mentality Shift';
    case 'PRESSING_INTENSITY':
      return 'Pressing Intensity';
    case 'SUBSTITUTION_TRIGGER':
      return 'Substitution Trigger';
    case 'HALFTIME_TEAM_TALK':
      return 'Halftime Team Talk';
    default:
      return type;
  }
}

function ratingColor(value: number): string {
  if (value >= 7.8) return '#9effc8';
  if (value >= 7.0) return '#dfffe7';
  if (value <= 6.1) return '#ffb7b7';
  return '#e8fff3';
}

const PostMatchPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const { matchId } = useParams<{ matchId: string }>();
  const routeCareerId = extractCareerIdFromMatchId(matchId);

  const [data, setData] = useState<PostMatchPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routeCareerId && careerId !== routeCareerId) {
      setCareerId(routeCareerId);
    }
  }, [careerId, routeCareerId, setCareerId]);

  useEffect(() => {
    if (!careerId || !matchId) return;
    if (routeCareerId && careerId !== routeCareerId) return;

    setLoading(true);
    setError(null);
    setData(null);

    getPostMatch(careerId, matchId)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load post-match recap.'))
      .finally(() => setLoading(false));
  }, [careerId, matchId, routeCareerId]);

  const managedSide = useMemo<'home' | 'away'>(() => {
    if (data?.fixture?.isControlledClubHome === false) {
      return 'away';
    }
    return 'home';
  }, [data?.fixture?.isControlledClubHome]);

  const managedChanceProfile = data?.chanceQuality
    ? managedSide === 'home'
      ? data.chanceQuality.home
      : data.chanceQuality.away
    : null;
  const opponentChanceProfile = data?.chanceQuality
    ? managedSide === 'home'
      ? data.chanceQuality.away
      : data.chanceQuality.home
    : null;
  const managedResult = data ? describeManagedResult(data.score.home, data.score.away, managedSide) : null;
  const managedXg = data ? (managedSide === 'home' ? data.xg.home : data.xg.away) : null;
  const opponentXg = data ? (managedSide === 'home' ? data.xg.away : data.xg.home) : null;
  const managedPossession = data ? (managedSide === 'home' ? data.possession.home : data.possession.away) : null;

  if (!careerId) {
    return (
      <V2Shell title="Post Match">
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
    <V2Shell title="Post-Match Recap">
      {loading && <p>Loading recap...</p>}
      {error && <p style={{ color: '#ffb9b9' }}>{error}</p>}

      {data && (
        <div data-testid="post-match-loaded" className="v2-stack" style={{ gap: 14 }}>
          <section data-testid="post-match-manager-verdict" style={{ ...card, padding: 18 }}>
            <div className="v2-inline-actions" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ maxWidth: 760 }}>
                <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Manager Verdict</p>
                <h2 style={{ marginTop: 0, marginBottom: 6 }}>
                  {managedResult} built on {data.chanceQuality ? titleCase(data.chanceQuality.verdict) : 'match control'}
                </h2>
                <p style={{ marginTop: 0, marginBottom: 0, color: '#d7f7e6' }}>
                  {data.tacticalFeedback?.summary ?? data.chanceQuality?.summary ?? 'Post-match summary unavailable.'}
                </p>
              </div>
              <div className="v2-chip-row">
                {managedResult ? <span className={`v2-chip ${managedResult === 'Loss' ? 'v2-chip--danger' : managedResult === 'Draw' ? 'v2-chip--warm' : ''}`}>{managedResult}</span> : null}
                {managedXg !== null && opponentXg !== null ? <span className="v2-chip">xG edge {formatSigned(managedXg - opponentXg, 2)}</span> : null}
                {managedPossession !== null ? <span className="v2-chip">Possession {managedPossession}%</span> : null}
              </div>
            </div>
            <div className="v2-metric-grid" style={{ marginTop: 14 }}>
              <div className="v2-metric">
                <p className="v2-metric__label">Top Performer</p>
                <p className="v2-metric__value">{data.playerRatings?.topPerformer?.playerName ?? '-'}</p>
              </div>
              <div className="v2-metric">
                <p className="v2-metric__label">Next Week Focus</p>
                <p className="v2-metric__value">{titleCase(data.tacticalFeedback?.recommendedWeekPlan.trainingFocus ?? 'BALANCED')}</p>
              </div>
              <div className="v2-metric">
                <p className="v2-metric__label">Rotation Call</p>
                <p className="v2-metric__value">{titleCase(data.tacticalFeedback?.recommendedWeekPlan.rotationIntensity ?? 'BALANCED')}</p>
              </div>
              <div className="v2-metric">
                <p className="v2-metric__label">Fitness Watch</p>
                <p className="v2-metric__value">{data.playerImpact?.averageFitness ?? '-'} avg</p>
              </div>
            </div>
          </section>

          <section className="v2-grid v2-grid--two" style={{ alignItems: 'stretch' }}>
            {data.fixture && (
              <div style={card}>
                <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Fixture</p>
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>{data.fixture.homeClubName} vs {data.fixture.awayClubName}</h3>
                <div>Opponent: {data.fixture.opponentClubName ?? '-'}</div>
                <div>League: {data.fixture.leagueName ?? `League ${data.fixture.leagueId}`}</div>
                <div>Kickoff: {formatKickoff(data.fixture.matchDate)}</div>
              </div>
            )}

            <div style={card}>
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Result</p>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{data.score.home} - {data.score.away}</div>
              <div>xG: {data.xg.home.toFixed(2)} - {data.xg.away.toFixed(2)}</div>
              <div>Possession: {data.possession.home}% - {data.possession.away}%</div>
              {data.playerRatings && (
                <div style={{ marginTop: 12, display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                  <div style={metricTile}>
                    <span style={metricLabel}>Average Rating</span>
                    <strong style={metricValue}>{formatRating(data.playerRatings.averageRating)}</strong>
                  </div>
                  <div style={metricTile}>
                    <span style={metricLabel}>Top Performer</span>
                    <strong style={{ ...metricValue, fontSize: 16 }}>{data.playerRatings.topPerformer?.playerName ?? '-'}</strong>
                  </div>
                </div>
              )}
            </div>
          </section>

          {data.chanceQuality && managedChanceProfile && opponentChanceProfile && (
            <section data-testid="post-match-chance-quality" style={card}>
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Chance Quality</p>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>How the match really looked</h3>
              <p style={{ marginTop: 0, color: '#bee8d3' }}>{data.chanceQuality.summary}</p>
              <div className="v2-grid v2-grid--two" style={{ alignItems: 'stretch' }}>
                <div style={analysisPanel}>
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>Your Threat</h4>
                  <div style={analysisGrid}>
                    <div style={metricTile}><span style={metricLabel}>Shots</span><strong style={metricValue}>{managedChanceProfile.shots}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>On Target</span><strong style={metricValue}>{managedChanceProfile.shotsOnTarget}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Big Chances</span><strong style={metricValue}>{managedChanceProfile.bigChances}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Shot xG</span><strong style={metricValue}>{managedChanceProfile.totalShotXg.toFixed(2)}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Best Chance</span><strong style={metricValue}>{managedChanceProfile.bestChanceXg.toFixed(2)}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Offsides</span><strong style={metricValue}>{managedChanceProfile.offsides}</strong></div>
                  </div>
                </div>
                <div style={analysisPanel}>
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>Opponent Threat</h4>
                  <div style={analysisGrid}>
                    <div style={metricTile}><span style={metricLabel}>Shots</span><strong style={metricValue}>{opponentChanceProfile.shots}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>On Target</span><strong style={metricValue}>{opponentChanceProfile.shotsOnTarget}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Big Chances</span><strong style={metricValue}>{opponentChanceProfile.bigChances}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Shot xG</span><strong style={metricValue}>{opponentChanceProfile.totalShotXg.toFixed(2)}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Woodwork</span><strong style={metricValue}>{opponentChanceProfile.woodwork}</strong></div>
                    <div style={metricTile}><span style={metricLabel}>Blocked</span><strong style={metricValue}>{opponentChanceProfile.blockedShots}</strong></div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {data.tacticalFeedback && (
            <section data-testid="post-match-tactical-feedback" style={card}>
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Tactical Feedback</p>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>Next-week planning readout</h3>
              <p style={{ marginTop: 0, color: '#bee8d3' }}>{data.tacticalFeedback.summary}</p>
              <div className="v2-grid v2-grid--two" style={{ alignItems: 'start' }}>
                <div style={analysisPanel}>
                  <h4 style={{ marginTop: 0 }}>What worked</h4>
                  {data.tacticalFeedback.strengths.length > 0 ? (
                    <ul style={listStyle}>
                      {data.tacticalFeedback.strengths.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p style={mutedText}>No standout tactical positives were detected.</p>
                  )}
                </div>
                <div style={analysisPanel}>
                  <h4 style={{ marginTop: 0 }}>What needs correcting</h4>
                  {data.tacticalFeedback.concerns.length > 0 ? (
                    <ul style={listStyle}>
                      {data.tacticalFeedback.concerns.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p style={mutedText}>No major structural concern flagged from the match sample.</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 12 }}>
                <div style={metricTile}><span style={metricLabel}>Training Focus</span><strong style={metricValue}>{titleCase(data.tacticalFeedback.recommendedWeekPlan.trainingFocus)}</strong></div>
                <div style={metricTile}><span style={metricLabel}>Rotation</span><strong style={metricValue}>{titleCase(data.tacticalFeedback.recommendedWeekPlan.rotationIntensity)}</strong></div>
                <div style={metricTile}><span style={metricLabel}>Mentality</span><strong style={metricValue}>{titleCase(data.tacticalFeedback.recommendedWeekPlan.tacticalMentality)}</strong></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <h4 style={{ marginBottom: 8 }}>Manager Notes</h4>
                <ul style={listStyle}>
                  {data.tacticalFeedback.recommendations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div style={{ marginTop: 10, color: '#bee8d3' }}>
                <strong>Intervention read:</strong> {data.tacticalFeedback.interventionRead.verdict}
              </div>
            </section>
          )}

          {data.playerRatings && (
            <section data-testid="post-match-player-ratings" style={card}>
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Player Ratings</p>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Who drove the match</h3>
              <div className="v2-grid v2-grid--two" style={{ alignItems: 'stretch' }}>
                <div style={analysisPanel}>
                  <h4 style={{ marginTop: 0 }}>Top Performer</h4>
                  {data.playerRatings.topPerformer ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{data.playerRatings.topPerformer.playerName}</div>
                      <div style={{ color: ratingColor(data.playerRatings.topPerformer.rating), fontWeight: 800, marginTop: 4 }}>{formatRating(data.playerRatings.topPerformer.rating)}</div>
                      <p style={mutedText}>{data.playerRatings.topPerformer.summary}</p>
                    </>
                  ) : <p style={mutedText}>No rating leader available.</p>}
                </div>
                <div style={analysisPanel}>
                  <h4 style={{ marginTop: 0 }}>Biggest Concern</h4>
                  {data.playerRatings.biggestConcern ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{data.playerRatings.biggestConcern.playerName}</div>
                      <div style={{ color: ratingColor(data.playerRatings.biggestConcern.rating), fontWeight: 800, marginTop: 4 }}>{formatRating(data.playerRatings.biggestConcern.rating)}</div>
                      <p style={mutedText}>{data.playerRatings.biggestConcern.summary}</p>
                    </>
                  ) : <p style={mutedText}>No low-rating flag available.</p>}
                </div>
              </div>
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={cellHead}>Player</th>
                      <th style={cellHead}>Role</th>
                      <th style={cellHead}>Min</th>
                      <th style={cellHead}>Rating</th>
                      <th style={cellHead}>Output</th>
                      <th style={cellHead}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.playerRatings.rows.map((row) => (
                      <tr key={row.playerId}>
                        <td style={cell}><strong>{row.playerName}</strong><div style={subtleLine}>{row.position}</div></td>
                        <td style={cell}>{titleCase(row.role)}</td>
                        <td style={cell}>{row.minutes}</td>
                        <td style={{ ...cell, color: ratingColor(row.rating), fontWeight: 800 }}>{formatRating(row.rating)}</td>
                        <td style={cell}>{row.goals}G | {row.shots} Sh | {row.xg.toFixed(2)} xG</td>
                        <td style={cell}>{row.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="v2-grid v2-grid--two" style={{ alignItems: 'stretch' }}>
            <div style={card}>
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Club Impact</p>
              <h3 style={{ marginTop: 0 }}>How the result landed internally</h3>
              <div className="v2-metric-grid">
                <div className="v2-metric"><p className="v2-metric__label">Morale</p><p className="v2-metric__value">{data.clubState?.morale ?? '-'}</p></div>
                <div className="v2-metric"><p className="v2-metric__label">Board Confidence</p><p className="v2-metric__value">{data.clubState?.boardConfidence ?? '-'}</p></div>
                <div className="v2-metric"><p className="v2-metric__label">Fitness Trend</p><p className="v2-metric__value">{data.clubState?.fitnessTrend ?? '-'}</p></div>
                <div className="v2-metric"><p className="v2-metric__label">Budget Balance</p><p className="v2-metric__value">{data.clubState?.budgetBalance ?? '-'}</p></div>
              </div>
            </div>

            <div style={card}>
              <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Squad Condition</p>
              <h3 style={{ marginTop: 0 }}>Physical state going into the next week</h3>
              <div className="v2-metric-grid">
                <div className="v2-metric"><p className="v2-metric__label">Average Fitness</p><p className="v2-metric__value">{data.playerImpact?.averageFitness ?? '-'}</p></div>
                <div className="v2-metric"><p className="v2-metric__label">Average Morale</p><p className="v2-metric__value">{data.playerImpact?.averageMorale ?? '-'}</p></div>
                <div className="v2-metric"><p className="v2-metric__label">Average Form</p><p className="v2-metric__value">{data.playerImpact?.averageForm ?? '-'}</p></div>
                <div className="v2-metric"><p className="v2-metric__label">Unavailable</p><p className="v2-metric__value">{(data.playerImpact?.injuredCount ?? 0) + (data.playerImpact?.suspendedCount ?? 0)}</p></div>
              </div>
            </div>
          </section>

          {data.interventionImpact && data.interventionImpact.totalInterventions > 0 && (
            <section data-testid="post-match-intervention-impact" style={card}>
              <h3 style={{ marginTop: 0 }}>Intervention Impact</h3>
              <div data-testid="post-match-intervention-summary" style={{ marginBottom: 8 }}>
                Interventions: {data.interventionImpact.totalInterventions} | Direct Goal Swing: {formatSigned(data.interventionImpact.aggregate.directNetGoalDelta)} | Direct xG Swing: {formatSigned(data.interventionImpact.aggregate.directNetXgDelta, 2)}
              </div>
              <div style={{ marginBottom: 10 }}>
                Window Goal Swing: {formatSigned(data.interventionImpact.aggregate.windowNetGoalDelta)} | Window xThreat Swing: {formatSigned(data.interventionImpact.aggregate.windowNetXThreatDelta, 3)} | Direct Goals: {data.interventionImpact.aggregate.directGoalsFromInterventions}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={cellHead}>#</th>
                    <th style={cellHead}>Type</th>
                    <th style={cellHead}>Window</th>
                    <th style={cellHead}>Direct Delta</th>
                    <th style={cellHead}>Window Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {data.interventionImpact.windows.map((row) => (
                    <tr data-testid="post-match-intervention-row" key={`${row.index}-${row.minute}-${row.type}`}>
                      <td style={cell}>{row.index}</td>
                      <td style={cell}>
                        {interventionLabel(row.type)}
                        {row.intensity !== null ? ` (i${row.intensity})` : ''}
                      </td>
                      <td style={cell}>{row.minute}'-{row.windowEndMinute}'</td>
                      <td style={cell}>Goals {formatSigned(row.directNetGoalDelta)} | xG {formatSigned(row.directNetXgDelta, 2)}</td>
                      <td style={cell}>Goals {formatSigned(row.windowNetGoalDelta)} | xThreat {formatSigned(row.windowNetXThreatDelta, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section style={card}>
            <h3 style={{ marginTop: 0 }}>Standings Snapshot</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={cellHead}>Pos</th>
                  <th style={cellHead}>Club</th>
                  <th style={cellHead}>Pts</th>
                  <th style={cellHead}>GD</th>
                </tr>
              </thead>
              <tbody>
                {data.standingsPreview?.map((row) => (
                  <tr key={`${row.clubId}-${row.position}`}>
                    <td style={cell}>{row.position}</td>
                    <td style={cell}>{row.clubName}</td>
                    <td style={cell}>{row.points}</td>
                    <td style={cell}>{row.goalDifference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link data-testid="post-match-back-hq" className="v2-link-button v2-link-button--primary" to="/hq">Back to HQ</Link>
            <Link className="v2-link-button" to="/week-planner">Open Week Planner</Link>
            <Link className="v2-link-button" to="/inbox">Check Inbox</Link>
          </section>
        </div>
      )}
    </V2Shell>
  );
};

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const analysisPanel: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.18)',
  borderRadius: 10,
  padding: 12,
  background: 'rgba(255, 255, 255, 0.02)'
};

const analysisGrid: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
};

const metricTile: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.16)',
  borderRadius: 10,
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.02)',
  display: 'grid',
  gap: 4
};

const metricLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#9fd2ba'
};

const metricValue: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: '#effff5'
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  display: 'grid',
  gap: 6,
  color: '#dff6ea'
};

const mutedText: React.CSSProperties = {
  margin: 0,
  color: '#bee8d3'
};

const subtleLine: React.CSSProperties = {
  fontSize: 12,
  color: '#9fd2ba'
};

const cellHead: React.CSSProperties = {
  borderBottom: '1px solid rgba(132, 222, 181, 0.35)',
  textAlign: 'left',
  padding: '6px 8px'
};

const cell: React.CSSProperties = {
  borderBottom: '1px solid rgba(132, 222, 181, 0.15)',
  padding: '6px 8px',
  verticalAlign: 'top'
};

export default PostMatchPage;
