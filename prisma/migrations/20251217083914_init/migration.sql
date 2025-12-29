-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "referrer" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "elementSelector" TEXT NOT NULL,
    "elementText" TEXT,
    "xCoordinate" INTEGER NOT NULL,
    "yCoordinate" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scroll_events" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "scrollDepth" INTEGER NOT NULL,
    "maxScroll" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scroll_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "ipAddress" TEXT,
    "country" TEXT,
    "city" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "projects_trackingId_key" ON "projects"("trackingId");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "projects_trackingId_idx" ON "projects"("trackingId");

-- CreateIndex
CREATE INDEX "page_views_projectId_timestamp_idx" ON "page_views"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "page_views_sessionId_idx" ON "page_views"("sessionId");

-- CreateIndex
CREATE INDEX "click_events_projectId_timestamp_idx" ON "click_events"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "click_events_sessionId_idx" ON "click_events"("sessionId");

-- CreateIndex
CREATE INDEX "scroll_events_projectId_timestamp_idx" ON "scroll_events"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "scroll_events_sessionId_idx" ON "scroll_events"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_sessions_sessionToken_key" ON "analytics_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "analytics_sessions_projectId_startTime_idx" ON "analytics_sessions"("projectId", "startTime");

-- CreateIndex
CREATE INDEX "analytics_sessions_sessionToken_idx" ON "analytics_sessions"("sessionToken");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scroll_events" ADD CONSTRAINT "scroll_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scroll_events" ADD CONSTRAINT "scroll_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
