import React, { useState, useEffect } from 'react';
import {
  getPlayers,
  getPlayer,
  developPlayer,
  setPlayerMorale,
  updatePlayerContract,
  getPlayerHistory
} from '../api/playerApi';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

export default function PlayerManagementPage() {
  const { t } = useTranslation();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetchPlayers();
  }, [clubId]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;


  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPlayers({ clubId: String(clubId) });
      setPlayers(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: number) => {
    setLoading(true);
    try {
      const res = await getPlayer(id);
      setSelected(res.data);
      setHistory([]);
    } catch (e) {
      setError('Failed to fetch player');
    }
    setLoading(false);
  };

  const handleDevelop = async (id: number) => {
    await developPlayer(id, 1);
    handleSelect(id);
    fetchPlayers();
  };

  const handleSetMorale = async (id: number, morale: number) => {
    await setPlayerMorale(id, morale);
    handleSelect(id);
    fetchPlayers();
  };

  const handleUpdateContract = async (id: number, wage: number, expiry: string) => {
    await updatePlayerContract(id, { wage, contractExpiry: expiry });
    handleSelect(id);
    fetchPlayers();
  };

  const handleShowHistory = async (id: number) => {
    const res = await getPlayerHistory(id);
    setHistory(res.data.history);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>{t('Player Management')}</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>{t('Loading...')}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Position')}</th>
            <th>{t('Skill')}</th>
            <th>{t('Age')}</th>
            <th>{t('Nationality')}</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.id} style={{ cursor: 'pointer', background: selected?.id === p.id ? '#eef' : undefined }}>
              <td onClick={() => handleSelect(p.id)} style={{ color: '#0074d9', textDecoration: 'underline' }}>{p.name}</td>
              <td>{p.position}</td>
              <td>{p.skill}</td>
              <td>{p.age}</td>
              <td>{p.nationality}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div style={{ marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#fafbff' }}>
          <h2>{selected.name}</h2>
          <div>{t('Position')}: {selected.position}</div>
          <div>{t('Skill')}: {selected.skill}</div>
          <div>{t('Age')}: {selected.age}</div>
          <div>{t('Morale')}: {selected.morale}</div>
          <div>{t('Wage')}: {selected.wage}</div>
          <div>{t('Contract Expiry')}: {selected.contractExpiry ? new Date(selected.contractExpiry).toLocaleDateString() : ''}</div>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => handleDevelop(selected.id)}>{t('Develop')}</button>
            <button onClick={() => handleSetMorale(selected.id, Math.min(100, (selected.morale || 0) + 10))} style={{ marginLeft: 8 }}>{t('Boost Morale')}</button>
            <button onClick={() => handleUpdateContract(selected.id, (selected.wage || 0) + 100, selected.contractExpiry)} style={{ marginLeft: 8 }}>{t('Increase Wage')}</button>
            <button onClick={() => handleShowHistory(selected.id)} style={{ marginLeft: 8 }}>{t('Show History')}</button>
          </div>
          {history.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>{t('History')}</h3>
              <ul>
                {history.map((h, i) => (
                  <li key={i}>{JSON.stringify(h)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 