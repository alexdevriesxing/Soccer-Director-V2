// This file has been migrated to TypeScript. Please rename to o21ManagerService.ts and ensure all type annotations are valid.
import { PrismaClient, Club as PrismaClub, Player as PrismaPlayer, Fixture as PrismaFixture } from '@prisma/client';

const prisma = new PrismaClient();

class O21ManagerService {
  /**
   * Get O21 team details for a parent club
   */
  static async getO21Team(parentClubId: number): Promise<PrismaClub | null> {
    try {
      const o21Team = await prisma.club.findFirst({
        where: {
          parentClubId: parentClubId,
          isJongTeam: true
        },
        include: {
          players: {
            orderBy: { name: 'asc' }
          },
          parentClub: true
        }
      });

      return o21Team;
    } catch (error) {
      console.error('Error getting O21 team:', error);
      throw error;
    }
  }

  /**
   * Promote a player from O21 team to parent club
   */
  static async promotePlayerToParent(playerId: number, parentClubId: number): Promise<{ success: boolean; message: string }> {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { club: true }
      });

      if (!player) {
        throw new Error('Player not found');
      }

      if (!player.club || player.club.parentClubId !== parentClubId) {
        throw new Error('Player does not belong to the O21 team of this parent club');
      }

      if (player.age > 21) {
        throw new Error('Player is too old to be promoted (must be 21 or younger)');
      }

      // Update player to parent club
      await prisma.player.update({
        where: { id: playerId },
        data: { clubId: parentClubId }
      });

      // Auto-recruit replacement player if O21 team has less than 30 players
      if (player.club) {
        await this.autoRecruitReplacement(player.club.id, player.position);
      }

      return { success: true, message: 'Player promoted successfully' };
    } catch (error) {
      console.error('Error promoting player:', error);
      throw error;
    }
  }

  /**
   * Demote a player from parent club to O21 team
   */
  static async demotePlayerToO21(playerId: number, parentClubId: number): Promise<{ success: boolean; message: string }> {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { club: true }
      });

      if (!player) {
        throw new Error('Player not found');
      }

      if (player.clubId !== parentClubId) {
        throw new Error('Player does not belong to the parent club');
      }

      if (player.age > 21) {
        throw new Error('Player is too old to be demoted to O21 team (must be 21 or younger)');
      }

      const o21Team = await prisma.club.findFirst({
        where: {
          parentClubId: parentClubId,
          isJongTeam: true
        }
      });

      if (!o21Team) {
        throw new Error('O21 team not found for this parent club');
      }

      // Check if O21 team has space (max 30 players)
      const o21PlayerCount = await prisma.player.count({
        where: { clubId: o21Team.id }
      });

      if (o21PlayerCount >= 30) {
        throw new Error('O21 team is at maximum capacity (30 players)');
      }

      // Update player to O21 team
      await prisma.player.update({
        where: { id: playerId },
        data: { clubId: o21Team.id }
      });

      return { success: true, message: 'Player demoted to O21 team successfully' };
    } catch (error) {
      console.error('Error demoting player:', error);
      throw error;
    }
  }

  /**
   * Auto-recruit a replacement player for the O21 team
   */
  static async autoRecruitReplacement(o21ClubId: number, position: string): Promise<PrismaPlayer | null> {
    try {
      const o21Team = await prisma.club.findUnique({
        where: { id: o21ClubId },
        include: { parentClub: true }
      });

      if (!o21Team) {
        throw new Error('O21 team not found');
      }

      // Check current player count
      const playerCount = await prisma.player.count({
        where: { clubId: o21ClubId }
      });

      if (playerCount >= 30) {
        return null; // Team is at maximum capacity
      }

      // Generate a 16-year-old player for the position
      const newPlayer = await this.generateO21Player(o21ClubId, position, 16);

      console.log(`Auto-recruited ${newPlayer.name} (${position}, age 16) for ${o21Team.name}`);

      return newPlayer;
    } catch (error) {
      console.error('Error auto-recruiting replacement:', error);
      throw error;
    }
  }

  /**
   * Generate a new O21 player
   */
  static async generateO21Player(o21ClubId: number, position: string, age: number): Promise<PrismaPlayer> {
    const firstNames = ['Jan', 'Piet', 'Klaas', 'Henk', 'Willem', 'Johan', 'Marco', 'Ruud', 'Dennis', 'Patrick', 'Frank', 'Ronald', 'Edwin', 'Jaap', 'Clarence', 'Lars', 'Tim', 'Kevin', 'Mike', 'Tom'];
    const lastNames = ['van der Berg', 'Bakker', 'Visser', 'Smit', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk', 'Jansen', 'van der Berg', 'de Vries', 'van der Meer', 'Bakker', 'Smit', 'Jansen', 'Visser'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;

    // Generate skill based on age and position
    const baseSkill = 45 + (age - 16) * 2; // 16yo = 45, 17yo = 47, etc.
    const skill = Math.min(75, baseSkill + Math.floor(Math.random() * 100));

    // Generate wage (lower for O21 players)
    const wage = 500 + Math.floor(Math.random() * 1000);

    // Contract expires in 2 years
    const contractExpiry = new Date();
    contractExpiry.setFullYear(contractExpiry.getFullYear() + 2);

    const player = await prisma.player.create({
      data: {
        name: name,
        clubId: o21ClubId,
        position: position,
        skill: skill,
        age: age,
        nationality: 'Netherlands',
        morale: 70 + Math.floor(Math.random() * 20),
        injured: false,
        internationalCaps: 0,
        onInternationalDuty: false,
        wage: wage,
        contractExpiry: contractExpiry,
        potential: 75,
        currentPotential: 65,
        contractStart: new Date()
      }
    });

    return player;
  }

  /**
   * Process end-of-season O21 transfers (players turning 22):
   * - Finds all O21 players who will turn 22, promotes them to their parent club, and updates their age.
   * - Logs each promotion and returns the count of promoted players.
   *
   * @returns {Promise<{ success: boolean; promotedCount: number }>} Result object with success and promotedCount
   */
  static async processEndOfSeasonTransfers(): Promise<{ success: boolean; promotedCount: number }> {
    try {
      console.log('Processing end-of-season O21 transfers...');

      // Find all O21 players who will turn 22
      const o21Players = await prisma.player.findMany({
        where: {
          club: {
            isJongTeam: true
          },
          age: 21
        },
        include: {
          club: {
            include: {
              parentClub: true
            }
          }
        }
      });

      console.log(`Found ${o21Players.length} O21 players turning 22`);

      for (const player of o21Players) {
        // Promote to parent club
        await prisma.player.update({
          where: { id: player.id },
          data: { 
            clubId: player.club?.parentClubId ?? undefined,
            age: 22
          }
        });

        console.log(`Promoted ${player.name} to ${player.club?.parentClub?.name ?? 'Unknown Parent Club'}`);
      }

      return { success: true, promotedCount: o21Players.length };
    } catch (error) {
      console.error('Error processing end-of-season transfers:', error);
      throw error;
    }
  }

  /**
   * Offer contract to a promoted O21 player:
   * - Checks eligibility (must be 22 and belong to parent club), then updates wage and contract expiry.
   *
   * @param {number} playerId - The player's ID
   * @param {number} parentClubId - The parent club's ID
   * @param {object} contractDetails - Contract details (wage, contractExpiry)
   * @returns {Promise<{ success: boolean; message: string }>} Result object
   */
  static async offerContract(playerId: number, parentClubId: number, contractDetails: { wage?: number; contractExpiry?: Date }): Promise<{ success: boolean; message: string }> {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { club: true }
      });

      if (!player) {
        throw new Error('Player not found');
      }

      if (player.clubId !== parentClubId) {
        throw new Error('Player does not belong to this club');
      }

      if (player.age !== 22) {
        throw new Error('Player is not eligible for contract offer (must be 22)');
      }

      // Update player contract
      await prisma.player.update({
        where: { id: playerId },
        data: {
          wage: contractDetails.wage || player.wage,
          contractExpiry: contractDetails.contractExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
        }
      });

      return { success: true, message: 'Contract offered successfully' };
    } catch (error) {
      console.error('Error offering contract:', error);
      throw error;
    }
  }

  /**
   * Release player to free agency (not offered contract)
   */
  static async releaseToFreeAgency(playerId: number, parentClubId: number): Promise<{ success: boolean; message: string }> {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { club: true }
      });

      if (!player) {
        throw new Error('Player not found');
      }

      if (player.clubId !== parentClubId) {
        throw new Error('Player does not belong to this club');
      }

      if (player.age !== 22) {
        throw new Error('Player is not eligible for release (must be 22)');
      }

      // Find a lower tier club in the same region
      const lowerTierClub = player.club?.regionTag ? await this.findLowerTierClub(player.club.regionTag) : null;

      if (lowerTierClub) {
        // Transfer to lower tier club
        await prisma.player.update({
          where: { id: playerId },
          data: { 
            clubId: lowerTierClub.id,
            wage: Math.floor(player.wage * 0.5) // 50% wage reduction
          }
        });

        console.log(`Released ${player.name} to ${lowerTierClub.name}`);
      } else {
        // Delete player if no suitable club found
        await prisma.player.delete({
          where: { id: playerId }
        });

        console.log(`Released ${player.name} to free agency (no suitable club found)`);
      }

      return { success: true, message: 'Player released to free agency' };
    } catch (error) {
      console.error('Error releasing player:', error);
      throw error;
    }
  }

  /**
   * Find a lower tier club in the same region
   */
  static async findLowerTierClub(regionTag: string): Promise<PrismaClub | null> {
    try {
      // Find clubs in the same region but in lower tiers
      const lowerTierClub = await prisma.club.findFirst({
        where: {
          regionTag: regionTag,
          league: {
            tier: {
              not: 'EREDIVISIE'
            }
          }
        },
        include: {
          league: true
        },
        orderBy: {
          league: {
            tier: 'desc'
          }
        }
      });

      return lowerTierClub;
    } catch (error) {
      console.error('Error finding lower tier club:', error);
      return null;
    }
  }

  /**
   * Get O21 team results/fixtures
   */
  static async getO21Results(o21ClubId: number): Promise<PrismaFixture[]> {
    try {
      const fixtures = await prisma.fixture.findMany({
        where: {
          OR: [
            { homeClubId: o21ClubId },
            { awayClubId: o21ClubId }
          ]
        },
        include: {
          homeClub: true,
          awayClub: true
        },
        orderBy: {
          week: 'asc'
        }
      });

      return fixtures;
    } catch (error) {
      console.error('Error getting O21 results:', error);
      throw error;
    }
  }
}

export default O21ManagerService; 