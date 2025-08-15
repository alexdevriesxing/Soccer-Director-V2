import React, { useEffect, useState } from 'react';
import { getPlayerCareerStats, getPlayerAwards, getPlayerTransfers } from '../api/playerApi';

const PlayerHistory: React.FC<{ playerId: number }> = ({ playerId }) => {
  const [careerStats, setCareerStats] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, awardsRes, transfersRes] = await Promise.all([
          getPlayerCareerStats(playerId),
          getPlayerAwards(playerId),
          getPlayerTransfers(playerId),
        ]);
        setCareerStats(statsRes.stats);
        setAwards(awardsRes.awards);
        setTransfers(transfersRes.transfers);
      } catch (err) {
        setError('Failed to load player history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [playerId]);

  if (loading) return <div>Loading player history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2 className="text-2xl font-bold mb-4">Player History</h2>
      <h3 className="text-xl font-semibold">Career Stats</h3>
      <ul className="mb-4">
        {careerStats.map((stat, index) => (
          <li key={index}>{stat.season}: {stat.goals} goals, {stat.assists} assists</li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold">Awards</h3>
      <ul className="mb-4">
        {awards.map((award, index) => (
          <li key={index}>{award.season}: {award.name}</li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold">Transfers</h3>
      <ul>
        {transfers.map((transfer, index) => (
          <li key={index}>{transfer.date}: {transfer.fromClub.name} to {transfer.toClub.name} for {transfer.fee}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerHistory;
