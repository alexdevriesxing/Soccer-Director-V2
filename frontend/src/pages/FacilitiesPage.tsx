import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface Facility {
  id: number;
  name: string;
  type: string;
  level: number;
  capacity?: number;
  maintenanceCost: number;
  upgradeCost: number;
  effects: string;
}

const isAdmin = true; // Hardcoded admin flag for demo

const FacilitiesPage: React.FC = () => {
  const { profile } = useManagerProfile();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const navigate = useNavigate();
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [editFacility, setEditFacility] = useState<Facility | null>(null);
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [facilityLevel, setFacilityLevel] = useState(1);
  const [facilityCapacity, setFacilityCapacity] = useState<number | undefined>(undefined);
  const [facilityMaintenance, setFacilityMaintenance] = useState(0);
  const [facilityUpgrade, setFacilityUpgrade] = useState(0);
  const [facilityEffects, setFacilityEffects] = useState('');
  const [savingFacility, setSavingFacility] = useState(false);

  const fetchFacilities = React.useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/facility/${clubId}`);
      setFacilities(res.data);
    } catch (err: any) {
      setError('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (!clubId) return;
    fetchFacilities();
  }, [clubId, fetchFacilities]);

  if (!profile) return null;
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;



  const handleUpgrade = async (facilityId: number) => {
    if (!clubId) return;
    setUpgrading(facilityId);
    setError(null);
    try {
      await axios.post('/api/facility/upgrade', { facilityId, clubId });
      await fetchFacilities();
    } catch (err: any) {
      setError('Failed to upgrade facility');
    } finally {
      setUpgrading(null);
    }
  };

  // Facility CRUD handlers
  const openAddFacility = () => {
    setEditFacility(null);
    setFacilityName('');
    setFacilityType('');
    setFacilityLevel(1);
    setFacilityCapacity(undefined);
    setFacilityMaintenance(0);
    setFacilityUpgrade(0);
    setFacilityEffects('');
    setShowFacilityModal(true);
    setError(null);
  };
  const openEditFacility = (f: Facility) => {
    setEditFacility(f);
    setFacilityName(f.name);
    setFacilityType(f.type);
    setFacilityLevel(f.level);
    setFacilityCapacity(f.capacity);
    setFacilityMaintenance(f.maintenanceCost);
    setFacilityUpgrade(f.upgradeCost);
    setFacilityEffects(f.effects);
    setShowFacilityModal(true);
    setError(null);
  };
  const closeFacilityModal = () => {
    setShowFacilityModal(false);
    setEditFacility(null);
    setFacilityName('');
    setFacilityType('');
    setFacilityLevel(1);
    setFacilityCapacity(undefined);
    setFacilityMaintenance(0);
    setFacilityUpgrade(0);
    setFacilityEffects('');
    setError(null);
  };
  const handleSaveFacility = async () => {
    setSavingFacility(true);
    setError(null);
    try {
      const method = editFacility ? 'PATCH' : 'POST';
      const url = editFacility ? `/api/facility/${editFacility.id}` : `/api/facility`;
      const res = await axios({
        url,
        method,
        data: {
          clubId,
          name: facilityName,
          type: facilityType,
          level: facilityLevel,
          capacity: facilityCapacity,
          maintenanceCost: facilityMaintenance,
          upgradeCost: facilityUpgrade,
          effects: facilityEffects
        }
      });
      if (res.status !== 200 && res.status !== 201) throw new Error('Failed to save facility');
      closeFacilityModal();
      await fetchFacilities();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setSavingFacility(false);
    }
  };
  const handleDeleteFacility = async (id: number) => {
    setError(null);
    try {
      const res = await axios.delete(`/api/facility/${id}`);
      if (res.status !== 200) throw new Error('Failed to delete facility');
      await fetchFacilities();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-400">Club Facilities</h1>
              <p className="text-gray-300">Upgrade and manage your club's infrastructure</p>
            </div>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
          {isAdmin && (
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={openAddFacility}>Add Facility</button>
          )}
        </div>

        {error && <div className="bg-red-700 text-white p-4 rounded mb-4">{error}</div>}
        {loading ? (
          <div className="text-center text-lg">Loading facilities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map(facility => (
              <div key={facility.id} className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2 text-blue-300">{facility.name}</h2>
                  <div className="mb-2 text-gray-400">Type: <span className="text-white">{facility.type}</span></div>
                  <div className="mb-2">Level: <span className="font-bold text-green-400">{facility.level}</span></div>
                  {facility.capacity !== undefined && (
                    <div className="mb-2">Capacity: <span className="font-bold text-yellow-400">{facility.capacity}</span></div>
                  )}
                  <div className="mb-2">Maintenance Cost: <span className="text-red-400">€{facility.maintenanceCost.toLocaleString()}</span></div>
                  <div className="mb-2">Upgrade Cost: <span className="text-green-400">€{facility.upgradeCost.toLocaleString()}</span></div>
                  <div className="mb-2">Effects: <span className="text-gray-200">{facility.effects}</span></div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => openEditFacility(facility)}>Edit</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => handleDeleteFacility(facility.id)}>Delete</button>
                  </div>
                )}
                <button
                  className={`mt-4 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors ${upgrading === facility.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleUpgrade(facility.id)}
                  disabled={upgrading === facility.id}
                >
                  {upgrading === facility.id ? 'Upgrading...' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Facility Modal */}
      {showFacilityModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{editFacility ? 'Edit' : 'Add'} Facility</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Name</label>
              <input className="border rounded px-2 py-1 w-full" value={facilityName} onChange={e => setFacilityName(e.target.value)} disabled={savingFacility} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Type</label>
              <input className="border rounded px-2 py-1 w-full" value={facilityType} onChange={e => setFacilityType(e.target.value)} disabled={savingFacility} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Level</label>
              <input type="number" min={1} className="border rounded px-2 py-1 w-full" value={facilityLevel} onChange={e => setFacilityLevel(Number(e.target.value))} disabled={savingFacility} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Capacity</label>
              <input type="number" min={0} className="border rounded px-2 py-1 w-full" value={facilityCapacity ?? ''} onChange={e => setFacilityCapacity(e.target.value ? Number(e.target.value) : undefined)} disabled={savingFacility} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Maintenance Cost</label>
              <input type="number" min={0} className="border rounded px-2 py-1 w-full" value={facilityMaintenance} onChange={e => setFacilityMaintenance(Number(e.target.value))} disabled={savingFacility} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Upgrade Cost</label>
              <input type="number" min={0} className="border rounded px-2 py-1 w-full" value={facilityUpgrade} onChange={e => setFacilityUpgrade(Number(e.target.value))} disabled={savingFacility} />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Effects</label>
              <input className="border rounded px-2 py-1 w-full" value={facilityEffects} onChange={e => setFacilityEffects(e.target.value)} disabled={savingFacility} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveFacility} disabled={savingFacility || !facilityName || !facilityType}>{savingFacility ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeFacilityModal} disabled={savingFacility}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage; 