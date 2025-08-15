import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
// If LanguageSelector is available, import it:
// import LanguageSelector from '../components/LanguageSelector';

interface SeasonHistory {
  season: string;
  league: string;
  position: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

const ClubHistoryPage: React.FC = () => {
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [history, setHistory] = useState<SeasonHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetchHistory();
  }, [clubId]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/club-history/${clubId}`);
      if (!res.ok) throw new Error('Failed to fetch club history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load club history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x">
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl p-8 text-lg font-semibold text-white border border-white/20">
        Loading club history...
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x">
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl p-8 text-lg font-semibold text-red-300 border border-white/20">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
      {/* Optionally, LanguageSelector at top right */}
      {/* <div className="absolute top-6 right-8 z-10"><LanguageSelector /></div> */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-6 py-8 w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Club History
          </h1>
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base rounded-xl overflow-hidden shadow-lg bg-white/5">
              <thead>
                <tr className="bg-white/10 text-indigo-100">
                  <th className="px-3 py-2 font-bold">Season</th>
                  <th className="px-3 py-2 font-bold">League</th>
                  <th className="px-3 py-2 font-bold">Position</th>
                  <th className="px-3 py-2 font-bold">Points</th>
                  <th className="px-3 py-2 font-bold">W</th>
                  <th className="px-3 py-2 font-bold">D</th>
                  <th className="px-3 py-2 font-bold">L</th>
                  <th className="px-3 py-2 font-bold">GF</th>
                  <th className="px-3 py-2 font-bold">GA</th>
                  <th className="px-3 py-2 font-bold">GD</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-indigo-900/30 transition-colors">
                    <td className="px-3 py-2 text-white/90">{row.season}</td>
                    <td className="px-3 py-2 text-white/90">{row.league}</td>
                    <td className="px-3 py-2 text-white/90">{row.position}</td>
                    <td className="px-3 py-2 text-white/90">{row.points}</td>
                    <td className="px-3 py-2 text-white/90">{row.won}</td>
                    <td className="px-3 py-2 text-white/90">{row.drawn}</td>
                    <td className="px-3 py-2 text-white/90">{row.lost}</td>
                    <td className="px-3 py-2 text-white/90">{row.goalsFor}</td>
                    <td className="px-3 py-2 text-white/90">{row.goalsAgainst}</td>
                    <td className="px-3 py-2 text-white/90">{row.goalDifference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-lg glow"
              onClick={() => window.history.back()}
              aria-label="Back to previous page"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
      {/* Google Fonts for Montserrat and Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
      {/* Optional: animated SVG or gradient overlays for extra polish */}
    </div>
  );
};

export default ClubHistoryPage; 