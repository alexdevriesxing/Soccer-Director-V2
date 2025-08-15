import React, { useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface FanGroup {
  id: number;
  name: string;
  size: number;
  sentiment: number;
}
interface FanEvent {
  id: number;
  type: string;
  description: string;
  date: string;
}

const isAdmin = true; // Hardcoded admin flag for demo

const FanDynamicsPage: React.FC = () => {
  const { profile } = useManagerProfile();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;
  if (!profile) return null;
  const [groups, setGroups] = useState<FanGroup[]>([]);
  const [events, setEvents] = useState<FanEvent[]>([]);
  const [sentiment, setSentiment] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Fan group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState<FanGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupSize, setGroupSize] = useState(100);
  const [savingGroup, setSavingGroup] = useState(false);
  // Fan event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editEvent, setEditEvent] = useState<FanEvent | null>(null);
  const [eventType, setEventType] = useState('social');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    // Fetch fan groups
    fetch(`/api/fan/groups/${clubId}`)
      .then(res => res.json())
      .then(data => setGroups(data.groups || []));
    // Fetch events (for first group as example)
    fetch(`/api/fan/events/${groups[0]?.id || 1}`)
      .then(res => res.json())
      .then(data => setEvents(data.events || []));
    // Fetch sentiment
    if (groups.length > 0) {
      fetch(`/api/fan/sentiment/${groups[0].id}`)
        .then(res => res.json())
        .then(data => setSentiment(data.sentiment?.sentiment || 0));
    }
  }, [clubId, groups.length]);

  const handleHostEvent = async () => {
    if (!groups.length) return;
    const fanGroupId = groups[0].id;
    try {
      const res = await fetch('/api/fan/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fanGroupId, type: 'social', description: 'Club-hosted fan event', date: new Date().toISOString() })
      });
      if (!res.ok) throw new Error('Failed to host event');
      setNotification('Fan event hosted!');
      // Refresh events and sentiment
      fetch(`/api/fan/events/${fanGroupId}`)
        .then(res => res.json())
        .then(data => setEvents(data.events || []));
      fetch(`/api/fan/sentiment/${fanGroupId}`)
        .then(res => res.json())
        .then(data => setSentiment(data.sentiment?.sentiment || 0));
    } catch {
      setNotification('Failed to host fan event.');
    }
  };

  const handleTriggerProtest = async () => {
    if (!groups.length) return;
    const fanGroupId = groups[0].id;
    try {
      const res = await fetch('/api/fan/protest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fanGroupId, description: 'Fan protest triggered by manager', date: new Date().toISOString() })
      });
      if (!res.ok) throw new Error('Failed to trigger protest');
      setNotification('Fan protest triggered!');
      // Refresh events and sentiment
      fetch(`/api/fan/events/${fanGroupId}`)
        .then(res => res.json())
        .then(data => setEvents(data.events || []));
      fetch(`/api/fan/sentiment/${fanGroupId}`)
        .then(res => res.json())
        .then(data => setSentiment(data.sentiment?.sentiment || 0));
    } catch {
      setNotification('Failed to trigger protest.');
    }
  };

  // Fan group CRUD handlers
  const openAddGroup = () => {
    setEditGroup(null);
    setGroupName('');
    setGroupSize(100);
    setShowGroupModal(true);
    setError(null);
  };
  const openEditGroup = (g: FanGroup) => {
    setEditGroup(g);
    setGroupName(g.name);
    setGroupSize(g.size);
    setShowGroupModal(true);
    setError(null);
  };
  const closeGroupModal = () => {
    setShowGroupModal(false);
    setEditGroup(null);
    setGroupName('');
    setGroupSize(100);
    setError(null);
  };
  const handleSaveGroup = async () => {
    setSavingGroup(true);
    setError(null);
    try {
      const method = editGroup ? 'PATCH' : 'POST';
      const url = editGroup ? `/api/fan/group/${editGroup.id}` : `/api/fan/group`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId, name: groupName, size: groupSize })
      });
      if (!res.ok) throw new Error('Failed to save fan group');
      closeGroupModal();
      // Refresh groups
      const data = await fetch(`/api/fan/groups/${clubId}`).then(r => r.json());
      setGroups(data.groups || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingGroup(false);
    }
  };
  const handleDeleteGroup = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/fan/group/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete fan group');
      // Refresh groups
      const data = await fetch(`/api/fan/groups/${clubId}`).then(r => r.json());
      setGroups(data.groups || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  // Fan event CRUD handlers
  const openAddEvent = () => {
    setEditEvent(null);
    setEventType('social');
    setEventDescription('');
    setEventDate('');
    setShowEventModal(true);
    setError(null);
  };
  const openEditEvent = (e: FanEvent) => {
    setEditEvent(e);
    setEventType(e.type);
    setEventDescription(e.description);
    setEventDate(e.date);
    setShowEventModal(true);
    setError(null);
  };
  const closeEventModal = () => {
    setShowEventModal(false);
    setEditEvent(null);
    setEventType('social');
    setEventDescription('');
    setEventDate('');
    setError(null);
  };
  const handleSaveEvent = async () => {
    setSavingEvent(true);
    setError(null);
    try {
      const method = editEvent ? 'PATCH' : 'POST';
      const url = editEvent ? `/api/fan/event/${editEvent.id}` : `/api/fan/event`;
      const fanGroupId = groups[0]?.id || 1;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fanGroupId, type: eventType, description: eventDescription, date: eventDate })
      });
      if (!res.ok) throw new Error('Failed to save fan event');
      closeEventModal();
      // Refresh events
      const data = await fetch(`/api/fan/events/${fanGroupId}`).then(r => r.json());
      setEvents(data.events || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingEvent(false);
    }
  };
  const handleDeleteEvent = async (id: number) => {
    setError(null);
    try {
      const fanGroupId = groups[0]?.id || 1;
      const res = await fetch(`/api/fan/event/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete fan event');
      // Refresh events
      const data = await fetch(`/api/fan/events/${fanGroupId}`).then(r => r.json());
      setEvents(data.events || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  return (
    <div className="fan-dynamics-page">
      <h1>Fan Dynamics</h1>
      <section>
        <h2>Fan Groups</h2>
        {isAdmin && (
          <button className="bg-green-600 text-white px-3 py-1 rounded mb-2" onClick={openAddGroup}>Add Fan Group</button>
        )}
        <ul>
          {groups.map(g => (
            <li key={g.id}>
              {g.name} - Size: {g.size} - Sentiment: {g.sentiment}
              {isAdmin && (
                <>
                  <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => openEditGroup(g)}>Edit</button>
                  <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteGroup(g.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {/* Fan Group Modal */}
      {showGroupModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editGroup ? 'Edit' : 'Add'} Fan Group</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Name</label>
              <input className="border rounded px-2 py-1 w-full" value={groupName} onChange={e => setGroupName(e.target.value)} disabled={savingGroup} />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Size</label>
              <input type="number" min={1} className="border rounded px-2 py-1 w-full" value={groupSize} onChange={e => setGroupSize(Number(e.target.value))} disabled={savingGroup} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveGroup} disabled={savingGroup || !groupName}>{savingGroup ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeGroupModal} disabled={savingGroup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <section>
        <h2>Recent Fan Events</h2>
        {isAdmin && (
          <button className="bg-green-600 text-white px-3 py-1 rounded mb-2" onClick={openAddEvent}>Add Fan Event</button>
        )}
        <ul>
          {events.map(e => (
            <li key={e.id}>
              {e.type} - {e.description} ({e.date})
              {isAdmin && (
                <>
                  <button className="ml-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => openEditEvent(e)}>Edit</button>
                  <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteEvent(e.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {/* Fan Event Modal */}
      {showEventModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editEvent ? 'Edit' : 'Add'} Fan Event</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Type</label>
              <select className="border rounded px-2 py-1 w-full" value={eventType} onChange={e => setEventType(e.target.value)} disabled={savingEvent}>
                <option value="social">Social</option>
                <option value="protest">Protest</option>
                <option value="celebration">Celebration</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Description</label>
              <input className="border rounded px-2 py-1 w-full" value={eventDescription} onChange={e => setEventDescription(e.target.value)} disabled={savingEvent} />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Date</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={eventDate} onChange={e => setEventDate(e.target.value)} disabled={savingEvent} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveEvent} disabled={savingEvent || !eventDescription}>{savingEvent ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeEventModal} disabled={savingEvent}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <section>
        <h2>Sentiment Trend</h2>
        <div>Current Sentiment: {sentiment}/100</div>
        {/* TODO: Add trend graph/visual */}
      </section>
      {/* TODO: Add actions, notifications, and future expansion */}
    </div>
  );
};

export default FanDynamicsPage; 