import React from 'react';

// You may need to adjust these paths if you move images to public/assets
const silhouettes = [
  '/images/soccer_silhouette1.png',
  '/images/soccer_silhouette3.png',
  '/images/soccer_silhouette4.png',
  '/images/soccer_silhouette5.png',
  '/images/soccer_silhouette6.png',
  '/images/soccer_silhouette7.png',
];

const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 0, background: 'radial-gradient(ellipse at 60% 40%, #4ade80 0%, #1e293b 60%, #111827 100%)' }}>
      {/* Animated silhouettes */}
      {silhouettes.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="soccer silhouette"
          style={{
            position: 'absolute',
            left: i % 2 === 0 ? '-15vw' : '110vw',
            top: `${20 + i * 10}%`,
            width: '12vw',
            height: 'auto',
            opacity: 0.22 + 0.08 * (i % 3),
            filter: 'drop-shadow(0 0 32px #22d3ee) drop-shadow(0 0 16px #4ade80) grayscale(0.2)',
            animation: `${i % 2 === 0 ? 'runRight' : 'runLeft'} 18s linear infinite`,
            animationDelay: `${i * 2.5}s`,
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'filter 0.3s',
          }}
        />
      ))}
      {/* Animated background title (faint, huge, behind everything) */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '7vw',
        fontWeight: 900,
        color: '#fff',
        opacity: 0.07,
        letterSpacing: 8,
        textShadow: '0 8px 32px #22d3ee, 0 2px 8px #4ade80',
        fontFamily: 'Bebas Neue, Orbitron, Arial Black, sans-serif',
        userSelect: 'none',
        zIndex: 0,
        animation: 'titlePulse 6s ease-in-out infinite',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        Soccer Director 2025
      </div>
      {/* Keyframes for animation */}
      <style>{`
        @keyframes runRight {
          0% { left: -15vw; }
          100% { left: 110vw; }
        }
        @keyframes runLeft {
          0% { left: 110vw; }
          100% { left: -15vw; }
        }
        @keyframes titlePulse {
          0%, 100% { opacity: 0.07; letter-spacing: 8px; }
          50% { opacity: 0.13; letter-spacing: 18px; }
        }
        @keyframes titleGradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100vw', height: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground; 