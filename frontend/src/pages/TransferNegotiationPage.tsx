import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransferMarketPlayer } from '../api/footballApi';
import TransferNegotiationModal from '../components/TransferNegotiationModal';
import { TransferMarketPlayer } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

const TransferNegotiationPage: React.FC = () => {
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<TransferMarketPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    getTransferMarketPlayer(String(clubId))
      .then(setPlayer)
      .catch(err => setError(err.message || 'Failed to load player'))
      .finally(() => setLoading(false));
  }, [clubId]);

  const handleComplete = () => {
    navigate('/transfer-market');
  };

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">{error}</div>;
  if (!player) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Player not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <TransferNegotiationModal
        player={player}
        onClose={() => navigate('/transfer-market')}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default TransferNegotiationPage; 