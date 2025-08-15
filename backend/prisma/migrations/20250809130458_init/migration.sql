-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "currentClubId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Player_currentClubId_fkey" FOREIGN KEY ("currentClubId") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TransferListing" (
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
    CONSTRAINT "TransferListing_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferListing_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransferOffer" (
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
    "addonClauses" JSONB,
    "message" TEXT,
    "response" TEXT,
    "initiator" TEXT,
    "contractLength" INTEGER,
    "deadline" DATETIME,
    "history" JSONB,
    "isLoanWithOption" BOOLEAN NOT NULL DEFAULT false,
    "optionToBuyFee" REAL,
    "counteredAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransferOffer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferOffer_fromClubId_fkey" FOREIGN KEY ("fromClubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferOffer_toClubId_fkey" FOREIGN KEY ("toClubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferOffer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "TransferListing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TransferListing_playerId_idx" ON "TransferListing"("playerId");

-- CreateIndex
CREATE INDEX "TransferListing_clubId_idx" ON "TransferListing"("clubId");

-- CreateIndex
CREATE INDEX "TransferOffer_playerId_idx" ON "TransferOffer"("playerId");

-- CreateIndex
CREATE INDEX "TransferOffer_fromClubId_idx" ON "TransferOffer"("fromClubId");

-- CreateIndex
CREATE INDEX "TransferOffer_toClubId_idx" ON "TransferOffer"("toClubId");

-- CreateIndex
CREATE INDEX "TransferOffer_listingId_idx" ON "TransferOffer"("listingId");

-- CreateIndex
CREATE INDEX "TransferOffer_status_idx" ON "TransferOffer"("status");

-- CreateIndex
CREATE INDEX "TransferOffer_createdAt_idx" ON "TransferOffer"("createdAt");

-- CreateIndex
CREATE INDEX "TransferOffer_deadline_idx" ON "TransferOffer"("deadline");
