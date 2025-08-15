// Common types used throughout the application
import type { Request } from 'express';
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  rating: number;
  fitness: number;
  form: number;
  condition: number;
  morale: number;
  potential: number;
  age: number;
  nationality: string;
  clubId: string;
  value: number;
  wage: number;
  contractEnd: Date;
  isInjured: boolean;
  injuryDays?: number;
  isSuspended: boolean;
  suspensionGames?: number;
  preferredFoot: 'left' | 'right' | 'both';
  traits: string[];
  positionRatings: Record<PlayerPosition, number>;
  currentAbility: number;
  potentialAbility: number;
  personality: string;
  determination: number;
  leadership: number;
  temperament: number;
  professionalism: number;
  consistency: number;
  importantMatches: number;
  injuryProneness: number;
  versatility: number;
  adaptability: number;
  ambition: number;
  loyalty: number;
  pressure: number;
  sportsmanship: number;
  controversy: number;
  dirtiness: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla: string;
  country: string;
  founded: number;
  venue: string;
  leagueId: string;
  reputation: number;
  transferBudget: number;
  wageBudget: number;
  currentWageTotal: number;
  morale: number;
  form: number;
  formation: string;
  tactics: string;
  trainingLevel: number;
  youthLevel: number;
}

export interface CustomRequest extends Request {
  params: Record<string, string>;
  // Use unknown for better type-safety; callers should narrow as needed
  body: unknown;
}

// Add more types as needed for your application
