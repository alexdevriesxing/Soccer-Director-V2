import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransfer } from '../api/footballApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

const TransferDetailsPage: React.FC = () => {
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    getTransfer(Number(id))
      .then(setTransfer)
      .catch(err => setError(err.message || 'Failed to load transfer'))
      .finally(() => setLoading(false));
  }, [id, clubId]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading transfer details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!transfer) return <div className="min-h-screen flex items-center justify-center">Transfer not found</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Transfer Details</h2>
        <div className="mb-2"><strong>Player:</strong> {transfer.playerName || transfer.playerId}</div>
        <div className="mb-2"><strong>From Club:</strong> {transfer.fromClub}</div>
        <div className="mb-2"><strong>To Club:</strong> {transfer.toClub}</div>
        <div className="mb-2"><strong>Fee:</strong> €{transfer.fee?.toLocaleString() || '-'}</div>
        <div className="mb-2"><strong>Status:</strong> {transfer.status}</div>
        <div className="mb-2"><strong>Date:</strong> {transfer.date ? new Date(transfer.date).toLocaleDateString() : '-'}</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Back</button>
      </div>
    </div>
  );
};

export default TransferDetailsPage; 