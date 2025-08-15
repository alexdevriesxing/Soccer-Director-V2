import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faFolderOpen, 
  faCog, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const glassCard = {
  background: 'rgba(34, 40, 49, 0.85)',
  borderRadius: 24,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1.5px solid rgba(255,255,255,0.12)',
  padding: 40,
  minWidth: 320,
  maxWidth: 480,
  margin: '0 auto',
  position: 'relative' as const,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
};

const menuTitle = {
  fontFamily: 'Bebas Neue, Orbitron, Arial Black, sans-serif',
  fontSize: '2.7rem',
  fontWeight: 900,
  background: 'linear-gradient(90deg, #4ade80 20%, #22d3ee 80%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: 2,
  marginBottom: 32,
  textAlign: 'center' as const,
  textShadow: '0 4px 24px #22d3ee',
  animation: 'titleGradientMove 4s ease-in-out infinite alternate',
};

const glowBtn = {
  padding: '1.1rem 2.5rem',
  fontSize: '1.3rem',
  borderRadius: 16,
  fontWeight: 700,
  background: 'linear-gradient(90deg, #4ade80 60%, #22d3ee 100%)',
  color: '#fff',
  boxShadow: '0 0 18px 2px #4ade80, 0 2px 8px rgba(0,0,0,0.15)',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  marginBottom: 16,
  marginTop: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  justifyContent: 'center',
  transition: 'transform 0.15s, box-shadow 0.15s',
  animation: 'glowPulse 2.5s infinite alternate',
};

const menuBtn = {
  padding: '1.1rem 2.5rem',
  fontSize: '1.3rem',
  borderRadius: 16,
  fontWeight: 700,
  background: 'rgba(30,41,59,0.92)',
  color: '#fff',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  marginBottom: 16,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  justifyContent: 'center',
  transition: 'background 0.18s, transform 0.15s',
};

const disabledBtn = {
  ...menuBtn,
  background: 'rgba(55,65,81,0.7)',
  opacity: 0.5,
  cursor: 'not-allowed',
};

const versionBadge = {
  display: 'inline-block',
  background: 'linear-gradient(90deg, #22d3ee 0%, #4ade80 100%)',
  color: '#fff',
  borderRadius: 999,
  padding: '4px 18px',
  fontWeight: 700,
  fontSize: 15,
  marginTop: 18,
  boxShadow: '0 2px 8px #22d3ee44',
  letterSpacing: 1,
  border: '1.5px solid #4ade80',
  textShadow: '0 1px 4px #22d3ee',
};

const MainMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', fontFamily: 'monospace', background: 'radial-gradient(ellipse at 60% 40%, #4ade80 0%, #1e293b 60%, #111827 100%)' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400;700&family=Orbitron:wght@700&display=swap" rel="stylesheet" />
      {/* Keyframes for animation */}
      <style>{`
        @keyframes glowPulse {
          0% { box-shadow: 0 0 18px 2px #4ade80, 0 2px 8px rgba(0,0,0,0.15); }
          100% { box-shadow: 0 0 36px 8px #22d3ee, 0 2px 16px rgba(0,0,0,0.18); }
        }
        @keyframes titleGradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={glassCard}>
          <h1 style={menuTitle}>{t('Main Menu')}</h1>
          <button
            style={glowBtn}
            onClick={() => navigate('/profile-creation')}
            aria-label={t('New Game')}
          >
            <FontAwesomeIcon icon={faPlay} style={{ fontSize: 22 }} aria-hidden="true" />
            {t('New Game')}
          </button>
          <button
            style={menuBtn}
            onClick={() => navigate('/load-game')}
            aria-label={t('Load Game')}
          >
            <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 22 }} aria-hidden="true" />
            {t('Load Game')}
          </button>
          <button
            style={menuBtn}
            onClick={() => alert(t('Settings are not yet implemented.'))}
            aria-label={t('Settings')}
          >
            <FontAwesomeIcon icon={faCog} style={{ fontSize: 22 }} aria-hidden="true" />
            {t('Settings')}
          </button>
          <button
            style={disabledBtn}
            disabled
            aria-label={t('Exit')}
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: 22 }} aria-hidden="true" />
            {t('Exit')}
          </button>
          <div style={versionBadge}>{t('v0.1 Alpha')}</div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuPage; 