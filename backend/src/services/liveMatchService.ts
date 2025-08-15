import { PrismaClient } from '@prisma/client';
import { MatchEvent } from './matchSimulationService';

const prisma = new PrismaClient();

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
}

export class LiveMatchService {
  private static matches: Map<number, MatchState> = new Map();
  private static intervals: Map<number, NodeJS.Timeout> = new Map();

  // Get all currently live match IDs
  static getLiveMatchIds(): Set<number> {
    return new Set(this.matches.keys());
  }

  // Get the current state of a specific match
  static getMatchState(fixtureId: number): MatchState | null {
    return this.matches.get(fixtureId) || null;
  }

  static async initializeMatch(fixtureId: number): Promise<MatchState> {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: { include: { players: { include: { player: true } } } },
        awayClub: { include: { players: { include: { player: true } } } }
      }
    });

    if (!fixture) throw new Error('Fixture not found');

    const state: MatchState = {
      fixtureId,
      homeTeam: this.createTeamState(fixture.homeClub, true),
      awayTeam: this.createTeamState(fixture.awayClub, false),
      ball: { x: 50, y: 50, holderId: null },
      minute: 0,
      isPlaying: false,
      events: []
    };

    this.matches.set(fixtureId, state);
    return state;
  }

  private static createTeamState(club: any, isHome: boolean) {
    return {
      id: club.id,
      name: club.name,
      score: 0,
      players: club.players.map((p: any, i: number) => ({
        id: p.player.id,
        name: p.player.name,
        position: this.getStartingPosition(i, isHome),
        hasBall: false,
        speed: 1 + Math.random() * 0.5
      }))
    };
  }

  private static getStartingPosition(index: number, isHome: boolean) {
    // Simple 4-4-2 formation
    const positions = [
      { x: isHome ? 5 : 95, y: 50 }, // GK
      { x: isHome ? 20 : 80, y: 25 }, // LB
      { x: isHome ? 20 : 80, y: 40 }, // LCB
      { x: isHome ? 20 : 80, y: 60 }, // RCB
      { x: isHome ? 20 : 80, y: 75 }, // RB
      { x: isHome ? 40 : 60, y: 20 }, // LM
      { x: isHome ? 40 : 60, y: 40 }, // CM
      { x: isHome ? 40 : 60, y: 60 }, // CM
      { x: isHome ? 40 : 60, y: 80 }, // RM
      { x: isHome ? 70 : 30, y: 35 }, // ST
      { x: isHome ? 70 : 30, y: 65 }  // ST
    ];
    return positions[Math.min(index, positions.length - 1)];
  }

  static startMatch(fixtureId: number): void {
    const match = this.matches.get(fixtureId);
    if (!match) throw new Error('Match not found');
    
    match.isPlaying = true;
    
    // Update match state every 100ms
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

  static getMatchState(fixtureId: number): MatchState | null {
    return this.matches.get(fixtureId) || null;
  }

  private static updateMatch(fixtureId: number): void {
    const match = this.matches.get(fixtureId);
    if (!match) return;

    // Update match time
    if (match.isPlaying) {
      match.minute += 0.1; // 6 seconds per update
      
      // Simulate match events
      if (Math.random() < 0.02) { // 2% chance per update
        this.simulateMatchEvent(match);
      }

      // Update player positions
      this.updatePlayerPositions(match);
    }
  }

  private static simulateMatchEvent(match: MatchState): void {
    const minute = Math.floor(match.minute);
    const isHomeTeam = Math.random() > 0.5;
    const team = isHomeTeam ? match.homeTeam : match.awayTeam;
    const opponent = isHomeTeam ? match.awayTeam : match.homeTeam;
    
    // Get a random player from the team, weighted by position
    const getRandomPlayer = (team: TeamState, positionWeights: { [key: string]: number }) => {
      const players = team.players.filter(p => !p.isInjured);
      const weightedPlayers = players.flatMap(player => {
        const weight = positionWeights[player.positionType] || 1;
        return Array(weight).fill(player);
      });
      return weightedPlayers[Math.floor(Math.random() * weightedPlayers.length)];
    };
    
    // Determine event type based on game state
    let eventType: string;
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% chance of a goal attempt
      const isGoal = Math.random() < 0.3; // 30% chance to score
      const attacker = getRandomPlayer(team, { FWD: 5, MID: 3, DEF: 1 });
      const defender = getRandomPlayer(opponent, { DEF: 5, MID: 3, GK: 2 });
      
      if (isGoal) {
        // Goal scored
        eventType = 'goal';
        team.score++;
        
        // Update player stats
        attacker.goals = (attacker.goals || 0) + 1;
        
        // Add assist chance (30% of goals have an assist)
        if (Math.random() < 0.3) {
          const assister = getRandomPlayer(team, { MID: 5, FWD: 3, DEF: 2 });
          if (assister.id !== attacker.id) {
            assister.assists = (assister.assists || 0) + 1;
            match.events.push({
              type: 'assist',
              minute,
              description: `${assister.name} assists ${attacker.name}'s goal`,
              playerName: assister.name,
              clubId: team.id
            });
          }
        }
      } else {
        // Shot saved/missed
        eventType = Math.random() < 0.7 ? 'shotSaved' : 'shotMissed';
        if (eventType === 'shotSaved') {
          const goalkeeper = opponent.players.find(p => p.positionType === 'GK');
          if (goalkeeper) {
            goalkeeper.saves = (goalkeeper.saves || 0) + 1;
            defender = goalkeeper;
          }
        }
      }
      
      match.events.push({
        type: eventType,
        minute,
        description: this.getEventDescription(eventType, attacker, defender, team, opponent),
        playerName: attacker.name,
        clubId: team.id
      });
      
    } else if (random < 0.7) {
      // 30% chance of a foul
      const fouler = getRandomPlayer(team, { MID: 4, DEF: 3, FWD: 2 });
      const fouled = getRandomPlayer(opponent, { MID: 4, FWD: 3, DEF: 2 });
      
      // Determine if it's a yellow or red card (5% chance of red)
      const isRedCard = Math.random() < 0.05;
      eventType = isRedCard ? 'redCard' : Math.random() < 0.3 ? 'yellowCard' : 'foul';
      
      if (eventType === 'redCard' || eventType === 'yellowCard') {
        fouler.cards = fouler.cards || [];
        fouler.cards.push(eventType);
        
        if (eventType === 'redCard') {
          fouler.isSentOff = true;
          // Remove player from match (simplified)
          team.players = team.players.filter(p => p.id !== fouler.id);
        }
      }
      
      match.events.push({
        type: eventType,
        minute,
        description: this.getEventDescription(eventType, fouler, fouled, team, opponent),
        playerName: fouler.name,
        clubId: team.id
      });
      
    } else if (random < 0.85) {
      // 15% chance of a corner
      const taker = getRandomPlayer(team, { MID: 5, DEF: 3, FWD: 2 });
      match.events.push({
        type: 'corner',
        minute,
        description: `${taker.name} takes a corner for ${team.name}`,
        playerName: taker.name,
        clubId: team.id
      });
      
    } else if (random < 0.95) {
      // 10% chance of an injury
      const injuredPlayer = getRandomPlayer(team, { MID: 3, DEF: 3, FWD: 2, GK: 1 });
      injuredPlayer.isInjured = true;
      
      // 70% chance of substitution
      if (Math.random() < 0.7 && team.players.some(p => !p.hasPlayed)) {
        const substitute = team.players.find(p => !p.hasPlayed && p.positionType === injuredPlayer.positionType);
        if (substitute) {
          substitute.hasPlayed = true;
          match.events.push({
            type: 'substitution',
            minute,
            description: `${substitute.name} replaces the injured ${injuredPlayer.name}`,
            playerName: substitute.name,
            clubId: team.id
          });
        }
      }
      
      match.events.push({
        type: 'injury',
        minute,
        description: `${injuredPlayer.name} is injured and needs treatment`,
        playerName: injuredPlayer.name,
        clubId: team.id
      });
    }
  }

  private static getEventDescription(eventType: string, player1: PlayerState, player2: PlayerState, team: TeamState, opponent: TeamState) {
    switch (eventType) {
      case 'goal':
        return `${player1.name} scores for ${team.name}`;
      case 'shotSaved':
        return `${player2.name} saves ${player1.name}'s shot`;
      case 'shotMissed':
        return `${player1.name} misses a shot`;
      case 'foul':
        return `${player1.name} commits a foul on ${player2.name}`;
      case 'yellowCard':
        return `${player1.name} receives a yellow card`;
      case 'redCard':
        return `${player1.name} receives a red card`;
      case 'corner':
        return `${player1.name} takes a corner`;
      case 'injury':
        return `${player1.name} is injured`;
      case 'substitution':
        return `${player1.name} replaces ${player2.name}`;
      default:
        return '';
    }
  }

  private static updatePlayerPositions(match: MatchState): void {
    const allPlayers = [...match.homeTeam.players, ...match.awayTeam.players];
    const ball = match.ball;
    
    allPlayers.forEach(player => {
      if (player.hasBall) {
        // Player with ball moves towards opponent's goal
        const isHomeTeam = player.teamId === match.homeTeam.id;
        const targetX = isHomeTeam ? 100 : 0;
        const targetY = 50;
        
        // Move towards target
        const dx = targetX - player.position.x;
        const dy = targetY - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 2) {
          player.position.x += (dx / distance) * player.speed;
          player.position.y += (dy / distance) * player.speed * 0.5; // Less vertical movement
        }
        
        // Update ball position to follow player
        ball.x = player.position.x + (isHomeTeam ? 2 : -2);
        ball.y = player.position.y;
      } else {
        // Player without ball - position based on role and ball position
        const ballDistance = Math.sqrt(
          Math.pow(ball.x - player.position.x, 2) + 
          Math.pow(ball.y - player.position.y, 2)
        );
        
        // Move towards ball if it's far, or hold position if it's close
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
      
      // Keep players in bounds
      player.position.x = Math.max(0, Math.min(100, player.position.x));
      player.position.y = Math.max(0, Math.min(100, player.position.y));
      
      // Check for ball interception
      if (!ball.holderId) {
        const distanceToBall = Math.sqrt(
          Math.pow(ball.x - player.position.x, 2) + 
          Math.pow(ball.y - player.position.y, 2)
        );
        
        if (distanceToBall < 3) {
          player.hasBall = true;
          ball.holderId = player.id;
          
          // Add match event for possession change
          match.events.push({
            type: 'possession',
            minute: Math.floor(match.minute),
            description: `${player.name} wins the ball`,
            playerName: player.name,
            clubId: player.teamId
          });
        }
      }
    });
  }
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

interface TeamState {
  id: number;
  name: string;
  score: number;
  players: PlayerState[];
}

interface PlayerState {
  id: number;
  name: string;
  position: { x: number; y: number };
  hasBall: boolean;
  speed: number;
}
