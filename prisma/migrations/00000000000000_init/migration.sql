CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "coupleName1" TEXT NOT NULL,
  "coupleName2" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "eventDate" TIMESTAMP(3) NOT NULL,
  "venueName" TEXT NOT NULL,
  "venueAddress" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "coverImage" TEXT NOT NULL DEFAULT '',
  "logoImage" TEXT NOT NULL DEFAULT '',
  "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "primaryColor" TEXT NOT NULL DEFAULT '#b58b4b',
  "secondaryColor" TEXT NOT NULL DEFAULT '#d9a6a0',
  "backgroundColor" TEXT NOT NULL DEFAULT '#fbf7f0',
  "textColor" TEXT NOT NULL DEFAULT '#221f1c',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Layout" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "photoCount" INTEGER NOT NULL,
  "orientation" TEXT NOT NULL,
  "canvasWidth" INTEGER NOT NULL,
  "canvasHeight" INTEGER NOT NULL,
  "previewImage" TEXT NOT NULL DEFAULT '',
  "configJson" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Frame" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "layoutId" TEXT NOT NULL,
  "overlayImage" TEXT NOT NULL DEFAULT '',
  "previewImage" TEXT NOT NULL DEFAULT '',
  "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
  "configJson" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Frame_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventLayout" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "layoutId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "EventLayout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventFrame" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "frameId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "EventFrame_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PhotoboothSession" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "layoutId" TEXT,
  "frameId" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "deviceType" TEXT NOT NULL DEFAULT 'unknown',
  "userAgent" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "PhotoboothSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PhotoResult" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PhotoResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemSetting" (
  "id" TEXT NOT NULL,
  "saveGeneratedPhoto" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE UNIQUE INDEX "Layout_slug_key" ON "Layout"("slug");
CREATE UNIQUE INDEX "Frame_slug_key" ON "Frame"("slug");
CREATE UNIQUE INDEX "EventLayout_eventId_layoutId_key" ON "EventLayout"("eventId", "layoutId");
CREATE UNIQUE INDEX "EventFrame_eventId_frameId_key" ON "EventFrame"("eventId", "frameId");

ALTER TABLE "Frame" ADD CONSTRAINT "Frame_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventLayout" ADD CONSTRAINT "EventLayout_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventLayout" ADD CONSTRAINT "EventLayout_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventFrame" ADD CONSTRAINT "EventFrame_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventFrame" ADD CONSTRAINT "EventFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "Frame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PhotoboothSession" ADD CONSTRAINT "PhotoboothSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhotoboothSession" ADD CONSTRAINT "PhotoboothSession_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PhotoboothSession" ADD CONSTRAINT "PhotoboothSession_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "Frame"("id") ON DELETE SET NULL ON UPDATE CASCADE;
