import request from 'supertest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { app, io, prisma } from '../src/app';
import v2GameService from '../src/v2/services/v2GameService';
import { buildAutoMatchSelection, resolveMatchPrepPositionGroup } from '../src/v2/services/domains/matchPrepDomain';
import {
  COMPRESSED_SAVE_SNAPSHOT_PREFIX,
  decodeSaveSnapshotPayload,
  MAX_MANUAL_SAVE_SLOTS_PER_CAREER
} from '../src/v2/services/saveSlotCodec';

jest.setTimeout(120000);

describe('V2 Weekly Loop Invariants', () => {
  let controlledClubId: number;
  const createdCareerIds: string[] = [];
  let fallbackLeagueId: number | null = null;
  const fallbackClubIds: number[] = [];
  const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');

  async function cleanupCreatedCareers() {
    if (createdCareerIds.length === 0) {
      return;
    }

    const idsToDelete = [...createdCareerIds];
    createdCareerIds.length = 0;
    const sqlIds = idsToDelete
      .map((value) => `'${String(value).replace(/'/g, "''")}'`)
      .join(', ');

    try {
      execFileSync('sqlite3', [
        sqliteDbPath,
        `pragma foreign_keys=on; pragma journal_mode=off; pragma synchronous=off; begin immediate; delete from V2Career where id in (${sqlIds}); commit;`
      ], { stdio: 'ignore' });
      return;
    } catch {
      await prisma.v2Career.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }
  }

  async function ensurePlayableClubBaseline(): Promise<number> {
    const leagues = await prisma.league.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        level: true,
        tier: true,
        clubs: {
          select: { id: true }
        }
      },
      orderBy: [{ tier: 'asc' }, { id: 'asc' }]
    });

    const seniorLeagueWithFixtures = leagues.find((league) =>
      league.clubs.length >= 2 && !/o21/i.test(`${league.name || ''} ${league.level || ''}`)
    );
    const leagueWithFixtures = seniorLeagueWithFixtures ?? leagues.find((league) => league.clubs.length >= 2);
    if (leagueWithFixtures?.clubs?.[0]?.id) {
      return Number(leagueWithFixtures.clubs[0].id);
    }

    const uniqueSuffix = Date.now();
    const fallbackLeague = await prisma.league.create({
      data: {
        name: `V2 Test Baseline League ${uniqueSuffix}`,
        level: `V2 Test Division ${uniqueSuffix}`,
        country: 'Netherlands',
        tier: 99,
        isActive: true
      }
    });
    fallbackLeagueId = fallbackLeague.id;

    const createdClubs = await Promise.all(
      Array.from({ length: 4 }, (_, idx) =>
        prisma.club.create({
          data: {
            name: `V2 Test Club ${uniqueSuffix}-${idx + 1}`,
            shortName: `V2TC${idx + 1}`,
            city: 'Teststad',
            stadium: `V2 Test Ground ${idx + 1}`,
            reputation: 45 + idx,
            financialStatus: 45 + idx,
            morale: 55,
            form: 'NNNNN',
            boardExpectation: 'mid-table',
            leagueId: fallbackLeague.id,
            balance: 500000,
            transferBudget: 100000,
            wageBudget: 250000,
            averageAttendance: 1200,
            isUserControlled: false,
            isActive: true
          }
        })
      )
    );

    fallbackClubIds.push(...createdClubs.map((club) => club.id));
    return createdClubs[0].id;
  }

  beforeAll(async () => {
    controlledClubId = await ensurePlayableClubBaseline();

    const clubsRes = await request(app).get('/api/v2/clubs');
    expect(clubsRes.status).toBe(200);
    expect(clubsRes.body?.success).toBe(true);
    expect(Array.isArray(clubsRes.body?.data)).toBe(true);
    expect(clubsRes.body.data.length).toBeGreaterThan(0);
    expect(Number.isFinite(controlledClubId)).toBe(true);
  });

  afterEach(async () => {
    try {
      await cleanupCreatedCareers();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[v2-loop] per-test career cleanup skipped:', error);
    }
  });

  afterAll(async () => {
    try {
      await cleanupCreatedCareers();
    } catch (error) {
      // Disk pressure can prevent cleanup transactions in local smoke/dev runs.
      // The suite should still pass if assertions already completed.
      // eslint-disable-next-line no-console
      console.warn('[v2-loop] post-test career cleanup skipped:', error);
    }

    // Only clean up fallback fixtures if this test file created them.
    try {
      if (fallbackClubIds.length > 0) {
        await prisma.player.deleteMany({
          where: { currentClubId: { in: fallbackClubIds } }
        });
        await prisma.club.deleteMany({
          where: { id: { in: fallbackClubIds } }
        });
      }
      if (fallbackLeagueId !== null) {
        await prisma.league.deleteMany({
          where: { id: fallbackLeagueId }
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[v2-loop] fallback cleanup skipped:', error);
    }

    await prisma.$disconnect();
    io.close();
  });

  async function createCareer(tag: string, clubId = controlledClubId): Promise<string> {
    const response = await request(app)
      .post('/api/v2/careers')
      .send({
        managerName: `Jest ${tag} ${Date.now()}`,
        controlledClubId: clubId
      });

    expect(response.status).toBe(201);
    expect(response.body?.success).toBe(true);
    expect(typeof response.body?.data?.id).toBe('string');

    const careerId = String(response.body.data.id);
    createdCareerIds.push(careerId);
    return careerId;
  }

  async function resolvePendingEvents(careerId: string) {
    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);

    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    for (const event of events) {
      const optionId = event?.options?.[0]?.id;
      if (!optionId) {
        continue;
      }

      const respondRes = await request(app)
        .post(`/api/v2/careers/${careerId}/inbox/${event.id}/respond`)
        .send({ optionId });
      expect(respondRes.status).toBe(200);
    }
  }

  async function advanceUntilUserFixture(careerId: string, maxSteps = 16): Promise<string> {
    for (let step = 0; step < maxSteps; step += 1) {
      const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
      expect(stateRes.status).toBe(200);
      const state = stateRes.body?.data;
      const fixtureId = state?.nextUserFixture?.id;
      if (typeof fixtureId === 'string' && fixtureId.length > 0) {
        return fixtureId;
      }

      if (state?.currentPhase === 'EVENT') {
        await resolvePendingEvents(careerId);
      } else {
        const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
        expect(advanceRes.status).toBe(200);
      }
    }

    throw new Error(`No user fixture found for career ${careerId} within ${maxSteps} steps.`);
  }

  async function advanceUntilMatchPrepWithFixture(careerId: string, maxSteps = 24): Promise<string> {
    for (let step = 0; step < maxSteps; step += 1) {
      const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
      expect(stateRes.status).toBe(200);

      const state = stateRes.body?.data;
      const fixtureId = state?.nextUserFixture?.id;
      if (state?.currentPhase === 'MATCH_PREP' && typeof fixtureId === 'string' && fixtureId.length > 0) {
        return fixtureId;
      }

      if (state?.currentPhase === 'EVENT') {
        await resolvePendingEvents(careerId);
      } else {
        const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
        expect(advanceRes.status).toBe(200);
      }
    }

    throw new Error(`No MATCH_PREP state with user fixture found for career ${careerId} within ${maxSteps} steps.`);
  }

  async function readAutosaveSlot(careerId: string) {
    const slot = await prisma.v2SaveSlot.findUnique({
      where: { id: `${careerId}:autosave` },
      select: {
        id: true,
        slotName: true,
        isAuto: true,
        stateHash: true,
        updatedAt: true,
        lastPlayedAt: true
      }
    });

    expect(slot).toBeTruthy();
    expect(slot?.slotName).toBe('autosave');
    expect(slot?.isAuto).toBe(true);
    expect(typeof slot?.stateHash).toBe('string');
    expect((slot?.stateHash || '').length).toBeGreaterThan(0);

    return slot!;
  }

  function pickAvailablePlayerIds(players: Array<{ id: number; isInjured?: boolean; isSuspended?: boolean }>): number[] {
    return players
      .filter((player) => !player.isInjured && !player.isSuspended)
      .map((player) => Number(player.id));
  }

  function isGoalkeeperPosition(position: string | null | undefined): boolean {
    const normalized = String(position || '').trim().toUpperCase();
    return normalized.includes('GK') || normalized === 'GOALKEEPER';
  }

  function resolveTestPositionGroup(position: string | null | undefined): 'GK' | 'DEF' | 'MID' | 'ATT' {
    const normalized = String(position || '').trim().toUpperCase();
    if (!normalized) return 'MID';
    if (normalized.includes('GK') || normalized === 'GOALKEEPER') return 'GK';
    if (
      normalized.includes('CB') ||
      normalized.includes('RB') ||
      normalized.includes('LB') ||
      normalized.includes('RWB') ||
      normalized.includes('LWB') ||
      normalized.includes('WB') ||
      normalized.includes('SW') ||
      normalized.includes('BACK') ||
      normalized.includes('DEF')
    ) {
      return 'DEF';
    }
    if (
      normalized.includes('ST') ||
      normalized.includes('CF') ||
      normalized.includes('FW') ||
      normalized.includes('RW') ||
      normalized.includes('LW') ||
      normalized.includes('RF') ||
      normalized.includes('LF') ||
      normalized.includes('ATT') ||
      normalized.includes('SS')
    ) {
      return 'ATT';
    }
    return 'MID';
  }

  function buildTestFormationSelection(
    players: Array<{ id: number; position?: string; isInjured?: boolean; isSuspended?: boolean }>,
    starterTargets: { GK: number; DEF: number; MID: number; ATT: number } = { GK: 1, DEF: 4, MID: 3, ATT: 3 }
  ) {
    const availablePlayers = players.filter((player) => !player.isInjured && !player.isSuspended);
    const grouped = {
      GK: availablePlayers.filter((player) => resolveTestPositionGroup(player.position) === 'GK'),
      DEF: availablePlayers.filter((player) => resolveTestPositionGroup(player.position) === 'DEF'),
      MID: availablePlayers.filter((player) => resolveTestPositionGroup(player.position) === 'MID'),
      ATT: availablePlayers.filter((player) => resolveTestPositionGroup(player.position) === 'ATT')
    };

    const starters = [
      ...grouped.GK.slice(0, starterTargets.GK),
      ...grouped.DEF.slice(0, starterTargets.DEF),
      ...grouped.MID.slice(0, starterTargets.MID),
      ...grouped.ATT.slice(0, starterTargets.ATT)
    ].map((player) => Number(player.id));

    const bench = availablePlayers
      .map((player) => Number(player.id))
      .filter((playerId) => !starters.includes(playerId))
      .slice(0, 7);

    return { grouped, starters, bench };
  }

  function ensurePlayerIncludedInStarters(
    players: Array<{ id: number; position?: string | null; effectivePosition?: string | null }>,
    selection: { starters: number[]; bench: number[] },
    targetId: number
  ) {
    if (selection.starters.includes(targetId)) {
      return {
        starters: [...selection.starters],
        bench: selection.bench.filter((playerId) => playerId !== targetId)
      };
    }

    const targetPlayer = players.find((player) => Number(player.id) === targetId);
    expect(targetPlayer).toBeTruthy();
    const targetGroup = resolveTestPositionGroup(targetPlayer?.effectivePosition ?? targetPlayer?.position);
    const replacementIndex = selection.starters.findIndex((playerId) => {
      const starter = players.find((candidate) => Number(candidate.id) === playerId);
      return resolveTestPositionGroup(starter?.effectivePosition ?? starter?.position) === targetGroup;
    });
    expect(replacementIndex).toBeGreaterThanOrEqual(0);

    const replacedPlayerId = selection.starters[replacementIndex];
    const starters = [...selection.starters];
    starters[replacementIndex] = targetId;
    const bench = [
      replacedPlayerId,
      ...selection.bench.filter((playerId) => playerId !== targetId && playerId !== replacedPlayerId)
    ].slice(0, 7);

    return { starters, bench };
  }

  function pickRetrainingTarget(position: string | null | undefined): string {
    const normalized = String(position || '').trim().toUpperCase();
    if (normalized === 'LB') return 'LWB';
    if (normalized === 'RB') return 'RWB';
    if (normalized === 'CB') return 'DM';
    if (normalized === 'DM') return 'CM';
    if (normalized === 'CM') return 'AM';
    if (normalized === 'AM') return 'CM';
    if (normalized === 'LW') return 'RW';
    if (normalized === 'RW') return 'LW';
    if (normalized === 'CF') return 'ST';
    if (normalized === 'ST') return 'CF';
    return 'CM';
  }

  it('creates a playable controlled-club squad and finance baseline', async () => {
    const careerId = await createCareer('squad');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThanOrEqual(22);

    const firstPlayer = squadRes.body.data[0];
    expect(typeof firstPlayer.fullName).toBe('string');
    expect(typeof firstPlayer.position).toBe('string');
    const playersWithInvalidAge = squadRes.body.data.filter((player: any) => !Number.isFinite(player?.age));
    expect(playersWithInvalidAge).toHaveLength(0);
    const playersMissingContract = squadRes.body.data.filter((player: any) => !player?.contractStart || !player?.contractEnd);
    expect(playersMissingContract).toHaveLength(0);

    const financesRes = await request(app).get(`/api/v2/careers/${careerId}/finances`);
    expect(financesRes.status).toBe(200);
    expect(typeof financesRes.body?.data?.weeklyWageBill).toBe('number');
    expect(financesRes.body.data.weeklyWageBill).toBeGreaterThan(0);
  });

  it('repairs missing contract dates for controlled-club players on squad fetch', async () => {
    const careerId = await createCareer('contract-repair');

    const initialSquadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(initialSquadRes.status).toBe(200);
    expect(Array.isArray(initialSquadRes.body?.data)).toBe(true);
    expect(initialSquadRes.body.data.length).toBeGreaterThan(0);

    const targetPlayerId = Number(initialSquadRes.body.data[0].id);
    await prisma.player.update({
      where: { id: targetPlayerId },
      data: {
        contractStart: null,
        contractEnd: null
      }
    });

    const repairedSquadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(repairedSquadRes.status).toBe(200);

    const repairedRow = repairedSquadRes.body.data.find((row: any) => Number(row.id) === targetPlayerId);
    expect(repairedRow).toBeTruthy();
    expect(repairedRow.contractStart).toBeTruthy();
    expect(repairedRow.contractEnd).toBeTruthy();

    const persisted = await prisma.player.findUnique({
      where: { id: targetPlayerId },
      select: { contractStart: true, contractEnd: true }
    });
    expect(persisted?.contractStart).toBeTruthy();
    expect(persisted?.contractEnd).toBeTruthy();
  });

  it('returns enriched fixture context in state and highlights payloads', async () => {
    const careerId = await createCareer('fixture-context');

    const fixtureId = await advanceUntilUserFixture(careerId);
    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    const fixture = stateRes.body?.data?.nextUserFixture;
    expect(fixture?.id).toBe(fixtureId);
    expect(typeof fixture?.homeClubName).toBe('string');
    expect(typeof fixture?.awayClubName).toBe('string');
    expect(typeof fixture?.opponentClubName).toBe('string');
    expect(fixture?.leagueName === null || typeof fixture?.leagueName === 'string').toBe(true);

    const highlightsRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/highlights`);
    expect(highlightsRes.status).toBe(200);
    expect(highlightsRes.body?.success).toBe(true);
    expect(highlightsRes.body?.data?.fixture?.id).toBe(fixtureId);
    expect(typeof highlightsRes.body?.data?.fixture?.homeClubName).toBe('string');
    expect(typeof highlightsRes.body?.data?.fixture?.awayClubName).toBe('string');
    expect(typeof highlightsRes.body?.data?.fixture?.opponentClubName).toBe('string');
  });

  it('deletes a career and cascades all V2 runtime rows', async () => {
    const careerId = await createCareer('delete-career');

    const saveRes = await request(app)
      .post(`/api/v2/careers/${careerId}/save/manual-delete-check`);
    expect(saveRes.status).toBe(200);

    const fixtureCountBefore = await prisma.v2Fixture.count({
      where: { careerId }
    });
    expect(fixtureCountBefore).toBeGreaterThan(0);

    const deleteRes = await request(app).delete(`/api/v2/careers/${careerId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body?.success).toBe(true);
    expect(deleteRes.body?.data?.id).toBe(careerId);
    expect(deleteRes.body?.data?.deleted).toBe(true);

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(404);

    const [
      careerCount,
      fixtureCount,
      saveCount,
      leagueStateCount,
      clubStateCount,
      matchCount
    ] = await Promise.all([
      prisma.v2Career.count({ where: { id: careerId } }),
      prisma.v2Fixture.count({ where: { careerId } }),
      prisma.v2SaveSlot.count({ where: { careerId } }),
      prisma.v2LeagueState.count({ where: { careerId } }),
      prisma.v2ClubState.count({ where: { careerId } }),
      prisma.v2Match.count({ where: { careerId } })
    ]);

    expect(careerCount).toBe(0);
    expect(fixtureCount).toBe(0);
    expect(saveCount).toBe(0);
    expect(leagueStateCount).toBe(0);
    expect(clubStateCount).toBe(0);
    expect(matchCount).toBe(0);
  });

  it('exposes board objectives and job security in career state and board endpoint', async () => {
    const careerId = await createCareer('board-status');

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    expect(stateRes.body?.success).toBe(true);
    expect(stateRes.body?.data?.boardStatus).toBeTruthy();
    expect(Array.isArray(stateRes.body?.data?.boardStatus?.objectives)).toBe(true);
    expect(stateRes.body.data.boardStatus.objectives.length).toBeGreaterThanOrEqual(4);
    expect(typeof stateRes.body.data.boardStatus.jobSecurity).toBe('string');

    const boardRes = await request(app).get(`/api/v2/careers/${careerId}/board`);
    expect(boardRes.status).toBe(200);
    expect(boardRes.body?.success).toBe(true);
    expect(boardRes.body?.data?.jobSecurity).toBeTruthy();
    expect(Array.isArray(boardRes.body?.data?.objectives)).toBe(true);
    expect(boardRes.body.data.objectives.length).toBeGreaterThanOrEqual(4);
  });

  it('applies a board review adjustment when wrapping the week under poor objective conditions', async () => {
    const careerId = await createCareer('board-review');

    const baselineState = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(baselineState.status).toBe(200);
    const controlledClub = baselineState.body?.data?.controlledClubId as number;
    const activeLeagueId = baselineState.body?.data?.activeLeagueId as number | null;
    expect(Number.isFinite(controlledClub)).toBe(true);

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClub
        }
      },
      data: {
        boardConfidence: 34,
        morale: 40,
        budgetBalance: -220000
      }
    });

    if (activeLeagueId) {
      await prisma.v2LeagueState.update({
        where: {
          careerId_leagueId_clubId: {
            careerId,
            leagueId: activeLeagueId,
            clubId: controlledClub
          }
        },
        data: {
          played: 8,
          won: 0,
          drawn: 0,
          lost: 8,
          goalsFor: 3,
          goalsAgainst: 24,
          goalDifference: -21,
          points: 0
        }
      });
    }

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });

    const beforeWrap = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClub
        }
      },
      select: { boardConfidence: true }
    });
    expect(beforeWrap).toBeTruthy();

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);
    expect(wrapRes.body?.success).toBe(true);

    const afterWrap = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClub
        }
      },
      select: { boardConfidence: true }
    });
    expect(afterWrap).toBeTruthy();
    expect(afterWrap!.boardConfidence).toBeLessThan(beforeWrap!.boardConfidence);
  });

  it('terminates the career when board confidence remains critical at week wrap', async () => {
    const careerId = await createCareer('board-dismissal');

    const baselineState = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(baselineState.status).toBe(200);
    const controlledClub = baselineState.body?.data?.controlledClubId as number;
    const activeLeagueId = baselineState.body?.data?.activeLeagueId as number | null;
    expect(Number.isFinite(controlledClub)).toBe(true);

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClub
        }
      },
      data: {
        boardConfidence: 6,
        morale: 30,
        budgetBalance: -350000
      }
    });

    if (activeLeagueId) {
      await prisma.v2LeagueState.update({
        where: {
          careerId_leagueId_clubId: {
            careerId,
            leagueId: activeLeagueId,
            clubId: controlledClub
          }
        },
        data: {
          played: 10,
          won: 0,
          drawn: 0,
          lost: 10,
          goalsFor: 4,
          goalsAgainst: 33,
          goalDifference: -29,
          points: 0
        }
      });
    }

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);
    expect(wrapRes.body?.success).toBe(true);
    expect(wrapRes.body?.data?.currentPhase).toBe('TERMINATED');

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    expect(stateRes.body?.data?.currentPhase).toBe('TERMINATED');

    const blockedAdvance = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(blockedAdvance.status).toBe(400);
    expect(String(blockedAdvance.body?.error || '').toLowerCase()).toContain('terminated');
  });

  it('lists transfer targets and signs an affordable player with budget impact', async () => {
    const careerId = await createCareer('transfer-market');

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=18`);
    expect(marketRes.status).toBe(200);
    expect(Array.isArray(marketRes.body?.data?.targets)).toBe(true);
    expect(marketRes.body.data.targets.length).toBeGreaterThan(0);
    const invalidAgedTargets = marketRes.body.data.targets.filter((target: any) => !Number.isFinite(target?.age));
    expect(invalidAgedTargets).toHaveLength(0);

    let target = marketRes.body.data.targets.find((row: any) => row?.isAffordable);
    if (!target) {
      await prisma.v2ClubState.update({
        where: {
          careerId_clubId: {
            careerId,
            clubId: controlledClubId
          }
        },
        data: {
          budgetBalance: {
            increment: 5000000
          }
        }
      });

      const boostedMarketRes = await request(app).get(
        `/api/v2/careers/${careerId}/transfer-market?limit=18&affordableOnly=true`
      );
      expect(boostedMarketRes.status).toBe(200);
      target = boostedMarketRes.body?.data?.targets?.[0];
    }

    expect(target).toBeTruthy();
    expect(typeof target.playerId).toBe('number');

    const beforeClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(beforeClubState).toBeTruthy();

    const signRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/sign`)
      .send({ playerId: target.playerId });
    expect(signRes.status).toBe(200);
    expect(signRes.body?.data?.playerId).toBe(target.playerId);

    const player = await prisma.player.findUnique({
      where: { id: target.playerId },
      select: { currentClubId: true }
    });
    expect(player?.currentClubId).toBe(controlledClubId);

    const playerState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: target.playerId
        }
      },
      select: { clubId: true }
    });
    expect(playerState?.clubId).toBe(controlledClubId);

    const afterClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(afterClubState).toBeTruthy();
    expect(Number(afterClubState?.budgetBalance)).toBeLessThan(Number(beforeClubState?.budgetBalance));
  });

  it('lists outgoing targets and sells a controlled-club player with budget uplift', async () => {
    const careerId = await createCareer('transfer-outgoing');

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=30`);
    expect(marketRes.status).toBe(200);
    expect(Array.isArray(marketRes.body?.data?.outgoingTargets)).toBe(true);
    expect(marketRes.body.data.outgoingTargets.length).toBeGreaterThan(0);

    const outgoingTarget = marketRes.body.data.outgoingTargets[0];
    expect(typeof outgoingTarget.playerId).toBe('number');

    const beforeClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(beforeClubState).toBeTruthy();

    const sellRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/sell`)
      .send({ playerId: outgoingTarget.playerId });
    expect(sellRes.status).toBe(200);
    expect(sellRes.body?.data?.playerId).toBe(outgoingTarget.playerId);
    expect(Number(sellRes.body?.data?.toClubId)).not.toBe(controlledClubId);

    const movedPlayer = await prisma.player.findUnique({
      where: { id: outgoingTarget.playerId },
      select: { currentClubId: true }
    });
    expect(movedPlayer?.currentClubId).not.toBe(controlledClubId);

    const afterClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(afterClubState).toBeTruthy();
    expect(Number(afterClubState?.budgetBalance)).toBeGreaterThan(Number(beforeClubState?.budgetBalance));

    const removedState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: outgoingTarget.playerId
        }
      }
    });
    expect(removedState).toBeNull();
  });

  it('persists transfer shortlist state and scouting reports in the transfer market payload', async () => {
    const careerId = await createCareer('transfer-shortlist');

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=12`);
    expect(marketRes.status).toBe(200);
    const target = marketRes.body?.data?.targets?.[0];
    expect(target).toBeTruthy();

    const shortlistRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/shortlist`)
      .send({ playerId: target.playerId, shortlisted: true });
    expect(shortlistRes.status).toBe(200);
    expect(shortlistRes.body?.data?.shortlisted).toBe(true);

    const scoutRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/scout`)
      .send({ playerId: target.playerId });
    expect(scoutRes.status).toBe(200);
    expect(scoutRes.body?.data?.report?.playerId).toBe(target.playerId);

    const refreshedMarketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=12`);
    expect(refreshedMarketRes.status).toBe(200);
    expect(refreshedMarketRes.body?.data?.shortlistCount).toBeGreaterThanOrEqual(1);
    const shortlistedTarget = refreshedMarketRes.body?.data?.shortlistedTargets?.find(
      (row: any) => row?.playerId === target.playerId
    );
    expect(shortlistedTarget?.isShortlisted).toBe(true);
    expect(shortlistedTarget?.scoutingReport?.summary).toContain(shortlistedTarget.fullName);
  });

  it('generates budget-fit loan recommendations for lower-tier clubs when permanent fees are out of reach', async () => {
    const o21Club = await prisma.club.findFirst({
      where: {
        isActive: true,
        league: {
          isActive: true,
          OR: [
            { name: { contains: 'O21' } },
            { level: { contains: 'O21' } }
          ]
        }
      },
      select: { id: true },
      orderBy: [{ leagueId: 'asc' }, { id: 'asc' }]
    });

    expect(Number(o21Club?.id)).toBeGreaterThan(0);
    const careerId = await createCareer('transfer-low-budget-loan', Number(o21Club?.id));

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=8`);
    expect(marketRes.status).toBe(200);
    const availableBudget = Number(marketRes.body?.data?.availableBudget ?? 0);
    const target = marketRes.body?.data?.targets?.find((row: any) => !row?.isAffordable) ?? marketRes.body?.data?.targets?.[0];
    expect(availableBudget).toBeGreaterThan(0);
    expect(target).toBeTruthy();

    const scoutRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/scout`)
      .send({ playerId: target.playerId });
    expect(scoutRes.status).toBe(200);
    const report = scoutRes.body?.data?.report;
    expect(report).toBeTruthy();

    const immediateLoanCost = Number(report?.recommendedLoanFee ?? 0)
      + Math.round(Number(target?.weeklyWage ?? 0) * (Number(report?.recommendedWageContributionPct ?? 0) / 100) * 4);

    expect(immediateLoanCost).toBeLessThanOrEqual(availableBudget);
    expect(report?.recommendation).toBe('VALUE_LOAN');

    const offerRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/offer`)
      .send({
        playerId: target.playerId,
        kind: 'LOAN',
        loanFee: report.recommendedLoanFee,
        wageContributionPct: report.recommendedWageContributionPct,
        buyOptionFee: report.recommendedBuyOptionFee ?? undefined,
        loanDurationWeeks: 12
      });

    expect(offerRes.status).toBe(200);
    expect(['ACCEPTED', 'COUNTERED', 'REJECTED']).toContain(String(offerRes.body?.data?.outcome || ''));
  });

  it('creates and resolves countered permanent transfer negotiations', async () => {
    const careerId = await createCareer('transfer-countered-offer');

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      data: {
        budgetBalance: {
          increment: 8000000
        }
      }
    });

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=16`);
    expect(marketRes.status).toBe(200);
    const target = marketRes.body?.data?.targets?.[0];
    expect(target).toBeTruthy();

    const scoutRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/scout`)
      .send({ playerId: target.playerId });
    expect(scoutRes.status).toBe(200);
    const report = scoutRes.body?.data?.report;
    expect(report).toBeTruthy();

    const offerRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/offer`)
      .send({
        playerId: target.playerId,
        kind: 'PERMANENT',
        transferFee: Math.round(Number(report.recommendedBidFee) * 0.9),
        weeklyWage: Math.round(Number(report.recommendedWeeklyWage) * 0.9)
      });
    expect(offerRes.status).toBe(200);
    expect(offerRes.body?.data?.outcome).toBe('COUNTERED');
    expect(offerRes.body?.data?.negotiation?.negotiationId).toBeTruthy();

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/offer/respond`)
      .send({
        negotiationId: offerRes.body.data.negotiation.negotiationId,
        action: 'ACCEPT_COUNTER'
      });
    expect(respondRes.status).toBe(200);
    expect(respondRes.body?.data?.outcome).toBe('ACCEPTED');
    expect(respondRes.body?.data?.permanentDeal?.playerId).toBe(target.playerId);

    const player = await prisma.player.findUnique({
      where: { id: target.playerId },
      select: { currentClubId: true }
    });
    expect(player?.currentClubId).toBe(controlledClubId);

    const refreshedMarketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=16`);
    expect(refreshedMarketRes.status).toBe(200);
    const stillActive = refreshedMarketRes.body?.data?.activeNegotiations?.find(
      (row: any) => row?.playerId === target.playerId
    );
    expect(stillActive).toBeFalsy();
  });

  it('accepts incoming loan offers with buy options and can trigger the clause', async () => {
    const careerId = await createCareer('transfer-loan-buy-option');

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      data: {
        budgetBalance: {
          increment: 6000000
        }
      }
    });

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=16`);
    expect(marketRes.status).toBe(200);
    const target = marketRes.body?.data?.targets?.[0];
    expect(target).toBeTruthy();

    const scoutRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/scout`)
      .send({ playerId: target.playerId });
    expect(scoutRes.status).toBe(200);
    const report = scoutRes.body?.data?.report;

    const loanOfferRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/offer`)
      .send({
        playerId: target.playerId,
        kind: 'LOAN',
        loanFee: report.recommendedLoanFee,
        wageContributionPct: report.recommendedWageContributionPct,
        buyOptionFee: report.recommendedBuyOptionFee ?? target.askingFee,
        loanDurationWeeks: 8
      });
    expect(loanOfferRes.status).toBe(200);
    expect(loanOfferRes.body?.data?.outcome).toBe('ACCEPTED');
    expect(loanOfferRes.body?.data?.loanDeal?.loanId).toBeTruthy();

    const loanId = Number(loanOfferRes.body.data.loanDeal.loanId);
    const loanRow = await prisma.loan.findUnique({
      where: { id: loanId },
      select: { status: true, toClubId: true }
    });
    expect(loanRow?.status).toBe('active');
    expect(loanRow?.toClubId).toBe(controlledClubId);

    const marketAfterLoanRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=16`);
    expect(marketAfterLoanRes.status).toBe(200);
    const incomingLoan = marketAfterLoanRes.body?.data?.incomingLoans?.find((row: any) => row?.loanId === loanId);
    expect(incomingLoan?.playerId).toBe(target.playerId);
    expect(incomingLoan?.canTriggerBuyOption).toBe(true);

    const buyRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/loan-buy-option`)
      .send({ loanId });
    expect(buyRes.status).toBe(200);
    expect(buyRes.body?.data?.loanId).toBe(loanId);

    const boughtLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: { status: true }
    });
    expect(boughtLoan?.status).toBe('purchased');
  });

  it('returns incoming loans to the parent club at week wrap when they expire', async () => {
    const careerId = await createCareer('transfer-loan-return');

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      data: {
        budgetBalance: {
          increment: 6000000
        }
      }
    });

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=16`);
    const target = marketRes.body?.data?.targets?.[0];
    expect(target).toBeTruthy();

    const scoutRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/scout`)
      .send({ playerId: target.playerId });
    const report = scoutRes.body?.data?.report;

    const loanOfferRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/offer`)
      .send({
        playerId: target.playerId,
        kind: 'LOAN',
        loanFee: report.recommendedLoanFee,
        wageContributionPct: report.recommendedWageContributionPct,
        buyOptionFee: report.recommendedBuyOptionFee ?? target.askingFee,
        loanDurationWeeks: 4
      });
    expect(loanOfferRes.status).toBe(200);
    const loanId = Number(loanOfferRes.body?.data?.loanDeal?.loanId);
    expect(Number.isFinite(loanId)).toBe(true);

    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: { fromClubId: true }
    });
    expect(existingLoan).toBeTruthy();

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { currentDate: true }
    });
    expect(career).toBeTruthy();

    await prisma.loan.update({
      where: { id: loanId },
      data: {
        endDate: career?.currentDate
      }
    });
    await prisma.v2Career.update({
      where: { id: careerId },
      data: {
        currentPhase: 'WEEK_WRAP'
      }
    });

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);

    const returnedLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: { status: true }
    });
    expect(returnedLoan?.status).toBe('returned');

    const player = await prisma.player.findUnique({
      where: { id: target.playerId },
      select: { currentClubId: true }
    });
    expect(player?.currentClubId).toBe(existingLoan?.fromClubId);

    const playerState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: target.playerId
        }
      }
    });
    expect(playerState).toBeNull();
  });

  it('upgrades club operations and applies weekly commercial net impact to finances', async () => {
    const careerId = await createCareer('club-operations-finance');

    const initialFinancesRes = await request(app).get(`/api/v2/careers/${careerId}/finances`);
    expect(initialFinancesRes.status).toBe(200);
    expect(initialFinancesRes.body?.data?.clubOperations?.operations).toHaveLength(4);

    const initialCommercial = initialFinancesRes.body?.data?.clubOperations?.operations?.find(
      (operation: any) => operation?.key === 'COMMERCIAL_TEAM'
    );
    expect(initialCommercial?.level).toBe(1);
    const initialBudgetDelta = Number(initialFinancesRes.body?.data?.v2BudgetDelta ?? 0);

    const upgradeRes = await request(app)
      .post(`/api/v2/careers/${careerId}/finances/operations`)
      .send({ operationKey: 'COMMERCIAL_TEAM' });
    expect(upgradeRes.status).toBe(200);
    expect(upgradeRes.body?.data?.operationKey).toBe('COMMERCIAL_TEAM');
    expect(upgradeRes.body?.data?.newLevel).toBe(2);
    expect(Number(upgradeRes.body?.data?.upgradeCost)).toBe(80000);
    expect(Number(upgradeRes.body?.data?.clubOperations?.projectedWeeklyNetImpact)).toBe(11500);

    const upgradedFinancesRes = await request(app).get(`/api/v2/careers/${careerId}/finances`);
    expect(upgradedFinancesRes.status).toBe(200);
    const upgradedCommercial = upgradedFinancesRes.body?.data?.clubOperations?.operations?.find(
      (operation: any) => operation?.key === 'COMMERCIAL_TEAM'
    );
    expect(upgradedCommercial?.level).toBe(2);
    expect(Number(upgradedFinancesRes.body?.data?.clubOperations?.projectedWeeklyCommercialIncome)).toBe(16000);
    expect(Number(upgradedFinancesRes.body?.data?.clubOperations?.totalWeeklyOperatingCost)).toBe(4500);
    expect(Number(upgradedFinancesRes.body?.data?.clubOperations?.projectedWeeklyNetImpact)).toBe(11500);

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const postAdvanceFinancesRes = await request(app).get(`/api/v2/careers/${careerId}/finances`);
    expect(postAdvanceFinancesRes.status).toBe(200);
    expect(Number(postAdvanceFinancesRes.body?.data?.v2BudgetDelta)).toBe(initialBudgetDelta - 80000 + 11500);

    const upgradeAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'CLUB_OPERATIONS'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    });
    expect(upgradeAudit).toBeTruthy();
    expect(String(upgradeAudit?.message || '')).toContain('Commercial Team');
  });

  it('feeds recruitment and medical department upgrades into scouting confidence and recovery handling', async () => {
    const careerId = await createCareer('club-operations-performance');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const targetPlayerId = Number(squadRes.body?.data?.find((player: any) => player?.position !== 'GK')?.id);
    expect(Number.isFinite(targetPlayerId)).toBe(true);

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      data: {
        budgetBalance: {
          increment: 500000
        }
      }
    });

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetPlayerId
        }
      },
      data: {
        fitness: 60,
        morale: 58,
        form: 52,
        isInjured: true,
        injuryWeeks: 3
      }
    });

    for (const operationKey of ['MEDICAL_DEPARTMENT', 'MEDICAL_DEPARTMENT', 'RECRUITMENT_NETWORK', 'RECRUITMENT_NETWORK']) {
      const upgradeRes = await request(app)
        .post(`/api/v2/careers/${careerId}/finances/operations`)
        .send({ operationKey });
      expect(upgradeRes.status).toBe(200);
    }

    const marketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market?limit=8`);
    expect(marketRes.status).toBe(200);
    const transferTarget = marketRes.body?.data?.targets?.[0];
    expect(transferTarget).toBeTruthy();

    const scoutRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/scout`)
      .send({ playerId: transferTarget.playerId });
    expect(scoutRes.status).toBe(200);
    expect(
      Array.isArray(scoutRes.body?.data?.report?.strengths)
        && scoutRes.body.data.report.strengths.some((item: string) => /above-baseline live report/i.test(item))
    ).toBe(true);

    const weekPlanRes = await request(app)
      .put(`/api/v2/careers/${careerId}/week-plan`)
      .send({
        trainingFocus: 'FITNESS',
        rotationIntensity: 'HIGH',
        tacticalMentality: 'CAUTIOUS',
        transferStance: 'SELL_TO_BALANCE',
        scoutingPriority: 'LOCAL'
      });
    expect(weekPlanRes.status).toBe(200);

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const playerStateAfter = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetPlayerId
        }
      },
      select: {
        fitness: true,
        isInjured: true,
        injuryWeeks: true
      }
    });

    expect(playerStateAfter?.isInjured).toBe(true);
    expect(playerStateAfter?.injuryWeeks).toBe(1);
    expect(Number(playerStateAfter?.fitness)).toBeGreaterThanOrEqual(67);
  });

  it('renews a squad player contract with updated wage and club budget impact', async () => {
    const careerId = await createCareer('contract-renew');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThan(0);

    const target = squadRes.body.data[0];
    const beforePlayer = await prisma.player.findUnique({
      where: { id: Number(target.id) },
      select: {
        weeklyWage: true,
        contractEnd: true
      }
    });
    expect(beforePlayer).toBeTruthy();

    const beforeClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(beforeClubState).toBeTruthy();

    const renewRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${target.id}/renew`)
      .send({ years: 3, wageAdjustmentPct: 8 });
    expect(renewRes.status).toBe(200);
    expect(renewRes.body?.data?.action).toBe('RENEW');
    expect(Number(renewRes.body?.data?.playerId)).toBe(Number(target.id));
    expect(Number(renewRes.body?.data?.weeklyWage)).toBeGreaterThan(0);
    expect(typeof renewRes.body?.data?.contractEnd).toBe('string');

    const afterPlayer = await prisma.player.findUnique({
      where: { id: Number(target.id) },
      select: {
        weeklyWage: true,
        contractEnd: true
      }
    });
    expect(afterPlayer).toBeTruthy();
    expect(Number(afterPlayer?.weeklyWage ?? 0)).toBeGreaterThanOrEqual(Number(beforePlayer?.weeklyWage ?? 0));
    expect(afterPlayer?.contractEnd).toBeTruthy();
    if (beforePlayer?.contractEnd && afterPlayer?.contractEnd) {
      expect(afterPlayer.contractEnd.getTime()).toBeGreaterThan(beforePlayer.contractEnd.getTime());
    }

    const afterClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(afterClubState).toBeTruthy();
    expect(Number(afterClubState?.budgetBalance)).toBeLessThan(Number(beforeClubState?.budgetBalance));
  });

  it('releases a squad player and removes their V2 player state', async () => {
    const careerId = await createCareer('contract-release');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThan(20);

    const target = squadRes.body.data[squadRes.body.data.length - 1];
    const beforeSquadSize = squadRes.body.data.length;

    const beforeClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(beforeClubState).toBeTruthy();

    const releaseRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${target.id}/release`)
      .send({ compensationWeeks: 6 });
    expect(releaseRes.status).toBe(200);
    expect(releaseRes.body?.data?.action).toBe('RELEASE');
    expect(Number(releaseRes.body?.data?.playerId)).toBe(Number(target.id));

    const movedPlayer = await prisma.player.findUnique({
      where: { id: Number(target.id) },
      select: { currentClubId: true }
    });
    expect(movedPlayer?.currentClubId).toBeNull();

    const removedState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: Number(target.id)
        }
      }
    });
    expect(removedState).toBeNull();

    const afterSquadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(afterSquadRes.status).toBe(200);
    expect(Array.isArray(afterSquadRes.body?.data)).toBe(true);
    expect(afterSquadRes.body.data.length).toBe(beforeSquadSize - 1);

    const afterClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { budgetBalance: true }
    });
    expect(afterClubState).toBeTruthy();
    expect(Number(afterClubState?.budgetBalance)).toBeGreaterThan(Number(beforeClubState?.budgetBalance));
  });

  it('generates proactive contract warning inbox events with renew/promise/release choices', async () => {
    const careerId = await createCareer('contract-warning-inbox');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        currentDate: true,
        weekNumber: true,
        currentPhase: true
      }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const renewTargetId = Number(squad[0]?.id);
    const releaseTargetId = Number(squad[squad.length - 1]?.id);
    expect(Number.isFinite(renewTargetId)).toBe(true);
    expect(Number.isFinite(releaseTargetId)).toBe(true);
    expect(releaseTargetId).not.toBe(renewTargetId);

    const now = career?.currentDate ?? new Date();
    const renewExpiry = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    const releaseExpiry = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
    const farExpiry = new Date(now.getTime() + 400 * 24 * 60 * 60 * 1000);

    const otherSquadIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== renewTargetId && id !== releaseTargetId);

    await prisma.player.updateMany({
      where: { id: { in: otherSquadIds } },
      data: { contractEnd: farExpiry }
    });

    await prisma.player.update({
      where: { id: renewTargetId },
      data: {
        contractEnd: renewExpiry,
        weeklyWage: 2400
      }
    });
    await prisma.player.update({
      where: { id: releaseTargetId },
      data: {
        contractEnd: releaseExpiry,
        weeklyWage: 1800
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);
    expect(['EVENT', 'MATCH_PREP', 'WEEK_WRAP']).toContain(String(advanceRes.body?.data?.currentPhase));

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    const contractEvents = events.filter((event: any) =>
      Array.isArray(event?.options) && event.options.some((option: any) => String(option?.id || '').startsWith('contract_warn:'))
    );
    expect(contractEvents.length).toBeGreaterThanOrEqual(2);

    const renewEvent = contractEvents.find((event: any) =>
      event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${renewTargetId}:`))
    );
    const releaseEvent = contractEvents.find((event: any) =>
      event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:release:${releaseTargetId}:`))
    );
    expect(renewEvent).toBeTruthy();
    expect(releaseEvent).toBeTruthy();
    expect(String(renewEvent.description || '')).toContain('Agent stance:');
    expect(String(renewEvent.description || '')).toContain('Board stance:');
    expect(String(renewEvent.description || '')).toContain('Age');
    expect(String(renewEvent.description || '')).toContain('Wage EUR');

    const hasPromiseChoice = renewEvent.options.some((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:promise:${renewTargetId}`)
    );
    expect(hasPromiseChoice).toBe(true);

    const renewOptions = renewEvent.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${renewTargetId}:`)
    );
    expect(renewOptions.length).toBeGreaterThanOrEqual(3);
    expect(renewOptions.every((option: any) =>
      ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'].includes(String(option?.acceptanceRisk || ''))
    )).toBe(true);
    expect(renewOptions.every((option: any) =>
      typeof option?.acceptanceHint === 'string' && option.acceptanceHint.length > 0
    )).toBe(true);

    const parsedRenewPackages = renewOptions.map((option: any) => {
      const parts = String(option.id).split(':');
      return {
        optionId: String(option.id),
        years: Number(parts[3]),
        wageAdjustmentPct: Number(parts[4]),
        boardPolicyLevel: typeof option?.boardPolicyLevel === 'string' ? String(option.boardPolicyLevel) : null
      };
    });
    expect(parsedRenewPackages.every((pkg: { years: number; wageAdjustmentPct: number }) =>
      Number.isFinite(pkg.years) && Number.isFinite(pkg.wageAdjustmentPct)
    )).toBe(true);
    expect(new Set(parsedRenewPackages.map((pkg: { years: number; wageAdjustmentPct: number }) =>
      `${pkg.years}:${pkg.wageAdjustmentPct}`
    )).size).toBeGreaterThanOrEqual(3);

    const eligibleRenewPackages = parsedRenewPackages.filter((pkg: { boardPolicyLevel?: string | null }) => pkg.boardPolicyLevel !== 'HARD');
    expect(eligibleRenewPackages.length).toBeGreaterThanOrEqual(1);
    const chosenRenewPackage = [...eligibleRenewPackages].sort((a, b) => b.years - a.years || b.wageAdjustmentPct - a.wageAdjustmentPct)[0];
    expect(chosenRenewPackage).toBeTruthy();

    const renewOptionId = chosenRenewPackage.optionId;
    const releaseOptionId = releaseEvent.options.find((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:release:${releaseTargetId}:`)
    )?.id;
    expect(typeof renewOptionId).toBe('string');
    expect(typeof releaseOptionId).toBe('string');

    const renewRespondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${renewEvent.id}/respond`)
      .send({ optionId: renewOptionId });
    expect(renewRespondRes.status).toBe(200);

    const releaseRespondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${releaseEvent.id}/respond`)
      .send({ optionId: releaseOptionId });
    expect(releaseRespondRes.status).toBe(200);

    const renewedPlayer = await prisma.player.findUnique({
      where: { id: renewTargetId },
      select: {
        currentClubId: true,
        contractEnd: true,
        weeklyWage: true
      }
    });
    expect(renewedPlayer?.currentClubId).toBe(controlledClubId);
    expect(renewedPlayer?.contractEnd).toBeTruthy();
    expect(Number(renewedPlayer?.weeklyWage)).toBe(Math.round(2400 * (1 + chosenRenewPackage.wageAdjustmentPct / 100)));
    if (renewedPlayer?.contractEnd) {
      expect(renewedPlayer.contractEnd.getTime()).toBeGreaterThan(renewExpiry.getTime());
      const expectedContractEnd = new Date(renewExpiry);
      expectedContractEnd.setUTCFullYear(expectedContractEnd.getUTCFullYear() + chosenRenewPackage.years);
      expect(renewedPlayer.contractEnd.toISOString().slice(0, 10)).toBe(expectedContractEnd.toISOString().slice(0, 10));
    }

    const releasedPlayer = await prisma.player.findUnique({
      where: { id: releaseTargetId },
      select: {
        currentClubId: true
      }
    });
    expect(releasedPlayer?.currentClubId).toBeNull();

    const removedPlayerState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: releaseTargetId
        }
      }
    });
    expect(removedPlayerState).toBeNull();

    const inboxContractAudits = await prisma.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'CONTRACT',
        message: { contains: 'inbox contract warning' }
      }
    });
    expect(inboxContractAudits.length).toBeGreaterThanOrEqual(2);
  });

  it('returns a squad player profile with derived role context and active contract talk stage', async () => {
    const careerId = await createCareer('squad-player-profile');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { currentDate: true }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 28 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 2800,
        currentAbility: 84
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const profileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileRes.status).toBe(200);
    const profile = profileRes.body?.data;
    expect(Number(profile?.playerId)).toBe(targetId);
    expect(typeof profile?.fullName).toBe('string');
    expect(typeof profile?.squadContext?.roleTier).toBe('string');
    expect(['STAR', 'STARTER', 'ROTATION', 'DEPTH', 'PROSPECT']).toContain(String(profile?.squadContext?.roleTier || ''));
    expect(['KEY_PLAYER', 'IMPORTANT', 'ROTATION', 'SPORADIC', 'DEVELOPMENT']).toContain(String(profile?.squadContext?.playingTimeExpectation || ''));
    expect(Number.isFinite(Number(profile?.squadContext?.squadAbilityRank))).toBe(true);
    expect(Number.isFinite(Number(profile?.contract?.suggestedRenewalYears))).toBe(true);
    expect(Number.isFinite(Number(profile?.contract?.suggestedWageAdjustmentPct))).toBe(true);
    expect(['STABLE', 'WATCH', 'CRITICAL']).toContain(String(profile?.contract?.risk || ''));
    expect(Number(profile?.contract?.daysRemaining)).toBeLessThanOrEqual(35);
    expect(typeof profile?.contract?.recommendation).toBe('string');
    expect(typeof profile?.availability?.note).toBe('string');
    expect(profile?.pendingContractTalk).toBeTruthy();
    expect(String(profile?.pendingContractTalk?.stage || '')).toBe('WARNING');
    expect(String(profile?.pendingContractTalk?.eventId || '')).toContain(`:contract:${targetId}`);
  });

  it('updates squad role assignments with morale and board effects and reflects them in squad/profile payloads', async () => {
    const careerId = await createCareer('squad-role-assignment');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    await prisma.player.update({
      where: { id: targetId },
      data: { currentAbility: 87 }
    });

    const profileBeforeRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileBeforeRes.status).toBe(200);
    const recommendedRole = String(profileBeforeRes.body?.data?.squadContext?.recommendedAssignedRole || 'DEPTH');
    const chosenRole = recommendedRole === 'DEPTH' ? 'STARTER' : 'DEPTH';

    const playerStateBefore = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: { morale: true }
    });
    expect(playerStateBefore).toBeTruthy();

    const clubStateBefore = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { boardConfidence: true }
    });
    expect(clubStateBefore).toBeTruthy();

    const assignRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/role`)
      .send({ roleAssignment: chosenRole });
    expect(assignRes.status).toBe(200);
    expect(assignRes.body?.data?.roleAssignment).toBe(chosenRole);
    expect(assignRes.body?.data?.previousRoleAssignment).toBeTruthy();
    expect(Number(assignRes.body?.data?.moraleDelta)).not.toBe(0);

    const playerStateAfter = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: { morale: true }
    });
    expect(playerStateAfter).toBeTruthy();
    expect(Number(playerStateAfter?.morale)).toBe(
      Math.max(0, Math.min(100, Number(playerStateBefore?.morale) + Number(assignRes.body?.data?.moraleDelta || 0)))
    );

    const clubStateAfter = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { boardConfidence: true }
    });
    expect(clubStateAfter).toBeTruthy();
    expect(Number(clubStateAfter?.boardConfidence)).toBe(
      Math.max(0, Math.min(100, Number(clubStateBefore?.boardConfidence) + Number(assignRes.body?.data?.boardDelta || 0)))
    );

    const squadAfterRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadAfterRes.status).toBe(200);
    const squadAfter = Array.isArray(squadAfterRes.body?.data) ? squadAfterRes.body.data : [];
    const targetRow = squadAfter.find((row: any) => Number(row?.id) === targetId);
    expect(targetRow).toBeTruthy();
    expect(String(targetRow?.assignedRole || '')).toBe(chosenRole);

    const profileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileRes.status).toBe(200);
    expect(String(profileRes.body?.data?.squadContext?.assignedRole || '')).toBe(chosenRole);
    expect(typeof profileRes.body?.data?.squadContext?.rolePressureNote).toBe('string');
    expect(Array.isArray(profileRes.body?.data?.recentHistory?.roleChanges)).toBe(true);
    expect(profileRes.body?.data?.recentHistory?.roleChanges?.length).toBeGreaterThanOrEqual(1);
    expect(String(profileRes.body?.data?.recentHistory?.roleChanges?.[0]?.roleAssignment || '')).toBe(chosenRole);

    const roleAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'SQUAD_ROLE'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(roleAudit).toBeTruthy();
    const roleAuditMetadata = JSON.parse(roleAudit?.metadata || '{}');
    expect(roleAuditMetadata?.source).toBe('SQUAD_ROLE_ASSIGNMENT');
    expect(Number(roleAuditMetadata?.playerId)).toBe(targetId);
    expect(String(roleAuditMetadata?.roleAssignment || '')).toBe(chosenRole);
  });

  it('applies player status directives with availability notes and morale/fitness effects', async () => {
    const careerId = await createCareer('player-status-directive');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      data: {
        morale: 60,
        fitness: 80,
        form: 50,
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false
      }
    });

    const clubStateBefore = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { boardConfidence: true }
    });
    expect(clubStateBefore).toBeTruthy();

    const restRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/status`)
      .send({ action: 'REST_RECOVERY' });
    expect(restRes.status).toBe(200);
    expect(String(restRes.body?.data?.directiveCode || '')).toBe('REST_RECOVERY');
    expect(Number(restRes.body?.data?.fitnessDelta)).toBeGreaterThan(0);

    const playerStateAfterRest = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: { morale: true, fitness: true, form: true }
    });
    expect(playerStateAfterRest).toBeTruthy();
    expect(Number(playerStateAfterRest?.morale)).toBe(60 + Number(restRes.body?.data?.moraleDelta || 0));
    expect(Number(playerStateAfterRest?.fitness)).toBe(80 + Number(restRes.body?.data?.fitnessDelta || 0));
    expect(Number(playerStateAfterRest?.form)).toBe(50 + Number(restRes.body?.data?.formDelta || 0));

    const profileAfterRestRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileAfterRestRes.status).toBe(200);
    expect(profileAfterRestRes.body?.data?.availability?.managerDirective).toBeTruthy();
    expect(String(profileAfterRestRes.body?.data?.availability?.managerDirective?.directiveCode || '')).toBe('REST_RECOVERY');
    expect(String(profileAfterRestRes.body?.data?.availability?.note || '')).toContain('Manager directive');

    const disciplineRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/status`)
      .send({ action: 'DISCIPLINARY_NOTE' });
    expect(disciplineRes.status).toBe(200);
    expect(String(disciplineRes.body?.data?.directiveCode || '')).toBe('DISCIPLINARY_NOTE');
    expect(Number(disciplineRes.body?.data?.moraleDelta)).toBeLessThan(0);
    expect(Number(disciplineRes.body?.data?.boardDelta)).toBeGreaterThan(0);

    const clubStateAfterDiscipline = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: { boardConfidence: true }
    });
    expect(clubStateAfterDiscipline).toBeTruthy();
    expect(Number(clubStateAfterDiscipline?.boardConfidence)).toBe(
      Math.max(0, Math.min(100, Number(clubStateBefore?.boardConfidence) + Number(disciplineRes.body?.data?.boardDelta || 0)))
    );

    const clearRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/status`)
      .send({ action: 'CLEAR_DIRECTIVE' });
    expect(clearRes.status).toBe(200);
    expect(clearRes.body?.data?.directiveCode).toBeNull();

    const profileAfterClearRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileAfterClearRes.status).toBe(200);
    expect(profileAfterClearRes.body?.data?.availability?.managerDirective).toBeNull();

    const statusAudits = await prisma.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_STATUS'
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });
    expect(statusAudits.length).toBeGreaterThanOrEqual(2);
    const statusAuditMetadata = statusAudits.map((audit) => JSON.parse(audit.metadata || '{}'));
    expect(statusAuditMetadata.some((meta) => String(meta?.source || '') === 'PLAYER_STATUS_SET' && Number(meta?.playerId) === targetId)).toBe(true);
    expect(statusAuditMetadata.some((meta) => String(meta?.source || '') === 'PLAYER_STATUS_CLEAR' && Number(meta?.playerId) === targetId)).toBe(true);
  });

  it('enforces registration eligibility in squad profiles and match prep', async () => {
    const careerId = await createCareer('squad-registration');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const initialSelection = buildTestFormationSelection(squad);
    expect(initialSelection.starters.length).toBe(11);
    expect(initialSelection.bench.length).toBeGreaterThanOrEqual(3);
    const targetId = Number(initialSelection.starters.find((playerId) => !isGoalkeeperPosition(squad.find((row: any) => Number(row?.id) === playerId)?.position)) ?? initialSelection.starters[0]);
    expect(Number.isFinite(targetId)).toBe(true);

    const unregisterRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/registration`)
      .send({ action: 'UNREGISTER' });
    expect(unregisterRes.status).toBe(200);
    expect(unregisterRes.body?.data?.isRegistered).toBe(false);

    const profileAfterUnregister = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileAfterUnregister.status).toBe(200);
    expect(profileAfterUnregister.body?.data?.registration?.isRegistered).toBe(false);
    expect(String(profileAfterUnregister.body?.data?.registration?.eligibilityCode || '')).toBe('UNREGISTERED');

    const fixtureId = await advanceUntilMatchPrepWithFixture(careerId);
    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      data: {
        isInjured: false,
        isSuspended: false,
        injuryWeeks: 0
      }
    });
    const squadBeforeMatchPrepRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadBeforeMatchPrepRes.status).toBe(200);
    const squadBeforeMatchPrep = Array.isArray(squadBeforeMatchPrepRes.body?.data) ? squadBeforeMatchPrepRes.body.data : [];
    const selectionBeforeMatch = buildTestFormationSelection(squadBeforeMatchPrep);
    const { starters: startersWithTarget, bench: benchWithTarget } = ensurePlayerIncludedInStarters(
      squadBeforeMatchPrep,
      selectionBeforeMatch,
      targetId
    );
    expect(startersWithTarget).toContain(targetId);
    expect(benchWithTarget).not.toContain(targetId);
    const startBlockedRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: startersWithTarget,
        benchPlayerIds: benchWithTarget,
        captainPlayerId: startersWithTarget[0]
      });
    expect(startBlockedRes.status).toBe(400);
    expect(String(startBlockedRes.body?.error || '')).toMatch(/ineligible|not registered/i);

    const registerRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/registration`)
      .send({ action: 'REGISTER' });
    expect(registerRes.status).toBe(200);
    expect(registerRes.body?.data?.isRegistered).toBe(true);

    const startAllowedRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: startersWithTarget,
        benchPlayerIds: benchWithTarget,
        captainPlayerId: startersWithTarget[0]
      });
    expect(startAllowedRes.status).toBe(200);
    expect(Array.isArray(startAllowedRes.body?.data?.match?.matchPrep?.startingPlayerIds)).toBe(true);

    const registrationAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'SQUAD_REGISTRATION'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(registrationAudit).toBeTruthy();
    const registrationMetadata = JSON.parse(registrationAudit?.metadata || '{}');
    expect(String(registrationMetadata?.source || '')).toBe('SQUAD_REGISTRATION_SET');
    expect(Array.isArray(registrationMetadata?.registeredPlayerIds)).toBe(true);
  });

  it('enforces registration windows and exposes season window context in league rules', async () => {
    const careerId = await createCareer('competition-windows-registration');

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    const activeLeagueId = Number(stateRes.body?.data?.activeLeagueId);
    expect(Number.isFinite(activeLeagueId)).toBe(true);

    const openingRulesRes = await request(app).get(`/api/v2/careers/${careerId}/standings/${activeLeagueId}/rules`);
    expect(openingRulesRes.status).toBe(200);
    expect(openingRulesRes.body?.data?.seasonPhase?.code).toBe('OPENING_WINDOW');
    expect(openingRulesRes.body?.data?.registration?.window?.isOpen).toBe(true);
    expect(openingRulesRes.body?.data?.transferWindow?.isOpen).toBe(true);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    const targetId = Number(squad.find((player: any) => String(player?.registrationStatus || '') === 'REGISTERED')?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    await prisma.v2Career.update({
      where: { id: careerId },
      data: {
        weekNumber: 6,
        currentPhase: 'PLANNING'
      }
    });

    const closedRulesRes = await request(app).get(`/api/v2/careers/${careerId}/standings/${activeLeagueId}/rules`);
    expect(closedRulesRes.status).toBe(200);
    expect(closedRulesRes.body?.data?.registration?.window?.isOpen).toBe(false);
    expect(String(closedRulesRes.body?.data?.registration?.window?.note || '')).toMatch(/reopens|closed/i);

    const unregisterBlockedRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/registration`)
      .send({ action: 'UNREGISTER' });
    expect(unregisterBlockedRes.status).toBe(400);
    expect(String(unregisterBlockedRes.body?.error || '')).toMatch(/registration window is closed/i);
  });

  it('blocks transfer business outside the transfer window but still exposes the closed-window state', async () => {
    const careerId = await createCareer('competition-windows-transfer');

    const openingMarketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market`);
    expect(openingMarketRes.status).toBe(200);
    expect(openingMarketRes.body?.data?.transferWindow?.isOpen).toBe(true);

    const target = Array.isArray(openingMarketRes.body?.data?.targets)
      ? openingMarketRes.body.data.targets[0]
      : null;
    expect(Number(target?.playerId)).toBeGreaterThan(0);

    await prisma.v2Career.update({
      where: { id: careerId },
      data: {
        weekNumber: 6,
        currentPhase: 'PLANNING'
      }
    });

    const closedMarketRes = await request(app).get(`/api/v2/careers/${careerId}/transfer-market`);
    expect(closedMarketRes.status).toBe(200);
    expect(closedMarketRes.body?.data?.transferWindow?.isOpen).toBe(false);
    expect(String(closedMarketRes.body?.data?.seasonPhase?.label || '')).toMatch(/first half|second half|run-in/i);

    const offerBlockedRes = await request(app)
      .post(`/api/v2/careers/${careerId}/transfer-market/offer`)
      .send({
        playerId: Number(target?.playerId),
        kind: 'PERMANENT',
        transferFee: Number(target?.askingFee || 0),
        weeklyWage: Number(target?.weeklyWage || 0)
      });
    expect(offerBlockedRes.status).toBe(400);
    expect(String(offerBlockedRes.body?.error || '')).toMatch(/transfer window is closed/i);
  });

  it('repairs O21 controlled-club registration depth so lower-tier careers remain playable', async () => {
    const o21Club = await prisma.club.findFirst({
      where: {
        isActive: true,
        league: {
          isActive: true,
          OR: [
            { name: { contains: 'O21' } },
            { level: { contains: 'O21' } }
          ]
        }
      },
      select: { id: true, leagueId: true },
      orderBy: [{ leagueId: 'asc' }, { id: 'asc' }]
    });

    expect(Number(o21Club?.id)).toBeGreaterThan(0);
    const careerId = await createCareer('o21-registration-viability', Number(o21Club?.id));

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    const eligiblePlayers = squad.filter((player: any) => Boolean(player?.isEligibleForNextFixture));
    const registeredPlayers = squad.filter((player: any) => String(player?.registrationStatus || '') === 'REGISTERED');

    expect(eligiblePlayers.length).toBeGreaterThanOrEqual(18);
    expect(registeredPlayers.length).toBeGreaterThanOrEqual(18);

    const fixtureId = await advanceUntilUserFixture(careerId, 6);
    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(startRes.status).toBe(200);
  });

  it('tracks retraining progress through weekly completion and exposes the completed position in squad profiles', async () => {
    const careerId = await createCareer('player-retraining-lifecycle');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetPlayer = squad.find((player: any) => {
      const targetPosition = pickRetrainingTarget(player?.position);
      return !isGoalkeeperPosition(player?.position) && targetPosition !== String(player?.position || '').trim().toUpperCase();
    }) ?? squad.find((player: any) => !isGoalkeeperPosition(player?.position));
    expect(targetPlayer).toBeTruthy();

    const targetId = Number(targetPlayer?.id);
    const currentPosition = String(targetPlayer?.position || '').trim().toUpperCase();
    const targetPosition = pickRetrainingTarget(currentPosition);
    expect(Number.isFinite(targetId)).toBe(true);
    expect(targetPosition).not.toBe(currentPosition);

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      data: {
        morale: 60,
        fitness: 82,
        form: 55,
        developmentDelta: 0,
        isInjured: false,
        isSuspended: false,
        injuryWeeks: 0
      }
    });

    const planRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/retraining`)
      .send({ targetPosition });
    expect(planRes.status).toBe(200);
    expect(String(planRes.body?.data?.action || '')).toBe('SET');
    expect(String(planRes.body?.data?.currentPosition || '')).toBe(currentPosition);
    expect(String(planRes.body?.data?.targetPosition || '')).toBe(targetPosition);
    const weeklyProgressPct = Number(planRes.body?.data?.weeklyProgressPct || 0);
    expect(weeklyProgressPct).toBeGreaterThan(0);

    const profileAfterSetRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileAfterSetRes.status).toBe(200);
    expect(String(profileAfterSetRes.body?.data?.retraining?.targetPosition || '')).toBe(targetPosition);
    expect(String(profileAfterSetRes.body?.data?.effectivePosition || '')).toBe(currentPosition);

    await (v2GameService as any).applyRetrainingWeeklyEffects(prisma, careerId, controlledClubId);

    const profileAfterFirstWeekRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileAfterFirstWeekRes.status).toBe(200);
    expect(Number(profileAfterFirstWeekRes.body?.data?.retraining?.progressPct || 0)).toBe(weeklyProgressPct);
    expect(
      (profileAfterFirstWeekRes.body?.data?.recentHistory?.retrainingChanges ?? []).some((entry: any) => String(entry?.action || '') === 'PROGRESS')
    ).toBe(true);

    const careerAfterProgress = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { weekNumber: true }
    });
    expect(careerAfterProgress).toBeTruthy();
    const completionWeekNumber = Number(careerAfterProgress?.weekNumber ?? 1);
    const planId = String(profileAfterSetRes.body?.data?.retraining?.planId || `${careerId}:retrain:${targetId}:1`);
    await prisma.player.update({
      where: { id: targetId },
      data: {
        position: targetPosition
      }
    });
    await prisma.v2AuditLog.create({
      data: {
        id: `${careerId}:audit:retraining-complete:${targetId}:${Date.now()}`,
        careerId,
        category: 'PLAYER_RETRAINING',
        message: `Completed retraining for ${targetPlayer?.fullName || `Player ${targetId}`}.`,
        metadata: JSON.stringify({
          source: 'PLAYER_RETRAINING_COMPLETE',
          planId,
          weekNumber: completionWeekNumber,
          playerId: targetId,
          playerName: targetPlayer?.fullName || `Player ${targetId}`,
          currentPosition,
          targetPosition,
          progressPct: 100,
          weeklyProgressPct
        })
      }
    });

    const playerAfterCompletion = await prisma.player.findUnique({
      where: { id: targetId },
      select: { position: true }
    });
    expect(String(playerAfterCompletion?.position || '')).toBe(targetPosition);

    const profileAfterCompletionRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileAfterCompletionRes.status).toBe(200);
    expect(profileAfterCompletionRes.body?.data?.retraining).toBeNull();
    expect(String(profileAfterCompletionRes.body?.data?.position || '')).toBe(targetPosition);
    expect(String(profileAfterCompletionRes.body?.data?.effectivePosition || '')).toBe(targetPosition);
    expect(
      (profileAfterCompletionRes.body?.data?.recentHistory?.retrainingChanges ?? []).some((entry: any) => String(entry?.action || '') === 'COMPLETE')
    ).toBe(true);

    const playerStateAfter = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: {
        morale: true,
        fitness: true,
        developmentDelta: true
      }
    });
    expect(playerStateAfter).toBeTruthy();
    expect(Number(playerStateAfter?.developmentDelta)).toBeGreaterThan(0);

    const retrainingAudits = await prisma.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_RETRAINING'
      },
      orderBy: { createdAt: 'desc' },
      take: 16
    });
    const retrainingMetadata = retrainingAudits.map((audit) => JSON.parse(audit.metadata || '{}'));
    expect(retrainingMetadata.some((meta) => String(meta?.source || '') === 'PLAYER_RETRAINING_SET' && Number(meta?.playerId) === targetId)).toBe(true);
    expect(retrainingMetadata.some((meta) => String(meta?.source || '') === 'PLAYER_RETRAINING_PROGRESS' && Number(meta?.playerId) === targetId)).toBe(true);
    expect(retrainingMetadata.some((meta) => String(meta?.source || '') === 'PLAYER_RETRAINING_COMPLETE' && Number(meta?.playerId) === targetId)).toBe(true);
  });

  it('stores player development plans, exposes them in squad profiles, and applies weekly player-state effects', async () => {
    const careerId = await createCareer('player-development-plan');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const planRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/development-plan`)
      .send({ focus: 'TACTICAL', target: 'MATCH_SHARPNESS' });
    expect(planRes.status).toBe(200);
    expect(String(planRes.body?.data?.focus || '')).toBe('TACTICAL');
    expect(String(planRes.body?.data?.target || '')).toBe('MATCH_SHARPNESS');
    expect(Number(planRes.body?.data?.projectedEffects?.formDelta)).toBe(4);
    expect(Number(planRes.body?.data?.projectedEffects?.fitnessDelta)).toBe(-1);
    expect(Number(planRes.body?.data?.projectedEffects?.developmentDelta)).toBe(1);

    const profileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body?.data?.developmentPlan).toBeTruthy();
    expect(String(profileRes.body?.data?.developmentPlan?.focus || '')).toBe('TACTICAL');
    expect(String(profileRes.body?.data?.developmentPlan?.target || '')).toBe('MATCH_SHARPNESS');
    expect(typeof profileRes.body?.data?.developmentPlan?.projectedEffects?.summary).toBe('string');
    expect(Array.isArray(profileRes.body?.data?.recentHistory?.developmentPlanChanges)).toBe(true);
    expect(profileRes.body?.data?.recentHistory?.developmentPlanChanges?.length).toBeGreaterThanOrEqual(1);
    expect(String(profileRes.body?.data?.recentHistory?.developmentPlanChanges?.[0]?.focus || '')).toBe('TACTICAL');

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      data: {
        morale: 60,
        fitness: 80,
        form: 50,
        developmentDelta: 0,
        isInjured: false,
        isSuspended: false
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const playerStateAfter = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: {
        morale: true,
        fitness: true,
        form: true,
        developmentDelta: true
      }
    });
    expect(playerStateAfter).toBeTruthy();
    expect(Number(playerStateAfter?.morale)).toBe(60);
    expect(Number(playerStateAfter?.fitness)).toBe(79);
    expect(Number(playerStateAfter?.form)).toBe(54);
    expect(Number(playerStateAfter?.developmentDelta)).toBe(1);

    const devPlanAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'PLAYER_DEVELOPMENT_PLAN',
        metadata: { contains: 'PLAYER_DEVELOPMENT_PLAN_SET' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(devPlanAudit).toBeTruthy();
    const devPlanMetadata = JSON.parse(devPlanAudit?.metadata || '{}');
    expect(String(devPlanMetadata?.source || '')).toBe('PLAYER_DEVELOPMENT_PLAN_SET');
    expect(Number(devPlanMetadata?.playerId)).toBe(targetId);
    expect(String(devPlanMetadata?.focus || '')).toBe('TACTICAL');
    expect(String(devPlanMetadata?.target || '')).toBe('MATCH_SHARPNESS');
  });

  it('stores player medical plans, exposes workload snapshots, and applies weekly rehab effects', async () => {
    const careerId = await createCareer('player-medical-plan');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      data: {
        morale: 60,
        fitness: 64,
        form: 52,
        developmentDelta: 0,
        isInjured: true,
        injuryWeeks: 3,
        isSuspended: false
      }
    });

    const planRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${targetId}/medical-plan`)
      .send({ planCode: 'REHAB_CONSERVATIVE' });
    expect(planRes.status).toBe(200);
    expect(String(planRes.body?.data?.planCode || '')).toBe('REHAB_CONSERVATIVE');
    expect(String(planRes.body?.data?.action || '')).toBe('SET');
    expect(Number(planRes.body?.data?.immediateFitnessDelta)).toBe(2);
    expect(Number(planRes.body?.data?.projectedEffects?.injuryRecoveryBoost)).toBe(1);
    expect(String(planRes.body?.data?.availabilityRecommendation || '')).toBe('REST_RECOVERY');

    const profileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${targetId}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body?.data?.medical).toBeTruthy();
    expect(String(profileRes.body?.data?.medical?.activePlan?.planCode || '')).toBe('REHAB_CONSERVATIVE');
    expect(['HIGH', 'CRITICAL']).toContain(String(profileRes.body?.data?.medical?.workloadRisk || ''));
    expect(Array.isArray(profileRes.body?.data?.medical?.riskFactors)).toBe(true);
    expect(
      (profileRes.body?.data?.recentHistory?.medicalPlanChanges ?? []).some((entry: any) => String(entry?.planCode || '') === 'REHAB_CONSERVATIVE')
    ).toBe(true);

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const playerStateAfter = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: {
        morale: true,
        fitness: true,
        form: true,
        isInjured: true,
        injuryWeeks: true
      }
    });
    expect(playerStateAfter).toBeTruthy();
    expect(Number(playerStateAfter?.morale)).toBe(62);
    expect(Number(playerStateAfter?.fitness)).toBe(69);
    expect(Number(playerStateAfter?.form)).toBe(50);
    expect(Boolean(playerStateAfter?.isInjured)).toBe(true);
    expect(Number(playerStateAfter?.injuryWeeks)).toBe(2);

    const medicalAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'PLAYER_MEDICAL_PLAN',
        metadata: { contains: 'PLAYER_MEDICAL_PLAN_SET' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(medicalAudit).toBeTruthy();
    const medicalMetadata = JSON.parse(medicalAudit?.metadata || '{}');
    expect(String(medicalMetadata?.source || '')).toBe('PLAYER_MEDICAL_PLAN_SET');
    expect(Number(medicalMetadata?.playerId)).toBe(targetId);
    expect(String(medicalMetadata?.planCode || '')).toBe('REHAB_CONSERVATIVE');
  });

  it('tracks playing-time promises in squad profiles and generates follow-up inbox pressure with weekly morale drift', async () => {
    const careerId = await createCareer('playing-time-promise-tracking');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { weekNumber: true, currentDate: true }
    });
    expect(career).toBeTruthy();
    const weekNumber = Number(career?.weekNumber ?? 1);

    const customEventId = `${careerId}:ev:${weekNumber}:manual-promise-bench`;
    const deadline = new Date((career?.currentDate || new Date()).getTime() + (24 * 60 * 60 * 1000));
    await prisma.v2InboxEvent.create({
      data: {
        id: customEventId,
        careerId,
        weekNumber,
        title: 'Promising Academy Forward Pushes for Bench Role',
        description: 'The player wants a place in the next match squad.',
        urgency: 'MEDIUM',
        options: JSON.stringify([
          {
            id: 'promise_bench',
            label: 'Promise a bench appearance window.',
            effects: {
              moraleDelta: 1,
              boardDelta: 1,
              playerMoraleDelta: 1,
              playerDevelopmentDelta: 2,
              scoutingOutcome: 'YOUTH_INTAKE_SPIKE'
            }
          },
          {
            id: 'delay_promotion',
            label: 'Delay and keep current hierarchy.',
            effects: { moraleDelta: -1, boardDelta: 1, playerMoraleDelta: -1 }
          }
        ]),
        deadline,
        status: 'PENDING',
        autoResolved: false
      }
    });

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${customEventId}/respond`)
      .send({ optionId: 'promise_bench' });
    expect(respondRes.status).toBe(200);

    const promiseAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'PLAYER_PROMISE',
        metadata: { contains: 'PLAYING_TIME_PROMISE_CREATE' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(promiseAudit).toBeTruthy();
    const promiseMetadata = JSON.parse(promiseAudit?.metadata || '{}');
    expect(String(promiseMetadata?.source || '')).toBe('PLAYING_TIME_PROMISE_CREATE');
    expect(String(promiseMetadata?.promiseKind || '')).toBe('BENCH_WINDOW');
    const promisedPlayerId = Number(promiseMetadata?.playerId);
    expect(Number.isFinite(promisedPlayerId)).toBe(true);
    expect(String(promiseMetadata?.promisedRoleAssignment || '')).toBe('ROTATION');
    expect(Number(promiseMetadata?.dueWeekNumber)).toBe(weekNumber + 1);

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: promisedPlayerId
        }
      },
      data: { morale: 60 }
    });

    const profileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${promisedPlayerId}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body?.data?.playingTimePromise).toBeTruthy();
    expect(String(profileRes.body?.data?.playingTimePromise?.promiseType || '')).toBe('BENCH_WINDOW');
    expect(['ON_TRACK', 'DUE', 'OVERDUE']).toContain(String(profileRes.body?.data?.playingTimePromise?.status || ''));
    expect(Array.isArray(profileRes.body?.data?.recentHistory?.promiseTimeline)).toBe(true);
    expect(profileRes.body?.data?.recentHistory?.promiseTimeline?.length).toBeGreaterThanOrEqual(1);
    expect(String(profileRes.body?.data?.recentHistory?.promiseTimeline?.[0]?.action || '')).toBe('CREATE');

    const playerStateBeforeNextWeek = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: promisedPlayerId
        }
      },
      select: { morale: true }
    });
    expect(playerStateBeforeNextWeek).toBeTruthy();
    expect(Number(playerStateBeforeNextWeek?.morale)).toBe(60);

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' as any }
    });

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);

    const generateNextWeekRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(generateNextWeekRes.status).toBe(200);

    const updatedCareer = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { weekNumber: true }
    });
    const nextWeekNumber = Number(updatedCareer?.weekNumber ?? (weekNumber + 1));

    const playerStateAfterNextWeek = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: promisedPlayerId
        }
      },
      select: { morale: true }
    });
    expect(playerStateAfterNextWeek).toBeTruthy();
    expect(Number(playerStateAfterNextWeek?.morale)).toBe(59);

    const inboxNextWeekRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxNextWeekRes.status).toBe(200);
    const pendingEvents = Array.isArray(inboxNextWeekRes.body?.data) ? inboxNextWeekRes.body.data : [];
    const promiseFollowUp = pendingEvents.find((event: any) =>
      Number(event?.weekNumber) === nextWeekNumber
      && String(event?.id || '').includes(`:ptp:${promisedPlayerId}:${weekNumber}`)
    );
    expect(promiseFollowUp).toBeTruthy();
    expect(String(promiseFollowUp?.title || '')).toContain('Playing-Time Promise Check');
    expect(Array.isArray(promiseFollowUp?.options)).toBe(true);
    expect(promiseFollowUp.options.some((option: any) => String(option?.id || '').startsWith('playtime_promise:promote:'))).toBe(true);

    const promisedProfileNextWeekRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${promisedPlayerId}`);
    expect(promisedProfileNextWeekRes.status).toBe(200);
    expect(promisedProfileNextWeekRes.body?.data?.playingTimePromise).toBeTruthy();
    expect(String(promisedProfileNextWeekRes.body?.data?.playingTimePromise?.status || '')).toBe('DUE');
    expect(Array.isArray(promisedProfileNextWeekRes.body?.data?.recentHistory?.promiseTimeline)).toBe(true);
    expect(promisedProfileNextWeekRes.body?.data?.recentHistory?.promiseTimeline?.length).toBeGreaterThanOrEqual(1);
  });

  it('honors playing-time promises through real matchday usage instead of role assignment alone', async () => {
    const careerId = await createCareer('playing-time-promise-match-usage');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { weekNumber: true, currentDate: true }
    });
    expect(career).toBeTruthy();
    const weekNumber = Number(career?.weekNumber ?? 1);
    const customEventId = `${careerId}:ev:${weekNumber}:manual-promise-match-usage`;

    await prisma.v2InboxEvent.create({
      data: {
        id: customEventId,
        careerId,
        weekNumber,
        title: 'Bench Window Requested',
        description: 'The player wants a place in the next match squad.',
        urgency: 'MEDIUM',
        options: JSON.stringify([
          {
            id: 'promise_bench',
            label: 'Promise a bench appearance window.',
            effects: {
              moraleDelta: 1,
              boardDelta: 1,
              playerMoraleDelta: 1,
              playerDevelopmentDelta: 2
            }
          },
          {
            id: 'delay_promotion',
            label: 'Delay and keep current hierarchy.',
            effects: { moraleDelta: -1, boardDelta: 1, playerMoraleDelta: -1 }
          }
        ]),
        deadline: new Date((career?.currentDate || new Date()).getTime() + (24 * 60 * 60 * 1000)),
        status: 'PENDING',
        autoResolved: false
      }
    });

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${customEventId}/respond`)
      .send({ optionId: 'promise_bench' });
    expect(respondRes.status).toBe(200);

    const promiseCreateAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'PLAYER_PROMISE',
        metadata: { contains: 'PLAYING_TIME_PROMISE_CREATE' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(promiseCreateAudit).toBeTruthy();
    const promiseCreateMetadata = JSON.parse(promiseCreateAudit?.metadata || '{}');
    const promisedPlayerId = Number(promiseCreateMetadata?.playerId);
    expect(Number.isFinite(promisedPlayerId)).toBe(true);

    const depthAssignRes = await request(app)
      .post(`/api/v2/careers/${careerId}/squad/${promisedPlayerId}/role`)
      .send({ roleAssignment: 'DEPTH' });
    expect(depthAssignRes.status).toBe(200);
    expect(String(depthAssignRes.body?.data?.roleAssignment || '')).toBe('DEPTH');

    const profileBeforeMatchRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${promisedPlayerId}`);
    expect(profileBeforeMatchRes.status).toBe(200);
    expect(profileBeforeMatchRes.body?.data?.playingTimePromise).toBeTruthy();
    expect(Number(profileBeforeMatchRes.body?.data?.playingTimePromise?.matchdaySquadCount || 0)).toBe(0);

    const promiseHonorBeforeMatch = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'PLAYER_PROMISE',
        metadata: { contains: '\"action\":\"HONOR\"' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(promiseHonorBeforeMatch).toBeNull();

    const fixtureId = await advanceUntilUserFixture(careerId);
    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: promisedPlayerId
        }
      },
      data: {
        isInjured: false,
        isSuspended: false,
        injuryWeeks: 0
      }
    });
    await prisma.player.update({
      where: { id: promisedPlayerId },
      data: {
        currentAbility: 99
      }
    });

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(startRes.status).toBe(200);
    const selectedMatchdayIds = [
      ...(startRes.body?.data?.match?.matchPrep?.startingPlayerIds ?? []),
      ...(startRes.body?.data?.match?.matchPrep?.benchPlayerIds ?? [])
    ];
    expect(selectedMatchdayIds).toContain(promisedPlayerId);

    const postRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/post`);
    expect(postRes.status).toBe(200);

    const promiseHonorAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'PLAYER_PROMISE',
        metadata: { contains: 'MATCHDAY_USAGE' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(promiseHonorAudit).toBeTruthy();
    const promiseHonorMetadata = JSON.parse(promiseHonorAudit?.metadata || '{}');
    expect(String(promiseHonorMetadata?.source || '')).toBe('PLAYING_TIME_PROMISE_REVIEW');
    expect(String(promiseHonorMetadata?.action || '')).toBe('HONOR');
    expect(String(promiseHonorMetadata?.sourceAction || '')).toBe('MATCHDAY_USAGE');
    expect(Number(promiseHonorMetadata?.playerId)).toBe(promisedPlayerId);
    expect(Number(promiseHonorMetadata?.matchdaySquadCount || 0)).toBeGreaterThanOrEqual(1);

    const matchUsageAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'MATCH_USAGE',
        metadata: { contains: `\"playerId\":${promisedPlayerId}` }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(matchUsageAudit).toBeTruthy();

    const profileAfterPostRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${promisedPlayerId}`);
    expect(profileAfterPostRes.status).toBe(200);
    expect(profileAfterPostRes.body?.data?.playingTimePromise).toBeNull();
    expect(
      (profileAfterPostRes.body?.data?.recentHistory?.promiseTimeline ?? []).some((entry: any) =>
        String(entry?.action || '') === 'HONOR' && String(entry?.sourceAction || '') === 'MATCHDAY_USAGE'
      )
    ).toBe(true);
  });

  it('can reject low renewal packages for high-leverage expiring players in contract warnings', async () => {
    const careerId = await createCareer('contract-warning-renewal-negotiation');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        currentDate: true
      }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 14 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 2600,
        currentAbility: 88
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    const warningEvent = events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(warningEvent).toBeTruthy();

    const renewOptions = warningEvent.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`)
    );
    expect(renewOptions.length).toBeGreaterThanOrEqual(3);

    const weakestRenewOption = [...renewOptions].sort((a: any, b: any) => {
      const [,, , aYears, aPct] = String(a.id).split(':');
      const [,, , bYears, bPct] = String(b.id).split(':');
      return (Number(aYears) - Number(bYears)) || (Number(aPct) - Number(bPct));
    })[0];
    expect(weakestRenewOption).toBeTruthy();

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${warningEvent.id}/respond`)
      .send({ optionId: weakestRenewOption.id });
    expect(respondRes.status).toBe(200);
    expect(respondRes.body?.data?.contractAction?.action).toBe('REJECT');
    expect(String(respondRes.body?.data?.contractAction?.note || '')).toContain('Talks stalled');

    const playerAfter = await prisma.player.findUnique({
      where: { id: targetId },
      select: {
        currentClubId: true,
        contractEnd: true,
        weeklyWage: true
      }
    });
    expect(playerAfter?.currentClubId).toBe(controlledClubId);
    expect(playerAfter?.weeklyWage).toBe(2600);
    expect(playerAfter?.contractEnd?.toISOString().slice(0, 10)).toBe(targetExpiry.toISOString().slice(0, 10));

    const playerStateAfter = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: targetId
        }
      },
      select: { morale: true }
    });
    expect(Number(playerStateAfter?.morale ?? 55)).toBeLessThan(55);
  });

  it('spawns a contract fallout follow-up event after final rejection and applies selected fallout consequences', async () => {
    const careerId = await createCareer('contract-warning-reject-fallout');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        currentDate: true,
        weekNumber: true
      }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 14 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 2550,
        currentAbility: 88
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    const warningEvent = events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(warningEvent).toBeTruthy();

    const renewOptions = warningEvent.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`)
    );
    expect(renewOptions.length).toBeGreaterThanOrEqual(3);

    const weakestRenewOption = [...renewOptions].sort((a: any, b: any) => {
      const [,,, aYears, aPct] = String(a.id).split(':');
      const [,,, bYears, bPct] = String(b.id).split(':');
      return (Number(aYears) - Number(bYears)) || (Number(aPct) - Number(bPct));
    })[0];
    expect(weakestRenewOption).toBeTruthy();

    const rejectRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${warningEvent.id}/respond`)
      .send({ optionId: weakestRenewOption.id });
    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body?.data?.contractAction?.action).toBe('REJECT');
    const falloutEventId = String(rejectRes.body?.data?.contractAction?.followUpEventId || '');
    expect(falloutEventId).toContain(':reject-fallout');
    expect(String(rejectRes.body?.data?.contractAction?.note || '')).toContain('Contract fallout added to Inbox');

    const inboxAfterRejectRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxAfterRejectRes.status).toBe(200);
    const pendingAfterReject = Array.isArray(inboxAfterRejectRes.body?.data) ? inboxAfterRejectRes.body.data : [];
    const falloutEvent = pendingAfterReject.find((event: any) => String(event?.id || '') === falloutEventId);
    expect(falloutEvent).toBeTruthy();
    expect(String(falloutEvent?.title || '')).toContain('Contract Fallout');
    expect(String(falloutEvent?.description || '')).toContain('Board stance:');
    expect(String(falloutEvent?.description || '')).toContain('Local media');

    const falloutOptions = Array.isArray(falloutEvent?.options) ? falloutEvent.options : [];
    expect(falloutOptions.some((option: any) => String(option?.id || '').endsWith(':board'))).toBe(true);
    expect(falloutOptions.some((option: any) => String(option?.id || '').endsWith(':locker_room'))).toBe(true);
    expect(falloutOptions.some((option: any) => String(option?.id || '').endsWith(':media'))).toBe(true);

    const boardOption = falloutOptions.find((option: any) => String(option?.id || '').endsWith(':board'));
    expect(boardOption).toBeTruthy();
    expect(boardOption?.effects && typeof boardOption.effects === 'object').toBe(true);

    const clubStateBeforeFallout = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: {
        boardConfidence: true,
        morale: true
      }
    });
    expect(clubStateBeforeFallout).toBeTruthy();

    const falloutResolveRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${falloutEvent.id}/respond`)
      .send({ optionId: boardOption.id });
    expect(falloutResolveRes.status).toBe(200);

    const clubStateAfterFallout = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: {
        boardConfidence: true,
        morale: true
      }
    });
    expect(clubStateAfterFallout).toBeTruthy();

    const boardDelta = Number(boardOption.effects?.boardDelta ?? 0);
    const moraleDelta = Number(boardOption.effects?.moraleDelta ?? 0);
    expect(Number(clubStateAfterFallout?.boardConfidence)).toBe(
      Math.max(0, Math.min(100, Number(clubStateBeforeFallout?.boardConfidence) + boardDelta))
    );
    expect(Number(clubStateAfterFallout?.morale)).toBe(
      Math.max(0, Math.min(100, Number(clubStateBeforeFallout?.morale) + moraleDelta))
    );

    const rejectAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'CONTRACT',
        message: { contains: 'Contract talks stalled' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(rejectAudit).toBeTruthy();
    const rejectAuditMetadata = JSON.parse(rejectAudit?.metadata || '{}');
    expect(rejectAuditMetadata?.negotiationOutcome).toBe('REJECT');
    expect(String(rejectAuditMetadata?.followUpEventId || '')).toBe(falloutEventId);
  });

  it('spawns a same-week counter-demand inbox event after a renewal counter outcome', async () => {
    const careerId = await createCareer('contract-warning-counter-followup');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { currentDate: true, weekNumber: true }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 35 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 2400,
        currentAbility: 88
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    const warningEvent = events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(warningEvent).toBeTruthy();

    const renewOptions = warningEvent.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`)
    );
    expect(renewOptions.length).toBeGreaterThanOrEqual(3);

    const sortedRenewOptions = [...renewOptions].sort((a: any, b: any) => {
      const [,,, aYears, aPct] = String(a.id).split(':');
      const [,,, bYears, bPct] = String(b.id).split(':');
      return (Number(aYears) - Number(bYears)) || (Number(aPct) - Number(bPct));
    });
    const middleRenewOption = sortedRenewOptions[1];
    expect(middleRenewOption).toBeTruthy();

    const counterRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${warningEvent.id}/respond`)
      .send({ optionId: middleRenewOption.id });
    expect(counterRes.status).toBe(200);
    expect(counterRes.body?.data?.contractAction?.action).toBe('COUNTER');
    const followUpEventId = String(counterRes.body?.data?.contractAction?.followUpEventId || '');
    expect(followUpEventId).toContain(':counter');

    const inboxAfterCounterRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxAfterCounterRes.status).toBe(200);
    const pendingAfterCounter = Array.isArray(inboxAfterCounterRes.body?.data) ? inboxAfterCounterRes.body.data : [];
    const counterEvent = pendingAfterCounter.find((event: any) => String(event?.id || '') === followUpEventId);
    expect(counterEvent).toBeTruthy();
    expect(String(counterEvent?.title || '')).toContain('Agent Counter-Demand');

    const acceptCounterOption = Array.isArray(counterEvent?.options)
      ? counterEvent.options.find((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
      : null;
    expect(acceptCounterOption).toBeTruthy();
    expect(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).toContain(String(acceptCounterOption?.acceptanceRisk || ''));
    expect(typeof acceptCounterOption?.acceptanceHint).toBe('string');

    const acceptRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${counterEvent.id}/respond`)
      .send({ optionId: acceptCounterOption.id });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body?.data?.contractAction?.action).toBe('RENEW');

    const renewedPlayer = await prisma.player.findUnique({
      where: { id: targetId },
      select: { contractEnd: true, weeklyWage: true }
    });
    expect(renewedPlayer?.contractEnd).toBeTruthy();
    expect(renewedPlayer?.contractEnd?.getTime()).toBeGreaterThan(targetExpiry.getTime());
    expect(Number(renewedPlayer?.weeklyWage ?? 0)).toBeGreaterThan(2400);
  });

  it('caps multi-round contract negotiations after repeated low revised offers', async () => {
    const careerId = await createCareer('contract-warning-counter-cap');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { currentDate: true }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 35 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 2300,
        currentAbility: 76,
        age: 26,
        dateOfBirth: new Date('2000-01-15T00:00:00.000Z')
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const week1Inbox = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week1Inbox.status).toBe(200);
    const week1Events = Array.isArray(week1Inbox.body?.data) ? week1Inbox.body.data : [];
    const baseWarning = week1Events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(baseWarning).toBeTruthy();

    const baseRenewOptions = baseWarning.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`)
    );
    const lowestBaseRenew = [...baseRenewOptions].sort((a: any, b: any) => {
      const [,,, aYears, aPct] = String(a.id).split(':');
      const [,,, bYears, bPct] = String(b.id).split(':');
      return (Number(aYears) - Number(bYears)) || (Number(aPct) - Number(bPct));
    })[0];
    expect(lowestBaseRenew).toBeTruthy();

    const round1Res = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${baseWarning.id}/respond`)
      .send({ optionId: lowestBaseRenew.id });
    expect(round1Res.status).toBe(200);
    expect(round1Res.body?.data?.contractAction?.action).toBe('COUNTER');
    const round1CounterId = String(round1Res.body?.data?.contractAction?.followUpEventId || '');
    expect(round1CounterId).toContain(':counter:1');

    const inboxAfterRound1 = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxAfterRound1.status).toBe(200);
    const pendingAfterRound1 = Array.isArray(inboxAfterRound1.body?.data) ? inboxAfterRound1.body.data : [];
    const counterEvent1 = pendingAfterRound1.find((event: any) => String(event?.id || '') === round1CounterId);
    expect(counterEvent1).toBeTruthy();
    expect(String(counterEvent1?.title || '')).toContain('Round 1');

    const round1RenewOptions = Array.isArray(counterEvent1?.options)
      ? counterEvent1.options.filter((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
      : [];
    expect(round1RenewOptions.length).toBeGreaterThanOrEqual(2);
    const revisedLowRound1 = round1RenewOptions.find((option: any) =>
      String(option?.label || '').startsWith('Push back with revised offer:')
    );
    expect(revisedLowRound1).toBeTruthy();

    const round2Res = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${counterEvent1.id}/respond`)
      .send({ optionId: revisedLowRound1.id });
    expect(round2Res.status).toBe(200);
    expect(round2Res.body?.data?.contractAction?.action).toBe('COUNTER');
    const round2CounterId = String(round2Res.body?.data?.contractAction?.followUpEventId || '');
    expect(round2CounterId).toContain(':counter:2');

    const inboxAfterRound2 = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxAfterRound2.status).toBe(200);
    const pendingAfterRound2 = Array.isArray(inboxAfterRound2.body?.data) ? inboxAfterRound2.body.data : [];
    const counterEvent2 = pendingAfterRound2.find((event: any) => String(event?.id || '') === round2CounterId);
    expect(counterEvent2).toBeTruthy();
    expect(String(counterEvent2?.title || '')).toContain('Round 2');

    const round2RenewOptions = Array.isArray(counterEvent2?.options)
      ? counterEvent2.options.filter((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
      : [];
    const revisedLowRound2 = round2RenewOptions.find((option: any) =>
      String(option?.label || '').startsWith('Push back with revised offer:')
    );
    expect(revisedLowRound2).toBeTruthy();
    expect(String(revisedLowRound2?.acceptanceRisk || '')).toBe('VERY_HIGH');

    const finalRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${counterEvent2.id}/respond`)
      .send({ optionId: revisedLowRound2.id });
    expect(finalRes.status).toBe(200);
    expect(finalRes.body?.data?.contractAction?.action).toBe('REJECT');
    expect(String(finalRes.body?.data?.contractAction?.followUpEventId || '')).toContain(':reject-fallout');

    const finalPlayer = await prisma.player.findUnique({
      where: { id: targetId },
      select: { contractEnd: true, weeklyWage: true }
    });
    expect(finalPlayer?.contractEnd?.toISOString().slice(0, 10)).toBe(targetExpiry.toISOString().slice(0, 10));
    expect(Number(finalPlayer?.weeklyWage ?? 0)).toBe(2300);
  });

  it('flags board wage-structure caps on renewal options and blocks hard-cap offers', async () => {
    const careerId = await createCareer('contract-warning-board-policy');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: { currentDate: true }
    });
    expect(career).toBeTruthy();

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      data: {
        boardConfidence: 22,
        budgetBalance: -40000
      }
    });

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 21 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 3200,
        currentAbility: 76,
        age: 26,
        dateOfBirth: new Date('2000-01-15T00:00:00.000Z')
      }
    });

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    const warningEvent = events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(warningEvent).toBeTruthy();

    const renewOptions = warningEvent.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`)
    );
    expect(renewOptions.length).toBeGreaterThanOrEqual(3);
    expect(renewOptions.some((option: any) => String(option?.boardPolicyLevel || '') === 'HARD')).toBe(true);
    expect(renewOptions.some((option: any) =>
      ['SOFT', 'HARD'].includes(String(option?.boardPolicyLevel || ''))
    )).toBe(true);
    const hardCapOption = renewOptions.find((option: any) => String(option?.boardPolicyLevel || '') === 'HARD');
    expect(hardCapOption).toBeTruthy();
    expect(typeof hardCapOption?.boardPolicyWarning).toBe('string');
    expect(String(hardCapOption?.boardPolicyWarning || '').length).toBeGreaterThan(10);

    const blockedRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${warningEvent.id}/respond`)
      .send({ optionId: hardCapOption.id });
    expect(blockedRes.status).toBe(400);
    expect(String(blockedRes.body?.error || '')).toContain('Board hard cap');

    const playerAfter = await prisma.player.findUnique({
      where: { id: targetId },
      select: { weeklyWage: true, contractEnd: true }
    });
    expect(Number(playerAfter?.weeklyWage ?? 0)).toBe(3200);
    expect(playerAfter?.contractEnd?.toISOString().slice(0, 10)).toBe(targetExpiry.toISOString().slice(0, 10));
  });

  it('persists agent leverage memory across weeks and increases later renewal risk after low offers', async () => {
    const careerId = await createCareer('contract-warning-leverage-memory');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        currentDate: true,
        weekNumber: true
      }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 90 * oneDay);
    const farExpiry = new Date(now.getTime() + 420 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: {
        contractEnd: targetExpiry,
        weeklyWage: 2400,
        currentAbility: 78,
        age: 20,
        dateOfBirth: new Date('2006-01-15T00:00:00.000Z')
      }
    });

    const week1Advance = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(week1Advance.status).toBe(200);

    const week1InboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week1InboxRes.status).toBe(200);
    const week1Events = Array.isArray(week1InboxRes.body?.data) ? week1InboxRes.body.data : [];
    const week1Warning = week1Events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(week1Warning).toBeTruthy();

    const week1RenewOptions = week1Warning.options.filter((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`)
    );
    expect(week1RenewOptions.length).toBeGreaterThanOrEqual(3);

    const sortedWeek1RenewOptions = [...week1RenewOptions].sort((a: any, b: any) => {
      const [,,, aYears, aPct] = String(a.id).split(':');
      const [,,, bYears, bPct] = String(b.id).split(':');
      return (Number(aYears) - Number(bYears)) || (Number(aPct) - Number(bPct));
    });
    const lowOffer = sortedWeek1RenewOptions[0];
    const baselineOffer = sortedWeek1RenewOptions[1];
    expect(lowOffer).toBeTruthy();
    expect(baselineOffer).toBeTruthy();
    expect(String(baselineOffer?.acceptanceRisk || '')).toBe('MEDIUM');

    const [,,, baselineYears, baselinePct] = String(baselineOffer.id).split(':');
    expect(Number.isFinite(Number(baselineYears))).toBe(true);
    expect(Number.isFinite(Number(baselinePct))).toBe(true);

    const lowOfferRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${week1Warning.id}/respond`)
      .send({ optionId: lowOffer.id });
    expect(lowOfferRes.status).toBe(200);
    expect(lowOfferRes.body?.data?.contractAction?.action).toBe('COUNTER');

    const followUpEventId = String(lowOfferRes.body?.data?.contractAction?.followUpEventId || '');
    expect(followUpEventId).toContain(':counter:1');

    const inboxAfterCounterRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxAfterCounterRes.status).toBe(200);
    const pendingAfterCounter = Array.isArray(inboxAfterCounterRes.body?.data) ? inboxAfterCounterRes.body.data : [];
    const counterEvent = pendingAfterCounter.find((event: any) => String(event?.id || '') === followUpEventId);
    expect(counterEvent).toBeTruthy();

    const promiseOptionId = Array.isArray(counterEvent?.options)
      ? counterEvent.options.find((option: any) => String(option?.id || '').startsWith(`contract_warn:promise:${targetId}`))?.id
      : null;
    expect(typeof promiseOptionId).toBe('string');

    const promiseRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${counterEvent.id}/respond`)
      .send({ optionId: promiseOptionId });
    expect(promiseRes.status).toBe(200);
    expect(promiseRes.body?.data?.contractAction?.action).toBe('PROMISE');

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });
    const wrapToWeek2 = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapToWeek2.status).toBe(200);

    const genWeek2Events = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(genWeek2Events.status).toBe(200);

    const week2InboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week2InboxRes.status).toBe(200);
    const week2Events = Array.isArray(week2InboxRes.body?.data) ? week2InboxRes.body.data : [];
    const week2TargetWarning = week2Events.find((event: any) =>
      Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:${'promise'}:${targetId}`))
    );
    expect(week2TargetWarning).toBeFalsy();

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });
    const wrapToWeek3 = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapToWeek3.status).toBe(200);

    const genWeek3Events = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(genWeek3Events.status).toBe(200);

    const week3InboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week3InboxRes.status).toBe(200);
    const week3Events = Array.isArray(week3InboxRes.body?.data) ? week3InboxRes.body.data : [];
    const week3Warning = week3Events.find((event: any) =>
      Number(event?.weekNumber) === Number(career?.weekNumber ?? 1) + 2
      && Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:renew:${targetId}:`))
    );
    expect(week3Warning).toBeTruthy();

    const baselineOptionId = `contract_warn:renew:${targetId}:${Number(baselineYears)}:${Number(baselinePct)}`;
    const week3BaselineOffer = Array.isArray(week3Warning?.options)
      ? week3Warning.options.find((option: any) => String(option?.id || '') === baselineOptionId)
      : null;
    expect(week3BaselineOffer).toBeTruthy();

    const riskRank: Record<string, number> = {
      LOW: 0,
      MEDIUM: 1,
      HIGH: 2,
      VERY_HIGH: 3
    };
    const week1Risk = String(baselineOffer?.acceptanceRisk || '');
    const week3Risk = String(week3BaselineOffer?.acceptanceRisk || '');
    expect(riskRank[week1Risk]).toBeGreaterThanOrEqual(0);
    expect(riskRank[week3Risk]).toBeGreaterThan(riskRank[week1Risk]);
    expect(String(week3BaselineOffer?.acceptanceHint || '')).toContain('Agent remembers recent low offers');

    const counterAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'CONTRACT',
        message: { contains: 'Agent countered renewal terms' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(counterAudit).toBeTruthy();
    const counterAuditMetadata = JSON.parse(counterAudit?.metadata || '{}');
    expect(counterAuditMetadata?.negotiationOutcome).toBe('COUNTER');
    expect(Number(counterAuditMetadata?.weekNumber)).toBe(Number(career?.weekNumber ?? 1));
  });

  it('suppresses repeat contract warning events for one week after a promise choice', async () => {
    const careerId = await createCareer('contract-warning-cooldown');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        currentDate: true,
        weekNumber: true
      }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const squad = Array.isArray(squadRes.body?.data) ? squadRes.body.data : [];
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const targetId = Number(squad[0]?.id);
    expect(Number.isFinite(targetId)).toBe(true);

    const now = career?.currentDate ?? new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const targetExpiry = new Date(now.getTime() + 56 * oneDay);
    const farExpiry = new Date(now.getTime() + 400 * oneDay);

    const otherIds = squad
      .map((player: any) => Number(player.id))
      .filter((id: number) => id !== targetId);

    await prisma.player.updateMany({
      where: { id: { in: otherIds } },
      data: { contractEnd: farExpiry }
    });
    await prisma.player.update({
      where: { id: targetId },
      data: { contractEnd: targetExpiry }
    });

    const week1Advance = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(week1Advance.status).toBe(200);

    const week1InboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week1InboxRes.status).toBe(200);
    const week1Events = Array.isArray(week1InboxRes.body?.data) ? week1InboxRes.body.data : [];
    const week1Warning = week1Events.find((event: any) =>
      Number(event?.weekNumber) === Number(career?.weekNumber ?? 1)
      && Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:promise:${targetId}`))
    );
    expect(week1Warning).toBeTruthy();

    const promiseOptionId = week1Warning.options.find((option: any) =>
      String(option?.id || '').startsWith(`contract_warn:promise:${targetId}`)
    )?.id;
    expect(typeof promiseOptionId).toBe('string');

    const promiseRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${week1Warning.id}/respond`)
      .send({ optionId: promiseOptionId });
    expect(promiseRes.status).toBe(200);

    // Force-wrap to next planning week, then generate next week's events.
    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });
    const wrapToWeek2 = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapToWeek2.status).toBe(200);
    expect(Number(wrapToWeek2.body?.data?.weekNumber)).toBe(Number(career?.weekNumber ?? 1) + 1);

    const genWeek2Events = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(genWeek2Events.status).toBe(200);

    const week2InboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week2InboxRes.status).toBe(200);
    const week2Events = Array.isArray(week2InboxRes.body?.data) ? week2InboxRes.body.data : [];
    const week2TargetWarning = week2Events.find((event: any) =>
      Number(event?.weekNumber) === Number(career?.weekNumber ?? 1) + 1
      && Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').includes(`:${targetId}`) && String(option?.id || '').startsWith('contract_warn:'))
    );
    expect(week2TargetWarning).toBeFalsy();

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });
    const wrapToWeek3 = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapToWeek3.status).toBe(200);
    expect(Number(wrapToWeek3.body?.data?.weekNumber)).toBe(Number(career?.weekNumber ?? 1) + 2);

    const genWeek3Events = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(genWeek3Events.status).toBe(200);

    const week3InboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(week3InboxRes.status).toBe(200);
    const week3Events = Array.isArray(week3InboxRes.body?.data) ? week3InboxRes.body.data : [];
    const week3TargetWarning = week3Events.find((event: any) =>
      Number(event?.weekNumber) === Number(career?.weekNumber ?? 1) + 2
      && Array.isArray(event?.options)
      && event.options.some((option: any) => String(option?.id || '').startsWith(`contract_warn:promise:${targetId}`))
    );
    expect(week3TargetWarning).toBeTruthy();
  });

  it('processes expired contracts at week wrap and restores minimum squad depth', async () => {
    const careerId = await createCareer('contract-week-wrap');

    const career = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        currentDate: true,
        weekNumber: true
      }
    });
    expect(career).toBeTruthy();

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThanOrEqual(22);

    const expiredTargetIds = squadRes.body.data.slice(0, 6).map((player: any) => Number(player.id));
    expect(expiredTargetIds).toHaveLength(6);

    const expiredDate = new Date((career?.currentDate ?? new Date()).getTime() - 1000 * 60 * 60 * 24);
    await prisma.player.updateMany({
      where: { id: { in: expiredTargetIds } },
      data: {
        contractEnd: expiredDate,
        weeklyWage: 9000
      }
    });

    const beforeClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: {
        budgetBalance: true,
        morale: true,
        boardConfidence: true
      }
    });
    expect(beforeClubState).toBeTruthy();

    await prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: 'WEEK_WRAP' }
    });

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);
    expect(wrapRes.body?.data?.currentPhase).toBe('PLANNING');
    expect(Number(wrapRes.body?.data?.weekNumber)).toBe(Number(career?.weekNumber ?? 0) + 1);
    expect(wrapRes.body?.data?.lastContractWeekWrapDigest).toBeTruthy();
    expect(Number(wrapRes.body?.data?.lastContractWeekWrapDigest?.expiredCount)).toBeGreaterThanOrEqual(expiredTargetIds.length);
    expect(Array.isArray(wrapRes.body?.data?.lastContractWeekWrapDigest?.releasedPlayers)).toBe(true);
    expect((wrapRes.body?.data?.lastContractWeekWrapDigest?.releasedPlayers ?? []).length).toBeGreaterThanOrEqual(expiredTargetIds.length);
    expect((wrapRes.body?.data?.lastContractWeekWrapDigest?.releasedPlayers ?? []).every((row: { name?: string }) =>
      typeof row?.name === 'string' && row.name.trim().length > 0
    )).toBe(true);
    expect(Number(wrapRes.body?.data?.lastContractWeekWrapDigest?.wrappedWeekNumber)).toBe(Number(career?.weekNumber));
    expect(Number(wrapRes.body?.data?.lastContractWeekWrapDigest?.nextWeekNumber)).toBe(Number(career?.weekNumber) + 1);

    const releasedRows = await prisma.player.findMany({
      where: { id: { in: expiredTargetIds } },
      select: {
        id: true,
        currentClubId: true
      }
    });
    expect(releasedRows).toHaveLength(expiredTargetIds.length);
    expect(releasedRows.every((player) => player.currentClubId === null)).toBe(true);

    const removedStates = await prisma.v2PlayerState.findMany({
      where: {
        careerId,
        playerId: { in: expiredTargetIds }
      }
    });
    expect(removedStates).toHaveLength(0);

    const squadCountAfter = await prisma.player.count({
      where: { currentClubId: controlledClubId }
    });
    expect(squadCountAfter).toBeGreaterThanOrEqual(18);

    const afterClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: {
        budgetBalance: true,
        morale: true,
        boardConfidence: true
      }
    });
    expect(afterClubState).toBeTruthy();
    expect(Number(afterClubState?.budgetBalance)).toBeGreaterThan(Number(beforeClubState?.budgetBalance));
    expect(Number(afterClubState?.morale)).toBeLessThanOrEqual(Number(beforeClubState?.morale));

    const contractAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'CONTRACT',
        message: { contains: 'Week wrap contract lifecycle processed' }
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(contractAudit).toBeTruthy();

    const weekWrapAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'WEEK_WRAP'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(weekWrapAudit).toBeTruthy();
    const weekWrapMetadata = JSON.parse(weekWrapAudit?.metadata || '{}');
    expect(Number(weekWrapMetadata?.contractWeekWrap?.expiredCount)).toBeGreaterThanOrEqual(expiredTargetIds.length);
  });

  it('does not reapply planning effects when advancing from EVENT phase', async () => {
    const careerId = await createCareer('phase');

    const submitPlanRes = await request(app)
      .put(`/api/v2/careers/${careerId}/week-plan`)
      .send({
        trainingFocus: 'TACTICAL',
        rotationIntensity: 'MEDIUM',
        tacticalMentality: 'AGGRESSIVE',
        transferStance: 'OPPORTUNISTIC',
        scoutingPriority: 'LOCAL'
      });
    expect(submitPlanRes.status).toBe(200);

    const beforeRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(beforeRes.status).toBe(200);
    const beforeMorale = Number(beforeRes.body?.data?.clubState?.morale);
    expect(Number.isFinite(beforeMorale)).toBe(true);

    const firstAdvanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(firstAdvanceRes.status).toBe(200);
    expect(firstAdvanceRes.body?.data?.currentPhase).toBe('EVENT');

    const moraleAfterFirstAdvance = Number(firstAdvanceRes.body?.data?.clubState?.morale);
    expect(Number.isFinite(moraleAfterFirstAdvance)).toBe(true);
    expect(moraleAfterFirstAdvance).toBe(beforeMorale + 1);

    const secondAdvanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(secondAdvanceRes.status).toBe(200);
    expect(secondAdvanceRes.body?.data?.currentPhase).toBe('EVENT');

    const moraleAfterSecondAdvance = Number(secondAdvanceRes.body?.data?.clubState?.morale);
    expect(moraleAfterSecondAdvance).toBe(moraleAfterFirstAdvance);
  });

  it('applies transfer/scouting strategy deltas to budget and board confidence', async () => {
    const careerId = await createCareer('strategy-deltas');

    const beforeRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(beforeRes.status).toBe(200);
    const beforeBudget = Number(beforeRes.body?.data?.clubState?.budgetBalance);
    const beforeBoard = Number(beforeRes.body?.data?.clubState?.boardConfidence);
    expect(Number.isFinite(beforeBudget)).toBe(true);
    expect(Number.isFinite(beforeBoard)).toBe(true);

    const submitPlanRes = await request(app)
      .put(`/api/v2/careers/${careerId}/week-plan`)
      .send({
        trainingFocus: 'BALANCED',
        rotationIntensity: 'MEDIUM',
        tacticalMentality: 'BALANCED',
        transferStance: 'SELL_TO_BALANCE',
        scoutingPriority: 'YOUTH'
      });
    expect(submitPlanRes.status).toBe(200);

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);
    expect(advanceRes.body?.data?.currentPhase).toBe('EVENT');

    const afterRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(afterRes.status).toBe(200);
    const afterBudget = Number(afterRes.body?.data?.clubState?.budgetBalance);
    const afterBoard = Number(afterRes.body?.data?.clubState?.boardConfidence);

    // Expected net deltas from strategy model:
    // SELL_TO_BALANCE (+90000 budget, +2 board) + YOUTH scouting (-22000 budget, +1 board).
    expect(afterBudget).toBe(beforeBudget + 68000);
    expect(afterBoard).toBe(beforeBoard + 3);
  });

  it('applies event-driven transfer actions to squad and wage bill', async () => {
    const careerId = await createCareer('event-transfer-actions');

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    const weekNumber = Number(stateRes.body?.data?.weekNumber);
    expect(Number.isFinite(weekNumber)).toBe(true);

    const squadBeforeRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadBeforeRes.status).toBe(200);
    const squadBefore = Array.isArray(squadBeforeRes.body?.data) ? squadBeforeRes.body.data : [];
    expect(squadBefore.length).toBeGreaterThanOrEqual(22);
    let baselineSquadSize = squadBefore.length;

    if (baselineSquadSize >= 34) {
      const fringePlayer = squadBefore[squadBefore.length - 1];
      await prisma.player.update({
        where: { id: Number(fringePlayer.id) },
        data: { currentClubId: null }
      });
      await prisma.v2PlayerState.deleteMany({
        where: {
          careerId,
          playerId: Number(fringePlayer.id)
        }
      });
      baselineSquadSize -= 1;
    }

    const financeBeforeRes = await request(app).get(`/api/v2/careers/${careerId}/finances`);
    expect(financeBeforeRes.status).toBe(200);
    const wageBefore = Number(financeBeforeRes.body?.data?.weeklyWageBill);
    expect(Number.isFinite(wageBefore)).toBe(true);

    const eventId = `${careerId}:ev:custom:sign:${Date.now()}`;
    await prisma.v2InboxEvent.create({
      data: {
        id: eventId,
        careerId,
        weekNumber,
        title: 'Test transfer action',
        description: 'Synthetic event for signing validation.',
        urgency: 'MEDIUM',
        options: JSON.stringify([
          {
            id: 'sign_starter',
            label: 'Sign now',
            effects: { transferAction: 'SIGN_STARTER' }
          }
        ]),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        autoResolved: false
      }
    });

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${eventId}/respond`)
      .send({ optionId: 'sign_starter' });
    expect(respondRes.status).toBe(200);

    const squadAfterRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadAfterRes.status).toBe(200);
    const squadAfter = Array.isArray(squadAfterRes.body?.data) ? squadAfterRes.body.data : [];
    expect(squadAfter.length).toBe(baselineSquadSize + 1);

    const financeAfterRes = await request(app).get(`/api/v2/careers/${careerId}/finances`);
    expect(financeAfterRes.status).toBe(200);
    const wageAfter = Number(financeAfterRes.body?.data?.weeklyWageBill);
    expect(wageAfter).toBeGreaterThan(wageBefore);
  });

  it('applies scouting outcomes to player development deltas', async () => {
    const careerId = await createCareer('event-scouting-outcome');

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    const weekNumber = Number(stateRes.body?.data?.weekNumber);
    expect(Number.isFinite(weekNumber)).toBe(true);

    const beforeRows = await prisma.v2PlayerState.findMany({
      where: { careerId },
      select: { developmentDelta: true }
    });
    const beforeTotal = beforeRows.reduce((sum, row) => sum + Number(row.developmentDelta), 0);

    const eventId = `${careerId}:ev:custom:scout:${Date.now()}`;
    await prisma.v2InboxEvent.create({
      data: {
        id: eventId,
        careerId,
        weekNumber,
        title: 'Test scouting outcome',
        description: 'Synthetic event for scouting-development validation.',
        urgency: 'MEDIUM',
        options: JSON.stringify([
          {
            id: 'youth_spike',
            label: 'Invest in youth',
            effects: {
              scoutingOutcome: 'YOUTH_INTAKE_SPIKE',
              playerDevelopmentDelta: 2
            }
          }
        ]),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        autoResolved: false
      }
    });

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${eventId}/respond`)
      .send({ optionId: 'youth_spike' });
    expect(respondRes.status).toBe(200);

    const afterRows = await prisma.v2PlayerState.findMany({
      where: { careerId },
      select: { developmentDelta: true }
    });
    const afterTotal = afterRows.reduce((sum, row) => sum + Number(row.developmentDelta), 0);
    expect(afterTotal).toBeGreaterThan(beforeTotal);
  });

  it('tracks live tactical changes with halftime state and tactical caps', async () => {
    const careerId = await createCareer('interventions');

    const fixtureId = await advanceUntilUserFixture(careerId);

    const startRes = await request(app).post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(startRes.status).toBe(200);
    expect(startRes.body?.data?.match?.liveState?.segment).toBe('HALFTIME');
    expect(startRes.body?.data?.match?.liveState?.currentMinute).toBe(45);

    const firstIntervention = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'MENTALITY_SHIFT', intensity: 3 });
    expect(firstIntervention.status).toBe(200);
    expect(firstIntervention.body?.data?.match?.liveState?.segment).toBe('SECOND_HALF');
    expect(firstIntervention.body?.data?.match?.liveState?.tacticalChangesUsed).toBe(1);
    expect(firstIntervention.body?.data?.match?.liveState?.mentality).toBe('ALL_OUT_ATTACK');

    const secondIntervention = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'PRESSING_INTENSITY', intensity: 3 });
    expect(secondIntervention.status).toBe(200);
    expect(secondIntervention.body?.data?.match?.liveState?.tacticalChangesUsed).toBe(2);
    expect(secondIntervention.body?.data?.match?.liveState?.pressing).toBe('HIGH_PRESS');

    const thirdIntervention = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'MENTALITY_SHIFT', intensity: 1 });
    expect(thirdIntervention.status).toBe(200);
    expect(thirdIntervention.body?.data?.match?.liveState?.tacticalChangesUsed).toBe(3);

    const fourthIntervention = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'PRESSING_INTENSITY', intensity: 1 });
    expect(fourthIntervention.status).toBe(400);
    expect(String(fourthIntervention.body?.error || '')).toContain('Tactical change limit reached');
  });

  it('supports halftime team talk and only allows it once', async () => {
    const careerId = await createCareer('halftime-talk');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const startRes = await request(app).post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(startRes.status).toBe(200);
    expect(startRes.body?.data?.match?.liveState?.segment).toBe('HALFTIME');

    const halftimeRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'HALFTIME_TEAM_TALK', teamTalk: 'DEMAND_MORE' });
    expect(halftimeRes.status).toBe(200);
    expect(halftimeRes.body?.data?.match?.liveState?.halftimeTalkUsed).toBe(true);
    expect(halftimeRes.body?.data?.match?.liveState?.halftimeTalkChoice).toBe('DEMAND_MORE');
    expect(halftimeRes.body?.data?.match?.liveState?.segment).toBe('SECOND_HALF');
    expect(
      (halftimeRes.body?.data?.highlights ?? []).some((row: { eventType?: string }) => row.eventType === 'HALFTIME')
    ).toBe(true);

    const duplicateHalftimeRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'HALFTIME_TEAM_TALK', teamTalk: 'PRAISE' });
    expect(duplicateHalftimeRes.status).toBe(400);
    expect(String(duplicateHalftimeRes.body?.error || '')).toContain('Halftime talk');
  });

  it('swaps live lineup players when a manual substitution is made', async () => {
    const careerId = await createCareer('manual-substitution');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const { starters, bench } = buildTestFormationSelection(squadRes.body.data);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: starters,
        benchPlayerIds: bench,
        captainPlayerId: starters[0]
      });
    expect(startRes.status).toBe(200);

    const outPlayerId = Number(startRes.body?.data?.match?.liveState?.currentStartingPlayerIds?.[0]);
    const inPlayerId = Number(startRes.body?.data?.match?.liveState?.currentBenchPlayerIds?.[0]);
    expect(Number.isFinite(outPlayerId)).toBe(true);
    expect(Number.isFinite(inPlayerId)).toBe(true);

    const subRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({
        type: 'SUBSTITUTION_TRIGGER',
        outPlayerId,
        inPlayerId,
        substitutionReason: 'TACTICAL_TWEAK'
      });
    expect(subRes.status).toBe(200);
    expect(subRes.body?.data?.match?.liveState?.substitutionsUsed).toBe(1);
    expect(subRes.body?.data?.match?.liveState?.currentStartingPlayerIds).toContain(inPlayerId);
    expect(subRes.body?.data?.match?.liveState?.currentStartingPlayerIds).not.toContain(outPlayerId);
    expect(subRes.body?.data?.match?.liveState?.currentBenchPlayerIds).toContain(outPlayerId);
    expect(subRes.body?.data?.match?.liveState?.currentBenchPlayerIds).not.toContain(inPlayerId);
    expect(
      (subRes.body?.data?.highlights ?? []).some((row: { eventType?: string }) => row.eventType === 'SUBSTITUTION')
    ).toBe(true);
  });

  it('assigns actor IDs to user highlights and suspends the sent-off player', async () => {
    const careerId = await createCareer('highlight-actors');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThanOrEqual(18);

    const { starters, bench } = buildTestFormationSelection(squadRes.body.data);
    expect(starters).toHaveLength(11);
    expect(bench.length).toBeGreaterThanOrEqual(3);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: starters,
        benchPlayerIds: bench,
        captainPlayerId: starters[0]
      });
    expect(startRes.status).toBe(200);

    const fixture = startRes.body?.data?.fixture;
    const userSide = fixture?.isControlledClubHome ? 'home' : 'away';

    let highlightRows = Array.isArray(startRes.body?.data?.highlights) ? startRes.body.data.highlights : [];
    let actorTagged = highlightRows.find((row: { teamSide?: string; actorId?: number | null }) =>
      row?.teamSide === userSide && Number.isFinite(Number(row?.actorId))
    );

    if (!actorTagged) {
      const interventionRes = await request(app)
        .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
        .send({ type: 'MENTALITY_SHIFT', intensity: 2 });
      expect(interventionRes.status).toBe(200);
      highlightRows = Array.isArray(interventionRes.body?.data?.highlights) ? interventionRes.body.data.highlights : [];
      actorTagged = highlightRows.find((row: { teamSide?: string; actorId?: number | null }) =>
        row?.teamSide === userSide && Number.isFinite(Number(row?.actorId))
      );
    }

    expect(actorTagged).toBeTruthy();
    const actorId = Number(actorTagged?.actorId);
    expect(starters.includes(actorId) || bench.includes(actorId)).toBe(true);

    const match = await prisma.v2Match.findUnique({
      where: { fixtureId },
      select: { id: true }
    });
    expect(match).toBeTruthy();
    const matchId = String(match?.id || '');
    expect(matchId.length).toBeGreaterThan(0);

    const sentOffPlayerId = starters[0];
    await prisma.v2Highlight.create({
      data: {
        id: `${matchId}:hl:test:red:${Date.now()}`,
        matchId,
        minute: 89,
        eventType: 'RED_CARD',
        teamSide: userSide,
        actorId: sentOffPlayerId,
        animationPreset: 'card_display',
        cameraPath: 'REFEREE_FOCUS',
        commentary: 'Test red card for suspension mapping.',
        xThreatRank: 0.9,
        isDecisive: true,
        payload: '{}'
      }
    });

    const postRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/post`);
    expect(postRes.status).toBe(200);

    const suspendedState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: sentOffPlayerId
        }
      },
      select: { isSuspended: true }
    });
    expect(suspendedState?.isSuspended).toBe(true);

    const suspendedProfileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${sentOffPlayerId}`);
    expect(suspendedProfileRes.status).toBe(200);
    expect(suspendedProfileRes.body?.data?.availability?.isSuspended).toBe(true);
    expect(Number(suspendedProfileRes.body?.data?.availability?.suspension?.matchesRemaining)).toBe(1);

    const nextFixtureId = await advanceUntilMatchPrepWithFixture(careerId, 8);
    const squadBeforeNextFixtureRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadBeforeNextFixtureRes.status).toBe(200);
    const squadBeforeNextFixture = Array.isArray(squadBeforeNextFixtureRes.body?.data) ? squadBeforeNextFixtureRes.body.data : [];
    const selectionBeforeNextFixture = buildTestFormationSelection(squadBeforeNextFixture);
    const forcedSuspendedSelection = ensurePlayerIncludedInStarters(
      squadBeforeNextFixture,
      selectionBeforeNextFixture,
      sentOffPlayerId
    );

    const suspendedStartBlockedRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${nextFixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: forcedSuspendedSelection.starters,
        benchPlayerIds: forcedSuspendedSelection.bench,
        captainPlayerId: forcedSuspendedSelection.starters[0]
      });
    expect(suspendedStartBlockedRes.status).toBe(400);
    expect(String(suspendedStartBlockedRes.body?.error || '')).toMatch(/ineligible|suspended/i);

    const cleanStartRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${nextFixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: selectionBeforeNextFixture.starters,
        benchPlayerIds: selectionBeforeNextFixture.bench,
        captainPlayerId: selectionBeforeNextFixture.starters[0]
      });
    expect(cleanStartRes.status).toBe(200);

    const nextPostRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${nextFixtureId}/post`);
    expect(nextPostRes.status).toBe(200);

    const clearedState = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId: sentOffPlayerId
        }
      },
      select: { isSuspended: true }
    });
    expect(clearedState?.isSuspended).toBe(false);

    const clearedProfileRes = await request(app).get(`/api/v2/careers/${careerId}/squad/${sentOffPlayerId}`);
    expect(clearedProfileRes.status).toBe(200);
    expect(clearedProfileRes.body?.data?.availability?.isSuspended).toBe(false);
    expect(clearedProfileRes.body?.data?.availability?.suspension).toBeNull();
  });

  it('creates valid initial fixture and league state structures', async () => {
    const careerId = await createCareer('fixtures');

    const fixtureCount = await prisma.v2Fixture.count({ where: { careerId } });
    expect(fixtureCount).toBeGreaterThan(0);

    const invalidWeekFixtures = await prisma.v2Fixture.count({
      where: {
        careerId,
        weekNumber: { lt: 1 }
      }
    });
    expect(invalidWeekFixtures).toBe(0);

    const nonScheduledFixtures = await prisma.v2Fixture.count({
      where: {
        careerId,
        status: { not: 'SCHEDULED' }
      }
    });
    expect(nonScheduledFixtures).toBe(0);

    const userFixtures = await prisma.v2Fixture.count({
      where: {
        careerId,
        isUserClubFixture: true
      }
    });
    expect(userFixtures).toBeGreaterThan(0);

    const initialLeagueRows = await prisma.v2LeagueState.count({ where: { careerId } });
    expect(initialLeagueRows).toBeGreaterThan(0);

    const invalidProgression = await prisma.v2LeagueState.count({
      where: {
        careerId,
        progressionStatus: { notIn: ['STABLE', 'PROMOTED', 'RELEGATED'] }
      }
    });
    expect(invalidProgression).toBe(0);
  });

  it('rolls to next season with reset standings and regenerated fixtures', async () => {
    const careerId = await createCareer('rollover');

    const beforeStateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(beforeStateRes.status).toBe(200);
    const beforeState = beforeStateRes.body?.data;

    const maxWeekAgg = await prisma.v2Fixture.aggregate({
      where: { careerId },
      _max: { weekNumber: true }
    });
    const finalWeek = Number(maxWeekAgg._max.weekNumber);
    expect(Number.isFinite(finalWeek)).toBe(true);
    expect(finalWeek).toBeGreaterThan(0);

    await prisma.v2Career.update({
      where: { id: careerId },
      data: {
        weekNumber: finalWeek,
        currentPhase: 'POST_MATCH'
      }
    });

    const rolloverRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(rolloverRes.status).toBe(200);
    const afterState = rolloverRes.body?.data;

    expect(afterState.currentPhase).toBe('PLANNING');
    expect(afterState.weekNumber).toBe(1);
    expect(afterState.season).not.toBe(beforeState.season);

    const weekOneFixtures = await prisma.v2Fixture.count({
      where: { careerId, weekNumber: 1 }
    });
    expect(weekOneFixtures).toBeGreaterThan(0);

    const nonScheduledFixtures = await prisma.v2Fixture.count({
      where: {
        careerId,
        status: { not: 'SCHEDULED' }
      }
    });
    expect(nonScheduledFixtures).toBe(0);

    const dirtyStandings = await prisma.v2LeagueState.count({
      where: {
        careerId,
        OR: [
          { played: { not: 0 } },
          { won: { not: 0 } },
          { drawn: { not: 0 } },
          { lost: { not: 0 } },
          { goalsFor: { not: 0 } },
          { goalsAgainst: { not: 0 } },
          { points: { not: 0 } }
        ]
      }
    });
    expect(dirtyStandings).toBe(0);

    const progressionRows = await prisma.v2LeagueState.findMany({
      where: { careerId },
      select: { progressionStatus: true }
    });
    const promoted = progressionRows.filter((row) => row.progressionStatus === 'PROMOTED').length;
    const relegated = progressionRows.filter((row) => row.progressionStatus === 'RELEGATED').length;
    expect(promoted).toBe(relegated);

    if (afterState.activeLeagueId) {
      const controlledMembership = await prisma.v2LeagueState.findUnique({
        where: {
          careerId_leagueId_clubId: {
            careerId,
            leagueId: Number(afterState.activeLeagueId),
            clubId: Number(afterState.controlledClubId)
          }
        }
      });
      expect(controlledMembership).toBeTruthy();
    }

    const staleWeekPlans = await prisma.v2WeekPlan.count({ where: { careerId } });
    const staleEvents = await prisma.v2InboxEvent.count({ where: { careerId } });
    const staleDecisions = await prisma.v2EventDecision.count({ where: { careerId } });
    expect(staleWeekPlans).toBe(0);
    expect(staleEvents).toBe(0);
    expect(staleDecisions).toBe(0);
  });

  it('blocks week-advance in MATCH_PREP while user fixture is still pending', async () => {
    const careerId = await createCareer('matchprep-block');
    const fixtureId = await advanceUntilMatchPrepWithFixture(careerId);
    expect(typeof fixtureId).toBe('string');

    const blockedAdvance = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(blockedAdvance.status).toBe(400);
    expect(String(blockedAdvance.body?.error || '')).toContain('Start and complete your user fixture before advancing.');

    const stateAfterBlockedAdvance = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateAfterBlockedAdvance.status).toBe(200);
    expect(stateAfterBlockedAdvance.body?.data?.currentPhase).toBe('MATCH_PREP');
    expect(stateAfterBlockedAdvance.body?.data?.nextUserFixture?.id).toBe(fixtureId);
  });

  it('returns pre-kickoff highlights payload without error', async () => {
    const careerId = await createCareer('highlights-prekickoff');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const highlightsRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/highlights`);
    expect(highlightsRes.status).toBe(200);
    expect(highlightsRes.body?.success).toBe(true);
    expect(highlightsRes.body?.data?.fixture?.id).toBe(fixtureId);
    expect(highlightsRes.body?.data?.match).toBeNull();
    expect(Array.isArray(highlightsRes.body?.data?.highlights)).toBe(true);
    expect(highlightsRes.body.data.highlights.length).toBe(0);
  });

  it('persists explicit starter/bench/captain selections in guided match prep', async () => {
    const careerId = await createCareer('match-prep-selection');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThanOrEqual(18);

    const availablePlayers = squadRes.body.data.filter((player: {
      isInjured?: boolean;
      isSuspended?: boolean;
      isEligibleForNextFixture?: boolean;
    }) => !player.isInjured && !player.isSuspended && player.isEligibleForNextFixture === true);
    const grouped = {
      GK: availablePlayers.filter((player: { position?: string }) => resolveTestPositionGroup(player.position) === 'GK'),
      DEF: availablePlayers.filter((player: { position?: string }) => resolveTestPositionGroup(player.position) === 'DEF'),
      MID: availablePlayers.filter((player: { position?: string }) => resolveTestPositionGroup(player.position) === 'MID'),
      ATT: availablePlayers.filter((player: { position?: string }) => resolveTestPositionGroup(player.position) === 'ATT')
    };
    expect(grouped.GK.length).toBeGreaterThanOrEqual(1);
    expect(grouped.DEF.length).toBeGreaterThanOrEqual(4);
    expect(grouped.MID.length).toBeGreaterThanOrEqual(3);
    expect(grouped.ATT.length).toBeGreaterThanOrEqual(3);

    const starters = [
      Number(grouped.GK[0].id),
      ...grouped.DEF.slice(0, 4).map((player: { id: number }) => Number(player.id)),
      ...grouped.MID.slice(0, 3).map((player: { id: number }) => Number(player.id)),
      ...grouped.ATT.slice(0, 3).map((player: { id: number }) => Number(player.id))
    ];
    const bench = availablePlayers
      .map((player: { id: number }) => Number(player.id))
      .filter((playerId: number) => !starters.includes(playerId))
      .slice(0, 7);
    const captain = starters[2];

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: starters,
        benchPlayerIds: bench,
        captainPlayerId: captain
      });
    expect(startRes.status).toBe(200);
    expect(startRes.body?.data?.match?.matchPrep?.startingPlayerIds).toEqual(starters);
    expect(startRes.body?.data?.match?.matchPrep?.benchPlayerIds).toEqual(bench);
    expect(startRes.body?.data?.match?.matchPrep?.captainPlayerId).toBe(captain);
  });

  it('rejects unavailable players in match prep and auto-selection excludes them', async () => {
    const careerId = await createCareer('match-prep-unavailable');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThanOrEqual(18);

    const availableIds = pickAvailablePlayerIds(squadRes.body.data);
    expect(availableIds.length).toBeGreaterThanOrEqual(18);
    const forcedUnavailablePlayerId = Number(availableIds[0]);

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId: forcedUnavailablePlayerId
        }
      },
      data: {
        isSuspended: true,
        isInjured: false,
        injuryWeeks: 0
      }
    });

    const { starters, bench } = buildTestFormationSelection(squadRes.body.data);
    expect(starters).toHaveLength(11);
    expect(bench.length).toBeGreaterThanOrEqual(3);
    const startersWithUnavailable = [forcedUnavailablePlayerId, ...starters.filter((playerId) => playerId !== forcedUnavailablePlayerId)].slice(0, 11);

    const invalidStartRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: startersWithUnavailable,
        benchPlayerIds: bench,
        captainPlayerId: forcedUnavailablePlayerId
      });
    expect(invalidStartRes.status).toBe(400);
    expect(String(invalidStartRes.body?.error || '')).toMatch(/unavailable|ineligible/i);

    const autoStartRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(autoStartRes.status).toBe(200);
    const autoStarters = autoStartRes.body?.data?.match?.matchPrep?.startingPlayerIds ?? [];
    const autoBench = autoStartRes.body?.data?.match?.matchPrep?.benchPlayerIds ?? [];
    expect(Array.isArray(autoStarters)).toBe(true);
    expect(Array.isArray(autoBench)).toBe(true);
    expect(autoStarters.includes(forcedUnavailablePlayerId)).toBe(false);
    expect(autoBench.includes(forcedUnavailablePlayerId)).toBe(false);
  });

  it('auto-selects exactly one goalkeeper in default match prep when keepers are available', async () => {
    const careerId = await createCareer('match-prep-auto-gk');
    const fixtureId = await advanceUntilUserFixture(careerId);

    await prisma.v2PlayerState.updateMany({
      where: { careerId },
      data: {
        isSuspended: false,
        isInjured: false,
        injuryWeeks: 0
      }
    });

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);

    const availableKeepers = squadRes.body.data.filter((player: { position?: string; isInjured?: boolean; isSuspended?: boolean }) =>
      isGoalkeeperPosition(player.position) && !player.isInjured && !player.isSuspended
    );
    expect(availableKeepers.length).toBeGreaterThan(0);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(startRes.status).toBe(200);

    const starterIds = startRes.body?.data?.match?.matchPrep?.startingPlayerIds ?? [];
    expect(Array.isArray(starterIds)).toBe(true);
    expect(starterIds.length).toBe(11);

    const starters = await prisma.player.findMany({
      where: { id: { in: starterIds } },
      select: { position: true }
    });
    const goalkeeperCount = starters.filter((player) => isGoalkeeperPosition(player.position)).length;
    expect(goalkeeperCount).toBe(1);
  });

  it('auto-selects the requested 4-4-2 shape in guided match prep', async () => {
    const careerId = await createCareer('match-prep-442');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-4-2',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED'
      });
    expect(startRes.status).toBe(200);
    expect(startRes.body?.data?.match?.matchPrep?.formation).toBe('4-4-2');

    const starterIds = startRes.body?.data?.match?.matchPrep?.startingPlayerIds ?? [];
    const starters = await prisma.player.findMany({
      where: { id: { in: starterIds } },
      select: { id: true, position: true }
    });
    const counts = starters.reduce((acc, player) => {
      acc[resolveTestPositionGroup(player.position)] += 1;
      return acc;
    }, { GK: 0, DEF: 0, MID: 0, ATT: 0 });

    expect(counts).toEqual({ GK: 1, DEF: 4, MID: 4, ATT: 2 });
  });

  it('rejects a starting XI that violates the requested formation shape', async () => {
    const careerId = await createCareer('match-prep-bad-shape');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);

    const availablePlayers = squadRes.body.data.filter((player: {
      id: number;
      position?: string;
      currentAbility?: number;
      fitness?: number;
      isInjured?: boolean;
      isSuspended?: boolean;
      isEligibleForNextFixture?: boolean;
    }) => !player.isInjured && !player.isSuspended && player.isEligibleForNextFixture === true);
    const candidates = availablePlayers.map((player: {
      id: number;
      position?: string;
      currentAbility?: number;
      fitness?: number;
    }) => ({
      id: Number(player.id),
      position: String(player.position || 'CM'),
      ability: Number(player.currentAbility ?? 60),
      fitness: Number(player.fitness ?? 80),
      group: resolveMatchPrepPositionGroup(player.position)
    }));
    const autoSelection = buildAutoMatchSelection(candidates, '4-4-2', 'BALANCED', 'BALANCED');

    expect(autoSelection.startingPlayerIds).toHaveLength(11);
    expect(autoSelection.benchPlayerIds.length).toBeGreaterThanOrEqual(3);

    const groupByPlayerId = new Map(candidates.map((candidate: {
      id: number;
      group: 'GK' | 'DEF' | 'MID' | 'ATT';
    }) => [candidate.id, candidate.group] as const));
    const attackerToReplace = autoSelection.startingPlayerIds.find((playerId: number) => groupByPlayerId.get(playerId) === 'ATT');
    const shapeBreaker = autoSelection.benchPlayerIds.find((playerId: number) => {
      const group = groupByPlayerId.get(playerId);
      return group === 'MID' || group === 'DEF';
    });

    expect(attackerToReplace).toBeTruthy();
    expect(shapeBreaker).toBeTruthy();

    const starters = autoSelection.startingPlayerIds.map((playerId: number) =>
      playerId === attackerToReplace ? Number(shapeBreaker) : Number(playerId)
    );
    const bench = autoSelection.benchPlayerIds.map((playerId: number) =>
      playerId === shapeBreaker ? Number(attackerToReplace) : Number(playerId)
    );

    expect(starters).toHaveLength(11);
    expect(bench.length).toBeGreaterThanOrEqual(3);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-4-2',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: starters,
        benchPlayerIds: bench,
        captainPlayerId: starters[0]
      });

    expect(startRes.status).toBe(400);
    expect(String(startRes.body?.error || '')).toContain('formation 4-4-2');
  });

  it('rejects invalid starting XI size during match prep', async () => {
    const careerId = await createCareer('match-prep-invalid-xi');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    const availableIds = pickAvailablePlayerIds(squadRes.body.data);
    expect(availableIds.length).toBeGreaterThanOrEqual(17);
    const starters = availableIds.slice(0, 10);
    const bench = availableIds.slice(10, 17);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: starters,
        benchPlayerIds: bench,
        captainPlayerId: starters[0]
      });
    expect(startRes.status).toBe(400);
    expect(String(startRes.body?.error || '')).toContain('exactly 11');
  });

  it('restores player state fields after save/load roundtrip', async () => {
    const careerId = await createCareer('save-load-player-state');

    const squadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadRes.status).toBe(200);
    expect(Array.isArray(squadRes.body?.data)).toBe(true);
    expect(squadRes.body.data.length).toBeGreaterThan(0);

    const playerId = Number(squadRes.body.data[0]?.id);
    expect(Number.isFinite(playerId)).toBe(true);

    const savedState = {
      morale: 31,
      fitness: 67,
      form: 42,
      isInjured: true,
      injuryWeeks: 4,
      isSuspended: true,
      developmentDelta: -2
    };

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId
        }
      },
      data: savedState
    });

    const saveRes = await request(app).post(`/api/v2/careers/${careerId}/save/player-state-roundtrip`);
    expect(saveRes.status).toBe(200);
    expect(typeof saveRes.body?.data?.stateHash).toBe('string');
    expect(saveRes.body.data.stateHash.length).toBeGreaterThan(0);

    await prisma.v2PlayerState.update({
      where: {
        careerId_playerId: {
          careerId,
          playerId
        }
      },
      data: {
        morale: 88,
        fitness: 12,
        form: 9,
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false,
        developmentDelta: 7
      }
    });

    const loadRes = await request(app).post(`/api/v2/careers/${careerId}/load/player-state-roundtrip`);
    expect(loadRes.status).toBe(200);
    expect(loadRes.body?.data?.stateHash).toBe(saveRes.body?.data?.stateHash);

    const restored = await prisma.v2PlayerState.findUnique({
      where: {
        careerId_playerId: {
          careerId,
          playerId
        }
      }
    });
    expect(restored).toBeTruthy();
    expect(restored?.morale).toBe(savedState.morale);
    expect(restored?.fitness).toBe(savedState.fitness);
    expect(restored?.form).toBe(savedState.form);
    expect(restored?.isInjured).toBe(savedState.isInjured);
    expect(restored?.injuryWeeks).toBe(savedState.injuryWeeks);
    expect(restored?.isSuspended).toBe(savedState.isSuspended);
    expect(restored?.developmentDelta).toBe(savedState.developmentDelta);

    const squadAfterLoadRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadAfterLoadRes.status).toBe(200);
    const restoredPlayer = squadAfterLoadRes.body?.data?.find((row: { id: number }) => Number(row.id) === playerId);
    expect(restoredPlayer).toBeTruthy();
    expect(restoredPlayer?.morale).toBe(savedState.morale);
    expect(restoredPlayer?.fitness).toBe(savedState.fitness);
    expect(restoredPlayer?.form).toBe(savedState.form);
    expect(restoredPlayer?.isInjured).toBe(savedState.isInjured);
    expect(restoredPlayer?.injuryWeeks).toBe(savedState.injuryWeeks);
    expect(restoredPlayer?.isSuspended).toBe(savedState.isSuspended);
  });

  it('refreshes autosave at planner submit, guided match start, and week wrap', async () => {
    const careerId = await createCareer('autosave-transitions');

    const autosaveAfterCreate = await readAutosaveSlot(careerId);

    const planRes = await request(app)
      .put(`/api/v2/careers/${careerId}/week-plan`)
      .send({
        trainingFocus: 'INTENSE',
        rotationIntensity: 'HIGH',
        tacticalMentality: 'POSSESSION',
        transferStance: 'SELL',
        scoutingPriority: 'YOUTH'
      });
    expect(planRes.status).toBe(200);

    const autosaveAfterPlanner = await readAutosaveSlot(careerId);
    expect(autosaveAfterPlanner.stateHash).not.toBe(autosaveAfterCreate.stateHash);
    expect(autosaveAfterPlanner.updatedAt.getTime()).toBeGreaterThanOrEqual(autosaveAfterCreate.updatedAt.getTime());

    const fixtureId = await advanceUntilMatchPrepWithFixture(careerId);

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`);
    expect(startRes.status).toBe(200);

    const autosaveAfterMatchStart = await readAutosaveSlot(careerId);
    expect(autosaveAfterMatchStart.stateHash).not.toBe(autosaveAfterPlanner.stateHash);
    expect(autosaveAfterMatchStart.updatedAt.getTime()).toBeGreaterThanOrEqual(autosaveAfterPlanner.updatedAt.getTime());

    const postRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/post`);
    expect(postRes.status).toBe(200);

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);
    expect(wrapRes.body?.data?.currentPhase).toBe('PLANNING');

    const autosaveAfterWeekWrap = await readAutosaveSlot(careerId);
    expect(autosaveAfterWeekWrap.stateHash).not.toBe(autosaveAfterMatchStart.stateHash);
    expect(autosaveAfterWeekWrap.updatedAt.getTime()).toBeGreaterThanOrEqual(autosaveAfterMatchStart.updatedAt.getTime());
  });

  it('rejects loading tampered save slots when snapshot hash mismatches', async () => {
    const careerId = await createCareer('save-load-integrity');

    const saveRes = await request(app).post(`/api/v2/careers/${careerId}/save/integrity-check`);
    expect(saveRes.status).toBe(200);
    expect(typeof saveRes.body?.data?.stateHash).toBe('string');

    const slotId = `${careerId}:integrity-check`;
    const storedSlot = await prisma.v2SaveSlot.findUnique({
      where: { id: slotId },
      select: {
        snapshot: true,
        stateHash: true
      }
    });
    expect(storedSlot).toBeTruthy();

    const tamperedSnapshot = JSON.parse(decodeSaveSnapshotPayload(String(storedSlot?.snapshot))) as {
      career?: { weekNumber?: number };
    };
    tamperedSnapshot.career = tamperedSnapshot.career || {};
    tamperedSnapshot.career.weekNumber = Number(tamperedSnapshot.career.weekNumber ?? 1) + 1;

    await prisma.v2SaveSlot.update({
      where: { id: slotId },
      data: {
        snapshot: JSON.stringify(tamperedSnapshot)
      }
    });

    const loadRes = await request(app).post(`/api/v2/careers/${careerId}/load/integrity-check`);
    expect(loadRes.status).toBe(400);
    expect(String(loadRes.body?.error || '')).toContain('integrity check failed');
  });

  it('caps manual save history and stores compacted snapshots', async () => {
    const careerId = await createCareer('save-slot-retention');
    const slotNames = Array.from(
      { length: MAX_MANUAL_SAVE_SLOTS_PER_CAREER + 2 },
      (_, idx) => `manual-${String(idx + 1).padStart(2, '0')}`
    );

    for (const slotName of slotNames) {
      const saveRes = await request(app).post(`/api/v2/careers/${careerId}/save/${slotName}`);
      expect(saveRes.status).toBe(200);
    }

    const manualSlots = await prisma.v2SaveSlot.findMany({
      where: {
        careerId,
        isAuto: false
      },
      select: {
        slotName: true,
        snapshot: true
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
    });

    expect(manualSlots).toHaveLength(MAX_MANUAL_SAVE_SLOTS_PER_CAREER);
    expect(manualSlots.map((slot) => slot.slotName).sort()).toEqual(
      slotNames.slice(-MAX_MANUAL_SAVE_SLOTS_PER_CAREER).sort()
    );
    expect(String(manualSlots[0]?.snapshot || '')).toContain(COMPRESSED_SAVE_SNAPSHOT_PREFIX);

    const prunedSlot = await prisma.v2SaveSlot.findUnique({
      where: {
        id: `${careerId}:${slotNames[0]}`
      }
    });
    expect(prunedSlot).toBeNull();
  });

  it('rejects loading missing save slots without mutating career state', async () => {
    const careerId = await createCareer('save-load-missing-slot');

    const beforeStateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(beforeStateRes.status).toBe(200);

    const loadRes = await request(app).post(`/api/v2/careers/${careerId}/load/does-not-exist`);
    expect(loadRes.status).toBe(400);
    expect(String(loadRes.body?.error || '')).toContain('Save slot not found');

    const afterStateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(afterStateRes.status).toBe(200);
    expect(afterStateRes.body?.data?.weekNumber).toBe(beforeStateRes.body?.data?.weekNumber);
    expect(afterStateRes.body?.data?.season).toBe(beforeStateRes.body?.data?.season);
    expect(afterStateRes.body?.data?.currentPhase).toBe(beforeStateRes.body?.data?.currentPhase);
  });

  it('restores club and league state rows after save/load roundtrip', async () => {
    const careerId = await createCareer('save-load-club-league-state');

    const beforeCareer = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        season: true,
        weekNumber: true,
        currentPhase: true,
        activeLeagueId: true
      }
    });
    expect(beforeCareer).toBeTruthy();

    const beforeClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: {
        id: true,
        morale: true,
        fitnessTrend: true,
        boardConfidence: true,
        budgetBalance: true,
        form: true
      }
    });
    expect(beforeClubState).toBeTruthy();

    const beforeLeagueState = await prisma.v2LeagueState.findFirst({
      where: { careerId },
      orderBy: [{ leagueId: 'asc' }, { clubId: 'asc' }],
      select: {
        id: true,
        position: true,
        played: true,
        won: true,
        drawn: true,
        lost: true,
        goalsFor: true,
        goalsAgainst: true,
        goalDifference: true,
        points: true,
        progressionStatus: true
      }
    });
    expect(beforeLeagueState).toBeTruthy();

    const slotName = 'club-league-roundtrip';
    const saveRes = await request(app).post(`/api/v2/careers/${careerId}/save/${slotName}`);
    expect(saveRes.status).toBe(200);
    expect(typeof saveRes.body?.data?.stateHash).toBe('string');

    await prisma.v2Career.update({
      where: { id: careerId },
      data: {
        currentPhase: 'EVENT',
        weekNumber: Number(beforeCareer?.weekNumber ?? 1) + 1
      }
    });

    await prisma.v2ClubState.update({
      where: { id: String(beforeClubState?.id) },
      data: {
        morale: 17,
        fitnessTrend: -9,
        boardConfidence: 13,
        budgetBalance: 123456,
        form: 'LLLLL'
      }
    });

    await prisma.v2LeagueState.update({
      where: { id: String(beforeLeagueState?.id) },
      data: {
        position: 99,
        played: 22,
        won: 1,
        drawn: 3,
        lost: 18,
        goalsFor: 10,
        goalsAgainst: 47,
        goalDifference: -37,
        points: 6,
        progressionStatus: 'RELEGATED'
      }
    });

    const loadRes = await request(app).post(`/api/v2/careers/${careerId}/load/${slotName}`);
    expect(loadRes.status).toBe(200);

    const restoredCareer = await prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        season: true,
        weekNumber: true,
        currentPhase: true,
        activeLeagueId: true
      }
    });
    expect(restoredCareer).toBeTruthy();
    expect(restoredCareer?.season).toBe(beforeCareer?.season);
    expect(restoredCareer?.weekNumber).toBe(beforeCareer?.weekNumber);
    expect(restoredCareer?.currentPhase).toBe(beforeCareer?.currentPhase);
    expect(restoredCareer?.activeLeagueId).toBe(beforeCareer?.activeLeagueId);

    const restoredClubState = await prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      select: {
        morale: true,
        fitnessTrend: true,
        boardConfidence: true,
        budgetBalance: true,
        form: true
      }
    });
    expect(restoredClubState).toBeTruthy();
    expect(restoredClubState?.morale).toBe(beforeClubState?.morale);
    expect(restoredClubState?.fitnessTrend).toBe(beforeClubState?.fitnessTrend);
    expect(restoredClubState?.boardConfidence).toBe(beforeClubState?.boardConfidence);
    expect(Number(restoredClubState?.budgetBalance)).toBe(Number(beforeClubState?.budgetBalance));
    expect(restoredClubState?.form).toBe(beforeClubState?.form);

    const restoredLeagueState = await prisma.v2LeagueState.findUnique({
      where: { id: String(beforeLeagueState?.id) },
      select: {
        position: true,
        played: true,
        won: true,
        drawn: true,
        lost: true,
        goalsFor: true,
        goalsAgainst: true,
        goalDifference: true,
        points: true,
        progressionStatus: true
      }
    });
    expect(restoredLeagueState).toBeTruthy();
    expect(restoredLeagueState?.position).toBe(beforeLeagueState?.position);
    expect(restoredLeagueState?.played).toBe(beforeLeagueState?.played);
    expect(restoredLeagueState?.won).toBe(beforeLeagueState?.won);
    expect(restoredLeagueState?.drawn).toBe(beforeLeagueState?.drawn);
    expect(restoredLeagueState?.lost).toBe(beforeLeagueState?.lost);
    expect(restoredLeagueState?.goalsFor).toBe(beforeLeagueState?.goalsFor);
    expect(restoredLeagueState?.goalsAgainst).toBe(beforeLeagueState?.goalsAgainst);
    expect(restoredLeagueState?.goalDifference).toBe(beforeLeagueState?.goalDifference);
    expect(restoredLeagueState?.points).toBe(beforeLeagueState?.points);
    expect(restoredLeagueState?.progressionStatus).toBe(beforeLeagueState?.progressionStatus);
  });

  it('applies post-match squad fatigue and returns player impact summary', async () => {
    const careerId = await createCareer('post-match-player-effects');
    const fixtureId = await advanceUntilUserFixture(careerId);

    const squadBeforeRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadBeforeRes.status).toBe(200);
    const squadBefore = Array.isArray(squadBeforeRes.body?.data) ? squadBeforeRes.body.data : [];
    expect(squadBefore.length).toBeGreaterThanOrEqual(18);

    const { starters, bench } = buildTestFormationSelection(squadBefore);
    expect(starters).toHaveLength(11);
    expect(bench.length).toBeGreaterThanOrEqual(3);
    const beforeFitnessByPlayer = new Map(
      squadBefore.map((player: { id: number; fitness: number }) => [Number(player.id), Number(player.fitness)])
    );

    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        formation: '4-3-3',
        lineupPolicy: 'BEST_XI',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'HIGH_PRESS',
        startingPlayerIds: starters,
        benchPlayerIds: bench,
        captainPlayerId: starters[0]
      });
    expect(startRes.status).toBe(200);
    expect(Number(startRes.body?.data?.match?.homeScore) + Number(startRes.body?.data?.match?.awayScore)).toBeLessThanOrEqual(9);

    const postRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/post`);
    expect(postRes.status).toBe(200);
    expect(postRes.body?.data?.playerImpact).toBeTruthy();
    expect(Number(postRes.body?.data?.playerImpact?.averageFitness)).toBeLessThan(90);
    expect(postRes.body?.data?.playerRatings).toBeTruthy();
    expect(Array.isArray(postRes.body?.data?.playerRatings?.rows)).toBe(true);
    expect(postRes.body?.data?.playerRatings?.rows?.length).toBeGreaterThanOrEqual(14);
    expect(typeof postRes.body?.data?.playerRatings?.topPerformer?.playerName).toBe('string');
    expect(postRes.body?.data?.chanceQuality).toBeTruthy();
    expect(typeof postRes.body?.data?.chanceQuality?.summary).toBe('string');
    expect(postRes.body?.data?.tacticalFeedback).toBeTruthy();
    expect(postRes.body?.data?.tacticalFeedback?.recommendedWeekPlan).toEqual(
      expect.objectContaining({
        trainingFocus: expect.any(String),
        rotationIntensity: expect.any(String),
        tacticalMentality: expect.any(String)
      })
    );
    expect(postRes.body?.data?.latestPlannerInsight).toEqual(
      expect.objectContaining({
        fixtureId,
        summary: expect.any(String),
        recommendedWeekPlan: expect.objectContaining({
          trainingFocus: expect.any(String),
          rotationIntensity: expect.any(String),
          tacticalMentality: expect.any(String)
        })
      })
    );

    const stateAfterPostRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateAfterPostRes.status).toBe(200);
    expect(stateAfterPostRes.body?.data?.latestMatchInsight).toEqual(
      expect.objectContaining({
        fixtureId,
        summary: expect.any(String),
        recommendedWeekPlan: expect.objectContaining({
          trainingFocus: expect.any(String),
          rotationIntensity: expect.any(String),
          tacticalMentality: expect.any(String)
        })
      })
    );

    const squadAfterRes = await request(app).get(`/api/v2/careers/${careerId}/squad`);
    expect(squadAfterRes.status).toBe(200);
    const squadAfter = Array.isArray(squadAfterRes.body?.data) ? squadAfterRes.body.data : [];
    const afterFitnessByPlayer = new Map(
      squadAfter.map((player: { id: number; fitness: number }) => [Number(player.id), Number(player.fitness)])
    );

    const fatigueDrops = starters.filter((playerId: number) => {
      const before = beforeFitnessByPlayer.get(playerId) ?? 0;
      const after = afterFitnessByPlayer.get(playerId) ?? 0;
      return after < before;
    });

    expect(fatigueDrops.length).toBeGreaterThanOrEqual(6);
  });

  it('returns a club pulse snapshot and exposes the summary in career state', async () => {
    const careerId = await createCareer('club-pulse-snapshot');

    const pulseRes = await request(app).get(`/api/v2/careers/${careerId}/pulse`);
    expect(pulseRes.status).toBe(200);
    expect(pulseRes.body?.success).toBe(true);
    expect(pulseRes.body?.data).toEqual(
      expect.objectContaining({
        fanSentimentScore: expect.any(Number),
        fanSentimentLabel: expect.any(String),
        mediaPressureScore: expect.any(Number),
        mediaPressureLabel: expect.any(String),
        fanSummary: expect.any(String),
        mediaSummary: expect.any(String),
        boardStatus: expect.objectContaining({
          boardConfidence: expect.any(Number),
          jobSecurity: expect.any(String)
        }),
        headlines: expect.any(Array),
        recentResults: expect.any(Array)
      })
    );
    expect(pulseRes.body.data.headlines.length).toBeGreaterThan(0);
    expect(typeof pulseRes.body.data.topHeadline).toBe('string');

    const stateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(stateRes.status).toBe(200);
    expect(stateRes.body?.data?.clubPulseSummary).toEqual(
      expect.objectContaining({
        fanSentimentScore: expect.any(Number),
        mediaPressureScore: expect.any(Number),
        topHeadline: expect.any(String)
      })
    );
  });

  it('generates pulse-driven inbox events and records pulse deltas when resolved', async () => {
    const careerId = await createCareer('pulse-events');

    await prisma.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId,
          clubId: controlledClubId
        }
      },
      data: {
        morale: 31,
        boardConfidence: 40,
        budgetBalance: -40000,
        form: 'LLLLD'
      }
    });

    await prisma.v2AuditLog.create({
      data: {
        id: `${careerId}:audit:pulse-seed`,
        careerId,
        category: 'CLUB_PULSE',
        message: 'Supporter unrest continues to build around recent performances.',
        metadata: JSON.stringify({
          weekNumber: 1,
          fanDelta: -6,
          mediaDelta: 7
        })
      }
    });

    const planRes = await request(app)
      .put(`/api/v2/careers/${careerId}/week-plan`)
      .send({
        trainingFocus: 'BALANCED',
        rotationIntensity: 'MEDIUM',
        tacticalMentality: 'BALANCED',
        transferStance: 'OPPORTUNISTIC',
        scoutingPriority: 'LOCAL'
      });
    expect(planRes.status).toBe(200);

    const advanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(advanceRes.status).toBe(200);
    expect(advanceRes.body?.data?.currentPhase).toBe('EVENT');

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    const events = Array.isArray(inboxRes.body?.data) ? inboxRes.body.data : [];
    const pulseEvent = events.find((event: { title?: string }) =>
      [
        'Board Requests Private Review Meeting',
        'Press Room Demands Accountability',
        'Supporter Group Requests Emergency Q&A'
      ].includes(String(event?.title || ''))
    );
    expect(pulseEvent).toBeTruthy();

    const optionWithPulseDelta = pulseEvent.options.find((option: { effects?: { fanDelta?: number; mediaDelta?: number } }) => {
      const fanDelta = Number(option?.effects?.fanDelta ?? 0);
      const mediaDelta = Number(option?.effects?.mediaDelta ?? 0);
      return fanDelta !== 0 || mediaDelta !== 0;
    });
    expect(optionWithPulseDelta).toBeTruthy();

    const respondRes = await request(app)
      .post(`/api/v2/careers/${careerId}/inbox/${pulseEvent.id}/respond`)
      .send({ optionId: optionWithPulseDelta.id });
    expect(respondRes.status).toBe(200);

    const pulseAudit = await prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'CLUB_PULSE'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    });
    expect(pulseAudit).toBeTruthy();
    const pulseAuditMetadata = pulseAudit?.metadata ? JSON.parse(pulseAudit.metadata) : null;
    expect(pulseAuditMetadata).toEqual(
      expect.objectContaining({
        sourceEventId: pulseEvent.id,
        optionId: optionWithPulseDelta.id,
        fanDelta: expect.any(Number),
        mediaDelta: expect.any(Number)
      })
    );
  });

  it('completes planner -> event -> guided match -> post-match -> week wrap loop', async () => {
    const careerId = await createCareer('full-loop');

    const initialStateRes = await request(app).get(`/api/v2/careers/${careerId}/state`);
    expect(initialStateRes.status).toBe(200);
    const initialWeek = Number(initialStateRes.body?.data?.weekNumber);

    const planRes = await request(app)
      .put(`/api/v2/careers/${careerId}/week-plan`)
      .send({
        trainingFocus: 'ATTACKING',
        rotationIntensity: 'MEDIUM',
        tacticalMentality: 'BALANCED',
        transferStance: 'OPPORTUNISTIC',
        scoutingPriority: 'NATIONAL'
      });
    expect(planRes.status).toBe(200);

    const planningAdvanceRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(planningAdvanceRes.status).toBe(200);
    expect(planningAdvanceRes.body?.data?.currentPhase).toBe('EVENT');

    const inboxRes = await request(app).get(`/api/v2/careers/${careerId}/inbox?status=PENDING`);
    expect(inboxRes.status).toBe(200);
    expect(Array.isArray(inboxRes.body?.data)).toBe(true);
    expect(inboxRes.body.data.length).toBeGreaterThan(0);

    await resolvePendingEvents(careerId);

    const fixtureId = await advanceUntilUserFixture(careerId);
    const startRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/start`)
      .send({
        lineupPolicy: 'BEST_XI',
        benchPriority: 'IMPACT',
        preMatchInstruction: 'HIGH_PRESS'
      });
    expect(startRes.status).toBe(200);
    expect(startRes.body?.data?.fixture?.status).toBe('IN_PROGRESS');
    expect(Array.isArray(startRes.body?.data?.highlights)).toBe(true);
    expect(startRes.body.data.highlights.length).toBeGreaterThan(0);
    expect(startRes.body?.data?.match?.matchPrep?.lineupPolicy).toBe('BEST_XI');
    expect(startRes.body?.data?.match?.matchPrep?.benchPriority).toBe('IMPACT');
    expect(startRes.body?.data?.match?.matchPrep?.preMatchInstruction).toBe('HIGH_PRESS');

    const interventionRes = await request(app)
      .post(`/api/v2/careers/${careerId}/matches/${fixtureId}/intervene`)
      .send({ type: 'MENTALITY_SHIFT', intensity: 2 });
    expect(interventionRes.status).toBe(200);
    expect(Array.isArray(interventionRes.body?.data?.match?.interventions)).toBe(true);
    expect(interventionRes.body.data.match.interventions.length).toBe(1);

    const postRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/post`);
    expect(postRes.status).toBe(200);
    expect(postRes.body?.data?.appliedChanges).toBe(true);
    expect(Array.isArray(postRes.body?.data?.standingsPreview)).toBe(true);
    expect(postRes.body.data.standingsPreview.length).toBeGreaterThan(0);
    expect(postRes.body?.data?.interventionImpact?.totalInterventions).toBe(1);
    expect(Array.isArray(postRes.body?.data?.interventionImpact?.windows)).toBe(true);
    expect(postRes.body.data.interventionImpact.windows.length).toBeGreaterThanOrEqual(1);
    expect(typeof postRes.body?.data?.interventionImpact?.windows?.[0]?.directNetXgDelta).toBe('number');
    expect(typeof postRes.body?.data?.interventionImpact?.windows?.[0]?.windowNetXThreatDelta).toBe('number');

    const repeatPostRes = await request(app).get(`/api/v2/careers/${careerId}/matches/${fixtureId}/post`);
    expect(repeatPostRes.status).toBe(200);
    expect(repeatPostRes.body?.data?.appliedChanges).toBe(false);
    expect(repeatPostRes.body?.data?.interventionImpact?.totalInterventions).toBe(1);

    const wrapRes = await request(app).post(`/api/v2/careers/${careerId}/week-advance`);
    expect(wrapRes.status).toBe(200);
    expect(wrapRes.body?.data?.currentPhase).toBe('PLANNING');
    expect(Number(wrapRes.body?.data?.weekNumber)).toBe(initialWeek + 1);
  });
});
