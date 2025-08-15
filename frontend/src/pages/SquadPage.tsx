import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PlayerDetailModal from '../components/PlayerDetailModal';
import TransferOfferModal from '../components/TransferOfferModal';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

interface Player {
  id: number | string;
  name: string;
  position: string;
  age: number;
  skill?: number;
  potential?: number;
  wage?: number;
  contractExpiry?: string;
  morale?: number;
  injured?: boolean;
  onInternationalDuty?: boolean;
  nationality?: string;
  club?: string;
  value?: number;
  appearances?: number;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
}

const SquadPage: React.FC = () => {
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filter] = useState('all');
  const [sortBy] = useState('skill');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Offer Modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPlayer, setOfferPlayer] = useState<Player | null>(null);
  // Modal handlers
  const handleCloseOfferModal = () => setIsOfferModalOpen(false);
  const handleMakeOffer = (player: Player) => {
    setOfferPlayer(player);
    setIsOfferModalOpen(true);
  };


  useEffect(() => {
    if (!clubId) return;
    const fetchSquad = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/clubs/${clubId}/squad`);
        if (!res.ok) throw new Error('Failed to fetch squad');
        const data = (await res.json()) as { players?: Player[] } | Player[];
        setPlayers(Array.isArray(data) ? data : data.players || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch squad');
      } finally {
        setLoading(false);
      }
    };
    void fetchSquad();
  }, [clubId]);

  // Fetch available players when modal opens
  useEffect(() => {
    if (!clubId) return;
    const fetchSquad = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/clubs/${clubId}/squad`);
        if (!res.ok) throw new Error('Failed to fetch squad');
        const data = (await res.json()) as { players?: Player[] } | Player[];
        setPlayers(Array.isArray(data) ? data : data.players || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch squad');
      } finally {
        setLoading(false);
      }
    };
    void fetchSquad();
  }, [clubId]);

  const filteredAndSortedPlayers = players
    .filter((player: Player) => {
      if (filter === 'all') return true;
      if (filter === 'injured') return player.injured;
      if (filter === 'international') return player.onInternationalDuty;
      return player.position === filter;
    })
    .sort((a: Player, b: Player) => {
      const aValue = a[sortBy as keyof Player] ?? 0;
      const bValue = b[sortBy as keyof Player] ?? 0;
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });


  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
  };

  const handleOfferSubmitted = (_offerData: unknown) => {
    // TODO: Implement offer submission logic (API call, etc.)
    handleCloseOfferModal();
    alert('Offer submitted!');
  };

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading squad...</div>
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
            {/* ...header buttons... */}
          </div>
        </div>
        {/* Squad Table/List */}
        <div className="bg-white rounded-lg shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Age</th>
                <th className="px-3 py-2">Skill</th>
                <th className="px-3 py-2">Morale</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlayers.map(player => (
                <tr key={player.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => handlePlayerClick(player)}>
                  <td className="px-3 py-2 font-semibold">{player.name}</td>
                  <td className="px-3 py-2">{player.position}</td>
                  <td className="px-3 py-2">{player.age}</td>
                  <td className="px-3 py-2">{player.skill}</td>
                  <td className="px-3 py-2">{player.morale}</td>
                  <td className="px-3 py-2">
                    <button className="text-blue-600 underline" onClick={e => { e.stopPropagation(); handlePlayerClick(player); }}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Player Detail Modal */}
        {/*
          Ensure all required fields for PlayerDetailModal are present and not undefined.
          Provide sensible defaults for missing fields to avoid type errors.
        */}
        <PlayerDetailModal
          open={!!selectedPlayer}
          onClose={handleCloseModal}
          player={selectedPlayer ? {
            ...selectedPlayer,
            id: String(selectedPlayer.id),
            club: selectedPlayer.club ?? '',
            value: selectedPlayer.value ?? 0
          } : null}
          onMakeOffer={handleMakeOffer}
        />
        {/* Transfer Offer Modal */}
        <TransferOfferModal
          open={isOfferModalOpen}
          onClose={handleCloseOfferModal}
          player={offerPlayer ? {
            ...offerPlayer,
            id: String(offerPlayer.id),
            club: offerPlayer.club ?? '',
            value: offerPlayer.value ?? 0
          } : null}
          onSubmit={handleOfferSubmitted}
        />
      </div>
    </div>
  );
}

export default SquadPage;