/*
  Warnings:

  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Player";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Competition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Netherlands',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentCompetitionId" INTEGER,
    "promotionSpots" INTEGER,
    "relegationSpots" INTEGER,
    "playoffSpots" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Competition_parentCompetitionId_fkey" FOREIGN KEY ("parentCompetitionId") REFERENCES "Competition" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamInCompetition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "form" TEXT,
    "homeForm" TEXT,
    "awayForm" TEXT,
    "promotion" BOOLEAN NOT NULL DEFAULT false,
    "relegation" BOOLEAN NOT NULL DEFAULT false,
    "playoff" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "TeamInCompetition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamInCompetition_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "competitionId" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "matchDay" INTEGER NOT NULL,
    "matchDate" DATETIME NOT NULL,
    "isPlayed" BOOLEAN NOT NULL DEFAULT false,
    "isPostponed" BOOLEAN NOT NULL DEFAULT false,
    "attendance" INTEGER,
    "stadium" TEXT,
    "referee" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Fixture_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Fixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Fixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fixtureId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "playerId" INTEGER,
    "clubId" INTEGER NOT NULL,
    "description" TEXT,
    "isHomeTeam" BOOLEAN NOT NULL,
    CONSTRAINT "MatchEvent_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MatchEvent_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Netherlands',
    "height" INTEGER,
    "weight" INTEGER,
    "currentClubId" INTEGER,
    "contractStart" DATETIME,
    "contractEnd" DATETIME,
    "weeklyWage" REAL,
    "value" REAL,
    "position" TEXT NOT NULL,
    "preferredFoot" TEXT,
    "appearances" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "isInjured" BOOLEAN NOT NULL DEFAULT false,
    "injuryEndDate" DATETIME,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspensionEndDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "players_currentClubId_fkey" FOREIGN KEY ("currentClubId") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "nationality" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "clubId" INTEGER NOT NULL,
    "contractStart" DATETIME NOT NULL,
    "contractEnd" DATETIME NOT NULL,
    "weeklyWage" REAL NOT NULL,
    "ability" INTEGER,
    "potential" INTEGER,
    "preferredFormation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Staff_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "balance" REAL NOT NULL DEFAULT 0,
    "transferBudget" REAL NOT NULL DEFAULT 0,
    "wageBudget" REAL NOT NULL DEFAULT 0,
    "averageAttendance" INTEGER DEFAULT 0,
    "isUserControlled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Club" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Club";
DROP TABLE "Club";
ALTER TABLE "new_Club" RENAME TO "Club";
CREATE INDEX "Club_name_idx" ON "Club"("name");
CREATE INDEX "Club_city_idx" ON "Club"("city");
CREATE INDEX "Club_reputation_idx" ON "Club"("reputation");
CREATE TABLE "new_TransferListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "askingPrice" REAL NOT NULL,
    "listingType" TEXT NOT NULL DEFAULT 'TRANSFER',
    "loanFee" REAL,
    "wageContribution" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deadline" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransferListing_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferListing_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransferListing" ("askingPrice", "clubId", "createdAt", "deadline", "id", "listingType", "loanFee", "playerId", "status", "updatedAt", "wageContribution") SELECT "askingPrice", "clubId", "createdAt", "deadline", "id", "listingType", "loanFee", "playerId", "status", "updatedAt", "wageContribution" FROM "TransferListing";
DROP TABLE "TransferListing";
ALTER TABLE "new_TransferListing" RENAME TO "TransferListing";
CREATE INDEX "TransferListing_playerId_idx" ON "TransferListing"("playerId");
CREATE INDEX "TransferListing_clubId_idx" ON "TransferListing"("clubId");
CREATE INDEX "TransferListing_status_idx" ON "TransferListing"("status");
CREATE INDEX "TransferListing_deadline_idx" ON "TransferListing"("deadline");
CREATE TABLE "new_TransferOffer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "fromClubId" INTEGER NOT NULL,
    "toClubId" INTEGER NOT NULL,
    "listingId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" REAL NOT NULL,
    "isLoan" BOOLEAN NOT NULL DEFAULT false,
    "loanEndDate" DATETIME,
    "wageContribution" REAL,
    "transferFee" REAL,
    "contractLength" INTEGER,
    "weeklyWage" REAL,
    "addonClauses" JSONB,
    "message" TEXT,
    "response" TEXT,
    "initiator" TEXT,
    "counteredAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deadline" DATETIME,
    "history" JSONB,
    "isLoanWithOption" BOOLEAN NOT NULL DEFAULT false,
    "optionToBuyFee" REAL,
    CONSTRAINT "TransferOffer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferOffer_fromClubId_fkey" FOREIGN KEY ("fromClubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferOffer_toClubId_fkey" FOREIGN KEY ("toClubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferOffer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "TransferListing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TransferOffer" ("addonClauses", "amount", "contractLength", "counteredAmount", "createdAt", "deadline", "fromClubId", "history", "id", "initiator", "isLoan", "isLoanWithOption", "listingId", "loanEndDate", "message", "optionToBuyFee", "playerId", "response", "status", "toClubId", "transferFee", "updatedAt", "wageContribution") SELECT "addonClauses", "amount", "contractLength", "counteredAmount", "createdAt", "deadline", "fromClubId", "history", "id", "initiator", "isLoan", "isLoanWithOption", "listingId", "loanEndDate", "message", "optionToBuyFee", "playerId", "response", "status", "toClubId", "transferFee", "updatedAt", "wageContribution" FROM "TransferOffer";
DROP TABLE "TransferOffer";
ALTER TABLE "new_TransferOffer" RENAME TO "TransferOffer";
CREATE INDEX "TransferOffer_playerId_idx" ON "TransferOffer"("playerId");
CREATE INDEX "TransferOffer_fromClubId_idx" ON "TransferOffer"("fromClubId");
CREATE INDEX "TransferOffer_toClubId_idx" ON "TransferOffer"("toClubId");
CREATE INDEX "TransferOffer_listingId_idx" ON "TransferOffer"("listingId");
CREATE INDEX "TransferOffer_status_idx" ON "TransferOffer"("status");
CREATE INDEX "TransferOffer_deadline_idx" ON "TransferOffer"("deadline");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TeamInCompetition_competitionId_position_idx" ON "TeamInCompetition"("competitionId", "position");

-- CreateIndex
CREATE INDEX "TeamInCompetition_points_goalDifference_goalsFor_idx" ON "TeamInCompetition"("points", "goalDifference", "goalsFor");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInCompetition_teamId_competitionId_key" ON "TeamInCompetition"("teamId", "competitionId");

-- CreateIndex
CREATE INDEX "Fixture_competitionId_idx" ON "Fixture"("competitionId");

-- CreateIndex
CREATE INDEX "Fixture_homeTeamId_idx" ON "Fixture"("homeTeamId");

-- CreateIndex
CREATE INDEX "Fixture_awayTeamId_idx" ON "Fixture"("awayTeamId");

-- CreateIndex
CREATE INDEX "Fixture_matchDay_idx" ON "Fixture"("matchDay");

-- CreateIndex
CREATE INDEX "Fixture_matchDate_idx" ON "Fixture"("matchDate");

-- CreateIndex
CREATE INDEX "MatchEvent_fixtureId_idx" ON "MatchEvent"("fixtureId");

-- CreateIndex
CREATE INDEX "MatchEvent_playerId_idx" ON "MatchEvent"("playerId");

-- CreateIndex
CREATE INDEX "MatchEvent_clubId_idx" ON "MatchEvent"("clubId");

-- CreateIndex
CREATE INDEX "players_firstName_lastName_idx" ON "players"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "players_currentClubId_idx" ON "players"("currentClubId");

-- CreateIndex
CREATE INDEX "players_nationality_idx" ON "players"("nationality");

-- CreateIndex
CREATE INDEX "players_position_idx" ON "players"("position");

-- CreateIndex
CREATE INDEX "players_value_idx" ON "players"("value");

-- CreateIndex
CREATE INDEX "Staff_clubId_idx" ON "Staff"("clubId");

-- CreateIndex
CREATE INDEX "Staff_role_idx" ON "Staff"("role");
