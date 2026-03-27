-- CreateTable
CREATE TABLE "ClubFinances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clubId" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "matchdayIncome" REAL NOT NULL DEFAULT 0,
    "seasonTicketIncome" REAL NOT NULL DEFAULT 0,
    "sponsorship" REAL NOT NULL DEFAULT 0,
    "prizeMoney" REAL NOT NULL DEFAULT 0,
    "playerSales" REAL NOT NULL DEFAULT 0,
    "playerWages" REAL NOT NULL DEFAULT 0,
    "staffWages" REAL NOT NULL DEFAULT 0,
    "facilityCosts" REAL NOT NULL DEFAULT 0,
    "youthAcademy" REAL NOT NULL DEFAULT 0,
    "transferBudget" REAL NOT NULL DEFAULT 0,
    "currentBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClubFinances_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClubFacility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clubId" INTEGER NOT NULL,
    "stadiumLevel" INTEGER NOT NULL DEFAULT 1,
    "trainingGround" INTEGER NOT NULL DEFAULT 1,
    "youthAcademy" INTEGER NOT NULL DEFAULT 1,
    "youthFacilities" INTEGER NOT NULL DEFAULT 1,
    "scoutingNetwork" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClubFacility_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClubSeasonStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clubId" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "cleanSheets" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClubSeasonStats_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubFinances_clubId_key" ON "ClubFinances"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubFinances_clubId_season_key" ON "ClubFinances"("clubId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "ClubFacility_clubId_key" ON "ClubFacility"("clubId");

-- CreateIndex
CREATE INDEX "ClubSeasonStats_season_points_idx" ON "ClubSeasonStats"("season", "points");

-- CreateIndex
CREATE UNIQUE INDEX "ClubSeasonStats_clubId_season_key" ON "ClubSeasonStats"("clubId", "season");
