-- CreateTable
CREATE TABLE "Footprint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER NOT NULL,
    "visitorId" INTEGER NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "visitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Footprint_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Footprint_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Footprint_ownerId_visitedAt_idx" ON "Footprint"("ownerId", "visitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Footprint_ownerId_visitorId_key" ON "Footprint"("ownerId", "visitorId");
