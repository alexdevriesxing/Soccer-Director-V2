import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Main AI Manager Service
 * Runs for all AI-controlled clubs each week/round.
 * For each club, evaluates squad, plans transfers, adjusts tactics, and monitors finances.
 * Skips the human player's club (assumed club ID 1).
 */
export async function runAIManagersForAllClubs() {
    const clubs = await prisma.club.findMany({
        include: {
            players: true,
            staff: true,
            finances: { orderBy: { week: 'desc' }, take: 1 },
            league: true,
            formations: true,
            strategies: true,
            loansFrom: true,
            loansTo: true,
            transfersFrom: true,
            transfersTo: true,
            regulatoryWarnings: true,
        },
    });

    for (const club of clubs) {
        // Skip if this is the human player's club (assuming club ID 1 is human)
        if (club.id === 1) continue;

        console.log(`Running AI manager for ${club.name}...`);

        try {
            // 1. Evaluate squad and plan transfers
            const transferPlan = await evaluateSquadAndPlanTransfers(club);

            // 2. Execute transfer activities
            if (transferPlan) {
                await executeTransferActivities(club, transferPlan);
            }

            // 3. Adjust tactics and lineups
            await adjustTacticsAndLineups(club);

            // 4. Monitor finances and regulatory status
            await monitorFinancesAndRegulations(club);

        } catch (error) {
            console.error(`Error running AI manager for ${club.name}:`, error);
        }
    }
}

/**
 * Evaluate squad needs and create transfer plan
 */
async function evaluateSquadAndPlanTransfers(club: any) {
    const squad = club.players;
    const finances = club.finances[0];

    if (!finances) return null;

    // Analyze squad by position
    const positionAnalysis = analyzeSquadByPosition(squad);

    // Identify needs and surpluses
    const needs = identifySquadNeeds(positionAnalysis);
    const surpluses = identifySquadSurpluses(positionAnalysis, squad);

    // Check financial constraints
    const availableBudget = Math.min(finances.transferBudget, finances.balance * 0.8);
    const availableWageBudget = finances.wageBudget * 0.9; // Keep 10% buffer

    // Create transfer targets
    const transferTargets = await findTransferTargets(club, needs, availableBudget);

    // Create loan targets (cheaper option)
    const loanTargets = await findLoanTargets(club, needs, availableWageBudget);

    // List players for sale/loan
    const playersForSale = identifyPlayersForSale(surpluses, squad);
    const playersForLoan = identifyPlayersForLoan(surpluses, squad);

    return {
        needs,
        surpluses,
        transferTargets,
        loanTargets,
        playersForSale,
        playersForLoan,
        availableBudget,
        availableWageBudget
    };
}

/**
 * Analyzes a squad by position, calculating count, average age, average skill, and expiring contracts for each position.
 *
 * @param {Array} squad - Array of player objects
 * @returns {object} Analysis object keyed by position
 */
function analyzeSquadByPosition(squad: any[]) {
    const positions = ['GK', 'LB', 'CB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
    const analysis: any = {};

    positions.forEach(pos => {
        const players = squad.filter(p => p.position === pos);
        analysis[pos] = {
            count: players.length,
            averageAge: players.length > 0 ? players.reduce((sum, p) => sum + p.age, 0) / players.length : 0,
            averageSkill: players.length > 0 ? players.reduce((sum, p) => sum + p.skill, 0) / players.length : 0,
            players: players,
            contractsExpiring: players.filter(p => {
                const expiryDate = new Date(p.contractExpiry);
                const now = new Date();
                const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
                return monthsUntilExpiry <= 6;
            }).length
        };
    });

    return analysis;
}

/**
 * Identifies squad needs based on position analysis, including depth, quality, age, and expiring contracts.
 *
 * @param {object} analysis - Output of analyzeSquadByPosition
 * @returns {Array} List of needs with position, priority, reason, and count
 */
function identifySquadNeeds(analysis: any) {
    const needs: any[] = [];
    const minPlayersPerPosition = {
        'GK': 2, 'LB': 1, 'CB': 2, 'RB': 1, 'DM': 1, 'CM': 2, 'AM': 1, 'LW': 1, 'RW': 1, 'ST': 2
    };

    Object.entries(analysis).forEach(([position, data]: [string, any]) => {
        const minRequired = minPlayersPerPosition[position as keyof typeof minPlayersPerPosition] || 1;

        // Need more players
        if (data.count < minRequired) {
            needs.push({
                position,
                priority: 'high',
                reason: 'insufficient_depth',
                count: minRequired - data.count
            });
        }

        // Need better quality
        if (data.count >= minRequired && data.averageSkill < 70) {
            needs.push({
                position,
                priority: 'medium',
                reason: 'low_quality',
                count: 1
            });
        }

        // Need younger players
        if (data.count >= minRequired && data.averageAge > 30) {
            needs.push({
                position,
                priority: 'medium',
                reason: 'aging_squad',
                count: 1
            });
        }

        // Contracts expiring
        if (data.contractsExpiring > 0) {
            needs.push({
                position,
                priority: 'high',
                reason: 'contracts_expiring',
                count: data.contractsExpiring
            });
        }
    });

    return needs;
}

/**
 * Identify squad surpluses
 */
function identifySquadSurpluses(analysis: any, squad: any[]) {
    const surpluses: any[] = [];

    Object.entries(analysis).forEach(([position, data]: [string, any]) => {
        const maxPlayersPerPosition = {
            'GK': 3, 'LB': 2, 'CB': 4, 'RB': 2, 'DM': 2, 'CM': 4, 'AM': 2, 'LW': 2, 'RW': 2, 'ST': 3
        };

        const maxAllowed = maxPlayersPerPosition[position as keyof typeof maxPlayersPerPosition] || 2;

        if (data.count > maxAllowed) {
            const surplusPlayers = data.players
                .sort((a: any, b: any) => {
                    // Sort by: low skill, high age, low morale, expiring contract
                    const scoreA = (100 - a.skill) + (a.age * 2) + (100 - a.morale) + (a.contractExpiry ? 50 : 0);
                    const scoreB = (100 - b.skill) + (b.age * 2) + (100 - b.morale) + (b.contractExpiry ? 50 : 0);
                    return scoreA - scoreB;
                })
                .slice(0, data.count - maxAllowed);

            surpluses.push({
                position,
                players: surplusPlayers,
                count: surplusPlayers.length
            });
        }
    });

    return surpluses;
}

/**
 * Find transfer targets based on needs and budget
 */
async function findTransferTargets(club: any, needs: any[], availableBudget: number) {
    const targets: any[] = [];

    for (const need of needs) {
        if (need.reason === 'insufficient_depth' || need.reason === 'low_quality') {
            // Find players from other clubs
            const otherClubs = await prisma.club.findMany({
                where: { id: { not: club.id } },
                include: { players: true }
            });

            for (const otherClub of otherClubs) {
                const suitablePlayers = otherClub.players.filter((p: any) => {
                    // Position match
                    if (p.position !== need.position) return false;

                    // Skill requirements
                    if (need.reason === 'low_quality' && p.skill < 75) return false;
                    if (need.reason === 'insufficient_depth' && p.skill < 65) return false;

                    // Age requirements (prefer younger players)
                    if (p.age > 32) return false;

                    // Contract not expiring soon
                    const expiryDate = new Date(p.contractExpiry);
                    const now = new Date();
                    const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
                    if (monthsUntilExpiry <= 6) return false;

                    return true;
                });

                for (const player of suitablePlayers.slice(0, 2)) { // Limit to 2 per club
                    const estimatedValue = player.skill * 100000; // Rough valuation

                    if (estimatedValue <= availableBudget) {
                        targets.push({
                            player,
                            estimatedValue,
                            offerAmount: estimatedValue * (0.8 + Math.random() * 0.4), // 80-120% of value
                            priority: need.priority,
                            reason: need.reason
                        });
                    }
                }
            }
        }
    }

    // Sort by priority and value
    return targets.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];

        if (aPriority !== bPriority) return bPriority - aPriority;
        return a.estimatedValue - b.estimatedValue;
    }).slice(0, 5); // Limit to 5 targets
}

/**
 * Find loan targets
 */
async function findLoanTargets(club: any, needs: any[], availableWageBudget: number) {
    const targets: any[] = [];

    for (const need of needs) {
        if (need.reason === 'insufficient_depth') {
            // Find young players from bigger clubs
            const biggerClubs = await prisma.club.findMany({
                where: {
                    id: { not: club.id },
                    finances: {
                        some: {
                            balance: { gt: club.finances[0]?.balance || 0 }
                        }
                    }
                },
                include: { players: true }
            });

            for (const biggerClub of biggerClubs) {
                const youngPlayers = biggerClub.players.filter((p: any) => {
                    if (p.position !== need.position) return false;
                    if (p.age > 23) return false; // Young players only
                    if (p.skill < 60) return false; // Minimum skill
                    if (p.wage > availableWageBudget * 0.1) return false; // Affordable wage
                    return true;
                });

                for (const player of youngPlayers.slice(0, 1)) {
                    targets.push({
                        player,
                        loanFee: player.skill * 1000, // Weekly loan fee
                        wageContribution: player.wage * 0.5, // 50% wage contribution
                        priority: need.priority,
                        reason: need.reason
                    });
                }
            }
        }
    }

    return targets.slice(0, 3); // Limit to 3 loan targets
}

/**
 * Identifies players for sale based on surpluses, morale, age, and contract status.
 *
 * @param {Array} surpluses - List of surplus players by position
 * @param {Array} squad - Full squad array
 * @returns {Array} List of players to be put up for sale with asking price and reason
 */
function identifyPlayersForSale(surpluses: any[], squad: any[]) {
    const playersForSale: any[] = [];

    surpluses.forEach(surplus => {
        surplus.players.forEach((player: any) => {
            // Don't sell if contract expires soon (let it expire naturally)
            const expiryDate = new Date(player.contractExpiry);
            const now = new Date();
            const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

            if (monthsUntilExpiry > 6) {
                playersForSale.push({
                    player,
                    askingPrice: player.skill * 80000, // 80% of skill-based value
                    reason: 'surplus'
                });
            }
        });
    });

    // Also consider selling unhappy or aging players
    squad.forEach(player => {
        if (player.morale < 60 || player.age > 32) {
            const expiryDate = new Date(player.contractExpiry);
            const now = new Date();
            const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

            if (monthsUntilExpiry > 6) {
                playersForSale.push({
                    player,
                    askingPrice: player.skill * 60000, // Lower price for unhappy/aging players
                    reason: player.morale < 60 ? 'unhappy' : 'aging'
                });
            }
        }
    });

    return playersForSale;
}

/**
 * Identify players for loan
 */
function identifyPlayersForLoan(surpluses: any[], squad: any[]) {
    const playersForLoan: any[] = [];

    // Young players who need development
    squad.forEach(player => {
        if (player.age <= 21 && player.skill < 70) {
            playersForLoan.push({
                player,
                loanFee: player.skill * 500, // Weekly loan fee
                wageContribution: player.wage * 0.3, // 30% wage contribution
                reason: 'development'
            });
        }
    });

    // Surplus players
    surpluses.forEach(surplus => {
        surplus.players.forEach((player: any) => {
            if (player.age <= 25) {
                playersForLoan.push({
                    player,
                    loanFee: player.skill * 800,
                    wageContribution: player.wage * 0.5,
                    reason: 'surplus'
                });
            }
        });
    });

    return playersForLoan;
}

/**
 * Execute transfer activities
 */
async function executeTransferActivities(club: any, transferPlan: any) {
    // Make transfer offers
    for (const target of transferPlan.transferTargets.slice(0, 2)) { // Limit to 2 offers per week
        await makeTransferOffer(club, target);
    }

    // Make loan offers
    for (const target of transferPlan.loanTargets.slice(0, 1)) { // Limit to 1 loan offer per week
        await makeLoanOffer(club, target);
    }

    // List players for sale/loan
    await listPlayersForSale(club, transferPlan.playersForSale);
    await listPlayersForLoan(club, transferPlan.playersForLoan);

    // Respond to incoming offers
    await respondToIncomingOffers(club);
}

/**
 * Make a transfer offer
 */
async function makeTransferOffer(club: any, target: any) {
    try {
        // Check if player is already listed for transfer
        const existingTransfer = await prisma.transfer.findFirst({
            where: {
                playerId: target.player.id,
                status: 'pending'
            }
        });

        if (existingTransfer) {
            // Make a counter-offer if we can afford more
            if (target.offerAmount > existingTransfer.fee) {
                await prisma.transfer.update({
                    where: { id: existingTransfer.id },
                    data: {
                        fee: target.offerAmount,
                        fromClubId: club.id,
                        status: 'pending'
                    }
                });
                console.log(`${club.name} made a counter-offer of €${target.offerAmount.toLocaleString()} for ${target.player.name}`);
            }
        } else {
            // Create new transfer offer
            await prisma.transfer.create({
                data: {
                    playerId: target.player.id,
                    fromClubId: club.id,
                    toClubId: target.player.clubId,
                    fee: target.offerAmount,
                    status: 'pending',
                    date: new Date()
                }
            });
            console.log(`${club.name} made an offer of €${target.offerAmount.toLocaleString()} for ${target.player.name}`);
        }
    } catch (error) {
        console.error(`Error making transfer offer:`, error);
    }
}

/**
 * Make a loan offer
 */
async function makeLoanOffer(club: any, target: any) {
    try {
        // Check if player is already on loan
        const existingLoan = await prisma.loan.findFirst({
            where: {
                playerId: target.player.id,
                status: 'active'
            }
        });

        if (!existingLoan) {
            await prisma.loan.create({
                data: {
                    playerId: target.player.id,
                    fromClubId: target.player.clubId,
                    toClubId: club.id,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
                    loanFee: target.loanFee,
                    wageContribution: target.wageContribution,
                    status: 'active'
                }
            });
            console.log(`${club.name} made a loan offer for ${target.player.name}`);
        }
    } catch (error) {
        console.error(`Error making loan offer:`, error);
    }
}

/**
 * List players for sale
 */
async function listPlayersForSale(club: any, playersForSale: any[]) {
    for (const listing of playersForSale.slice(0, 2)) { // Limit to 2 listings per week
        try {
            // Check if already listed
            const existingTransfer = await prisma.transfer.findFirst({
                where: {
                    playerId: listing.player.id,
                    fromClubId: club.id,
                    status: 'pending'
                }
            });

            if (!existingTransfer) {
                await prisma.transfer.create({
                    data: {
                        playerId: listing.player.id,
                        fromClubId: club.id,
                        toClubId: club.id, // Self-reference for listing
                        fee: listing.askingPrice,
                        status: 'pending',
                        date: new Date()
                    }
                });
                console.log(`${club.name} listed ${listing.player.name} for sale at €${listing.askingPrice.toLocaleString()}`);
            }
        } catch (error) {
            console.error(`Error listing player for sale:`, error);
        }
    }
}

/**
 * List players for loan
 */
async function listPlayersForLoan(club: any, playersForLoan: any[]) {
    for (const listing of playersForLoan.slice(0, 1)) { // Limit to 1 loan listing per week
        try {
            // Check if already on loan
            const existingLoan = await prisma.loan.findFirst({
                where: {
                    playerId: listing.player.id,
                    fromClubId: club.id,
                    status: 'active'
                }
            });

            if (!existingLoan) {
                await prisma.loan.create({
                    data: {
                        playerId: listing.player.id,
                        fromClubId: club.id,
                        toClubId: club.id, // Self-reference for listing
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
                        loanFee: listing.loanFee,
                        wageContribution: listing.wageContribution,
                        status: 'active'
                    }
                });
                console.log(`${club.name} listed ${listing.player.name} for loan`);
            }
        } catch (error) {
            console.error(`Error listing player for loan:`, error);
        }
    }
}

/**
 * Respond to incoming offers
 */
async function respondToIncomingOffers(club: any) {
    try {
        // Get incoming transfer offers
        const incomingTransfers = await prisma.transfer.findMany({
            where: {
                toClubId: club.id,
                status: 'pending'
            },
            include: {
                player: true
            }
        });

        for (const transfer of incomingTransfers) {
            const player = transfer.player;
            const offerAmount = transfer.fee;

            // Calculate player value
            const playerValue = player.skill * 100000;

            // Decision logic
            let decision = 'reject';

            if (offerAmount >= playerValue * 1.2) {
                // Good offer (120%+ of value)
                decision = 'accept';
            } else if (offerAmount >= playerValue * 0.9) {
                // Reasonable offer (90%+ of value)
                // Consider squad needs
                const squad = club.players;
                const positionPlayers = squad.filter((p: any) => p.position === player.position);

                if (positionPlayers.length > 2) {
                    decision = 'accept'; // We have depth
                } else {
                    decision = 'negotiate'; // Try to get more
                }
            }

            // Execute decision
            if (decision === 'accept') {
                await prisma.transfer.update({
                    where: { id: transfer.id },
                    data: { status: 'completed' }
                });
                console.log(`${club.name} accepted €${offerAmount.toLocaleString()} offer for ${player.name}`);
            } else if (decision === 'negotiate') {
                const counterOffer = Math.min(offerAmount * 1.15, playerValue * 1.1);
                await prisma.transfer.update({
                    where: { id: transfer.id },
                    data: {
                        fee: counterOffer,
                        status: 'pending'
                    }
                });
                console.log(`${club.name} countered with €${counterOffer.toLocaleString()} for ${player.name}`);
            } else {
                await prisma.transfer.update({
                    where: { id: transfer.id },
                    data: { status: 'cancelled' }
                });
                console.log(`${club.name} rejected €${offerAmount.toLocaleString()} offer for ${player.name}`);
            }
        }

        // Get incoming loan offers
        const incomingLoans = await prisma.loan.findMany({
            where: {
                fromClubId: club.id,
                status: 'active'
            },
            include: {
                player: true
            }
        });

        for (const loan of incomingLoans) {
            const player = loan.player;

            // Accept loan offers for young players who need development
            if (player.age <= 21 && player.skill < 70) {
                await prisma.loan.update({
                    where: { id: loan.id },
                    data: { status: 'active' }
                });
                console.log(`${club.name} accepted loan offer for ${player.name}`);
            } else {
                await prisma.loan.update({
                    where: { id: loan.id },
                    data: { status: 'ended' }
                });
                console.log(`${club.name} rejected loan offer for ${player.name}`);
            }
        }
    } catch (error) {
        console.error(`Error responding to incoming offers:`, error);
    }
}

/**
 * Adjust tactics and lineups based on squad changes
 */
async function adjustTacticsAndLineups(club: any) {
    // This is a simplified version - in a full implementation,
    // you'd analyze the squad and adjust formation/strategy accordingly

    const squad = club.players;
    const formation = club.formations?.[0];
    const strategy = club.strategies?.[0];

    if (!formation || !strategy) return;

    // Simple tactic adjustment based on squad strength
    const avgSkill = squad.reduce((sum: number, p: any) => sum + p.skill, 0) / squad.length;

    if (avgSkill > 80) {
        // Strong squad - more attacking
        await prisma.clubStrategy.update({
            where: { id: strategy.id },
            data: {
                approach: 'attacking',
                defensiveStyle: 'high_line',
                attackingStyle: 'build_up'
            }
        });
    } else if (avgSkill < 70) {
        // Weak squad - more defensive
        await prisma.clubStrategy.update({
            where: { id: strategy.id },
            data: {
                approach: 'defensive',
                defensiveStyle: 'low_block',
                attackingStyle: 'counter'
            }
        });
    }
}

/**
 * Monitor finances and regulatory status
 */
async function monitorFinancesAndRegulations(club: any) {
    const finances = club.finances[0];
    if (!finances) return;

    // Check if club is in financial trouble
    if (finances.balance < 0) {
        console.log(`${club.name} is in financial trouble (balance: €${finances.balance.toLocaleString()})`);

        // Try to get emergency funding
        await requestEmergencyFunding(club);
    }

    // Check wage budget compliance
    const totalWages = club.players.reduce((sum: number, p: any) => sum + p.wage, 0);
    if (totalWages > finances.wageBudget) {
        console.log(`${club.name} is over wage budget`);

        // Try to sell high-wage players
        await sellHighWagePlayers(club, totalWages - finances.wageBudget);
    }
}

/**
 * Request emergency funding
 */
async function requestEmergencyFunding(club: any) {
    // In a full implementation, this would create government bailout requests
    // or investor offers for emergency funding
    console.log(`${club.name} is requesting emergency funding`);
}

/**
 * Sell high-wage players to balance budget
 */
async function sellHighWagePlayers(club: any, excessWages: number) {
    const highWagePlayers = club.players
        .filter((p: any) => p.wage > 20000) // High wage threshold
        .sort((a: any, b: any) => b.wage - a.wage);

    for (const player of highWagePlayers) {
        if (excessWages <= 0) break;

        try {
            await prisma.transfer.create({
                data: {
                    playerId: player.id,
                    fromClubId: club.id,
                    toClubId: club.id, // Self-reference for listing
                    fee: player.skill * 50000, // Reduced price for quick sale
                    status: 'pending',
                    date: new Date()
                }
            });

            excessWages -= player.wage;
            console.log(`${club.name} listed high-wage player ${player.name} for quick sale`);
        } catch (error) {
            console.error(`Error listing high-wage player:`, error);
        }
    }
}

// Export for manual triggering
export async function triggerAIManagers() {
    console.log('Triggering AI managers for all clubs...');
    await runAIManagersForAllClubs();
    console.log('AI managers completed');
} 