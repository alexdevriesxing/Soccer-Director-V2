import React, { useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface BoardMember {
  id: number;
  name: string;
  role: string;
  influence: number;
  tenure: number;
}
interface BoardObjective {
  id: number;
  description: string;
  status: string;
  deadline: string;
}
interface BoardMeeting {
  id: number;
  agenda: string;
  date: string;
}
interface BoardDecision {
  id: number;
  description: string;
  outcome: string;
}

const isAdmin = true; // Hardcoded admin flag for demo

const BoardroomPage: React.FC = () => {
  const { profile } = useManagerProfile();
  if (!profile) return null;
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [objectives, setObjectives] = useState<BoardObjective[]>([]);
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [decisions, setDecisions] = useState<BoardDecision[]>([]);
  const [satisfaction, setSatisfaction] = useState<number>(0);
  // Modal state for add/edit
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editMember, setEditMember] = useState<BoardMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberInfluence, setMemberInfluence] = useState(50);
  const [memberTenure, setMemberTenure] = useState(0);
  const [savingMember, setSavingMember] = useState(false);

  // Objective modal state
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [editObjective, setEditObjective] = useState<BoardObjective | null>(null);
  const [objectiveDescription, setObjectiveDescription] = useState('');
  const [objectiveStatus, setObjectiveStatus] = useState('active');
  const [objectiveDeadline, setObjectiveDeadline] = useState('');
  const [savingObjective, setSavingObjective] = useState(false);

  // Meeting modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState<BoardMeeting | null>(null);
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [savingMeeting, setSavingMeeting] = useState(false);

  // Decision modal state
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [editDecision, setEditDecision] = useState<BoardDecision | null>(null);
  const [decisionDescription, setDecisionDescription] = useState('');
  const [decisionOutcome, setDecisionOutcome] = useState('approved');
  const [savingDecision, setSavingDecision] = useState(false);

  useEffect(() => {
    if (!clubId) return;
    // Fetch board members
    fetch(`/api/boardroom/members/${clubId}`)
      .then(res => res.json())
      .then(data => setMembers(data.members || []));
    // Fetch objectives
    fetch(`/api/boardroom/objectives/${members[0]?.id || 1}`)
      .then(res => res.json())
      .then(data => setObjectives(data.objectives || []));
    // Fetch meetings
    fetch(`/api/boardroom/meetings/${clubId}`)
      .then(res => res.json())
      .then(data => setMeetings(data.meetings || []));
    // Fetch decisions (for first meeting as example)
    fetch(`/api/boardroom/decisions/${meetings[0]?.id || 1}`)
      .then(res => res.json())
      .then(data => setDecisions(data.decisions || []));
    // Fetch satisfaction
    fetch(`/api/boardroom/satisfaction/${clubId}`)
      .then(res => res.json())
      .then(data => setSatisfaction(data.satisfaction || 0));
  }, [clubId, members.length, meetings.length]);

  // Handlers for member CRUD
  const openAddMember = () => {
    setEditMember(null);
    setMemberName('');
    setMemberRole('');
    setMemberInfluence(50);
    setMemberTenure(0);
    setShowMemberModal(true);
    setError(null);
  };
  const openEditMember = (m: BoardMember) => {
    setEditMember(m);
    setMemberName(m.name);
    setMemberRole(m.role);
    setMemberInfluence(m.influence);
    setMemberTenure(m.tenure);
    setShowMemberModal(true);
    setError(null);
  };
  const closeMemberModal = () => {
    setShowMemberModal(false);
    setEditMember(null);
    setMemberName('');
    setMemberRole('');
    setMemberInfluence(50);
    setMemberTenure(0);
    setError(null);
  };
  const handleSaveMember = async () => {
    setSavingMember(true);
    setError(null);
    try {
      const method = editMember ? 'PATCH' : 'POST';
      const url = editMember ? `/api/boardroom/member/${editMember.id}` : `/api/boardroom/member`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId, name: memberName, role: memberRole, influence: memberInfluence, tenure: memberTenure })
      });
      if (!res.ok) throw new Error('Failed to save member');
      closeMemberModal();
      // Refresh members
      const data = await fetch(`/api/boardroom/members/${clubId}`).then(r => r.json());
      setMembers(data.members || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingMember(false);
    }
  };
  const handleDeleteMember = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/boardroom/member/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete member');
      // Refresh members
      const data = await fetch(`/api/boardroom/members/${clubId}`).then(r => r.json());
      setMembers(data.members || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  // Objective CRUD handlers
  const openAddObjective = () => {
    setEditObjective(null);
    setObjectiveDescription('');
    setObjectiveStatus('active');
    setObjectiveDeadline('');
    setShowObjectiveModal(true);
    setError(null);
  };
  const openEditObjective = (o: BoardObjective) => {
    setEditObjective(o);
    setObjectiveDescription(o.description);
    setObjectiveStatus(o.status);
    setObjectiveDeadline(o.deadline);
    setShowObjectiveModal(true);
    setError(null);
  };
  const closeObjectiveModal = () => {
    setShowObjectiveModal(false);
    setEditObjective(null);
    setObjectiveDescription('');
    setObjectiveStatus('active');
    setObjectiveDeadline('');
    setError(null);
  };
  const handleSaveObjective = async () => {
    setSavingObjective(true);
    setError(null);
    try {
      const method = editObjective ? 'PATCH' : 'POST';
      const url = editObjective ? `/api/boardroom/objective/${editObjective.id}` : `/api/boardroom/objective`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: objectiveDescription, status: objectiveStatus, deadline: objectiveDeadline, boardMemberId: members[0]?.id || 1 })
      });
      if (!res.ok) throw new Error('Failed to save objective');
      closeObjectiveModal();
      // Refresh objectives
      const data = await fetch(`/api/boardroom/objectives/${members[0]?.id || 1}`).then(r => r.json());
      setObjectives(data.objectives || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingObjective(false);
    }
  };
  const handleDeleteObjective = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/boardroom/objective/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete objective');
      // Refresh objectives
      const data = await fetch(`/api/boardroom/objectives/${members[0]?.id || 1}`).then(r => r.json());
      setObjectives(data.objectives || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  // Meeting CRUD handlers
  const openAddMeeting = () => {
    setEditMeeting(null);
    setMeetingAgenda('');
    setMeetingDate('');
    setShowMeetingModal(true);
    setError(null);
  };
  const openEditMeeting = (m: BoardMeeting) => {
    setEditMeeting(m);
    setMeetingAgenda(m.agenda);
    setMeetingDate(m.date);
    setShowMeetingModal(true);
    setError(null);
  };
  const closeMeetingModal = () => {
    setShowMeetingModal(false);
    setEditMeeting(null);
    setMeetingAgenda('');
    setMeetingDate('');
    setError(null);
  };
  const handleSaveMeeting = async () => {
    setSavingMeeting(true);
    setError(null);
    try {
      const method = editMeeting ? 'PATCH' : 'POST';
      const url = editMeeting ? `/api/boardroom/meeting/${editMeeting.id}` : `/api/boardroom/meeting`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda: meetingAgenda, date: meetingDate, clubId })
      });
      if (!res.ok) throw new Error('Failed to save meeting');
      closeMeetingModal();
      // Refresh meetings
      const data = await fetch(`/api/boardroom/meetings/${clubId}`).then(r => r.json());
      setMeetings(data.meetings || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingMeeting(false);
    }
  };
  const handleDeleteMeeting = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/boardroom/meeting/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete meeting');
      // Refresh meetings
      const data = await fetch(`/api/boardroom/meetings/${clubId}`).then(r => r.json());
      setMeetings(data.meetings || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  // Decision CRUD handlers
  const openAddDecision = () => {
    setEditDecision(null);
    setDecisionDescription('');
    setDecisionOutcome('approved');
    setShowDecisionModal(true);
    setError(null);
  };
  const openEditDecision = (d: BoardDecision) => {
    setEditDecision(d);
    setDecisionDescription(d.description);
    setDecisionOutcome(d.outcome);
    setShowDecisionModal(true);
    setError(null);
  };
  const closeDecisionModal = () => {
    setShowDecisionModal(false);
    setEditDecision(null);
    setDecisionDescription('');
    setDecisionOutcome('approved');
    setError(null);
  };
  const handleSaveDecision = async () => {
    setSavingDecision(true);
    setError(null);
    try {
      const method = editDecision ? 'PATCH' : 'POST';
      const url = editDecision ? `/api/boardroom/decision/${editDecision.id}` : `/api/boardroom/decision`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: decisionDescription, outcome: decisionOutcome, boardMeetingId: meetings[0]?.id || 1 })
      });
      if (!res.ok) throw new Error('Failed to save decision');
      closeDecisionModal();
      // Refresh decisions
      const data = await fetch(`/api/boardroom/decisions/${meetings[0]?.id || 1}`).then(r => r.json());
      setDecisions(data.decisions || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingDecision(false);
    }
  };
  const handleDeleteDecision = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/boardroom/decision/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete decision');
      // Refresh decisions
      const data = await fetch(`/api/boardroom/decisions/${meetings[0]?.id || 1}`).then(r => r.json());
      setDecisions(data.decisions || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  return (
    <div className="boardroom-page">
      <h1>Boardroom</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <section>
        <h2>Board Members</h2>
        {isAdmin && (
          <button className="bg-green-600 text-white px-3 py-1 rounded mb-2" onClick={openAddMember}>Add Member</button>
        )}
        <ul>
          {members.map(m => (
            <li key={m.id}>
              {m.name} ({m.role}) - Influence: {m.influence}, Tenure: {m.tenure} yrs
              {isAdmin && (
                <>
                  <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => openEditMember(m)}>Edit</button>
                  <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteMember(m.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Objectives</h2>
        {isAdmin && (
          <button className="bg-green-600 text-white px-3 py-1 rounded mb-2" onClick={openAddObjective}>Add Objective</button>
        )}
        <ul>
          {objectives.map(o => (
            <li key={o.id}>
              {o.description} - Status: {o.status} (Deadline: {o.deadline})
              {isAdmin && (
                <>
                  <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => openEditObjective(o)}>Edit</button>
                  <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteObjective(o.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {/* Objective Modal */}
      {showObjectiveModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editObjective ? 'Edit' : 'Add'} Objective</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Description</label>
              <input className="border rounded px-2 py-1 w-full" value={objectiveDescription} onChange={e => setObjectiveDescription(e.target.value)} disabled={savingObjective} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Status</label>
              <select className="border rounded px-2 py-1 w-full" value={objectiveStatus} onChange={e => setObjectiveStatus(e.target.value)} disabled={savingObjective}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Deadline</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={objectiveDeadline} onChange={e => setObjectiveDeadline(e.target.value)} disabled={savingObjective} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveObjective} disabled={savingObjective || !objectiveDescription}>{savingObjective ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeObjectiveModal} disabled={savingObjective}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <section>
        <h2>Board Satisfaction</h2>
        <div>Score: {satisfaction}/100</div>
        {/* TODO: Add visual indicator */}
      </section>
      <section>
        <h2>Meetings</h2>
        {isAdmin && (
          <button className="bg-green-600 text-white px-3 py-1 rounded mb-2" onClick={openAddMeeting}>Add Meeting</button>
        )}
        <ul>
          {meetings.map(m => (
            <li key={m.id}>
              {m.agenda} ({m.date})
              {isAdmin && (
                <>
                  <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => openEditMeeting(m)}>Edit</button>
                  <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteMeeting(m.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {/* Meeting Modal */}
      {showMeetingModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editMeeting ? 'Edit' : 'Add'} Meeting</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Agenda</label>
              <input className="border rounded px-2 py-1 w-full" value={meetingAgenda} onChange={e => setMeetingAgenda(e.target.value)} disabled={savingMeeting} />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Date</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} disabled={savingMeeting} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveMeeting} disabled={savingMeeting || !meetingAgenda}>{savingMeeting ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeMeetingModal} disabled={savingMeeting}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <section>
        <h2>Decisions</h2>
        {isAdmin && (
          <button className="bg-green-600 text-white px-3 py-1 rounded mb-2" onClick={openAddDecision}>Add Decision</button>
        )}
        <ul>
          {decisions.map(d => (
            <li key={d.id}>
              {d.description} - Outcome: {d.outcome}
              {isAdmin && (
                <>
                  <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => openEditDecision(d)}>Edit</button>
                  <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteDecision(d.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {/* Decision Modal */}
      {showDecisionModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editDecision ? 'Edit' : 'Add'} Decision</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Description</label>
              <input className="border rounded px-2 py-1 w-full" value={decisionDescription} onChange={e => setDecisionDescription(e.target.value)} disabled={savingDecision} />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Outcome</label>
              <select className="border rounded px-2 py-1 w-full" value={decisionOutcome} onChange={e => setDecisionOutcome(e.target.value)} disabled={savingDecision}>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveDecision} disabled={savingDecision || !decisionDescription}>{savingDecision ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeDecisionModal} disabled={savingDecision}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Member Modal */}
      {showMemberModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editMember ? 'Edit' : 'Add'} Board Member</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Name</label>
              <input className="border rounded px-2 py-1 w-full" value={memberName} onChange={e => setMemberName(e.target.value)} disabled={savingMember} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Role</label>
              <input className="border rounded px-2 py-1 w-full" value={memberRole} onChange={e => setMemberRole(e.target.value)} disabled={savingMember} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Influence</label>
              <input type="number" min={0} max={100} className="border rounded px-2 py-1 w-full" value={memberInfluence} onChange={e => setMemberInfluence(Number(e.target.value))} disabled={savingMember} />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Tenure (years)</label>
              <input type="number" min={0} className="border rounded px-2 py-1 w-full" value={memberTenure} onChange={e => setMemberTenure(Number(e.target.value))} disabled={savingMember} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveMember} disabled={savingMember || !memberName || !memberRole}>{savingMember ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeMemberModal} disabled={savingMember}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardroomPage; 