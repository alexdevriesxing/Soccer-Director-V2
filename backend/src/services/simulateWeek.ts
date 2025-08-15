import { PrismaClient } from '@prisma/client';
import { runAIManagersForAllClubs } from './aiManagerService';
import TrainingService from './trainingService';

const prisma = new PrismaClient();

/**
 * Simulate a complete game week
 * This includes AI manager activities, match simulation, and financial updates
 */
export async function simulateWeek(weekNumber: number) {
  console.log(`Starting simulation for week ${weekNumber}...`);

  // Process injury recovery before other weekly events
  await processWeeklyInjuryRecovery();

  const summary: any = {
    week: weekNumber,
    matches: [],
    training: [],
    playerDevelopment: []
  };

  try {
    // 1. Run AI managers for all clubs
    console.log('Running AI managers...');
    await runAIManagersForAllClubs();

    // 2. Simulate matches for the week
    console.log('Simulating matches...');
    const matchResults = await simulateWeekMatchesWithSummary(weekNumber);
    summary.matches = matchResults;

    // 3. Update financial records
    console.log('Updating finances...');
    await updateWeeklyFinances(weekNumber);

    // 4. Process transfers and loans
    console.log('Processing transfers and loans...');
    await processTransfersAndLoans();

    // 5. Update player stats and morale (training)
    console.log('Updating player stats...');
    const trainingResults = await updatePlayerStatsWithSummary(weekNumber);
    summary.training = trainingResults.training;
    summary.playerDevelopment = trainingResults.playerDevelopment;

    // 6. Generate news and events
    console.log('Generating news...');
    await generateWeeklyNews(weekNumber);

    // Promotion/relegation logic (unchanged)
    if (weekNumber === 34) {
      console.log('End of season reached! Processing promotion/relegation for all divisions...');
      const { handleEredivisiePromotionRelegation, handlePromotionRelegationBetweenDivisions, handleO21PromotionRelegation, handleJongGraduations } = require('./promotionRelegationService');
      await handleEredivisiePromotionRelegation();
      await handlePromotionRelegationBetweenDivisions('Eerste Divisie', 'Tweede Divisie');
      await handlePromotionRelegationBetweenDivisions('Tweede Divisie', 'Derde Divisie');
      await handlePromotionRelegationBetweenDivisions('Derde Divisie', 'Vierde Divisie');
      // Add more as needed for lower divisions
      // Optionally: await PromotionRelegationService.handleZaterdagNoordPromotionRelegation();
      await handleO21PromotionRelegation();
      await handleJongGraduations();
      console.log('Promotion/relegation processing complete!');
    }

    console.log(`Week ${weekNumber} simulation completed successfully!`);
    return summary;
  } catch (error) {
    console.error(`Error simulating week ${weekNumber}:`, error);
    throw error;
  }
}

/**
 * Simulate all matches for a given week
 */
async function simulateWeekMatches(weekNumber: number) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      week: weekNumber,
      played: false
    },
    include: {
      homeClub: {
        include: {
          players: true,
          formations: true,
          strategies: true
        }
      },
      awayClub: {
        include: {
          players: true,
          formations: true,
          strategies: true
        }
      }
    }
  });

  for (const fixture of fixtures) {
    await simulateMatch(fixture);
  }
}

/**
 * Simulate a single match
 */
async function simulateMatch(fixture: any) {
  const homeClub = fixture.homeClub;
  const awayClub = fixture.awayClub;

  // Calculate team strengths
  const homeStrength = calculateTeamStrength(homeClub, true);
  const awayStrength = calculateTeamStrength(awayClub, false);

  // --- Stadium attendance logic ---
  // Fetch stadium facility for home club
  const stadium = homeClub.facilities?.find((f: any) => f.type === 'stadium');
  const stadiumCapacity = stadium?.capacity || 10000;
  const ticketPrice = stadium?.ticketPrice || 25;

  // Calculate base attendance
  const baseAttendance = 15000;
  const performanceBonus = (homeClub.morale - 50) * 100;
  const facilityBonus = stadium ? stadium.level * 1000 : 0;
  // Ticket price effect: higher price reduces attendance, lower price increases it (diminishing returns)
  const priceEffect = 1 - 0.015 * Math.max(0, ticketPrice - 25) + 0.01 * Math.max(0, 25 - ticketPrice);
  let attendance = (baseAttendance + performanceBonus + facilityBonus) * priceEffect;
  attendance = Math.max(0, Math.min(attendance, stadiumCapacity));

  // Simulate goals using Poisson distribution
  const homeGoals = simulateGoals(homeStrength, awayStrength, true);
  const awayGoals = simulateGoals(awayStrength, homeStrength, false);

  // Generate match events
  const events = generateMatchEvents(fixture, homeGoals, awayGoals);

  // Update fixture with results and attendance
  await prisma.fixture.update({
    where: { id: fixture.id },
    data: {
      played: true,
      homeGoals,
      awayGoals,
      attendance: Math.round(attendance)
    }
  });

  // Create match events
  for (const event of events) {
    await prisma.matchEvent.create({
      data: {
        fixtureId: fixture.id,
        type: event.type,
        minute: event.minute,
        description: event.description,
        playerName: event.playerName
      }
    });
  }

  // Update club form and morale
  await updateClubAfterMatch(homeClub, homeGoals, awayGoals);
  await updateClubAfterMatch(awayClub, awayGoals, homeGoals);
}

/**
 * Calculate team strength based on players, tactics, and home advantage
 */
function calculateTeamStrength(club: any, isHome: boolean) {
  const players = club.players.filter((p: any) => !p.injured);
  const formation = club.formations?.[0];
  const strategy = club.strategies?.[0];

  // Base strength from players
  let strength = players.reduce((sum: number, p: any) => sum + p.skill, 0) / players.length;

  // Home advantage
  if (isHome) {
    strength *= 1.1;
  }

  // Formation and strategy bonuses
  if (formation) {
    strength += (formation.intensity - 50) * 0.01;
    strength += (formation.tempo - 50) * 0.005;
  }

  if (strategy) {
    if (strategy.approach === 'attacking') strength += 5;
    if (strategy.approach === 'defensive') strength -= 3;
  }

  // Club morale bonus
  strength += (club.morale - 50) * 0.02;

  return Math.max(50, Math.min(100, strength));
}

/**
 * Simulate goals using Poisson distribution
 */
function simulateGoals(teamStrength: number, opponentStrength: number, isHome: boolean) {
  const baseRate = (teamStrength / 100) * 1.5; // Base goal rate
  const opponentFactor = (100 - opponentStrength) / 100; // Weaker opponent = more goals
  const homeBonus = isHome ? 0.2 : 0;

  const goalRate = baseRate * (1 + opponentFactor + homeBonus);

  // Poisson distribution for goals
  let goals = 0;
  const lambda = goalRate;

  for (let i = 0; i < 10; i++) { // Simulate 10 attempts
    if (Math.random() < lambda / 10) {
      goals++;
    }
  }

  return Math.min(7, goals); // Cap at 7 goals
}

/**
 * Generate match events (goals, cards, etc.)
 */
function generateMatchEvents(fixture: any, homeGoals: number, awayGoals: number) {
  const events: any[] = [];
  const homePlayers = fixture.homeClub.players;
  const awayPlayers = fixture.awayClub.players;

  // Generate random injury time for each half
  const firstHalfInjury = Math.floor(Math.random() * 4) + 1; // 1-4 min
  const secondHalfInjury = Math.floor(Math.random() * 5) + 1; // 1-5 min

  // Generate goals
  for (let i = 0; i < homeGoals; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const scorer = homePlayers[Math.floor(Math.random() * homePlayers.length)];
    events.push({
      type: 'goal',
      minute,
      description: `Goal scored by ${scorer.name}`,
      playerName: scorer.name,
      team: 'home',
      teamId: 1
    });
  }

  for (let i = 0; i < awayGoals; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const scorer = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
    events.push({
      type: 'goal',
      minute,
      description: `Goal scored by ${scorer.name}`,
      playerName: scorer.name,
      team: 'away',
      teamId: 2
    });
  }

  // Generate highlight events (near miss, save)
  const highlightCount = Math.floor(Math.random() * 4) + 2; // 2-5 highlights
  for (let i = 0; i < highlightCount; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const isHome = Math.random() > 0.5;
    const players = isHome ? homePlayers : awayPlayers;
    const player = players[Math.floor(Math.random() * players.length)];
    const type = Math.random() > 0.5 ? 'near_miss' : 'save';
    events.push({
      type,
      minute,
      description: type === 'near_miss' ? `Near miss by ${player.name}` : `Save by ${player.name}`,
      playerName: player.name,
      team: isHome ? 'home' : 'away',
      teamId: isHome ? 1 : 2
    });
  }

  // Generate cards (yellow and red)
  const totalCards = Math.floor(Math.random() * 4) + 1; // 1-4 cards per match
  for (let i = 0; i < totalCards; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const isHome = Math.random() > 0.5;
    const players = isHome ? homePlayers : awayPlayers;
    const player = players[Math.floor(Math.random() * players.length)];
    const cardType = Math.random() > 0.8 ? 'red' : 'yellow';
    events.push({
      type: cardType,
      minute,
      description: `${cardType === 'red' ? 'Red' : 'Yellow'} card for ${player.name}`,
      playerName: player.name,
      team: isHome ? 'home' : 'away',
      teamId: isHome ? 1 : 2
    });
  }

  // Generate substitutions
  const subCount = Math.floor(Math.random() * 3); // 0-2 subs
  for (let i = 0; i < subCount; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const isHome = Math.random() > 0.5;
    const players = isHome ? homePlayers : awayPlayers;
    const playerOut = players[Math.floor(Math.random() * players.length)];
    const playerIn = players[Math.floor(Math.random() * players.length)];
    events.push({
      type: 'substitution',
      minute,
      description: `Substitution: ${playerOut.name} replaced by ${playerIn.name}`,
      playerName: playerOut.name,
      subIn: playerIn.name,
      team: isHome ? 'home' : 'away',
      teamId: isHome ? 1 : 2
    });
  }

  // Add injury time events (for frontend to use)
  events.push({
    type: 'injury_time',
    minute: 45,
    description: `First half injury time: +${firstHalfInjury}`,
    injuryTime: firstHalfInjury
  });
  events.push({
    type: 'injury_time',
    minute: 90,
    description: `Second half injury time: +${secondHalfInjury}`,
    injuryTime: secondHalfInjury
  });

  // Sort events by minute
  return events.sort((a, b) => a.minute - b.minute);
}

/**
 * Update club after match (form, morale, etc.)
 */
async function updateClubAfterMatch(club: any, goalsFor: number, goalsAgainst: number) {
  let moraleChange = 0;
  let formChange = '';

  if (goalsFor > goalsAgainst) {
    // Win
    moraleChange = 5;
    formChange = 'W';
  } else if (goalsFor === goalsAgainst) {
    // Draw
    moraleChange = 0;
    formChange = 'D';
  } else {
    // Loss
    moraleChange = -3;
    formChange = 'L';
  }

  // Update club morale and form
  const newMorale = Math.max(0, Math.min(100, club.morale + moraleChange));
  const newForm = (club.form + formChange).slice(-5); // Keep last 5 results

  await prisma.club.update({
    where: { id: club.id },
    data: {
      morale: newMorale,
      form: newForm
    }
  });
}

/**
 * Update weekly finances for all clubs
 */
async function updateWeeklyFinances(weekNumber: number) {
  const clubs = await prisma.club.findMany({
    include: {
      finances: { orderBy: { week: 'desc' }, take: 1 },
      players: true,
      staff: true,
      sponsorships: { where: { isActive: true } },
      facilities: true
    }
  });

  for (const club of clubs) {
    const lastFinance = club.finances[0];
    if (!lastFinance) continue;

    // Calculate weekly income
    const gateReceipts = calculateGateReceipts(club, weekNumber);
    const sponsorshipIncome = club.sponsorships.reduce((sum: number, s: any) => sum + (s.value / 52), 0); // Weekly
    const tvRightsIncome = 0; // Would be calculated based on league position and TV deals

    // Calculate weekly expenses
    const playerWages = club.players.reduce((sum: number, p: any) => sum + p.wage, 0);
    const staffWages = club.staff.reduce((sum: number, s: any) => sum + (s.wage || 0), 0);
    const facilityCosts = club.facilities.reduce((sum: number, f: any) => sum + f.maintenanceCost, 0);

    // Calculate net income
    const weeklyIncome = gateReceipts + sponsorshipIncome + tvRightsIncome;
    const weeklyExpenses = playerWages + staffWages + facilityCosts;
    const netIncome = weeklyIncome - weeklyExpenses;

    // Create new finance record
    await prisma.clubFinances.create({
      data: {
        clubId: club.id,
        season: lastFinance.season,
        week: weekNumber,
        balance: lastFinance.balance + netIncome,
        gateReceiptsTotal: lastFinance.gateReceiptsTotal + gateReceipts,
        sponsorshipTotal: lastFinance.sponsorshipTotal + sponsorshipIncome,
        tvRightsTotal: lastFinance.tvRightsTotal + tvRightsIncome,
        playerWagesTotal: lastFinance.playerWagesTotal + playerWages,
        staffWagesTotal: lastFinance.staffWagesTotal + staffWages,
        facilityCosts: lastFinance.facilityCosts + facilityCosts,
        transferBudget: lastFinance.transferBudget,
        wageBudget: lastFinance.wageBudget
      }
    });

    // --- Board/Fan satisfaction logic ---
    const stadium = club.facilities.find((f: any) => f.type === 'stadium');
    const ticketPrice = stadium?.ticketPrice || 25;
    const stadiumCapacity = stadium?.capacity || 10000;
    // Estimate attendance as in simulation
    const baseAttendance = 15000;
    const facilityBonus = stadium ? stadium.level * 1000 : 0;
    const priceEffect = 1 - 0.015 * Math.max(0, ticketPrice - 25) + 0.01 * Math.max(0, 25 - ticketPrice);
    let attendance = (baseAttendance + facilityBonus) * priceEffect;
    attendance = Math.max(0, Math.min(attendance, stadiumCapacity));
    // Board: penalize if ticket price > 40 or attendance < 60% capacity
    if (ticketPrice > 40 || attendance < 0.6 * stadiumCapacity) {
      await prisma.boardMember.updateMany({
        where: { clubId: club.id },
        data: { influence: { decrement: 2 } } // Influence as a proxy for satisfaction
      });
    } else if (ticketPrice < 15 && attendance > 0.8 * stadiumCapacity) {
      await prisma.boardMember.updateMany({
        where: { clubId: club.id },
        data: { influence: { increment: 1 } }
      });
    }
    // Fan: penalize if ticket price > 40 or attendance < 60% capacity, boost if price < 20 and attendance high
    const fanGroups = await prisma.fanGroup.findMany({ where: { clubId: club.id } });
    for (const fanGroup of fanGroups) {
      if (ticketPrice > 40 || attendance < 0.6 * stadiumCapacity) {
        await prisma.fanSentiment.create({
          data: {
            fanGroupId: fanGroup.id,
            date: new Date(),
            sentiment: -10,
            reason: 'High ticket price or low attendance'
          }
        });
      } else if (ticketPrice < 20 && attendance > 0.8 * stadiumCapacity) {
        await prisma.fanSentiment.create({
          data: {
            fanGroupId: fanGroup.id,
            date: new Date(),
            sentiment: 5,
            reason: 'Affordable ticket price and high attendance'
          }
        });
      }
    }
  }
}

/**
 * Calculate gate receipts based on club performance and facilities
 */
function calculateGateReceipts(club: any, weekNumber: number) {
  // Fetch stadium facility for club
  const stadium = club.facilities?.find((f: any) => f.type === 'stadium');
  const stadiumCapacity = stadium?.capacity || 10000;
  const ticketPrice = stadium?.ticketPrice || 25;
  const baseAttendance = 15000;
  const performanceBonus = (club.morale - 50) * 100;
  const facilityBonus = stadium ? stadium.level * 1000 : 0;
  // Ticket price effect: higher price reduces attendance, lower price increases it (diminishing returns)
  const priceEffect = 1 - 0.015 * Math.max(0, ticketPrice - 25) + 0.01 * Math.max(0, 25 - ticketPrice);
  let totalAttendance = (baseAttendance + performanceBonus + facilityBonus) * priceEffect;
  totalAttendance = Math.max(0, Math.min(totalAttendance, stadiumCapacity));
  return Math.round(totalAttendance) * ticketPrice;
}

/**
 * Process pending transfers and loans
 */
async function processTransfersAndLoans() {
  // Process accepted transfers
  const acceptedTransfers = await prisma.transfer.findMany({
    where: { status: 'accepted' },
    include: { player: true }
  });

  for (const transfer of acceptedTransfers) {
    // Move player to new club
    await prisma.player.update({
      where: { id: transfer.playerId },
      data: { clubId: transfer.fromClubId }
    });

    // Update transfer status
    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { status: 'completed' }
    });
  }

  // Process accepted loans
  const acceptedLoans = await prisma.loan.findMany({
    where: { status: 'accepted' },
    include: { player: true }
  });

  for (const loan of acceptedLoans) {
    // Move player to loan club
    await prisma.player.update({
      where: { id: loan.playerId },
      data: { clubId: loan.toClubId }
    });

    // Update loan status
    await prisma.loan.update({
      where: { id: loan.id },
      data: { status: 'active' }
    });
  }
}

/**
 * Update player stats and morale using training logic
 */
async function updatePlayerStats(weekNumber: number) {
  const clubs = await prisma.club.findMany();
  for (const club of clubs) {
    try {
      await TrainingService.conductTrainingSession(club.id, 'weekly');
    } catch (err) {
      console.error(`Training failed for club ${club.name}:`, err);
    }
  }
}

/**
 * Generate weekly news and events
 */
async function generateWeeklyNews(weekNumber: number) {
  // This would generate news about transfers, match results, etc.
  // For now, just log that news generation is happening
  console.log(`Generating news for week ${weekNumber}...`);
}

// Add this helper function for weekly injury recovery
async function processWeeklyInjuryRecovery() {
  const injuries = await prisma.playerInjury.findMany({
    where: { endDate: { not: null } },
    include: { player: { include: { club: true } } }
  });
  const now = new Date();
  for (const injury of injuries) {
    if (!injury.player || !injury.player.clubId) continue;
    // Fetch medical facility level
    const facility = await prisma.facility.findFirst({ where: { clubId: injury.player.clubId, type: 'medical' } });
    const facilityLevel = facility?.level || 1;
    // Calculate original duration
    const start = new Date(injury.startDate);
    const end = new Date(injury.endDate!);
    const originalDuration = end.getTime() - start.getTime();
    // Calculate reduced duration
    const reduction = Math.min(0.1 * (facilityLevel - 1), 0.5); // Max 50% reduction
    const reducedDuration = originalDuration * (1 - reduction);
    const newEnd = new Date(start.getTime() + reducedDuration);
    // If the new end date is sooner than the current, update it
    if (newEnd < end) {
      await prisma.playerInjury.update({ where: { id: injury.id }, data: { endDate: newEnd } });
    }
    // If injury is over, mark player as recovered
    if (now >= newEnd) {
      await prisma.player.update({ where: { id: injury.playerId }, data: { injured: false } });
    }
  }
}

// Helper: Simulate matches and collect results
async function simulateWeekMatchesWithSummary(weekNumber: number) {
  const fixtures = await prisma.fixture.findMany({
    where: { week: weekNumber, played: false },
    include: {
      homeClub: true,
      awayClub: true
    }
  });
  const results = [];
  for (const fixture of fixtures) {
    await simulateMatch(fixture);
    results.push({
      fixtureId: fixture.id,
      homeClub: fixture.homeClub.name,
      awayClub: fixture.awayClub.name,
      // Optionally fetch updated goals from DB
    });
  }
  return results;
}

// Helper: Run training and collect results
async function updatePlayerStatsWithSummary(weekNumber: number) {
  const clubs = await prisma.club.findMany();
  const training = [];
  const playerDevelopment = [];
  for (const club of clubs) {
    try {
      const result = await TrainingService.conductTrainingSession(club.id, 'weekly');
      training.push({ club: club.name, ...result });
      // Collect notable player development (e.g., skill gain > 1, new injuries)
      for (const r of result.results) {
        if (r.skillGain > 1 || r.isInjured) {
          playerDevelopment.push({
            club: club.name,
            player: r.playerName,
            skillGain: r.skillGain,
            isInjured: r.isInjured,
            newSkill: r.newSkill
          });
        }
      }
    } catch (err) {
      console.error(`Training failed for club ${club.name}:`, err);
    }
  }
  return { training, playerDevelopment };
}

// Export for manual triggering
export async function triggerWeekSimulation(weekNumber: number) {
  console.log(`Manually triggering week ${weekNumber} simulation...`);
  await simulateWeek(weekNumber);
} 