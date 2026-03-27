import { PrismaClient } from '@prisma/client';
import { generateYouthIntake } from './youthIntakeService';

const prisma = new PrismaClient();

/**
 * Youth Academy Service - Stub
 */
export class YouthAcademyService {
  async getAcademyInfo(clubId: number) {
    const facility = await prisma.clubFacility.findUnique({
      where: { clubId }
    });

    return {
      clubId,
      level: facility?.youthAcademy ?? 1,
      youthFacilitiesLevel: facility?.youthFacilities ?? 1
    };
  }

  async getYouthProspects(clubId: number) {
    return prisma.player.findMany({
      where: {
        currentClubId: clubId,
        age: { lte: 18 }
      },
      orderBy: { potentialAbility: 'desc' }
    });
  }

  async generateYouthIntake(clubId: number) {
    // Delegate to the specialized service
    return generateYouthIntake(clubId);
  }
}

export default new YouthAcademyService();