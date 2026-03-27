import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

interface O21Player {
  id: number;
  name: string;
  position: string;
  age: number;
  skill: number;
  potential: number;
  wage: number;
  contractExpiry: string;
  morale: number;
  injured: boolean;
  nationality: string;
  developmentPath: string;
  academyLevel: number;
  lastTrainingDate: string;
  improvementRate: number;
}

interface O21Team {
  id: number;
  name: string;
  league: string;
  position: number;
  morale: number;
  form: string;
}

const O21ManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [players, setPlayers] = useState<O21Player[]>([]);
  const [teamInfo, setTeamInfo] = useState<O21Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<O21Player | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('skill');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [promotionModal, setPromotionModal] = useState(false);
  const [releaseModal, setReleaseModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchO21Data = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch O21 team info
      const teamRes = await fetch(`/api/jong-team/${clubId}`);
      const teamData = await teamRes.json();
      setTeamInfo(teamData);
      // Fetch O21 players
      const playersRes = await fetch(`/api/jong-team/${clubId}/players`);
      const playersData = await playersRes.json();
      setPlayers(Array.isArray(playersData.players)
        ? playersData.players
        : Array.isArray(playersData)
          ? playersData
          : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load O21 team data');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (!clubId) return;
    fetchO21Data();
  }, [clubId, fetchO21Data]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  const filteredAndSortedPlayers = players
    .filter(player => {
      if (filter === 'all') return true;
      if (filter === 'injured') return player.injured;
      if (filter === 'ready') return player.skill >= 65 && player.age >= 18;
      return player.position === filter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof O21Player];
      let bValue: any = b[sortBy as keyof O21Player];
      
      if (sortBy === 'wage') {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'GK': 'bg-yellow-100 text-yellow-800',
      'DEF': 'bg-blue-100 text-blue-800',
      'MID': 'bg-green-100 text-green-800',
      'FWD': 'bg-red-100 text-red-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 80) return 'text-green-600';
    if (skill >= 70) return 'text-blue-600';
    if (skill >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePromotePlayer = async (playerId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jong-team/promote/${playerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Failed to promote player');
      
      setPromotionModal(false);
      setSelectedPlayer(null);
      await fetchO21Data(); // Refresh data
    } catch (e: any) {
      setError(e.message || 'Failed to promote player');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleasePlayer = async (playerId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jong-team/release/${playerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Failed to release player');
      
      setReleaseModal(false);
      setSelectedPlayer(null);
      await fetchO21Data(); // Refresh data
    } catch (e: any) {
      setError(e.message || 'Failed to release player');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlayerClick = (player: O21Player) => {
    setSelectedPlayer(player);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
    setPromotionModal(false);
    setReleaseModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading O21 team...</div>
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">O21 Team Management</h1>
              <p className="text-gray-600">Manage your reserve team and youth development</p>
              {teamInfo && (
                <p className="text-sm text-gray-500 mt-1">
                  {teamInfo.name} • {teamInfo.league} • Position: {teamInfo.position}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/youth-academy')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Youth Academy
              </button>
              <button
                onClick={() => navigate('/squad')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                First Team
              </button>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        {teamInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Morale</h3>
              <div className="text-3xl font-bold text-green-600">{teamInfo.morale}%</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Form</h3>
              <div className="text-3xl font-bold text-blue-600">{teamInfo.form}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Squad Size</h3>
              <div className="text-3xl font-bold text-purple-600">{players.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Promotion</h3>
              <div className="text-3xl font-bold text-orange-600">
                {players.filter(p => p.skill >= 65 && p.age >= 18).length}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Players</option>
                <option value="GK">Goalkeepers</option>
                <option value="DEF">Defenders</option>
                <option value="MID">Midfielders</option>
                <option value="FWD">Forwards</option>
                <option value="injured">Injured</option>
                <option value="ready">Ready for Promotion</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="skill">Skill</option>
                <option value="age">Age</option>
                <option value="potential">Potential</option>
                <option value="improvementRate">Development Rate</option>
                <option value="name">Name</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredAndSortedPlayers.length} players
            </div>
          </div>
        </div>

        {/* Squad Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Potential
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Development
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academy Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedPlayers.map((player) => (
                  <tr 
                    key={player.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.nationality}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getSkillColor(player.skill)}`}>
                        {player.skill}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getSkillColor(player.potential)}`}>
                        {player.potential}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(player.improvementRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Level {player.academyLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {player.injured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Injured
                          </span>
                        )}
                        {player.skill >= 65 && player.age >= 18 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Ready
                          </span>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          player.morale >= 70 ? 'bg-green-100 text-green-800' :
                          player.morale >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {player.morale}% morale
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Details Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{selectedPlayer.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{selectedPlayer.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skill:</span>
                  <span className={`font-medium ${getSkillColor(selectedPlayer.skill)}`}>
                    {selectedPlayer.skill}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential:</span>
                  <span className={`font-medium ${getSkillColor(selectedPlayer.potential)}`}>
                    {selectedPlayer.potential}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Development Rate:</span>
                  <span className="font-medium">{(selectedPlayer.improvementRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Academy Level:</span>
                  <span className="font-medium">{selectedPlayer.academyLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Morale:</span>
                  <span className="font-medium">{selectedPlayer.morale}%</span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                {selectedPlayer.skill >= 65 && selectedPlayer.age >= 18 && (
                  <button
                    onClick={() => setPromotionModal(true)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Promoting...' : 'Promote to First Team'}
                  </button>
                )}
                <button
                  onClick={() => setReleaseModal(true)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Releasing...' : 'Release Player'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promotion Confirmation Modal */}
        {promotionModal && selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Confirm Promotion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to promote {selectedPlayer.name} to the first team?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePromotePlayer(selectedPlayer.id)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Promoting...' : 'Yes, Promote'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Release Confirmation Modal */}
        {releaseModal && selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Confirm Release</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to release {selectedPlayer.name}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReleasePlayer(selectedPlayer.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Releasing...' : 'Yes, Release'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default O21ManagementPage; 
