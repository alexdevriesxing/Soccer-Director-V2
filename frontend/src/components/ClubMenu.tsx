import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClubMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
      <h1 className="text-4xl font-bold mb-6">Club Menu</h1>
      <div className="grid grid-cols-2 gap-6 max-w-lg">
        <button
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/squad-management')}
        >
          Squad Management
        </button>
        <button
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/training-center')}
        >
          Training Center
        </button>
        <button
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/transfer-market')}
        >
          Transfer Market
        </button>
        <button
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/financial-center')}
        >
          Financial Center
        </button>
        <button
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/staff-management')}
        >
          Staff Management
        </button>
        <button
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/international-matches')}
        >
          International Matches
        </button>
      </div>
    </div>
  );
};

export default ClubMenu;
