export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'scheduled' | 'in_play' | 'halftime' | 'finished';
  competition: string;
  date: string;
  events?: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'injury' | 'other';
  playerId?: string;
  playerName?: string;
  team: 'home' | 'away';
  description: string;
}
