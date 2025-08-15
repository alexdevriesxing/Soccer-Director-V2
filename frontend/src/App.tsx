import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components

// Pages
import TitleScreenPage from './pages/TitleScreenPage';
import ProfileCreationPage from './pages/ProfileCreationPage';
import { FinancesPage } from './pages/FinancesPage';
import StadiumManagementPage from './pages/StadiumManagementPage';
import FacilitiesPage from './pages/FacilitiesPage';
import CompliancePage from './pages/CompliancePage';
import SquadPage from './pages/SquadPage';
import TransfersPage from './pages/TransfersPage';
import ClubPage from './pages/ClubPage';
import HighlightDemoPage from './pages/HighlightDemoPage';

// Styles
import './App.css';
import './i18n';

// Default quotes in case the API fails
const DEFAULT_QUOTES = [
  { quote: 'Football is a simple game. Twenty-two men chase a ball for 90 minutes and at the end, the Germans always win.', author: 'Gary Lineker' },
  { quote: 'Some people think football is a matter of life and death. I assure you, it\'s much more serious than that.', author: 'Bill Shankly' },
  { quote: 'The ball is round, the game lasts 90 minutes, and everything else is pure theory.', author: 'Sepp Herberger' },
  { quote: 'You can change your wife, your politics, your religion, but never, never can you change your favorite football team.', author: 'Eric Cantona' }
];

// Feature flag to enable/disable live quote fetching
const ENABLE_QUOTES = (process.env.REACT_APP_ENABLE_QUOTES || '').toLowerCase() === 'true';

// Game content wrapper component
const GameContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-content">
      <div className="app-bg"></div>
      {children}
    </div>
  );
};

// Language selection screen component
const LanguageScreen: React.FC = () => {
  // const { t } = useTranslation(); // unused for now
  
  const handleLanguageSelect = (lang: string) => {
    localStorage.setItem('i18nextLng', lang);
    window.location.href = '/profile-creation';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-2xl font-bold text-white mb-8">Select Language</h2>
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <button 
          onClick={() => handleLanguageSelect('en')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          English
        </button>
        <button 
          onClick={() => handleLanguageSelect('nl')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Nederlands
        </button>
        <button 
          onClick={() => handleLanguageSelect('es')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Español
        </button>
      </div>
    </div>
  );
};

function App() {
  const [quote, setQuote] = useState<{quote: string; author: string}>(DEFAULT_QUOTES[0]);
  
  // Fetch a random football quote on component mount
  useEffect(() => {
    if (!ENABLE_QUOTES) {
      // Use a random default quote and do not schedule polling
      const randomIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
      setQuote(DEFAULT_QUOTES[randomIndex]);
      return;
    }

    let intervalId: number | undefined;
    const fetchQuote = async () => {
      try {
        const base = process.env.REACT_APP_API_BASE || '';
        const response = await fetch(`${base}/api/football-quotes`);
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          return true;
        }
      } catch (_) {
        // Quietly fall back below
      }
      // Fallback to default quotes if API fails
      const randomIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
      setQuote(DEFAULT_QUOTES[randomIndex]);
      return false;
    };

    (async () => {
      const ok = await fetchQuote();
      // Only poll if initial request succeeded to avoid repeated 500s in console
      if (ok) {
        intervalId = window.setInterval(fetchQuote, 30000);
      }
    })();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
  
  // Add animated background styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bgMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .app-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        background: linear-gradient(-45deg, #1e293b, #0f172a, #1e1e2e, #1e1b4b);
        background-size: 400% 400%;
        animation: bgMove 15s ease infinite;
      }
      .app-content {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/title-screen" replace />} />
          <Route path="/title-screen" element={
            <div className="app-content">
              <div className="app-bg"></div>
              <TitleScreenPage onStartGame={() => window.location.href = '/language-selector'} />
            </div>
          } />
          <Route path="/language-selector" element={
            <div className="app-content">
              <div className="app-bg"></div>
              <LanguageScreen />
            </div>
          } />
          <Route path="/profile-creation" element={
            <div className="app-content">
              <div className="app-bg"></div>
              <ProfileCreationPage />
            </div>
          } />
          <Route path="/highlight-demo" element={
            <GameContent>
              <HighlightDemoPage />
            </GameContent>
          } />
          <Route path="/club" element={
            <GameContent>
              <ClubPage />
            </GameContent>
          } />
          <Route path="/squad" element={
            <GameContent>
              <SquadPage />
            </GameContent>
          } />
          <Route path="/transfers" element={
            <GameContent>
              <TransfersPage />
            </GameContent>
          } />
          <Route path="/finances" element={
            <GameContent>
              <FinancesPage />
            </GameContent>
          } />
          <Route path="/stadium" element={
            <GameContent>
              <StadiumManagementPage />
            </GameContent>
          } />
          <Route path="/facilities" element={
            <GameContent>
              <FacilitiesPage />
            </GameContent>
          } />
          <Route path="/compliance" element={
            <GameContent>
              <CompliancePage />
            </GameContent>
          } />
          <Route path="*" element={<Navigate to="/title-screen" replace />} />
        </Routes>
        
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)', 
          color: '#fff', 
          padding: '12px 24px', 
          textAlign: 'center', 
          fontStyle: 'italic', 
          fontSize: '1rem', 
          borderRadius: '8px', 
          maxWidth: '800px', 
          width: '90%',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          "{quote.quote}" — <span style={{ fontWeight: 'bold' }}>{quote.author}</span>
        </div>
      </div>
    </Router>
  );
}

export default App;
