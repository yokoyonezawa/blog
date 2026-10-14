-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postSlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "anonId" TEXT,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Like" ("createdAt", "id", "postSlug", "userId") SELECT "createdAt", "id", "postSlug", "userId" FROM "Like";
DROP TABLE "Like";
ALTER TABLE "new_Like" RENAME TO "Like";
CREATE INDEX "Like_postSlug_idx" ON "Like"("postSlug");
CREATE UNIQUE INDEX "Like_postSlug_userId_key" ON "Like"("postSlug", "userId");
CREATE UNIQUE INDEX "Like_postSlug_anonId_key" ON "Like"("postSlug", "anonId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
