import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchEvent {
  id?: number;
  fixtureId: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'substitution' | 'near_miss' | 'save' | 'penalty_goal' | 'penalty_miss';
  minute: number;
  description: string;
  playerName?: string;
  clubId?: number;
  isPenalty?: boolean;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

// --- NEW: Post-match analysis types ---
export interface MatchAnalysis {
  xg: {
    home: number;
    away: number;
    perPlayer: { [playerId: number]: number };
  };
  heatmap: {
    [playerId: number]: Array<{ x: number; y: number }>;
  };
  playerRatings: {
    [playerId: number]: number;
  };
}

export class MatchSimulationService {
  
  /**
   * Simulate a complete match
   */
  static async simulateMatch(fixtureId: number): Promise<MatchResult> {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: {
          include: {
            players: true,
            formations: true,
            strategies: true
          }
        },
        awayClub: {
          include: {
            players: true,
            formations: true,
            strategies: true
          }
        }
      }
    });

    if (!fixture) {
      throw new Error('Fixture not found');
    }

    // --- NEW: Fetch saved StartingXI for both clubs ---
    const [homeStartingXI, awayStartingXI] = await Promise.all([
      prisma.startingXI.findUnique({
        where: { clubId: fixture.homeClub.id },
        include: { slots: true },
      }),
      prisma.startingXI.findUnique({
        where: { clubId: fixture.awayClub.id },
        include: { slots: true },
      })
    ]);

    // Helper to get lineup from saved XI or fallback to best XI
    function getLineup(club: any, startingXI: any) {
      if (startingXI && startingXI.slots.length === 11) {
        // Map slot playerIds to player objects, filter out injured/international
        const idSet = new Set(startingXI.slots.map((s: any) => s.playerId));
        const lineup = club.players.filter((p: any) => idSet.has(p.id) && !p.injured && !p.onInternationalDuty);
        if (lineup.length === 11) return lineup;
      }
      // Fallback: best available XI
      return club.players
        .filter((p: any) => !p.injured && !p.onInternationalDuty)
        .sort((a: any, b: any) => b.skill - a.skill)
        .slice(0, 11);
    }

    // Use the correct lineups
    const homeLineup = getLineup(fixture.homeClub, homeStartingXI);
    const awayLineup = getLineup(fixture.awayClub, awayStartingXI);

    // Calculate team strengths using the selected lineups
    const homeStrength = this.calculateTeamStrengthFromLineup(homeLineup, fixture.homeClub);
    const awayStrength = this.calculateTeamStrengthFromLineup(awayLineup, fixture.awayClub);

    // Generate match events
    const events = this.generateMatchEventsWithLineups(fixture, homeStrength, awayStrength, homeLineup, awayLineup);

    // Calculate match statistics
    const stats = this.calculateMatchStats(events, homeStrength, awayStrength);

    // Update fixture with result
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        played: true,
        homeGoals: stats.homeGoals,
        awayGoals: stats.awayGoals
      }
    });

    // Save match events
    for (const event of events) {
      await prisma.matchEvent.create({
        data: {
          fixtureId: event.fixtureId,
          type: event.type,
          minute: event.minute,
          description: event.description,
          playerName: event.playerName,
          clubId: event.clubId
        }
      });
    }

    // Update player statistics and morale
    await this.updatePlayerStats(fixture, events);

    // Update club form and morale
    await this.updateClubStats(fixture, stats);

    // --- NEW: Generate post-match analysis ---
    // xG: assign random xG to each shot event, sum for team and per player
    const xgPerPlayer: { [playerId: number]: number } = {};
    let homeXG = 0;
    let awayXG = 0;
    for (const ev of events) {
      if (ev.type === 'goal' || ev.type === 'near_miss' || ev.type === 'penalty_goal' || ev.type === 'penalty_miss') {
        const xg = Math.random() * 0.7 + 0.1; // xG between 0.1 and 0.8
        if (ev.playerName && ev.clubId) {
          const player = [...homeLineup, ...awayLineup].find(p => p.name === ev.playerName);
          if (player) {
            xgPerPlayer[player.id] = (xgPerPlayer[player.id] || 0) + xg;
            if (fixture.homeClub.players.some((p: any) => p.id === player.id)) homeXG += xg;
            else awayXG += xg;
          }
        }
      }
    }
    // Heatmap: random positions for each player (for demo)
    const heatmap: { [playerId: number]: Array<{ x: number; y: number }> } = {};
    for (const p of [...homeLineup, ...awayLineup]) {
      heatmap[p.id] = Array.from({ length: 10 }, () => ({ x: Math.random() * 100, y: Math.random() * 100 }));
    }
    // Player ratings: 6.0 base, +1 per goal, +0.5 per assist, -1 per red card
    const playerRatings: { [playerId: number]: number } = {};
    for (const p of [...homeLineup, ...awayLineup]) {
      let rating = 6.0;
      const goals = events.filter(ev => ev.type === 'goal' && ev.playerName === p.name).length;
      const assists = 0; // TODO: add assist logic if available
      const reds = events.filter(ev => ev.type === 'red_card' && ev.playerName === p.name).length;
      rating += goals * 1.0 + assists * 0.5 - reds * 1.0;
      playerRatings[p.id] = Math.max(5.0, Math.min(10.0, rating));
    }
    const analysis: MatchAnalysis = {
      xg: { home: homeXG, away: awayXG, perPlayer: xgPerPlayer },
      heatmap,
      playerRatings
    };
    // Store in fixture.analysis (JSON field)
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: { analysis: analysis === null ? Prisma.JsonNull : (analysis as unknown as Prisma.InputJsonValue) },
    });

    return stats;
  }

  /**
   * Calculate team strength based on players and formation
   */
  private static calculateTeamStrength(club: any): number {
    if (!club.players || club.players.length === 0) {
      return 50; // Default strength for clubs without players
    }

    // Get best 11 players (or all if less than 11)
    const bestPlayers = club.players
      .filter((p: any) => !p.injured && !p.onInternationalDuty)
      .sort((a: any, b: any) => b.skill - a.skill)
      .slice(0, 11);

    if (bestPlayers.length === 0) {
      return 30; // Very weak if no available players
    }

    // Calculate average skill
    const totalSkill = bestPlayers.reduce((sum: number, p: any) => sum + p.skill, 0);
    const averageSkill = totalSkill / bestPlayers.length;

    // Apply formation bonus
    let formationBonus = 1.0;
    if (club.formations && club.formations.length > 0) {
      const formation = club.formations[0];
      formationBonus = this.calculateFormationBonus(formation);
    }

    // Apply strategy bonus
    let strategyBonus = 1.0;
    if (club.strategies && club.strategies.length > 0) {
      const strategy = club.strategies[0];
      strategyBonus = this.calculateStrategyBonus(strategy);
    }

    // Apply morale bonus
    const moraleBonus = 1.0 + (club.morale - 50) / 100;

    return Math.round(averageSkill * formationBonus * strategyBonus * moraleBonus);
  }

  // --- NEW: Calculate team strength from a specific lineup ---
  private static calculateTeamStrengthFromLineup(lineup: any[], club: any): number {
    if (!lineup || lineup.length === 0) {
      return 50;
    }
    const totalSkill = lineup.reduce((sum: number, p: any) => sum + p.skill, 0);
    const averageSkill = totalSkill / lineup.length;
    let formationBonus = 1.0;
    if (club.formations && club.formations.length > 0) {
      const formation = club.formations[0];
      formationBonus = this.calculateFormationBonus(formation);
    }
    let strategyBonus = 1.0;
    if (club.strategies && club.strategies.length > 0) {
      const strategy = club.strategies[0];
      strategyBonus = this.calculateStrategyBonus(strategy);
    }
    const moraleBonus = 1.0 + (club.morale - 50) / 100;
    return Math.round(averageSkill * formationBonus * strategyBonus * moraleBonus);
  }

  /**
   * Calculate formation bonus
   */
  private static calculateFormationBonus(formation: any): number {
    let bonus = 1.0;
    
    // Formation style bonuses
    switch (formation.style) {
      case 'attacking':
        bonus += 0.1;
        break;
      case 'defensive':
        bonus += 0.05;
        break;
      case 'balanced':
        bonus += 0.08;
        break;
    }

    // Intensity bonus
    bonus += (formation.intensity - 50) / 200;

    return bonus;
  }

  /**
   * Calculate strategy bonus
   */
  private static calculateStrategyBonus(strategy: any): number {
    let bonus = 1.0;
    
    switch (strategy.approach) {
      case 'possession':
        bonus += 0.05;
        break;
      case 'counter_attack':
        bonus += 0.08;
        break;
      case 'direct':
        bonus += 0.06;
        break;
      case 'pressing':
        bonus += 0.07;
        break;
    }

    return bonus;
  }

  /**
   * Generate realistic match events
   */
  private static generateMatchEvents(fixture: any, homeStrength: number, awayStrength: number): MatchEvent[] {
    const events: MatchEvent[] = [];
    const homeClub = fixture.homeClub;
    const awayClub = fixture.awayClub;

    // Calculate goal probabilities
    const homeGoalProb = this.calculateGoalProbability(homeStrength, awayStrength, true);
    const awayGoalProb = this.calculateGoalProbability(awayStrength, homeStrength, false);

    // Generate goals
    const homeGoals = this.generateGoals(homeGoalProb, homeClub, 'home');
    const awayGoals = this.generateGoals(awayGoalProb, awayClub, 'away');

    events.push(...homeGoals, ...awayGoals);

    // Generate other events
    const otherEvents = this.generateOtherEvents(fixture, homeStrength, awayStrength);
    events.push(...otherEvents);

    // Sort events by minute
    events.sort((a, b) => a.minute - b.minute);

    return events;
  }

  // --- NEW: Generate match events using the selected lineups ---
  private static generateMatchEventsWithLineups(fixture: any, homeStrength: number, awayStrength: number, homeLineup: any[], awayLineup: any[]): MatchEvent[] {
    // Use the same logic as generateMatchEvents, but pass the lineups
    const events: MatchEvent[] = [];
    const homeClub = { ...fixture.homeClub, players: homeLineup };
    const awayClub = { ...fixture.awayClub, players: awayLineup };
    // Calculate goal probabilities
    const homeGoalProb = this.calculateGoalProbability(homeStrength, awayStrength, true);
    const awayGoalProb = this.calculateGoalProbability(awayStrength, homeStrength, false);
    // Generate goals
    const homeGoals = this.generateGoals(homeGoalProb, homeClub, 'home');
    const awayGoals = this.generateGoals(awayGoalProb, awayClub, 'away');
    events.push(...homeGoals, ...awayGoals);
    // Generate other events
    const otherEvents = this.generateOtherEvents(fixture, homeStrength, awayStrength);
    events.push(...otherEvents);
    // Sort events by minute
    events.sort((a, b) => a.minute - b.minute);
    return events;
  }

  /**
   * Calculate goal probability
   */
  private static calculateGoalProbability(attackingStrength: number, defendingStrength: number, isHome: boolean): number {
    let baseProb = (attackingStrength - defendingStrength) / 100;
    
    // Home advantage
    if (isHome) {
      baseProb += 0.1;
    }

    // Ensure probability is reasonable
    return Math.max(0.05, Math.min(0.4, baseProb + 0.15));
  }

  /**
   * Generate goals for a team
   */
  private static generateGoals(goalProb: number, club: any, team: 'home' | 'away'): MatchEvent[] {
    const events: MatchEvent[] = [];
    const maxGoals = Math.floor(Math.random() * 4); // 0-3 goals per team

    for (let i = 0; i < maxGoals; i++) {
      if (Math.random() < goalProb) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const scorer = this.selectRandomPlayer(club.players, ['FWD', 'MID']);
        
        if (scorer) {
          events.push({
            fixtureId: club.homeFixtures?.[0]?.id || club.awayFixtures?.[0]?.id,
            type: 'goal',
            minute,
            description: `GOAL! ${scorer.name} scores for ${club.name}!`,
            playerName: scorer.name,
            clubId: club.id
          });
        }
      }
    }

    return events;
  }

  /**
   * Generate other match events
   */
  private static generateOtherEvents(fixture: any, homeStrength: number, awayStrength: number): MatchEvent[] {
    const events: MatchEvent[] = [];
    const homeClub = fixture.homeClub;
    const awayClub = fixture.awayClub;

    // Yellow cards (2-6 per match)
    const yellowCards = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < yellowCards; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const club = Math.random() < 0.5 ? homeClub : awayClub;
      const player = this.selectRandomPlayer(club.players, ['DEF', 'MID']);
      
      if (player) {
        events.push({
          fixtureId: fixture.id,
          type: 'yellow_card',
          minute,
          description: `Yellow card for ${player.name}`,
          playerName: player.name,
          clubId: club.id
        });
      }
    }

    // Red cards (0-2 per match)
    const redCards = Math.floor(Math.random() * 3);
    for (let i = 0; i < redCards; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const club = Math.random() < 0.5 ? homeClub : awayClub;
      const player = this.selectRandomPlayer(club.players, ['DEF', 'MID']);
      
      if (player) {
        events.push({
          fixtureId: fixture.id,
          type: 'red_card',
          minute,
          description: `Red card for ${player.name}!`,
          playerName: player.name,
          clubId: club.id
        });
      }
    }

    // Injuries (0-2 per match)
    const injuries = Math.floor(Math.random() * 3);
    for (let i = 0; i < injuries; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const club = Math.random() < 0.5 ? homeClub : awayClub;
      const player = this.selectRandomPlayer(club.players, ['FWD', 'MID', 'DEF']);
      
      if (player) {
        events.push({
          fixtureId: fixture.id,
          type: 'injury',
          minute,
          description: `${player.name} is injured!`,
          playerName: player.name,
          clubId: club.id
        });
      }
    }

    return events;
  }

  /**
   * Select a random player by position
   */
  private static selectRandomPlayer(players: any[], positions: string[]): any {
    const availablePlayers = players.filter((p: any) => 
      positions.includes(p.position) && !p.injured && !p.onInternationalDuty
    );
    
    if (availablePlayers.length === 0) {
      return null;
    }
    
    return availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
  }

  /**
   * Calculate match statistics from events
   */
  private static calculateMatchStats(events: MatchEvent[], homeStrength: number, awayStrength: number): MatchResult {
    const homeGoals = events.filter(e => e.type === 'goal' && e.clubId === events[0]?.clubId).length;
    const awayGoals = events.filter(e => e.type === 'goal' && e.clubId !== events[0]?.clubId).length;
    
    const homeYellowCards = events.filter(e => e.type === 'yellow_card' && e.clubId === events[0]?.clubId).length;
    const awayYellowCards = events.filter(e => e.type === 'yellow_card' && e.clubId !== events[0]?.clubId).length;
    
    const homeRedCards = events.filter(e => e.type === 'red_card' && e.clubId === events[0]?.clubId).length;
    const awayRedCards = events.filter(e => e.type === 'red_card' && e.clubId !== events[0]?.clubId).length;

    // Calculate possession based on team strength
    const totalStrength = homeStrength + awayStrength;
    const homePossession = Math.round((homeStrength / totalStrength) * 100);
    const awayPossession = 100 - homePossession;

    // Generate realistic shot statistics
    const homeShots = Math.floor(Math.random() * 100) + 5 + Math.floor(homeStrength / 10);
    const awayShots = Math.floor(Math.random() * 100) + 5 + Math.floor(awayStrength / 10);
    
    const homeShotsOnTarget = Math.floor(homeShots * (0.3 + Math.random() * 0.3));
    const awayShotsOnTarget = Math.floor(awayShots * (0.3 + Math.random() * 0.3));

    return {
      homeGoals,
      awayGoals,
      events,
      homePossession,
      awayPossession,
      homeShots,
      awayShots,
      homeShotsOnTarget,
      awayShotsOnTarget,
      homeCorners: Math.floor(Math.random() * 8) + 2,
      awayCorners: Math.floor(Math.random() * 8) + 2,
      homeFouls: Math.floor(Math.random() * 15) + 8,
      awayFouls: Math.floor(Math.random() * 15) + 8,
      homeYellowCards,
      awayYellowCards,
      homeRedCards,
      awayRedCards
    };
  }

  /**
   * Update player statistics and morale after match
   */
  private static async updatePlayerStats(fixture: any, events: MatchEvent[]): Promise<void> {
    const allPlayers = [...fixture.homeClub.players, ...fixture.awayClub.players];
    
    for (const player of allPlayers) {
      let moraleChange = 0;
      
      // Check if player scored
      const goals = events.filter(e => e.playerName === player.name && e.type === 'goal').length;
      if (goals > 0) {
        moraleChange += goals * 5;
      }
      
      // Check if player got carded
      const yellowCards = events.filter(e => e.playerName === player.name && e.type === 'yellow_card').length;
      const redCards = events.filter(e => e.playerName === player.name && e.type === 'red_card').length;
      
      if (yellowCards > 0) {
        moraleChange -= yellowCards * 2;
      }
      
      if (redCards > 0) {
        moraleChange -= 10;
      }
      
      // Check if player was injured
      const injuries = events.filter(e => e.playerName === player.name && e.type === 'injury').length;
      if (injuries > 0) {
        await prisma.player.update({
          where: { id: player.id },
          data: { injured: true }
        });
        moraleChange -= 5;
      }
      
      // Update morale
      if (moraleChange !== 0) {
        const newMorale = Math.max(0, Math.min(100, player.morale + moraleChange));
        await prisma.player.update({
          where: { id: player.id },
          data: { morale: newMorale }
        });
      }
    }
  }

  /**
   * Update club statistics after match
   */
  private static async updateClubStats(fixture: any, stats: MatchResult): Promise<void> {
    const homeClub = fixture.homeClub;
    const awayClub = fixture.awayClub;
    
    // Update home club morale
    let homeMoraleChange = 0;
    if (stats.homeGoals > stats.awayGoals) {
      homeMoraleChange = 5; // Win
    } else if (stats.homeGoals === stats.awayGoals) {
      homeMoraleChange = 1; // Draw
    } else {
      homeMoraleChange = -3; // Loss
    }
    
    const newHomeMorale = Math.max(0, Math.min(100, homeClub.morale + homeMoraleChange));
    await prisma.club.update({
      where: { id: homeClub.id },
      data: { morale: newHomeMorale }
    });
    
    // Update away club morale
    let awayMoraleChange = 0;
    if (stats.awayGoals > stats.homeGoals) {
      awayMoraleChange = 5; // Win
    } else if (stats.awayGoals === stats.homeGoals) {
      awayMoraleChange = 1; // Draw
    } else {
      awayMoraleChange = -3; // Loss
    }
    
    const newAwayMorale = Math.max(0, Math.min(100, awayClub.morale + awayMoraleChange));
    await prisma.club.update({
      where: { id: awayClub.id },
      data: { morale: newAwayMorale }
    });
  }

  // --- NEW: Fetch match analysis for a fixture ---
  static async getMatchAnalysis(fixtureId: number): Promise<MatchAnalysis | null> {
    const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
    return fixture && fixture.analysis ? (fixture.analysis as unknown as MatchAnalysis) : null;
  }
} 