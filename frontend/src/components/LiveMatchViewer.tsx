import React, { useEffect, useRef, useState } from 'react';

// Define types for socket.io
type Socket = any;

interface Player {
  id: number;
  name: string;
  position: { x: number; y: number };
  hasBall: boolean;
  positionType: 'GK' | 'DEF' | 'MID' | 'FWD';
  shirtNumber: number;
  teamId: number;
}

interface TeamState {
  id: number;
  name: string;
  score: number;
  players: Player[];
  formation: string;
}

// Define MatchEvent type matching backend
interface MatchEvent {
  id?: string;
  type: string;
  minute: number;
  description: string; // Backend sends description
  playerName?: string;
  clubId?: number;
  details?: string;
  timestamp?: string;
}

interface MatchState {
  fixtureId: number;
  homeTeam: TeamState;
  awayTeam: TeamState;
  ball: {
    x: number;
    y: number;
    holderId: number | null;
  };
  minute: number;
  isPlaying: boolean;
  events: MatchEvent[];
}

interface MatchStateWrapper {
  state: MatchState;
  timestamp: number;
}

const LiveMatchViewer: React.FC<{ fixtureId: number }> = ({ fixtureId }) => {
  const [isConnected, setIsConnected] = useState(false);
  // We use a ref for the latest match state to display static info (score, minute) outside canvas
  const [displayMatch, setDisplayMatch] = useState<MatchState | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Interpolation Buffer
  const stateBuffer = useRef<MatchStateWrapper[]>([]);
  const RENDER_DELAY = 100; // 100ms delay to allow interpolation

  // Initialize socket
  useEffect(() => {
    let socket: Socket | null = null;

    const initSocket = async () => {
      try {
        const socketIo = await import('socket.io-client');
        const base = process.env.REACT_APP_API_BASE || '';
        socket = socketIo.default(base, {
          transports: ['websocket'],
          reconnection: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          socket?.emit('subscribeToMatch', { fixtureId });
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on('matchState', (matchState: MatchState) => {
          const now = performance.now();
          stateBuffer.current.push({ state: matchState, timestamp: now });

          // Keep buffer size manageable, but need history for interpolation
          if (stateBuffer.current.length > 20) {
            stateBuffer.current.shift();
          }

          // Update display state for UI (score, etc)
          setDisplayMatch(matchState);
        });

        // Handling events separately if needed, but matchState contains events too.
        // If matchState events is full history, we just use it.
        // But if socket emits distinct 'matchEvent', we can use that for notifications.
        // liveMatchService currently adds to array in matchState.

      } catch (error) {
        console.error("Socket init error", error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [fixtureId]);

  // Animation Loop
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPitch = (width: number, height: number) => {
      // Grass stripes
      const STRIPE_WIDTH = width / 10;
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#45a049';
      for (let i = 0; i < 10; i += 2) {
        ctx.fillRect(i * STRIPE_WIDTH, 0, STRIPE_WIDTH, height);
      }

      // Lines
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;

      // Outline
      ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);

      // Center line
      ctx.beginPath();
      ctx.moveTo(width / 2, height * 0.05);
      ctx.lineTo(width / 2, height * 0.95);
      ctx.stroke();

      // Center circle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, height * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      // Boxes
      const boxWidth = width * 0.15;
      const boxHeight = height * 0.4;
      // Left Box
      ctx.strokeRect(width * 0.05, (height - boxHeight) / 2, boxWidth, boxHeight);
      // Right Box
      ctx.strokeRect(width * 0.95 - boxWidth, (height - boxHeight) / 2, boxWidth, boxHeight);
    };

    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

    const render = (now: number) => {
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      drawPitch(canvas.width, canvas.height);

      const renderTime = now - RENDER_DELAY;

      // Find interpolation interval
      const buffer = stateBuffer.current;
      let p0 = null;
      let p1 = null;

      for (let i = buffer.length - 1; i >= 0; i--) {
        if (buffer[i].timestamp <= renderTime) {
          p0 = buffer[i];
          p1 = buffer[i + 1]; // Can be undefined if we are at latest
          break;
        }
      }

      // Fallback if buffer empty or time not ready
      if (!p0 && buffer.length > 0) p0 = buffer[0];

      if (p0) {
        const state0 = p0.state;
        const state1 = p1 ? p1.state : state0; // If no next state, hold last position

        let t = 0;
        if (p1 && p1.timestamp > p0.timestamp) {
          t = (renderTime - p0.timestamp) / (p1.timestamp - p0.timestamp);
          t = Math.max(0, Math.min(1, t)); // Clamp
        }

        // Helper to get screen coords
        const getCoords = (pos: { x: number, y: number }) => ({
          x: (pos.x / 100) * (canvas.width * 0.9) + (canvas.width * 0.05),
          y: (pos.y / 100) * (canvas.height * 0.9) + (canvas.height * 0.05)
        });

        // Draw Players
        const allPlayers0 = [...state0.homeTeam.players, ...state0.awayTeam.players];
        const allPlayers1 = [...state1.homeTeam.players, ...state1.awayTeam.players];

        allPlayers0.forEach(player0 => {
          const player1 = allPlayers1.find(p => p.id === player0.id) || player0;

          // Interpolate position relative to 0-100 logic
          // Note: LiveMatchService might flip coords if logic was per team perspective
          // But looking at code, it uses 0-100 absolute.

          const rawX = lerp(player0.position.x, player1.position.x, t);
          const rawY = lerp(player0.position.y, player1.position.y, t);

          const { x, y } = getCoords({ x: rawX, y: rawY });

          const isHome = player0.teamId === state0.homeTeam.id;
          ctx.fillStyle = isHome ? '#e74c3c' : '#3498db'; // Home Red, Away Blue
          ctx.strokeStyle = '#fff';

          // Shadow
          ctx.beginPath();
          ctx.ellipse(x, y + 8, 8, 3, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fill();

          // Player dot
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = isHome ? '#e74c3c' : '#3498db';
          ctx.fill();
          ctx.stroke();

          // Number
          /*
          ctx.fillStyle = 'white';
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(player0.shirtNumber.toString(), x, y + 3);
          */
        });

        // Draw Ball
        const ball0 = state0.ball;
        const ball1 = state1.ball;
        const bx = lerp(ball0.x, ball1.x, t);
        const by = lerp(ball0.y, ball1.y, t);
        const bCoords = getCoords({ x: bx, y: by });

        ctx.beginPath();
        ctx.arc(bCoords.x, bCoords.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(() => render(performance.now()));
    };

    animationFrameRef.current = requestAnimationFrame(() => render(performance.now()));

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // Empty deps, uses refs

  const handleControl = (action: 'start' | 'pause' | 'reset') => {
    if (socketRef.current) {
      socketRef.current.emit('controlMatch', { fixtureId, action });
    }
  };

  if (!isConnected) return <div className="p-4 rounded bg-gray-100 text-center">Connecting to Match Engine...</div>;
  if (!displayMatch) return <div className="p-4 rounded bg-gray-100 text-center">Waiting for match data...</div>;

  return (
    <div className="live-match-container">
      <div className="match-header">
        <div className="score-board">
          <div className="team home">
            <span className="team-name">{displayMatch.homeTeam.name}</span>
            <span className="team-score">{displayMatch.homeTeam.score}</span>
          </div>
          <div className="match-info">
            <span className="minute">{Math.floor(displayMatch.minute)}'</span>
          </div>
          <div className="team away">
            <span className="team-score">{displayMatch.awayTeam.score}</span>
            <span className="team-name">{displayMatch.awayTeam.name}</span>
          </div>
        </div>

        <div className="controls">
          <button onClick={() => handleControl(displayMatch.isPlaying ? 'pause' : 'start')} className="btn-primary">
            {displayMatch.isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} className="match-canvas" />
      </div>

      <div className="events-feed">
        <h3>Match Events</h3>
        <div className="events-list">
          {[...displayMatch.events].reverse().map((e, i) => (
            <div key={i} className={`event-item ${e.type}`}>
              <span className="time">{e.minute}'</span> {e.description}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .live-match-container {
           max-width: 900px;
           margin: 0 auto;
           font-family: 'Inter', sans-serif;
        }
        .match-header {
           background: #1a1a1a;
           color: white;
           padding: 20px;
           border-radius: 8px 8px 0 0;
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 15px;
        }
        .score-board {
           display: flex;
           align-items: center;
           gap: 40px;
           font-size: 24px;
           font-weight: bold;
        }
        .team { display: flex; align-items: center; gap: 15px; }
        .match-info { color: #888; font-size: 18px; }
        
        .canvas-wrapper {
           height: 500px;
           background: #333;
           position: relative;
        }
        .match-canvas { width: 100%; height: 100%; }
        
        .events-feed {
           background: #f5f5f5;
           padding: 15px;
           border-radius: 0 0 8px 8px;
           max-height: 200px;
           overflow-y: auto;
        }
        .event-item {
           padding: 5px 0;
           border-bottom: 1px solid #ddd;
           font-size: 14px;
        }
        .time { font-weight: bold; margin-right: 8px; color: #666; }
        
        .btn-primary {
           background: #3498db;
           color: white;
           border: none;
           padding: 8px 24px;
           border-radius: 20px;
           cursor: pointer;
           font-weight: bold;
        }
        .btn-primary:hover { background: #2980b9; }
      `}</style>
    </div>
  );
};

export default LiveMatchViewer;
