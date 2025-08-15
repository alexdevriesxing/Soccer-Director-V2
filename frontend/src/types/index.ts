export interface TransferMarketPlayer {
    id: number;
    name: string;
    nationality: string;
    position: string;
    skill: number;
    age: number;
    currentClub: string;
    currentClubId: number;
    estimatedValue: number;
    wage: number;
    contractExpiry: string;
    transferStatus: string;
    agent: {
        name: string;
        style: string;
        reputation: number;
    };
    ambition: string;
    loyalty: number;
    injuryHistory: number;
    lastClub?: string;
    askingPrice?: number;
}

export interface Club {
    id: number;
    name: string;
    leagueId: number;
    homeCity?: string;
    boardExpectation?: string;
    morale: number;
    form?: string;
    isJongTeam?: boolean;
    parentClub?: { id: number; name: string };
}

export interface Player {
    id: number;
    name: string;
    clubId: number;
    position: string;
    skill: number;
    age?: number;
    nationality?: string;
    morale: number;
    injured: boolean;
    internationalCaps: number;
    onInternationalDuty: boolean;
}

export interface Fixture {
    id: number;
    homeClubId: number;
    awayClubId: number;
    leagueId?: number;
    week: number;
    date?: string;
    played: boolean;
    homeGoals?: number;
    awayGoals?: number;
    homeClub?: Club;
    awayClub?: Club;
}

export interface MatchEvent {
    id?: number;
    fixtureId?: number;
    minute: number;
    type: 'goal' | 'near_miss' | 'save' | 'yellow' | 'red' | 'foul' | 'substitution' | 'injury_time';
    description: string;
    playerId?: number | string;
    playerName?: string;
    team?: 'home' | 'away';
    teamId?: number;
    subIn?: string;
    injuryTime?: number;
}

export interface Staff {
    id: number;
    clubId: number;
    name: string;
    role: string;
    skill: number;
    hiredDate: string;
}

export interface ClubFormation {
    id: number;
    clubId: number;
    formation: string;
    style: string;
    intensity: number;
    width: number;
    tempo: number;
    lastUpdated: string;
}

export interface ClubStrategy {
    id: number;
    clubId: number;
    approach: string;
    defensiveStyle: string;
    attackingStyle: string;
    setPieces: string;
    marking: string;
    lastUpdated: string;
}

export interface LeagueTableRow {
    position: number;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    status: string;
    isJongTeam?: boolean;
    parentClub?: { id: number; name: string };
}

export interface LeagueTable {
    league: string;
    table: LeagueTableRow[];
}

export interface Transfer {
    id: number;
    playerId: number;
    fromClubId: number;
    toClubId: number;
    fee: number;
    wage: number;
    contractLength: number;
    status: string;
    date: string;
    negotiation?: string;
    player?: Player;
    fromClub?: Club;
    toClub?: Club;
} 