import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TitleScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/language-selector');
    }, 5000); // Show title screen for 5 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white font-bold text-6xl">
      Dutch Football Manager
    </div>
  );
};

export default TitleScreen;
