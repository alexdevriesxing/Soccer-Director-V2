import React, { useEffect, useState } from 'react';
// Optionally, import LanguageSelector if available
// import LanguageSelector from './LanguageSelector';

interface SeasonSummary {
  currentWeek: number;
  totalWeeks: number;
  remainingFixtures: any[];
  seasonStatus: string;
}

const SeasonProgressionPanel: React.FC = () => {
  const [summary, setSummary] = useState<SeasonSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/season/summary');
      if (!res.ok) throw new Error('Failed to fetch season summary');
      const data = await res.json();
      setSummary(data);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleAdvanceWeek = async () => {
    setSimLoading(true);
    setError(null);
    try {
      const res = await fetch('/season/advance-week', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to advance week');
      const data = await res.json();
      setSimResult(data);
      await fetchSummary();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSimLoading(false);
    }
  };

  const handleAdvanceToEnd = async () => {
    setSimLoading(true);
    setError(null);
    try {
      const res = await fetch('/season/advance-to-end', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to advance to end of season');
      const data = await res.json();
      setSimResult(data);
      await fetchSummary();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
      {/* Optionally, LanguageSelector at top right */}
      {/* <div className="absolute top-6 right-8 z-10"><LanguageSelector /></div> */}
      <div className="w-full max-w-xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-6 py-8 w-full">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Season Progression
          </h2>
          {loading ? (
            <div className="flex items-center justify-center text-lg text-white/80 py-8">Loading season summary...</div>
          ) : error ? (
            <div className="flex items-center justify-center text-lg text-red-300 py-8">{error}</div>
          ) : summary ? (
            <>
              <div className="mb-2 text-white/90">Current Week: <b>{summary.currentWeek}</b> / {summary.totalWeeks}</div>
              <div className="mb-2 text-white/90">Season Status: <b>{summary.seasonStatus === 'finished' ? 'Finished' : 'In Progress'}</b></div>
              <div className="mb-4 text-white/90">Remaining Fixtures: <b>{summary.remainingFixtures.length}</b></div>
              <div className="flex gap-4 mb-4 justify-center">
                <button
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-lg glow"
                  onClick={handleAdvanceWeek}
                  disabled={simLoading || summary.seasonStatus === 'finished'}
                >
                  Advance Week
                </button>
                <button
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all text-lg glow"
                  onClick={handleAdvanceToEnd}
                  disabled={simLoading || summary.seasonStatus === 'finished'}
                >
                  Advance to End of Season
                </button>
              </div>
              {simLoading && <div className="text-white/80 text-center py-2">Simulating...</div>}
              {simResult && (
                <div className="bg-white/10 rounded-xl border border-white/10 shadow p-4 mt-2 text-white/90">
                  <div className="font-semibold mb-1 text-indigo-100">Simulation Result:</div>
                  <pre className="text-xs whitespace-pre-wrap text-white/80">{JSON.stringify(simResult, null, 2)}</pre>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
      {/* Google Fonts for Montserrat and Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
    </div>
  );
};

export default SeasonProgressionPanel; 