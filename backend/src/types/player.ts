/**
 * Player personality traits
 */
export enum Personality {
  Ambitious = 'Ambitious',
  Determined = 'Determined',
  Professional = 'Professional',
  Resilient = 'Resilient',
  TeamPlayer = 'Team Player',
  Temperamental = 'Temperamental',
  Unambitious = 'Unambitious',
  Unprofessional = 'Unprofessional',
  Selfish = 'Selfish',
  Leader = 'Leader'
}

/**
 * Player position proficiency
 */
export enum PositionProficiency {
  Natural = 'Natural',
  Accomplished = 'Accomplished',
  Competent = 'Competent',
  Awkward = 'Awkward',
  Unconvincing = 'Unconvincing'
}

/**
 * Player injury status
 */
export interface InjuryStatus {
  type: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'CareerEnding';
  startDate: Date;
  endDate: Date;
  description: string;
}

/**
 * Player trait
 */
export interface PlayerTrait {
  id: number;
  name: string;
  description: string;
  positive: boolean;
}

/**
 * Player position with proficiency
 */
export interface PlayerPosition {
  position: string;
  proficiency: PositionProficiency;
}

/**
 * Player career statistics
 */
export interface CareerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number; // For goalkeepers and defenders
  manOfTheMatch: number;
  minutesPlayed: number;
  season: string;
  competition: string;
  team: string;
}
