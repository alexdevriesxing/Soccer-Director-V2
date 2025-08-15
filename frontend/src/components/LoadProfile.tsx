import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfiles } from '../api/profileApi';
import { Profile } from '../types/profile';

const LoadProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch {
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleLoad = (id: string) => {
    // Logic to load profile and navigate to club menu
    navigate(`/club-menu?profileId=${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
      <h1 className="text-4xl font-bold mb-6">Load Profile</h1>
      {loading ? (
        <div>Loading profiles...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ul className="space-y-2">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button
                onClick={() => handleLoad(profile.id)}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition w-64 text-left"
              >
                {profile.club}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LoadProfile;
