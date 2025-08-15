import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { slugify } from '../src/utils/slugify.js';

const prisma = new PrismaClient();

async function exportClubData() {
  console.log('🚀 Starting club data export...');
  const outputBaseDir = path.resolve(process.cwd(), '..', 'frontend', 'public', 'data', 'clubs');

  try {
    await prisma.$connect();
    console.log('📚 Fetching all leagues and associated clubs from the database...');

    const leagues = await prisma.league.findMany({
      include: {
        clubs: {
          orderBy: { name: 'asc' },
        },
      },
    });

    console.log(`Found ${leagues.length} leagues to process.`);

    // Clear out the old directory to ensure a clean export
    await fs.rm(outputBaseDir, { recursive: true, force: true });
    await fs.mkdir(outputBaseDir, { recursive: true });

    for (const league of leagues) {
      if (!league.region || !league.division || league.clubs.length === 0) {
        continue; // Skip leagues without a region, division, or clubs
      }

      const regionDir = path.join(outputBaseDir, slugify(league.region));
      await fs.mkdir(regionDir, { recursive: true });

      const filePath = path.join(regionDir, `${slugify(league.division)}.json`);
      await fs.writeFile(filePath, JSON.stringify(league.clubs, null, 2));
      console.log(`✅ Wrote ${league.clubs.length} clubs to ${path.relative(process.cwd(), filePath)}`);
    }

    console.log('\n🎉 Export complete!');
  } catch (error) {
    console.error('❌ An error occurred during the export:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportClubData();