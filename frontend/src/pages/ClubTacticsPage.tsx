import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Types
interface Tactics {
  formation: string;
  strategy: string;
}
interface Specialist {
  id: number;
  playerId: number;
  playerName: string;
  type: string;
  skill: number;
  successRate?: number;
  attempts?: number;
  goals?: number;
}

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'];
const STRATEGIES = ['Attacking', 'Balanced', 'Defensive', 'Counter', 'Possession', 'High Press'];
const SPECIALIST_TYPES = ['Free Kick', 'Penalty', 'Corner', 'Throw In'];

const ClubTacticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  if (!profile) return null;
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tactics, setTactics] = useState<Tactics | null>(null);
  const [tacticsEdit, setTacticsEdit] = useState<Tactics | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
  const [savingTactics, setSavingTactics] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Add Specialist
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState('Free Kick');
  const [addPlayerId, setAddPlayerId] = useState<number | null>(null);
  const [addSkill, setAddSkill] = useState<number>(80);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  // Edit Specialist
  const [editId, setEditId] = useState<number | null>(null);
  const [editSkill, setEditSkill] = useState<number>(80);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  // Delete
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/${clubId}/tactics`).then(r => r.json()),
      fetch(`/api/${clubId}/set-piece-specialists`).then(r => r.json()),
      fetch(`/api/game/club/${clubId}/squad`).then(r => r.json()),
    ])
      .then(([tacticsData, specialistsData, squadData]) => {
        setTactics(tacticsData);
        setTacticsEdit(tacticsData);
        setSpecialists(specialistsData.specialists || []);
        setPlayers((squadData.players || []).map((p: any) => ({ id: p.id, name: p.name })));
      })
      .catch(e => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [clubId]);

  // Save tactics
  const handleSaveTactics = async () => {
    if (!tacticsEdit) return;
    setSavingTactics(true);
    setError(null);
    try {
      const res = await fetch(`/api/${clubId}/tactics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tacticsEdit),
      });
      if (!res.ok) throw new Error('Failed to save tactics');
      setTactics({ ...tacticsEdit });
      setToast('Tactics updated!');
    } catch (e: any) {
      setError(e.message || 'Failed to save tactics');
    } finally {
      setSavingTactics(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  // Add specialist
  const handleAddSpecialist = async () => {
    if (!addPlayerId || !addType || addSkill == null) {
      setAddError('All fields required');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/${clubId}/set-piece-specialist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: addPlayerId, type: addType, skill: addSkill }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add specialist');
      }
      setToast('Specialist added!');
      setAddModalOpen(false);
      // Refresh
      const specialistsRes = await fetch(`/api/${clubId}/set-piece-specialists`).then(r => r.json());
      setSpecialists(specialistsRes.specialists || []);
    } catch (e: any) {
      setAddError(e.message || 'Failed to add specialist');
    } finally {
      setAddLoading(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  // Edit specialist
  const handleEditSpecialist = async () => {
    if (editId == null || editSkill == null) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/set-piece-specialist/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: editSkill }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update specialist');
      }
      setToast('Specialist updated!');
      setEditId(null);
      // Refresh
      const specialistsRes = await fetch(`/api/${clubId}/set-piece-specialists`).then(r => r.json());
      setSpecialists(specialistsRes.specialists || []);
    } catch (e: any) {
      setEditError(e.message || 'Failed to update specialist');
    } finally {
      setEditLoading(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  // Delete specialist
  const handleDeleteSpecialist = async (id: number) => {
    setDeleteLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/set-piece-specialist/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete specialist');
      }
      setToast('Specialist deleted!');
      // Refresh
      const specialistsRes = await fetch(`/api/${clubId}/set-piece-specialists`).then(r => r.json());
      setSpecialists(specialistsRes.specialists || []);
    } catch (e: any) {
      setError(e.message || 'Failed to delete specialist');
    } finally {
      setDeleteLoading(null);
      setTimeout(() => setToast(null), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading tactics...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Club Tactics & Set Piece Specialists</h1>
        {toast && <div className="mb-4 p-3 rounded bg-green-700/80 text-white text-center font-semibold shadow">{toast}</div>}
        {/* Tactics Section */}
        <section className="mb-12 bg-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Tactics</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Formation</label>
            <select
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={tacticsEdit?.formation || ''}
              onChange={e => setTacticsEdit(t => t ? { ...t, formation: e.target.value } : t)}
            >
              {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Strategy</label>
            <select
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={tacticsEdit?.strategy || ''}
              onChange={e => setTacticsEdit(t => t ? { ...t, strategy: e.target.value } : t)}
            >
              {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            className="px-6 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-bold mt-2 shadow"
            onClick={handleSaveTactics}
            disabled={savingTactics}
          >
            {savingTactics ? 'Saving...' : 'Save Tactics'}
          </button>
        </section>
        {/* Set Piece Specialists Section */}
        <section className="bg-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Set Piece Specialists</h2>
            <button
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow"
              onClick={() => { setAddModalOpen(true); setAddError(null); setAddPlayerId(null); setAddType('Free Kick'); setAddSkill(80); }}
            >
              + Add Specialist
            </button>
          </div>
          <ul className="space-y-2 mb-4">
            {specialists.length === 0 && <li className="text-gray-300">No specialists assigned.</li>}
            {specialists.map(s => (
              <li key={s.id} className="flex justify-between items-center bg-black/20 rounded-lg px-4 py-2">
                <span>{s.type}: <span className="font-bold text-yellow-300">{s.playerName}</span> (Skill: {s.skill})</span>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    onClick={() => { setEditId(s.id); setEditSkill(s.skill); setEditError(null); }}
                  >Edit</button>
                  <button
                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                    onClick={() => handleDeleteSpecialist(s.id)}
                    disabled={deleteLoading === s.id}
                  >{deleteLoading === s.id ? 'Deleting...' : 'Delete'}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {/* Add Specialist Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl p-8 shadow-xl w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setAddModalOpen(false)} aria-label="Close">×</button>
              <h3 className="text-xl font-bold mb-4">Add Set Piece Specialist</h3>
              {addError && <div className="mb-2 text-red-400">{addError}</div>}
              <div className="mb-3">
                <label className="block mb-1">Type</label>
                <select className="w-full p-2 rounded bg-gray-800 text-white" value={addType} onChange={e => setAddType(e.target.value)}>
                  {SPECIALIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Player</label>
                <select className="w-full p-2 rounded bg-gray-800 text-white" value={addPlayerId ?? ''} onChange={e => setAddPlayerId(Number(e.target.value))}>
                  <option value="">Select player</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Skill</label>
                <input type="number" min={1} max={100} className="w-full p-2 rounded bg-gray-800 text-white" value={addSkill} onChange={e => setAddSkill(Number(e.target.value))} />
              </div>
              <button className="w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold mt-2" onClick={handleAddSpecialist} disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Specialist'}</button>
            </div>
          </div>
        )}
        {/* Edit Specialist Modal */}
        {editId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl p-8 shadow-xl w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setEditId(null)} aria-label="Close">×</button>
              <h3 className="text-xl font-bold mb-4">Edit Specialist Skill</h3>
              {editError && <div className="mb-2 text-red-400">{editError}</div>}
              <div className="mb-3">
                <label className="block mb-1">Skill</label>
                <input type="number" min={1} max={100} className="w-full p-2 rounded bg-gray-800 text-white" value={editSkill} onChange={e => setEditSkill(Number(e.target.value))} />
              </div>
              <button className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold mt-2" onClick={handleEditSpecialist} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubTacticsPage; 