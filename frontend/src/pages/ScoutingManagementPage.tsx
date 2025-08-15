import React, { useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
// Optionally, import LanguageSelector if available
// import LanguageSelector from '../components/LanguageSelector';

const regions = [
  'Netherlands', 'Germany', 'France', 'England', 'Spain', 'Italy', 'Belgium', 'Portugal', 'Scandinavia', 'Eastern Europe'
];

const isAdmin = true; // Hardcoded admin flag for demo

const ScoutingManagementPage: React.FC = () => {
  const { profile } = useManagerProfile();
  if (!profile) return null;
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  const [scouts, setScouts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireName, setHireName] = useState('');
  const [hireRegion, setHireRegion] = useState(regions[0]);
  const [hireAbility, setHireAbility] = useState(50);
  const [hireNetwork, setHireNetwork] = useState(50);
  const [hiring, setHiring] = useState(false);
  const [firingId, setFiringId] = useState<number | null>(null);
  const [firing, setFiring] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState(regions[0]);
  const [editAbility, setEditAbility] = useState(50);
  const [editNetwork, setEditNetwork] = useState(50);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchScoutsAndReports = async () => {
    setLoading(true);
    setError(null);
    if (!clubId) {
      setError('Club ID not found.');
      setLoading(false);
      return;
    }
    try {
      const [scoutsRes, reportsRes] = await Promise.all([
        fetch(`/api/scouts/${clubId}`),
        fetch(`/api/reports/${clubId}`)
      ]);
      if (!scoutsRes.ok || !reportsRes.ok) throw new Error('Failed to fetch scouting data');
      const scoutsData = await scoutsRes.json();
      const reportsData = await reportsRes.json();
      setScouts(scoutsData || []);
      setReports(reportsData || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoutsAndReports();
  }, [clubId]); // Add clubId to dependency array

  const handleHire = async () => {
    setHiring(true);
    setError(null);
    if (!clubId) {
      setError('Club ID not found.');
      setHiring(false);
      return;
    }
    try {
      await fetch('/api/youth-scouting/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId, name: hireName, region: hireRegion, ability: hireAbility, network: hireNetwork })
      });
      setShowHireModal(false);
      setHireName('');
      setHireRegion(regions[0]);
      setHireAbility(50);
      setHireNetwork(50);
      await fetchScoutsAndReports();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setHiring(false);
    }
  };

  const openEditModal = (scout: any) => {
    setEditId(scout.id);
    setEditName(scout.name);
    setEditRegion(scout.region);
    setEditAbility(scout.ability);
    setEditNetwork(scout.network);
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditId(null);
    setEditName('');
    setEditRegion(regions[0]);
    setEditAbility(50);
    setEditNetwork(50);
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editId) return;
    setEditing(true);
    setEditError(null);
    if (!clubId) {
      setEditError('Club ID not found.');
      setEditing(false);
      return;
    }
    try {
      const res = await fetch(`/api/youth-scouting/scouts/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, region: editRegion, ability: editAbility, network: editNetwork })
      });
      if (!res.ok) throw new Error('Failed to update scout');
      closeEditModal();
      await fetchScoutsAndReports();
    } catch (e: any) {
      setEditError(e.message || 'Unknown error');
    } finally {
      setEditing(false);
    }
  };

  const handleFire = async (id: number) => {
    setFiring(true);
    setError(null);
    if (!clubId) {
      setError('Club ID not found.');
      setFiring(false);
      return;
    }
    try {
      const res = await fetch(`/api/youth-scouting/scouts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to fire scout');
      setFiringId(null);
      await fetchScoutsAndReports();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setFiring(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
      {/* Optionally, LanguageSelector at top right */}
      {/* <div className="absolute top-6 right-8 z-10"><LanguageSelector /></div> */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-6 py-8 w-full">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Scouting Management
          </h2>
          {loading ? (
            <div className="flex items-center justify-center text-lg text-white/80 py-8">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center text-lg text-red-300 py-8">{error}</div>
          ) : (
            <>
              {isAdmin && (
                <button
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all text-lg glow mb-6"
                  onClick={() => setShowHireModal(true)}
                >
                  Hire New Scout
                </button>
              )}
              <h3 className="font-semibold mb-2 text-indigo-100">Current Scouts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base rounded-xl overflow-hidden shadow-lg bg-white/5 mb-6">
                  <thead>
                    <tr className="bg-white/10 text-indigo-100">
                      <th className="px-3 py-2 font-bold">Name</th>
                      <th className="px-3 py-2 font-bold">Region</th>
                      <th className="px-3 py-2 font-bold">Ability</th>
                      <th className="px-3 py-2 font-bold">Network</th>
                      <th className="px-3 py-2 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scouts.map(s => (
                      <tr key={s.id} className="border-b border-white/10 hover:bg-indigo-900/30 transition-colors">
                        <td className="px-3 py-2 text-white/90">{s.name}</td>
                        <td className="px-3 py-2 text-white/90">{s.region}</td>
                        <td className="px-3 py-2 text-white/90">{s.ability}</td>
                        <td className="px-3 py-2 text-white/90">{s.network}</td>
                        <td className="px-3 py-2 text-white/90">
                          {isAdmin && (
                            <div className="flex gap-2">
                              <button
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm glow"
                                onClick={() => openEditModal(s)}
                                disabled={editing}
                              >
                                Edit
                              </button>
                              <button
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow hover:from-red-400 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all text-sm glow"
                                onClick={() => setFiringId(s.id)}
                                disabled={firing}
                              >
                                Fire
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="font-semibold mb-2 text-indigo-100">Scouting Reports</h3>
              {reports.length === 0 ? <div className="text-white/80">No reports yet.</div> : reports.map((r: any) => (
                <div key={r.scout.id} className="mb-4 p-4 bg-white/10 rounded-xl border border-white/10 shadow">
                  <div className="font-semibold mb-1 text-white/90">Scout: {r.scout.name} ({r.scout.region})</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {r.prospects.map((p: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white/20 rounded-xl shadow border border-white/10 text-white/90">
                        <div><b>{p.name}</b> ({p.position}, Age {p.age})</div>
                        <div>Skill: {p.skill} | Talent: {p.talent}</div>
                        <div>Personality: {p.personality}</div>
                        <div>Nationality: {p.nationality}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      {/* Hire Modal */}
      {showHireModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-white text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Hire New Scout</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-indigo-100">Name</label>
              <input
                className="border border-white/20 rounded px-3 py-2 w-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                value={hireName}
                onChange={e => setHireName(e.target.value)}
                disabled={hiring}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-indigo-100">Region</label>
              <select
                className="border border-white/20 rounded px-3 py-2 w-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                value={hireRegion}
                onChange={e => setHireRegion(e.target.value)}
                disabled={hiring}
              >
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-indigo-100">Ability</label>
              <input
                type="range"
                min={1}
                max={100}
                value={hireAbility}
                onChange={e => setHireAbility(Number(e.target.value))}
                disabled={hiring}
                className="w-full accent-indigo-500"
              />
              <span className="ml-2 text-white/90 font-bold">{hireAbility}</span>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-indigo-100">Network</label>
              <input
                type="range"
                min={1}
                max={100}
                value={hireNetwork}
                onChange={e => setHireNetwork(Number(e.target.value))}
                disabled={hiring}
                className="w-full accent-indigo-500"
              />
              <span className="ml-2 text-white/90 font-bold">{hireNetwork}</span>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all text-lg glow"
                onClick={handleHire}
                disabled={hiring}
              >
                {hiring ? 'Hiring...' : 'Hire'}
              </button>
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold shadow hover:from-gray-300 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all text-lg glow"
                onClick={() => setShowHireModal(false)}
                disabled={hiring}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editId !== null && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-white text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Edit Scout</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-indigo-100">Name</label>
              <input
                className="border border-white/20 rounded px-3 py-2 w-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={editing}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-indigo-100">Region</label>
              <select
                className="border border-white/20 rounded px-3 py-2 w-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                value={editRegion}
                onChange={e => setEditRegion(e.target.value)}
                disabled={editing}
              >
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-indigo-100">Ability</label>
              <input
                type="range"
                min={1}
                max={100}
                value={editAbility}
                onChange={e => setEditAbility(Number(e.target.value))}
                disabled={editing}
                className="w-full accent-indigo-500"
              />
              <span className="ml-2 text-white/90 font-bold">{editAbility}</span>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-indigo-100">Network</label>
              <input
                type="range"
                min={1}
                max={100}
                value={editNetwork}
                onChange={e => setEditNetwork(Number(e.target.value))}
                disabled={editing}
                className="w-full accent-indigo-500"
              />
              <span className="ml-2 text-white/90 font-bold">{editNetwork}</span>
            </div>
            {editError && <div className="text-red-300 text-center mb-4">{editError}</div>}
            <div className="flex gap-2 justify-center">
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-lg glow"
                onClick={handleEdit}
                disabled={editing || !editName}
              >
                {editing ? 'Saving...' : 'Save'}
              </button>
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold shadow hover:from-gray-300 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all text-lg glow"
                onClick={closeEditModal}
                disabled={editing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fire Confirmation */}
      {firingId !== null && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-white text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Fire Scout</h3>
            <p className="text-white/90 mb-4 text-center">Are you sure you want to fire this scout?</p>
            <div className="flex gap-2 justify-center">
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow hover:from-red-400 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all text-lg glow"
                onClick={() => handleFire(firingId)}
                disabled={firing}
              >
                {firing ? 'Firing...' : 'Fire'}
              </button>
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold shadow hover:from-gray-300 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all text-lg glow"
                onClick={() => setFiringId(null)}
                disabled={firing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Google Fonts for Montserrat and Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
    </div>
  );
};

export default ScoutingManagementPage; 