import React, { useEffect, useState } from 'react';
import { getExpiringContracts, renewContract } from '../api/playerApi';
import { useNavigate } from 'react-router-dom';

const ExpiringContractsPage: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchExpiring() {
      setLoading(true);
      setError(null);
      try {
        const data = await getExpiringContracts();
        setPlayers(data.players || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchExpiring();
  }, []);

  const handleRenew = async (id: number) => {
    try {
      await renewContract(id);
      // Refresh list
      const data = await getExpiringContracts();
      setPlayers(data.players || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleNegotiate = (id: number) => {
    navigate(`/players/${id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div>
      <h1>Expiring Contracts</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Club</th>
            <th>Expiry</th>
            <th>Wage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr><td colSpan={5}>No expiring contracts.</td></tr>
          ) : (
            players.map(player => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.clubName}</td>
                <td>{player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString() : '-'}</td>
                <td>€{player.wage?.toLocaleString() ?? '-'}</td>
                <td>
                  <button onClick={() => handleRenew(player.id)}>Renew</button>
                  <button onClick={() => handleNegotiate(player.id)} style={{marginLeft: 8}}>Negotiate</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpiringContractsPage; 