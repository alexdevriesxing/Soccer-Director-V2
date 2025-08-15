import React, { useEffect, useState } from 'react';
import HireStaffModal from '../components/HireStaffModal';
import { Staff } from '../types';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const staffRoles = [
  'Head Coach', 'Assistant', 'Fitness Coach', 'Goalkeeping Coach', 'Scout', 'Analyst', 'Physiotherapist', 'Doctor', 'Youth Coach'
];

const isAdmin = true; // Hardcoded admin flag for demo

const StaffManagementPage: React.FC = () => {
  const { clubId, loading: clubIdLoading } = useResolvedClubId();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [firingId, setFiringId] = useState<number | null>(null);
  const [firing, setFiring] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState(staffRoles[0]);
  const [editSkill, setEditSkill] = useState(50);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);


  const fetchStaff = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${clubId}`);
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchStaff();
  }, [clubId, fetchStaff]);

  const handleHire = async (name: string, role: string, skill: number) => {
    setHiring(true);
    setError(null);
    try {
      await fetch(`/api/staff/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, skill })
      });
      setShowHireModal(false);
      await fetchStaff();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setHiring(false);
    }
  };

  const handleFire = async (id: number) => {
    setFiring(true);
    setError(null);
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      setFiringId(null);
      await fetchStaff();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setFiring(false);
    }
  };

  const openEditModal = (staff: Staff) => {
    setEditId(staff.id);
    setEditName(staff.name);
    setEditRole(staff.role);
    setEditSkill(staff.skill);
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditId(null);
    setEditName('');
    setEditRole(staffRoles[0]);
    setEditSkill(50);
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editId) return;
    setEditing(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/staff/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, role: editRole, skill: editSkill })
      });
      if (!res.ok) throw new Error('Failed to update staff');
      closeEditModal();
      await fetchStaff();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setEditError(e.message);
      } else {
        setEditError('Unknown error');
      }
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      {clubIdLoading ? (
        <LoadingSpinner />
      ) : !clubId ? (
        <ErrorMessage message="Club not found." />
      ) : (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
          {/* Optionally, LanguageSelector at top right */}
          {/* <div className="absolute top-6 right-8 z-10"><LanguageSelector /></div> */}
          <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col items-center">
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-6 py-8 w-full">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Staff Management
              </h2>
              {loading ? (            <div className="flex items-center justify-center text-lg text-white/80 py-8">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center text-lg text-red-300 py-8">{error}</div>
          ) : (
            <>
              {isAdmin && (
                <button
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all text-lg glow mb-6"
                  onClick={() => setShowHireModal(true)}
                >
                  Hire New Staff
                </button>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base rounded-xl overflow-hidden shadow-lg bg-white/5 mb-6">
                  <thead>
                    <tr className="bg-white/10 text-indigo-100">
                      <th className="px-3 py-2 font-bold">Name</th>
                      <th className="px-3 py-2 font-bold">Role</th>
                      <th className="px-3 py-2 font-bold">Skill</th>
                      <th className="px-3 py-2 font-bold">Hired</th>
                      <th className="px-3 py-2 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id} className="border-b border-white/10 hover:bg-indigo-900/30 transition-colors">
                        <td className="px-3 py-2 text-white/90">{s.name}</td>
                        <td className="px-3 py-2 text-white/90">{s.role}</td>
                        <td className="px-3 py-2 text-white/90">{s.skill}</td>
                        <td className="px-3 py-2 text-white/90">{s.hiredDate ? new Date(s.hiredDate).toLocaleDateString() : '-'}</td>
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
            </>
          )}
        </div>
      </div>
      {/* Hire Modal */}
      {showHireModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <HireStaffModal
              onConfirm={handleHire}
              onCancel={() => setShowHireModal(false)}
              loading={hiring}
              staffRoles={staffRoles}
            />
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editId !== null && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-white text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Edit Staff</h3>
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
              <label className="block text-sm mb-1 text-indigo-100">Role</label>
              <select
                className="border border-white/20 rounded px-3 py-2 w-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                disabled={editing}
              >
                {staffRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-indigo-100">Skill</label>
              <input
                type="range"
                min={1}
                max={100}
                value={editSkill}
                onChange={e => setEditSkill(Number(e.target.value))}
                disabled={editing}
                className="w-full accent-indigo-500"
              />
              <span className="ml-2 text-white/90 font-bold">{editSkill}</span>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-lg glow"
                onClick={handleEdit}
                disabled={editing}
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
            {editError && <div className="text-red-300 mt-4 text-center">{editError}</div>}
          </div>
        </div>
      )}
      {/* Fire Confirmation */}
      {firingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-black/40">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 px-8 py-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Fire Staff</h3>
            <p className="text-white/90 mb-6">Are you sure you want to fire this staff member?</p>
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
        )}
      </>
  );
};

export default StaffManagementPage;