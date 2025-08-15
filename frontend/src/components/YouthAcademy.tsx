import React, { useEffect, useState } from 'react';
import { getYouthAcademy, createYouthAcademy, upgradeYouthAcademy, YouthAcademy } from '../api/youthAcademy';

const YouthAcademy: React.FC<{ clubId: number }> = ({ clubId }) => {
  const [academy, setAcademy] = useState<YouthAcademy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getYouthAcademy(clubId);
      setAcademy(data);
    } catch (err) {
      setError('Failed to load youth academy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademy();
  }, [clubId]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await createYouthAcademy(clubId);
      await fetchAcademy();
    } catch (err) {
      setError('Failed to create youth academy');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (upgradeType: 'level' | 'facilities' | 'coaches') => {
    setLoading(true);
    setError(null);
    try {
      await upgradeYouthAcademy(clubId, upgradeType);
      await fetchAcademy();
    } catch (err) {
      setError('Failed to upgrade youth academy');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgradeLevel = () => handleUpgrade('level');
  const handleUpgradeFacilities = () => handleUpgrade('facilities');
  const handleUpgradeCoaches = () => handleUpgrade('coaches');

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2 className="text-2xl font-bold mb-4">Youth Academy</h2>
      {academy ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Level: {academy.level}</p>
              <p>Training Facilities: Level {academy.trainingFacilities}</p>
              <p>Youth Coaches: {academy.youthCoaches}</p>
              <p>Players in Academy: {academy.currentPlayers.length}/{academy.capacity}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Upgrade Options:</h3>
              <div className="space-y-2">
                <button
                  className="w-full px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-sm"
                  onClick={handleUpgradeLevel}
                >
                  Upgrade Level (Cost: 1000)
                </button>
                <button
                  className="w-full px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                  onClick={handleUpgradeFacilities}
                >
                  Upgrade Facilities (Cost: 800)
                </button>
                <button
                  className="w-full px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 text-sm"
                  onClick={handleUpgradeCoaches}
                >
                  Hire More Coaches (Cost: 500)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleCreate}
        >
          Create Youth Academy
        </button>
      )}
    </div>
  );
};

export default YouthAcademy;
