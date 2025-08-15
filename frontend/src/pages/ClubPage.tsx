import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

interface ClubInfo {
  id: number;
  name: string;
  league: string;
  position: number;
  morale: number;
  form: string;
  homeCity: string;
  boardExpectation: string;
  stadium: string;
}

const ClubPage: React.FC = () => {
  const navigate = useNavigate();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();

  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    const fetchClubInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/clubs/${clubId}`);
        if (!res.ok) throw new Error('Failed to fetch club info');
        const data = await res.json();
        setClubInfo(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load club information');
      } finally {
        setLoading(false);
      }
    };
    fetchClubInfo();
  }, [clubId]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading club information...</div>
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

  if (!clubInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">No club information available</div>
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
              <h1 className="text-3xl font-bold text-gray-900">{clubInfo.name}</h1>
              <p className="text-gray-600">{clubInfo.league} • Position: {clubInfo.position}</p>
              {clubInfo.homeCity && (
                <p className="text-sm text-gray-500">Home City: {clubInfo.homeCity}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{clubInfo.form}</div>
              <div className="text-sm text-gray-500">Recent Form</div>
            </div>
          </div>
        </div>

        {/* Club Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Club Morale</h3>
            <div className="text-3xl font-bold text-green-600">{clubInfo.morale}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">League Position</h3>
            <div className="text-3xl font-bold text-blue-600">{clubInfo.position}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Board Expectation</h3>
            <div className="text-lg font-medium text-purple-600">{clubInfo.boardExpectation}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stadium</h3>
            <div className="text-lg font-medium text-orange-600">{clubInfo.stadium || 'Unknown'}</div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Club Management</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/squad')}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">Squad</div>
              <div className="text-sm opacity-90">Manage players</div>
            </button>
            
            <button
              onClick={() => navigate('/transfers')}
              className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Transfers</div>
              <div className="text-sm opacity-90">Buy & sell players</div>
            </button>
            
            <button
              onClick={() => navigate('/finances')}
              className="p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">💵</div>
              <div className="font-semibold">Finances</div>
              <div className="text-sm opacity-90">Manage budget</div>
            </button>
            
            <button
              onClick={() => navigate('/facilities')}
              className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">🏟️</div>
              <div className="font-semibold">Facilities</div>
              <div className="text-sm opacity-90">Upgrade facilities</div>
            </button>
            
            <button
              onClick={() => navigate('/youth-academy')}
              className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎓</div>
              <div className="font-semibold">Youth Academy</div>
              <div className="text-sm opacity-90">Develop young talent</div>
            </button>
            
            <button
              onClick={() => navigate('/o21-management')}
              className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">⚽</div>
              <div className="font-semibold">O21 Team</div>
              <div className="text-sm opacity-90">Reserve team</div>
            </button>
            
            <button
              onClick={() => navigate('/stadium')}
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">🏟️</div>
              <div className="font-semibold">Stadium</div>
              <div className="text-sm opacity-90">Manage stadium</div>
            </button>
            
            <button
              onClick={() => navigate('/compliance')}
              className="p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Compliance</div>
              <div className="text-sm opacity-90">Regulatory status</div>
            </button>

            <button
              onClick={() => navigate('/tactics')}
              className="p-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">Tactics</div>
              <div className="text-sm opacity-90">Formations & Set Pieces</div>
            </button>
          </div>
        </div>

        {/* Club Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Club Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Club Name:</span>
                  <span className="font-medium">{clubInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">League:</span>
                  <span className="font-medium">{clubInfo.league}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{clubInfo.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Home City:</span>
                  <span className="font-medium">{clubInfo.homeCity || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stadium:</span>
                  <span className="font-medium">{clubInfo.stadium || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Club Morale:</span>
                  <span className="font-medium">{clubInfo.morale}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Form:</span>
                  <span className="font-medium">{clubInfo.form}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Board Expectation:</span>
                  <span className="font-medium">{clubInfo.boardExpectation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubPage; 