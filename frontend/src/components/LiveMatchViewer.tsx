import React, { useEffect, useRef, useState, useCallback } from 'react';

// Define types for socket.io
type Socket = any; // Using any to avoid type issues with socket.io-client

// Player type
interface Player {
  id: number;
  name: string;
  position: { x: number; y: number };
  hasBall: boolean;
  positionType: 'GK' | 'DEF' | 'MID' | 'FWD';
  shirtNumber: number;
  teamId: number;
}

// Team state type
interface TeamState {
  id: number;
  name: string;
  score: number;
  players: Player[];
  formation: string;
}

// Define MatchEvent type
interface MatchEvent {
  id: string;
  type: 'goal' | 'yellowCard' | 'redCard' | 'substitution' | 'injury' | 'other';
  minute: number;
  playerId?: number;
  playerName?: string;
  teamId?: number;
  teamName?: string;
  details?: string;
  timestamp: string;
}

// Define MatchState type
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
  matchStatus: 'firstHalf' | 'halfTime' | 'secondHalf' | 'fullTime' | 'extraTime' | 'penalties';
  addedTime: number;
}


const LiveMatchViewer: React.FC<{ fixtureId: number }> = ({ fixtureId }) => {
  // State
  const [match, setMatch] = useState<MatchState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  
  // Refs
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  // Event handlers
  const onConnect = useCallback(() => {
    setIsConnected(true);
    if (socketRef.current) {
      socketRef.current.emit('subscribeToMatch', { fixtureId });
    }
  }, [fixtureId]);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const onMatchState = useCallback((matchState: MatchState) => {
    setMatch(matchState);
  }, []);

  const onMatchEvent = useCallback((event: MatchEvent) => {
    setEvents(prevEvents => [...prevEvents, event].slice(-50));
  }, []);

  // Initialize socket connection
  useEffect(() => {
    let socket: Socket | null = null;

    const initSocket = async () => {
      try {
        const socketIo = await import('socket.io-client');
        const socketOptions = {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        };

        const base = process.env.REACT_APP_API_BASE || '';
        socket = socketIo.default(
          base,
          socketOptions
        ) as Socket;

        socketRef.current = socket;

        // Event handlers
        const handleConnect = () => {
          console.log('Connected to WebSocket server');
          setIsConnected(true);
          if (socket) {
            socket.emit('subscribeToMatch', { fixtureId });
          }
        };

        const handleDisconnect = () => {
          console.log('Disconnected from WebSocket server');
          setIsConnected(false);
        };

        const handleMatchState = (matchState: MatchState) => {
          setMatch(matchState);
        };

        const handleMatchEvent = (event: MatchEvent) => {
          setEvents(prevEvents => [...prevEvents, event].slice(-50));
        };

        // Add event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('matchState', handleMatchState);
        socket.on('matchEvent', handleMatchEvent);

        // Cleanup function
        return () => {
          if (socket) {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('matchState', handleMatchState);
            socket.off('matchEvent', handleMatchEvent);
            socket.disconnect();
            socketRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocket();

    // Cleanup function for the effect
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [fixtureId]);

  useEffect(() => {
    if (!canvasRef.current || !match) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPitch = () => {
      // Set canvas dimensions
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const width = canvas.width;
      const height = canvas.height;
      
      // Draw pitch background
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, 0, width, height);
      
      // Draw center line and circle
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      
      // Center circle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      // Penalty areas
      ctx.strokeRect(0, height * 0.2, 100, height * 0.6);
      ctx.strokeRect(width - 100, height * 0.2, 100, height * 0.6);
      
      // Goals
      ctx.fillStyle = 'white';
      ctx.fillRect(0, height * 0.4, 10, height * 0.2);
      ctx.fillRect(width - 10, height * 0.4, 10, height * 0.2);
    };

    const drawPlayers = () => {
      if (!match) return;
      
      const drawTeam = (players: Player[], isHome: boolean) => {
        players.forEach(player => {
          const x = isHome 
            ? (player.position.x / 100) * (canvas.width * 0.8) + (canvas.width * 0.1)
            : canvas.width - ((player.position.x / 100) * (canvas.width * 0.8) + (canvas.width * 0.1));
            
          const y = (player.position.y / 100) * (canvas.height * 0.8) + (canvas.height * 0.1);
          
          // Draw player circle
          ctx.fillStyle = isHome ? '#3498db' : '#e74c3c';
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw player number
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(player.shirtNumber.toString(), x, y);
          
          // Highlight player with ball
          if (player.hasBall) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      };
      
      drawTeam(match.homeTeam.players, true);
      drawTeam(match.awayTeam.players, false);
    };

    const drawBall = () => {
      if (!match) return;
      
      const ball = match.ball;
      const x = (ball.x / 100) * (canvas.width * 0.8) + (canvas.width * 0.1);
      const y = (ball.y / 100) * (canvas.height * 0.8) + (canvas.height * 0.1);
      
      // Draw ball
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Add shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (timestamp: number) => {
      // Limit updates to 60fps
      if (timestamp - lastUpdateTime.current < 16) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdateTime.current = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw pitch and players
      drawPitch();
      if (match) {
        drawPlayers();
        drawBall();
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [match]);

  const handleControl = (action: 'start' | 'pause' | 'reset') => {
    if (socketRef.current) {
      socketRef.current.emit('controlMatch', { fixtureId, action });
    }
  };

  if (!isConnected) {
    return <div>Connecting to match server...</div>;
  }

  if (!match) {
    return <div>Loading match data...</div>;
  }



  return (
    <div className="live-match-container">
      <div className="match-controls">
        <button 
          onClick={() => handleControl(match.isPlaying ? 'pause' : 'start')}
          className="control-button"
        >
          {match.isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button 
          onClick={() => handleControl('reset')}
          className="control-button"
        >
          🔄 Reset
        </button>
      </div>
      
      <div className="match-canvas-container">
        <canvas 
          ref={canvasRef} 
          className="match-canvas"
          style={{
            width: '100%',
            height: '500px',
            backgroundColor: '#4CAF50',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        />
      </div>
      
      <div className="match-events">
        {events.length > 0 ? (
          <div className="events-list">
            {events.map((event, index) => (
              <div key={event.id || index} className="event-item">
                <span className="event-minute">{event.minute}'</span>
                <span className="event-type">{event.type}</span>
                {event.playerName && (
                  <span className="event-player">{event.playerName}</span>
                )}
                {event.details && (
                  <span className="event-details">{event.details}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events">No events yet</div>
        )}
      </div>
      
      <style jsx>{`
        .live-match-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .match-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .control-button {
          padding: 8px 16px;
          font-size: 16px;
          border: none;
          border-radius: 4px;
          background-color: #3498db;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .control-button:hover {
          background-color: #2980b9;
        }
        
        .match-canvas-container {
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .match-events {
          background-color: #f5f5f5;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .events-list {
          max-height: 300px;
          overflow-y: auto;
          margin-top: 10px;
        }
        
        .event-item {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .event-minute {
          font-weight: bold;
          min-width: 40px;
          color: #666;
        }
        
        .event-description {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default LiveMatchViewer;
