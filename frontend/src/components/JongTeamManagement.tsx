import React, { useEffect, useState } from 'react';
import { Club } from '../types';
import useJongTeamManagement from '../hooks/useJongTeamManagement';

interface JongTeamManagementProps {
  open: boolean;
  onClose: () => void;
  parentClub: Club | null;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const JongTeamManagement: React.FC<JongTeamManagementProps> = ({ open, onClose, parentClub }) => {
  const {
    jongSquad,
    firstSquad,
    loading,
    loadingJong,
    loadingFirst,
    jongTeam,
    leagueTable,
    fixtures,
    graduations,
    showGraduation,
    currentGrad,
    jongPage,
    setJongPage,
    jongPageSize,
    setJongPageSize,
    jongTotalPlayers,
    jongTotalPages,
    firstPage,
    setFirstPage,
    firstPageSize,
    setFirstPageSize,
    firstTotalPlayers,
    firstTotalPages,
    handleGraduationDecision,
    setShowGraduation,
    setCurrentGrad
  } = useJongTeamManagement({ open, parentClub });

  useEffect(() => {
    if (!open || !parentClub) return;
    // Fetch graduations
    fetch(`/api/jong-team/graduations/${parentClub!.id}`)
      .then(res => res.json())
      .then(events => {
        // setGraduations(events); // This is now handled by the hook
        if (events.length > 0) {
          setCurrentGrad(events[0]);
          setShowGraduation(true);
        } else {
          setShowGraduation(false);
        }
      });
    // Fetch jong team, squads, league table, fixtures
    fetch(`/api/jong-team/${parentClub!.id}`)
      .then(res => res.json())
      .then(data => {
        // setJongTeam(data.jongTeam); // This is now handled by the hook
        // setJongSquad(data.jongSquad); // This is now handled by the hook
        // setFirstSquad(data.firstSquad); // This is now handled by the hook
        // setLeagueTable(data.leagueTable); // This is now handled by the hook
        // setFixtures(data.fixtures); // This is now handled by the hook
        // setLoading(false); // This is now handled by the hook
      });
  }, [open, parentClub]);

  const loadJongSquad = async () => {
    if (!open || !parentClub) return;
    // setLoadingJong(true); // This is now handled by the hook
    // setErrorJong(null); // This is now handled by the hook
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/jong-squad?page=${jongPage}&limit=${jongPageSize}`);
      if (response.ok) {
        const data = await response.json();
        // setJongSquad(data.players || []); // This is now handled by the hook
        // setJongTotalPlayers(data.totalPlayers || 0); // This is now handled by the hook
        // setJongTotalPages(data.totalPages || 1); // This is now handled by the hook
      }
    } catch (error) {
      // setErrorJong('Error loading jong squad'); // This is now handled by the hook
    } finally {
      // setLoadingJong(false); // This is now handled by the hook
    }
  };

  const loadFirstSquad = async () => {
    if (!open || !parentClub) return;
    // setLoadingFirst(true); // This is now handled by the hook
    // setErrorFirst(null); // This is now handled by the hook
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/first-squad?page=${firstPage}&limit=${firstPageSize}`);
      if (response.ok) {
        const data = await response.json();
        // setFirstSquad(data.players || []); // This is now handled by the hook
        // setFirstTotalPlayers(data.totalPlayers || 0); // This is now handled by the hook
        // setFirstTotalPages(data.totalPages || 1); // This is now handled by the hook
      }
    } catch (error) {
      // setErrorFirst('Error loading first squad'); // This is now handled by the hook
    } finally {
      // setLoadingFirst(false); // This is now handled by the hook
    }
  };

  useEffect(() => {
    loadJongSquad();
  }, [open, parentClub, jongPage, jongPageSize]);

  useEffect(() => {
    loadFirstSquad();
  }, [open, parentClub, firstPage, firstPageSize]);

  // const handleGraduationDecision = (decision: 'accept' | 'reject') => { // This is now handled by the hook
  //   if (!currentGrad) return;
  //   fetch(`/api/jong-team/graduations/${currentGrad.id}/decision`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ decision })
  //   }).then(() => {
  //     const next = graduations.slice(1);
  //     setGraduations(next);
  //     if (next.length > 0) {
  //       setCurrentGrad(next[0]);
  //       setShowGraduation(true);
  //     } else {
  //       setShowGraduation(false);
  //     }
  //   });
  // };

  // --- ADMIN GATING (scaffold for real auth) ---
  // TODO: Replace with real user/role check from context or auth provider
  const isAdmin = true;

  // --- CRUD for Jong Team ---
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [jongName, setJongName] = useState('');
  const [jongLeagueId, setJongLeagueId] = useState('');
  const [feedback, setFeedback] = useState('');

  const reloadAll = async () => {
    // Reload all Jong team data (squads, team, etc.)
    if (parentClub) {
      await fetch(`/api/jong-team/${parentClub.id}`)
        .then(res => res.json())
        .then(data => {
          // handled by hook
        });
    }
  };

  const handleCreateJongTeam = async () => {
    if (!parentClub) return;
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: jongName, leagueId: jongLeagueId })
      });
      if (!response.ok) throw new Error('Failed to create Jong team');
      setShowCreate(false);
      setFeedback('Jong team created.');
      await reloadAll();
    } catch (e) {
      setFeedback('Error creating Jong team.');
    }
  };

  const handleEditJongTeam = async () => {
    if (!jongTeam) return;
    try {
      const response = await fetch(`/api/jong-team/${jongTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: jongName, leagueId: jongLeagueId })
      });
      if (!response.ok) throw new Error('Failed to update Jong team');
      setShowEdit(false);
      setFeedback('Jong team updated.');
      await reloadAll();
    } catch (e) {
      setFeedback('Error updating Jong team.');
    }
  };

  const handleDeleteJongTeam = async () => {
    if (!jongTeam) return;
    try {
      const response = await fetch(`/api/jong-team/${jongTeam.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete Jong team');
      setShowDelete(false);
      setFeedback('Jong team deleted.');
      await reloadAll();
    } catch (e) {
      setFeedback('Error deleting Jong team.');
    }
  };

  // --- UI Controls ---
  // Add admin-only buttons for create, edit, delete
  const moveToFirst = async (playerId: number) => {
    if (!parentClub) return;
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/promote-player/${playerId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote player');
      // Refresh data
      await reloadAll();
      setFeedback('Player promoted to first team.');
    } catch (e) {
      setFeedback('Error promoting player.');
    }
  };

  const moveToJong = async (playerId: number) => {
    if (!jongTeam) return;
    try {
      const response = await fetch(`/api/jong-team/${jongTeam.id}/add-player/${playerId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to move player');
      // Refresh data
      await reloadAll();
      setFeedback('Player moved to Jong team.');
    } catch (e) {
      setFeedback('Error moving player.');
    }
  };

  // --- Multi-select state ---
  const [selectedJong, setSelectedJong] = useState<number[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<number[]>([]);

  const toggleJong = (id: number) => setSelectedJong(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const toggleFirst = (id: number) => setSelectedFirst(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const selectAllJong = () => setSelectedJong(jongSquad.map(p => p.id));
  const deselectAllJong = () => setSelectedJong([]);
  const selectAllFirst = () => setSelectedFirst(firstSquad.filter(p => (p.age ?? 0) <= 21).map(p => p.id));
  const deselectAllFirst = () => setSelectedFirst([]);

  // --- Bulk move handlers ---
  const bulkMoveToFirst = async () => {
    if (!parentClub || selectedJong.length === 0) return;
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/promote-players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: selectedJong })
      });
      if (!response.ok) throw new Error('Failed to promote players');
      setFeedback('Players promoted to first team.');
      setSelectedJong([]);
      await reloadAll();
    } catch (e) {
      setFeedback('Error promoting players.');
    }
  };
  const bulkMoveToJong = async () => {
    if (!jongTeam || selectedFirst.length === 0) return;
    try {
      const response = await fetch(`/api/jong-team/${jongTeam.id}/add-players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: selectedFirst })
      });
      if (!response.ok) throw new Error('Failed to move players');
      setFeedback('Players moved to Jong team.');
      setSelectedFirst([]);
      await reloadAll();
    } catch (e) {
      setFeedback('Error moving players.');
    }
  };
  // --- Auto-promotion/demotion handlers ---
  const autoPromote = async () => {
    if (!jongTeam || !parentClub) return;
    try {
      const response = await fetch(`/api/jong-team/${jongTeam.id}/auto-promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentClubId: parentClub.id })
      });
      if (!response.ok) throw new Error('Failed to auto-promote');
      const data = await response.json();
      setFeedback(`Auto-promoted ${data.promoted.length} players.`);
      await reloadAll();
    } catch (e) {
      setFeedback('Error auto-promoting players.');
    }
  };
  const autoDemote = async () => {
    if (!jongTeam || !parentClub) return;
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/auto-demote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jongTeamId: jongTeam.id })
      });
      if (!response.ok) throw new Error('Failed to auto-demote');
      const data = await response.json();
      setFeedback(`Auto-demoted ${data.demoted.length} players.`);
      await reloadAll();
    } catch (e) {
      setFeedback('Error auto-demoting players.');
    }
  };

  // --- Staff management state ---
  const [staff, setStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState<{ open: boolean, staff: any | null }>({ open: false, staff: null });
  const [showDeleteStaff, setShowDeleteStaff] = useState<{ open: boolean, staff: any | null }>({ open: false, staff: null });
  const [staffForm, setStaffForm] = useState({ name: '', role: '', skill: 50, hiredDate: '' });

  const loadStaff = async () => {
    if (!jongTeam) return;
    setLoadingStaff(true);
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/staff`);
      const data = await res.json();
      setStaff(data.staff || []);
    } catch {
      setFeedback('Error loading staff.');
    } finally {
      setLoadingStaff(false);
    }
  };
  useEffect(() => { if (jongTeam) loadStaff(); }, [jongTeam]);

  const handleAddStaff = async () => {
    if (!jongTeam) return;
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });
      if (!res.ok) throw new Error();
      setShowAddStaff(false);
      setFeedback('Staff added.');
      setStaffForm({ name: '', role: '', skill: 50, hiredDate: '' });
      await loadStaff();
    } catch {
      setFeedback('Error adding staff.');
    }
  };
  const handleEditStaff = async () => {
    if (!jongTeam || !showEditStaff.staff) return;
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/staff/${showEditStaff.staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });
      if (!res.ok) throw new Error();
      setShowEditStaff({ open: false, staff: null });
      setFeedback('Staff updated.');
      setStaffForm({ name: '', role: '', skill: 50, hiredDate: '' });
      await loadStaff();
    } catch {
      setFeedback('Error updating staff.');
    }
  };
  const handleDeleteStaff = async () => {
    if (!jongTeam || !showDeleteStaff.staff) return;
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/staff/${showDeleteStaff.staff.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setShowDeleteStaff({ open: false, staff: null });
      setFeedback('Staff deleted.');
      await loadStaff();
    } catch {
      setFeedback('Error deleting staff.');
    }
  };

  // --- Analytics state ---
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const loadAnalytics = async () => {
    if (!jongTeam) return;
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/analytics`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalytics(data);
    } catch {
      setAnalyticsError('Error loading analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // --- Finances state ---
  const [finances, setFinances] = useState<any>(null);
  const [loadingFinances, setLoadingFinances] = useState(false);
  const [showFinances, setShowFinances] = useState(false);
  const [financesError, setFinancesError] = useState('');
  const [editBudgets, setEditBudgets] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ transferBudget: '', wageBudget: '' });

  const loadFinances = async () => {
    if (!jongTeam) return;
    setLoadingFinances(true);
    setFinancesError('');
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/finances`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFinances(data);
      setBudgetForm({ transferBudget: data.transferBudget, wageBudget: data.wageBudget });
    } catch {
      setFinancesError('Error loading finances.');
    } finally {
      setLoadingFinances(false);
    }
  };
  const handleUpdateBudgets = async () => {
    if (!jongTeam) return;
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/finances`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferBudget: Number(budgetForm.transferBudget), wageBudget: Number(budgetForm.wageBudget) })
      });
      if (!res.ok) throw new Error();
      setEditBudgets(false);
      setFeedback('Budgets updated.');
      await loadFinances();
    } catch {
      setFeedback('Error updating budgets.');
    }
  };

  // --- Notifications state ---
  const [notifications, setNotifications] = useState<any>(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const loadNotifications = async () => {
    if (!jongTeam) return;
    setLoadingNotifications(true);
    setNotificationsError('');
    try {
      const res = await fetch(`/api/jong-team/${jongTeam.id}/notifications`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data);
    } catch {
      setNotificationsError('Error loading notifications.');
    } finally {
      setLoadingNotifications(false);
    }
  };

  // --- Help modal state ---
  const [showHelp, setShowHelp] = useState(false);

  if (!open || !parentClub) return null;
  if (showGraduation && currentGrad) {
    const stats = currentGrad.stats ? JSON.parse(currentGrad.stats) : {};
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">🎓 Graduation Decision</h2>
          {/* Pixel art face placeholder */}
          <div className="mb-4">
            <div style={{ width: 96, height: 96, background: '#e0ac69', borderRadius: 8, border: '4px solid #333', margin: '0 auto' }} />
          </div>
          <div className="mb-2 text-lg font-mono">{currentGrad.playerName} (Age {currentGrad.age})</div>
          <div className="mb-4 text-gray-700">Position: {stats.position}</div>
          <div className="mb-4 text-gray-700">Other stats: {Object.entries(stats).filter(([k]) => k !== 'position').map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
          <div className="flex space-x-4 mt-4">
            <button className="px-6 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 text-lg" onClick={() => handleGraduationDecision('accept')}>Yes, Offer Contract</button>
            <button className="px-6 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 text-lg" onClick={() => handleGraduationDecision('reject')}>No, Release</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>✖</button>
        <h2 className="text-2xl font-bold mb-2">🧒 Jong Team: {jongTeam?.name}</h2>
        <div className="mb-4 text-gray-600">Parent Club: <b>{parentClub.name}</b></div>
        {loading ? <div>Loading...</div> : (
          <>
            <h3 className="font-semibold mt-2 mb-1">Jong Squad</h3>
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedJong.length === jongSquad.length && jongSquad.length > 0} onChange={e => e.target.checked ? selectAllJong() : deselectAllJong()} /></th>
                  <th>Name</th><th>Age</th><th>Position</th><th>Move Up</th>
                </tr>
              </thead>
              <tbody>
                {jongSquad.map(player => (
                  <tr key={player.id}>
                    <td><input type="checkbox" checked={selectedJong.includes(player.id)} onChange={() => toggleJong(player.id)} /></td>
                    <td>{player.name}</td>
                    <td>{player.age}</td>
                    <td>{player.position}</td>
                    <td>{(player.age ?? 0) <= 21 && (
                      <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => moveToFirst(player.id)}>⬆️</button>
                    )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4">
              <div>
                Page {jongPage} of {jongTotalPages} ({jongTotalPlayers} players)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                  onClick={() => setJongPage(jongPage - 1)}
                  disabled={jongPage === 1}
                >Prev</button>
                <button
                  className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                  onClick={() => setJongPage(jongPage + 1)}
                  disabled={jongPage === jongTotalPages}
                >Next</button>
                <select value={jongPageSize} onChange={e => { setJongPageSize(Number(e.target.value)); setJongPage(1); }} className="ml-2 p-1 bg-gray-700 rounded">
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size} / page</option>
                  ))}
                </select>
              </div>
            </div>
            <h3 className="font-semibold mt-2 mb-1">First Squad (U21 only)</h3>
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedFirst.length === firstSquad.filter(p => (p.age ?? 0) <= 21).length && firstSquad.filter(p => (p.age ?? 0) <= 21).length > 0} onChange={e => e.target.checked ? selectAllFirst() : deselectAllFirst()} /></th>
                  <th>Name</th><th>Age</th><th>Position</th><th>Move Down</th>
                </tr>
              </thead>
              <tbody>
                {firstSquad.filter(p => (p.age ?? 0) <= 21).map(player => (
                  <tr key={player.id}>
                    <td><input type="checkbox" checked={selectedFirst.includes(player.id)} onChange={() => toggleFirst(player.id)} /></td>
                    <td>{player.name}</td>
                    <td>{player.age}</td>
                    <td>{player.position}</td>
                    <td><button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => moveToJong(player.id)}>⬇️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4">
              <div>
                Page {firstPage} of {firstTotalPages} ({firstTotalPlayers} players)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                  onClick={() => setFirstPage(firstPage - 1)}
                  disabled={firstPage === 1}
                >Prev</button>
                <button
                  className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                  onClick={() => setFirstPage(firstPage + 1)}
                  disabled={firstPage === firstTotalPages}
                >Next</button>
                <select value={firstPageSize} onChange={e => { setFirstPageSize(Number(e.target.value)); setFirstPage(1); }} className="ml-2 p-1 bg-gray-700 rounded">
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size} / page</option>
                  ))}
                </select>
              </div>
            </div>
            <h3 className="font-semibold mt-2 mb-1">Jong Team League Table</h3>
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th>Pos</th><th>Club</th><th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {leagueTable.map((row: any, i: number) => (
                  <tr key={row.clubId} className={row.clubId === jongTeam?.id ? 'font-bold bg-yellow-100' : ''}>
                    <td>{i + 1}</td>
                    <td>{row.clubName}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="font-semibold mt-2 mb-1">Fixtures</h3>
            <ul className="mb-2">
              {fixtures.map((fx: any) => (
                <li key={fx.id}>{fx.date}: {fx.homeClub} vs {fx.awayClub} ({fx.homeGoals ?? '-'} - {fx.awayGoals ?? '-'})</li>
              ))}
            </ul>
            {isAdmin && !jongTeam && (
              <button onClick={() => setShowCreate(true)} className="btn btn-primary">Create Jong Team</button>
            )}
            {isAdmin && jongTeam && (
              <>
                <button onClick={() => { setJongName(jongTeam.name); setJongLeagueId(jongTeam.leagueId || ''); setShowEdit(true); }} className="btn btn-secondary">Edit Jong Team</button>
                <button onClick={() => setShowDelete(true)} className="btn btn-danger ml-2">Delete Jong Team</button>
              </>
            )}
            {isAdmin && (
              <div className="flex space-x-2 my-2">
                <button className="btn btn-blue" onClick={bulkMoveToFirst} disabled={selectedJong.length === 0}>Move Selected to First Team</button>
                <button className="btn btn-yellow" onClick={bulkMoveToJong} disabled={selectedFirst.length === 0}>Move Selected to Jong Team</button>
                <button className="btn btn-green" onClick={autoPromote}>Auto-Promote Eligible</button>
                <button className="btn btn-orange" onClick={autoDemote}>Auto-Demote Eligible</button>
              </div>
            )}
            {isAdmin && (
              <button className="btn btn-help mb-2 ml-2" title="Show help for Jong Team management" onClick={() => setShowHelp(true)}>
                ? Help
              </button>
            )}
            {showHelp && (
              <div className="modal">
                <div className="modal-content max-w-xl">
                  <h3 className="font-bold text-lg mb-2">Jong Team Management Help</h3>
                  <ul className="list-disc pl-6 text-sm mb-2">
                    <li><b>Squad Management:</b> Move players between Jong and First team. Use checkboxes for bulk actions. <span title="Bulk move lets you select multiple players and move them at once.">ℹ️</span></li>
                    <li><b>Auto-Promotion/Demotion:</b> Automatically promote or demote eligible players based on age/skill. <span title="Auto-promotion moves all eligible players to the first team.">ℹ️</span></li>
                    <li><b>Staff Management:</b> Add, edit, or remove staff for the Jong team. <span title="Staff impact player development and match results.">ℹ️</span></li>
                    <li><b>Analytics:</b> View player development, staff impact, and squad performance trends. <span title="Analytics help you track progress and identify strengths/weaknesses.">ℹ️</span></li>
                    <li><b>Finances:</b> View and edit Jong team budgets, see wage/transfer impact on parent club. <span title="Budgets control how much you can spend on players and staff.">ℹ️</span></li>
                    <li><b>Notifications:</b> Alerts for players eligible for promotion, expiring contracts, and injuries. <span title="Stay on top of key events for your Jong team.">ℹ️</span></li>
                    <li><b>Permissions:</b> Only admins can use advanced controls. <span title="In the future, this will use real user roles.">ℹ️</span></li>
                  </ul>
                  <button className="btn btn-secondary mt-2" onClick={() => setShowHelp(false)}>Close</button>
                </div>
              </div>
            )}
            {isAdmin && jongTeam && (
              <div className="my-4">
                <h3 className="font-semibold mb-2">Jong Team Staff</h3>
                {loadingStaff ? <div>Loading staff...</div> : (
                  <>
                    <table className="w-full mb-2">
                      <thead>
                        <tr><th>Name</th><th>Role</th><th>Skill</th><th>Hired</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {staff.map(s => (
                          <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{s.role}</td>
                            <td>{s.skill}</td>
                            <td>{s.hiredDate?.slice(0,10)}</td>
                            <td>
                              <button className="btn btn-secondary btn-xs" onClick={() => { setStaffForm({ name: s.name, role: s.role, skill: s.skill, hiredDate: s.hiredDate?.slice(0,10) }); setShowEditStaff({ open: true, staff: s }); }}>Edit</button>
                              <button className="btn btn-danger btn-xs ml-2" onClick={() => setShowDeleteStaff({ open: true, staff: s })}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button className="btn btn-primary" onClick={() => { setStaffForm({ name: '', role: '', skill: 50, hiredDate: '' }); setShowAddStaff(true); }}>Add Staff</button>
                  </>
                )}
                {/* Add Staff Modal */}
                {showAddStaff && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Add Staff</h3>
                      <input value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                      <input value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} placeholder="Role" />
                      <input type="number" value={staffForm.skill} onChange={e => setStaffForm(f => ({ ...f, skill: Number(e.target.value) }))} placeholder="Skill" min={1} max={100} />
                      <input type="date" value={staffForm.hiredDate} onChange={e => setStaffForm(f => ({ ...f, hiredDate: e.target.value }))} placeholder="Hired Date" />
                      <button onClick={handleAddStaff}>Add</button>
                      <button onClick={() => setShowAddStaff(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                {/* Edit Staff Modal */}
                {showEditStaff.open && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Edit Staff</h3>
                      <input value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                      <input value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))} placeholder="Role" />
                      <input type="number" value={staffForm.skill} onChange={e => setStaffForm(f => ({ ...f, skill: Number(e.target.value) }))} placeholder="Skill" min={1} max={100} />
                      <input type="date" value={staffForm.hiredDate} onChange={e => setStaffForm(f => ({ ...f, hiredDate: e.target.value }))} placeholder="Hired Date" />
                      <button onClick={handleEditStaff}>Save</button>
                      <button onClick={() => setShowEditStaff({ open: false, staff: null })}>Cancel</button>
                    </div>
                  </div>
                )}
                {/* Delete Staff Modal */}
                {showDeleteStaff.open && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Delete Staff?</h3>
                      <p>Are you sure you want to delete {showDeleteStaff.staff?.name}?</p>
                      <button onClick={handleDeleteStaff} className="btn btn-danger">Delete</button>
                      <button onClick={() => setShowDeleteStaff({ open: false, staff: null })}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isAdmin && jongTeam && (
              <button className="btn btn-info mb-2" onClick={() => { setShowAnalytics(v => !v); if (!analytics && !loadingAnalytics) loadAnalytics(); }}>
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
            )}
            {showAnalytics && (
              <div className="my-4 p-4 bg-gray-100 rounded shadow">
                <h3 className="font-semibold mb-2">Jong Team Analytics</h3>
                {loadingAnalytics ? <div>Loading analytics...</div> : analyticsError ? <div className="text-red-600">{analyticsError}</div> : analytics && (
                  <>
                    <h4 className="font-semibold mt-2">Player Development</h4>
                    <table className="w-full mb-2">
                      <thead><tr><th>Name</th><th>Skill</th><th>Morale</th></tr></thead>
                      <tbody>
                        {analytics.playerDevelopment.map((p: any) => (
                          <tr key={p.id}><td>{p.name}</td><td>{p.skill}</td><td>{p.morale}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <h4 className="font-semibold mt-2">Staff Impact</h4>
                    <table className="w-full mb-2">
                      <thead><tr><th>Role</th><th>Avg Skill</th></tr></thead>
                      <tbody>
                        {analytics.staffImpact.map((s: any) => (
                          <tr key={s.role}><td>{s.role}</td><td>{s.avgSkill.toFixed(1)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <h4 className="font-semibold mt-2">Squad Performance</h4>
                    <div className="mb-2">Wins: {analytics.squadPerformance.wins}, Draws: {analytics.squadPerformance.draws}, Losses: {analytics.squadPerformance.losses}</div>
                    <div className="mb-2">Goals For: {analytics.squadPerformance.goalsFor}, Goals Against: {analytics.squadPerformance.goalsAgainst}</div>
                    <h5 className="font-semibold">League Position Trend</h5>
                    <div className="overflow-x-auto">
                      <svg width={Math.max(analytics.squadPerformance.leagueTrend.length * 30, 200)} height="100">
                        {analytics.squadPerformance.leagueTrend.map((pt: any, i: number, arr: any[]) => (
                          i < arr.length - 1 ? (
                            <line key={i} x1={i*30+15} y1={pt.position*10} x2={(i+1)*30+15} y2={arr[i+1].position*10} stroke="#4ecdc4" strokeWidth="2" />
                          ) : null
                        ))}
                        {analytics.squadPerformance.leagueTrend.map((pt: any, i: number) => (
                          <circle key={i} cx={i*30+15} cy={pt.position*10} r="4" fill="#ff6b6b" />
                        ))}
                        {analytics.squadPerformance.leagueTrend.map((pt: any, i: number) => (
                          <text key={i} x={i*30+10} y={pt.position*10-8} fontSize="10">{pt.position}</text>
                        ))}
                      </svg>
                    </div>
                  </>
                )}
              </div>
            )}
            {isAdmin && jongTeam && (
              <button className="btn btn-info mb-2 ml-2" onClick={() => { setShowFinances(v => !v); if (!finances && !loadingFinances) loadFinances(); }}>
                {showFinances ? 'Hide Finances' : 'Show Finances'}
              </button>
            )}
            {showFinances && (
              <div className="my-4 p-4 bg-gray-100 rounded shadow">
                <h3 className="font-semibold mb-2">Jong Team Finances</h3>
                {loadingFinances ? <div>Loading finances...</div> : financesError ? <div className="text-red-600">{financesError}</div> : finances && (
                  <>
                    <div className="mb-2">Player Wages: <b>€{finances.playerWages.toLocaleString()}</b></div>
                    <div className="mb-2">Staff Wages: <b>€{finances.staffWages.toLocaleString()}</b></div>
                    <div className="mb-2">Transfer Budget: <b>€{finances.transferBudget.toLocaleString()}</b></div>
                    <div className="mb-2">Wage Budget: <b>€{finances.wageBudget.toLocaleString()}</b></div>
                    {finances.parentClubImpact && (
                      <div className="mb-2 text-sm text-gray-700">Parent Club: Balance €{finances.parentClubImpact.balance.toLocaleString()}, Wage Budget €{finances.parentClubImpact.wageBudget.toLocaleString()}, Transfer Budget €{finances.parentClubImpact.transferBudget.toLocaleString()}</div>
                    )}
                    {editBudgets ? (
                      <div className="my-2">
                        <input type="number" value={budgetForm.transferBudget} onChange={e => setBudgetForm(f => ({ ...f, transferBudget: e.target.value }))} placeholder="Transfer Budget" />
                        <input type="number" value={budgetForm.wageBudget} onChange={e => setBudgetForm(f => ({ ...f, wageBudget: e.target.value }))} placeholder="Wage Budget" />
                        <button className="btn btn-green ml-2" onClick={handleUpdateBudgets}>Save</button>
                        <button className="btn btn-secondary ml-2" onClick={() => setEditBudgets(false)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={() => setEditBudgets(true)}>Edit Budgets</button>
                    )}
                  </>
                )}
              </div>
            )}
            {isAdmin && jongTeam && (
              <button className="btn btn-info mb-2 ml-2" onClick={() => { setShowNotifications(v => !v); if (!notifications && !loadingNotifications) loadNotifications(); }}>
                {showNotifications ? 'Hide Notifications' : 'Show Notifications'}
              </button>
            )}
            {showNotifications && (
              <div className="my-4 p-4 bg-yellow-50 rounded shadow">
                <h3 className="font-semibold mb-2">Jong Team Notifications</h3>
                {loadingNotifications ? <div>Loading notifications...</div> : notificationsError ? <div className="text-red-600">{notificationsError}</div> : notifications && (
                  <>
                    <h4 className="font-semibold mt-2">Players Eligible for Promotion</h4>
                    {notifications.eligiblePlayers.length === 0 ? <div className="text-gray-500">None</div> : (
                      <ul className="mb-2">{notifications.eligiblePlayers.map((p: any) => <li key={p.id}>{p.name} (Age {p.age}, Skill {p.skill})</li>)}</ul>
                    )}
                    <h4 className="font-semibold mt-2">Player Contracts Expiring Soon</h4>
                    {notifications.expiringPlayers.length === 0 ? <div className="text-gray-500">None</div> : (
                      <ul className="mb-2">{notifications.expiringPlayers.map((p: any) => <li key={p.id}>{p.name} (Expires {p.contractExpiry?.slice(0,10)})</li>)}</ul>
                    )}
                    <h4 className="font-semibold mt-2">Staff Contracts Expiring Soon</h4>
                    {notifications.expiringStaff.length === 0 ? <div className="text-gray-500">None</div> : (
                      <ul className="mb-2">{notifications.expiringStaff.map((s: any) => <li key={s.id}>{s.name} ({s.role}, Expires {s.contract.endDate?.slice(0,10)})</li>)}</ul>
                    )}
                    <h4 className="font-semibold mt-2">Recent Injuries/Returns</h4>
                    {notifications.recentInjuries.length === 0 ? <div className="text-gray-500">None</div> : (
                      <ul className="mb-2">{notifications.recentInjuries.map((inj: any) => <li key={inj.id}>{inj.player?.name}: {inj.type} ({inj.severity}) {inj.endDate ? `Returned ${inj.endDate.slice(0,10)}` : `Injured ${inj.startDate.slice(0,10)}`}</li>)}</ul>
                    )}
                  </>
                )}
              </div>
            )}
            {feedback && <div className="mt-2 text-green-600">{feedback}</div>}

            {/* Create Modal */}
            {showCreate && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Create Jong Team</h3>
                  <input value={jongName} onChange={e => setJongName(e.target.value)} placeholder="Jong Team Name" />
                  <input value={jongLeagueId} onChange={e => setJongLeagueId(e.target.value)} placeholder="League ID" />
                  <button onClick={handleCreateJongTeam}>Create</button>
                  <button onClick={() => setShowCreate(false)}>Cancel</button>
                </div>
              </div>
            )}
            {/* Edit Modal */}
            {showEdit && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Edit Jong Team</h3>
                  <input value={jongName} onChange={e => setJongName(e.target.value)} placeholder="Jong Team Name" />
                  <input value={jongLeagueId} onChange={e => setJongLeagueId(e.target.value)} placeholder="League ID" />
                  <button onClick={handleEditJongTeam}>Save</button>
                  <button onClick={() => setShowEdit(false)}>Cancel</button>
                </div>
              </div>
            )}
            {/* Delete Modal */}
            {showDelete && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Delete Jong Team?</h3>
                  <p>This will remove the Jong team and all its players will be unassigned.</p>
                  <button onClick={handleDeleteJongTeam} className="btn btn-danger">Delete</button>
                  <button onClick={() => setShowDelete(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Minimal CSS for tooltips */}
      <style>{`
        .tooltip-wrapper { position: relative; display: inline-block; }
        .tooltip-wrapper .tooltip-text {
          visibility: hidden;
          width: 260px;
          background-color: #333;
          color: #fff;
          text-align: left;
          border-radius: 6px;
          padding: 8px;
          position: absolute;
          z-index: 10;
          bottom: 125%;
          left: 50%;
          margin-left: -130px;
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 0.95rem;
        }
        .tooltip-wrapper:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default JongTeamManagement; 