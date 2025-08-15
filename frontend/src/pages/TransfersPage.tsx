import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransferOfferModal from '../components/TransferOfferModal';

interface TransferMarketPlayer {
  id: number;
  name: string;
  position: string;
  age: number;
  skill: number;
  potential: number;
  wage: number;
  contractExpiry: string;
  nationality: string;
  club: string;
  value: number;
}

interface Transfer {
  id: number;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: number;
  date: string;
  status: string;
}

const TransfersPage: React.FC = () => {
  const navigate = useNavigate();

  const [marketPlayers, setMarketPlayers] = useState<TransferMarketPlayer[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<TransferMarketPlayer | null>(null);
  // Transfer Offer Modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPlayer, setOfferPlayer] = useState<TransferMarketPlayer | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('skill');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [transferWindow, setTransferWindow] = useState('Open');

  useEffect(() => {
    fetchTransferData();
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    try {
      const res = await fetch('/api/game-state');
      const data = await res.json();
      setTransferWindow(data.transferWindow === 'open' ? 'Open' : 'Closed');
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Failed to fetch game state:', e.message);
      } else {
        console.error('Failed to fetch game state:', e);
      }
    }
  };

  const fetchTransferData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transfer market players
      const marketRes = await fetch('/api/transfer-market');
      const marketData = await marketRes.json();
      setMarketPlayers(marketData.players || marketData || []);
      
      // Fetch transfer history
      const transfersRes = await fetch('/api/transfers');
      const transfersData = await transfersRes.json();
      setTransfers(transfersData.transfers || transfersData || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || 'Failed to load transfer data');
      } else {
        setError('Failed to load transfer data');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPlayers = marketPlayers
    .filter(player => {
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter === 'all') return true;
      return player.position === filter;
    })
    .sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof TransferMarketPlayer];
      let bValue: unknown = b[sortBy as keyof TransferMarketPlayer];
      
      if (sortBy === 'wage' || sortBy === 'value') {
        aValue = typeof aValue === 'string' || typeof aValue === 'number' ? Number(aValue) : 0;
        bValue = typeof bValue === 'string' || typeof bValue === 'number' ? Number(bValue) : 0;
      }
      
      if (sortOrder === 'asc') {
        return (aValue as number) > (bValue as number) ? 1 : -1;
      } else {
        return (aValue as number) < (bValue as number) ? 1 : -1;
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

  const handlePlayerClick = (player: TransferMarketPlayer) => {
    setSelectedPlayer(player);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
  };

  const handleMakeBid = (playerId: number) => {
    // Navigate to transfer negotiation page
    navigate(`/transfer-market/${playerId}`);
  };

  const handleMakeOffer = (player: TransferMarketPlayer) => {
    setOfferPlayer(player);
    setIsOfferModalOpen(true);
  };

  const handleCloseOfferModal = () => {
    setIsOfferModalOpen(false);
    setOfferPlayer(null);
  };

  const handleOfferSubmitted = (_offerData: unknown) => {
    // TODO: Implement offer submission logic (API call, etc.)
    handleCloseOfferModal();
    alert('Offer submitted!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading transfer market...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Transfer Market</h1>
              <p className="text-gray-600">Browse available players and manage transfers</p>
            </div>
            <div className="flex gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Transfer Window</div>
                <div className={`text-lg font-bold ${transferWindow === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                  {transferWindow}
                </div>
              </div>
              <button
                onClick={() => navigate('/squad')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Squad
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Players</h3>
            <div className="text-3xl font-bold text-blue-600">{marketPlayers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Transfers</h3>
            <div className="text-3xl font-bold text-green-600">{transfers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Value</h3>
            <div className="text-3xl font-bold text-purple-600">
              €{(marketPlayers.reduce((sum, p) => sum + p.value, 0) / Math.max(marketPlayers.length, 1)).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Skill</h3>
            <div className="text-3xl font-bold text-orange-600">
              {marketPlayers.length > 0 ? Math.max(...marketPlayers.map(p => p.skill)) : 0}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-3 py-2 w-64"
              />
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DEF">Defenders</option>
                <option value="MID">Midfielders</option>
                <option value="FWD">Forwards</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="skill">Skill</option>
                <option value="age">Age</option>
                <option value="value">Value</option>
                <option value="wage">Wage</option>
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
              {filteredAndSortedPlayers.length} players found
            </div>
          </div>
        </div>

        {/* Transfer Market Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
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
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
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
                      €{player.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{player.wage.toLocaleString()}/week
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.club}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeBid(player.id);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Make Bid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transfers</h2>
          {transfers.length === 0 ? (
            <p className="text-gray-500">No recent transfers</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transfers.slice(0, 10).map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.playerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.fromClub}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.toClub}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">€{transfer.fee.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(transfer.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => navigate(`/transfers/${transfer.id}`)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                          title="View Details"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  
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
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">{selectedPlayer.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wage:</span>
                  <span className="font-medium">{selectedPlayer.wage.toLocaleString()}/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Club:</span>
                  <span className="font-medium">{selectedPlayer.club}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract Expires:</span>
                  <span className="font-medium">{new Date(selectedPlayer.contractExpiry).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleMakeBid(selectedPlayer.id);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Make Bid
                </button>
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleMakeOffer(selectedPlayer);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Make Offer
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Transfer Offer Modal */}
        <TransferOfferModal
          open={isOfferModalOpen}
          onClose={handleCloseOfferModal}
          player={offerPlayer ? {
            id: String(offerPlayer.id),
            name: offerPlayer.name,
            club: offerPlayer.club ?? '',
            value: offerPlayer.value ?? 0,
          } : null}
          onSubmit={handleOfferSubmitted}
        />
      </div>
    </div>
  );
};

export default TransfersPage; 