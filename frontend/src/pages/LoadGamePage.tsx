import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ManagerProfile {
  id: number;
  managerName: string;
  clubId: number;
  createdAt: string;
  updatedAt: string;
}

const LoadGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ManagerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/manager-profiles')
      .then(res => res.json())
      .then(data => setProfiles(data.profiles || []))
      .catch(() => setError(t('Failed to load profiles')))
      .finally(() => setLoading(false));
  }, [t]);

  const handleLoad = (profile: ManagerProfile) => {
    // TODO: Implement actual load logic (set session, redirect, etc.)
    alert(t('Loading profile:') + ' ' + profile.managerName);
    // navigate('/game-menu');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-green-900 text-white font-mono p-6">
      <div className="w-full max-w-xl bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-400 mb-8 text-center">{t('Load Game')}</h1>
        {loading && <div className="text-gray-400 mb-4">{t('Loading...')}</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {!loading && profiles.length === 0 && !error && (
          <div className="text-gray-400 mb-4">{t('No saved games found.')}</div>
        )}
        <ul className="w-full mb-6">
          {profiles.map(profile => (
            <li key={profile.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4 mb-3">
              <div>
                <div className="font-bold text-lg text-green-300">{profile.managerName}</div>
                <div className="text-gray-300 text-sm">{t('Club ID')}: {profile.clubId}</div>
                <div className="text-gray-400 text-xs">{t('Last played')}: {new Date(profile.updatedAt).toLocaleString()}</div>
              </div>
              <button
                className="py-2 px-6 bg-green-500 hover:bg-green-400 rounded-lg font-bold text-md transition-colors"
                onClick={() => handleLoad(profile)}
              >
                {t('Load')}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold text-lg mt-2"
          onClick={() => navigate('/title-screen')}
        >
          {t('Back to Main Menu')}
        </button>
      </div>
    </div>
  );
};

export default LoadGamePage; 