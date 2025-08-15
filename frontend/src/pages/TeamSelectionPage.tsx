import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

interface Player {
  id: number;
  name: string;
  position: string;
  skill: number;
  age: number;
}

const FORMATIONS = [
  '4-4-2',
  '4-3-3',
  '3-5-2',
  '4-2-3-1',
  '5-3-2',
  '3-4-3',
];

const TACTICAL_OPTIONS = {
  style: ['Balanced', 'Attacking', 'Defensive'],
  intensity: ['Low', 'Medium', 'High'],
  width: ['Narrow', 'Normal', 'Wide'],
  tempo: ['Slow', 'Normal', 'Fast'],
};

const POSITIONS = [
  'GK', 'RB', 'CB', 'CB2', 'LB', 'RM', 'CM', 'CM2', 'LM', 'RW', 'ST', 'LW'
];

const TeamSelectionPage: React.FC = () => {
  const { t } = useTranslation();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formation, setFormation] = useState('4-4-2');
  const [tactics, setTactics] = useState({
    style: 'Balanced',
    intensity: 'Medium',
    width: 'Normal',
    tempo: 'Normal',
  });
  const [startingXI, setStartingXI] = useState<{ [pos: string]: number | null }>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetchSquad();
  }, [clubId]);

  const fetchSquad = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/players?clubId=${clubId}`);
      const data = await res.json();
      setPlayers(data.players || data || []);
      // Default starting XI: pick best by skill for each position
      const defaultXI: { [pos: string]: number | null } = {};
      POSITIONS.forEach(pos => {
        const candidates = data.players.filter((p: Player) => p.position.startsWith(pos[0]));
        if (candidates.length > 0) {
          defaultXI[pos] = candidates.sort((a: Player, b: Player) => b.skill - a.skill)[0].id;
        } else {
          defaultXI[pos] = null;
        }
      });
      setStartingXI(defaultXI);
    } catch (e: any) {
      setError(e.message || 'Failed to load squad');
    } finally {
      setLoading(false);
    }
  };

  const handleXIChange = (pos: string, playerId: number) => {
    setStartingXI(xi => ({ ...xi, [pos]: playerId }));
  };

  const handleTacticChange = (key: string, value: string) => {
    setTactics(t => ({ ...t, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      // Save tactics
      await fetch(`/api/clubs/${clubId}/tactics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formation,
          ...tactics,
        }),
      });
      // Save starting XI
      await fetch(`/api/clubs/${clubId}/starting-xi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingXI,
        }),
      });
      setSaveMsg('Saved successfully!');
    } catch (e: any) {
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  if (loading) return <div className="p-8">Loading squad...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Team Selection & Tactics</h1>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Formation</h2>
          <select value={formation} onChange={e => setFormation(e.target.value)} className="border rounded px-3 py-2 mb-4">
            {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <h2 className="font-semibold mb-2">Tactics</h2>
          {Object.entries(TACTICAL_OPTIONS).map(([key, options]) => (
            <div key={key} className="mb-2">
              <label className="block text-sm font-medium mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <select value={tactics[key as keyof typeof tactics]} onChange={e => handleTacticChange(key, e.target.value)} className="border rounded px-2 py-1">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Starting XI</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Position</th>
                <th className="text-left">Player</th>
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map(pos => (
                <tr key={pos}>
                  <td className="py-1 pr-2 font-semibold">{pos}</td>
                  <td>
                    <select
                      value={startingXI[pos] || ''}
                      onChange={e => handleXIChange(pos, Number(e.target.value))}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">-- Select --</option>
                      {players.filter(p => p.position.startsWith(pos[0])).map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Skill: {p.skill})</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Selection'}
      </button>
      {saveMsg && <div className="mt-4 text-green-600">{saveMsg}</div>}
    </div>
  );
};

export default TeamSelectionPage; 