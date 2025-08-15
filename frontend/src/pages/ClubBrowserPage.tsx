import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClubBrowser from '../components/ClubBrowser';

const ClubBrowserPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
      {/* Navigation Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">Football Director</h1>
          <button
            onClick={() => navigate('/game-menu')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* ClubBrowser Component */}
      <ClubBrowser />
    </div>
  );
};

export default ClubBrowserPage; 