import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import AdvancedMatchEngine from '../services/advancedMatchEngine';

const router = express.Router();
const prisma = new PrismaClient();

// --- ADVANCED MATCH SIMULATION ---

// POST /api/advanced-match/:fixtureId/simulate
router.post('/:fixtureId/simulate', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    const result = await AdvancedMatchEngine.simulateAdvancedMatch(fixtureId);
    res.json({ message: 'Match simulated successfully', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_simulate_match', (req as any).language || 'en') });
  }
});

// GET /api/advanced-match/:fixtureId/analysis
router.get('/:fixtureId/analysis', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: { include: { players: true } },
        awayClub: { include: { players: true } },
        weather: true,
        pitchConditions: true,
        events: true
      }
    });

    if (!fixture) {
      return res.status(404).json({ error: t('error.fixture_not_found', (req as any).language || 'en') });
    }

    // Calculate advanced statistics
    const homeEvents = fixture.events.filter((e: any) => e.clubId === fixture.homeClubId);
    const awayEvents = fixture.events.filter((e: any) => e.clubId === fixture.awayClubId);

    const analysis = {
      possession: {
        home: homeEvents.length / (homeEvents.length + awayEvents.length) * 100,
        away: awayEvents.length / (homeEvents.length + awayEvents.length) * 100
      },
      shots: {
        home: homeEvents.filter((e: any) => e.type === 'SHOT').length,
        away: awayEvents.filter((e: any) => e.type === 'SHOT').length
      },
      shotsOnTarget: {
        home: homeEvents.filter((e: any) => e.type === 'SHOT' && e.xG && e.xG > 0.3).length,
        away: awayEvents.filter((e: any) => e.type === 'SHOT' && e.xG && e.xG > 0.3).length
      },
      xG: {
        home: homeEvents.reduce((sum: number, e: any) => sum + (e.xG || 0), 0),
        away: awayEvents.reduce((sum: number, e: any) => sum + (e.xG || 0), 0)
      },
      weather: fixture.weather,
      pitchConditions: fixture.pitchConditions,
      events: fixture.events.length,
      varReviews: fixture.events.filter((e: any) => e.type === 'VAR_REVIEW').length
    };

    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_match', (req as any).language || 'en') });
  }
});

// GET /api/advanced-match/:fixtureId/player-stats
router.get('/:fixtureId/player-stats', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: { include: { players: true } },
        awayClub: { include: { players: true } },
        events: true
      }
    });

    if (!fixture) {
      return res.status(404).json({ error: t('error.fixture_not_found', (req as any).language || 'en') });
    }

    // Generate player statistics
    const homeStats = await AdvancedMatchEngine.generatePlayerStats(
      fixture.homeClub.players,
      fixture.events.map((e: any) => ({
        minute: e.minute,
        type: e.type.toLowerCase(),
        playerId: e.playerId,
        teamId: e.clubId,
        xG: e.xG,
        description: e.description || ''
      })),
      fixture.homeClubId
    );

    const awayStats = await AdvancedMatchEngine.generatePlayerStats(
      fixture.awayClub.players,
      fixture.events.map((e: any) => ({
        minute: e.minute,
        type: e.type.toLowerCase(),
        playerId: e.playerId,
        teamId: e.clubId,
        xG: e.xG,
        description: e.description || ''
      })),
      fixture.awayClubId
    );

    res.json({ homeStats, awayStats });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_player_stats', (req as any).language || 'en') });
  }
});

// --- TACTICAL ANALYSIS ---

// GET /api/advanced-match/:fixtureId/tactical-analysis
router.get('/:fixtureId/tactical-analysis', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: {
          include: {
            formations: true,
            strategies: true,
            players: true
          }
        },
        awayClub: {
          include: {
            formations: true,
            strategies: true,
            players: true
          }
        }
      }
    });

    if (!fixture) {
      return res.status(404).json({ error: t('error.fixture_not_found', (req as any).language || 'en') });
    }

    const homeFormation = fixture.homeClub.formations?.[0] || null;
    const awayFormation = fixture.awayClub.formations?.[0] || null;
    const homeStrategy = fixture.homeClub.strategies?.[0] || null;
    const awayStrategy = fixture.awayClub.strategies?.[0] || null;

    const tacticalAnalysis = {
      formations: {
        home: homeFormation,
        away: awayFormation
      },
      strategies: {
        home: homeStrategy,
        away: awayStrategy
      },
      tacticalAdvantage: homeFormation && awayFormation && homeStrategy && awayStrategy ? calculateTacticalAdvantage(homeFormation, awayFormation, homeStrategy, awayStrategy) : null,
      keyBattles: fixture.homeClub.players && fixture.awayClub.players ? identifyKeyBattles(fixture.homeClub.players, fixture.awayClub.players) : [],
      tacticalRecommendations: homeFormation && awayFormation ? generateTacticalRecommendations(homeFormation, awayFormation) : []
    };

    res.json({ tacticalAnalysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_tactics', (req as any).language || 'en') });
  }
});

// Helper functions for tactical analysis
const calculateTacticalAdvantage = (homeFormation: any, awayFormation: any, homeStrategy: any, awayStrategy: any): any => {
  let homeAdvantage = 0;
  let awayAdvantage = 0;

  // Formation analysis
  if (homeFormation && awayFormation) {
    const homeWidth = homeFormation.width || 50;
    const awayWidth = awayFormation.width || 50;
    
    if (homeWidth > awayWidth) {
      homeAdvantage += 10; // Home team has width advantage
    } else {
      awayAdvantage += 10;
    }

    const homeTempo = homeFormation.tempo || 50;
    const awayTempo = awayFormation.tempo || 50;
    
    if (homeTempo > awayTempo) {
      homeAdvantage += 5; // Home team has tempo advantage
    } else {
      awayAdvantage += 5;
    }
  }

  // Strategy analysis
  if (homeStrategy && awayStrategy) {
    if (homeStrategy.approach === 'attacking' && awayStrategy.approach === 'defensive') {
      homeAdvantage += 15;
    } else if (homeStrategy.approach === 'defensive' && awayStrategy.approach === 'attacking') {
      awayAdvantage += 15;
    }
  }

  return {
    home: homeAdvantage,
    away: awayAdvantage,
    netAdvantage: homeAdvantage - awayAdvantage
  };
};

const identifyKeyBattles = (homePlayers: any[], awayPlayers: any[]): any[] => {
  const battles = [];

  // Striker vs Defender battles
  const homeStrikers = homePlayers.filter((p: any) => p.position === 'FWD');
  const awayDefenders = awayPlayers.filter((p: any) => p.position === 'DEF');
  
  for (const striker of homeStrikers) {
    const bestDefender = awayDefenders.reduce((best: any, def: any) => 
      def.skill > best.skill ? def : best, awayDefenders[0]);
    
    if (bestDefender) {
      battles.push({
        type: 'striker_vs_defender',
        homePlayer: striker,
        awayPlayer: bestDefender,
        advantage: striker.skill - bestDefender.skill
      });
    }
  }

  // Midfield battles
  const homeMidfielders = homePlayers.filter((p: any) => p.position === 'MID');
  const awayMidfielders = awayPlayers.filter((p: any) => p.position === 'MID');
  
  if (homeMidfielders.length > 0 && awayMidfielders.length > 0) {
    const homeAvgSkill = homeMidfielders.reduce((sum: number, p: any) => sum + p.skill, 0) / homeMidfielders.length;
    const awayAvgSkill = awayMidfielders.reduce((sum: number, p: any) => sum + p.skill, 0) / awayMidfielders.length;
    
    battles.push({
      type: 'midfield_battle',
      homeAvgSkill,
      awayAvgSkill,
      advantage: homeAvgSkill - awayAvgSkill
    });
  }

  return battles;
};

const generateTacticalRecommendations = (homeFormation: any, awayFormation: any): string[] => {
  const recommendations = [];

  if (homeFormation && awayFormation) {
    const homeWidth = homeFormation.width || 50;
    const awayWidth = awayFormation.width || 50;

    if (homeWidth < awayWidth) {
      recommendations.push('Consider increasing width to match opponent');
    } else if (homeWidth > awayWidth + 20) {
      recommendations.push('Opponent may struggle with your width advantage');
    }

    const homeTempo = homeFormation.tempo || 50;
    const awayTempo = awayFormation.tempo || 50;

    if (homeTempo < awayTempo - 20) {
      recommendations.push('Consider increasing tempo to match opponent intensity');
    } else if (homeTempo > awayTempo + 20) {
      recommendations.push('High tempo may tire opponent in later stages');
    }
  }

  return recommendations;
};

// --- WEATHER AND PITCH ANALYSIS ---

// GET /api/advanced-match/:fixtureId/conditions
router.get('/:fixtureId/conditions', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        weather: true,
        pitchConditions: true
      }
    });

    if (!fixture) {
      return res.status(404).json({ error: t('error.fixture_not_found', (req as any).language || 'en') });
    }

    const conditions = {
      weather: fixture.weather,
      pitchConditions: fixture.pitchConditions,
      effects: {
        weather: fixture.weather ? calculateWeatherEffects(fixture.weather) : null,
        pitch: fixture.pitchConditions ? calculatePitchEffects(fixture.pitchConditions) : null
      }
    };

    res.json({ conditions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_conditions', (req as any).language || 'en') });
  }
});

// Helper functions for weather and pitch analysis
const calculateWeatherEffects = (weather: any): any => {
  const effects = {
    passingAccuracy: 0,
    shootingAccuracy: 0,
    playerFatigue: 0,
    visibility: 0
  };

  if (weather.precipitation > 10) {
    effects.passingAccuracy -= 10;
    effects.shootingAccuracy -= 15;
  }

  if (weather.windSpeed > 20) {
    effects.passingAccuracy -= 15;
    effects.shootingAccuracy -= 20;
  }

  if (weather.temperature > 30) {
    effects.playerFatigue += 20;
  }

  return effects;
};

const calculatePitchEffects = (pitch: any): any => {
  const effects = {
    passingAccuracy: 0,
    ballControl: 0,
    injuryRisk: 0
  };

  if (pitch.quality < 80) {
    effects.passingAccuracy -= 10;
    effects.ballControl -= 15;
  }

  if (pitch.hardness > 70) {
    effects.injuryRisk += 15;
  }

  return effects;
};

// --- MATCH PREDICTIONS ---

// POST /api/advanced-match/:fixtureId/predict
router.post('/:fixtureId/predict', async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId, 10);
    
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: {
          include: {
            players: { where: { injured: false } },
            formations: true,
            strategies: true
          }
        },
        awayClub: {
          include: {
            players: { where: { injured: false } },
            formations: true,
            strategies: true
          }
        }
      }
    });

    if (!fixture) {
      return res.status(404).json({ error: t('error.fixture_not_found', (req as any).language || 'en') });
    }

    // Calculate predicted strengths
    const homeStrength = await AdvancedMatchEngine.calculateAdvancedTeamStrength(fixture.homeClub, 'home');
    const awayStrength = await AdvancedMatchEngine.calculateAdvancedTeamStrength(fixture.awayClub, 'away');

    // Generate predictions
    const predictions = {
      predictedScore: homeStrength !== undefined && awayStrength !== undefined ? predictScore(homeStrength, awayStrength) : null,
      winProbability: homeStrength !== undefined && awayStrength !== undefined ? calculateWinProbability(homeStrength, awayStrength) : null,
      keyFactors: fixture.homeClub && fixture.awayClub ? identifyKeyFactors(fixture.homeClub, fixture.awayClub) : [],
      tacticalAdvantage: fixture.homeClub.formations?.[0] && fixture.awayClub.formations?.[0] && fixture.homeClub.strategies?.[0] && fixture.awayClub.strategies?.[0]
        ? calculateTacticalAdvantage(
            fixture.homeClub.formations[0],
            fixture.awayClub.formations[0],
            fixture.homeClub.strategies[0],
            fixture.awayClub.strategies[0]
          )
        : null
    };

    res.json({ predictions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_predict_match', (req as any).language || 'en') });
  }
});

// Helper functions for match predictions
const predictScore = (homeStrength: number, awayStrength: number): any => {
  const strengthDiff = homeStrength - awayStrength;
  const homeGoals = Math.max(0, Math.floor(1.5 + strengthDiff / 20 + (Math.random() - 0.5) * 2));
  const awayGoals = Math.max(0, Math.floor(1.0 - strengthDiff / 25 + (Math.random() - 0.5) * 1.5));
  
  return { home: homeGoals, away: awayGoals };
};

const calculateWinProbability = (homeStrength: number, awayStrength: number): any => {
  const totalStrength = homeStrength + awayStrength;
  const homeProb = homeStrength / totalStrength;
  const awayProb = awayStrength / totalStrength;
  const drawProb = 0.25; // Base draw probability

  return {
    home: homeProb * (1 - drawProb),
    away: awayProb * (1 - drawProb),
    draw: drawProb
  };
};

const identifyKeyFactors = (homeClub: any, awayClub: any): string[] => {
  const factors = [];

  const homeAvgSkill = homeClub.players.reduce((sum: number, p: any) => sum + p.skill, 0) / homeClub.players.length;
  const awayAvgSkill = awayClub.players.reduce((sum: number, p: any) => sum + p.skill, 0) / awayClub.players.length;

  if (homeAvgSkill > awayAvgSkill + 10) {
    factors.push('Home team has significant skill advantage');
  } else if (awayAvgSkill > homeAvgSkill + 10) {
    factors.push('Away team has significant skill advantage');
  }

  const homeMorale = homeClub.players.reduce((sum: number, p: any) => sum + (p.morale || 50), 0) / homeClub.players.length;
  const awayMorale = awayClub.players.reduce((sum: number, p: any) => sum + (p.morale || 50), 0) / awayClub.players.length;

  if (homeMorale > awayMorale + 15) {
    factors.push('Home team has high morale advantage');
  } else if (awayMorale > homeMorale + 15) {
    factors.push('Away team has high morale advantage');
  }

  return factors;
};

export default router; 