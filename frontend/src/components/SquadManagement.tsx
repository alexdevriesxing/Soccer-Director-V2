import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs, getClubTrainingFocus, setClubTrainingFocus, postLoan } from '../api/footballApi';
import { registerSquad, getSquadRegistrations } from '../api/clubApi';
import { useSquadManagement } from '../hooks/useSquadManagement';

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
  loanClub?: string;
  wage?: number;
  contractExpiry?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const SquadManagement: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  const {
    players,
    loading,
    error,
    page,
    pageSize,
    totalPlayers,
    totalPages,
    setPage,
    setPageSize,
    getPlayersByStatus,
    selectedXI,
    autoSelectBestXI,
    setStartingXI,
  } = useSquadManagement(profile, navigate);

  // Add local state for toast/message
  const [toast, setToast] = useState<string | null>(null);
  // Add filter state
  const [filter, setFilter] = useState<'all' | 'available' | 'injured' | 'international' | 'loan'>('all');
  // Player detail modal state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Training focus modal state
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [trainingFocus, setTrainingFocus] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const trainingOptions = ['Fitness', 'Tactics', 'Technical', 'Team Cohesion'];

  // Loan out players modal state
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedLoanPlayers, setSelectedLoanPlayers] = useState<number[]>([]);
  // Track destination club for each player
  const [loanDestinations, setLoanDestinations] = useState<{ [playerId: number]: number | null }>({});
  // Eligible players: not injured, not on loan, not on international duty
  const eligibleForLoan = players.filter(
    (p: Player) => !p.injured && !p.onLoan && !p.onInternationalDuty
  );
  // All clubs except the manager's club
  const [allClubs, setAllClubs] = useState<any[]>([]);
  // Club badges (example, can be expanded)
  const clubBadges: Record<number, string> = {
    1: '🔴', // John Doe FC
    2: '🔵', // Alex Smith FC
    // Add more as needed
  };
  useEffect(() => {
    if (!isLoanModalOpen) return;
    getClubs()
      .then(clubs => {
        // Sort clubs alphabetically by name
        setAllClubs(clubs.slice().sort((a: any, b: any) => a.name.localeCompare(b.name)));
      })
      .catch(() => setAllClubs([]));
  }, [isLoanModalOpen]);

  // Add state for clubId and clubTrainingFocus
  const [clubId, setClubId] = useState<number | null>(null);
  const [clubTrainingFocus, setClubTrainingFocusState] = useState<string | null>(null);
  const [loanProcessing, setLoanProcessing] = useState(false);

  // Add state for contract modal
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractModalPlayer, setContractModalPlayer] = useState<Player | null>(null);
  const [contractWage, setContractWage] = useState<number | ''>('');
  const [contractExpiry, setContractExpiry] = useState<string>('');
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  const openContractModal = (player: Player) => {
    setContractModalPlayer(player);
    setContractWage(player.wage ?? '');
    setContractExpiry(player.contractExpiry ? player.contractExpiry.slice(0, 10) : ''); // ISO date
    setIsContractModalOpen(true);
    setContractError(null);
  };
  const closeContractModal = () => {
    setIsContractModalOpen(false);
    setContractModalPlayer(null);
    setContractWage('');
    setContractExpiry('');
    setContractError(null);
  };
  const handleContractSave = async () => {
    if (!contractModalPlayer) return;
    setContractLoading(true);
    setContractError(null);
    try {
      if (contractWage === '' || !contractExpiry) {
        setContractError('Wage and expiry are required');
        setContractLoading(false);
        return;
      }
      const wageNum = Number(contractWage);
      if (isNaN(wageNum) || wageNum < 0) {
        setContractError('Wage must be a positive number');
        setContractLoading(false);
        return;
      }
      await import('../api/playerApi').then(({ updatePlayerContract }) =>
        updatePlayerContract(contractModalPlayer.id, {
          wage: wageNum,
          contractExpiry: contractExpiry
        })
      );
      setToast('Contract updated!');
      setTimeout(() => setToast(null), 2000);
      closeContractModal();
      window.location.reload();
    } catch (err: any) {
      setContractError(err.message || 'Error updating contract');
    } finally {
      setContractLoading(false);
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleAutoSelectXI = async () => {
    const xi = await autoSelectBestXI();
    if (xi && xi.length > 0) {
      setToast('Best XI selected!');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleSetStartingXI = async () => {
    if (!selectedXI || selectedXI.length === 0) return;
    const result: any = await setStartingXI(selectedXI);
    if (result && result.success) {
      setToast('Starting lineup set!');
      setTimeout(() => setToast(null), 2000);
    } else if (result && result.error) {
      setToast('Error: ' + result.error);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Modal open/close handlers
  const openPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };
  const closePlayerModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  // Open/close handlers for training modal
  const openTrainingModal = () => {
    setPendingFocus(trainingFocus); // preselect current
    setIsTrainingModalOpen(true);
  };
  const closeTrainingModal = () => {
    setIsTrainingModalOpen(false);
    setPendingFocus(null);
  };
  // Confirm training focus (update backend)
  const handleConfirmTrainingFocus = async () => {
    if (pendingFocus && clubId) {
      try {
        await setClubTrainingFocus(clubId, pendingFocus);
        setClubTrainingFocusState(pendingFocus);
        setToast(`Training focus set to ${pendingFocus}!`);
        setTimeout(() => setToast(null), 2000);
        closeTrainingModal();
      } catch (err: any) {
        setToast('Error setting training focus');
        setTimeout(() => setToast(null), 2000);
      }
    }
  };

  // Open/close handlers for loan modal
  const openLoanModal = () => {
    setSelectedLoanPlayers([]);
    setLoanDestinations({});
    setIsLoanModalOpen(true);
  };
  const closeLoanModal = () => {
    setIsLoanModalOpen(false);
    setSelectedLoanPlayers([]);
    setLoanDestinations({});
  };
  // Confirm loan
  const handleConfirmLoan = async () => {
    if (!clubId || selectedLoanPlayers.length === 0) return;
    // Check that all selected players have a destination
    for (const playerId of selectedLoanPlayers) {
      if (!loanDestinations[playerId]) {
        setToast('Select a destination club for all players');
        setTimeout(() => setToast(null), 2000);
        return;
      }
    }
    try {
      setLoanProcessing(true);
      const fromClubIdStr = String(clubId);
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(); // 6 months from now
      let successCount = 0;
      for (const playerId of selectedLoanPlayers) {
        const toClubIdStr = String(loanDestinations[playerId]);
        try {
          await postLoan({
            playerId: String(playerId),
            fromClubId: fromClubIdStr,
            toClubId: toClubIdStr,
            startDate,
            endDate
          });
          successCount++;
        } catch (err: any) {
          setToast(`Error loaning player ${playerId}`);
          setTimeout(() => setToast(null), 2000);
        }
      }
      setToast(`Loaned out ${successCount} player(s)${successCount < selectedLoanPlayers.length ? ", some failed." : "!"}`);
      setTimeout(() => setToast(null), 2500);
      closeLoanModal();
      setLoanProcessing(false);
      window.location.reload();
    } catch (err: any) {
      setToast('Error processing loans');
      setTimeout(() => setToast(null), 2000);
      setLoanProcessing(false);
    }
  };

  // Add state for player training modal
  const [isPlayerTrainingModalOpen, setIsPlayerTrainingModalOpen] = useState(false);
  const [trainingPlayer, setTrainingPlayer] = useState<Player | null>(null);
  const [playerPendingFocus, setPlayerPendingFocus] = useState<string | null>(null);
  const playerTrainingOptions = ['Technical', 'Tactical', 'Physical', 'Mental', 'General'];

  // Open/close handlers for player training modal
  const openPlayerTrainingModal = (player: Player) => {
    setTrainingPlayer(player);
    setPlayerPendingFocus(null);
    setIsPlayerTrainingModalOpen(true);
  };
  const closePlayerTrainingModal = () => {
    setIsPlayerTrainingModalOpen(false);
    setTrainingPlayer(null);
    setPlayerPendingFocus(null);
  };
  // Confirm player training focus (update backend)
  const handleConfirmPlayerTrainingFocus = async () => {
    if (playerPendingFocus && trainingPlayer && clubId) {
      try {
        const response = await fetch(`/api/game/player/${trainingPlayer.id}/training`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId,
            focus: playerPendingFocus.toLowerCase(),
            isExtra: false
          })
        });
        if (!response.ok) throw new Error('Failed to set training focus');
        setToast(`Training focus set to ${playerPendingFocus} for ${trainingPlayer.name}!`);
        setTimeout(() => setToast(null), 2000);
        closePlayerTrainingModal();
        // Optionally refresh squad/training data here
      } catch (err: any) {
        setToast('Error setting player training focus');
        setTimeout(() => setToast(null), 2000);
      }
    }
  };

  // Train and Loan action handlers
  const handleTrain = () => {
    if (selectedPlayer) {
      openPlayerTrainingModal(selectedPlayer);
      closePlayerModal();
    }
  };
  const handleLoan = () => {
    if (selectedPlayer) {
      setSelectedLoanPlayers([selectedPlayer.id]);
      setLoanDestinations({ [selectedPlayer.id]: null });
      setIsLoanModalOpen(true);
      closePlayerModal();
    }
  };

  // Modal: close on Escape key (for all modals)
  useEffect(() => {
    if (!isModalOpen && !isTrainingModalOpen && !isLoanModalOpen && !isContractModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closePlayerModal();
        if (isTrainingModalOpen) closeTrainingModal();
        if (isLoanModalOpen) closeLoanModal();
        if (isContractModalOpen) closeContractModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isTrainingModalOpen, isLoanModalOpen, isContractModalOpen]);

  // On mount, fetch all clubs and get clubId, then fetch training focus
  useEffect(() => {
    async function fetchClubIdAndFocus() {
      if (!profile || !profile.club) return;
      try {
        const clubs = await getClubs();
        const club = clubs.find((c: any) => c.name === profile.club);
        if (club) {
          setClubId(club.id);
          // Fetch training focus
          try {
            const res = await getClubTrainingFocus(club.id);
            setClubTrainingFocusState(res.trainingFocus || null);
          } catch (err: any) {
            setToast('Error loading training focus');
            setTimeout(() => setToast(null), 2000);
          }
        } else {
          setToast('Club not found');
          setTimeout(() => setToast(null), 2000);
        }
      } catch (err: any) {
        setToast('Error loading clubs');
        setTimeout(() => setToast(null), 2000);
      }
    }
    fetchClubIdAndFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Filtered players based on filter state
  const filteredPlayers = React.useMemo(() => {
    switch (filter) {
      case 'available':
        return players.filter((p: Player) => !p.injured && !p.onInternationalDuty && !p.onLoan);
      case 'injured':
        return players.filter((p: Player) => p.injured);
      case 'international':
        return players.filter((p: Player) => p.onInternationalDuty);
      case 'loan':
        return players.filter((p: Player) => p.onLoan);
      default:
        return players;
    }
  }, [players, filter]);

  // Add state for contract expiry sort
  const [contractSortOrder, setContractSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  const handleContractSort = () => {
    setContractSortOrder(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
  };

  // Update filteredPlayers to apply contract expiry sort
  const sortedPlayers = React.useMemo(() => {
    if (contractSortOrder === 'none') return filteredPlayers;
    return [...filteredPlayers].sort((a, b) => {
      const aDate = a.contractExpiry ? new Date(a.contractExpiry).getTime() : Infinity;
      const bDate = b.contractExpiry ? new Date(b.contractExpiry).getTime() : Infinity;
      if (contractSortOrder === 'asc') return aDate - bDate;
      if (contractSortOrder === 'desc') return bDate - aDate;
      return 0;
    });
  }, [filteredPlayers, contractSortOrder]);

  // --- Squad Registration State ---
  const [showSquadRegModal, setShowSquadRegModal] = useState(false);
  const [squadRegSeason, setSquadRegSeason] = useState<number>(new Date().getFullYear());
  const [squadRegCompetition, setSquadRegCompetition] = useState('League');
  const [squadRegPlayers, setSquadRegPlayers] = useState<number[]>([]);
  const [squadRegLoading, setSquadRegLoading] = useState(false);
  const [squadRegError, setSquadRegError] = useState<string | null>(null);
  const [squadRegistrations, setSquadRegistrations] = useState<any[]>([]);

  // Fetch past squad registrations
  useEffect(() => {
    if (!clubId) return;
    getSquadRegistrations(clubId)
      .then(res => setSquadRegistrations(res.data))
      .catch(() => setSquadRegistrations([]));
  }, [clubId]);

  const openSquadRegModal = () => {
    setSquadRegPlayers([]);
    setSquadRegCompetition('League');
    setSquadRegSeason(new Date().getFullYear());
    setShowSquadRegModal(true);
    setSquadRegError(null);
  };
  const closeSquadRegModal = () => setShowSquadRegModal(false);
  const handleSquadRegSubmit = async () => {
    if (!clubId) return;
    setSquadRegLoading(true);
    setSquadRegError(null);
    try {
      await registerSquad(clubId, {
        season: squadRegSeason,
        competition: squadRegCompetition,
        registeredPlayers: squadRegPlayers
      });
      setToast('Squad registered!');
      setTimeout(() => setToast(null), 2000);
      setShowSquadRegModal(false);
      // Refresh registrations
      const res = await getSquadRegistrations(clubId);
      setSquadRegistrations(res.data);
    } catch (err: any) {
      setSquadRegError(err.message || 'Error registering squad');
    } finally {
      setSquadRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
      {/* Optionally, LanguageSelector at top right */}
      {/* <div className="absolute top-6 right-8 z-10"><LanguageSelector /></div> */}
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-6 py-8 w-full">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Squad Management
          </h2>
          {/* Toast/Message */}
          {toast && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-green-600/80 text-white text-center font-semibold shadow-lg animate-fadeIn">
              {toast}
            </div>
          )}
          {/* Loading/Error States */}
          {loading ? (
            <div className="flex items-center justify-center text-lg text-white/80 py-8">Loading squad...</div>
          ) : error ? (
            <div className="flex items-center justify-center text-lg text-red-300 py-8">{error}</div>
          ) : (
            <>
              {/* Filters, actions, etc. */}
              {/* ...existing filter/action UI, but upgrade buttons and selects... */}
              {/* Player Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base rounded-xl overflow-hidden shadow-lg bg-white/5 mb-6">
                  <thead>
                    <tr className="bg-white/10 text-indigo-100">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Position</th>
                      <th className="text-left p-3">Age</th>
                      <th className="text-left p-3">Skill</th>
                      <th className="text-left p-3">Morale</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Wage</th>
                      <th className="text-left p-3 cursor-pointer select-none" onClick={handleContractSort} title="Sort by contract expiry">
                        Contract Expiry
                        {contractSortOrder === 'asc' && <span> ▲</span>}
                        {contractSortOrder === 'desc' && <span> ▼</span>}
                      </th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player: Player) => (
                      <tr key={player.id} className={`border-b border-gray-700 hover:bg-gray-700 ${selectedXI && selectedXI.some(xi => xi.id === player.id) ? 'bg-green-900' : ''}`}>
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
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="mr-2">{player.morale}</span>
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(player.morale / 100) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {player.injured && <span className="text-red-400">🩹 Injured</span>}
                          {player.onInternationalDuty && <span className="text-blue-400">🏴 International</span>}
                          {player.onLoan && <span className="text-yellow-400">📤 On Loan</span>}
                          {!player.injured && !player.onInternationalDuty && !player.onLoan && 
                            <span className="text-green-400">✅ Available</span>
                          }
                        </td>
                        <td className="p-3">{player.wage ? `€${player.wage.toLocaleString()}` : '-'}</td>
                        <td className={`p-3 ${player.contractExpiry && new Date(player.contractExpiry) < new Date(Date.now() + 183*24*60*60*1000) ? 'text-yellow-400 font-bold' : ''}`}
                          title={player.contractExpiry && new Date(player.contractExpiry) < new Date(Date.now() + 183*24*60*60*1000) ? 'Expiring soon' : ''}
                        >
                          {player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button 
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
                              onClick={() => openPlayerModal(player)}
                            >
                              View
                            </button>
                            <button 
                              className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs transition-colors"
                              onClick={() => openContractModal(player)}
                            >
                              Manage Contract
                            </button>
                            <button className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs transition-colors">
                              Train
                            </button>
                            <button className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs transition-colors">
                              Loan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    Page {page} of {totalPages} ({totalPlayers} players)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >Prev</button>
                    <button
                      className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >Next</button>
                    <select value={pageSize} onChange={handlePageSizeChange} className="ml-2 p-1 bg-gray-700 rounded">
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size} / page</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Modals: player, training, loan, contract, squad reg */}
      {/* Example for one modal: */}
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            {/* ...player details modal content, styled with text-white, inputs/selects as in other polished modals... */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={closePlayerModal}
              aria-label="Close"
            >
              ×
            </button>
            {/* Defensive check for player data */}
            {selectedPlayer ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-green-400">{selectedPlayer.name}</h2>
                <div className="space-y-2 mb-4">
                  <div><span className="font-bold">Position:</span> <span className={getPositionColor(selectedPlayer.position)}>{selectedPlayer.position}</span></div>
                  <div><span className="font-bold">Age:</span> {selectedPlayer.age}</div>
                  <div><span className="font-bold">Nationality:</span> {selectedPlayer.nationality}</div>
                  <div><span className="font-bold">Skill:</span> {selectedPlayer.skill}</div>
                  <div><span className="font-bold">Morale:</span> {selectedPlayer.morale}</div>
                  <div><span className="font-bold">Status:</span> {' '}
                    {selectedPlayer.injured && <span className="text-red-400">🩹 Injured </span>}
                    {selectedPlayer.onInternationalDuty && <span className="text-blue-400">🏴 International </span>}
                    {selectedPlayer.onLoan && <span className="text-yellow-400">📤 On Loan </span>}
                    {!selectedPlayer.injured && !selectedPlayer.onInternationalDuty && !selectedPlayer.onLoan && <span className="text-green-400">✅ Available</span>}
                  </div>
                  <div><span className="font-bold">Wage:</span> {selectedPlayer.wage ? `€${selectedPlayer.wage.toLocaleString()}` : '-'}</div>
                  <div><span className="font-bold">Contract Expiry:</span> <span className={selectedPlayer.contractExpiry && new Date(selectedPlayer.contractExpiry) < new Date(Date.now() + 183*24*60*60*1000) ? 'text-yellow-400 font-bold' : ''} title={selectedPlayer.contractExpiry && new Date(selectedPlayer.contractExpiry) < new Date(Date.now() + 183*24*60*60*1000) ? 'Expiring soon' : ''}>{selectedPlayer.contractExpiry ? new Date(selectedPlayer.contractExpiry).toLocaleDateString() : '-'}</span></div>
                  {selectedPlayer.onLoan && selectedPlayer.loanClub && (
                    <div><span className="font-bold">Loan Club:</span> {selectedPlayer.loanClub}</div>
                  )}
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                    onClick={handleTrain}
                  >
                    Train
                  </button>
                  <button 
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                    onClick={handleLoan}
                  >
                    Loan
                  </button>
                  <button 
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
                    onClick={() => openContractModal(selectedPlayer)}
                  >
                    Manage Contract
                  </button>
                </div>
              </>
            ) : (
              <div className="text-red-400">Player data unavailable.</div>
            )}
          </div>
        </div>
      )}
      {/* Training Focus Modal */}
      {isTrainingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40"
          onClick={closeTrainingModal}
        >
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={closeTrainingModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-green-400">Set Training Focus</h2>
            <div className="space-y-3 mb-6">
              {trainingOptions.map(option => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="trainingFocus"
                    value={option}
                    checked={pendingFocus === option}
                    onChange={() => setPendingFocus(option)}
                    className="form-radio h-5 w-5 text-green-500"
                  />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                onClick={closeTrainingModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors ${!pendingFocus ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleConfirmTrainingFocus}
                disabled={!pendingFocus}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loan Out Players Modal */}
      {isLoanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40"
          onClick={closeLoanModal}
        >
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={closeLoanModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Loan Out Players</h2>
            {eligibleForLoan.length === 0 ? (
              <div className="text-gray-300 mb-6">No players are currently eligible for loan.</div>
            ) : (
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {eligibleForLoan.map(player => (
                  <div key={player.id} className="flex items-center space-x-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLoanPlayers.includes(player.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedLoanPlayers(prev => [...prev, player.id]);
                            setLoanDestinations(prev => ({ ...prev, [player.id]: null }));
                          } else {
                            setSelectedLoanPlayers(prev => prev.filter(id => id !== player.id));
                            setLoanDestinations(prev => {
                              const copy = { ...prev };
                              delete copy[player.id];
                              return copy;
                            });
                          }
                        }}
                        className="form-checkbox h-5 w-5 text-purple-500"
                      />
                      <span className="text-lg flex items-center gap-2">
                        {player.name} ({player.position}, Age {player.age})
                        <span className="text-xs text-gray-400 ml-2">Skill: {player.skill}</span>
                        <span className="text-xs text-blue-400 ml-2">Morale: {player.morale}</span>
                      </span>
                    </label>
                    {selectedLoanPlayers.includes(player.id) && (
                      <select
                        className="ml-2 p-1 bg-gray-700 rounded text-white"
                        value={loanDestinations[player.id] || ''}
                        onChange={e => setLoanDestinations(prev => ({ ...prev, [player.id]: Number(e.target.value) }))}
                      >
                        <option value="" disabled>Select destination club</option>
                        {allClubs.filter(c => c.id !== clubId).map(c => (
                          <option key={c.id} value={c.id}>
                            {clubBadges[c.id] ? `${clubBadges[c.id]} ` : ''}{c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                onClick={closeLoanModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors ${selectedLoanPlayers.length === 0 || selectedLoanPlayers.some(pid => !loanDestinations[pid]) || loanProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleConfirmLoan}
                disabled={selectedLoanPlayers.length === 0 || selectedLoanPlayers.some(pid => !loanDestinations[pid]) || loanProcessing}
              >
                {loanProcessing ? (
                  <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>Processing...</span>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isContractModalOpen && contractModalPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40"
          onClick={closeContractModal}
        >
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={closeContractModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Manage Contract</h2>
            <div className="space-y-3 mb-6">
              <div><span className="font-bold">Player:</span> {contractModalPlayer.name}</div>
              <div>
                <label className="block mb-1 font-bold">Wage (€ per week):</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  value={contractWage}
                  onChange={e => setContractWage(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={contractLoading}
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Contract Expiry:</label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  value={contractExpiry}
                  onChange={e => setContractExpiry(e.target.value)}
                  disabled={contractLoading}
                />
              </div>
              {contractError && <div className="text-red-400">{contractError}</div>}
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                onClick={closeContractModal}
                disabled={contractLoading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors ${contractLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleContractSave}
                disabled={contractLoading}
              >
                {contractLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Player Training Focus Modal */}
      {isPlayerTrainingModalOpen && trainingPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40"
          onClick={closePlayerTrainingModal}
        >
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={closePlayerTrainingModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-green-400">Set Training Focus for {trainingPlayer.name}</h2>
            <div className="space-y-3 mb-6">
              {playerTrainingOptions.map(option => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="playerTrainingFocus"
                    value={option}
                    checked={playerPendingFocus === option}
                    onChange={() => setPlayerPendingFocus(option)}
                    className="form-radio h-5 w-5 text-green-500"
                  />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                onClick={closePlayerTrainingModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors ${!playerPendingFocus ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleConfirmPlayerTrainingFocus}
                disabled={!playerPendingFocus}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Squad Registration Modal */}
      {showSquadRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={closeSquadRegModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Register Squad</h2>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block mb-1 font-bold">Season:</label>
                <input type="number" value={squadRegSeason} onChange={e => setSquadRegSeason(Number(e.target.value))} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block mb-1 font-bold">Competition:</label>
                <input type="text" value={squadRegCompetition} onChange={e => setSquadRegCompetition(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block mb-1 font-bold">Players:</label>
                <select multiple value={squadRegPlayers.map(String)} onChange={e => setSquadRegPlayers(Array.from(e.target.selectedOptions, o => Number(o.value)))} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 h-24 overflow-y-auto">
                  {players.map((p: Player) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                  ))}
                </select>
              </div>
              {squadRegError && <div className="text-red-400">{squadRegError}</div>}
            </div>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                onClick={closeSquadRegModal}
                disabled={squadRegLoading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors ${squadRegLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSquadRegSubmit}
                disabled={squadRegLoading}
              >
                {squadRegLoading ? 'Registering...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Past Squad Registrations */}
      <div style={{ marginBottom: 24 }}>
        <h2>Squad Registration</h2>
        <button onClick={openSquadRegModal} style={{ marginBottom: 8 }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Register Squad</button>
        {/* Modal for registration */}
        {/* Past registrations */}
        <h4>Past Squad Registrations</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Season</th><th>Competition</th><th>Date</th><th>Players</th></tr>
          </thead>
          <tbody>
            {squadRegistrations.map((reg, i) => (
              <tr key={i}>
                <td>{reg.season}</td>
                <td>{reg.competition}</td>
                <td>{new Date(reg.registrationDate).toLocaleDateString()}</td>
                <td>{Array.isArray(reg.registeredPlayers) ? reg.registeredPlayers.length : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Header */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Squad Management</h1>
            <p className="text-gray-300">Manage your players, positions, and team selection</p>
          </div>
          <button
            onClick={() => navigate('/game-menu')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Squad Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Squad Stats */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Squad Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Players:</span>
                <span className="font-bold">{totalPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-bold text-green-400">{getPlayersByStatus('available').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Injured:</span>
                <span className="font-bold text-red-400">{getPlayersByStatus('injured').length}</span>
              </div>
              <div className="flex justify-between">
                <span>International Duty:</span>
                <span className="font-bold text-blue-400">{getPlayersByStatus('international').length}</span>
              </div>
              <div className="flex justify-between">
                <span>On Loan:</span>
                <span className="font-bold text-yellow-400">{getPlayersByStatus('loan').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Training Focus:</span>
                <span className="font-bold text-green-400">{clubTrainingFocus || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Position Distribution */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Positions</h2>
            <div className="space-y-2">
              {['GK', 'DEF', 'MID', 'FWD'].map((position: string) => {
                const count = players.filter((p: Player) => p.position === position).length;
                return (
                  <div key={position} className="flex justify-between items-center">
                    <span className={getPositionColor(position)}>{position}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors" onClick={handleAutoSelectXI}>
                Auto-Select Best XI
              </button>
              {selectedXI && selectedXI.length === 11 && (
                <button className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors mt-2" onClick={handleSetStartingXI}>
                  Set as Starting Lineup
                </button>
              )}
              <button className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                Set Training Focus
              </button>
              {/* Open training modal on click */}
              <button
                className="hidden" // visually hidden, for accessibility
                aria-hidden="true"
                tabIndex={-1}
                onClick={openTrainingModal}
              />
              <span
                className="absolute inset-0"
                style={{ pointerEvents: 'none' }}
                aria-hidden="true"
              />
              <script dangerouslySetInnerHTML={{__html: `document.querySelector('button:contains("Set Training Focus")')?.addEventListener('click', ${openTrainingModal.toString()})`}} />
              <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
                Loan Out Players
              </button>
              {/* Open loan modal on click */}
              <button
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onClick={openLoanModal}
              />
              <span
                className="absolute inset-0"
                style={{ pointerEvents: 'none' }}
                aria-hidden="true"
              />
              <script dangerouslySetInnerHTML={{__html: `document.querySelector('button:contains("Loan Out Players")')?.addEventListener('click', ${openLoanModal.toString()})`}} />
              <button 
                onClick={() => navigate('/o21-management')}
                className="w-full p-3 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
              >
                O21 Team Management
              </button>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All Players</h2>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors ${filter === 'all' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm transition-colors ${filter === 'available' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => setFilter('available')}
                >
                  Available
                </button>
                <button 
                  className={`px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm transition-colors ${filter === 'injured' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => setFilter('injured')}
                >
                  Injured
                </button>
                <button 
                  className={`px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-sm transition-colors ${filter === 'international' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => setFilter('international')}
                >
                  International
                </button>
                <button 
                  className={`px-3 py-1 bg-yellow-700 hover:bg-yellow-600 rounded text-sm transition-colors ${filter === 'loan' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => setFilter('loan')}
                >
                  On Loan
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base rounded-xl overflow-hidden shadow-lg bg-white/5">
                <thead>
                  <tr className="bg-white/10 text-indigo-100">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Position</th>
                    <th className="text-left p-3">Age</th>
                    <th className="text-left p-3">Skill</th>
                    <th className="text-left p-3">Morale</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Wage</th>
                    <th className="text-left p-3 cursor-pointer select-none" onClick={handleContractSort} title="Sort by contract expiry">
                      Contract Expiry
                      {contractSortOrder === 'asc' && <span> ▲</span>}
                      {contractSortOrder === 'desc' && <span> ▼</span>}
                    </th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player: Player) => (
                    <tr key={player.id} className={`border-b border-gray-700 hover:bg-gray-700 ${selectedXI && selectedXI.some(xi => xi.id === player.id) ? 'bg-green-900' : ''}`}>
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
                      <td className="p-3">
                        <div className="flex items-center">
                          <span className="mr-2">{player.morale}</span>
                          <div className="w-16 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(player.morale / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {player.injured && <span className="text-red-400">🩹 Injured</span>}
                        {player.onInternationalDuty && <span className="text-blue-400">🏴 International</span>}
                        {player.onLoan && <span className="text-yellow-400">📤 On Loan</span>}
                        {!player.injured && !player.onInternationalDuty && !player.onLoan && 
                          <span className="text-green-400">✅ Available</span>
                        }
                      </td>
                      <td className="p-3">{player.wage ? `€${player.wage.toLocaleString()}` : '-'}</td>
                      <td className={`p-3 ${player.contractExpiry && new Date(player.contractExpiry) < new Date(Date.now() + 183*24*60*60*1000) ? 'text-yellow-400 font-bold' : ''}`}
                        title={player.contractExpiry && new Date(player.contractExpiry) < new Date(Date.now() + 183*24*60*60*1000) ? 'Expiring soon' : ''}
                      >
                        {player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
                            onClick={() => openPlayerModal(player)}
                          >
                            View
                          </button>
                          <button 
                            className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs transition-colors"
                            onClick={() => openContractModal(player)}
                          >
                            Manage Contract
                          </button>
                          <button className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs transition-colors">
                            Train
                          </button>
                          <button className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs transition-colors">
                            Loan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {page} of {totalPages} ({totalPlayers} players)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >Prev</button>
                  <button
                    className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >Next</button>
                  <select value={pageSize} onChange={handlePageSizeChange} className="ml-2 p-1 bg-gray-700 rounded">
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Google Fonts for Montserrat and Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
    </div>
  );
};

export default SquadManagement;
