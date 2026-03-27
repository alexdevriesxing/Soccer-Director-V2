import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import LanguageSelector from '../components/LanguageSelector';
import AnimatedBackground from '../components/AnimatedBackground';

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
  position: 'relative' as React.CSSProperties['position'],
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column' as React.CSSProperties['flexDirection'],
  alignItems: 'center',
};

const glowBtn = {
  padding: '1.25rem 3.5rem',
  fontSize: '2rem',
  borderRadius: 16,
  fontWeight: 700,
  background: 'linear-gradient(90deg, #4ade80 60%, #22d3ee 100%)',
  color: '#fff',
  boxShadow: '0 0 24px 4px #4ade80, 0 2px 8px rgba(0,0,0,0.15)',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  marginBottom: 8,
  marginTop: 8,
  transition: 'transform 0.15s, box-shadow 0.15s',
  animation: 'glowPulse 2.5s infinite alternate',
};

const footerStyle = {
  position: 'fixed' as React.CSSProperties['position'],
  bottom: 12,
  left: 0,
  width: '100vw',
  textAlign: 'center' as React.CSSProperties['textAlign'],
  color: '#a7f3d0',
  fontSize: 15,
  opacity: 0.85,
  zIndex: 2,
  fontFamily: 'monospace',
};

const titleFont = {
  fontFamily: 'Bebas Neue, Orbitron, Arial Black, sans-serif',
  fontSize: '3.5rem',
  fontWeight: 900,
  background: 'linear-gradient(90deg, #4ade80 20%, #22d3ee 80%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: 2,
  marginBottom: 24,
  textAlign: 'center' as const,
  textShadow: '0 4px 24px #22d3ee',
  animation: 'titleGradientMove 4s ease-in-out infinite alternate',
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

interface TitleScreenPageProps {
  onStartGame: () => void;
}

const TitleScreenPage: React.FC<TitleScreenPageProps> = ({ onStartGame }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const v2Enabled = (process.env.REACT_APP_V2_ENABLED || 'true').toLowerCase() !== 'false';

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', fontFamily: 'monospace' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400;700&family=Orbitron:wght@700&display=swap" rel="stylesheet" />

      {/* Inline styles for local animations */}
      <style>{`
        @keyframes glowPulse {
          0% { box-shadow: 0 0 24px 4px #4ade80, 0 2px 8px rgba(0,0,0,0.15); }
          100% { box-shadow: 0 0 48px 12px #22d3ee, 0 2px 16px rgba(0,0,0,0.18); }
        }
        @keyframes titleGradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes footerFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 0.85; transform: translateY(0); }
        }
        @keyframes titleFlashIn {
          0% { opacity: 0; transform: scale(0.7) translateY(-60px); }
          60% { opacity: 1; transform: scale(1.1) translateY(8px); }
          80% { transform: scale(0.98) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .soccer-logo-gradient {
          background: linear-gradient(90deg, #4ade80 20%, #22d3ee 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 8px #22d3ee);
        }
        .soccer-title-animated {
          animation: titleFlashIn 1.2s cubic-bezier(.5,1.5,.5,1) 0.2s both, titleGradientMove 4s ease-in-out infinite alternate;
          display: flex; align-items: center; justify-content: center; gap: 18px;
          font-size: 3.7rem;
        }
        /* LanguageSelector rolling in */
        .lang-selector-animated {
          animation: langRollIn 1.1s cubic-bezier(.5,1.5,.5,1) 0.7s both;
          position: relative;
          z-index: 2;
        }
        @keyframes langRollIn {
          0% { opacity: 0; transform: translateX(-120px) rotate(-30deg) scale(0.7); }
          60% { opacity: 1; transform: translateX(12px) rotate(8deg) scale(1.1); }
          80% { transform: translateX(0) rotate(-2deg) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) rotate(0) scale(1); }
        }
      `}</style>

      <AnimatedBackground>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <div style={glassCard}>
            <h1 className="soccer-title-animated" style={titleFont}>
              <span role="img" aria-label="soccer ball" style={{ fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #22d3ee)' }}>⚽️</span>
              Soccer Director 2026
              <span role="img" aria-label="soccer ball" style={{ fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #4ade80)' }}>⚽️</span>
            </h1>

            <div className="lang-selector-animated" style={{ marginBottom: 18, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <span role="img" aria-label="soccer ball" style={{ fontSize: 28, marginRight: 6, filter: 'drop-shadow(0 0 6px #22d3ee)' }}>⚽️</span>
              <LanguageSelector />
            </div>

            <button
              style={{ ...glowBtn, display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => navigate('/language-selector')}
              aria-label={t('Press to Start')}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/language-selector'); }}
            >
              <FontAwesomeIcon icon={faPlay} style={{ fontSize: 28, marginRight: 8, filter: 'drop-shadow(0 0 6px #22d3ee)' }} aria-hidden="true" />
              {t('Press to Start')}
            </button>

            {v2Enabled && (
              <button
                style={{ ...glowBtn, fontSize: '1.1rem', padding: '0.7rem 1.2rem', marginTop: 10, background: 'linear-gradient(90deg, #7bd6ae 10%, #5fc0a0 100%)' }}
                onClick={() => navigate('/new-career')}
              >
                Start Career
              </button>
            )}
            <div style={versionBadge}>{t('v0.1 Alpha')}</div>
          </div>
        </div>

        <div style={{ ...footerStyle, animation: 'footerFadeIn 1.2s 0.5s both' }}>
          <span>Crafted with ⚽️ by the Football Director Team &mdash; <span style={{ color: '#fff', fontWeight: 700 }}>Cursor AI</span></span>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default TitleScreenPage; 
