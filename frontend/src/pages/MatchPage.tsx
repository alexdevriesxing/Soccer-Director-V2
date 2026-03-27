import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LiveMatchViewer from '../components/LiveMatchViewer';

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
  const [viewMode, setViewMode] = useState<'overview' | 'live' | 'analysis'>('overview');

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

  const startLiveMatch = async () => {
    try {
      await fetch(`/api/match-management/${id}/start`, { method: 'POST' });
      setViewMode('live');
    } catch (e) {
      console.error(e);
      alert('Failed to start live match');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!fixture) return <div>Fixture not found.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{fixture.homeClub?.name} vs {fixture.awayClub?.name}</h1>

      {/* Match Header Info */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
        <div>Date: {fixture.date ? new Date(fixture.date).toLocaleString() : '-'}</div>
        <div>Venue: {fixture.venue ?? '-'}</div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setViewMode('overview')}
          style={{ fontWeight: viewMode === 'overview' ? 'bold' : 'normal' }}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('live')}
          style={{ fontWeight: viewMode === 'live' ? 'bold' : 'normal' }}
        >
          Live Match View
        </button>
        <button
          onClick={() => setViewMode('analysis')}
          disabled={!simResult && !analysis}
          style={{ fontWeight: viewMode === 'analysis' ? 'bold' : 'normal' }}
        >
          Post-Match Analysis
        </button>
      </div>

      {/* Content Area */}
      {viewMode === 'live' ? (
        <LiveMatchViewer fixtureId={Number(id)} />
      ) : viewMode === 'analysis' ? (
        <div style={{ marginTop: 24 }}>
          <h3>Post-Match Analysis</h3>
          {/* Analysis content reused from original */}
          {analysisLoading && <div>Loading analysis...</div>}
          {analysisError && <div style={{ color: 'red' }}>{analysisError}</div>}
          {analysis && (
            <div>
              <div><b>xG:</b> {fixture.homeClub?.name}: {analysis.xg.home.toFixed(2)} | {fixture.awayClub?.name}: {analysis.xg.away.toFixed(2)}</div>
              {/* Other analysis details */}
            </div>
          )}
        </div>
      ) : (
        /* Overview Mode (Default) */
        <div>
          <div style={{ margin: '16px 0', display: 'flex', gap: '10px' }}>
            <button onClick={handleSimulate} disabled={simLoading || !!simResult}>
              {simLoading ? 'Simulating...' : simResult ? 'View Result' : 'Instant Simulate'}
            </button>
            <button
              onClick={startLiveMatch}
              style={{ backgroundColor: '#4CAF50', color: 'white' }}
            >
              Start Live Match
            </button>
          </div>

          {/* Result Display if available */}
          {simResult && (
            <div style={{ margin: '16px 0' }}>
              <h2>Result</h2>
              <div><strong>{fixture.homeClub?.name}</strong> {simResult.homeGoals} - {simResult.awayGoals} <strong>{fixture.awayClub?.name}</strong></div>
              {/* Stats table */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchPage;