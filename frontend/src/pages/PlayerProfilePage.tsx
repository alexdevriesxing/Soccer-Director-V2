import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlayerContractPanel from '../components/PlayerContractPanel';
import ContractNegotiationModal from '../components/ContractNegotiationModal';
import ManagerActionModal from '../components/ManagerActionModal';
import { getContract, offerContract, acceptContract, rejectContract, counterContract, getMoralePsychology, managerAction, getMoraleLog, getPlayerPositions, addOrUpdatePlayerPosition, deletePlayerPosition, getPlayerAwards, getPlayerCareerStats, getPlayerInjuries, getPlayerTransfers, addPlayerAward, addPlayerInjury, addPlayerCareerStat, deletePlayerAward, deletePlayerInjury, deletePlayerCareerStat, editPlayerAward, editPlayerInjury, editPlayerCareerStat } from '../api/playerApi';
import { getClubs } from '../api/clubApi';

const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [morale, setMorale] = useState<number | null>(null);
  const [psychology, setPsychology] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<any>(null);
  const [moraleLog, setMoraleLog] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [posLoading, setPosLoading] = useState(true);
  const [posError, setPosError] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState('');
  const [newProficiency, setNewProficiency] = useState<number>(50);
  const [posSubmitting, setPosSubmitting] = useState(false);
  const [awards, setAwards] = useState<any[]>([]);
  const [awardsLoading, setAwardsLoading] = useState(true);
  const [awardsError, setAwardsError] = useState<string | null>(null);
  const [careerStats, setCareerStats] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [injuriesLoading, setInjuriesLoading] = useState(true);
  const [injuriesError, setInjuriesError] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [transfersError, setTransfersError] = useState<string | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState<string | null>(null);

  // Awards form state
  const [awardForm, setAwardForm] = useState({ awardName: '', season: '', description: '' });
  const [awardSubmitting, setAwardSubmitting] = useState(false);
  const [awardFormError, setAwardFormError] = useState<string | null>(null);
  // Injuries form state
  const [injuryForm, setInjuryForm] = useState({ type: '', severity: '', startDate: '', endDate: '', description: '' });
  const [injurySubmitting, setInjurySubmitting] = useState(false);
  const [injuryFormError, setInjuryFormError] = useState<string | null>(null);
  // Career stat form state
  const [statForm, setStatForm] = useState({ season: '', clubId: '', appearances: '', goals: '', assists: '', yellowCards: '', redCards: '', avgRating: '' });
  const [statSubmitting, setStatSubmitting] = useState(false);
  const [statFormError, setStatFormError] = useState<string | null>(null);

  // Add error state for deletes
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit state for awards, injuries, stats
  const [editingAwardId, setEditingAwardId] = useState<number | null>(null);
  const [editingAwardForm, setEditingAwardForm] = useState({ awardName: '', season: '', description: '' });
  const [editingInjuryId, setEditingInjuryId] = useState<number | null>(null);
  const [editingInjuryForm, setEditingInjuryForm] = useState({ type: '', severity: '', startDate: '', endDate: '', description: '' });
  const [editingStatId, setEditingStatId] = useState<number | null>(null);
  const [editingStatForm, setEditingStatForm] = useState({ season: '', clubId: '', appearances: '', goals: '', assists: '', yellowCards: '', redCards: '', avgRating: '' });

  // Hardcoded admin flag for access control (replace with real auth as needed)
  const isAdmin = true;

  // Add state for feedback messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function fetchPlayer() {
      setLoading(true);
      setError(null);
      try {
        const data = await getContract(Number(id));
        setPlayer(data);
        // Find pending offer in contractHistory
        if (data.contractHistory && Array.isArray(data.contractHistory)) {
          const pending = data.contractHistory.find((entry: any) => entry.status === 'pending');
          setPendingOffer(pending?.offer || null);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [id]);

  useEffect(() => {
    async function fetchMoralePsychology() {
      try {
        const data = await getMoralePsychology(Number(id));
        setMorale(data.morale);
        setPsychology(data.psychology);
      } catch (e: any) {
        // ignore for now
      }
    }
    fetchMoralePsychology();
  }, [id]);

  useEffect(() => {
    async function fetchMoraleLog() {
      try {
        const logs = await getMoraleLog(Number(id));
        setMoraleLog(logs);
      } catch (e: any) {
        // ignore for now
      }
    }
    fetchMoraleLog();
  }, [id]);

  useEffect(() => {
    async function fetchPositions() {
      setPosLoading(true);
      setPosError(null);
      try {
        const res = await getPlayerPositions(Number(id));
        setPositions(res.data);
      } catch (e: any) {
        setPosError(e.message);
      } finally {
        setPosLoading(false);
      }
    }
    fetchPositions();
  }, [id]);

  useEffect(() => {
    async function fetchAwards() {
      setAwardsLoading(true);
      setAwardsError(null);
      try {
        const data = await getPlayerAwards(Number(id));
        setAwards(data);
      } catch (e: any) {
        setAwardsError(e.message);
      } finally {
        setAwardsLoading(false);
      }
    }
    async function fetchCareerStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await getPlayerCareerStats(Number(id));
        setCareerStats(data);
      } catch (e: any) {
        setStatsError(e.message);
      } finally {
        setStatsLoading(false);
      }
    }
    async function fetchInjuries() {
      setInjuriesLoading(true);
      setInjuriesError(null);
      try {
        const data = await getPlayerInjuries(Number(id));
        setInjuries(data);
      } catch (e: any) {
        setInjuriesError(e.message);
      } finally {
        setInjuriesLoading(false);
      }
    }
    async function fetchTransfers() {
      setTransfersLoading(true);
      setTransfersError(null);
      try {
        const data = await getPlayerTransfers(Number(id));
        setTransfers(data);
      } catch (e: any) {
        setTransfersError(e.message);
      } finally {
        setTransfersLoading(false);
      }
    }
    async function fetchClubs() {
      setClubsLoading(true);
      setClubsError(null);
      try {
        const res = await getClubs();
        setClubs(res.data || res);
      } catch (e: any) {
        setClubsError(e.message);
      } finally {
        setClubsLoading(false);
      }
    }
    fetchAwards();
    fetchCareerStats();
    fetchInjuries();
    fetchTransfers();
    fetchClubs();
  }, [id]);

  const handleOpenNegotiation = () => setModalOpen(true);
  const handleCloseNegotiation = () => setModalOpen(false);

  const handleOffer = async (offer: any) => {
    try {
      await offerContract(Number(id), offer);
      setModalOpen(false);
      // Refresh player data
      const data = await getContract(Number(id));
      setPlayer(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptContract(Number(id));
      setModalOpen(false);
      const data = await getContract(Number(id));
      setPlayer(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectContract(Number(id));
      setModalOpen(false);
      const data = await getContract(Number(id));
      setPlayer(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCounter = async (offer: any) => {
    try {
      await counterContract(Number(id), offer);
      setModalOpen(false);
      const data = await getContract(Number(id));
      setPlayer(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleManagerAction = async (action: string) => {
    setActionLoading(true);
    setActionResult(null);
    try {
      const result = await managerAction(Number(id), action);
      setActionResult(result);
      // Refresh morale/psychology
      const data = await getMoralePsychology(Number(id));
      setMorale(data.morale);
      setPsychology(data.psychology);
    } catch (e: any) {
      setActionResult({ message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddOrUpdatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosSubmitting(true);
    setPosError(null);
    try {
      await addOrUpdatePlayerPosition(Number(id), { position: newPosition, proficiency: newProficiency });
      const res = await getPlayerPositions(Number(id));
      setPositions(res.data);
      setNewPosition('');
      setNewProficiency(50);
      setFeedback({ type: 'success', message: 'Position updated!' });
    } catch (e: any) {
      setPosError(e.message);
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setPosSubmitting(false);
    }
  };

  const handleDeletePosition = async (position: string) => {
    setPosSubmitting(true);
    setPosError(null);
    try {
      await deletePlayerPosition(Number(id), position);
      const res = await getPlayerPositions(Number(id));
      setPositions(res.data);
      setFeedback({ type: 'success', message: 'Position deleted!' });
    } catch (e: any) {
      setPosError(e.message);
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setPosSubmitting(false);
    }
  };

  // Awards add handler
  const handleAddAward = async (e: React.FormEvent) => {
    e.preventDefault();
    setAwardSubmitting(true);
    setAwardFormError(null);
    try {
      await addPlayerAward(Number(id), { awardName: awardForm.awardName, season: awardForm.season, description: awardForm.description });
      setAwardForm({ awardName: '', season: '', description: '' });
      // Refresh awards
      const data = await getPlayerAwards(Number(id));
      setAwards(data);
      setFeedback({ type: 'success', message: 'Award added!' });
    } catch (err: any) {
      setAwardFormError(err.message);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setAwardSubmitting(false);
    }
  };
  // Injuries add handler
  const handleAddInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    setInjurySubmitting(true);
    setInjuryFormError(null);
    try {
      await addPlayerInjury(Number(id), { ...injuryForm, startDate: injuryForm.startDate, endDate: injuryForm.endDate || undefined });
      setInjuryForm({ type: '', severity: '', startDate: '', endDate: '', description: '' });
      // Refresh injuries
      const data = await getPlayerInjuries(Number(id));
      setInjuries(data);
      setFeedback({ type: 'success', message: 'Injury added!' });
    } catch (err: any) {
      setInjuryFormError(err.message);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setInjurySubmitting(false);
    }
  };
  // Career stat add handler
  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatSubmitting(true);
    setStatFormError(null);
    try {
      await addPlayerCareerStat(Number(id), {
        season: statForm.season,
        clubId: Number(statForm.clubId),
        appearances: statForm.appearances ? Number(statForm.appearances) : 0,
        goals: statForm.goals ? Number(statForm.goals) : 0,
        assists: statForm.assists ? Number(statForm.assists) : 0,
        yellowCards: statForm.yellowCards ? Number(statForm.yellowCards) : 0,
        redCards: statForm.redCards ? Number(statForm.redCards) : 0,
        avgRating: statForm.avgRating ? Number(statForm.avgRating) : undefined
      });
      setStatForm({ season: '', clubId: '', appearances: '', goals: '', assists: '', yellowCards: '', redCards: '', avgRating: '' });
      // Refresh stats
      const data = await getPlayerCareerStats(Number(id));
      setCareerStats(data);
      setFeedback({ type: 'success', message: 'Career stat added!' });
    } catch (err: any) {
      setStatFormError(err.message);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setStatSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteAward = async (awardId: number) => {
    if (!window.confirm('Delete this award?')) return;
    setDeleteError(null);
    try {
      await deletePlayerAward(Number(id), awardId);
      const data = await getPlayerAwards(Number(id));
      setAwards(data);
      setFeedback({ type: 'success', message: 'Award deleted!' });
    } catch (err: any) {
      setDeleteError(err.message);
      setFeedback({ type: 'error', message: err.message });
    }
  };
  const handleDeleteInjury = async (injuryId: number) => {
    if (!window.confirm('Delete this injury?')) return;
    setDeleteError(null);
    try {
      await deletePlayerInjury(Number(id), injuryId);
      const data = await getPlayerInjuries(Number(id));
      setInjuries(data);
      setFeedback({ type: 'success', message: 'Injury deleted!' });
    } catch (err: any) {
      setDeleteError(err.message);
      setFeedback({ type: 'error', message: err.message });
    }
  };
  const handleDeleteStat = async (statId: number) => {
    if (!window.confirm('Delete this career stat?')) return;
    setDeleteError(null);
    try {
      await deletePlayerCareerStat(Number(id), statId);
      const data = await getPlayerCareerStats(Number(id));
      setCareerStats(data);
      setFeedback({ type: 'success', message: 'Career stat deleted!' });
    } catch (err: any) {
      setDeleteError(err.message);
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Edit handlers
  const startEditAward = (award: any) => {
    setEditingAwardId(award.id);
    setEditingAwardForm({ awardName: award.awardName, season: award.season, description: award.description || '' });
  };
  const cancelEditAward = () => {
    setEditingAwardId(null);
    setEditingAwardForm({ awardName: '', season: '', description: '' });
  };
  const handleEditAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAwardId) return;
    setAwardSubmitting(true);
    setAwardFormError(null);
    try {
      await editPlayerAward(Number(id), editingAwardId, editingAwardForm);
      setEditingAwardId(null);
      setEditingAwardForm({ awardName: '', season: '', description: '' });
      const data = await getPlayerAwards(Number(id));
      setAwards(data);
      setFeedback({ type: 'success', message: 'Award updated!' });
    } catch (err: any) {
      setAwardFormError(err.message);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setAwardSubmitting(false);
    }
  };
  const startEditInjury = (inj: any) => {
    setEditingInjuryId(inj.id);
    setEditingInjuryForm({ type: inj.type, severity: inj.severity, startDate: inj.startDate ? inj.startDate.slice(0,10) : '', endDate: inj.endDate ? inj.endDate.slice(0,10) : '', description: inj.description || '' });
  };
  const cancelEditInjury = () => {
    setEditingInjuryId(null);
    setEditingInjuryForm({ type: '', severity: '', startDate: '', endDate: '', description: '' });
  };
  const handleEditInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInjuryId) return;
    setInjurySubmitting(true);
    setInjuryFormError(null);
    try {
      await editPlayerInjury(Number(id), editingInjuryId, editingInjuryForm);
      setEditingInjuryId(null);
      setEditingInjuryForm({ type: '', severity: '', startDate: '', endDate: '', description: '' });
      const data = await getPlayerInjuries(Number(id));
      setInjuries(data);
      setFeedback({ type: 'success', message: 'Injury updated!' });
    } catch (err: any) {
      setInjuryFormError(err.message);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setInjurySubmitting(false);
    }
  };
  const startEditStat = (stat: any) => {
    setEditingStatId(stat.id);
    setEditingStatForm({
      season: stat.season,
      clubId: stat.clubId ? String(stat.clubId) : '',
      appearances: stat.appearances?.toString() || '',
      goals: stat.goals?.toString() || '',
      assists: stat.assists?.toString() || '',
      yellowCards: stat.yellowCards?.toString() || '',
      redCards: stat.redCards?.toString() || '',
      avgRating: stat.avgRating !== undefined && stat.avgRating !== null ? stat.avgRating.toString() : ''
    });
  };
  const cancelEditStat = () => {
    setEditingStatId(null);
    setEditingStatForm({ season: '', clubId: '', appearances: '', goals: '', assists: '', yellowCards: '', redCards: '', avgRating: '' });
  };
  const handleEditStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatId) return;
    setStatSubmitting(true);
    setStatFormError(null);
    try {
      await editPlayerCareerStat(Number(id), editingStatId, {
        season: editingStatForm.season,
        clubId: Number(editingStatForm.clubId),
        appearances: editingStatForm.appearances ? Number(editingStatForm.appearances) : 0,
        goals: editingStatForm.goals ? Number(editingStatForm.goals) : 0,
        assists: editingStatForm.assists ? Number(editingStatForm.assists) : 0,
        yellowCards: editingStatForm.yellowCards ? Number(editingStatForm.yellowCards) : 0,
        redCards: editingStatForm.redCards ? Number(editingStatForm.redCards) : 0,
        avgRating: editingStatForm.avgRating ? Number(editingStatForm.avgRating) : undefined
      });
      setEditingStatId(null);
      setEditingStatForm({ season: '', clubId: '', appearances: '', goals: '', assists: '', yellowCards: '', redCards: '', avgRating: '' });
      const data = await getPlayerCareerStats(Number(id));
      setCareerStats(data);
      setFeedback({ type: 'success', message: 'Career stat updated!' });
    } catch (err: any) {
      setStatFormError(err.message);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setStatSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!player) return <div>Player not found.</div>;

  // Add icon/color for each event type
  const eventTypeInfo: Record<string, { icon: string; color: string; label: string }> = {
    skill: { icon: '⭐', color: '#4caf50', label: 'Skill' },
    age: { icon: '🎂', color: '#2196f3', label: 'Age' },
    retirement: { icon: '🏁', color: '#f44336', label: 'Retirement' },
    morale: { icon: '😊', color: '#ff9800', label: 'Morale' },
    psychology: { icon: '🧠', color: '#9c27b0', label: 'Psychology' },
  };

  return (
    <div>
      <h1>{player.name}</h1>
      {/* Morale & Psychology */}
      <div style={{margin: '16px 0'}}>
        <h2>Morale & Psychology</h2>
        <div>Morale: {morale !== null ? <progress value={morale} max={100} style={{width: 200}} /> : '-'} {morale}</div>
        {psychology && (
          <table style={{marginTop: 8}}>
            <tbody>
              <tr><td>Homesickness</td><td>{psychology.homesickness}</td></tr>
              <tr><td>Pressure Handling</td><td>{psychology.pressureHandling}</td></tr>
              <tr><td>Leadership</td><td>{psychology.leadership}</td></tr>
              <tr><td>Ambition</td><td>{psychology.ambition}</td></tr>
              <tr><td>Adaptability</td><td>{psychology.adaptability}</td></tr>
            </tbody>
          </table>
        )}
        <button style={{marginTop: 8}} onClick={() => { setActionModalOpen(true); setActionResult(null); }}>Manager Action</button>
      </div>
      {/* Player Positions Panel */}
      <div style={{margin: '16px 0'}}>
        <h2>Player Positions & Versatility</h2>
        {posLoading ? (
          <div>Loading positions...</div>
        ) : posError ? (
          <div style={{color: 'red'}}>{posError}</div>
        ) : (
          <>
            <table style={{marginBottom: 8}}>
              <thead>
                <tr><th>Position</th><th>Proficiency</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr><td colSpan={3}>No positions set.</td></tr>
                ) : positions.map((pos: any) => (
                  <tr key={pos.position}>
                    <td>{pos.position}</td>
                    <td>{pos.proficiency}</td>
                    <td><button onClick={() => handleDeletePosition(pos.position)} disabled={posSubmitting}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isAdmin && (
              <form onSubmit={handleAddOrUpdatePosition} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <input type="text" placeholder="Position (e.g. DEF, MID)" value={newPosition} onChange={e => setNewPosition(e.target.value)} required style={{width: 80}} />
                <input type="number" min={0} max={100} value={newProficiency} onChange={e => setNewProficiency(Number(e.target.value))} required style={{width: 60}} />
                <button type="submit" disabled={posSubmitting}>{posSubmitting ? 'Saving...' : 'Add/Update'}</button>
              </form>
            )}
          </>
        )}
      </div>
      {/* Player Awards Panel */}
      <div style={{margin: '16px 0'}}>
        <h2>Player Awards</h2>
        {awardsLoading ? (
          <div>Loading awards...</div>
        ) : awardsError ? (
          <div style={{color: 'red'}}>{awardsError}</div>
        ) : (
          <>
            {isAdmin && (
              <form onSubmit={handleAddAward} style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                <input type="text" placeholder="Award Name" value={awardForm.awardName} onChange={e => setAwardForm(f => ({...f, awardName: e.target.value}))} required style={{width: 120}} />
                <input type="text" placeholder="Season" value={awardForm.season} onChange={e => setAwardForm(f => ({...f, season: e.target.value}))} required style={{width: 80}} />
                <input type="text" placeholder="Description" value={awardForm.description} onChange={e => setAwardForm(f => ({...f, description: e.target.value}))} style={{width: 160}} />
                <button type="submit" disabled={awardSubmitting}>{awardSubmitting ? 'Adding...' : 'Add Award'}</button>
                {awardFormError && <span style={{color: 'red'}}>{awardFormError}</span>}
              </form>
            )}
            <table>
              <thead>
                <tr><th>Season</th><th>Award</th><th>Description</th></tr>
              </thead>
              <tbody>
                {awards.map((award: any) => (
                  editingAwardId === award.id ? (
                    <tr key={award.id}>
                      <td colSpan={4}>
                        <form onSubmit={handleEditAward} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                          <input type="text" value={editingAwardForm.awardName} onChange={e => setEditingAwardForm(f => ({...f, awardName: e.target.value}))} required style={{width: 120}} />
                          <input type="text" value={editingAwardForm.season} onChange={e => setEditingAwardForm(f => ({...f, season: e.target.value}))} required style={{width: 80}} />
                          <input type="text" value={editingAwardForm.description} onChange={e => setEditingAwardForm(f => ({...f, description: e.target.value}))} style={{width: 160}} />
                          <button type="submit" disabled={awardSubmitting}>Save</button>
                          <button type="button" onClick={cancelEditAward}>Cancel</button>
                        </form>
                        {awardFormError && <span style={{color: 'red'}}>{awardFormError}</span>}
                      </td>
                    </tr>
                  ) : (
                    <tr key={award.id}>
                      <td>{award.season}</td>
                      <td>{award.awardName}</td>
                      <td>{award.description || '-'}</td>
                      <td><button onClick={() => startEditAward(award)} title="Edit" aria-label="Edit">✏️</button> <button onClick={() => handleDeleteAward(award.id)} title="Delete" aria-label="Delete" style={{color: 'red'}}>🗑️</button></td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
            {deleteError && <div style={{color: 'red'}}>{deleteError}</div>}
          </>
        )}
      </div>
      {/* Player Career Stats Panel */}
      <div style={{margin: '16px 0'}}>
        <h2>Career Stats</h2>
        {statsLoading ? (
          <div>Loading career stats...</div>
        ) : statsError ? (
          <div style={{color: 'red'}}>{statsError}</div>
        ) : (
          <>
            {isAdmin && (
              <form onSubmit={handleAddStat} style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                <input type="text" placeholder="Season" value={statForm.season} onChange={e => setStatForm(f => ({...f, season: e.target.value}))} required style={{width: 80}} />
                <select value={statForm.clubId} onChange={e => setStatForm(f => ({...f, clubId: e.target.value}))} required style={{width: 140}}>
                  <option value="">Select Club</option>
                  {clubs.map((club: any) => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
                <input type="number" placeholder="Apps" value={statForm.appearances} onChange={e => setStatForm(f => ({...f, appearances: e.target.value}))} min={0} style={{width: 60}} />
                <input type="number" placeholder="Goals" value={statForm.goals} onChange={e => setStatForm(f => ({...f, goals: e.target.value}))} min={0} style={{width: 60}} />
                <input type="number" placeholder="Assists" value={statForm.assists} onChange={e => setStatForm(f => ({...f, assists: e.target.value}))} min={0} style={{width: 60}} />
                <input type="number" placeholder="Yellow" value={statForm.yellowCards} onChange={e => setStatForm(f => ({...f, yellowCards: e.target.value}))} min={0} style={{width: 60}} />
                <input type="number" placeholder="Red" value={statForm.redCards} onChange={e => setStatForm(f => ({...f, redCards: e.target.value}))} min={0} style={{width: 60}} />
                <input type="number" placeholder="Avg Rating" value={statForm.avgRating} onChange={e => setStatForm(f => ({...f, avgRating: e.target.value}))} min={0} max={10} step={0.01} style={{width: 80}} />
                <button type="submit" disabled={statSubmitting || clubsLoading}>{statSubmitting ? 'Adding...' : 'Add Stat'}</button>
                {statFormError && <span style={{color: 'red'}}>{statFormError}</span>}
              </form>
            )}
            <table>
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Club</th>
                  <th>Apps</th>
                  <th>Goals</th>
                  <th>Assists</th>
                  <th>Yellow</th>
                  <th>Red</th>
                  <th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {careerStats.map((stat: any) => (
                  editingStatId === stat.id ? (
                    <tr key={stat.id}>
                      <td colSpan={9}>
                        <form onSubmit={handleEditStat} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                          <input type="text" value={editingStatForm.season} onChange={e => setEditingStatForm(f => ({...f, season: e.target.value}))} required style={{width: 80}} />
                          <select value={editingStatForm.clubId} onChange={e => setEditingStatForm(f => ({...f, clubId: e.target.value}))} required style={{width: 140}}>
                            <option value="">Select Club</option>
                            {clubs.map((club: any) => (
                              <option key={club.id} value={club.id}>{club.name}</option>
                            ))}
                          </select>
                          <input type="number" value={editingStatForm.appearances} onChange={e => setEditingStatForm(f => ({...f, appearances: e.target.value}))} min={0} style={{width: 60}} />
                          <input type="number" value={editingStatForm.goals} onChange={e => setEditingStatForm(f => ({...f, goals: e.target.value}))} min={0} style={{width: 60}} />
                          <input type="number" value={editingStatForm.assists} onChange={e => setEditingStatForm(f => ({...f, assists: e.target.value}))} min={0} style={{width: 60}} />
                          <input type="number" value={editingStatForm.yellowCards} onChange={e => setEditingStatForm(f => ({...f, yellowCards: e.target.value}))} min={0} style={{width: 60}} />
                          <input type="number" value={editingStatForm.redCards} onChange={e => setEditingStatForm(f => ({...f, redCards: e.target.value}))} min={0} style={{width: 60}} />
                          <input type="number" value={editingStatForm.avgRating} onChange={e => setEditingStatForm(f => ({...f, avgRating: e.target.value}))} min={0} max={10} step={0.01} style={{width: 80}} />
                          <button type="submit" disabled={statSubmitting}>Save</button>
                          <button type="button" onClick={cancelEditStat}>Cancel</button>
                        </form>
                        {statFormError && <span style={{color: 'red'}}>{statFormError}</span>}
                      </td>
                    </tr>
                  ) : (
                    <tr key={stat.id}>
                      <td>{stat.season}</td>
                      <td>{stat.club?.name || '-'}</td>
                      <td>{stat.appearances}</td>
                      <td>{stat.goals}</td>
                      <td>{stat.assists}</td>
                      <td>{stat.yellowCards}</td>
                      <td>{stat.redCards}</td>
                      <td>{stat.avgRating !== undefined && stat.avgRating !== null ? stat.avgRating.toFixed(2) : '-'}</td>
                      <td><button onClick={() => startEditStat(stat)} title="Edit" aria-label="Edit">✏️</button> <button onClick={() => handleDeleteStat(stat.id)} title="Delete" aria-label="Delete" style={{color: 'red'}}>🗑️</button></td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
            {deleteError && <div style={{color: 'red'}}>{deleteError}</div>}
          </>
        )}
      </div>
      {/* Player Injuries Panel */}
      <div style={{margin: '16px 0'}}>
        <h2>Injury History</h2>
        {injuriesLoading ? (
          <div>Loading injuries...</div>
        ) : injuriesError ? (
          <div style={{color: 'red'}}>{injuriesError}</div>
        ) : (
          <>
            {isAdmin && (
              <form onSubmit={handleAddInjury} style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8}}>
                <input type="text" placeholder="Type" value={injuryForm.type} onChange={e => setInjuryForm(f => ({...f, type: e.target.value}))} required style={{width: 100}} />
                <input type="text" placeholder="Severity" value={injuryForm.severity} onChange={e => setInjuryForm(f => ({...f, severity: e.target.value}))} required style={{width: 80}} />
                <input type="date" placeholder="Start Date" value={injuryForm.startDate} onChange={e => setInjuryForm(f => ({...f, startDate: e.target.value}))} required style={{width: 120}} />
                <input type="date" placeholder="End Date" value={injuryForm.endDate} onChange={e => setInjuryForm(f => ({...f, endDate: e.target.value}))} style={{width: 120}} />
                <input type="text" placeholder="Description" value={injuryForm.description} onChange={e => setInjuryForm(f => ({...f, description: e.target.value}))} style={{width: 160}} />
                <button type="submit" disabled={injurySubmitting}>{injurySubmitting ? 'Adding...' : 'Add Injury'}</button>
                {injuryFormError && <span style={{color: 'red'}}>{injuryFormError}</span>}
              </form>
            )}
            <table>
              <thead>
                <tr><th>Type</th><th>Severity</th><th>Start</th><th>End</th><th>Description</th></tr>
              </thead>
              <tbody>
                {injuries.map((inj: any) => (
                  editingInjuryId === inj.id ? (
                    <tr key={inj.id}>
                      <td colSpan={6}>
                        <form onSubmit={handleEditInjury} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                          <input type="text" value={editingInjuryForm.type} onChange={e => setEditingInjuryForm(f => ({...f, type: e.target.value}))} required style={{width: 100}} />
                          <input type="text" value={editingInjuryForm.severity} onChange={e => setEditingInjuryForm(f => ({...f, severity: e.target.value}))} required style={{width: 80}} />
                          <input type="date" value={editingInjuryForm.startDate} onChange={e => setEditingInjuryForm(f => ({...f, startDate: e.target.value}))} required style={{width: 120}} />
                          <input type="date" value={editingInjuryForm.endDate} onChange={e => setEditingInjuryForm(f => ({...f, endDate: e.target.value}))} style={{width: 120}} />
                          <input type="text" value={editingInjuryForm.description} onChange={e => setEditingInjuryForm(f => ({...f, description: e.target.value}))} style={{width: 160}} />
                          <button type="submit" disabled={injurySubmitting}>Save</button>
                          <button type="button" onClick={cancelEditInjury}>Cancel</button>
                        </form>
                        {injuryFormError && <span style={{color: 'red'}}>{injuryFormError}</span>}
                      </td>
                    </tr>
                  ) : (
                    <tr key={inj.id}>
                      <td>{inj.type}</td>
                      <td>{inj.severity}</td>
                      <td>{inj.startDate ? new Date(inj.startDate).toLocaleDateString() : '-'}</td>
                      <td>{inj.endDate ? new Date(inj.endDate).toLocaleDateString() : '-'}</td>
                      <td>{inj.description || '-'}</td>
                      <td><button onClick={() => startEditInjury(inj)} title="Edit" aria-label="Edit">✏️</button> <button onClick={() => handleDeleteInjury(inj.id)} title="Delete" aria-label="Delete" style={{color: 'red'}}>🗑️</button></td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
            {deleteError && <div style={{color: 'red'}}>{deleteError}</div>}
          </>
        )}
      </div>
      {/* Player Transfers Panel */}
      <div style={{margin: '16px 0'}}>
        <h2>Transfer History</h2>
        {transfersLoading ? (
          <div>Loading transfers...</div>
        ) : transfersError ? (
          <div style={{color: 'red'}}>{transfersError}</div>
        ) : transfers.length === 0 ? (
          <div>No transfers recorded.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>From</th><th>To</th><th>Fee</th><th>Status</th></tr>
            </thead>
            <tbody>
              {transfers.map((tr: any) => (
                <tr key={tr.id}>
                  <td>{tr.date ? new Date(tr.date).toLocaleDateString() : '-'}</td>
                  <td>{tr.fromClub?.name || '-'}</td>
                  <td>{tr.toClub?.name || '-'}</td>
                  <td>{tr.fee ? `€${tr.fee.toLocaleString()}` : '-'}</td>
                  <td>{tr.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Morale & Development Log */}
      <div style={{margin: '16px 0'}}>
        <h3>Player Event Log</h3>
        <div style={{marginBottom: 8}}>
          {/* Legend */}
          {Object.entries(eventTypeInfo).map(([type, info]) => (
            <span key={type} style={{marginRight: 16, color: info.color}}>
              {info.icon} {info.label}
            </span>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Change</th>
              <th>Reason</th>
              <th>Old</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            {moraleLog.length === 0 ? (
              <tr><td colSpan={6}>No events logged.</td></tr>
            ) : (
              moraleLog.map((log, idx) => {
                const info = eventTypeInfo[log.type] || { icon: '', color: '#333', label: log.type };
                return (
                  <tr key={idx} style={{color: info.color}}>
                    <td>{new Date(log.date).toLocaleString()}</td>
                    <td>{info.icon} {log.type}</td>
                    <td>{log.change > 0 ? '+' : ''}{log.change}</td>
                    <td>{log.reason}</td>
                    <td>{log.oldValue ?? '-'}</td>
                    <td>{log.newValue ?? '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <ManagerActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onAction={handleManagerAction}
        loading={actionLoading}
        result={actionResult}
      />
      {/* Other player info here */}
      <PlayerContractPanel player={player} onOpenNegotiation={handleOpenNegotiation} />
      <ContractNegotiationModal
        open={modalOpen}
        onClose={handleCloseNegotiation}
        player={{ id: player.id, name: player.name }}
        pendingOffer={pendingOffer}
        onOffer={handleOffer}
        onAccept={handleAccept}
        onReject={handleReject}
        onCounter={handleCounter}
      />
      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
          color: feedback.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          padding: 8,
          marginBottom: 16,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 600
        }}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} aria-label="Dismiss message" style={{marginLeft: 16, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer'}}>×</button>
        </div>
      )}
    </div>
  );
};

export default PlayerProfilePage; 