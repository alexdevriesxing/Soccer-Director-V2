import { PrismaClient, Player as PrismaPlayer } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory training focus storage (trainingFocus model not in schema)
interface TrainingFocusData {
  id: number;
  playerId: number;
  clubId: number;
  focus: string;
  isExtra: boolean;
  startDate: Date;
  endDate: Date;
}
const trainingFocusStore: Map<string, TrainingFocusData> = new Map();
let nextFocusId = 1;

class TrainingService {
  /**
   * Sets the training focus for a player.
   */
  static async setTrainingFocus({ playerId, clubId, focus, isExtra, startDate }: { playerId: number; clubId: number; focus: string; isExtra: boolean; startDate: Date }) {
    try {
      const now = new Date();
      const key = `${playerId}-${isExtra ? 'extra' : 'normal'}`;
      const existing = trainingFocusStore.get(key);
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (existing && existing.endDate >= now) {
        if (isExtra) {
          throw new Error('Player already has extra training');
        }
        // Update existing
        existing.focus = focus;
        existing.startDate = startDate;
        existing.endDate = endDate;
        return existing;
      } else {
        const newFocus: TrainingFocusData = {
          id: nextFocusId++,
          playerId,
          clubId,
          focus,
          isExtra,
          startDate,
          endDate
        };
        trainingFocusStore.set(key, newFocus);
        return newFocus;
      }
    } catch (error) {
      console.error('Error in setTrainingFocus:', error);
      throw error;
    }
  }

  /**
   * Conducts a training session for all players in a club.
   */
  static async conductTrainingSession(clubId: number, sessionType: string) {
    try {
      const players = await prisma.player.findMany({
        where: {
          currentClubId: clubId,
          isInjured: false
        }
      });

      if (players.length === 0) {
        throw new Error('No available players for training');
      }

      const club = await prisma.club.findUnique({ where: { id: clubId } });
      const isJongTeam = club?.isJongTeam || false;

      // Get facility level from ClubFacility
      const facility = await prisma.clubFacility.findUnique({ where: { clubId } });
      const facilityLevel = facility?.trainingGround || 1;

      // Staff skill calculation
      const staff = await prisma.staff.findMany({ where: { clubId } });
      const coachSkills = staff.filter(s => s.role.toLowerCase().includes('coach')).map(s => s.ability || 50);
      const physioSkills = staff.filter(s => s.role.toLowerCase().includes('physio')).map(s => s.ability || 50);
      const avgCoachSkill = coachSkills.length ? coachSkills.reduce((a, b) => a + b, 0) / coachSkills.length : 50;
      const avgPhysioSkill = physioSkills.length ? physioSkills.reduce((a, b) => a + b, 0) / physioSkills.length : 50;

      // Budget multiplier from finances
      const finances = await prisma.clubFinances.findUnique({ where: { clubId } });
      const wageBudget = finances?.wageBudget ?? 0;

      let coachMultiplier = 0.8 + (avgCoachSkill / 100) * 0.4;
      let physioReducer = 1.0 - 0.005 * (avgPhysioSkill - 50);
      let budgetMultiplier = 1.0;
      if (wageBudget < 50000) budgetMultiplier = 0.8;
      else if (wageBudget < 100000) budgetMultiplier = 0.9;

      if (isJongTeam) {
        coachMultiplier = 0.7 + (avgCoachSkill / 100) * 0.6;
        physioReducer = 1.0 - 0.01 * (avgPhysioSkill - 50);
        if (wageBudget < 20000) budgetMultiplier = 0.6;
        else if (wageBudget < 50000) budgetMultiplier = 0.8;
        else budgetMultiplier = 1.0;
      }

      const results = [];
      for (const player of players) {
        const result = await this.trainPlayer(player, sessionType, facilityLevel, avgCoachSkill, avgPhysioSkill, budgetMultiplier, coachMultiplier, physioReducer);
        results.push(result);
      }

      return {
        sessionType,
        participants: players.length,
        results
      };
    } catch (error) {
      console.error('Error conducting training session:', error);
      throw error;
    }
  }

  /**
   * Trains a single player for a training session.
   */
  static async trainPlayer(
    player: PrismaPlayer,
    sessionType: string,
    facilityLevel: number = 1,
    avgCoachSkill: number = 50,
    _avgPhysioSkill: number = 50,
    budgetMultiplier: number = 1.0,
    coachMultiplierOverride?: number,
    physioReducerOverride?: number
  ) {
    try {
      const baseSkillGain = this.getBaseSkillGain(sessionType);
      const ageFactor = this.getAgeFactor(player.age ?? 25);
      const moraleFactor = this.getMoraleFactor(player.morale ?? 50);
      const personalityFactor = this.getPersonalityFactor(player.personalityType ?? 'PROFESSIONAL');
      const facilitySkillMultiplier = 1.0 + 0.1 * (facilityLevel - 1);

      let coachMultiplier = 0.8 + (avgCoachSkill / 100) * 0.4;
      if (typeof coachMultiplierOverride === 'number') coachMultiplier = coachMultiplierOverride;

      const totalSkillGain = baseSkillGain * ageFactor * moraleFactor * personalityFactor * facilitySkillMultiplier * coachMultiplier * budgetMultiplier;

      // Injury risk
      let injuryRisk = this.getInjuryRisk(sessionType, player);
      const facilityInjuryReducer = 1.0 - 0.1 * (facilityLevel - 1);
      let physioReducer = typeof physioReducerOverride === 'number' ? physioReducerOverride : 1.0;
      injuryRisk = Math.max(0.001, injuryRisk * facilityInjuryReducer * physioReducer);
      const becameInjured = Math.random() < injuryRisk;

      const moraleChange = this.getMoraleChange(sessionType, totalSkillGain, becameInjured);

      // Update player using correct field names
      const currentAbility = player.currentAbility ?? 50;
      const currentMorale = player.morale ?? 50;

      const updatedPlayer = await prisma.player.update({
        where: { id: player.id },
        data: {
          currentAbility: Math.min(200, Math.max(1, Math.round(currentAbility + totalSkillGain))),
          morale: Math.min(100, Math.max(0, Math.round(currentMorale + moraleChange))),
          isInjured: becameInjured || player.isInjured
        }
      });

      return {
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        skillGain: totalSkillGain,
        moraleChange,
        isInjured: becameInjured,
        newSkill: updatedPlayer.currentAbility,
        newMorale: updatedPlayer.morale
      };
    } catch (error) {
      console.error('Error training player:', error);
      throw error;
    }
  }

  static getBaseSkillGain(sessionType: string): number {
    const gains: { [key: string]: number } = {
      'technical': 1.5,
      'tactical': 1.2,
      'physical': 1.8,
      'mental': 1.0,
      'general': 1.0
    };
    return gains[sessionType] || 1.0;
  }

  static getAgeFactor(age: number): number {
    if (age <= 18) return 1.3;
    if (age <= 23) return 1.1;
    if (age <= 28) return 1.0;
    if (age <= 32) return 0.9;
    return 0.7;
  }

  static getMoraleFactor(morale: number): number {
    return 0.5 + (morale / 100) * 0.5;
  }

  static getPersonalityFactor(personality: string | null): number {
    switch (personality) {
      case 'LAZY': return 0.5;
      case 'BELOW_AVERAGE': return 0.8;
      case 'PROFESSIONAL': return 1.0;
      case 'DRIVEN': return 1.2;
      case 'NATURAL': return 1.4;
      default: return 1.0;
    }
  }

  static getInjuryRisk(sessionType: string, player: PrismaPlayer): number {
    const baseRisk: { [key: string]: number } = {
      'technical': 0.01,
      'tactical': 0.005,
      'physical': 0.03,
      'mental': 0.001,
      'general': 0.015
    };
    const playerAge = player.age ?? 25;
    const ageRisk = Math.max(0, (playerAge - 25) / 10) * 0.01;
    return (baseRisk[sessionType] || 0.01) + ageRisk;
  }

  static getMoraleChange(sessionType: string, skillGain: number, isInjured: boolean): number {
    let moraleChange = 0;
    if (skillGain > 0) moraleChange += skillGain * 2;
    if (isInjured) moraleChange -= 15;

    const sessionMorale: { [key: string]: number } = {
      'technical': 1,
      'tactical': 0,
      'physical': -1,
      'mental': 2,
      'general': 0
    };
    moraleChange += sessionMorale[sessionType] || 0;
    return Math.round(moraleChange);
  }

  static async getTrainingResults(_clubId: number | undefined) {
    return {
      recentSessions: [],
      playerProgress: [],
      recommendations: []
    };
  }

  static generateTrainingRecommendations(_players: unknown[]) {
    return [];
  }

  static async getPlayerTrainingHistory(_playerId: number) {
    return [];
  }
}

export default TrainingService;