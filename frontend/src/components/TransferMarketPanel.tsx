import React, { useEffect, useState } from 'react';
import { getTransferMarketPlayers } from '../api/footballApi';
import TransferOfferModal from './TransferOfferModal';
import PlayerDetailModal from './PlayerDetailModal';
import { createTransferOffer, getTransferOffersForClub } from '../api/transferApi';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  club: string;
  value: number;
}

interface Offer {
  id: number;
  playerId: number;
  fee: number;
  status: string;
}

const positions = ['All', 'GK', 'RB', 'CB', 'LB', 'CM', 'RW', 'LW', 'ST'];

const TransferMarketPanel: React.FC = () => {
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [players, setPlayers] = useState<Player[]>([]);
  const [position, setPosition] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (position !== 'All') params.position = position;
        // Add more filters as needed
        const res = await getTransferMarketPlayers(params);
        setPlayers(res.players || []);
      } catch (err: any) {
        setError('Failed to load transfer market.');
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, [position]);

  useEffect(() => {
    if (typeof clubId !== 'number') {
      setOffers([]);
      return;
    }
    async function fetchOffers() {
      setOffersLoading(true);
      try {
        if (typeof clubId !== 'number') {
          setOffers([]);
          return;
        }
        const res = await getTransferOffersForClub(clubId);
        setOffers(res);
      } catch (err) {
        setOffers([]);
      } finally {
        setOffersLoading(false);
      }
    }
    fetchOffers();
  }, [clubId]);

  const filteredPlayers = players.filter(p =>
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase()))
  );

  const handleMakeOffer = (player: Player) => {
    setSelectedPlayer(player);
    setOfferModalOpen(true);
  };

  const handleShowDetails = (player: Player) => {
    setDetailPlayer(player);
    setDetailModalOpen(true);
  };

  const handleMakeOfferFromDetail = (player: Player) => {
    setDetailModalOpen(false);
    setDetailPlayer(null);
    setSelectedPlayer(player);
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = async ({ amount }: { amount: number }) => {
    if (!selectedPlayer || typeof clubId !== 'number') return;
    try {
      // TODO: Replace toClubId with the actual selling club's ID if available
      const toClubId = 2; // Placeholder
      await createTransferOffer({
        playerId: Number(selectedPlayer.id),
        fromClubId: clubId,
        toClubId,
        initiator: 'user',
        fee: amount,
        clauses: [],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      });
      setFeedback(`Offer for ${selectedPlayer.name} submitted!`);
      // Refresh offers
      if (typeof clubId === 'number') {
        const res = await getTransferOffersForClub(clubId);
        setOffers(res);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Failed to submit offer.');
    }
  };

  if (clubIdLoading) return <div style={{ color: '#4ade80', textAlign: 'center', padding: 32 }}>Loading your club...</div>;
  if (!clubId) return <div style={{ color: '#f87171', textAlign: 'center', padding: 32 }}>Club not found. Please create or load a profile.</div>;

  return (
    <div style={{ background: 'rgba(30,41,59,0.92)', borderRadius: 16, padding: 24, maxWidth: 900, margin: '40px auto', boxShadow: '0 8px 32px #22d3ee44', color: '#fff' }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: 2 }}>Transfer Market</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <select value={position} onChange={e => setPosition(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
          {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search by name or club..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 8, flex: 1 }}
        />
      </div>
      {feedback && <div style={{ textAlign: 'center', color: '#4ade80', marginBottom: 12 }}>{feedback}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#4ade80' }}>Loading transfer market...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#f87171' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(17,24,39,0.95)', borderRadius: 12, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#22d3ee22' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 10 }}>Age</th>
              <th style={{ padding: 10 }}>Position</th>
              <th style={{ padding: 10 }}>Club</th>
              <th style={{ padding: 10 }}>Value (€)</th>
              <th style={{ padding: 10 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>No players found.</td></tr>
            ) : filteredPlayers.map(player => (
              <tr key={player.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: 10 }}>
                  <span style={{ color: '#22d3ee', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleShowDetails(player)}>
                    {player.name}
                  </span>
                </td>
                <td style={{ padding: 10, textAlign: 'center' }}>{player.age}</td>
                <td style={{ padding: 10, textAlign: 'center' }}>{player.position}</td>
                <td style={{ padding: 10 }}>{player.club}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{player.value.toLocaleString()}</td>
                <td style={{ padding: 10 }}>
                  <button style={{ background: 'linear-gradient(90deg,#22d3ee,#4ade80)', color: '#111827', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #22d3ee44' }}
                    onClick={() => handleMakeOffer(player)}
                  >
                    Make Offer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <TransferOfferModal
        open={offerModalOpen}
        onClose={() => { setOfferModalOpen(false); setSelectedPlayer(null); }}
        player={selectedPlayer}
        onSubmit={handleSubmitOffer}
      />
      <PlayerDetailModal
        open={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setDetailPlayer(null); }}
        player={detailPlayer}
        onMakeOffer={handleMakeOfferFromDetail}
      />
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Your Transfer Offers</h3>
        {offersLoading ? (
          <div style={{ color: '#4ade80', padding: 16 }}>Loading offers...</div>
        ) : offers.length === 0 ? (
          <div style={{ color: '#94a3b8', padding: 16 }}>No offers made yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(17,24,39,0.85)', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: '#22d3ee22' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Player</th>
                <th style={{ padding: 8 }}>Amount (€)</th>
                <th style={{ padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => {
                const player = players.find(p => Number(p.id) === offer.playerId);
                return (
                  <tr key={offer.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: 8 }}>{player ? player.name : offer.playerId}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{offer.fee.toLocaleString()}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{offer.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransferMarketPanel; 