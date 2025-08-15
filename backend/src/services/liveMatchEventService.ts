import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class LiveMatchEventService {
  // Create a new match event
  static async createEvent(data: {
    fixtureId: number;
    type: string;
    minute: number;
    playerId?: number;
    clubId?: number;
    description?: string;
    varReview?: any;
    coordinates?: any;
  }) {
    return await prisma.liveMatchEvent.create({
      data: {
        ...data,
        description: data.description || '',
        coordinates: data.coordinates ? JSON.stringify(data.coordinates) : undefined,
        varReview: data.varReview ? JSON.stringify(data.varReview) : undefined
      },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Get all events for a fixture
  static async getEventsByFixture(fixtureId: number) {
    return await prisma.liveMatchEvent.findMany({
      where: { fixtureId },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Get events by type for a fixture
  static async getEventsByType(fixtureId: number, type: string) {
    return await prisma.liveMatchEvent.findMany({
      where: { fixtureId, type },
      orderBy: { minute: 'asc' },
      include: {
        player: { select: { id: true, name: true, position: true } },
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
    duration?: number;
    refereeConsultation?: boolean;
  }) {
    const originalEvent = await prisma.liveMatchEvent.findUnique({
      where: { id: data.originalEventId }
    });

    if (!originalEvent) {
      throw new Error('Original event not found');
    }

    return await prisma.liveMatchEvent.create({
      data: {
        fixtureId: data.fixtureId,
        type: 'VAR_REVIEW',
        minute: originalEvent.minute,
        description: `VAR Review: ${data.decision} - ${data.reason}`,
        varReview: JSON.stringify({
          originalEventId: data.originalEventId,
          decision: data.decision,
          reason: data.reason,
          duration: data.duration,
          refereeConsultation: data.refereeConsultation
        })
      },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Create a weather event
  static async createWeatherEvent(data: {
    fixtureId: number;
    condition: string;
    intensity: string;
    minute: number;
    description?: string;
  }) {
    return await prisma.liveMatchEvent.create({
      data: {
        fixtureId: data.fixtureId,
        type: 'WEATHER',
        minute: data.minute,
        description: data.description || ''
      }
    });
  }

  // Create a referee decision
  static async createRefereeDecision(data: {
    fixtureId: number;
    decision: string;
    reason: string;
    minute: number;
    playerId?: number;
    clubId?: number;
    description?: string;
  }) {
    return await prisma.liveMatchEvent.create({
      data: {
        fixtureId: data.fixtureId,
        type: 'REFEREE_DECISION',
        minute: data.minute,
        playerId: data.playerId,
        clubId: data.clubId,
        description: data.description || ''
      },
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Get match statistics
  static async getMatchStatistics(fixtureId: number) {
    const events = await this.getEventsByFixture(fixtureId);
    
    const stats = {
      goals: events.filter((e: any) => e.type === 'GOAL').length,
      yellowCards: events.filter((e: any) => e.type === 'YELLOW_CARD').length,
      redCards: events.filter((e: any) => e.type === 'RED_CARD').length,
      varReviews: events.filter((e: any) => e.type === 'VAR_REVIEW').length,
      injuries: events.filter((e: any) => e.type === 'INJURY').length,
      substitutions: events.filter((e: any) => e.type === 'SUBSTITUTION').length,
      weatherEvents: events.filter((e: any) => e.type === 'WEATHER').length,
      refereeDecisions: events.filter((e: any) => e.type === 'REFEREE_DECISION').length
    };

    return { statistics: stats, events };
  }

  // Generate realistic match events for a fixture
  static async generateMatchEvents(fixtureId: number, homeClubId: number, awayClubId: number) {
    const events: any[] = [];
    
    // Get fixture details
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: { include: { players: true } },
        awayClub: { include: { players: true } }
      }
    });

    if (!fixture) {
      throw new Error('Fixture not found');
    }

    // Generate goals
    const homeGoals = fixture.homeGoals || 0;
    const awayGoals = fixture.awayGoals || 0;
    
    for (let i = 0; i < homeGoals; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const scorer = fixture.homeClub.players[Math.floor(Math.random() * fixture.homeClub.players.length)];
      
      events.push({
        fixtureId,
        type: 'GOAL',
        minute,
        playerId: scorer.id,
        clubId: homeClubId,
        description: `Goal scored by ${scorer.name}`
      });
    }

    for (let i = 0; i < awayGoals; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const scorer = fixture.awayClub.players[Math.floor(Math.random() * fixture.awayClub.players.length)];
      
      events.push({
        fixtureId,
        type: 'GOAL',
        minute,
        playerId: scorer.id,
        clubId: awayClubId,
        description: `Goal scored by ${scorer.name}`
      });
    }

    // Generate cards
    const totalCards = Math.floor(Math.random() * 6) + 2; // 2-7 cards
    for (let i = 0; i < totalCards; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const isYellow = Math.random() > 0.2; // 80% yellow, 20% red
      const club = Math.random() > 0.5 ? fixture.homeClub : fixture.awayClub;
      const player = club.players[Math.floor(Math.random() * club.players.length)];
      
      events.push({
        fixtureId,
        type: isYellow ? 'YELLOW_CARD' : 'RED_CARD',
        minute,
        playerId: player.id,
        clubId: club.id,
        description: `${isYellow ? 'Yellow' : 'Red'} card for ${player.name}`
      });
    }

    // Generate substitutions
    const substitutions = Math.floor(Math.random() * 6) + 3; // 3-8 substitutions
    for (let i = 0; i < substitutions; i++) {
      const minute = Math.floor(Math.random() * 90) + 1;
      const club = Math.random() > 0.5 ? fixture.homeClub : fixture.awayClub;
      const player = club.players[Math.floor(Math.random() * club.players.length)];
      
      events.push({
        fixtureId,
        type: 'SUBSTITUTION',
        minute,
        playerId: player.id,
        clubId: club.id,
        description: `Substitution: ${player.name}`
      });
    }

    // Generate weather events (rare)
    if (Math.random() > 0.8) {
      const weatherConditions = ['RAIN', 'SNOW', 'STRONG_WIND', 'HEAT'];
      const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      events.push({
        fixtureId,
        type: 'WEATHER',
        minute: Math.floor(Math.random() * 90) + 1,
        description: `Weather condition: ${condition}`
      });
    }

    // Save all events
    for (const event of events) {
      await this.createEvent(event);
    }

    return events;
  }

  // Update an existing event
  static async updateEvent(eventId: number, data: any) {
    const updateData = { ...data };
    
    if (updateData.coordinates && typeof updateData.coordinates === 'object') {
      updateData.coordinates = JSON.stringify(updateData.coordinates);
    }
    if (updateData.varReview && typeof updateData.varReview === 'object') {
      updateData.varReview = JSON.stringify(updateData.varReview);
    }

    return await prisma.liveMatchEvent.update({
      where: { id: eventId },
      data: updateData,
      include: {
        player: { select: { id: true, name: true, position: true } },
        club: { select: { id: true, name: true } }
      }
    });
  }

  // Delete an event
  static async deleteEvent(eventId: number) {
    return await prisma.liveMatchEvent.delete({
      where: { id: eventId }
    });
  }
}

export default LiveMatchEventService; 