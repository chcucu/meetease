-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shareCode" TEXT NOT NULL,
    "joinCode" TEXT,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'open',
    "voteType" TEXT NOT NULL DEFAULT 'single',
    "allowSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "deadline" DATETIME,
    "tieBreakOptionIds" TEXT,
    "tieBreakUntil" DATETIME,
    "coverTheme" TEXT NOT NULL DEFAULT 'lime',
    "coverImage" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "locationName" TEXT,
    "locationAddress" TEXT,
    "locationLat" REAL,
    "locationLng" REAL,
    "feeAmount" REAL,
    "feeNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "lat" REAL,
    "lng" REAL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PollOption_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT,
    "placeholder" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CustomField_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT '匿名',
    "kind" TEXT NOT NULL DEFAULT 'other',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Suggestion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "clientKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "answers" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "conditionOptionId" TEXT,
    "condition" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Participant_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SuggestionVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SuggestionVote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SuggestionVote_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_shareCode_key" ON "Activity"("shareCode");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_joinCode_key" ON "Activity"("joinCode");

-- CreateIndex
CREATE INDEX "Activity_ownerId_createdAt_idx" ON "Activity"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "PollOption_activityId_kind_idx" ON "PollOption"("activityId", "kind");

-- CreateIndex
CREATE INDEX "CustomField_activityId_idx" ON "CustomField"("activityId");

-- CreateIndex
CREATE INDEX "Suggestion_activityId_createdAt_idx" ON "Suggestion"("activityId", "createdAt");

-- CreateIndex
CREATE INDEX "Participant_activityId_createdAt_idx" ON "Participant"("activityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_activityId_clientKey_key" ON "Participant"("activityId", "clientKey");

-- CreateIndex
CREATE INDEX "Vote_optionId_idx" ON "Vote"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_participantId_optionId_key" ON "Vote"("participantId", "optionId");

-- CreateIndex
CREATE INDEX "SuggestionVote_suggestionId_idx" ON "SuggestionVote"("suggestionId");

-- CreateIndex
CREATE UNIQUE INDEX "SuggestionVote_participantId_suggestionId_key" ON "SuggestionVote"("participantId", "suggestionId");

