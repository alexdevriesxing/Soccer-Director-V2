export interface MatchEvent {
  type: 'goal' | 'yellowCard' | 'redCard' | 'substitution';
  minute: number;
  playerId: number;
  teamId: number;
  details?: any;
}

export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  date: string;
  events?: MatchEvent[];
}
