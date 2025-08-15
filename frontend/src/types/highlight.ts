export interface Player { 
  id: string; 
  name: string; 
  number: number; 
  position: string; 
  team: 'A' | 'B'; 
}

export interface Team { 
  id: string; 
  name: string; 
  formation: string; 
  players: Player[]; 
}

export type HighlightEventType = 'goal' | 'miss' | 'save' | 'yellow' | 'red' | 'halftime' | 'fulltime';

export interface HighlightEvent { 
  id?: string; 
  type: HighlightEventType;
  team: 'A' | 'B';
  playerName?: string; 
  playerNumber?: number;
  minute: number; 
  description?: string; 
}

export interface HighlightPhaserSceneProps { 
  highlightEvent: HighlightEvent; 
  homeTeam?: Team; 
  awayTeam?: Team; 
  onComplete?: () => void; 
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// Game constants
export const PITCH_WIDTH = 800;
export const PITCH_HEIGHT = 600;

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  MOVE: 800,
  BALL_FLIGHT: 1200,
  CELEBRATE: 1000,
} as const;

// Team colors
export const TEAM_COLORS = {
  A: 0x1a73e8, // Blue
  B: 0xea4335, // Red
} as const;

export type TeamKey = keyof typeof TEAM_COLORS;
