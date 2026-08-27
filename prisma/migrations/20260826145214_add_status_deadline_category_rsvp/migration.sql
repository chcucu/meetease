-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "response" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rsvp_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rsvp_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL DEFAULT 'Organizer',
    "allowSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "voteType" TEXT NOT NULL DEFAULT 'single',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "shareCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "deadline" DATETIME,
    "category" TEXT NOT NULL DEFAULT 'other',
    "imageUrl" TEXT,
    "feeAmount" REAL,
    "feeDescription" TEXT,
    "feeDeadline" DATETIME,
    "locationName" TEXT,
    "locationAddress" TEXT,
    "locationLat" REAL,
    "locationLng" REAL
);
INSERT INTO "new_Activity" ("allowSuggestions", "createdAt", "creatorName", "description", "feeAmount", "feeDeadline", "feeDescription", "id", "imageUrl", "isPublished", "locationAddress", "locationLat", "locationLng", "locationName", "shareCode", "title", "updatedAt", "voteType") SELECT "allowSuggestions", "createdAt", "creatorName", "description", "feeAmount", "feeDeadline", "feeDescription", "id", "imageUrl", "isPublished", "locationAddress", "locationLat", "locationLng", "locationName", "shareCode", "title", "updatedAt", "voteType" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE UNIQUE INDEX "Activity_shareCode_key" ON "Activity"("shareCode");
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customData" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "rsvp" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("activityId", "createdAt", "customData", "id", "name", "paid", "paidAt") SELECT "activityId", "createdAt", "customData", "id", "name", "paid", "paidAt" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_participantId_activityId_key" ON "Rsvp"("participantId", "activityId");
