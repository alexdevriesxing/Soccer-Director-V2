-- CreateTable
CREATE TABLE "League" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Netherlands',
    "tier" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "founded" INTEGER,
    "city" TEXT,
    "stadium" TEXT,
    "capacity" INTEGER,
    "reputation" INTEGER DEFAULT 50,
    "financialStatus" INTEGER DEFAULT 50,
    "morale" INTEGER DEFAULT 70,
    "form" TEXT,
    "leagueId" INTEGER,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "balance" REAL NOT NULL DEFAULT 0,
    "transferBudget" REAL NOT NULL DEFAULT 0,
    "wageBudget" REAL NOT NULL DEFAULT 0,
    "averageAttendance" INTEGER DEFAULT 0,
    "isJongTeam" BOOLEAN NOT NULL DEFAULT false,
    "parentClubId" INTEGER,
    "isUserControlled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Club_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Club_parentClubId_fkey" FOREIGN KEY ("parentClubId") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Club" ("averageAttendance", "balance", "capacity", "city", "createdAt", "financialStatus", "founded", "id", "isActive", "isUserControlled", "name", "primaryColor", "reputation", "secondaryColor", "shortName", "stadium", "transferBudget", "updatedAt", "wageBudget") SELECT "averageAttendance", "balance", "capacity", "city", "createdAt", "financialStatus", "founded", "id", "isActive", "isUserControlled", "name", "primaryColor", "reputation", "secondaryColor", "shortName", "stadium", "transferBudget", "updatedAt", "wageBudget" FROM "Club";
DROP TABLE "Club";
ALTER TABLE "new_Club" RENAME TO "Club";
CREATE INDEX "Club_name_idx" ON "Club"("name");
CREATE INDEX "Club_city_idx" ON "Club"("city");
CREATE INDEX "Club_reputation_idx" ON "Club"("reputation");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "League_name_idx" ON "League"("name");

-- CreateIndex
CREATE INDEX "League_level_idx" ON "League"("level");

-- CreateIndex
CREATE INDEX "League_country_idx" ON "League"("country");

-- CreateIndex
CREATE INDEX "League_tier_idx" ON "League"("tier");
