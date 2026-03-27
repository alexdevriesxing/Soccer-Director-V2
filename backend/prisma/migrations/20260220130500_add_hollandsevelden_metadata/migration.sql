ALTER TABLE "League" ADD COLUMN "region" TEXT;
ALTER TABLE "League" ADD COLUMN "matchdayType" TEXT;
ALTER TABLE "League" ADD COLUMN "sourcePath" TEXT;

ALTER TABLE "Club" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "Club" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Club" ADD COLUMN "region" TEXT;
ALTER TABLE "Club" ADD COLUMN "streetAddress" TEXT;
ALTER TABLE "Club" ADD COLUMN "postalCode" TEXT;

CREATE INDEX "League_region_idx" ON "League"("region");
CREATE INDEX "Club_region_idx" ON "Club"("region");
