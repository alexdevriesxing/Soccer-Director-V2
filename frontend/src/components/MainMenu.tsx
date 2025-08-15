import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-900 to-green-700 text-white font-mono">
      <h1 className="text-5xl font-bold mb-10">Main Menu</h1>
      <button
        className="mb-4 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
        onClick={() => navigate('/profile-creation')}
      >
        Create New Profile
      </button>
      <button
        className="mb-4 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
        onClick={() => navigate('/load-profile')}
      >
        Load Profile
      </button>
      <button
        className="px-6 py-3 bg-red-600 rounded hover:bg-red-700 transition"
        onClick={() => window.close()}
      >
        Exit
      </button>
    </div>
  );
};

export default MainMenu;
