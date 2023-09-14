-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Follow" (
    "followId" TEXT NOT NULL PRIMARY KEY,
    "userFollowId" TEXT NOT NULL,
    "userFollowedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_userFollowedId_fkey" FOREIGN KEY ("userFollowedId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follow" ("createdAt", "followId", "userFollowId", "userFollowedId") SELECT "createdAt", "followId", "userFollowId", "userFollowedId" FROM "Follow";
DROP TABLE "Follow";
ALTER TABLE "new_Follow" RENAME TO "Follow";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
