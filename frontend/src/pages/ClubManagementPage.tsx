import React, { useState, useEffect } from 'react';
import {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub
} from '../api/clubApi';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

export default function ClubManagementPage() {
  const { t } = useTranslation();
  const [clubs, setClubs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clubId, loading: clubIdLoading } = useResolvedClubId();

  useEffect(() => {
    if (!clubId) return;
    fetchClubs();
  }, [clubId]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClubs();
      setClubs(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: number) => {
    setLoading(true);
    try {
      const res = await getClub(id);
      setSelected(res.data);
    } catch (e) {
      setError('Failed to fetch club');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>{t('Club Management')}</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>{t('Loading...')}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('League')}</th>
            <th>{t('Morale')}</th>
            <th>{t('Form')}</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map(c => (
            <tr key={c.id} style={{ cursor: 'pointer', background: selected?.id === c.id ? '#eef' : undefined }}>
              <td onClick={() => handleSelect(c.id)} style={{ color: '#0074d9', textDecoration: 'underline' }}>{c.name}</td>
              <td>{c.leagueId}</td>
              <td>{c.morale}</td>
              <td>{c.form}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div style={{ marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#fafbff' }}>
          <h2>{selected.name}</h2>
          <div>{t('League')}: {selected.leagueId}</div>
          <div>{t('Morale')}: {selected.morale}</div>
          <div>{t('Form')}: {selected.form}</div>
          {/* Add more club details and controls as needed */}
        </div>
      )}
    </div>
  );
} 