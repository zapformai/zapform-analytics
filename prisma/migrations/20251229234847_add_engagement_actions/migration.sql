-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trigger" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "styling" JSONB NOT NULL,
    "urlPatterns" TEXT[],
    "urlMatchType" TEXT NOT NULL DEFAULT 'contains',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_interactions" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actions_projectId_isActive_idx" ON "actions"("projectId", "isActive");

-- CreateIndex
CREATE INDEX "actions_projectId_priority_idx" ON "actions"("projectId", "priority");

-- CreateIndex
CREATE INDEX "action_interactions_actionId_type_timestamp_idx" ON "action_interactions"("actionId", "type", "timestamp");

-- CreateIndex
CREATE INDEX "action_interactions_projectId_timestamp_idx" ON "action_interactions"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "action_interactions_sessionId_idx" ON "action_interactions"("sessionId");

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_interactions" ADD CONSTRAINT "action_interactions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_interactions" ADD CONSTRAINT "action_interactions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_interactions" ADD CONSTRAINT "action_interactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
