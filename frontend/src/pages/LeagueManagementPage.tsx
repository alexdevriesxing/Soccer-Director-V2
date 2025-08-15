import React, { useState, useEffect } from 'react';
import {
  getLeagues,
  getLeague,
  createLeague,
  updateLeague,
  deleteLeague
} from '../api/leagueApi';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

export default function LeagueManagementPage() {
  const { t } = useTranslation();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetchLeagues();
  }, [clubId]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;


  const fetchLeagues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeagues();
      setLeagues(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: number) => {
    setLoading(true);
    try {
      const res = await getLeague(id);
      setSelected(res.data);
    } catch (e) {
      setError('Failed to fetch league');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>{t('League Management')}</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>{t('Loading...')}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Tier')}</th>
            <th>{t('Season')}</th>
            <th>{t('Region')}</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map(l => (
            <tr key={l.id} style={{ cursor: 'pointer', background: selected?.id === l.id ? '#eef' : undefined }}>
              <td onClick={() => handleSelect(l.id)} style={{ color: '#0074d9', textDecoration: 'underline' }}>{l.name}</td>
              <td>{l.tier}</td>
              <td>{l.season}</td>
              <td>{l.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div style={{ marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#fafbff' }}>
          <h2>{selected.name}</h2>
          <div>{t('Tier')}: {selected.tier}</div>
          <div>{t('Season')}: {selected.season}</div>
          <div>{t('Region')}: {selected.region}</div>
          {/* Add more league details and controls as needed */}
        </div>
      )}
    </div>
  );
} 