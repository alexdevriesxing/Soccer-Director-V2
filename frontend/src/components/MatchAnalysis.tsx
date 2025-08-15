import React from 'react';
import { useNavigate } from 'react-router-dom';

const MatchAnalysis: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-green-400">Match Analysis</h1>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              Back to Menu
            </button>
          </div>
          <p className="text-gray-300">Match analysis feature coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalysis;

