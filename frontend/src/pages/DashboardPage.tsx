import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface DashboardData {
  currentWeek: number;
  clubInfo: {
    name: string;
    league: string;
    position: number;
    morale: number;
    form: string;
  };
  recentResults: Array<{
    id: number;
    homeClub: string;
    awayClub: string;
    homeGoals: number;
    awayGoals: number;
    date: string;
  }>;
  upcomingFixtures: Array<{
    id: number;
    homeClub: string;
    awayClub: string;
    date: string;
  }>;
  boardExpectation: string;
  boardConfidence: number;
  transferWindow: string;
  injuries: Array<{
    playerName: string;
    type: string;
    returnDate: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useManagerProfile();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetchDashboardData(clubId);
  }, [clubId]);

  if (!profile) return null;
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  const fetchDashboardData = async (clubId: number) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch game state
      const gameStateRes = await fetch('/api/game-state');
      const gameStateData = await gameStateRes.json();
      // Fetch current club info
      const clubRes = await fetch(`/api/clubs/${clubId}`);
      const clubData = await clubRes.json();
      // Fetch recent fixtures
      const fixturesRes = await fetch(`/api/fixtures?clubId=${clubId}&limit=5`);
      const fixturesData = await fixturesRes.json();
      // Fetch upcoming fixtures
      const upcomingRes = await fetch(`/api/fixtures?clubId=${clubId}&upcoming=true&limit=3`);
      const upcomingData = await upcomingRes.json();
      // Fetch injuries
      const injuriesRes = await fetch(`/api/players?clubId=${clubId}&injured=true`);
      const injuriesData = await injuriesRes.json();
      
      const dashboard: DashboardData = {
        currentWeek: gameStateData.currentWeek || 1,
        clubInfo: {
          name: clubData.name || 'Unknown Club',
          league: clubData.league?.name || 'Unknown League',
          position: 5, // This should be calculated from league table
          morale: clubData.morale || 70,
          form: clubData.form || 'WDLWW'
        },
        recentResults: Array.isArray(fixturesData)
          ? fixturesData.filter((f: any) => f.result).map((f: any) => ({
              id: f.id,
              homeClub: f.homeClub?.name || 'Unknown',
              awayClub: f.awayClub?.name || 'Unknown',
              homeGoals: f.result?.homeGoals || 0,
              awayGoals: f.result?.awayGoals || 0,
              date: f.date
            }))
          : [],
        upcomingFixtures: Array.isArray(upcomingData)
          ? upcomingData.map((f: any) => ({
              id: f.id,
              homeClub: f.homeClub?.name || 'Unknown',
              awayClub: f.awayClub?.name || 'Unknown',
              date: f.date
            }))
          : [],
        boardExpectation: 'Reach playoffs',
        boardConfidence: 75,
        transferWindow: gameStateData.transferWindow === 'open' ? 'Open' : 'Closed',
        injuries: Array.isArray(injuriesData)
          ? injuriesData.map((p: any) => ({
              playerName: p.name,
              type: 'Unknown',
              returnDate: 'Unknown'
            }))
          : []
      };
      
      setDashboardData(dashboard);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">No dashboard data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dashboardData.clubInfo.name}</h1>
              <p className="text-gray-600">{dashboardData.clubInfo.league} • Position: {dashboardData.clubInfo.position}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">Week {dashboardData.currentWeek}</div>
              <div className="text-sm text-gray-500">Transfer Window: {dashboardData.transferWindow}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Club Morale</h3>
            <div className="text-3xl font-bold text-green-600">{dashboardData.clubInfo.morale}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Form</h3>
            <div className="text-3xl font-bold text-blue-600">{dashboardData.clubInfo.form}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Board Confidence</h3>
            <div className="text-3xl font-bold text-purple-600">{dashboardData.boardConfidence}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Injuries</h3>
            <div className="text-3xl font-bold text-red-600">{dashboardData.injuries.length}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Results */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Results</h2>
            {dashboardData.recentResults.length === 0 ? (
              <p className="text-gray-500">No recent results</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentResults.map((result) => (
                  <div key={result.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{result.homeClub} vs {result.awayClub}</div>
                      <div className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xl font-bold">
                      {result.homeGoals} - {result.awayGoals}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/squad')}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Squad
              </button>
              <button
                onClick={() => navigate('/transfers')}
                className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Transfer Market
              </button>
              <button
                onClick={() => navigate('/fixtures')}
                className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                View Fixtures
              </button>
              <button
                onClick={() => navigate('/finances')}
                className="w-full p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Finances
              </button>
              <button
                onClick={() => navigate('/youth-academy')}
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Youth Academy
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Fixtures */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Fixtures</h2>
          {dashboardData.upcomingFixtures.length === 0 ? (
            <p className="text-gray-500">No upcoming fixtures</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.upcomingFixtures.map((fixture) => (
                <div key={fixture.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{fixture.homeClub} vs {fixture.awayClub}</div>
                    <div className="text-sm text-gray-500">{new Date(fixture.date).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/matches/${fixture.id}`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Prepare
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Board Expectations */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Board Expectations</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">{dashboardData.boardExpectation}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dashboardData.boardConfidence}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Confidence: {dashboardData.boardConfidence}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 