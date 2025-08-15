const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MatchSimulationService {
  static async simulateMatch(fixtureId) {
    try {
      const fixture = await prisma.fixture.findUnique({
        where: { id: fixtureId },
        include: {
          homeClub: {
            include: {
              players: {
                where: {
                  injured: false,
                  onInternationalDuty: false,
                  onLoan: false
                }
              }
            }
          },
          awayClub: {
            include: {
              players: {
                where: {
                  injured: false,
                  onInternationalDuty: false,
                  onLoan: false
                }
              }
            }
          },
          league: true
        }
      });

      if (!fixture) {
        throw new Error('Fixture not found');
      }

      // Calculate team strengths
      const homeStrength = this.calculateTeamStrength(fixture.homeClub.players);
      const awayStrength = this.calculateTeamStrength(fixture.awayClub.players);

      // Generate match events
      const events = this.generateMatchEvents(homeStrength, awayStrength);

      // Calculate final score
      const homeGoals = events.filter(e => e.type === 'goal' && e.team === 'home').length;
      const awayGoals = events.filter(e => e.type === 'goal' && e.team === 'away').length;

      // Update fixture with result
      const updatedFixture = await prisma.fixture.update({
        where: { id: fixtureId },
        data: {
          homeScore: homeGoals,
          awayScore: awayGoals,
          status: 'completed',
          events: events,
          completedAt: new Date()
        },
        include: {
          homeClub: true,
          awayClub: true,
          league: true
        }
      });

      // Update player stats and morale
      await this.updatePlayerStats(fixture.homeClub.players, fixture.awayClub.players, events);

      // Update league table
      await this.updateLeagueTable(fixture.leagueId, fixture.homeClubId, fixture.awayClubId, homeGoals, awayGoals);

      return {
        fixture: updatedFixture,
        events: events,
        homeStrength,
        awayStrength
      };
    } catch (error) {
      console.error('Error simulating match:', error);
      throw error;
    }
  }

  static calculateTeamStrength(players) {
    if (!players || players.length === 0) {
      return 50; // Base strength for teams without players
    }

    const totalSkill = players.reduce((sum, player) => sum + player.skill, 0);
    const averageSkill = totalSkill / players.length;
    
    // Factor in team size (more players = better depth)
    const depthBonus = Math.min(players.length / 11, 1) * 10;
    
    // Factor in morale
    const averageMorale = players.reduce((sum, player) => sum + (player.morale || 50), 0) / players.length;
    const moraleBonus = (averageMorale - 50) * 0.2;

    return Math.round(averageSkill + depthBonus + moraleBonus);
  }

  static generateMatchEvents(homeStrength, awayStrength) {
    const events = [];
    const matchDuration = 90; // minutes
    const eventChance = 0.1; // 10% chance per minute

    // Add kickoff event
    events.push({
      minute: 0,
      type: 'kickoff',
      description: 'Match begins!'
    });

    // Generate random events throughout the match
    for (let minute = 1; minute <= matchDuration; minute++) {
      if (Math.random() < eventChance) {
        const event = this.generateRandomEvent(minute, homeStrength, awayStrength);
        if (event) {
          events.push(event);
        }
      }
    }

    // Ensure at least some goals are scored
    const goals = events.filter(e => e.type === 'goal');
    if (goals.length === 0) {
      // Add at least one goal
      const goalMinute = Math.floor(Math.random() * 90) + 1;
      const team = homeStrength > awayStrength ? 'home' : 'away';
      events.push({
        minute: goalMinute,
        type: 'goal',
        team: team,
        description: `${team === 'home' ? 'Home' : 'Away'} team scores!`
      });
    }

    // Sort events by minute
    events.sort((a, b) => a.minute - b.minute);

    return events;
  }

  static generateRandomEvent(minute, homeStrength, awayStrength) {
    const eventTypes = ['shot', 'save', 'foul', 'yellow_card', 'red_card', 'injury', 'substitution'];
    const weights = [0.3, 0.2, 0.2, 0.1, 0.05, 0.05, 0.1];

    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedType = 'shot';

    for (let i = 0; i < eventTypes.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        selectedType = eventTypes[i];
        break;
      }
    }

    // Determine which team the event happens to
    const homeChance = homeStrength / (homeStrength + awayStrength);
    const team = Math.random() < homeChance ? 'home' : 'away';

    switch (selectedType) {
      case 'shot':
        // 20% chance of shot becoming a goal
        if (Math.random() < 0.2) {
          return {
            minute,
            type: 'goal',
            team,
            description: `${team === 'home' ? 'Home' : 'Away'} team scores!`
          };
        }
        return {
          minute,
          type: 'shot',
          team,
          description: `${team === 'home' ? 'Home' : 'Away'} team takes a shot`
        };

      case 'save':
        return {
          minute,
          type: 'save',
          team: team === 'home' ? 'away' : 'home',
          description: `${team === 'home' ? 'Away' : 'Home'} goalkeeper makes a save`
        };

      case 'foul':
        return {
          minute,
          type: 'foul',
          team,
          description: `${team === 'home' ? 'Home' : 'Away'} team commits a foul`
        };

      case 'yellow_card':
        return {
          minute,
          type: 'yellow_card',
          team,
          description: `${team === 'home' ? 'Home' : 'Away'} player receives a yellow card`
        };

      case 'red_card':
        return {
          minute,
          type: 'red_card',
          team,
          description: `${team === 'home' ? 'Home' : 'Away'} player receives a red card`
        };

      case 'injury':
        return {
          minute,
          type: 'injury',
          team,
          description: `${team === 'home' ? 'Home' : 'Away'} player is injured`
        };

      case 'substitution':
        return {
          minute,
          type: 'substitution',
          team,
          description: `${team === 'home' ? 'Home' : 'Away'} team makes a substitution`
        };

      default:
        return null;
    }
  }

  static async updatePlayerStats(homePlayers, awayPlayers, events) {
    const allPlayers = [...homePlayers, ...awayPlayers];
    
    for (const player of allPlayers) {
      let moraleChange = 0;
      let skillChange = 0;

      // Morale changes based on match events
      const teamEvents = events.filter(e => {
        if (homePlayers.includes(player)) {
          return e.team === 'home';
        } else {
          return e.team === 'away';
        }
      });

      // Positive events boost morale
      const goals = teamEvents.filter(e => e.type === 'goal').length;
      moraleChange += goals * 5;

      // Negative events reduce morale
      const cards = teamEvents.filter(e => e.type === 'yellow_card' || e.type === 'red_card').length;
      moraleChange -= cards * 3;

      // Injuries reduce morale
      const injuries = teamEvents.filter(e => e.type === 'injury').length;
      moraleChange -= injuries * 10;

      // Skill improvement from playing
      skillChange += Math.random() * 2; // Small random improvement

      // Update player
      await prisma.player.update({
        where: { id: player.id },
        data: {
          morale: Math.max(0, Math.min(100, (player.morale || 50) + moraleChange)),
          skill: Math.max(0, Math.min(100, (player.skill || 50) + skillChange))
        }
      });
    }
  }

  static async updateLeagueTable(leagueId, homeClubId, awayClubId, homeGoals, awayGoals) {
    try {
      // Get current stats for both clubs
      const [homeStats, awayStats] = await Promise.all([
        prisma.clubSeasonStats.findFirst({
          where: { leagueId, clubId: homeClubId }
        }),
        prisma.clubSeasonStats.findFirst({
          where: { leagueId, clubId: awayClubId }
        })
      ]);

      if (!homeStats || !awayStats) {
        console.warn('Club season stats not found for league table update');
        return;
      }

      // Update home club stats
      const homeUpdates = {
        played: homeStats.played + 1,
        goalsFor: homeStats.goalsFor + homeGoals,
        goalsAgainst: homeStats.goalsAgainst + awayGoals
      };

      // Update away club stats
      const awayUpdates = {
        played: awayStats.played + 1,
        goalsFor: awayStats.goalsFor + awayGoals,
        goalsAgainst: awayStats.goalsAgainst + homeGoals
      };

      // Determine result and update points
      if (homeGoals > awayGoals) {
        // Home win
        homeUpdates.won = homeStats.won + 1;
        homeUpdates.points = homeStats.points + 3;
        awayUpdates.lost = awayStats.lost + 1;
      } else if (awayGoals > homeGoals) {
        // Away win
        awayUpdates.won = awayStats.won + 1;
        awayUpdates.points = awayStats.points + 3;
        homeUpdates.lost = homeStats.lost + 1;
      } else {
        // Draw
        homeUpdates.drawn = homeStats.drawn + 1;
        homeUpdates.points = homeStats.points + 1;
        awayUpdates.drawn = awayStats.drawn + 1;
        awayUpdates.points = awayStats.points + 1;
      }

      // Update goal differences
      homeUpdates.goalDifference = homeUpdates.goalsFor - homeUpdates.goalsAgainst;
      awayUpdates.goalDifference = awayUpdates.goalsFor - awayUpdates.goalsAgainst;

      // Save updates
      await Promise.all([
        prisma.clubSeasonStats.update({
          where: { id: homeStats.id },
          data: homeUpdates
        }),
        prisma.clubSeasonStats.update({
          where: { id: awayStats.id },
          data: awayUpdates
        })
      ]);

    } catch (error) {
      console.error('Error updating league table:', error);
    }
  }
}

module.exports = MatchSimulationService; 