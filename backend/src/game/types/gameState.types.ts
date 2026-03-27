import { GameDate } from './date.types';

export interface GameState {
  // Core game state
  id: string;
  currentDate: GameDate;
  gameSpeed: GameSpeed;
  isPaused: boolean;
  season: number;
  phase: GamePhase;
  
  // World state
  activeCompetitions: string[]; // Competition IDs
  activeClubs: string[]; // Club IDs
  
  // User state
  userClubId: string | null;
  
  // Simulation state
  lastSimulatedDate: GameDate | null;
  
  // Metadata
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum GameSpeed {
  PAUSED = 0,
  SLOW = 1,    // 1 day per second
  NORMAL = 2,  // 1 day per 0.5 seconds
  FAST = 3,    // 1 day per 0.2 seconds
  VERY_FAST = 4 // 1 day per 0.1 seconds
}

export enum GamePhase {
  PRE_SEASON = 'PRE_SEASON',
  REGULAR_SEASON = 'REGULAR_SEASON',
  TRANSFER_WINDOW = 'TRANSFER_WINDOW',
  END_OF_SEASON = 'END_OF_SEASON',
  OFF_SEASON = 'OFF_SEASON'
}

export interface GameStateUpdate {
  currentDate?: GameDate;
  gameSpeed?: GameSpeed;
  isPaused?: boolean;
  phase?: GamePhase;
  // Add other updatable fields as needed
}
