import { PrismaClient } from '@prisma/client';
import v2GameService from '../src/v2/services/v2GameService';

type SimulationRow = {
  totalGoals: number;
  goalDiff: number;
  totalXg: number;
  highlightCount: number;
};

function readIntegerArg(flag: string, fallback: number): number {
  const index = process.argv.indexOf(flag);
  if (index < 0 || index + 1 >= process.argv.length) {
    return fallback;
  }
  const parsed = Number(process.argv[index + 1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[index];
}

async function main() {
  const sampleSize = readIntegerArg('--samples', 300);
  const prisma = new PrismaClient();
  const service = v2GameService as unknown as {
    runGuidedSimulation: (career: Record<string, unknown>, fixture: Record<string, unknown>, prep: Record<string, unknown>) => Promise<{
      homeScore: number;
      awayScore: number;
      homeXg: number;
      awayXg: number;
      highlights: Array<unknown>;
    }>;
    defaultMatchPrep: () => Record<string, unknown>;
  };

  try {
    const clubs = await prisma.club.findMany({
      where: {
        isActive: true,
        leagueId: { not: null }
      },
      select: {
        id: true,
        reputation: true
      },
      orderBy: { id: 'asc' },
      take: 900
    });

    if (clubs.length < 2) {
      throw new Error('Not enough clubs in DB for telemetry run.');
    }

    const rows: SimulationRow[] = [];
    for (let index = 0; index < sampleSize; index += 1) {
      const homeClub = clubs[index % clubs.length];
      const awayClub = clubs[(index * 13 + 17) % clubs.length];
      if (homeClub.id === awayClub.id) {
        continue;
      }

      const controlledClubId = index % 2 === 0 ? homeClub.id : awayClub.id;
      const career = {
        id: `telemetry:${index}`,
        controlledClubId,
        weekNumber: (index % 38) + 1
      };
      const fixture = {
        id: `telemetry:fixture:${index}`,
        homeClubId: homeClub.id,
        awayClubId: awayClub.id
      };
      const result = await service.runGuidedSimulation(career, fixture, service.defaultMatchPrep());
      rows.push({
        totalGoals: result.homeScore + result.awayScore,
        goalDiff: Math.abs(result.homeScore - result.awayScore),
        totalXg: Number((result.homeXg + result.awayXg).toFixed(2)),
        highlightCount: result.highlights.length
      });
    }

    const goalTotals = rows.map((row) => row.totalGoals);
    const goalDiffs = rows.map((row) => row.goalDiff);
    const xgTotals = rows.map((row) => row.totalXg);
    const highlightCounts = rows.map((row) => row.highlightCount);

    const summary = {
      sampleSize: rows.length,
      goals: {
        average: Number((goalTotals.reduce((sum, value) => sum + value, 0) / Math.max(1, rows.length)).toFixed(3)),
        median: percentile(goalTotals, 0.5),
        p90: percentile(goalTotals, 0.9),
        goallessRate: Number((goalTotals.filter((goals) => goals === 0).length / Math.max(1, rows.length)).toFixed(3)),
        highScoringRate6Plus: Number((goalTotals.filter((goals) => goals >= 6).length / Math.max(1, rows.length)).toFixed(3))
      },
      goalDiff: {
        average: Number((goalDiffs.reduce((sum, value) => sum + value, 0) / Math.max(1, rows.length)).toFixed(3)),
        blowoutRate4Plus: Number((goalDiffs.filter((diff) => diff >= 4).length / Math.max(1, rows.length)).toFixed(3))
      },
      xg: {
        average: Number((xgTotals.reduce((sum, value) => sum + value, 0) / Math.max(1, rows.length)).toFixed(3)),
        median: Number(percentile(xgTotals, 0.5).toFixed(2)),
        p90: Number(percentile(xgTotals, 0.9).toFixed(2))
      },
      highlights: {
        averageCount: Number((highlightCounts.reduce((sum, value) => sum + value, 0) / Math.max(1, rows.length)).toFixed(2)),
        p90: percentile(highlightCounts, 0.9)
      }
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[v2-guided-telemetry] failed:', error);
  process.exit(1);
});
