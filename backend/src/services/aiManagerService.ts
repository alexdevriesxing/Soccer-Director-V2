import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Main AI Manager Service
 * Runs for all AI-controlled clubs each week/round.
 * Skips the human player's club (assumed club ID 1).
 */
export async function runAIManagersForAllClubs() {
    const clubs = await prisma.club.findMany({
        include: {
            players: true,
            staff: true,
            finances: true
        }
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

            // 3. Adjust tactics (simplified)
            await adjustTacticsAndLineups(club);

            // 4. Monitor finances
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
    const finances = club.finances;

    if (!finances) return null;

    const positionAnalysis = analyzeSquadByPosition(squad);
    const needs = identifySquadNeeds(positionAnalysis);
    const surpluses = identifySquadSurpluses(positionAnalysis);

    const availableBudget = Math.min(finances.transferBudget || 0, (finances.balance || 0) * 0.8);
    const availableWageBudget = (finances.wageBudget || 0) * 0.9;

    const transferTargets = await findTransferTargets(club, needs, availableBudget);
    const loanTargets = await findLoanTargets(club, needs, availableWageBudget);
    const playersForSale = identifyPlayersForSale(surpluses, squad);
    const playersForLoan = identifyPlayersForLoan(squad);

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

function analyzeSquadByPosition(squad: any[]) {
    const positions = ['GK', 'LB', 'CB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
    const analysis: any = {};

    positions.forEach(pos => {
        const players = squad.filter(p => p.position === pos);
        analysis[pos] = {
            count: players.length,
            averageAge: players.length > 0 ? players.reduce((sum, p) => sum + (p.age || 25), 0) / players.length : 0,
            averageSkill: players.length > 0 ? players.reduce((sum, p) => sum + (p.currentAbility || 50), 0) / players.length : 0,
            players: players,
            contractsExpiring: players.filter(p => {
                if (!p.contractEnd) return false;
                const expiryDate = new Date(p.contractEnd);
                const now = new Date();
                const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
                return monthsUntilExpiry <= 6;
            }).length
        };
    });

    return analysis;
}

function identifySquadNeeds(analysis: any) {
    const needs: any[] = [];
    const minPlayersPerPosition: Record<string, number> = {
        'GK': 2, 'LB': 1, 'CB': 2, 'RB': 1, 'DM': 1, 'CM': 2, 'AM': 1, 'LW': 1, 'RW': 1, 'ST': 2
    };

    Object.entries(analysis).forEach(([position, data]: [string, any]) => {
        const minRequired = minPlayersPerPosition[position] || 1;

        if (data.count < minRequired) {
            needs.push({
                position,
                priority: 'high',
                reason: 'insufficient_depth',
                count: minRequired - data.count
            });
        }

        if (data.count >= minRequired && data.averageSkill < 70) {
            needs.push({
                position,
                priority: 'medium',
                reason: 'low_quality',
                count: 1
            });
        }

        if (data.count >= minRequired && data.averageAge > 30) {
            needs.push({
                position,
                priority: 'medium',
                reason: 'aging_squad',
                count: 1
            });
        }

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

function identifySquadSurpluses(analysis: any) {
    const surpluses: any[] = [];
    const maxPlayersPerPosition: Record<string, number> = {
        'GK': 3, 'LB': 2, 'CB': 4, 'RB': 2, 'DM': 2, 'CM': 4, 'AM': 2, 'LW': 2, 'RW': 2, 'ST': 3
    };

    Object.entries(analysis).forEach(([position, data]: [string, any]) => {
        const maxAllowed = maxPlayersPerPosition[position] || 2;

        if (data.count > maxAllowed) {
            const surplusPlayers = data.players
                .sort((a: any, b: any) => {
                    const scoreA = (100 - (a.currentAbility || 50)) + ((a.age || 25) * 2) + (100 - (a.morale || 50));
                    const scoreB = (100 - (b.currentAbility || 50)) + ((b.age || 25) * 2) + (100 - (b.morale || 50));
                    return scoreB - scoreA;
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

async function findTransferTargets(club: any, needs: any[], availableBudget: number) {
    const targets: any[] = [];

    for (const need of needs) {
        if (need.reason === 'insufficient_depth' || need.reason === 'low_quality') {
            const otherClubs = await prisma.club.findMany({
                where: { id: { not: club.id } },
                include: { players: true }
            });

            for (const otherClub of otherClubs) {
                const suitablePlayers = otherClub.players.filter((p: any) => {
                    if (p.position !== need.position) return false;
                    const ability = p.currentAbility || 50;
                    if (need.reason === 'low_quality' && ability < 75) return false;
                    if (need.reason === 'insufficient_depth' && ability < 65) return false;
                    if ((p.age || 25) > 32) return false;
                    return true;
                });

                for (const player of suitablePlayers.slice(0, 2)) {
                    const estimatedValue = (player.currentAbility || 50) * 100000;
                    if (estimatedValue <= availableBudget) {
                        targets.push({
                            player,
                            estimatedValue,
                            amount: estimatedValue * (0.8 + Math.random() * 0.4),
                            priority: need.priority,
                            reason: need.reason
                        });
                    }
                }
            }
        }
    }

    return targets.sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return a.estimatedValue - b.estimatedValue;
    }).slice(0, 5);
}

async function findLoanTargets(club: any, needs: any[], _availableWageBudget: number) {
    const targets: any[] = [];

    for (const need of needs) {
        if (need.reason === 'insufficient_depth') {
            const otherClubs = await prisma.club.findMany({
                where: { id: { not: club.id } },
                include: { players: true }
            });

            for (const otherClub of otherClubs) {
                const youngPlayers = otherClub.players.filter((p: any) => {
                    if (p.position !== need.position) return false;
                    if ((p.age || 25) > 23) return false;
                    if ((p.currentAbility || 50) < 60) return false;
                    return true;
                });

                for (const player of youngPlayers.slice(0, 1)) {
                    targets.push({
                        player,
                        loanFee: (player.currentAbility || 50) * 1000,
                        priority: need.priority,
                        reason: need.reason
                    });
                }
            }
        }
    }

    return targets.slice(0, 3);
}

function identifyPlayersForSale(surpluses: any[], squad: any[]) {
    const playersForSale: any[] = [];

    surpluses.forEach(surplus => {
        surplus.players.forEach((player: any) => {
            const expiryDate = player.contractEnd ? new Date(player.contractEnd) : new Date();
            const now = new Date();
            const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

            if (monthsUntilExpiry > 6) {
                playersForSale.push({
                    player,
                    askingPrice: (player.currentAbility || 50) * 80000,
                    reason: 'surplus'
                });
            }
        });
    });

    // Also consider selling unhappy or aging players
    squad.forEach(player => {
        if ((player.morale || 50) < 60 || (player.age || 25) > 32) {
            playersForSale.push({
                player,
                askingPrice: (player.currentAbility || 50) * 60000,
                reason: (player.morale || 50) < 60 ? 'unhappy' : 'aging'
            });
        }
    });

    return playersForSale;
}

function identifyPlayersForLoan(squad: any[]) {
    const playersForLoan: any[] = [];

    squad.forEach(player => {
        if ((player.age || 25) <= 21 && (player.currentAbility || 50) < 70) {
            playersForLoan.push({
                player,
                loanFee: (player.currentAbility || 50) * 500,
                reason: 'development'
            });
        }
    });

    return playersForLoan;
}

async function executeTransferActivities(club: any, transferPlan: any) {
    // Make transfer offers using TransferOffer model
    for (const target of transferPlan.transferTargets.slice(0, 2)) {
        await makeTransferOffer(club, target);
    }

    // Make loan offers
    for (const target of transferPlan.loanTargets.slice(0, 1)) {
        await makeLoanOffer(club, target);
    }

    // List players for sale
    await listPlayersForSale(club, transferPlan.playersForSale);

    // Respond to incoming offers
    await respondToIncomingOffers(club);
}

async function makeTransferOffer(club: any, target: any) {
    try {
        // Check if there's already an offer for this player
        const existingOffer = await prisma.transferOffer.findFirst({
            where: {
                playerId: target.playerIdid,
                status: 'pending'
            }
        });

        const playerName = `${target.playerIdfirstName} ${target.playerIdlastName}`;

        if (existingOffer) {
            if (target.amount > existingOffer.amount) {
                await prisma.transferOffer.update({
                    where: { id: existingOffer.id },
                    data: {
                        amount: target.amount,
                        fromClubId: club.id,
                        status: 'pending'
                    }
                });
                console.log(`${club.name} made a counter-offer of €${target.amount.toLocaleString()} for ${playerName}`);
            }
        } else {
            await prisma.transferOffer.create({
                data: {
                    playerId: target.playerIdid,
                    fromClubId: club.id,
                    toClubId: target.playerIdcurrentClubId || club.id,
                    amount: target.amount,
                    status: 'pending'
                }
            });
            console.log(`${club.name} made an offer of €${target.amount.toLocaleString()} for ${playerName}`);
        }
    } catch (error) {
        console.error(`Error making transfer offer:`, error);
    }
}

async function makeLoanOffer(club: any, target: any) {
    try {
        const existingLoan = await prisma.loan.findFirst({
            where: {
                playerId: target.player.id,
                status: 'active'
            }
        });

        if (!existingLoan) {
            // Loan creation - matching schema (no fee/wage fields in Loan model)
            await prisma.loan.create({
                data: {
                    playerId: target.player.id,
                    fromClubId: target.player.currentClubId || club.id,
                    toClubId: club.id,
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    status: 'active'
                }
            });
            const playerName = `${target.player.firstName} ${target.player.lastName}`;
            console.log(`${club.name} made a loan offer for ${playerName}`);
        }
    } catch (error) {
        console.error(`Error making loan offer:`, error);
    }
}

async function listPlayersForSale(club: any, playersForSale: any[]) {
    for (const listing of playersForSale.slice(0, 2)) {
        try {
            // Check if already listed via TransferListing
            const existingListing = await prisma.transferListing.findFirst({
                where: {
                    playerId: listing.playerIdid,
                    status: 'active'
                }
            });

            if (!existingListing) {
                await prisma.transferListing.create({
                    data: {
                        playerId: listing.playerIdid,
                        clubId: club.id,
                        askingPrice: listing.askingPrice,
                        listingType: 'sale',
                        status: 'active'
                    }
                });
                const playerName = `${listing.playerIdfirstName} ${listing.playerIdlastName}`;
                console.log(`${club.name} listed ${playerName} for sale at €${listing.askingPrice.toLocaleString()}`);
            }
        } catch (error) {
            console.error(`Error listing player for sale:`, error);
        }
    }
}

async function respondToIncomingOffers(club: any) {
    try {
        // Get incoming transfer offers
        const incomingOffers = await prisma.transferOffer.findMany({
            where: {
                toClubId: club.id,
                status: 'pending'
            },
            include: {
                player: true
            }
        });

        for (const offer of incomingOffers) {
            const player = offer.player;
            const amount = offer.amount;
            const playerValue = (player.currentAbility || 50) * 100000;
            const playerName = `${player.firstName} ${player.lastName}`;

            let decision = 'reject';

            if (amount >= playerValue * 1.2) {
                decision = 'accept';
            } else if (amount >= playerValue * 0.9) {
                const positionPlayers = club.players.filter((p: any) => p.position === player.position);
                if (positionPlayers.length > 2) {
                    decision = 'accept';
                } else {
                    decision = 'negotiate';
                }
            }

            if (decision === 'accept') {
                await prisma.transferOffer.update({
                    where: { id: offer.id },
                    data: { status: 'accepted' }
                });
                console.log(`${club.name} accepted €${amount.toLocaleString()} offer for ${playerName}`);
            } else if (decision === 'negotiate') {
                const counterOffer = Math.min(amount * 1.15, playerValue * 1.1);
                await prisma.transferOffer.update({
                    where: { id: offer.id },
                    data: { amount: counterOffer }
                });
                console.log(`${club.name} countered with €${counterOffer.toLocaleString()} for ${playerName}`);
            } else {
                await prisma.transferOffer.update({
                    where: { id: offer.id },
                    data: { status: 'rejected' }
                });
                console.log(`${club.name} rejected €${amount.toLocaleString()} offer for ${playerName}`);
            }
        }
    } catch (error) {
        console.error(`Error responding to incoming offers:`, error);
    }
}

async function adjustTacticsAndLineups(_club: any) {
    // Tactics adjustment is stubbed - clubStrategy model doesn't exist in schema
    // In a full implementation, this would update club formation and playing style
    console.log('Tactics adjustment - feature coming soon');
}

async function monitorFinancesAndRegulations(club: any) {
    const finances = club.finances;
    if (!finances) return;

    if ((finances.balance || 0) < 0) {
        console.log(`${club.name} is in financial trouble (balance: €${(finances.balance || 0).toLocaleString()})`);
        await requestEmergencyFunding(club);
    }

    const totalWages = club.players.reduce((sum: number, p: any) => sum + (p.weeklyWage || 0), 0);
    if (totalWages > (finances.wageBudget || 0)) {
        console.log(`${club.name} is over wage budget`);
        await sellHighWagePlayers(club, totalWages - (finances.wageBudget || 0));
    }
}

async function requestEmergencyFunding(club: any) {
    console.log(`${club.name} is requesting emergency funding`);
}

async function sellHighWagePlayers(club: any, excessWages: number) {
    const highWagePlayers = club.players
        .filter((p: any) => (p.weeklyWage || 0) > 20000)
        .sort((a: any, b: any) => (b.weeklyWage || 0) - (a.weeklyWage || 0));

    for (const player of highWagePlayers) {
        if (excessWages <= 0) break;

        try {
            await prisma.transferListing.create({
                data: {
                    playerId: player.id,
                    clubId: club.id,
                    askingPrice: (player.currentAbility || 50) * 50000,
                    listingType: 'sale',
                    status: 'active'
                }
            });

            excessWages -= (player.weeklyWage || 0);
            const playerName = `${player.firstName} ${player.lastName}`;
            console.log(`${club.name} listed high-wage player ${playerName} for quick sale`);
        } catch (error) {
            console.error(`Error listing high-wage player:`, error);
        }
    }
}

export async function triggerAIManagers() {
    console.log('Triggering AI managers for all clubs...');
    await runAIManagersForAllClubs();
    console.log('AI managers completed');
}