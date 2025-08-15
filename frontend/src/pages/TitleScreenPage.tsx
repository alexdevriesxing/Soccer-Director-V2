import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import LanguageSelector from '../components/LanguageSelector';

const animatedBg = {
  position: 'fixed' as React.CSSProperties['position'],
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 0,
  background: 'radial-gradient(ellipse at 60% 40%, #4ade80 0%, #1e293b 60%, #111827 100%)',
  animation: 'bgMove 12s ease-in-out infinite alternate',
  pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
};

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

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', fontFamily: 'monospace' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400;700&family=Orbitron:wght@700&display=swap" rel="stylesheet" />
      {/* Animated background */}
      <div style={animatedBg} />
      {/* SVG soccer net overlay */}
      <svg width="100%" height="100%" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.13 }}>
        <defs>
          <pattern id="net" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0,0 L40,40 M40,0 L0,40" stroke="#fff" strokeWidth="1.2" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#net)" />
      </svg>
      {/* Add animated soccer balls to the background */}
      <div className="soccer-bg-balls">
        <div className="soccer-ball ball1" />
        <div className="soccer-ball ball2" />
        <div className="soccer-ball ball3" />
      </div>
      {/* 1. Add a full-viewport dark animated gradient background */}
      <div className="football-bg-gradient" />
      {/* 2. Add animated SVG silhouettes (players, ball, stadium lights) */}
      <div className="football-silhouettes">
        <svg className="silhouette player1" viewBox="0 0 120 120"><path d="M30,100 Q60,60 90,100" fill="none" stroke="#fff" strokeWidth="4" opacity="0.13"/><circle cx="60" cy="60" r="18" fill="#fff" opacity="0.08"/></svg>
        <svg className="silhouette player2" viewBox="0 0 120 120"><ellipse cx="60" cy="80" rx="40" ry="12" fill="#fff" opacity="0.07"/><rect x="50" y="30" width="20" height="40" rx="10" fill="#fff" opacity="0.10"/></svg>
        <svg className="silhouette stadium" viewBox="0 0 200 60"><ellipse cx="100" cy="50" rx="90" ry="10" fill="#fff" opacity="0.06"/><rect x="30" y="20" width="140" height="20" rx="8" fill="#fff" opacity="0.08"/></svg>
      </div>
      {/* 3. Add a glowing, always-visible title/logo at the top */}
      <header className="football-title-logo" style={{
        position: 'absolute',
        top: '4vw',
        left: 0,
        width: '100vw',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        fontSize: '3.7rem',
        fontFamily: 'Bebas Neue, Orbitron, Arial Black, sans-serif',
        fontWeight: 900,
        letterSpacing: 2,
        textShadow: '0 4px 24px #22d3ee, 0 2px 8px #4ade80',
        color: '#fff',
        filter: 'drop-shadow(0 0 12px #22d3ee)',
        animation: 'titleLogoFadeIn 1.2s cubic-bezier(.5,1.5,.5,1) 0.2s both',
        userSelect: 'none',
      }}>
        <span role="img" aria-label="soccer ball" style={{fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #22d3ee)'}}>⚽️</span>
        <span className="football-title-text soccer-logo-gradient">Soccer Director 2025</span>
        <span role="img" aria-label="soccer ball" style={{fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #4ade80)'}}>⚽️</span>
      </header>
      {/* Add animated soccer balls to the background */}
      <div className="soccer-bg-balls">
        <div className="soccer-ball ball1" />
        <div className="soccer-ball ball2" />
        <div className="soccer-ball ball3" />
      </div>
      {/* Keyframes for animation */}
      <style>{`
        @keyframes bgMove {
          0% { background-position: 60% 40%; }
          100% { background-position: 40% 60%; }
        }
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
        @keyframes ballBounce {
          0% { transform: translateY(0) scale(1); }
          10% { transform: translateY(-60px) scale(1.1); }
          20% { transform: translateY(0) scale(1); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes ballMove1 {
          0% { left: 5vw; }
          100% { left: 80vw; }
        }
        @keyframes ballMove2 {
          0% { left: 80vw; }
          100% { left: 10vw; }
        }
        @keyframes ballMove3 {
          0% { left: 40vw; }
          100% { left: 60vw; }
        }
        .soccer-logo-gradient {
          background: linear-gradient(90deg, #4ade80 20%, #22d3ee 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 8px #22d3ee);
        }
        .soccer-bg-balls {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          pointer-events: none; z-index: 1;
        }
        .soccer-ball {
          position: absolute;
          width: 48px; height: 48px;
          background: url('${process.env.PUBLIC_URL}/Images/Ball_Icons.png') center/cover no-repeat, #fff;
          border-radius: 50%;
          box-shadow: 0 4px 24px #2226, 0 2px 8px #22d3ee33;
          opacity: 0.85;
          animation: ballBounce 1.8s infinite cubic-bezier(.5,1.5,.5,1), ballMove1 12s linear infinite alternate;
        }
        .ball2 { top: 60vh; animation: ballBounce 2.1s 0.5s infinite, ballMove2 14s linear infinite alternate; }
        .ball3 { top: 30vh; animation: ballBounce 1.7s 1s infinite, ballMove3 10s linear infinite alternate; }
        .ball1 { top: 80vh; }
        /* Flashing/slide-in title */
        @keyframes titleFlashIn {
          0% { opacity: 0; transform: scale(0.7) translateY(-60px); }
          60% { opacity: 1; transform: scale(1.1) translateY(8px); }
          80% { transform: scale(0.98) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
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
        .football-bg-gradient {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: linear-gradient(120deg, #0a192f 0%, #1e293b 60%, #111827 100%);
          z-index: 0; animation: bgStadiumMove 18s ease-in-out infinite alternate;
        }
        @keyframes bgStadiumMove {
          0% { filter: brightness(1) hue-rotate(0deg); }
          100% { filter: brightness(1.08) hue-rotate(-12deg); }
        }
        .football-silhouettes { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1; pointer-events: none; }
        .silhouette { position: absolute; }
        .player1 { left: 8vw; top: 60vh; width: 120px; height: 120px; animation: player1Move 12s infinite alternate; }
        .player2 { right: 10vw; top: 30vh; width: 120px; height: 120px; animation: player2Move 14s infinite alternate; }
        .stadium { left: 50%; top: 80vh; width: 200px; height: 60px; transform: translateX(-50%); animation: stadiumFade 10s infinite alternate; }
        @keyframes player1Move { 0% { opacity: 0.08; transform: scale(1) translateY(0); } 50% { opacity: 0.18; transform: scale(1.08) translateY(-12px); } 100% { opacity: 0.08; transform: scale(1) translateY(0); } }
        @keyframes player2Move { 0% { opacity: 0.07; transform: scale(1) translateY(0); } 50% { opacity: 0.15; transform: scale(1.12) translateY(10px); } 100% { opacity: 0.07; transform: scale(1) translateY(0); } }
        @keyframes stadiumFade { 0% { opacity: 0.06; } 50% { opacity: 0.13; } 100% { opacity: 0.06; } }
        .football-title-logo {
          position: absolute; top: 4vw; left: 0; width: 100vw; z-index: 10;
          display: flex; align-items: center; justify-content: center; gap: 18px;
          font-size: 3.2rem; font-family: 'Bebas Neue', 'Orbitron', Arial Black, sans-serif;
          font-weight: 900; letter-spacing: 2px;
          text-shadow: 0 4px 24px #22d3ee, 0 2px 8px #4ade80;
          color: #fff; filter: drop-shadow(0 0 12px #22d3ee);
          animation: titleLogoFadeIn 1.2s cubic-bezier(.5,1.5,.5,1) 0.2s both;
          user-select: none;
        }
        @keyframes titleLogoFadeIn {
          0% { opacity: 0; transform: scale(0.7) translateY(-60px); }
          60% { opacity: 1; transform: scale(1.1) translateY(8px); }
          80% { transform: scale(0.98) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .football-title-text {
          background: linear-gradient(90deg, #4ade80 20%, #22d3ee 80%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; text-fill-color: transparent;
          filter: drop-shadow(0 0 8px #22d3ee);
        }
        .lang-selector-animated {
          animation: langRollIn 1.1s cubic-bezier(.5,1.5,.5,1) 0.7s both;
          position: relative; z-index: 20;
          background: rgba(34, 40, 49, 0.85);
          border-radius: 24px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1.5px solid rgba(255,255,255,0.12);
          padding: 32px 40px; margin-top: 8vh;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; gap: 18px;
        }
        @keyframes langRollIn {
          0% { opacity: 0; transform: translateX(-120px) rotate(-30deg) scale(0.7); }
          60% { opacity: 1; transform: translateX(12px) rotate(8deg) scale(1.1); }
          80% { transform: translateX(0) rotate(-2deg) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) rotate(0) scale(1); }
        }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={glassCard}>
          <h1 className="soccer-title-animated" style={titleFont}>
            <span role="img" aria-label="soccer ball" style={{fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #22d3ee)'}}>⚽️</span>
            Soccer Director 2025
            <span role="img" aria-label="soccer ball" style={{fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #4ade80)'}}>⚽️</span>
          </h1>
          {/* Remove <img src="/Images/Soccer Director 2025 Title Screen.webp" ... /> if the asset is missing or not premium */}
          {/* 4. Center the glassy, animated language selector card with a soccer ball accent */}
          <div className="lang-selector-animated" style={{ marginBottom: 18, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <span role="img" aria-label="soccer ball" style={{fontSize: 28, marginRight: 6, filter: 'drop-shadow(0 0 6px #22d3ee)'}}>⚽️</span>
            <LanguageSelector />
          </div>
          <button
            style={{ ...glowBtn, display: 'flex', alignItems: 'center', gap: 12 }}
            onClick={onStartGame}
            aria-label={t('Press to Start')}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/language-selector'); }}
          >
            <FontAwesomeIcon icon={faPlay} style={{ fontSize: 28, marginRight: 8, filter: 'drop-shadow(0 0 6px #22d3ee)' }} aria-hidden="true" />
            {t('Press to Start')}
          </button>
          <button
            style={{ ...glowBtn, fontSize: '1.25rem', padding: '0.75rem 1.5rem', marginTop: 12 }}
            onClick={() => navigate('/highlight-demo')}
          >
            Highlight Demo
          </button>
          <div style={versionBadge}>{t('v0.1 Alpha')}</div>
        </div>
      </div>
      <div style={{ ...footerStyle, animation: 'footerFadeIn 1.2s 0.5s both' }}>
        <span>Crafted with ⚽️ by the Football Director Team &mdash; <span style={{ color: '#fff', fontWeight: 700 }}>Cursor AI</span></span>
      </div>
    </div>
  );
};

export default TitleScreenPage; 