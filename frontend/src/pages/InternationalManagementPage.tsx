import React, { useEffect, useState } from 'react';
import {
  fetchNationalTeams, createNationalTeam, updateNationalTeam, deleteNationalTeam,
  fetchInternationalCompetitions, createInternationalCompetition, updateInternationalCompetition, deleteInternationalCompetition,
  fetchInternationalManagers, createInternationalManager, updateInternationalManager, deleteInternationalManager
} from '../api/internationalApi';

const isAdmin = true; // Hardcoded admin flag for demo

const InternationalManagementPage: React.FC = () => {
  // --- State ---
  const [teams, setTeams] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'team' | 'competition' | 'manager' | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form state
  const [form, setForm] = useState<any>({});

  // --- Fetch all data ---
  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [t, c, m] = await Promise.all([
        fetchNationalTeams(),
        fetchInternationalCompetitions(),
        fetchInternationalManagers()
      ]);
      setTeams(t); setCompetitions(c); setManagers(m);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchAll(); }, []);

  // --- Handlers ---
  const openModal = (type: 'team' | 'competition' | 'manager', item: any = null) => {
    setModalType(type);
    setEditItem(item);
    setForm(item ? { ...item } : {});
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm({}); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      if (modalType === 'team') {
        if (editItem) await updateNationalTeam(editItem.id, form);
        else await createNationalTeam(form);
      } else if (modalType === 'competition') {
        if (editItem) await updateInternationalCompetition(editItem.id, form);
        else await createInternationalCompetition(form);
      } else if (modalType === 'manager') {
        if (editItem) await updateInternationalManager(editItem.id, form);
        else await createInternationalManager(form);
      }
      setSuccess('Saved successfully');
      closeModal();
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'team' | 'competition' | 'manager', id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      if (type === 'team') await deleteNationalTeam(id);
      else if (type === 'competition') await deleteInternationalCompetition(id);
      else if (type === 'manager') await deleteInternationalManager(id);
      setSuccess('Deleted successfully');
      fetchAll();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="international-management-page">
      <h1>International Management</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {loading && <div>Loading...</div>}
      <div className="management-section">
        <h2>National Teams</h2>
        {isAdmin && <button onClick={() => openModal('team')}>Add Team</button>}
        <ul>
          {teams.map(team => (
            <li key={team.id}>
              {team.name} ({team.code}) - {team.region} | Ranking: {team.ranking} | Reputation: {team.reputation}
              {isAdmin && <>
                <button onClick={() => openModal('team', team)}>Edit</button>
                <button onClick={() => handleDelete('team', team.id)}>Delete</button>
              </>}
            </li>
          ))}
        </ul>
      </div>
      <div className="management-section">
        <h2>International Competitions</h2>
        {isAdmin && <button onClick={() => openModal('competition')}>Add Competition</button>}
        <ul>
          {competitions.map(comp => (
            <li key={comp.id}>
              {comp.name} ({comp.type}) | {comp.startDate?.slice(0,10)} - {comp.endDate?.slice(0,10)} | Status: {comp.status}
              {isAdmin && <>
                <button onClick={() => openModal('competition', comp)}>Edit</button>
                <button onClick={() => handleDelete('competition', comp.id)}>Delete</button>
              </>}
            </li>
          ))}
        </ul>
      </div>
      <div className="management-section">
        <h2>International Managers</h2>
        {isAdmin && <button onClick={() => openModal('manager')}>Add Manager</button>}
        <ul>
          {managers.map(mgr => (
            <li key={mgr.id}>
              {mgr.name} ({mgr.nationality}) | Team: {mgr.nationalTeamId} | Reputation: {mgr.reputation} | Active: {mgr.isActive ? 'Yes' : 'No'}
              {isAdmin && <>
                <button onClick={() => openModal('manager', mgr)}>Edit</button>
                <button onClick={() => handleDelete('manager', mgr.id)}>Delete</button>
              </>}
            </li>
          ))}
        </ul>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editItem ? 'Edit' : 'Add'} {modalType === 'team' ? 'National Team' : modalType === 'competition' ? 'Competition' : 'Manager'}</h3>
            {/* Simple form, can be expanded for better UX */}
            {modalType === 'team' && (
              <>
                <input name="name" placeholder="Name" value={form.name || ''} onChange={handleChange} />
                <input name="code" placeholder="Code" value={form.code || ''} onChange={handleChange} />
                <input name="region" placeholder="Region" value={form.region || ''} onChange={handleChange} />
                <input name="ranking" type="number" placeholder="Ranking" value={form.ranking || ''} onChange={handleChange} />
                <input name="reputation" type="number" placeholder="Reputation" value={form.reputation || ''} onChange={handleChange} />
              </>
            )}
            {modalType === 'competition' && (
              <>
                <input name="name" placeholder="Name" value={form.name || ''} onChange={handleChange} />
                <input name="type" placeholder="Type" value={form.type || ''} onChange={handleChange} />
                <input name="startDate" type="date" placeholder="Start Date" value={form.startDate?.slice(0,10) || ''} onChange={handleChange} />
                <input name="endDate" type="date" placeholder="End Date" value={form.endDate?.slice(0,10) || ''} onChange={handleChange} />
                <input name="status" placeholder="Status" value={form.status || ''} onChange={handleChange} />
              </>
            )}
            {modalType === 'manager' && (
              <>
                <input name="name" placeholder="Name" value={form.name || ''} onChange={handleChange} />
                <input name="nationality" placeholder="Nationality" value={form.nationality || ''} onChange={handleChange} />
                <input name="nationalTeamId" type="number" placeholder="National Team ID" value={form.nationalTeamId || ''} onChange={handleChange} />
                <input name="startDate" type="date" placeholder="Start Date" value={form.startDate?.slice(0,10) || ''} onChange={handleChange} />
                <input name="endDate" type="date" placeholder="End Date" value={form.endDate?.slice(0,10) || ''} onChange={handleChange} />
                <input name="reputation" type="number" placeholder="Reputation" value={form.reputation || ''} onChange={handleChange} />
                <input name="tactics" placeholder="Tactics" value={form.tactics || ''} onChange={handleChange} />
                <input name="formation" placeholder="Formation" value={form.formation || ''} onChange={handleChange} />
                <select name="isActive" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </>
            )}
            <div className="modal-actions">
              <button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
            {error && <div className="error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalManagementPage; 