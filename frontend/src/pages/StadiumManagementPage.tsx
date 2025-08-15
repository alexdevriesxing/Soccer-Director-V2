import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

// Copied from FacilitiesPage.tsx
interface Facility {
  id: number;
  name: string;
  type: string;
  level: number;
  capacity?: number;
  maintenanceCost: number;
  upgradeCost: number;
  effects: string;
  ticketPrice?: number;
}

const StadiumManagement: React.FC = () => {
  const navigate = useNavigate();
  const { clubId } = useResolvedClubId();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(25);
  const [editPrice, setEditPrice] = useState<number>(25);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStadium() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all facilities for the club
        const res = await fetch(`/api/facility/${clubId}`);
        if (!res.ok) throw new Error('Failed to fetch facilities');
        const facilities = await res.json();
        // Find stadium
        const stadium = facilities.find((f: Facility) => f.type === 'stadium');
        if (!stadium) throw new Error('No stadium found');
        setFacility(stadium);
        setTicketPrice(stadium.ticketPrice ?? 25);
        setEditPrice(stadium.ticketPrice ?? 25);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStadium();
  }, [clubId]);

  // Handler to save ticket price
  const handleSavePrice = async () => {
    if (!facility) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/facility/${facility.id}/ticket-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketPrice: editPrice })
      });
      if (!res.ok) throw new Error('Failed to update ticket price');
      const data = await res.json();
      setTicketPrice(data.ticketPrice);
      setSaveMsg('Ticket price updated!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setSaveMsg('Error: ' + e.message);
      } else {
        setSaveMsg('Unknown error');
      }
    } finally {
      setSaving(false);
    }
  };


  // --- Projected attendance/revenue calculation ---
  function getProjectedAttendanceAndRevenue(price: number) {
    if (!facility) return { attendance: '-', revenue: '-' };
    const stadiumCapacity = facility.capacity || 10000;
    const baseAttendance = 15000;
    const performanceBonus = 0; // Not available here, so ignore for projection
    const facilityBonus = facility.level * 1000;
    const priceEffect = 1 - 0.015 * Math.max(0, price - 25) + 0.01 * Math.max(0, 25 - price);
    let attendance = (baseAttendance + performanceBonus + facilityBonus) * priceEffect;
    attendance = Math.max(0, Math.min(attendance, stadiumCapacity));
    const revenue = Math.round(attendance) * price;
    return { attendance: Math.round(attendance), revenue };
  }
  const { attendance: projectedAttendance, revenue: projectedRevenue } = getProjectedAttendanceAndRevenue(editPrice);
  const attendanceWarning = editPrice > 40 ? 'Warning: High ticket price may reduce attendance!' : (editPrice < 10 ? 'Warning: Very low price may reduce revenue.' : null);

  const stadiumData = {
    name: 'RBC Stadion',
    capacity: 4500,
    currentAttendance: 3200,
    condition: 85,
    facilities: {
      pitch: { quality: 90, condition: 'Excellent' },
      stands: { quality: 75, condition: 'Good' },
      facilities: { quality: 60, condition: 'Average' },
      youth: { quality: 45, condition: 'Poor' }
    },
    upgrades: [
      { id: 1, name: 'Expand Capacity', cost: 2000000, effect: '+1000 seats' },
      { id: 2, name: 'Improve Pitch', cost: 500000, effect: '+10 pitch quality' },
      { id: 3, name: 'Youth Facilities', cost: 800000, effect: '+20 youth quality' },
      { id: 4, name: 'VIP Boxes', cost: 1500000, effect: '+50% VIP revenue' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">Stadium Management</h1>
              <p className="text-gray-300">Manage your stadium and facilities</p>
            </div>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading stadium data...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : facility && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stadium Overview */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stadium Info */}
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">{facility.name}</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-bold">{facility.capacity?.toLocaleString() ?? '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket Price:</span>
                    <span className="font-bold text-blue-400">€{ticketPrice}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span>Set Ticket Price:</span>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={editPrice}
                      onChange={e => setEditPrice(Number(e.target.value))}
                      className="w-24 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 mr-2"
                      disabled={saving}
                    />
                    <button
                      onClick={handleSavePrice}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                      disabled={saving || editPrice === ticketPrice}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Projected Attendance:</span>
                    <span className="text-blue-300">{projectedAttendance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Projected Revenue:</span>
                    <span className="text-green-300">€{projectedRevenue}</span>
                  </div>
                  {attendanceWarning && <div className="mt-2 text-yellow-400 text-xs">{attendanceWarning}</div>}
                  {saveMsg && <div className="mt-2 text-sm" style={{ color: saveMsg.startsWith('Error') ? 'red' : 'lightgreen' }}>{saveMsg}</div>}
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Facilities</h2>
                <div className="space-y-3">
                  {Object.entries(stadiumData.facilities).map(([key, facility]) => (
                    <div key={key} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{key}</span>
                        <span className="text-sm">{facility.quality}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${facility.quality}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{facility.condition}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                    Schedule Maintenance
                  </button>
                  <button className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                    View Match Schedule
                  </button>
                  <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
                    Financial Report
                  </button>
                  <button className="w-full p-3 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors">
                    Stadium Tours
                  </button>
                </div>
              </div>
            </div>

            {/* Upgrades and Maintenance */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Available Upgrades</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stadiumData.upgrades.map((upgrade) => (
                    <div key={upgrade.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">{upgrade.name}</h3>
                        <span className="text-green-400 font-bold">€{(upgrade.cost / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="text-sm text-gray-300 mb-3">
                        Effect: {upgrade.effect}
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors">
                          Purchase
                        </button>
                        <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Overview */}
              <div className="mt-6 bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Financial Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Matchday Revenue</h3>
                    <div className="text-2xl font-bold text-green-400">€45K</div>
                    <div className="text-sm text-gray-400">Per match average</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Maintenance Costs</h3>
                    <div className="text-2xl font-bold text-red-400">€8K</div>
                    <div className="text-sm text-gray-400">Monthly expenses</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Facility Income</h3>
                    <div className="text-2xl font-bold text-blue-400">€12K</div>
                    <div className="text-sm text-gray-400">Monthly revenue</div>
                  </div>
                </div>
              </div>

              {/* Match Schedule */}
              <div className="mt-6 bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Home Matches</h2>
                <div className="space-y-3">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">RBC vs VVV-Venlo</div>
                        <div className="text-sm text-gray-400">Eerste Divisie - Matchday 1</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Aug 15, 2024</div>
                        <div className="text-sm text-green-400">Expected: 3,800</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">RBC vs Helmond Sport</div>
                        <div className="text-sm text-gray-400">Eerste Divisie - Matchday 3</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Aug 29, 2024</div>
                        <div className="text-sm text-green-400">Expected: 3,500</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">RBC vs Amateur Club</div>
                        <div className="text-sm text-gray-400">KNVB Beker - First Round</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Sep 19, 2024</div>
                        <div className="text-sm text-green-400">Expected: 2,800</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StadiumManagement;
