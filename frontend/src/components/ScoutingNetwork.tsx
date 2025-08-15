import React, { useEffect, useState } from 'react';
import { assignScout, getScouts, getScoutingReports } from '../api/scouting';

const ScoutingNetwork: React.FC<{ clubId: number }> = ({ clubId }) => {
  const [scouts, setScouts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newScoutName, setNewScoutName] = useState('');
  const [newScoutRegion, setNewScoutRegion] = useState('');
  const [newScoutAbility, setNewScoutAbility] = useState(50);

  const fetchScouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScouts(clubId);
      setScouts(data);
    } catch {
      setError('Failed to load scouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScoutingReports(clubId);
      setReports(data);
    } catch {
      setError('Failed to load scouting reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScouts();
    fetchReports();
  }, [clubId]);

  const handleAssignScout = async () => {
    if (!newScoutName || !newScoutRegion) {
      setError('Please enter scout name and region');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Generate a unique ID for the new scout
      const newScoutId = `scout-${Date.now()}`;
      await assignScout(newScoutId, newScoutRegion);
      
      // Update the scouts list with the new scout
      setScouts(prevScouts => [
        ...prevScouts,
        {
          id: newScoutId,
          name: newScoutName,
          skill: newScoutAbility,
          cost: 1000, // Default cost
          assignedRegion: newScoutRegion
        }
      ]);
      setNewScoutName('');
      setNewScoutRegion('');
      setNewScoutAbility(50);
      await fetchScouts();
      await fetchReports();
    } catch {
      setError('Failed to assign scout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2 className="text-2xl font-bold mb-4">Scouting Network</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Scout Name"
          value={newScoutName}
          onChange={(e) => setNewScoutName(e.target.value)}
          className="p-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Region"
          value={newScoutRegion}
          onChange={(e) => setNewScoutRegion(e.target.value)}
          className="p-2 rounded mr-2"
        />
        <input
          type="number"
          min={1}
          max={100}
          value={newScoutAbility}
          onChange={(e) => setNewScoutAbility(Number(e.target.value))}
          className="p-2 rounded w-20"
        />
        <button
          onClick={handleAssignScout}
          className="ml-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Assign Scout
        </button>
      </div>
      <h3 className="text-xl font-semibold mb-2">Current Scouts</h3>
      <ul className="mb-4">
        {scouts.map((scout) => (
          <li key={scout.id}>
            {scout.name} - {scout.region} (Ability: {scout.ability})
          </li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold mb-2">Scouting Reports</h3>
      <ul>
        {reports.map((report, index) => (
          <li key={index}>{report.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default ScoutingNetwork;
