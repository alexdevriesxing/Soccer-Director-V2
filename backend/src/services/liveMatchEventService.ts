import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LiveMatchEventService {
  // Create a new match event
  static async createEvent(data: {
    fixtureId: number;
    eventType: string;
    minute: number;
    playerId?: number;
    clubId?: number;
    description?: string;
    isHomeTeam?: boolean;
  }) {
    return await prisma.matchEvent.create({
      data: {
        fixtureId: data.fixtureId,
        eventType: data.eventType,
        minute: data.minute,
        playerId: data.playerId,
        clubId: data.clubId || 0,
        description: data.description || '',
        isHomeTeam: data.isHomeTeam ?? true
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Get all events for a fixture
  static async getEventsByFixture(fixtureId: number) {
    return await prisma.matchEvent.findMany({
      where: { fixtureId },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Get events by type for a fixture
  static async getEventsByType(fixtureId: number, eventType: string) {
    return await prisma.matchEvent.findMany({
      where: { fixtureId, eventType },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Create a VAR review
  static async createVARReview(data: {
    fixtureId: number;
    originalEventId: number;
    decision: string;
    reason: string;
  }) {
    const originalEvent = await prisma.matchEvent.findUnique({
      where: { id: data.originalEventId }
    });

    if (!originalEvent) {
      throw new Error('Original event not found');
    }

    return await prisma.matchEvent.create({
      data: {
        fixtureId: data.fixtureId,
        eventType: 'VAR_REVIEW',
        minute: originalEvent.minute,
        description: `VAR Review: ${data.decision} - ${data.reason}`,
        clubId: originalEvent.clubId,
        isHomeTeam: originalEvent.isHomeTeam
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Create a weather event
  static async createWeatherEvent(data: {
    fixtureId: number;
    condition: string;
    minute: number;
    description?: string;
  }) {
    return await prisma.matchEvent.create({
      data: {
        fixtureId: data.fixtureId,
        eventType: 'WEATHER',
        minute: data.minute,
        description: data.description || `Weather: ${data.condition}`,
        clubId: 0,
        isHomeTeam: true
      }
    });
  }

  // Get match statistics
  static async getMatchStatistics(fixtureId: number) {
    const events = await this.getEventsByFixture(fixtureId);

    const stats = {
      goals: events.filter((e: any) => e.eventType === 'GOAL' || e.eventType === 'goal').length,
      yellowCards: events.filter((e: any) => e.eventType === 'YELLOW_CARD' || e.eventType === 'yellow_card').length,
      redCards: events.filter((e: any) => e.eventType === 'RED_CARD' || e.eventType === 'red_card').length,
      injuries: events.filter((e: any) => e.eventType === 'INJURY' || e.eventType === 'injury').length,
      substitutions: events.filter((e: any) => e.eventType === 'SUBSTITUTION' || e.eventType === 'substitution').length
    };

    return { statistics: stats, events };
  }

  // Generate realistic match events for a fixture
  static async generateMatchEvents(fixtureId: number, homeTeamId: number, awayTeamId: number) {
    const events: any[] = [];

    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } }
      }
    });

    if (!fixture) {
      throw new Error('Fixture not found');
    }

    // Generate goals
    const homeScore = fixture.homeScore || 0;
    const awayScore = fixture.awayScore || 0;

    for (let i = 0; i < homeScore; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const players = fixture.homeTeam.players;
      if (players.length > 0) {
        const scorer = players[Math.floor(Math.random() * players.length)];
        events.push({
          fixtureId,
          eventType: 'goal',
          minute,
          playerId: scorer.id,
          clubId: homeTeamId,
          description: `Goal scored by ${scorer.firstName} ${scorer.lastName}`,
          isHomeTeam: true
        });
      }
    }

    for (let i = 0; i < awayScore; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const players = fixture.awayTeam.players;
      if (players.length > 0) {
        const scorer = players[Math.floor(Math.random() * players.length)];
        events.push({
          fixtureId,
          eventType: 'goal',
          minute,
          playerId: scorer.id,
          clubId: awayTeamId,
          description: `Goal scored by ${scorer.firstName} ${scorer.lastName}`,
          isHomeTeam: false
        });
      }
    }

    // Generate cards
    const totalCards = Math.floor(Math.random() * 6) + 2;
    for (let i = 0; i < totalCards; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const isYellow = Math.random() > 0.2;
      const isHome = Math.random() > 0.5;
      const club = isHome ? fixture.homeTeam : fixture.awayTeam;
      const players = club.players;
      if (players.length > 0) {
        const player = players[Math.floor(Math.random() * players.length)];
        events.push({
          fixtureId,
          eventType: isYellow ? 'yellow_card' : 'red_card',
          minute,
          playerId: player.id,
          clubId: club.id,
          description: `${isYellow ? 'Yellow' : 'Red'} card for ${player.firstName} ${player.lastName}`,
          isHomeTeam: isHome
        });
      }
    }

    // Save all events
    for (const event of events) {
      await this.createEvent(event);
    }

    return events;
  }

  // Update an existing event
  static async updateEvent(eventId: number, data: any) {
    return await prisma.matchEvent.update({
      where: { id: eventId },
      data,
      include: {
        player: { select: { id: true, firstName: true, lastName: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Delete an event
  static async deleteEvent(eventId: number) {
    return await prisma.matchEvent.delete({
      where: { id: eventId }
    });
  }
}

export default LiveMatchEventService;