import TransferService from './transferService';
import { PrismaClient } from '@prisma/client';
// Import Jest globals for type support
import '@jest/globals';

const prisma = new PrismaClient();

let testLeague: any;
let fromClub: any;
let toClub: any;
let testPlayer: any;

beforeEach(async () => {
  // Full teardown order to avoid FK constraint errors
  await prisma.vARDecisions?.deleteMany?.({});
  await prisma.realTimeTacticalChanges?.deleteMany?.({});
  await prisma.weather?.deleteMany?.({});
  await prisma.pitchConditions?.deleteMany?.({});
  await prisma.playerPosition?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.fanGroup?.deleteMany?.({});
  await prisma.fanEvent?.deleteMany?.({});
  await prisma.fanSentiment?.deleteMany?.({});
  await prisma.squadRegistration?.deleteMany?.({});
  await prisma.tacticalFamiliarity?.deleteMany?.({});
  await prisma.boardMember?.deleteMany?.({});
  await prisma.boardMeeting?.deleteMany?.({});
  await prisma.fanProtests?.deleteMany?.({});
  await prisma.clubLegends?.deleteMany?.({});
  await prisma.playerCareerStat?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.playerMoraleLog?.deleteMany?.({});
  await prisma.playerMentorship?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerInstructions?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  // Always create a new league, two clubs, and a player for each test
  testLeague = await prisma.league.create({
    data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
  });
  fromClub = await prisma.club.create({
    data: { name: 'From Club', leagueId: testLeague.id, isJongTeam: false }
  });
  toClub = await prisma.club.create({
    data: { name: 'To Club', leagueId: testLeague.id, isJongTeam: false }
  });
  testPlayer = await prisma.player.create({
    data: { name: 'Test Player', clubId: fromClub.id, position: 'MID', age: 22, skill: 70, nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 70, contractStart: new Date() }
  });
});

afterEach(async () => {
  // Robust teardown for all player, club, and league children
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerPersonalStory?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.releaseClauses?.deleteMany?.({});
  await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
  await prisma.playerContractBonus?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.playerInstructions?.deleteMany?.({});
  await prisma.playerMoraleLog?.deleteMany?.({});
  await prisma.playerMentorship?.deleteMany?.({});
  await prisma.playerCareerGoals?.deleteMany?.({});
  await prisma.playerEndorsements?.deleteMany?.({});
  await prisma.youthNews?.deleteMany?.({});
  await prisma.offFieldEvent?.deleteMany?.({});
  await prisma.pressureHandling?.deleteMany?.({});
  await prisma.leadershipQualities?.deleteMany?.({});
  await prisma.careerAmbitions?.deleteMany?.({});
  await prisma.playerFatigue?.deleteMany?.({});
  await prisma.injuryRisk?.deleteMany?.({});
  await prisma.playerPsychology?.deleteMany?.({});
  await prisma.homesickness?.deleteMany?.({});
  await prisma.startingXISlot?.deleteMany?.({});
  await prisma.liveMatchEvent?.deleteMany?.({});
  await prisma.contractNegotiation?.deleteMany?.({});
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  // Now delete players, clubs, leagues
  await prisma.player.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.league.deleteMany({});
});

describe('TransferService Loan Logic', () => {
  let fromClub: any;
  let toClub: any;
  let league: any;

  beforeEach(async () => {
    // Robust teardown for all player, club, and league children
    await prisma.playerTrait?.deleteMany?.({});
    await prisma.playerInjury?.deleteMany?.({});
    await prisma.playerAward?.deleteMany?.({});
    await prisma.playerRequest?.deleteMany?.({});
    await prisma.playerRelationship?.deleteMany?.({});
    await prisma.playerPersonalStory?.deleteMany?.({});
    await prisma.playerHabit?.deleteMany?.({});
    await prisma.playerMediaEvent?.deleteMany?.({});
    await prisma.releaseClauses?.deleteMany?.({});
    await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
    await prisma.playerContractBonus?.deleteMany?.({});
    await prisma.setPieceSpecialists?.deleteMany?.({});
    await prisma.playerInstructions?.deleteMany?.({});
    await prisma.playerMoraleLog?.deleteMany?.({});
    await prisma.playerMentorship?.deleteMany?.({});
    await prisma.playerCareerGoals?.deleteMany?.({});
    await prisma.playerEndorsements?.deleteMany?.({});
    await prisma.youthNews?.deleteMany?.({});
    await prisma.offFieldEvent?.deleteMany?.({});
    await prisma.pressureHandling?.deleteMany?.({});
    await prisma.leadershipQualities?.deleteMany?.({});
    await prisma.careerAmbitions?.deleteMany?.({});
    await prisma.playerFatigue?.deleteMany?.({});
    await prisma.injuryRisk?.deleteMany?.({});
    await prisma.playerPsychology?.deleteMany?.({});
    await prisma.homesickness?.deleteMany?.({});
    await prisma.startingXISlot?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.contractNegotiation?.deleteMany?.({});
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    // Now delete players, clubs, leagues
    await prisma.player?.deleteMany?.({});
    await prisma.club?.deleteMany?.({});
    await prisma.league?.deleteMany?.({});
    // --- Robust test data creation ---
    league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    fromClub = await prisma.club.create({ data: { name: 'Test From Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
    toClub = await prisma.club.create({ data: { name: 'Test To Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
  });

  afterAll(async () => {
    await prisma.trainingFocus.deleteMany({});
    await prisma.staffContract?.deleteMany?.({});
    await prisma.staff?.deleteMany?.({});
    await prisma.clubFormation?.deleteMany?.({});
    await prisma.clubStrategy?.deleteMany?.({});
    await prisma.facility?.deleteMany?.({});
    await prisma.academyFacility?.deleteMany?.({});
    await prisma.youthScout?.deleteMany?.({});
    await prisma.squadRegistration?.deleteMany?.({});
    await prisma.fixture?.deleteMany?.({});
    await prisma.clubFinances?.deleteMany?.({});
    await prisma.sponsorship?.deleteMany?.({});
    await prisma.boardMember?.deleteMany?.({});
    await prisma.loan.deleteMany({});
    await prisma.transfer.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gateReceipt?.deleteMany?.({});
    await prisma.clubSeasonStats?.deleteMany?.({});
    await prisma.matchEvent?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.$disconnect();
  });

  it('creates a loan offer successfully', async () => {
    const league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const fromClub = await prisma.club.create({ data: {
      name: 'Test From Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const toClub = await prisma.club.create({ data: {
      name: 'Test To Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
    const loan = await TransferService.createLoanOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      duration: 4,
      fee: 1000
    });
    expect(loan).toBeDefined();
    expect(loan.playerId).toBe(player.id);
    expect(loan.fromClubId).toBe(fromClub.id);
    expect(loan.toClubId).toBe(toClub.id);
    expect(loan.status).toBe('pending');
  });

  it('rejects loan if player does not belong to fromClub', async () => {
    const league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const fromClub = await prisma.club.create({ data: {
      name: 'Test From Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const toClub = await prisma.club.create({ data: {
      name: 'Test To Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
    await expect(
      TransferService.createLoanOffer({
        fromClubId: toClub.id,
        toClubId: fromClub.id,
        playerId: player.id,
        duration: 4,
        fee: 1000
      })
    ).rejects.toThrow('Player does not belong to the lending club');
  });

  it('can accept and execute a loan offer', async () => {
    const league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const fromClub = await prisma.club.create({ data: {
      name: 'Test From Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const toClub = await prisma.club.create({ data: {
      name: 'Test To Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
    const loan = await TransferService.createLoanOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      duration: 4,
      fee: 1000
    });
    const accepted = await TransferService.respondToLoanOffer(loan.id, 'accepted');
    expect(accepted.status).toBe('active');
    const updatedPlayer = await prisma.player.findUnique({ where: { id: player.id } });
    expect(updatedPlayer?.clubId).toBe(toClub.id);
  });

  it('can recall a player from loan', async () => {
    const league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const fromClub = await prisma.club.create({ data: {
      name: 'Test From Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const toClub = await prisma.club.create({ data: {
      name: 'Test To Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
    let loan = await TransferService.createLoanOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      duration: 4,
      fee: 1000
    });
    await TransferService.respondToLoanOffer(loan.id, 'accepted');
    // Recall
    let recalled = await TransferService.recallPlayer(loan.id);
    expect(recalled.status).toBe('ended');
    let updatedPlayer = await prisma.player.findUnique({ where: { id: player.id } });
    expect(updatedPlayer?.clubId).toBe(fromClub.id);
  });

  it('can create a new loan after recall', async () => {
    const league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const fromClub = await prisma.club.create({ data: {
      name: 'Test From Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const toClub = await prisma.club.create({ data: {
      name: 'Test To Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
    // Accept and recall a loan
    let loan = await TransferService.createLoanOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      duration: 4,
      fee: 1000
    });
    await TransferService.respondToLoanOffer(loan.id, 'accepted');
    await TransferService.recallPlayer(loan.id);
    // Ensure player is at fromClub
    let updatedPlayer = await prisma.player.findUnique({ where: { id: player.id } });
    if (updatedPlayer?.clubId !== fromClub.id) {
      await prisma.player.update({ where: { id: player.id }, data: { clubId: fromClub.id } });
    }
    // Create a new loan
    loan = await TransferService.createLoanOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      duration: 4,
      fee: 1000
    });
    expect(loan).toBeDefined();
    expect(loan.playerId).toBe(player.id);
    expect(loan.fromClubId).toBe(fromClub.id);
    expect(loan.toClubId).toBe(toClub.id);
    expect(loan.status).toBe('pending');
  });

  it('throws error for invalid loanId', async () => {
    await expect(TransferService.respondToLoanOffer(999999, 'accepted')).rejects.toThrow('Loan offer not found');
  });
});

describe('TransferService Transfer Logic', () => {
  let fromClub: any;
  let toClub: any;
  let league: any;

  beforeEach(async () => {
    // Robust teardown for all player, club, and league children
    await prisma.playerTrait?.deleteMany?.({});
    await prisma.playerInjury?.deleteMany?.({});
    await prisma.playerAward?.deleteMany?.({});
    await prisma.playerRequest?.deleteMany?.({});
    await prisma.playerRelationship?.deleteMany?.({});
    await prisma.playerPersonalStory?.deleteMany?.({});
    await prisma.playerHabit?.deleteMany?.({});
    await prisma.playerMediaEvent?.deleteMany?.({});
    await prisma.releaseClauses?.deleteMany?.({});
    await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
    await prisma.playerContractBonus?.deleteMany?.({});
    await prisma.setPieceSpecialists?.deleteMany?.({});
    await prisma.playerInstructions?.deleteMany?.({});
    await prisma.playerMoraleLog?.deleteMany?.({});
    await prisma.playerMentorship?.deleteMany?.({});
    await prisma.playerCareerGoals?.deleteMany?.({});
    await prisma.playerEndorsements?.deleteMany?.({});
    await prisma.youthNews?.deleteMany?.({});
    await prisma.offFieldEvent?.deleteMany?.({});
    await prisma.pressureHandling?.deleteMany?.({});
    await prisma.leadershipQualities?.deleteMany?.({});
    await prisma.careerAmbitions?.deleteMany?.({});
    await prisma.playerFatigue?.deleteMany?.({});
    await prisma.injuryRisk?.deleteMany?.({});
    await prisma.playerPsychology?.deleteMany?.({});
    await prisma.homesickness?.deleteMany?.({});
    await prisma.startingXISlot?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.contractNegotiation?.deleteMany?.({});
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    // Now delete players, clubs, leagues
    await prisma.player?.deleteMany?.({});
    await prisma.club?.deleteMany?.({});
    await prisma.league?.deleteMany?.({});
    // --- Robust test data creation ---
    league = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    fromClub = await prisma.club.create({ data: { name: 'Transfer From Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
    toClub = await prisma.club.create({ data: { name: 'Transfer To Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
  });

  afterAll(async () => {
    await prisma.transfer.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.transfer.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.playerAward?.deleteMany?.({});
    await prisma.playerCareerStat?.deleteMany?.({});
    await prisma.clubSeasonStats?.deleteMany?.({});
    await prisma.playerRequest?.deleteMany?.({});
    await prisma.contractNegotiation?.deleteMany?.({});
    await prisma.playerContractBonus?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.playerMentorship?.deleteMany?.({});
    await prisma.playerRelationship?.deleteMany?.({});
    await prisma.startingXISlot?.deleteMany?.({});
    await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
    await prisma.playerTrait?.deleteMany?.({});
    await prisma.playerInjury?.deleteMany?.({});
    await prisma.playerHabit?.deleteMany?.({});
    await prisma.playerMediaEvent?.deleteMany?.({});
    await prisma.playerMoraleLog?.deleteMany?.({});
    await prisma.playerCareerGoals?.deleteMany?.({});
    await prisma.releaseClauses?.deleteMany?.({});
    await prisma.setPieceSpecialists?.deleteMany?.({});
    await prisma.playerFatigue?.deleteMany?.({});
    await prisma.vARDecisions?.deleteMany?.({});
    await prisma.realTimeTacticalChanges?.deleteMany?.({});
    await prisma.weather?.deleteMany?.({});
    await prisma.pitchConditions?.deleteMany?.({});
    await prisma.injuryRisk?.deleteMany?.({});
    await prisma.playerPsychology?.deleteMany?.({});
    await prisma.homesickness?.deleteMany?.({});
    await prisma.clubLegends?.deleteMany?.({});
    await prisma.playerEndorsements?.deleteMany?.({});
    await prisma.playerInstructions?.deleteMany?.({});
    await prisma.youthPlayerPersonalities?.deleteMany?.({});
    await prisma.graduationEvents?.deleteMany?.({});
    await prisma.socialMedia?.deleteMany?.({});
    await prisma.transferRumors?.deleteMany?.({});
    await prisma.newsItem?.deleteMany?.({});
    await prisma.managerDecision?.deleteMany?.({});
    await prisma.offFieldEvent?.deleteMany?.({});
    await prisma.playerPosition?.deleteMany?.({});
    await prisma.nFTPlayerCards?.deleteMany?.({});
    await prisma.scoutingReports?.deleteMany?.({});
    await prisma.hiddenGems?.deleteMany?.({});
    await prisma.personalRelationships?.deleteMany?.({});
  });

  it('creates a transfer offer successfully', async () => {
    const player = await prisma.player.create({ data: { name: 'Transfer Player', clubId: fromClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
    const transfer = await TransferService.createTransferOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      fee: 50000
    });
    expect(transfer).toBeDefined();
    expect(transfer.playerId).toBe(player.id);
    expect(transfer.fromClubId).toBe(fromClub.id);
    expect(transfer.toClubId).toBe(toClub.id);
    expect(transfer.status).toBe('pending');
  });

  it('rejects transfer if player does not belong to fromClub', async () => {
    const player = await prisma.player.create({ data: { name: 'Transfer Player', clubId: toClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
    await expect(
      TransferService.createTransferOffer({
        fromClubId: fromClub.id,
        toClubId: toClub.id,
        playerId: player.id,
        fee: 50000
      })
    ).rejects.toThrow('Player does not belong to the selling club');
  });

  it('can accept and execute a transfer', async () => {
    const player = await prisma.player.create({ data: { name: 'Transfer Player', clubId: fromClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
    const transfer = await TransferService.createTransferOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      fee: 50000
    });
    const accepted = await TransferService.respondToTransferOffer(transfer.id, 'accepted', null);
    expect(accepted.status).toBe('completed');
    const updatedPlayer = await prisma.player.findUnique({ where: { id: player.id } });
    expect(updatedPlayer?.clubId).toBe(toClub.id);
  });

  it('throws error for invalid transferId', async () => {
    await expect(TransferService.respondToTransferOffer(999999, 'accepted', null)).rejects.toThrow('Transfer offer not found');
  });

  it('throws error for already transferred player', async () => {
    const player = await prisma.player.create({ data: { name: 'Transfer Player', clubId: fromClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
    const transfer = await TransferService.createTransferOffer({
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      playerId: player.id,
      fee: 50000
    });
    await TransferService.respondToTransferOffer(transfer.id, 'accepted', null);
    await expect(
      TransferService.createTransferOffer({
        fromClubId: fromClub.id,
        toClubId: toClub.id,
        playerId: player.id,
        fee: 50000
      })
    ).rejects.toThrow();
  });

  it('throws error for missing/invalid club or player', async () => {
    await expect(
      TransferService.createTransferOffer({
        fromClubId: 999999,
        toClubId: toClub.id,
        playerId: 999999,
        fee: 50000
      })
    ).rejects.toThrow();
  });
}); 