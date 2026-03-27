import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type PersonalityType =
    | 'Model Citizen'
    | 'Leader'
    | 'Resilient'
    | 'Perfectionist'
    | 'Professional'
    | 'Ambitious'
    | 'Determined'
    | 'Balanced'
    | 'Slack'
    | 'Volatile';

export class PlayerPersonalityService {

    /**
     * Determine the personality type based on attributes.
     * Priority order matters as first match returns.
     */
    static determinePersonalityType(
        professionalism: number = 10,
        ambition: number = 10,
        loyalty: number = 10,
        determination: number = 10,
        pressure: number = 10,
        temperament: number = 10,
        leadership: number = 10
    ): PersonalityType {

        // Model Citizen: High in everything good
        if (professionalism >= 17 && ambition >= 15 && loyalty >= 15 && determination >= 15 && temperament >= 15 && pressure >= 15) {
            return 'Model Citizen';
        }

        // Leader: High leadership and decent professionalism
        if (leadership >= 17 && professionalism >= 13 && determination >= 13) {
            return 'Leader';
        }

        // Perfectionist: High ambition, determination, professionalism
        if (professionalism >= 16 && ambition >= 16 && determination >= 16) {
            return 'Perfectionist';
        }

        // Resilient: High pressure and determination
        if (pressure >= 16 && determination >= 15) {
            return 'Resilient';
        }

        // Professional: High professionalism
        if (professionalism >= 17 && temperament >= 10) {
            return 'Professional';
        }

        // Determined: High determination
        if (determination >= 17 && ambition >= 10) {
            return 'Determined';
        }

        // Ambitious: High ambition, lower loyalty could be factor but keeping simple
        if (ambition >= 16 && loyalty < 10) {
            return 'Ambitious';
        }

        // Volatile: Low temperament
        if (temperament <= 5) {
            return 'Volatile';
        }

        // Slack: Low professionalism and determination
        if (professionalism <= 5 && determination <= 8) {
            return 'Slack';
        }

        return 'Balanced';
    }

    /**
     * Update a player's personality type in the database based on their current hidden attributes
     */
    static async updatePlayerPersonalityType(playerId: number): Promise<string> {
        const player = await prisma.player.findUnique({
            where: { id: playerId }
        });

        if (!player) throw new Error('Player not found');

        const personality = this.determinePersonalityType(
            player.professionalism || 10,
            player.ambition || 10,
            player.loyalty || 10,
            player.determination || 10,
            player.pressure || 10,
            player.temperament || 10,
            player.leadership || 10
        );

        // Only update if changed
        if (player.personalityType !== personality) {
            await prisma.player.update({
                where: { id: playerId },
                data: { personalityType: personality }
            });
        }

        return personality;
    }

    /**
     * Generate random hidden attributes and personality for a new player (e.g. youth intake)
     */
    static generatePersonalityStats(academyLevel: number = 10): any {
        // Better academies tend to produce more professional players
        const base = 5 + Math.floor(academyLevel / 2); // 5-15 base
        const variance = () => Math.floor(Math.random() * 8) - 4; // -4 to +3

        const clamp = (val: number) => Math.max(1, Math.min(20, val));

        const stats = {
            professionalism: clamp(base + variance()),
            ambition: clamp(10 + variance()), // Ambition is more innate
            loyalty: clamp(10 + variance()),
            pressure: clamp(base + variance()),
            temperament: clamp(base + variance()),
            leadership: clamp(Math.random() * 20 + 1) // Purely random
        };

        const personalityType = this.determinePersonalityType(
            stats.professionalism,
            stats.ambition,
            stats.loyalty,
            10, // Default determination if not passed, but usually stored on Player model proper
            stats.pressure,
            stats.temperament,
            stats.leadership
        );

        return { ...stats, personalityType };
    }
}
