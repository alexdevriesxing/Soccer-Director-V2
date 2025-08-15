const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

async function applyMigration() {
  const prisma = new PrismaClient();
  
  try {
    // Create the _prisma_migrations table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _prisma_migrations (
        id VARCHAR(36) PRIMARY KEY NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        finished_at DATETIME,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at DATETIME,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `;

    // Mark the migration as applied in the _prisma_migrations table
    await prisma.$executeRaw`
      INSERT INTO _prisma_migrations (
        id,
        checksum,
        finished_at,
        migration_name,
        logs,
        rolled_back_at,
        started_at,
        applied_steps_count
      ) VALUES (
        '00000000000000',
        '1f1c5f5b5d5f5e5d5c5b5a5958575655',
        datetime('now'),
        '0_initial',
        'Manually applied migration',
        NULL,
        datetime('now'),
        1
      )
    `;
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
