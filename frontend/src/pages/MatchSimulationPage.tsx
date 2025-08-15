import React, { useEffect, useRef, useState } from 'react';
import { MatchAssets } from '../assets/matchAssets';
import HighlightPhaserScene from '../components/HighlightPhaserScene';
import { useNavigate } from 'react-router-dom';
import SafeImage from '../components/common/SafeImage';
import ErrorBoundary from '../components/common/ErrorBoundary';
// Optionally, import LanguageSelector if available
// import LanguageSelector from '../components/LanguageSelector';

// Helper for random extra time (1-8 mins)
const getExtraTime = () => Math.floor(Math.random() * 8) + 1;

interface MatchEvent {
    minute: number;
  type: 'goal' | 'yellow' | 'red' | 'miss' | 'halftime' | 'fulltime';
    playerName?: string;
  team?: 'A' | 'B';
    description: string;
}

const HIGHLIGHT_TYPES = ['goal', 'yellow', 'red', 'miss'] as const;
type HighlightType = typeof HIGHLIGHT_TYPES[number];

// Sample player names for each team
const TEAM_A_PLAYERS = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Lopez', 'Wilson'];
const TEAM_B_PLAYERS = ['Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Taylor', 'Lee', 'Perez'];

// Generate random match events for a single match
function generateMatchEvents(): MatchEvent[] {
        const events: MatchEvent[] = [];
  // 1-5 goals
  const numGoals = Math.floor(Math.random() * 5) + 1;
        const goalMinutes: number[] = [];
  for (let i = 0; i < numGoals; i++) {
    let m;
    do { m = Math.floor(Math.random() * 90) + 1; } while (goalMinutes.includes(m));
    goalMinutes.push(m);
    const team = Math.random() < 0.5 ? 'A' : 'B';
    const playerName = team === 'A' ? TEAM_A_PLAYERS[Math.floor(Math.random() * TEAM_A_PLAYERS.length)] : TEAM_B_PLAYERS[Math.floor(Math.random() * TEAM_B_PLAYERS.length)];
            events.push({
      minute: m,
                type: 'goal',
      team,
      playerName,
      description: `GOAL! ${playerName} (Team ${team}) scores!`,
            });
        }
  // 1-3 yellow cards
  const numYellows = Math.floor(Math.random() * 3) + 1;
  const yellowMinutes: number[] = [];
  for (let i = 0; i < numYellows; i++) {
    let m;
    do { m = Math.floor(Math.random() * 90) + 1; } while (goalMinutes.includes(m) || yellowMinutes.includes(m));
    yellowMinutes.push(m);
    const team = Math.random() < 0.5 ? 'A' : 'B';
    const playerName = team === 'A' ? TEAM_A_PLAYERS[Math.floor(Math.random() * TEAM_A_PLAYERS.length)] : TEAM_B_PLAYERS[Math.floor(Math.random() * TEAM_B_PLAYERS.length)];
            events.push({
      minute: m,
      type: 'yellow',
      team,
      playerName,
      description: `Yellow card for ${playerName} (Team ${team})`,
            });
        }
  // 0-1 red card
  if (Math.random() < 0.5) {
    let m;
    do { m = Math.floor(Math.random() * 90) + 1; } while (goalMinutes.includes(m) || yellowMinutes.includes(m));
    const team = Math.random() < 0.5 ? 'A' : 'B';
    const playerName = team === 'A' ? TEAM_A_PLAYERS[Math.floor(Math.random() * TEAM_A_PLAYERS.length)] : TEAM_B_PLAYERS[Math.floor(Math.random() * TEAM_B_PLAYERS.length)];
            events.push({
      minute: m,
      type: 'red',
      team,
      playerName,
      description: `Red card for ${playerName} (Team ${team})`,
            });
        }
  // 1-3 near misses
  const numMisses = Math.floor(Math.random() * 3) + 1;
  const missMinutes: number[] = [];
  for (let i = 0; i < numMisses; i++) {
    let m;
    do { m = Math.floor(Math.random() * 90) + 1; } while (goalMinutes.includes(m) || yellowMinutes.includes(m) || missMinutes.includes(m));
    missMinutes.push(m);
    const team = Math.random() < 0.5 ? 'A' : 'B';
    const playerName = team === 'A' ? TEAM_A_PLAYERS[Math.floor(Math.random() * TEAM_A_PLAYERS.length)] : TEAM_B_PLAYERS[Math.floor(Math.random() * TEAM_B_PLAYERS.length)];
                events.push({
      minute: m,
      type: 'miss',
      team,
      playerName,
      description: `Near miss by ${playerName} (Team ${team})`,
    });
  }
  // Sort by minute
  events.sort((a, b) => a.minute - b.minute);
  return events;
}

const MatchSimulationPage: React.FC = () => {
  const [minute, setMinute] = useState(0);
  const [half, setHalf] = useState<'first' | 'second'>('first');
  const [isPaused, setIsPaused] = useState(false);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [extraTime, setExtraTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<MatchEvent | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // New refs for event queue and highlight state
  const eventQueue = useRef<MatchEvent[]>([]);
  const isHighlight = useRef(false);
  const navigate = useNavigate();

  const handleSimulationComplete = () => {
    setCurrentEventIndex(prev => {
      if (prev < events.length - 1) {
        return prev + 1;
      }
      // All events processed
      return prev;
    });
  };

  // On mount, generate match events
  useEffect(() => {
    eventQueue.current = generateMatchEvents();
  }, []);

  // Start timer on mount
  useEffect(() => {
    if (isPaused || isFinished) return;
    timerRef.current = setInterval(() => {
      setMinute((prev) => {
        // Halftime
        if (half === 'first' && prev === 45) {
          setEvents((ev) => [...ev, { minute: 45, type: 'halftime', description: 'Halftime whistle!' }]);
          setHalf('second');
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
          }, 2000); // 2s halftime pause
                        return 45;
                    }
        // Fulltime
        if (half === 'second' && prev === 90 + extraTime) {
          setEvents((ev) => [...ev, { minute: prev, type: 'fulltime', description: 'Fulltime whistle!' }]);
          setIsFinished(true);
          setIsPaused(true);
          return prev;
                }
        // Check for events at this minute
        const nextMinute = prev + 1;
        const eventsThisMinute = eventQueue.current.filter(e => e.minute === nextMinute);
                if (eventsThisMinute.length > 0) {
          setEvents((ev) => [...ev, ...eventsThisMinute]);
          // If any are highlight events, pause timer for 3s
          const highlightEvent = eventsThisMinute.find(e => HIGHLIGHT_TYPES.includes(e.type as HighlightType));
          if (highlightEvent && !isHighlight.current) {
            isHighlight.current = true;
            setCurrentHighlight(highlightEvent);
                        setIsPaused(true);
            setTimeout(() => {
              setIsPaused(false);
              setCurrentHighlight(null);
              isHighlight.current = false;
            }, 3000); // 3s highlight pause
          }
        }
        return nextMinute;
      });
    }, 2000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [half, isPaused, isFinished, extraTime]);

  // Set extra time at 90'
  useEffect(() => {
    if (half === 'second' && minute === 90 && extraTime === 0) {
      setExtraTime(getExtraTime());
    }
  }, [minute, half, extraTime]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Calculate final score from events
  const getFinalScore = () => {
    let a = 0, b = 0;
    events.forEach(ev => {
      if (ev.type === 'goal') {
        if (ev.team === 'A') a++;
        if (ev.team === 'B') b++;
        }
    });
    return { a, b };
  };
        
  // Placeholder for continue action
    const handleContinue = () => {
    navigate('/league-table');
    };

  // Format timer display
  const formatMinute = (m: number) => `${m}'`;

        return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 animate-gradient-x flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
      {/* Optionally, LanguageSelector at top right */}
      {/* <div className="absolute top-6 right-8 z-10"><LanguageSelector /></div> */}
      {/* Results overlay */}
      {isFinished ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 animate-fadeIn">
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-10 py-12 w-[500px] max-w-full flex flex-col items-center">
            <h2 className="text-4xl font-extrabold text-green-400 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Full Time</h2>
            <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {getFinalScore().a} <span className="text-green-400">-</span> {getFinalScore().b}
            </div>
            <div className="text-lg text-gray-200 mb-6">Team A vs Team B</div>
            <h3 className="text-2xl font-bold text-green-300 mb-2">Key Events</h3>
            <ul className="w-full max-h-48 overflow-y-auto mb-6">
              {events.filter(ev => ev.type === 'goal' || ev.type === 'yellow' || ev.type === 'red').map((ev, idx) => (
                <li key={idx} className="text-gray-200 mb-1">
                  <span className="font-mono text-green-400">{ev.minute}'</span> — {ev.description}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold shadow-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all glow"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        // Pitch background */
        <div className="relative w-full h-screen overflow-hidden bg-green-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <ErrorBoundary>
              <SafeImage 
                src={MatchAssets.goalTop} 
                alt="Goal Top" 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 z-10"
                fallback={
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Goal Top</span>
                  </div>
                }
              />
              <div className="relative w-full h-full max-w-4xl">
                <SafeImage 
                  src={MatchAssets.pitch} 
                  alt="Pitch" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  fallback={
                    <div className="absolute inset-0 bg-green-700 opacity-80"></div>
                  }
                />
                <ErrorBoundary>
                  <HighlightPhaserScene 
                    highlightEvent={{
                      ...events[currentEventIndex],
                      team: events[currentEventIndex].team || 'A' // Default to 'A' if team is undefined
                    }}
                    onComplete={handleSimulationComplete}
                  />
                </ErrorBoundary>
              </div>
              <SafeImage 
                src={MatchAssets.goalBottom} 
                alt="Goal Bottom" 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 z-10"
                fallback={
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Goal Bottom</span>
                  </div>
                }
              />
            </ErrorBoundary>
          </div>  
          {/* Timer */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="text-7xl font-extrabold text-white drop-shadow-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{formatMinute(minute)}</div>
            <div className="text-2xl text-gray-200 font-mono tracking-widest">
              {half === 'first' ? 'First Half' : isFinished ? 'Full Time' : 'Second Half'}
            </div>
            {isPaused && !isFinished && !currentHighlight && (
              <div className="mt-2 text-yellow-300 animate-pulse text-lg">Whistle!</div>
            )}
            {isFinished && (
              <div className="mt-2 text-red-400 text-xl font-bold">Match Finished</div>
            )}
          </div>
          {/* Highlight Overlay with fade-in and skip button */}
          {currentHighlight && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 animate-fadeIn">
              <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-8 py-10 w-[420px] max-w-full flex flex-col items-center">
                <HighlightPhaserScene highlightEvent={currentHighlight as any} />
                <div className="mt-4 text-xl text-white font-bold text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {currentHighlight.description}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Google Fonts for Montserrat and Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
    </div>
  );
};

export default MatchSimulationPage; 