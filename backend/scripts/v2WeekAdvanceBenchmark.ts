import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import v2GameService from '../src/v2/services/v2GameService';

type BenchmarkClub = {
  id: number;
  name: string;
  tier: number;
  leagueName: string;
};

type BenchmarkRow = {
  index: number;
  careerId: string;
  clubId: number;
  clubName: string;
  leagueName: string;
  tier: number;
  durationMs: number;
  phaseAfter: string;
  weekAfter: number;
  pendingEvents: number;
};

type V2Service = {
  createCareer: (input: { managerName: string; controlledClubId: number }) => Promise<{
    id: string;
    currentPhase: string;
    weekNumber: number;
    season: string;
  }>;
  advanceWeek: (careerId: string) => Promise<{
    currentPhase: string;
    weekNumber: number;
    pendingEvents: number;
  }>;
  deleteCareer: (careerId: string) => Promise<unknown>;
  prisma?: PrismaClient;
};

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function readIntegerArg(flag: string, fallback: number, min: number): number {
  const index = process.argv.indexOf(flag);
  if (index < 0 || index + 1 >= process.argv.length) {
    return fallback;
  }
  const parsed = Number(process.argv[index + 1]);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.floor(parsed));
}

function readNumberArg(flag: string, fallback: number, min: number): number {
  const index = process.argv.indexOf(flag);
  if (index < 0 || index + 1 >= process.argv.length) {
    return fallback;
  }
  const parsed = Number(process.argv[index + 1]);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, parsed);
}

function readStringArg(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index < 0 || index + 1 >= process.argv.length) {
    return null;
  }
  const value = String(process.argv[index + 1] || '').trim();
  return value.length > 0 ? value : null;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[index];
}

function summarizeDurations(values: number[]) {
  const count = values.length;
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    count,
    minMs: Number((count > 0 ? Math.min(...values) : 0).toFixed(2)),
    maxMs: Number((count > 0 ? Math.max(...values) : 0).toFixed(2)),
    averageMs: Number((count > 0 ? total / count : 0).toFixed(2)),
    medianMs: Number(percentile(values, 0.5).toFixed(2)),
    p90Ms: Number(percentile(values, 0.9).toFixed(2)),
    p95Ms: Number(percentile(values, 0.95).toFixed(2))
  };
}

function pickBenchmarkClubs(clubs: BenchmarkClub[], sampleSize: number): BenchmarkClub[] {
  if (clubs.length === 0 || sampleSize <= 0) {
    return [];
  }

  const buckets = new Map<number, BenchmarkClub[]>();
  for (const club of clubs) {
    const tier = Number.isFinite(club.tier) ? club.tier : 99;
    const current = buckets.get(tier);
    if (current) {
      current.push(club);
    } else {
      buckets.set(tier, [club]);
    }
  }

  const tierKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
  const tierCursor = new Map<number, number>();
  const selected: BenchmarkClub[] = [];
  const selectedIds = new Set<number>();
  const exhaustedTiers = new Set<number>();

  while (selected.length < sampleSize && exhaustedTiers.size < tierKeys.length) {
    for (const tier of tierKeys) {
      if (selected.length >= sampleSize) {
        break;
      }
      if (exhaustedTiers.has(tier)) {
        continue;
      }

      const bucket = buckets.get(tier);
      if (!bucket || bucket.length === 0) {
        exhaustedTiers.add(tier);
        continue;
      }

      let cursor = tierCursor.get(tier) ?? 0;
      while (cursor < bucket.length && selectedIds.has(bucket[cursor].id)) {
        cursor += 1;
      }

      if (cursor >= bucket.length) {
        exhaustedTiers.add(tier);
        tierCursor.set(tier, cursor);
        continue;
      }

      const candidate = bucket[cursor];
      selected.push(candidate);
      selectedIds.add(candidate.id);
      tierCursor.set(tier, cursor + 1);
    }
  }

  if (selected.length < sampleSize) {
    for (const club of clubs) {
      if (selected.length >= sampleSize) {
        break;
      }
      if (selectedIds.has(club.id)) {
        continue;
      }
      selected.push(club);
      selectedIds.add(club.id);
    }
  }

  return selected;
}

async function main() {
  const sampleSize = readIntegerArg('--samples', 8, 1);
  const warmupRuns = readIntegerArg('--warmup', 1, 0);
  const maxMedianMs = readNumberArg('--max-median-ms', 5000, 1);
  const maxP95Ms = readNumberArg('--max-p95-ms', 9000, 1);
  const shouldCleanup = !hasFlag('--no-cleanup');
  const outputPathArg = readStringArg('--output');
  const outputPath = outputPathArg ? path.resolve(process.cwd(), outputPathArg) : null;

  const prisma = new PrismaClient();
  const service = v2GameService as unknown as V2Service;
  const createdCareerIds: string[] = [];
  const rows: BenchmarkRow[] = [];

  try {
    const clubRows = await prisma.club.findMany({
      where: {
        isActive: true,
        leagueId: { not: null }
      },
      select: {
        id: true,
        name: true,
        league: {
          select: {
            tier: true,
            name: true,
            level: true
          }
        }
      },
      orderBy: [{ leagueId: 'asc' }, { id: 'asc' }]
    });

    const clubs: BenchmarkClub[] = clubRows.map((row) => ({
      id: row.id,
      name: row.name,
      tier: Number(row.league?.tier ?? 99),
      leagueName: row.league?.name ?? row.league?.level ?? 'Unknown League'
    }));

    if (clubs.length === 0) {
      throw new Error('No active clubs with league assignment found for benchmark.');
    }

    const selectedClubs = pickBenchmarkClubs(clubs, sampleSize);
    if (selectedClubs.length < sampleSize) {
      throw new Error(`Only selected ${selectedClubs.length} clubs for benchmark; required ${sampleSize}.`);
    }

    for (let run = 0; run < warmupRuns + sampleSize; run += 1) {
      const isWarmup = run < warmupRuns;
      const sampleIndex = run - warmupRuns;
      const club = selectedClubs[isWarmup ? run % selectedClubs.length : sampleIndex];

      const managerName = `Perf Benchmark ${Date.now()}-${run}`;
      const career = await service.createCareer({
        managerName,
        controlledClubId: club.id
      });
      createdCareerIds.push(career.id);

      const start = process.hrtime.bigint();
      const advanced = await service.advanceWeek(career.id);
      const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;

      if (!isWarmup) {
        rows.push({
          index: sampleIndex + 1,
          careerId: career.id,
          clubId: club.id,
          clubName: club.name,
          leagueName: club.leagueName,
          tier: club.tier,
          durationMs: Number(elapsedMs.toFixed(2)),
          phaseAfter: advanced.currentPhase,
          weekAfter: advanced.weekNumber,
          pendingEvents: advanced.pendingEvents
        });
      }

      if (shouldCleanup) {
        await service.deleteCareer(career.id);
      }
    }

    const durationValues = rows.map((row) => row.durationMs);
    const stats = summarizeDurations(durationValues);
    const passMedian = stats.medianMs <= maxMedianMs;
    const passP95 = stats.p95Ms <= maxP95Ms;
    const pass = passMedian && passP95;

    const result = {
      generatedAt: new Date().toISOString(),
      config: {
        sampleSize,
        warmupRuns,
        maxMedianMs,
        maxP95Ms,
        cleanup: shouldCleanup
      },
      stats,
      sla: {
        pass,
        passMedian,
        passP95,
        maxMedianMs,
        maxP95Ms
      },
      samples: rows
    };

    const serialized = JSON.stringify(result, null, 2);
    // eslint-disable-next-line no-console
    console.log(serialized);

    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(outputPath, serialized, 'utf8');
    }

    if (!pass) {
      // eslint-disable-next-line no-console
      console.error(
        `[v2-week-benchmark] SLA failed: median ${stats.medianMs}ms (max ${maxMedianMs}ms), p95 ${stats.p95Ms}ms (max ${maxP95Ms}ms).`
      );
      process.exitCode = 2;
    }
  } finally {
    if (shouldCleanup && createdCareerIds.length > 0) {
      for (const careerId of createdCareerIds.reverse()) {
        try {
          await service.deleteCareer(careerId);
        } catch {
          // Continue cleanup best effort.
        }
      }
    }
    await prisma.$disconnect();
    if (service.prisma) {
      await service.prisma.$disconnect();
    }
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[v2-week-benchmark] failed:', error);
  process.exit(1);
});
