import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Match event types that are valid in the simulation
type MatchEventType = 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'substitution' | 'near_miss' | 'save' | 'penalty_goal' | 'penalty_miss';

interface PlayerState {
  id: number;
  name: string;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  hasBall: boolean;
  speed: number;
  positionType: 'GK' | 'DEF' | 'MID' | 'FWD';
  stamina: number;
  teamId: number;
  shirtNumber: number;
  goals?: number;
  assists?: number;
  cards?: string[];
  isSentOff?: boolean;
  isInjured?: boolean;
  stats: {
    finishing: number;
    tackling: number;
    reflexes: number;
    passing: number;
  }
}

interface MatchEvent {
  type: MatchEventType;
  minute: number;
  description: string;
  playerName?: string;
  clubId: number;
}

interface TeamState {
  id: number;
  name: string;
  score: number;
  players: PlayerState[];
}

interface MatchState {
  fixtureId: number;
  homeTeam: TeamState;
  awayTeam: TeamState;
  ball: { x: number; y: number; holderId: number | null };
  minute: number;
  isPlaying: boolean;
  events: MatchEvent[];
}


export class LiveMatchService {
  private static matches: Map<number, MatchState> = new Map();
  private static intervals: Map<number, NodeJS.Timeout> = new Map();
  private static io: any = null;

  static setSocketIO(io: any) {
    this.io = io;
  }

  static getLiveMatchIds(): Set<number> {
    return new Set(this.matches.keys());
  }

  static getMatchState(fixtureId: number): MatchState | null {
    return this.matches.get(fixtureId) || null;
  }

  static async initializeMatch(fixtureId: number): Promise<MatchState> {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } }
      }
    });

    if (!fixture) throw new Error('Fixture not found');

    const state: MatchState = {
      fixtureId,
      homeTeam: this.createTeamState(fixture.homeTeam, true),
      awayTeam: this.createTeamState(fixture.awayTeam, false),
      ball: { x: 50, y: 50, holderId: null },
      minute: 0,
      isPlaying: false,
      events: []
    };

    this.matches.set(fixtureId, state);
    return state;
  }

  private static createTeamState(club: any, isHome: boolean): TeamState {
    const players = club.players || [];
    return {
      id: club.id,
      name: club.name,
      score: 0,
      players: players.slice(0, 11).map((p: any, i: number) => {
        // Calculate speed based on pace (1-20) -> 0.8 to 1.8
        const pace = p.pace || 10;
        const speed = 0.8 + (pace / 20);

        return {
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          position: this.getStartingPosition(i, isHome),
          targetPosition: this.getStartingPosition(i, isHome),
          hasBall: false,
          speed: speed,
          positionType: this.getPositionType(p.position),
          stamina: 100,
          teamId: club.id,
          shirtNumber: i + 1,
          stats: {
            finishing: p.finishing || 10,
            tackling: p.tackling || 10,
            reflexes: p.reflexes || 10,
            passing: p.passing || 10
          }
        };
      })
    };
  }

  private static getPositionType(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
    if (position === 'GK') return 'GK';
    if (['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DEF';
    if (['DM', 'CM', 'AM', 'LM', 'RM'].includes(position)) return 'MID';
    return 'FWD';
  }

  private static getStartingPosition(index: number, isHome: boolean) {
    const positions = [
      { x: isHome ? 5 : 95, y: 50 },
      { x: isHome ? 20 : 80, y: 25 },
      { x: isHome ? 20 : 80, y: 40 },
      { x: isHome ? 20 : 80, y: 60 },
      { x: isHome ? 20 : 80, y: 75 },
      { x: isHome ? 40 : 60, y: 20 },
      { x: isHome ? 40 : 60, y: 40 },
      { x: isHome ? 40 : 60, y: 60 },
      { x: isHome ? 40 : 60, y: 80 },
      { x: isHome ? 70 : 30, y: 35 },
      { x: isHome ? 70 : 30, y: 65 }
    ];
    return positions[Math.min(index, positions.length - 1)];
  }

  static startMatch(fixtureId: number): void {
    const match = this.matches.get(fixtureId);
    if (!match) throw new Error('Match not found');

    match.isPlaying = true;

    this.intervals.set(fixtureId, setInterval(() => {
      this.updateMatch(fixtureId);
    }, 100));
  }

  static pauseMatch(fixtureId: number): void {
    const interval = this.intervals.get(fixtureId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(fixtureId);
    }

    const match = this.matches.get(fixtureId);
    if (match) {
      match.isPlaying = false;
    }
  }

  private static updateMatch(fixtureId: number): void {
    const match = this.matches.get(fixtureId);
    if (!match) return;

    if (match.isPlaying) {
      match.minute += 0.1;

      if (Math.random() < 0.02) {
        this.simulateMatchEvent(match);
      }

      this.updatePlayerPositions(match);

      if (this.io) {
        this.io.to(`match:${fixtureId}`).emit('matchState', match);
      }
    }
  }

  private static simulateMatchEvent(match: MatchState): void {
    const minute = Math.floor(match.minute);
    const isHomeTeam = Math.random() > 0.5;
    const team = isHomeTeam ? match.homeTeam : match.awayTeam;
    const opponent = isHomeTeam ? match.awayTeam : match.homeTeam;

    const activePlayers = team.players.filter(p => !p.isInjured && !p.isSentOff);
    if (activePlayers.length === 0) return;

    const player = activePlayers[Math.floor(Math.random() * activePlayers.length)];
    const random = Math.random();

    let event: MatchEvent;

    if (random < 0.3) {
      const gk = opponent.players.find(p => p.positionType === 'GK');
      const gkReflexes = gk ? gk.stats.reflexes : 10;
      const finishing = player.stats.finishing;

      const goalChance = 0.1 + (finishing / 100) - (gkReflexes / 200);
      const isGoal = Math.random() < Math.max(0.01, goalChance);

      if (isGoal) {
        team.score++;
        player.goals = (player.goals || 0) + 1;
        event = {
          type: 'goal',
          minute,
          description: `${player.name} scores for ${team.name}!`,
          playerName: player.name,
          clubId: team.id
        };
      } else {
        event = {
          type: 'near_miss',
          minute,
          description: `${player.name}'s shot goes wide`,
          playerName: player.name,
          clubId: team.id
        };
      }
    } else if (random < 0.5) {
      const foulChance = 0.1;
      if (Math.random() < foulChance) {
        const isRed = Math.random() < 0.1;
        if (isRed) {
          player.isSentOff = true;
          event = {
            type: 'red_card',
            minute,
            description: `${player.name} sent off!`,
            playerName: player.name,
            clubId: team.id
          };
        } else {
          player.cards = player.cards || [];
          player.cards.push('yellow');
          event = {
            type: 'yellow_card',
            minute,
            description: `${player.name} booked`,
            playerName: player.name,
            clubId: team.id
          };
        }
      } else {
        return;
      }
    } else if (random < 0.7) {
      const gk = opponent.players.find(p => p.positionType === 'GK');
      if (gk && Math.random() < (gk.stats.reflexes / 30)) {
        event = {
          type: 'save',
          minute,
          description: `${gk.name} saves!`,
          playerName: gk.name,
          clubId: opponent.id
        };
      } else {
        return;
      }
    } else {
      if (Math.random() < 0.05) {
        player.isInjured = true;
        event = {
          type: 'injury',
          minute,
          description: `${player.name} is injured`,
          playerName: player.name,
          clubId: team.id
        };
      } else {
        return;
      }
    }

    match.events.push(event);
  }

  private static updatePlayerPositions(match: MatchState): void {
    const allPlayers = [...match.homeTeam.players, ...match.awayTeam.players];
    const ball = match.ball;

    allPlayers.forEach(player => {
      if (player.isInjured || player.isSentOff) return;

      if (player.hasBall) {
        const dribbleSpeed = player.speed * 0.9;

        const isHomeTeam = player.teamId === match.homeTeam.id;
        const targetX = isHomeTeam ? 100 : 0;
        const targetY = 50;

        const dx = targetX - player.position.x;
        const dy = targetY - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 2) {
          player.position.x += (dx / distance) * dribbleSpeed;
          player.position.y += (dy / distance) * dribbleSpeed * 0.5;
        }

        ball.x = player.position.x + (isHomeTeam ? 2 : -2);
        ball.y = player.position.y;
      } else {
        const ballDistance = Math.sqrt(
          Math.pow(ball.x - player.position.x, 2) +
          Math.pow(ball.y - player.position.y, 2)
        );

        if (ballDistance > 20) {
          const dx = ball.x - player.position.x;
          const dy = ball.y - player.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            player.position.x += (dx / distance) * player.speed * 0.7;
            player.position.y += (dy / distance) * player.speed * 0.7;
          }
        }
      }

      player.position.x = Math.max(0, Math.min(100, player.position.x));
      player.position.y = Math.max(0, Math.min(100, player.position.y));

      if (!ball.holderId) {
        const distanceToBall = Math.sqrt(
          Math.pow(ball.x - player.position.x, 2) +
          Math.pow(ball.y - player.position.y, 2)
        );

        if (distanceToBall < 3) {
          player.hasBall = true;
          ball.holderId = player.id;
        }
      }
    });
  }
}
