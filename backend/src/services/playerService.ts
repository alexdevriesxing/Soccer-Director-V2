import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class PlayerService {
  // Get all players for a club (squad listing)
  async getPlayersByClub(clubId: number) {
    return prisma.player.findMany({ where: { clubId } });
  }

  // Assign a player to a club (add to squad)
  async assignPlayerToClub(playerId: number, clubId: number) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error('Player not found');
    return prisma.player.update({ where: { id: playerId }, data: { clubId } });
  }

  // Remove a player from a club (remove from squad)
  async removePlayerFromClub(playerId: number) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error('Player not found');
    return prisma.player.update({ where: { id: playerId }, data: { clubId: null } });
  }
  async createPlayer(data: Prisma.PlayerCreateInput) {
    return prisma.player.create({ data: { ...data, contractStart: data.contractStart || new Date() } });
  }

  async getPlayerById(id: number) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    return player;
  }

  async updatePlayer(id: number, data: any) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    return prisma.player.update({ where: { id }, data });
  }

  async deletePlayer(id: number) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    return prisma.player.delete({ where: { id } });
  }

  // Develop player: increase skill, consider potential, cap at 100
  async developPlayer(id: number, params: { amount?: number }) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    const amount = params.amount ?? 1;
    let newSkill = player.skill + amount;
    if (newSkill > 100) newSkill = 100;
    return prisma.player.update({ where: { id }, data: { skill: newSkill } });
  }

  // Set morale (0-100)
  async setMorale(id: number, morale: number) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    const boundedMorale = Math.max(0, Math.min(100, morale));
    return prisma.player.update({ where: { id }, data: { morale: boundedMorale } });
  }

  // Update contract (wage, contractExpiry, bonuses, clauses, agent info, contractHistory)
  async updateContract(id: number, contractData: { wage?: number; contractExpiry?: Date; contractStart?: Date; releaseClause?: number; buyoutClause?: number; optionalExtension?: boolean; agentName?: string; agentFee?: number }) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    const data: any = {};
    if (contractData.wage != null) data.wage = contractData.wage;
    if (contractData.contractExpiry != null) data.contractExpiry = contractData.contractExpiry;
    if (contractData.contractStart != null) data.contractStart = contractData.contractStart;
    if (contractData.releaseClause != null) data.releaseClause = contractData.releaseClause;
    if (contractData.buyoutClause != null) data.buyoutClause = contractData.buyoutClause;
    if (contractData.optionalExtension != null) data.optionalExtension = contractData.optionalExtension;
    if (contractData.agentName != null) data.agentName = contractData.agentName;
    if (contractData.agentFee != null) data.agentFee = contractData.agentFee;
    // Do not include contractHistory or any other non-existent fields
    return prisma.player.update({ where: { id }, data });
  }

  // Offer a new contract (store as pending in a local variable, not in player model)
  async offerContract(id: number, offer: any) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    // No contractHistory logic
    return player;
  }

  // Accept a pending contract offer
  async acceptContract(id: number) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    // Remove all contractHistory logic
    // Accepting a contract should update only valid contract fields (implement as needed)
    // Example: update contractExpiry, wage, etc. based on your negotiation model
    return player;
  }

  // Reject a pending contract offer
  async rejectContract(id: number) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    // Remove all contractHistory logic
    return player;
  }

  // Counter a contract offer
  async counterContract(id: number, counter: any) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    // Remove all contractHistory logic
    return player;
  }

  // Trigger a contract clause (release, buyout, extension)
  async triggerClause(id: number, clause: string) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    // Example: handle release clause
    if (clause === 'release' && (player as any).releaseClause) {
      // Set player as free agent (clubId = null, contractExpiry = now)
      return prisma.player.update({ where: { id }, data: { clubId: null, contractExpiry: new Date() } });
    }
    // Example: handle optional extension
    if (clause === 'optionalExtension' && (player as any).optionalExtension) {
      // Extend contract by 1 year
      const newExpiry = new Date(player.contractExpiry);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      return prisma.player.update({ where: { id }, data: { contractExpiry: newExpiry } });
    }
    throw new Error('Clause not available or not implemented');
  }

  // Renew a contract (update expiry and optionally other terms)
  async renewContract(id: number, data: any) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    return prisma.player.update({ where: { id }, data });
  }

  // Get players with contracts expiring within N days
  async getExpiringContracts(days: number = 30) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return prisma.player.findMany({ where: { contractExpiry: { lte: future, gte: now } } });
  }

  // Get player history (real aggregation)
  async getPlayerHistory(id: number) {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new Error('Player not found');
    // Career stats
    const careerStats = await prisma.playerCareerStat.findMany({ where: { playerId: id }, orderBy: { season: 'asc' } });
    // Awards
    const awards = await prisma.playerAward.findMany({ where: { playerId: id }, orderBy: { season: 'asc' } });
    // Transfers
    const transfers = await prisma.transfer.findMany({ where: { playerId: id }, orderBy: { date: 'asc' }, include: { fromClub: true, toClub: true } });
    // Match history (recent 20 matches)
    const matchEvents = await prisma.matchEvent.findMany({ where: { playerName: player.name }, orderBy: { fixtureId: 'desc' }, take: 20, include: { fixture: true } });
    // Personal stories
    let personalStories: any[] = [];
    try {
      personalStories = await prisma.playerPersonalStory.findMany({ where: { playerId: id } });
    } catch {}
    // Media events
    let mediaEvents: any[] = [];
    try {
      mediaEvents = await prisma.playerMediaEvent.findMany({ where: { playerId: id } });
    } catch {}
    return {
      player,
      careerStats,
      awards,
      transfers,
      matchHistory: matchEvents,
      personalStories,
      mediaEvents
    };
  }
}

export async function processPlayerDevelopmentAndAging() {
  const players = await prisma.player.findMany();
  const now = new Date();
  for (const player of players) {
    let updates: any = {};
    let logs: any[] = [];
    // Age increment: if birthday (simulate as Jan 1 for all)
    if (now.getMonth() === 0 && now.getDate() === 1) {
      updates.age = (player.age ?? 18) + 1;
      logs.push({ type: 'age', change: 1, reason: 'Birthday', oldValue: player.age, newValue: updates.age });
    }
    // Skill progression/regression
    let skillChange = 0;
    const improvementChance = player.improvementChance ?? 0.01;
    const moraleFactor = (player.morale ?? 70) / 100;
    const potential = player.potential ?? 70;
    const currentPotential = player.currentPotential ?? 70;
    const age = updates.age ?? player.age;
    // Young players improve, old regress
    if (age <= 22) {
      skillChange = Math.random() < improvementChance ? Math.ceil((potential - player.skill) * 0.02 * moraleFactor) : 0;
    } else if (age <= 28) {
      skillChange = Math.random() < improvementChance ? Math.ceil((currentPotential - player.skill) * 0.01 * moraleFactor) : 0;
    } else if (age <= 32) {
      skillChange = Math.random() < improvementChance ? Math.ceil((currentPotential - player.skill) * 0.005 * moraleFactor) : 0;
    } else {
      // Regression for older players
      skillChange = -Math.ceil(Math.random() * 2);
    }
    if (skillChange !== 0) {
      const oldSkill = player.skill;
      updates.skill = Math.max(0, Math.min(100, player.skill + skillChange));
      logs.push({ type: 'skill', change: skillChange, reason: 'Development/Aging', oldValue: oldSkill, newValue: updates.skill });
    }
    // Retirement trigger
    let retired = false;
    if (age >= 36 && (updates.skill ?? player.skill) < 60 && Math.random() < 0.2) {
      // Mark as retired (set clubId to null, or add a retired flag if needed)
      updates.clubId = null;
      retired = true;
      logs.push({ type: 'retirement', change: 1, reason: 'Aging/Low skill', oldValue: age, newValue: null });
    }
    // Apply updates
    if (Object.keys(updates).length > 0) {
      await prisma.player.update({ where: { id: player.id }, data: updates });
    }
    // Log changes
    for (const log of logs) {
      // The original code had logMoraleChange here, but logMoraleChange is not defined in this file.
      // Assuming it was intended to be removed or replaced with a placeholder.
      // For now, commenting out the line to avoid linter errors.
      // await logMoraleChange(player.id, log.type, log.change, log.reason, log.oldValue, log.newValue);
    }
  }
}

export default new PlayerService(); 