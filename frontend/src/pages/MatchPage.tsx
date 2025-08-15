import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fixture, setFixture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const res = await fetch(`/api/fixtures/${id}/analysis`);
      if (!res.ok) throw new Error('No analysis found');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e: any) {
      setAnalysisError(e.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    async function fetchFixture() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/fixtures/${id}`);
        if (!res.ok) throw new Error('Failed to fetch fixture');
        const data = await res.json();
        setFixture(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFixture();
  }, [id]);

  useEffect(() => {
    if (simResult) fetchAnalysis();
    // eslint-disable-next-line
  }, [simResult]);

  const handleSimulate = async () => {
    setSimLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fixtures/${id}/simulate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to simulate match');
      const data = await res.json();
      setSimResult(data.result || data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!fixture) return <div>Fixture not found.</div>;

  return (
    <div>
      <h1>Match: {fixture.homeClub?.name} vs {fixture.awayClub?.name}</h1>
      <div>Date: {fixture.date ? new Date(fixture.date).toLocaleString() : '-'}</div>
      <div>Venue: {fixture.venue ?? '-'}</div>
      <div>Attendance: {typeof fixture.attendance === 'number' ? fixture.attendance : '-'}</div>
      <div style={{margin: '16px 0'}}>
        <button onClick={handleSimulate} disabled={simLoading || !!simResult}>
          {simLoading ? 'Simulating...' : simResult ? 'Match Simulated' : 'Simulate Match'}
        </button>
      </div>
      {simResult && (
        <div style={{margin: '16px 0'}}>
          <h2>Result</h2>
          <div><strong>{fixture.homeClub?.name}</strong> {simResult.homeGoals} - {simResult.awayGoals} <strong>{fixture.awayClub?.name}</strong></div>
          <div>Possession: {simResult.homePossession}% / {simResult.awayPossession}%</div>
          <div>Shots: {simResult.homeShots} / {simResult.awayShots}</div>
          <div>On Target: {simResult.homeShotsOnTarget} / {simResult.awayShotsOnTarget}</div>
          <div>Corners: {simResult.homeCorners} / {simResult.awayCorners}</div>
          <div>Fouls: {simResult.homeFouls} / {simResult.awayFouls}</div>
          <div>Yellow Cards: {simResult.homeYellowCards} / {simResult.awayYellowCards}</div>
          <div>Red Cards: {simResult.homeRedCards} / {simResult.awayRedCards}</div>
          <h3>Event Log</h3>
          <table>
            <thead>
              <tr>
                <th>Min</th>
                <th>Type</th>
                <th>Description</th>
                <th>Player</th>
                <th>Club</th>
              </tr>
            </thead>
            <tbody>
              {simResult.events.map((ev: any, idx: number) => (
                <tr key={idx}>
                  <td>{ev.minute}</td>
                  <td>{ev.type}</td>
                  <td>{ev.description}</td>
                  <td>{ev.playerName ?? '-'}</td>
                  <td>{ev.clubId ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Post-match analysis */}
          <div style={{marginTop: 24}}>
            <h3>Post-Match Analysis</h3>
            {analysisLoading && <div>Loading analysis...</div>}
            {analysisError && <div style={{color: 'red'}}>{analysisError}</div>}
            {analysis && (
              <div>
                <div><b>xG:</b> {fixture.homeClub?.name}: {analysis.xg.home.toFixed(2)} | {fixture.awayClub?.name}: {analysis.xg.away.toFixed(2)}</div>
                <div style={{margin: '8px 0'}}><b>Player Ratings:</b>
                  <ul>
                    {Object.entries(analysis.playerRatings).map(([pid, rating]: any) => (
                      <li key={pid}>Player {pid}: {rating.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
                <div><b>Heatmap:</b> <span style={{color: '#888'}}>(visualization coming soon)</span></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPage; 