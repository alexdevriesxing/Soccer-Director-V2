import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';
import { useO21TeamManagement } from '../hooks/useO21TeamManagement';

interface Player {
  id: number;
  name: string;
  position: string;
  skill: number;
  age: number;
  nationality: string;
  morale: number;
  injured: boolean;
  onInternationalDuty: boolean;
  onLoan: boolean;
  wage: number;
  contractExpiry: string;
}

interface O21Team {
  id: number;
  name: string;
  parentClub?: {
    id: number;
    name: string;
  };
  players: Player[];
}

interface ContractDetails {
  wage: number;
  contractExpiry: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const O21TeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  const {
    o21Team,
    parentClubPlayers,
    loading,
    activeTab,
    setActiveTab,
    selectedPlayer,
    setSelectedPlayer,
    showContractModal,
    setShowContractModal,
    contractDetails,
    setContractDetails,
    clubId,
    o21Page,
    setO21Page,
    o21PageSize,
    setO21PageSize,
    o21TotalPlayers,
    o21TotalPages,
    parentPage,
    setParentPage,
    parentPageSize,
    setParentPageSize,
    parentTotalPlayers,
    parentTotalPages,
    loadO21Team,
    loadParentClubPlayers
  } = useO21TeamManagement(profile, navigate) as {
    o21Team: O21Team | null;
    parentClubPlayers: Player[];
    loading: boolean;
    activeTab: 'squad' | 'promote' | 'demote' | 'contracts';
    setActiveTab: any;
    selectedPlayer: Player | null;
    setSelectedPlayer: any;
    showContractModal: boolean;
    setShowContractModal: any;
    contractDetails: ContractDetails;
    setContractDetails: any;
    clubId: number | null;
    o21Page: number;
    setO21Page: any;
    o21PageSize: number;
    setO21PageSize: any;
    o21TotalPlayers: number;
    o21TotalPages: number;
    parentPage: number;
    setParentPage: any;
    parentPageSize: number;
    setParentPageSize: any;
    parentTotalPlayers: number;
    parentTotalPages: number;
    loadO21Team: any;
    loadParentClubPlayers: any;
  };

  useEffect(() => {
    if (!profile) {
      navigate('/title-screen');
      return;
    }

    async function fetchClubId() {
      if (!profile) return;
      const clubs = await getClubs();
      const club = clubs.find((c: any) => c.name === profile.club);
      // setClubId(club ? club.id : null); // This is now managed by useO21TeamManagement
    }
    fetchClubId();

    // loadO21Team(); // This is now managed by useO21TeamManagement
    // loadParentClubPlayers(); // This is now managed by useO21TeamManagement
  }, [profile, navigate]);

  // const loadO21Team = async () => { // This is now managed by useO21TeamManagement
  //   if (!clubId) return;
  //   setLoadingO21(true);
  //   setErrorO21(null);
  //   try {
  //     const response = await fetch(`http://localhost:4000/api/o21/team/${clubId}?page=${o21Page}&limit=${o21PageSize}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setO21Team(data.team);
  //       setO21TotalPlayers(data.totalPlayers || 0);
  //       setO21TotalPages(data.totalPages || 1);
  //     } else {
  //       setErrorO21('Failed to load O21 team');
  //     }
  //   } catch (error) {
  //     setErrorO21('Error loading O21 team');
  //   } finally {
  //     setLoadingO21(false);
  //   }
  // };

  // const loadParentClubPlayers = async () => { // This is now managed by useO21TeamManagement
  //   if (!clubId) return;
  //   setLoadingParent(true);
  //   setErrorParent(null);
  //   try {
  //     const response = await fetch(`http://localhost:4000/api/players/club/${clubId}?page=${parentPage}&limit=${parentPageSize}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setParentClubPlayers(data.players || []);
  //       setParentTotalPlayers(data.totalPlayers || 0);
  //       setParentTotalPages(data.totalPages || 1);
  //     }
  //   } catch (error) {
  //     setErrorParent('Error loading parent club players');
  //   } finally {
  //     setLoadingParent(false);
  //   }
  // };

  // useEffect(() => { // This is now managed by useO21TeamManagement
  //   loadO21Team();
  // }, [clubId, o21Page, o21PageSize]);

  // useEffect(() => { // This is now managed by useO21TeamManagement
  //   loadParentClubPlayers();
  // }, [clubId, parentPage, parentPageSize]);

  const promotePlayer = async (playerId: number) => {
    if (!clubId) return;
    try {
      const base = process.env.REACT_APP_API_BASE || '';
      const response = await fetch(`${base}/api/o21/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          parentClubId: clubId
        }),
      });

      if (response.ok) {
        await loadO21Team();
        await loadParentClubPlayers();
        alert('Player promoted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error promoting player:', error);
      alert('Failed to promote player');
    }
  };

  const demotePlayer = async (playerId: number) => {
    if (!clubId) return;
    try {
      const base = process.env.REACT_APP_API_BASE || '';
      const response = await fetch(`${base}/api/o21/demote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          parentClubId: clubId
        }),
      });

      if (response.ok) {
        await loadO21Team();
        await loadParentClubPlayers();
        alert('Player demoted to O21 team successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error demoting player:', error);
      alert('Failed to demote player');
    }
  };

  const offerContract = async () => {
    if (!selectedPlayer) return;
    if (!clubId) return;

    try {
      const base = process.env.REACT_APP_API_BASE || '';
      const response = await fetch(`${base}/api/o21/offer-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          parentClubId: clubId,
          contractDetails
        }),
      });

      if (response.ok) {
        setShowContractModal(false);
        setSelectedPlayer(null);
        await loadParentClubPlayers();
        alert('Contract offered successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error offering contract:', error);
      alert('Failed to offer contract');
    }
  };

  const releasePlayer = async (playerId: number) => {
    // TODO: Replace with custom modal
    if (!window.confirm('Are you sure you want to release this player to free agency?')) {
      return;
    }
    if (!clubId) return;

    try {
      const base = process.env.REACT_APP_API_BASE || '';
      const response = await fetch(`${base}/api/o21/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          parentClubId: clubId
        }),
      });

      if (response.ok) {
        await loadParentClubPlayers();
        alert('Player released to free agency');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error releasing player:', error);
      alert('Failed to release player');
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'text-blue-400';
      case 'DEF': return 'text-green-400';
      case 'MID': return 'text-yellow-400';
      case 'FWD': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getEligibleForPromotion = (players: Player[]) => {
    return players.filter(p => p.age <= 21);
  };

  const getEligibleForDemotion = (players: Player[]) => {
    return players.filter(p => p.age <= 21);
  };

  const getPromotedPlayers = (players: Player[]) => {
    return players.filter(p => p.age === 22);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg p-8 mt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">Loading O21 Team...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
      </div>
    );
  }

  if (!o21Team) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg p-8 mt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">No O21 Team Found</h2>
          <p className="text-gray-300 mb-6">This club doesn't have an O21 team.</p>
          <button
            onClick={() => navigate('/game-menu')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">O21 Team Management</h1>
              <p className="text-gray-300">
                {o21Team.name}{o21Team.parentClub ? ` - ${o21Team.parentClub.name}` : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('squad')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'squad' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              O21 Squad ({o21Team.players.length}/30)
            </button>
            <button
              onClick={() => setActiveTab('promote')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'promote' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Promote to First Team
            </button>
            <button
              onClick={() => setActiveTab('demote')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'demote' ? 'bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Demote to O21
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'contracts' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Contract Management
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          {activeTab === 'squad' && (
            <div>
              <h2 className="text-xl font-bold mb-4">O21 Squad</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Position</th>
                      <th className="text-left p-3">Age</th>
                      <th className="text-left p-3">Skill</th>
                      <th className="text-left p-3">Morale</th>
                      <th className="text-left p-3">Wage</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o21Team.players.map((player) => (
                      <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3 font-medium">{player.name}</td>
                        <td className={`p-3 ${getPositionColor(player.position)}`}>{player.position}</td>
                        <td className="p-3">{player.age}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="mr-2">{player.skill}</span>
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(player.skill / 100) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{player.morale}</td>
                        <td className="p-3">€{player.wage.toLocaleString()}</td>
                        <td className="p-3">
                          {player.age <= 21 && (
                            <button
                              onClick={() => promotePlayer(player.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                            >
                              Promote
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {o21Page} of {o21TotalPages} ({o21TotalPlayers} players)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setO21Page(o21Page - 1)}
                    disabled={o21Page === 1}
                  >Prev</button>
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setO21Page(o21Page + 1)}
                    disabled={o21Page === o21TotalPages}
                  >Next</button>
                  <select value={o21PageSize} onChange={e => { setO21PageSize(Number(e.target.value)); setO21Page(1); }} className="ml-2 p-1 bg-gray-700 rounded">
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promote' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Promote Players to First Team</h2>
              <p className="text-gray-300 mb-4">Select players from the O21 team to promote to the first team squad.</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Position</th>
                      <th className="text-left p-3">Age</th>
                      <th className="text-left p-3">Skill</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getEligibleForPromotion(o21Team.players).map((player) => (
                      <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3 font-medium">{player.name}</td>
                        <td className={`p-3 ${getPositionColor(player.position)}`}>{player.position}</td>
                        <td className="p-3">{player.age}</td>
                        <td className="p-3">{player.skill}</td>
                        <td className="p-3">
                          <button
                            onClick={() => promotePlayer(player.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                          >
                            Promote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {parentPage} of {parentTotalPages} ({parentTotalPlayers} players)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setParentPage(parentPage - 1)}
                    disabled={parentPage === 1}
                  >Prev</button>
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setParentPage(parentPage + 1)}
                    disabled={parentPage === parentTotalPages}
                  >Next</button>
                  <select value={parentPageSize} onChange={e => { setParentPageSize(Number(e.target.value)); setParentPage(1); }} className="ml-2 p-1 bg-gray-700 rounded">
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demote' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Demote Players to O21 Team</h2>
              <p className="text-gray-300 mb-4">Select players from the first team to demote to the O21 team (max 21 years old).</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Position</th>
                      <th className="text-left p-3">Age</th>
                      <th className="text-left p-3">Skill</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getEligibleForDemotion(parentClubPlayers).map((player) => (
                      <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3 font-medium">{player.name}</td>
                        <td className={`p-3 ${getPositionColor(player.position)}`}>{player.position}</td>
                        <td className="p-3">{player.age}</td>
                        <td className="p-3">{player.skill}</td>
                        <td className="p-3">
                          <button
                            onClick={() => demotePlayer(player.id)}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm transition-colors"
                          >
                            Demote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {parentPage} of {parentTotalPages} ({parentTotalPlayers} players)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setParentPage(parentPage - 1)}
                    disabled={parentPage === 1}
                  >Prev</button>
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setParentPage(parentPage + 1)}
                    disabled={parentPage === parentTotalPages}
                  >Next</button>
                  <select value={parentPageSize} onChange={e => { setParentPageSize(Number(e.target.value)); setParentPage(1); }} className="ml-2 p-1 bg-gray-700 rounded">
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Contract Management</h2>
              <p className="text-gray-300 mb-4">Manage contracts for players who turned 22 and were promoted from O21 team.</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Position</th>
                      <th className="text-left p-3">Age</th>
                      <th className="text-left p-3">Skill</th>
                      <th className="text-left p-3">Current Wage</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPromotedPlayers(parentClubPlayers).map((player: Player) => (
                      <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3 font-medium">{player.name}</td>
                        <td className={`p-3 ${getPositionColor(player.position)}`}>{player.position}</td>
                        <td className="p-3">{player.age}</td>
                        <td className="p-3">{player.skill}</td>
                        <td className="p-3">€{player.wage.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPlayer(player);
                                setContractDetails({
                                  wage: player.wage,
                                  contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                });
                                setShowContractModal(true);
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
                            >
                              Offer Contract
                            </button>
                            <button
                              onClick={() => releasePlayer(player.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                            >
                              Release
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {parentPage} of {parentTotalPages} ({parentTotalPlayers} players)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setParentPage(parentPage - 1)}
                    disabled={parentPage === 1}
                  >Prev</button>
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => setParentPage(parentPage + 1)}
                    disabled={parentPage === parentTotalPages}
                  >Next</button>
                  <select value={parentPageSize} onChange={e => { setParentPageSize(Number(e.target.value)); setParentPage(1); }} className="ml-2 p-1 bg-gray-700 rounded">
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Modal */}
      {showContractModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Offer Contract to {selectedPlayer.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Wage (€)</label>
                <input
                  type="number"
                  value={contractDetails.wage}
                  onChange={(e) => setContractDetails({...contractDetails, wage: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contract Expiry</label>
                <input
                  type="date"
                  value={contractDetails.contractExpiry}
                  onChange={(e) => setContractDetails({...contractDetails, contractExpiry: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={offerContract}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors"
                >
                  Offer Contract
                </button>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default O21TeamManagement; 