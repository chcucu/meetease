-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "feeAmount" REAL;
ALTER TABLE "Activity" ADD COLUMN "feeDeadline" DATETIME;
ALTER TABLE "Activity" ADD COLUMN "feeDescription" TEXT;
ALTER TABLE "Activity" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Activity" ADD COLUMN "locationAddress" TEXT;
ALTER TABLE "Activity" ADD COLUMN "locationLat" REAL;
ALTER TABLE "Activity" ADD COLUMN "locationLng" REAL;
ALTER TABLE "Activity" ADD COLUMN "locationName" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customData" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("activityId", "createdAt", "customData", "id", "name") SELECT "activityId", "createdAt", "customData", "id", "name" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_participantId_activityId_key" ON "Payment"("participantId", "activityId");
