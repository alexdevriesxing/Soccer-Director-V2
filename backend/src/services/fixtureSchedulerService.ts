// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FixtureSchedule {
  homeClubId: number;
  awayClubId: number;
  week: number;
  date: Date;
  type: 'league' | 'cup' | 'friendly' | 'pre-season' | 'mid-season';
  competitionId?: number;
  competitionType?: 'league' | 'cup';
}

export class FixtureSchedulerService {
  
  // Generate complete season schedule for all leagues
  static async generateSeasonSchedule() {
    console.log('Generating complete season schedule...');
    
    // Get all leagues
    const leagues = await prisma.league.findMany({
      include: {
        clubs: true
      }
    });

    for (const league of leagues) {
      if (league.clubs.length >= 2) {
        await this.generateLeagueFixtures(league);
      }
    }

    // Generate cup competitions
    await this.generateCupFixtures();
    
    // Generate pre-season friendlies
    await this.generatePreSeasonFriendlies();
    
    // Generate mid-season friendlies
    await this.generateMidSeasonFriendlies();
    
    console.log('Season schedule generation complete!');
  }

  // Generate league fixtures for a specific league
  static async generateLeagueFixtures(league: any) {
    const clubs = league.clubs;
    if (clubs.length < 2) return;

    console.log(`Generating fixtures for ${league.name} (${clubs.length} clubs)`);

    // Calculate weeks needed for home and away matches
    const totalMatches = clubs.length * (clubs.length - 1);
    const weeksNeeded = totalMatches / (clubs.length / 2);
    
    // Start week for league matches (after pre-season)
    const startWeek = 4; // Week 4 starts league season
    const endWeek = startWeek + Math.ceil(weeksNeeded) - 1;

    const fixtures: any[] = [];
    let weekCounter = startWeek;

    // Generate home and away fixtures
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < clubs.length; i++) {
        for (let j = i + 1; j < clubs.length; j++) {
          const homeClub = round === 0 ? clubs[i] : clubs[j];
          const awayClub = round === 0 ? clubs[j] : clubs[i];
          
          // Calculate match date (Saturdays for most leagues, Sundays for Zondag leagues)
          const isZondagLeague = league.name.includes('Zondag');
          const matchDate = this.calculateMatchDate(weekCounter, isZondagLeague);

          fixtures.push({
            homeClubId: homeClub.id,
            awayClubId: awayClub.id,
            leagueId: league.id,
            week: weekCounter,
            date: matchDate,
            played: false,
            type: 'league'
          });

          weekCounter++;
          if (weekCounter > endWeek) {
            weekCounter = startWeek;
          }
        }
      }
    }

    // Create fixtures in database
    await prisma.fixture.createMany({
      data: fixtures
    });

    console.log(`Created ${fixtures.length} fixtures for ${league.name}`);
  }

  // Generate cup fixtures
  static async generateCupFixtures() {
    console.log('Generating cup fixtures...');

    // Create main cup competitions
    const cups = [
      { name: 'KNVB Cup', type: 'national' },
      { name: 'Regional Cup', type: 'regional' }
    ];

    for (const cupData of cups) {
      const cup = await prisma.cup.create({
        data: {
          name: cupData.name
        }
      });

      // Get clubs for cup (all clubs from all leagues)
      const clubs = await prisma.club.findMany();
      
      // Generate cup fixtures (single elimination)
      const fixtures = this.generateCupFixturesForClubs(clubs, cup.id);
      
      await prisma.fixture.createMany({
        data: fixtures
      });

      console.log(`Created ${fixtures.length} fixtures for ${cupData.name}`);
    }
  }

  // Generate cup fixtures for a list of clubs
  static generateCupFixturesForClubs(clubs: any[], cupId: number) {
    const fixtures: any[] = [];
    const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
    
    // Start cup in week 6 (after league has started)
    let weekCounter = 6;
    const tiesPerWeek = 16; // spread large first rounds across multiple weeks
    let tiesThisWeek = 0;
    
    // Generate first round
    for (let i = 0; i < shuffledClubs.length; i += 2) {
      if (i + 1 < shuffledClubs.length) {
        const homeClub = shuffledClubs[i];
        const awayClub = shuffledClubs[i + 1];
        
        fixtures.push({
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          cupId: cupId,
          week: weekCounter,
          date: this.calculateMatchDate(weekCounter, false), // Cups typically on weekends
          played: false,
          type: 'cup'
        });

        tiesThisWeek++;
        if (tiesThisWeek >= tiesPerWeek) {
          weekCounter++;
          tiesThisWeek = 0;
        }
      }
    }

    return fixtures;
  }

  // Generate pre-season friendlies
  static async generatePreSeasonFriendlies() {
    console.log('Generating pre-season friendlies...');

    const clubs = await prisma.club.findMany();
    const fixtures: any[] = [];

    // Pre-season weeks 1-3
    for (let week = 1; week <= 3; week++) {
      const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < shuffledClubs.length; i += 2) {
        if (i + 1 < shuffledClubs.length) {
          const homeClub = shuffledClubs[i];
          const awayClub = shuffledClubs[i + 1];
          
          fixtures.push({
            homeClubId: homeClub.id,
            awayClubId: awayClub.id,
            week: week,
            date: this.calculateMatchDate(week, false),
            played: false,
            type: 'friendly'
          });
        }
      }
    }

    await prisma.fixture.createMany({
      data: fixtures
    });

    console.log(`Created ${fixtures.length} pre-season friendlies`);
  }

  // Generate mid-season friendlies (December/January break)
  static async generateMidSeasonFriendlies() {
    console.log('Generating mid-season friendlies...');

    const clubs = await prisma.club.findMany();
    const fixtures: any[] = [];

    // Mid-season break weeks (around Christmas/New Year)
    const midSeasonWeeks = [18, 19, 20]; // December/January weeks
    
    for (const week of midSeasonWeeks) {
      const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < shuffledClubs.length; i += 2) {
        if (i + 1 < shuffledClubs.length) {
          const homeClub = shuffledClubs[i];
          const awayClub = shuffledClubs[i + 1];
          
          fixtures.push({
            homeClubId: homeClub.id,
            awayClubId: awayClub.id,
            week: week,
            date: this.calculateMatchDate(week, false),
            played: false,
            type: 'friendly'
          });
        }
      }
    }

    await prisma.fixture.createMany({
      data: fixtures
    });

    console.log(`Created ${fixtures.length} mid-season friendlies`);
  }

  // Schedule a custom friendly match
  static async scheduleFriendly(homeClubId: number, awayClubId: number, week: number, date: Date) {
    const fixture = await prisma.fixture.create({
      data: {
        homeClubId,
        awayClubId,
        week,
        date,
        played: false,
        type: 'friendly'
      }
    });

    console.log(`Scheduled friendly: ${fixture.id}`);
    return fixture;
  }

  // Cancel a friendly match
  static async cancelFriendly(fixtureId: number) {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId }
    });

    if (!fixture) {
      throw new Error('Fixture not found');
    }

    if (fixture.type !== 'friendly') {
      throw new Error('Can only cancel friendly matches');
    }

    if (fixture.played) {
      throw new Error('Cannot cancel played matches');
    }

    await prisma.fixture.delete({
      where: { id: fixtureId }
    });

    console.log(`Cancelled friendly: ${fixtureId}`);
    return true;
  }

  // Get available weeks for scheduling friendlies
  static async getAvailableWeeksForFriendlies() {
    const currentWeek = 1; // You might want to get this from game state
    const maxWeek = 38; // Full season
    
    // Get weeks that have no fixtures for the requesting club
    const occupiedWeeks = await prisma.fixture.findMany({
      where: {
        OR: [
          { homeClubId: 1 }, // Replace with actual club ID
          { awayClubId: 1 }
        ]
      },
      select: { week: true }
    });

    const occupiedWeekNumbers = occupiedWeeks.map(f => f.week);
    const availableWeeks = [];

    for (let week = currentWeek; week <= maxWeek; week++) {
      if (!occupiedWeekNumbers.includes(week)) {
        availableWeeks.push(week);
      }
    }

    return availableWeeks;
  }

  // Get potential opponents for friendlies
  static async getPotentialOpponents(clubId: number) {
    const allClubs = await prisma.club.findMany({
      where: { id: { not: clubId } }
    });

    return allClubs;
  }

  // Calculate match date based on week and day preference
  static calculateMatchDate(week: number, isZondagLeague: boolean = false, seasonStart?: Date): Date {
    const startDate = seasonStart
      ?? (process.env.SEASON_START_DATE ? new Date(process.env.SEASON_START_DATE) : new Date('2025-08-01')); // Season start date
    const daysToAdd = (week - 1) * 7;
    
    const baseDate = new Date(startDate);
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    
    // Set to Saturday (6) or Sunday (0) based on league type
    const targetDay = isZondagLeague ? 0 : 6; // Sunday for Zondag, Saturday for others
    const currentDay = baseDate.getDay();
    const daysToTarget = (targetDay - currentDay + 7) % 7;
    
    baseDate.setDate(baseDate.getDate() + daysToTarget);
    baseDate.setHours(15, 0, 0, 0); // 3 PM kickoff
    
    return baseDate;
  }

  // Get fixtures for a specific club
  static async getClubFixtures(clubId: number) {
    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [
          { homeClubId: clubId },
          { awayClubId: clubId }
        ]
      },
      include: {
        homeClub: true,
        awayClub: true,
        league: true,
        cup: true
      },
      orderBy: {
        week: 'asc'
      }
    });

    return fixtures;
  }

  // Get next fixture for a club
  static async getNextFixture(clubId: number) {
    const nextFixture = await prisma.fixture.findFirst({
      where: {
        OR: [
          { homeClubId: clubId },
          { awayClubId: clubId }
        ],
        played: false
      },
      include: {
        homeClub: true,
        awayClub: true,
        league: true,
        cup: true
      },
      orderBy: {
        week: 'asc'
      }
    });

    return nextFixture;
  }
} 