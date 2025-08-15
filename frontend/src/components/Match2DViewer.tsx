import React, { useEffect, useRef, useState, useCallback } from 'react';
import MatchEventPopup from './MatchEventPopup';

export interface Player {
  id: number;
  name: string;
  position: string;
  skill: number;
  x: number;
  y: number;
  team: 'home' | 'away';
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'miss' | 'save' | 'yellow' | 'red' | 'foul' | 'substitution';
  playerId?: string;
  playerName?: string;
  team: 'home' | 'away';
  description: string;
  x?: number;
  y?: number;
}

type MatchPhase = 'preMatch' | 'firstHalf' | 'halfTime' | 'secondHalf' | 'extraTime' | 'penalties' | 'fullTime';

interface Match2DViewerProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  currentEvent: MatchEvent | null;
  onEventComplete: () => void;
  onMatchComplete: () => void;
  onPhaseChange?: (phase: MatchPhase) => void;
}

const HALF_TIME_DURATION = 45; // minutes per half
const INJURY_TIME_FIRST_HALF = 2; // minutes of injury time
const INJURY_TIME_SECOND_HALF = 3; // minutes of injury time
const HALF_TIME_BREAK = 1; // minutes for half time break

const Match2DViewer: React.FC<Match2DViewerProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute: propMinute,
  currentEvent,
  onEventComplete,
  onMatchComplete,
  onPhaseChange
}) => {
  const [phase, setPhase] = useState<MatchPhase>('preMatch');
  const [isPaused, setIsPaused] = useState(false);
  const [minute, setMinute] = useState(0);
  const [injuryTime, setInjuryTime] = useState(0);
  const [isInInjuryTime, setIsInInjuryTime] = useState(false);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [phaseTransitionText, setPhaseTransitionText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 400, y: 300, targetX: 400, targetY: 300 });
  const [activeEvent, setActiveEvent] = useState<MatchEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [homePlayers, setHomePlayers] = useState<Player[]>([
    { id: 1, x: 100, y: 150, name: 'GK', position: 'GK', skill: 70, team: 'home' },
    { id: 2, x: 150, y: 100, name: 'DEF', position: 'DEF', skill: 65, team: 'home' },
    { id: 3, x: 150, y: 200, name: 'DEF', position: 'DEF', skill: 68, team: 'home' },
    { id: 4, x: 200, y: 150, name: 'DEF', position: 'DEF', skill: 70, team: 'home' },
    { id: 5, x: 250, y: 100, name: 'MID', position: 'MID', skill: 72, team: 'home' },
    { id: 6, x: 250, y: 200, name: 'MID', position: 'MID', skill: 75, team: 'home' },
    { id: 7, x: 300, y: 150, name: 'MID', position: 'MID', skill: 73, team: 'home' },
    { id: 8, x: 350, y: 100, name: 'FWD', position: 'FWD', skill: 78, team: 'home' },
    { id: 9, x: 350, y: 200, name: 'FWD', position: 'FWD', skill: 80, team: 'home' }
  ]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([
    { id: 10, x: 700, y: 150, name: 'GK', position: 'GK', skill: 72, team: 'away' },
    { id: 11, x: 650, y: 100, name: 'DEF', position: 'DEF', skill: 70, team: 'away' },
    { id: 12, x: 650, y: 200, name: 'DEF', position: 'DEF', skill: 68, team: 'away' },
    { id: 13, x: 600, y: 150, name: 'DEF', position: 'DEF', skill: 71, team: 'away' },
    { id: 14, x: 550, y: 100, name: 'MID', position: 'MID', skill: 74, team: 'away' },
    { id: 15, x: 550, y: 200, name: 'MID', position: 'MID', skill: 76, team: 'away' },
    { id: 16, x: 500, y: 150, name: 'MID', position: 'MID', skill: 75, team: 'away' },
    { id: 17, x: 450, y: 100, name: 'FWD', position: 'FWD', skill: 79, team: 'away' },
    { id: 18, x: 450, y: 200, name: 'FWD', position: 'FWD', skill: 77, team: 'away' }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw field
    drawField(ctx, canvas.width, canvas.height);

    // Draw players - the color is now handled within the drawPlayers function based on team
    drawPlayers(ctx, homePlayers, 'home');
    drawPlayers(ctx, awayPlayers, 'away');

    // Draw ball
    drawBall(ctx, ballPosition.x, ballPosition.y);

    // Draw score and time
    drawUI(ctx, canvas.width, canvas.height);

      // Handle current event with animation
    if (currentEvent && !activeEvent && phase !== 'halfTime' && phase !== 'fullTime') {
      setActiveEvent(currentEvent);
      setShowEventPopup(true);
      handleEvent(currentEvent);
    }

    // Check if match is complete
    if (minute >= 90) {
      setTimeout(() => {
        onMatchComplete();
      }, 2000);
    }
  }, [minute, currentEvent, homeScore, awayScore, animationFrame]);

  const drawField = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw field background with gradient
    const fieldGradient = ctx.createLinearGradient(0, 0, 0, height);
    fieldGradient.addColorStop(0, '#2e7d32');
    fieldGradient.addColorStop(1, '#1b5e20');
    ctx.fillStyle = fieldGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw field markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Center line and circle
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center spot
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Penalty areas
    ctx.strokeRect(0, height * 0.25, 132, height * 0.5);
    ctx.strokeRect(width - 132, height * 0.25, 132, height * 0.5);
    
    // Goals
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    // Left goal
    ctx.strokeRect(-2, height * 0.4, 10, height * 0.2);
    // Right goal
    ctx.strokeRect(width - 8, height * 0.4, 10, height * 0.2);
    
    // Add some field details
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'center';
    ctx.fillText(homeTeam, width * 0.25, 30);
    ctx.fillText(awayTeam, width * 0.75, 30);
  }, [homeTeam, awayTeam]);

  const drawPlayers = useCallback((ctx: CanvasRenderingContext2D, players: Player[], team: 'home' | 'away') => {
    const teamColor = team === 'home' ? '#4a90e2' : '#e74c3c';
    
    players.forEach(player => {
      // Draw player shadow
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 12, 12, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      
      // Draw player body
      ctx.beginPath();
      ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = teamColor;
      ctx.fill();
      
      // Add player number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.id.toString(), player.x, player.y);
      
      // Highlight active player if they're involved in the current event
      if (activeEvent && (activeEvent.playerId === player.id.toString() || activeEvent.playerName === player.name)) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [activeEvent]);

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw ball shadow
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 6, 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    
    // Draw ball with gradient
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 8);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add ball details
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add pentagon pattern
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x + 3, y - 2);
    ctx.lineTo(x + 2, y + 3);
    ctx.lineTo(x - 2, y + 3);
    ctx.lineTo(x - 3, y - 2);
    ctx.closePath();
    ctx.stroke();
  }, []);

  const drawUI = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw scoreboard background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 100, 10, 200, 50);
    
    // Draw score
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${homeScore} - ${awayScore}`, width / 2, 40);
    
    // Draw match time
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText(`${minute}'`, width / 2, 65);
    
    // Add team names
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(homeTeam, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(awayTeam, width - 20, 30);
    
    // Add match clock
    ctx.beginPath();
    ctx.arc(width / 2, height - 30, 15, 0, (minute / 90) * Math.PI * 2);
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [homeScore, awayScore, minute, homeTeam, awayTeam]);

  const handleEvent = useCallback((event: MatchEvent) => {
    // Find the player involved in the event
    const allPlayers = [...homePlayers, ...awayPlayers];
    const player = allPlayers.find(p => p.id === Number(event.playerId) || p.name === event.playerName);
    
    if (player) {
      // Move ball to player position for the event
      setBallPosition(prev => ({
        ...prev,
        targetX: player.x,
        targetY: player.y
      }));

      // Special handling for different event types
      switch (event.type) {
        case 'goal':
          // Animate ball to goal
          const goalY = 150 + (Math.random() * 100 - 50);
          const goalX = player.team === 'home' ? 800 : 0;
          setTimeout(() => {
            setBallPosition(prev => ({
              ...prev,
              targetX: goalX,
              targetY: goalY
            }));
          }, 500);
          break;
          
        case 'save':
          // Animate ball away from goal
          setTimeout(() => {
            setBallPosition(prev => ({
              ...prev,
              targetX: player.x + (player.team === 'home' ? -50 : 50),
              targetY: player.y + (Math.random() * 40 - 20)
            }));
          }, 500);
          break;
      }
    }
  }, [homePlayers, awayPlayers]);

  // Handle match progression and phase changes
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setMinute(prev => {
        const newMinute = prev + 1;
        
        // Check for phase transitions
        if (phase === 'preMatch' && newMinute >= 1) {
          startPhase('firstHalf');
        } else if (phase === 'firstHalf' && newMinute >= HALF_TIME_DURATION) {
          if (!isInInjuryTime && Math.random() > 0.7) {
            // Add injury time
            setInjuryTime(INJURY_TIME_FIRST_HALF);
            setIsInInjuryTime(true);
            return newMinute;
          } else if (isInInjuryTime && newMinute >= HALF_TIME_DURATION + injuryTime) {
            startPhase('halfTime');
            return 0; // Reset for second half
          } else if (newMinute >= HALF_TIME_DURATION) {
            startPhase('halfTime');
            return 0; // Reset for second half
          }
        } else if (phase === 'halfTime' && newMinute >= HALF_TIME_BREAK) {
          startPhase('secondHalf');
          return 0;
        } else if (phase === 'secondHalf' && newMinute >= HALF_TIME_DURATION) {
          if (!isInInjuryTime && Math.random() > 0.7) {
            // Add injury time
            setInjuryTime(INJURY_TIME_SECOND_HALF);
            setIsInInjuryTime(true);
            return newMinute;
          } else if (isInInjuryTime && newMinute >= HALF_TIME_DURATION * 2 + injuryTime) {
            startPhase('fullTime');
            return newMinute;
          } else if (newMinute >= HALF_TIME_DURATION * 2) {
            startPhase('fullTime');
            return newMinute;
          }
        } else if (phase === 'fullTime') {
          clearInterval(timer);
          onMatchComplete();
          return newMinute;
        }
        
        return newMinute;
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [phase, isPaused, isInInjuryTime, injuryTime]);

  const startPhase = (newPhase: MatchPhase) => {
    setPhase(newPhase);
    setShowPhaseTransition(true);
    setIsInInjuryTime(false);
    
    switch (newPhase) {
      case 'firstHalf':
        setPhaseTransitionText('1st Half');
        break;
      case 'halfTime':
        setPhaseTransitionText('Half Time');
        break;
      case 'secondHalf':
        setPhaseTransitionText('2nd Half');
        break;
      case 'fullTime':
        setPhaseTransitionText('Full Time');
        break;
    }
    
    setTimeout(() => {
      setShowPhaseTransition(false);
      onPhaseChange?.(newPhase);
    }, 3000);
  };

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      // Smooth ball movement
      setBallPosition(prev => {
        const dx = prev.targetX - prev.x;
        const dy = prev.targetY - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) {
          return { ...prev, x: prev.targetX, y: prev.targetY };
        }
        
        const speed = distance > 100 ? 10 : distance > 50 ? 5 : 2;
        return {
          ...prev,
          x: prev.x + (dx / distance) * speed,
          y: prev.y + (dy / distance) * speed
        };
      });
      
      setAnimationFrame(prev => prev + 1);
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const getDisplayTime = () => {
    if (phase === 'halfTime') return 'HT';
    if (phase === 'fullTime') return 'FT';
    if (isInInjuryTime) return `${HALF_TIME_DURATION}+${minute - HALF_TIME_DURATION}′`;
    return `${minute}′`;
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      
      {/* Phase transition overlay */}
      {showPhaseTransition && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-white text-4xl font-bold animate-pulse">
            {phaseTransitionText}
            {phase === 'halfTime' && (
              <div className="text-xl mt-2 text-center">
                {homeTeam} {homeScore} - {awayScore} {awayTeam}
              </div>
            )}
          </div>
        </div>
      )}
      
      {showEventPopup && activeEvent && (
        <MatchEventPopup
          event={activeEvent}
          onClose={() => setShowEventPopup(false)}
          onAnimationComplete={() => {
            setActiveEvent(null);
            onEventComplete();
          }}
        />
      )}
      
      {/* Match controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button 
          className={`px-4 py-2 ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition-colors`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => onMatchComplete()}
        >
          End Match
        </button>
      </div>
      
      {/* Match info overlay */}
      <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
        <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded">
          {homeTeam} {homeScore}
        </div>
        <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded flex items-center gap-2">
          <span>{phase === 'firstHalf' ? '1H' : phase === 'secondHalf' ? '2H' : phase}</span>
          <span className="font-bold">{getDisplayTime()}</span>
        </div>
        <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded">
          {awayScore} {awayTeam}
        </div>
      </div>
      
      {/* Phase indicator */}
      {phase === 'halfTime' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
            Half Time
          </div>
        </div>
      )}
      
      {phase === 'fullTime' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
            Full Time
          </div>
        </div>
      )}
    </div>
  );
};

export default Match2DViewer; 