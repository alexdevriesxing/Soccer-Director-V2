import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface MatchEvent {
  minute: number;
  type: 'goal' | 'near_miss' | 'save' | 'yellow' | 'red' | 'foul' | 'substitution' | 'injury_time';
  playerId?: string;
  playerName?: string;
  team?: 'home' | 'away';
  description: string;
  isPenalty?: boolean;
  subIn?: string;
  injuryTime?: number;
}

interface KitColors {
  shirt: string;
  shorts: string;
  socks: string;
}

interface PlayerRenderData {
  x: number;
  y: number;
  position: string;
  name: string;
  skinColor: string;
  [key: string]: any;
}

interface PixelArtMatchViewerProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  currentEvent: MatchEvent | null;
  onEventComplete: () => void;
  onMatchComplete: () => void;
  isPaused: boolean;
  onPauseToggle: () => void;
  isFinal?: boolean;
  homeClubId?: number;
  awayClubId?: number;
  homePlayers?: PlayerRenderData[];
  awayPlayers?: PlayerRenderData[];
}

const PixelArtMatchViewer: React.FC<PixelArtMatchViewerProps> = ({
  homeTeam,
  awayTeam,
  homeScore: initialHomeScore,
  awayScore: initialAwayScore,
  minute,
  currentEvent,
  onEventComplete,
  onMatchComplete,
  isPaused,
  onPauseToggle,
  isFinal,
  homeClubId,
  awayClubId,
  homePlayers,
  awayPlayers
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 600, y: 300 });
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [highlightAnimation, setHighlightAnimation] = useState<{
    type: 'goal' | 'near_miss' | 'save' | 'yellow' | 'red' | 'substitution';
    team: 'home' | 'away';
    playerName: string;
    progress: number;
    isPenalty?: boolean;
    subIn?: string;
  } | null>(null);
  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);

  // Responsive canvas size (default 1200x600, 2:1 ratio)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });

  // Camera shake for highlights
  const [shakeFrame, setShakeFrame] = useState(0);

  // Generate random skin colors for players
  const skinColors = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
  
  // Kit colors state - will be fetched from backend
  const [homeTeamColors, setHomeTeamColors] = useState<KitColors>({ 
    shirt: '#ff6b6b', 
    shorts: '#cc5555', 
    socks: '#ff6b6b' 
  });
  const [awayTeamColors, setAwayTeamColors] = useState<KitColors>({ 
    shirt: '#4ecdc4', 
    shorts: '#3da89e', 
    socks: '#4ecdc4' 
  });

  // Track which kit type each team is wearing
  const [homeKitType, setHomeKitType] = useState<'home' | 'away'>('home');
  const [awayKitType, setAwayKitType] = useState<'home' | 'away'>('home');

  // Fetch kit colors from backend
  useEffect(() => {
    const fetchKitColors = async () => {
      if (homeClubId && awayClubId) {
        try {
          const response = await fetch(`/api/match-kit-colors/${homeClubId}/${awayClubId}`);
          if (response.ok) {
            const kitColors = await response.json();
            setHomeTeamColors(kitColors.home);
            setAwayTeamColors(kitColors.away);
            
            // Determine kit types based on whether away team is wearing away kit
            // If away team colors are different from their default home colors, they're wearing away kit
            setHomeKitType('home'); // Home team always wears home kit
            setAwayKitType('away'); // Away team wears away kit if there was a clash
          }
        } catch (error) {
          console.error('Failed to fetch kit colors:', error);
          // Keep default colors if fetch fails
        }
      }
    };

    fetchKitColors();
  }, [homeClubId, awayClubId]);

  // Larger pixel art player positions (4-4-2 formation) - 11 players each
  const defaultHomeFormation: PlayerRenderData[] = [
    { x: 120, y: 300, position: 'GK', name: 'Goalkeeper', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 250, y: 180, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 250, y: 420, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 350, y: 220, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 350, y: 380, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 500, y: 180, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 500, y: 420, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 600, y: 220, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 600, y: 380, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 750, y: 220, position: 'FWD', name: 'Forward', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 750, y: 380, position: 'FWD', name: 'Forward', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] }
  ];

  const defaultAwayFormation: PlayerRenderData[] = [
    { x: 1080, y: 300, position: 'GK', name: 'Goalkeeper', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 950, y: 180, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 950, y: 420, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 850, y: 220, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 850, y: 380, position: 'DEF', name: 'Defender', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 700, y: 180, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 700, y: 420, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 600, y: 220, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 600, y: 380, position: 'MID', name: 'Midfielder', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 450, y: 220, position: 'FWD', name: 'Forward', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] },
    { x: 450, y: 380, position: 'FWD', name: 'Forward', skinColor: skinColors[Math.floor(Math.random() * skinColors.length)] }
  ];

  // Select which player arrays to use for rendering
  const homePlayersArr: PlayerRenderData[] = Array.isArray(homePlayers) && homePlayers.length === 11
    ? homePlayers : defaultHomeFormation;
  const awayPlayersArr: PlayerRenderData[] = Array.isArray(awayPlayers) && awayPlayers.length === 11
    ? awayPlayers : defaultAwayFormation;


  // Preload and reuse audio objects
  const audioObjects = {
    whistle: new window.Audio('/audio/whistle.mp3'),
    halftime: new window.Audio('/audio/halftime.mp3'),
    final: new window.Audio('/audio/final.mp3'),
    cheer: new window.Audio('/audio/cheer.mp3'),
    crowd: new window.Audio('/audio/crowd.mp3'),
  };

  // Add pixel font import (for overlays)
  const PIXEL_FONT_URL = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.href = PIXEL_FONT_URL;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  const containerRef = useRef<HTMLDivElement>(null);

  // Mute state
  const [isMuted, setIsMuted] = useState(false);

  // Scoreboard animation state
  const [scoreboardAnim, setScoreboardAnim] = useState(false);

  // Weather type (rain or snow, chosen once per match)
  const [weather, setWeather] = useState<'rain' | 'snow' | null>(null);
  useEffect(() => {
    setWeather(Math.random() < 0.5 ? 'rain' : 'snow');
  }, []);

  // Goal net ripple animation state
  const [netRipple, setNetRipple] = useState<{side: 'home'|'away', frame: number}|null>(null);
  useEffect(() => {
    if (currentEvent && currentEvent.type === 'goal') {
      setNetRipple({ side: currentEvent.team || 'home', frame: 0 });
    }
  }, [currentEvent]);
  useEffect(() => {
    if (!netRipple) return;
    if (netRipple.frame > 20) {
      setNetRipple(null);
      return;
    }
    const t = setTimeout(() => setNetRipple(n => n ? { ...n, frame: n.frame + 1 } : null), 16);
    return () => clearTimeout(t);
  }, [netRipple]);

  // Animated event text overlay state
  const [eventTextAnim, setEventTextAnim] = useState(0);
  useEffect(() => {
    if (highlightAnimation && ['goal','yellow','red'].includes(highlightAnimation.type)) {
      setEventTextAnim(0);
      let frame = 0;
      const animate = () => {
        setEventTextAnim(frame);
        frame++;
        if (frame <= 30) requestAnimationFrame(animate);
      };
      animate();
    }
  }, [highlightAnimation]);

  // Add isFinal prop for confetti
  const [celebration, setCelebration] = useState<null | { team: 'home' | 'away'; frame: number }>(null);
  const [confetti, setConfetti] = useState(false);

  // Trigger celebration and shake on goal
  useEffect(() => {
    if (currentEvent && currentEvent.type === 'goal') {
      setCelebration({ team: currentEvent.team || 'home', frame: 0 });
      setShakeFrame(12);
      if (isFinal) setConfetti(true);
    }
  }, [currentEvent, isFinal]);
  // Animate celebration
  useEffect(() => {
    if (!celebration) return;
    if (celebration.frame > 40) {
      setCelebration(null);
      return;
    }
    const t = setTimeout(() => setCelebration(c => c ? { ...c, frame: c.frame + 1 } : null), 16);
    return () => clearTimeout(t);
  }, [celebration]);
  // Animate shake
  useEffect(() => {
    if (shakeFrame <= 0) return;
    const t = setTimeout(() => setShakeFrame(f => f - 1), 16);
    return () => clearTimeout(t);
  }, [shakeFrame]);
  // Confetti for finals after final whistle
  useEffect(() => {
    if (isFinal && minute === 90) setConfetti(true);
  }, [isFinal, minute]);

  // Wrap playSound in useCallback
  const playSound = useCallback((audio: HTMLAudioElement, volume = 1) => {
    if (isMuted) return;
    try {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play();
    } catch (e) {
      // Ignore playback errors
    }
  }, [isMuted]);

  // Play starting whistle at match start
  useEffect(() => {
    if (minute === 1) playSound(audioObjects.whistle, 0.7);
  }, [minute, playSound, audioObjects.whistle]);
  // Play halftime whistle
  useEffect(() => {
    if (minute === 45) playSound(audioObjects.halftime, 0.7);
  }, [minute, playSound, audioObjects.halftime]);
  // Play final whistle
  useEffect(() => {
    if (minute === 90) playSound(audioObjects.final, 0.7);
  }, [minute, playSound, audioObjects.final]);
  // Play crowd cheer on goal
  useEffect(() => {
    if (highlightAnimation && highlightAnimation.type === 'goal') playSound(audioObjects.cheer, 1);
  }, [highlightAnimation, playSound, audioObjects.cheer]);
  // Play generic crowd sound for other highlights
  useEffect(() => {
    if (highlightAnimation && ['save','near_miss','yellow','red','substitution'].includes(highlightAnimation.type)) playSound(audioObjects.crowd, 0.5);
  }, [highlightAnimation, playSound, audioObjects.crowd]);

  // Handle highlight animations
  useEffect(() => {
    if (currentEvent && (currentEvent.type === 'goal' || currentEvent.type === 'near_miss' || currentEvent.type === 'save')) {
      console.log('Starting highlight animation for:', currentEvent);
      setHighlightAnimation({
        type: currentEvent.type,
        team: currentEvent.team || 'home',
        playerName: currentEvent.playerName || 'Player',
        progress: 0
      });
      
      // Animate the highlight
      const animateHighlight = () => {
        setHighlightAnimation(prev => {
          if (!prev) return null;
          
          if (prev.progress >= 1) {
            // Animation complete
            console.log('Highlight animation complete');
            setTimeout(() => {
              onEventComplete();
            }, 1000);
            return null;
          }
          
          return { ...prev, progress: prev.progress + 0.02 };
        });
      };
      
      const interval = setInterval(animateHighlight, 50);
      return () => clearInterval(interval);
    }
  }, [currentEvent, onEventComplete]);

  // Update score when a goal event occurs
  useEffect(() => {
    if (currentEvent && currentEvent.type === 'goal') {
      if (currentEvent.team === 'home') {
        setHomeScore((prev) => prev + 1);
      } else {
        setAwayScore((prev) => prev + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent]);

  // Animate scoreboard on goal
  useEffect(() => {
    if (currentEvent && currentEvent.type === 'goal') {
      setScoreboardAnim(true);
      const timeout = setTimeout(() => setScoreboardAnim(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [currentEvent]);

  // Stadium backgrounds and time of day
  const stadiums = [
    { name: 'Classic', color: '#2d5a27', stands: '#444' },
    { name: 'Urban', color: '#3a3a4d', stands: '#222' },
    { name: 'Rural', color: '#4e7d4e', stands: '#3a6b34' },
    { name: 'Modern', color: '#2b3a67', stands: '#5c677d' }
  ];
  const timesOfDay = [
    { name: 'Morning', overlay: 'rgba(255,220,180,0.12)' },
    { name: 'Afternoon', overlay: 'rgba(255,255,255,0.08)' },
    { name: 'Evening', overlay: 'rgba(80,120,255,0.18)' }
  ];
  const [stadium, setStadium] = useState(stadiums[Math.floor(Math.random() * stadiums.length)]);
  const [timeOfDay, setTimeOfDay] = useState(timesOfDay[Math.floor(Math.random() * timesOfDay.length)]);

  // Crowd wave state
  const [waveFrame, setWaveFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setWaveFrame(f => (f + 1) % 200), 100);
    return () => clearInterval(interval);
  }, []);

  // Draw pixel scoreboard with flipping digits and ticking clock
  const drawScoreboard = (ctx: CanvasRenderingContext2D, width: number, home: number, away: number, minute: number, anim: number) => {
    // Scoreboard background
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#222';
    ctx.fillRect(width/2 - 120, 18, 240, 54);
    ctx.globalAlpha = 1;
    // Animated flipping digits
    const flip = (val: number, x: number) => {
      const digit = Math.floor(val);
      const nextDigit = (digit + 1) % 10;
      const frac = (anim % 20) / 20;
      ctx.save();
      ctx.font = 'bold 40px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffe066';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x-18, 30, 36, 36);
      ctx.clip();
      ctx.globalAlpha = 1 - frac;
      ctx.fillText(digit.toString(), x, 48);
      ctx.globalAlpha = frac;
      ctx.fillText(nextDigit.toString(), x, 48 + 36 * frac);
      ctx.restore();
      ctx.restore();
    };
    flip(home, width/2 - 40);
    flip(away, width/2 + 40);
    // Separator
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.8;
    ctx.fillText('-', width/2, 48);
    ctx.globalAlpha = 1;
    // Ticking clock
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillStyle = '#4ecdc4';
    const min = Math.floor(minute).toString().padStart(2,'0');
    const sec = ((anim*3)%60).toString().padStart(2,'0');
    ctx.fillText(`${min}:${sec}`, width/2, 80);
    ctx.restore();
  };

  // Draw stadium background and stands
  const drawStadium = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stadium: { name: string; color: string; stands: string },
  timeOfDay: { name: string; overlay: string }
): void => {
    ctx.save();
    ctx.fillStyle = stadium.color;
    ctx.fillRect(0, 0, width, height);
    // Stands
    ctx.fillStyle = stadium.stands;
    ctx.fillRect(0, 0, width, 40);
    ctx.fillRect(0, height-40, width, 40);
    // Time of day overlay
    ctx.fillStyle = timeOfDay.overlay;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  // Mascot and ball kid state
  const [mascot, setMascot] = useState<{x: number, y: number, frame: number, dir: 1|-1}|null>(null);
  const [ballKid, setBallKid] = useState<{x: number, y: number, frame: number, dir: 1|-1}|null>(null);
  // Fireworks/laser show state
  const [fireworks, setFireworks] = useState(false);
  const [fireworkFrame, setFireworkFrame] = useState(0);
  // Substitution board state
  const [subBoard, setSubBoard] = useState<{frame: number, out: string, in: string}|null>(null);
  // Easter egg state
  const [easterEgg, setEasterEgg] = useState<{type: 'ufo'|'dog', x: number, y: number, frame: number, dir: 1|-1}|null>(null);

  // Mascot random trigger
  useEffect(() => {
    if (!mascot && Math.random() < 0.002) {
      setMascot({ x: -40, y: 60, frame: 0, dir: 1 });
    }
    if (mascot && mascot.x > canvasSize.width + 40) setMascot(null);
    if (mascot) {
      const t = setTimeout(() => setMascot(m => m ? { ...m, x: m.x + 3, frame: m.frame + 1 } : null), 30);
      return () => clearTimeout(t);
    }
  }, [mascot, canvasSize.width]);
  // Ball kid random trigger (after goal)
  useEffect(() => {
    if (currentEvent && currentEvent.type === 'goal' && Math.random() < 0.7) {
      setBallKid({ x: canvasSize.width + 40, y: canvasSize.height - 60, frame: 0, dir: -1 });
    }
    if (ballKid && ballKid.x < -40) setBallKid(null);
    if (ballKid) {
      const t = setTimeout(() => setBallKid(b => b ? { ...b, x: b.x - 4, frame: b.frame + 1 } : null), 30);
      return () => clearTimeout(t);
    }
  }, [ballKid, currentEvent, canvasSize.width, canvasSize.height]);
  // Fireworks/laser show for finals
  useEffect(() => {
    if (isFinal && (minute === 90 || confetti)) {
      setFireworks(true);
      setFireworkFrame(0);
    }
  }, [isFinal, minute, confetti]);
  useEffect(() => {
    if (!fireworks) return;
    if (fireworkFrame > 120) { setFireworks(false); return; }
    const t = setTimeout(() => setFireworkFrame(f => f + 1), 30);
    return () => clearTimeout(t);
  }, [fireworks, fireworkFrame]);
  // Substitution board on substitution event
  useEffect(() => {
    if (currentEvent && currentEvent.type === 'substitution' && currentEvent.playerName && currentEvent.subIn) {
      setSubBoard({ frame: 0, out: currentEvent.playerName, in: currentEvent.subIn });
    }
    if (subBoard && subBoard.frame > 40) setSubBoard(null);
    if (subBoard) {
      const t = setTimeout(() => setSubBoard(s => s ? { ...s, frame: s.frame + 1 } : null), 30);
      return () => clearTimeout(t);
    }
  }, [currentEvent, subBoard]);
  // Easter egg: rare UFO or dog
  useEffect(() => {
    if (!easterEgg && Math.random() < 0.0005) {
      const type = Math.random() < 0.5 ? 'ufo' : 'dog';
      setEasterEgg({ type, x: -60, y: 120 + Math.random()*200, frame: 0, dir: 1 });
    }
    if (easterEgg && easterEgg.x > canvasSize.width + 60) setEasterEgg(null);
    if (easterEgg) {
      const t = setTimeout(() => setEasterEgg(e => e ? { ...e, x: e.x + 5, frame: e.frame + 1 } : null), 30);
      return () => clearTimeout(t);
    }
  }, [easterEgg, canvasSize.width]);

  // Draw mascot
  const drawMascot = (
    ctx: CanvasRenderingContext2D,
    mascot: null | { x: number; y: number; frame: number; dir: 1 | -1 }
  ) => {
    if (!mascot) return;
    ctx.save();
    ctx.fillStyle = '#ffb347'; // mascot body
    ctx.fillRect(mascot.x, mascot.y, 24, 32);
    ctx.fillStyle = '#fff'; // mascot face
    ctx.fillRect(mascot.x + 4, mascot.y - 12, 16, 16);
    ctx.fillStyle = '#000'; // eyes
    ctx.fillRect(mascot.x + 8, mascot.y - 8, 3, 3);
    ctx.fillRect(mascot.x + 13, mascot.y - 8, 3, 3);
    ctx.fillStyle = '#ff6b6b'; // mascot shirt
    ctx.fillRect(mascot.x, mascot.y + 12, 24, 12);
    ctx.restore();
  };
  // Draw ball kid
  const drawBallKid = (
    ctx: CanvasRenderingContext2D,
    ballKid: null | { x: number; y: number; frame: number; dir: 1 | -1 }
  ) => {
    if (!ballKid) return;
    ctx.save();
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(ballKid.x, ballKid.y, 16, 24);
    ctx.fillStyle = '#fff';
    ctx.fillRect(ballKid.x + 3, ballKid.y - 6, 10, 10);
    ctx.fillStyle = '#000';
    ctx.fillRect(ballKid.x + 6, ballKid.y - 3, 2, 2);
    ctx.restore();
  };
  // Draw fireworks/lasers
  const drawFireworks = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number
): void => {
    if (!fireworks) return;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + frame * 0.1;
      const x = width / 2 + Math.cos(angle) * 200;
      const y = 80 + Math.sin(angle) * 60;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = ['#ff6b6b','#ffe066','#4ecdc4','#3333ff','#fff'][i%5];
      ctx.beginPath();
      ctx.arc(x, y, 18 + Math.sin(frame*0.2+i)*8, 0, 2*Math.PI);
      ctx.fill();
      // Lasers
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width/2, 80);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }
  };
  // Draw substitution board
  const drawSubBoard = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  subBoard: { frame: number; out: string; in: string } | null
): void => {
    if (!subBoard) return;
    ctx.save();
    const y = height/2 - 100 + Math.sin(subBoard.frame*0.2)*8;
    ctx.fillStyle = '#222';
    ctx.fillRect(width/2-70, y, 140, 48);
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(subBoard.out, width/2-30, y+32);
    ctx.fillStyle = '#a3e635';
    ctx.fillText(subBoard.in, width/2+30, y+32);
    ctx.restore();
  };
  // Draw easter egg
  const drawEasterEgg = (
  ctx: CanvasRenderingContext2D,
  easterEgg: { type: 'ufo' | 'dog'; x: number; y: number; frame: number; dir: 1 | -1 } | null
): void => {
    if (!easterEgg) return;
    ctx.save();
    if (easterEgg.type === 'ufo') {
      ctx.fillStyle = '#b0e0e6';
      ctx.beginPath();
      ctx.ellipse(easterEgg.x, easterEgg.y, 32, 12, 0, 0, 2*Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(easterEgg.x, easterEgg.y-8, 12, 0, 2*Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(easterEgg.x-4, easterEgg.y+8, 8, 8);
    } else {
      ctx.fillStyle = '#c68642';
      ctx.fillRect(easterEgg.x, easterEgg.y, 24, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(easterEgg.x+16, easterEgg.y-6, 8, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(easterEgg.x+20, easterEgg.y-4, 2, 2);
    }
    ctx.restore();
  };

  // Unified animation and drawing logic
  useEffect(() => {
    if (isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;

    const animate = (timestamp: number) => {
      setAnimationFrame((prev) => prev + 1);
      // Ball physics
      setBallPosition((prev) => {
        let newX = prev.x + ballVelocity.x;
        let newY = prev.y + ballVelocity.y;
        let newVelX = ballVelocity.x;
        let newVelY = ballVelocity.y;
        if (newX <= 20 || newX >= 1180) newVelX = -ballVelocity.x * 0.8;
        if (newY <= 20 || newY >= 580) newVelY = -ballVelocity.y * 0.8;
        newVelX += (Math.random() - 0.5) * 2;
        newVelY += (Math.random() - 0.5) * 2;
        newVelX *= 0.98;
        newVelY *= 0.98;
        setBallVelocity({ x: newVelX, y: newVelY });
        return {
          x: Math.max(20, Math.min(1180, newX)),
          y: Math.max(20, Math.min(580, newY))
        };
      });
      // Draw everything
      drawAll(ctx);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, ballVelocity, highlightAnimation, animationFrame]);

  // Animate ball and players when not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      
      // Improved ball physics
      setBallPosition(prev => {
        const newX = prev.x + ballVelocity.x;
        const newY = prev.y + ballVelocity.y;
        
        // Bounce off walls
        let newVelX = ballVelocity.x;
        let newVelY = ballVelocity.y;
        
        if (newX <= 20 || newX >= 1180) {
          newVelX = -ballVelocity.x * 0.8;
        }
        if (newY <= 20 || newY >= 580) {
          newVelY = -ballVelocity.y * 0.8;
        }
        
        // Add some random movement
        newVelX += (Math.random() - 0.5) * 2;
        newVelY += (Math.random() - 0.5) * 2;
        
        // Apply friction
        newVelX *= 0.98;
        newVelY *= 0.98;
        
        setBallVelocity({ x: newVelX, y: newVelY });
        
        return {
          x: Math.max(20, Math.min(1180, newX)),
          y: Math.max(20, Math.min(580, newY))
        };
      });
    }, 50); // Faster animation

    return () => clearInterval(interval);
  }, [isPaused, ballVelocity]);

  // Add subtle player movement
  const getAnimatedPlayerPositions = useMemo(() => (baseFormation: any[]) => {
    return baseFormation.map((player, index) => {
      const time = animationFrame * 0.1;
      const movementRange = 8;
      const movementSpeed = 0.5 + (index % 3) * 0.2;
      return {
        ...player,
        x: player.x + Math.sin(time * movementSpeed + index) * movementRange,
        y: player.y + Math.cos(time * movementSpeed + index * 0.7) * movementRange * 0.5
      };
    });
  }, [animationFrame]);

  const drawPixelField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // No background fill here, handled by drawStadium
    // Field lines - clean and pixelated
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;

    // Center line
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 80, 0, 2 * Math.PI);
    ctx.stroke();

    // Center spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Penalty areas
    ctx.strokeRect(0, height / 4, width / 4, height / 2);
    ctx.strokeRect(width * 3 / 4, height / 4, width / 4, height / 2);

    // Goal areas
    ctx.strokeRect(0, height / 3, width / 6, height / 3);
    ctx.strokeRect(width * 5 / 6, height / 3, width / 6, height / 3);

    // Corner arcs
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width, 0, 30, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, height, 30, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width, height, 30, Math.PI, -Math.PI / 2);
    ctx.stroke();

    // Goals
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, height / 2 - 40, 20, 80);
    ctx.fillRect(width - 20, height / 2 - 40, 20, 80);

    // Goal posts
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - 40);
    ctx.lineTo(0, height / 2 + 40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width, height / 2 - 40);
    ctx.lineTo(width, height / 2 + 40);
    ctx.stroke();

    // Vignette
    const grad = ctx.createRadialGradient(width/2, height/2, width/2.2, width/2, height/2, width/1.1);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  };

  // --- SPRITE PRELOADER ---
  // Sprite structure: { [team]: { [action]: { [direction]: HTMLImageElement } } }
  const spriteActions = ['Run', 'Kick', 'Goal Keeper', 'Celebration'] as const;
  const spriteDirections = [
    'NORTH', 'SOUTH', 'EAST', 'WEST',
    'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST'
  ] as const;
  type SpriteAction = typeof spriteActions[number];
  type SpriteDirection = typeof spriteDirections[number];
  type SpriteMap = Record<string, Record<string, Record<string, HTMLImageElement>>>;

  // Map club/team to sprite folder (expand as needed)
  const teamSpriteKey = (team: string) => {
    // Example: Ajax, PSV, Feyenoord = 'Team A'; Utrecht, AZ = 'Team B', etc.
    const teamA = ['Ajax', 'PSV', 'Feyenoord', 'AZ', 'Utrecht'];
    return teamA.includes(team) ? 'Team A' : 'Team B';
  };

  // Preload all white skin tone sprites for Team A and Team B
  const [sprites, setSprites] = useState<SpriteMap>({});
  useEffect(() => {
    const basePath = '/images/White Skin Tone';
    const teams = ['Team A', 'Team B'];
    const newSprites: SpriteMap = {};
    teams.forEach(team => {
      newSprites[team] = {};
      spriteActions.forEach(action => {
        newSprites[team][action] = {};
        spriteDirections.forEach(dir => {
          let fileName = `${team.replace(' ', '_')}_${action.replace(' ', '_')}_${dir}`;
          if (action === 'Run') fileName += '_strip4';
          fileName += '.png';
          const img = new window.Image();
          img.src = `${basePath}/${team} ${action}/${fileName}`;
          newSprites[team][action][dir] = img;
        });
      });
    });
    setSprites(newSprites);
  }, []);

  // Helper to get the sprite for a player
  const getPlayerSprite = (
    team: string,
    action: SpriteAction,
    direction: SpriteDirection
  ): HTMLImageElement | null => {
    const teamKey = teamSpriteKey(team);
    try {
      return sprites?.[teamKey]?.[action]?.[direction] || null;
    } catch {
      return null;
    }
  };

  // Helper to get direction based on movement (default SOUTH)
  const getDirection = (player: PlayerRenderData): SpriteDirection => {
    // You can expand this logic to use velocity or event context
    return 'SOUTH';
  };

  // Helper to get animation frame (for run: 4 frames, for kick: 1 frame)
  const getFrame = (action: SpriteAction, anim: number): number => {
    if (action === 'Run') return Math.floor(anim / 8) % 4; // 4 frames, cycle every 8 ticks
    return 0;
  };

  // --- KIT RECOLOR CACHE ---
  // Cache recolored sprites per kit combination for performance
  const recolorCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Utility: recolor sprite by replacing base colors with kit colors
  function recolorSprite(
    sprite: HTMLImageElement,
    frame: number,
    kitColors: { shirt: string; shorts: string; socks: string; }
  ): HTMLCanvasElement {
    const cacheKey = `${sprite.src}|${frame}|${kitColors.shirt}|${kitColors.shorts}|${kitColors.socks}`;
    if (recolorCache.current.has(cacheKey)) {
      return recolorCache.current.get(cacheKey)!;
    }
    const frameW = sprite.width / 4;
    const frameH = sprite.height;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = frameW;
    offCanvas.height = frameH;
    const offCtx = offCanvas.getContext('2d')!;
    offCtx.clearRect(0, 0, frameW, frameH);
    offCtx.drawImage(sprite, frame * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);
    const imgData = offCtx.getImageData(0, 0, frameW, frameH);
    const data = imgData.data;
    // Define base kit colors (as used in original sprites)
    const baseShirt: [number, number, number] = [255,255,255]; // white
    const baseShorts: [number, number, number] = [0,0,255]; // blue
    const baseSocks: [number, number, number] = [255,0,0]; // red
    // Convert kitColors to RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace('#','');
      return [parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)];
    };
    const shirtRGB = hexToRgb(kitColors.shirt);
    const shortsRGB = hexToRgb(kitColors.shorts);
    const socksRGB = hexToRgb(kitColors.socks);
    // Helper: color distance
    const colorDist = (
      r1: number, g1: number, b1: number,
      r2: number, g2: number, b2: number
    ): number => Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
    for(let i=0;i<data.length;i+=4){
      if(data[i+3]<128) continue; // skip transparent
      // Shirt (white in sprite)
      if(colorDist(data[i],data[i+1],data[i+2],...baseShirt)<50){
        data[i]=shirtRGB[0]; data[i+1]=shirtRGB[1]; data[i+2]=shirtRGB[2];
      }
      // Shorts (blue in sprite)
      else if(colorDist(data[i],data[i+1],data[i+2],...baseShorts)<50){
        data[i]=shortsRGB[0]; data[i+1]=shortsRGB[1]; data[i+2]=shortsRGB[2];
      }
      // Socks (red in sprite)
      else if(colorDist(data[i],data[i+1],data[i+2],...baseSocks)<50){
        data[i]=socksRGB[0]; data[i+1]=socksRGB[1]; data[i+2]=socksRGB[2];
      }
    }
    offCtx.putImageData(imgData,0,0);
    recolorCache.current.set(cacheKey, offCanvas);
    return offCanvas;
  }

  // --- REFACTORED DRAW PIXEL PLAYERS ---
  const drawPixelPlayers = (
  ctx: CanvasRenderingContext2D,
  players: PlayerRenderData[],
  teamColors: KitColors,
  team: 'home' | 'away',
  anim: number = 0,
  action: SpriteAction = 'Run'
): void => {
    players.forEach((player, index) => {
      const x = player.x;
      const y = player.y;
      const direction = getDirection(player) as SpriteDirection;
      const frame = getFrame(action, anim);
      const sprite = getPlayerSprite(team === 'home' ? homeTeam : awayTeam, action, direction);
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        // Recolor the sprite with the club's kit colors
        const recolored = recolorSprite(sprite, frame, teamColors);
        ctx.drawImage(
          recolored,
          x - recolored.width / 2, y - recolored.height / 2
        );
      } else {
        // Fallback: procedural drawing
        ctx.fillStyle = teamColors.shirt;
        ctx.fillRect(x - 12, y - 16, 24, 16);
        ctx.fillStyle = teamColors.shorts;
        ctx.fillRect(x - 10, y, 20, 12);
        ctx.fillStyle = player.skinColor;
        ctx.fillRect(x - 8, y - 24, 16, 16);
      }
    });
  };

  const drawPixelBall = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x - 8, y + 8, 16, 6);
    
    // Ball body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, y - 8, 16, 16);
    
    // Ball outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 8, y - 8, 16, 16);
    
    // Ball pattern - more detailed
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 4, y - 4, 8, 8);
    
    // Ball highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y - 6, 3, 3);
    ctx.fillRect(x + 3, y - 6, 3, 3);
  };

  const drawHighlightAnimation = (ctx: CanvasRenderingContext2D, animation: any) => {
    const { type, team, playerName, progress, isPenalty, subIn } = animation;
    const width = 1200;
    const height = 600;
    // Camera shake effect
    const shake = Math.sin(progress * 50) * (10 - progress * 10);
    ctx.save();
    ctx.translate(shake, shake);
    // Darken the field during highlight
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + progress * 0.4})`;
    ctx.fillRect(0, 0, width, height);
    // Highlight glow effect
    let glowColor = '#ffd700';
    if (type === 'near_miss') glowColor = '#ff6b6b';
    if (type === 'save') glowColor = '#4ecdc4';
    if (type === 'yellow') glowColor = '#ffe066';
    if (type === 'red') glowColor = '#ff3333';
    if (type === 'substitution') glowColor = '#a3e635';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20 + progress * 30;
    // Animated text
    let message = '';
    let icon = '';
    switch (type) {
      case 'goal':
        message = isPenalty ? `PENALTY GOAL! ${playerName}` : `GOAL! ${playerName}`;
        icon = isPenalty ? '⚽️🅿️' : '⚽';
        break;
      case 'near_miss':
        message = isPenalty ? `PENALTY MISSED! ${playerName}` : `NEAR MISS! ${playerName}`;
        icon = isPenalty ? '❌🅿️' : '💨';
        break;
      case 'save':
        message = `AMAZING SAVE! ${playerName}`;
        icon = '🧤';
        break;
      case 'yellow':
        message = `YELLOW CARD! ${playerName}`;
        icon = '🟨';
        break;
      case 'red':
        message = `RED CARD! ${playerName} sent off`;
        icon = '🟥';
        break;
      case 'substitution':
        message = `SUBSTITUTION: ${playerName} → ${subIn}`;
        icon = '🔄';
        break;
    }
    const fontSize = 24 + progress * 16;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = glowColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textY = height / 2 - 50 + Math.sin(progress * Math.PI * 4) * 20;
    ctx.fillText(icon, width / 2, textY - 30);
    ctx.fillText(message, width / 2, textY);
    // Special visuals for each type
    if (type === 'yellow' || type === 'red') {
      // Draw referee holding card
      ctx.fillStyle = '#222';
      ctx.fillRect(width/2-20, textY+40, 40, 80); // body
      ctx.fillStyle = '#ffe066';
      if (type === 'red') ctx.fillStyle = '#ff3333';
      ctx.fillRect(width/2-5, textY+10, 20, 30); // card
      ctx.fillStyle = '#222';
      ctx.fillRect(width/2+5, textY+40, 10, 40); // arm
      // Player leaving for red card
      if (type === 'red') {
        ctx.fillStyle = '#888';
        ctx.fillRect(width/2+60, textY+60, 30, 60); // player leaving
      }
    }
    if (type === 'substitution') {
      // Draw two players, one leaving, one entering
      ctx.fillStyle = '#888';
      ctx.fillRect(width/2-60, textY+60, 30, 60); // out
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(width/2+60, textY+60, 30, 60); // in
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#333';
      ctx.fillText(playerName, width/2-45, textY+100);
      ctx.fillText(subIn, width/2+75, textY+100);
    }
    if (isPenalty) {
      // Draw penalty spot and ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(width/2, height/2+120, 8, 0, 2*Math.PI);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.fillRect(width/2-2, height/2+100, 4, 40); // penalty mark
    }
    // Team indicator
    const teamText = team === 'home' ? homeTeam : awayTeam;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(teamText, width / 2, textY + 40);
    // Progress bar
    const barWidth = 400;
    const barHeight = 8;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 80;
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = glowColor;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    // Particle effects
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + progress * Math.PI * 2;
      const radius = 100 + progress * 50;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      ctx.fillStyle = glowColor;
      ctx.globalAlpha = 1 - progress;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    ctx.restore();
  };

  // Draw all elements (moved up to fix linter error)
  const drawAll = (ctx: CanvasRenderingContext2D) => {
    const width = canvasSize.width;
    const height = canvasSize.height;
    if (shakeFrame > 0) {
      const shakeX = Math.sin(animationFrame * 2) * shakeFrame * 1.5;
      const shakeY = Math.cos(animationFrame * 2) * shakeFrame * 1.5;
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }
    ctx.clearRect(0, 0, width, height);
    drawStadium(ctx, width, height, stadium, timeOfDay);
    drawPixelField(ctx, width, height);
    drawWavingFlags(ctx, width, height, animationFrame, !!highlightAnimation && highlightAnimation.type === 'goal');
    drawPixelCrowd(ctx, width, height, animationFrame, !!highlightAnimation, waveFrame);
    drawWeather(ctx, width, height, animationFrame);
    drawGoalNet(ctx, width, height, netRipple);
    drawConfetti(ctx, width, height, animationFrame);
    drawScoreboard(ctx, width, homeScore, awayScore, minute, animationFrame);
    drawMascot(ctx, mascot);
    drawBallKid(ctx, ballKid);
    drawFireworks(ctx, width, height, fireworkFrame);
    drawSubBoard(ctx, width, height, subBoard);
    drawEasterEgg(ctx, easterEgg);
    const animatedHomePlayers = getAnimatedPlayerPositions(homePlayersArr);
    const animatedAwayPlayers = getAnimatedPlayerPositions(awayPlayersArr);
    drawPixelPlayers(ctx, animatedHomePlayers, homeTeamColors, 'home');
    drawPixelPlayers(ctx, animatedAwayPlayers, awayTeamColors, 'away');
    drawPixelBall(ctx, ballPosition.x * (width / 1200), ballPosition.y * (height / 600));
    drawCelebration(ctx, width, height, celebration);
    if (highlightAnimation) {
      drawHighlightAnimation(ctx, highlightAnimation);
      if (['goal','yellow','red'].includes(highlightAnimation.type)) {
        ctx.save();
        const slide = Math.min(1, eventTextAnim / 15);
        ctx.globalAlpha = 0.9 * slide;
        ctx.font = 'bold 40px "Press Start 2P", monospace';
        ctx.fillStyle = highlightAnimation.type === 'goal' ? '#ffd700' : highlightAnimation.type === 'yellow' ? '#ffe066' : '#ff3333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText(
          highlightAnimation.type === 'goal' ? 'GOAL!' : highlightAnimation.type === 'yellow' ? 'YELLOW CARD' : 'RED CARD',
          width / 2 + (1 - slide) * (highlightAnimation.type === 'goal' ? -200 : 200),
          height / 4
        );
        ctx.restore();
      }
    }
    if (shakeFrame > 0) ctx.restore();
  };

  // Responsive canvas resize
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const parent = containerRef.current;
      // Maintain 2:1 aspect ratio
      const width = parent.offsetWidth;
      const height = Math.round(width / 2);
      setCanvasSize({ width, height });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts for pause/mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onPauseToggle();
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(m => !m);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPauseToggle]);

  // Draw pixel crowd (top and bottom rows)
  const drawPixelCrowd = (ctx: CanvasRenderingContext2D, width: number, height: number, anim: number, highlight: boolean, waveFrame: number) => {
    const crowdRows = 2;
    const crowdCols = Math.floor(width / 16);
    for (let row = 0; row < crowdRows; row++) {
      for (let col = 0; col < crowdCols; col++) {
        // Animate crowd color on highlight/goal
        const baseColor = highlight ? (anim % 20 < 10 ? '#ffe066' : '#ff6b6b') : (col % 3 === 0 ? '#444' : col % 3 === 1 ? '#888' : '#222');
        ctx.fillStyle = baseColor;
        // Wave effect
        let yOffset = 0;
        if ((waveFrame + col) % 40 < 8) yOffset = -8 + ((waveFrame + col) % 8);
        const y = row === 0 ? 4 + yOffset : height - 20 - yOffset;
        ctx.fillRect(col * 16 + 2, y, 12, 12);
        // Head
        ctx.fillStyle = row % 2 === 0 ? '#f1c27d' : '#c68642';
        ctx.fillRect(col * 16 + 5, y - 6, 6, 6);
      }
    }
  };

  // Draw waving flags behind goals
  const drawWavingFlags = (ctx: CanvasRenderingContext2D, width: number, height: number, anim: number, highlight: boolean) => {
    // Left goal flag
    for (let i = 0; i < 2; i++) {
      const baseX = 40 + i * 30;
      const baseY = height / 2 - 60 + i * 80;
      ctx.save();
      ctx.translate(baseX, baseY);
      // Flag pole
      ctx.fillStyle = '#bbb';
      ctx.fillRect(0, 0, 4, 40);
      // Flag
      ctx.beginPath();
      ctx.moveTo(4, 4);
      for (let y = 0; y <= 24; y += 4) {
        const wave = Math.sin(anim * 0.15 + y * 0.2) * (highlight ? 8 : 4);
        ctx.lineTo(24 + wave, 4 + y);
      }
      ctx.lineTo(4, 28);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#ff6b6b' : '#4ecdc4';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // Right goal flag
    for (let i = 0; i < 2; i++) {
      const baseX = width - 40 - i * 30;
      const baseY = height / 2 - 60 + i * 80;
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.fillStyle = '#bbb';
      ctx.fillRect(0, 0, 4, 40);
      ctx.beginPath();
      ctx.moveTo(-4, 4);
      for (let y = 0; y <= 24; y += 4) {
        const wave = Math.sin(anim * 0.15 + y * 0.2 + 1) * (highlight ? 8 : 4);
        ctx.lineTo(-24 + wave, 4 + y);
      }
      ctx.lineTo(-4, 28);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#ffe066' : '#3333ff';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  };

  // Draw weather overlay
  const drawWeather = (ctx: CanvasRenderingContext2D, width: number, height: number, anim: number) => {
    if (!weather) return;
    if (weather === 'rain') {
      for (let i = 0; i < 80; i++) {
        const x = (i * 17 + anim * 8) % width;
        const y = (i * 53 + anim * 12) % height;
        ctx.strokeStyle = 'rgba(180,220,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2, y + 12);
        ctx.stroke();
      }
    } else if (weather === 'snow') {
      for (let i = 0; i < 60; i++) {
        const x = (i * 29 + anim * 3) % width;
        const y = (i * 71 + anim * 2) % height;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 2), 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  // Draw goal net ripple
  const drawGoalNet = (ctx: CanvasRenderingContext2D, width: number, height: number, ripple: typeof netRipple) => {
    if (!ripple) return;
    const isLeft = ripple.side === 'home';
    const netX = isLeft ? 20 : width - 20;
    const netY = height / 2 - 40;
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i <= 8; i++) {
      const y = netY + i * 10;
      const wave = Math.sin(ripple.frame * 0.4 + i) * (20 - ripple.frame);
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(netX, y);
        ctx.lineTo(netX + 40 + wave, y);
      } else {
        ctx.moveTo(netX, y);
        ctx.lineTo(netX - 40 - wave, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const x = isLeft ? netX + i * 10 : netX - i * 10;
      ctx.beginPath();
      ctx.moveTo(x, netY);
      ctx.lineTo(x, netY + 80);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  // Draw player celebration
  const drawCelebration = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    celebration: null | { team: 'home' | 'away'; frame: number }
  ) => {
    if (!celebration) return;
    const isHome = celebration.team === 'home';
    const baseX = isHome ? 300 : width - 300;
    const baseY = height / 2 + 80;
    for (let i = 0; i < 3; i++) {
      const x = baseX + i * 32 + Math.sin(celebration.frame * 0.2 + i) * 8;
      let y = baseY - Math.abs(Math.sin((celebration.frame - i * 4) * 0.18)) * 32;
      // Arms up on last frames
      const armsUp = celebration.frame > 25;
      ctx.save();
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x - 10, y + 28, 20, 8);
      // Legs
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 8, y + 8, 6, 16);
      ctx.fillRect(x + 2, y + 8, 6, 16);
      // Shorts
      ctx.fillStyle = isHome ? homeTeamColors.shorts : awayTeamColors.shorts;
      ctx.fillRect(x - 10, y, 20, 14);
      // Shirt
      ctx.fillStyle = isHome ? homeTeamColors.shirt : awayTeamColors.shirt;
      ctx.fillRect(x - 12, y - 16, 24, 18);
      // Arms
      ctx.fillStyle = isHome ? homeTeamColors.shirt : awayTeamColors.shirt;
      if (armsUp) {
        ctx.fillRect(x - 16, y - 24, 6, 18);
        ctx.fillRect(x + 10, y - 24, 6, 18);
      } else {
        ctx.fillRect(x - 16, y - 12, 6, 12);
        ctx.fillRect(x + 10, y - 12, 6, 12);
      }
      // Hands
      ctx.fillStyle = '#f1c27d';
      ctx.fillRect(x - 18, armsUp ? y - 24 : y - 8, 4, 8);
      ctx.fillRect(x + 14, armsUp ? y - 24 : y - 8, 4, 8);
      // Head
      ctx.fillStyle = '#f1c27d';
      ctx.fillRect(x - 8, y - 28, 16, 16);
      // Hair
      ctx.fillStyle = '#654321';
      ctx.fillRect(x - 6, y - 32, 12, 6);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 4, y - 24, 2, 2);
      ctx.fillRect(x + 2, y - 24, 2, 2);
      // Mouth
      ctx.fillRect(x - 2, y - 20, 4, 1);
      // Socks
      ctx.fillStyle = isHome ? homeTeamColors.socks : awayTeamColors.socks;
      ctx.fillRect(x - 8, y + 6, 6, 4);
      ctx.fillRect(x + 2, y + 6, 6, 4);
      // Boots
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 8, y + 14, 6, 4);
      ctx.fillRect(x + 2, y + 14, 6, 4);
      ctx.restore();
    }
  };

  // Draw confetti
  const drawConfetti = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  anim: number
): void => {
    if (!confetti) return;
    for (let i = 0; i < 120; i++) {
      const x = (i * 37 + anim * (3 + (i % 5))) % width;
      const y = (i * 53 + anim * (2 + (i % 7))) % height;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = ['#ff6b6b','#ffe066','#4ecdc4','#3333ff','#fff'][i%5];
      ctx.fillRect(x, y, 6, 12);
      ctx.restore();
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full max-w-5xl mx-auto">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-4 border-gray-600 rounded-lg shadow-lg bg-gray-900"
        style={{ imageRendering: 'pixelated', width: '100%', height: 'auto', maxWidth: '100%' }}
        aria-label="Football match pixel art viewer"
        tabIndex={0}
      />
      <div className="mt-4 text-white text-center relative">
        <div
          className={`text-lg font-bold font-mono px-4 py-2 rounded transition-transform duration-300 ${scoreboardAnim ? 'bg-yellow-400 text-black scale-110 shadow-lg' : 'bg-gray-800'} fade-in`}
          style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 24 }}
          aria-live="polite"
        >
          {homeTeam} {homeScore} - {awayScore} {awayTeam}
        </div>
        <div className="text-sm text-gray-300 font-mono" style={{ fontFamily: '"Press Start 2P", monospace' }}>
          Minute: {minute}' {isPaused && '⏸️ HIGHLIGHT'}
        </div>
        {/* Kit indicators */}
        <div className="flex justify-center items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: homeTeamColors.shirt }}
            ></div>
            <span className="text-gray-400">Home Kit</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: awayTeamColors.shirt }}
            ></div>
            <span className="text-gray-400">Away Kit</span>
          </div>
        </div>
        {minute === 45 && (
          <div className="text-yellow-400 font-semibold mt-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>🏟️ HALFTIME</div>
        )}
        <button
          className="absolute right-0 top-0 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          onClick={() => setIsMuted(m => !m)}
          tabIndex={0}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}

export default PixelArtMatchViewer;