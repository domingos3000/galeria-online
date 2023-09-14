-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "birth" TEXT,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT DEFAULT 'avatar-default.jpg',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "resetPassword" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("address", "avatarUrl", "birth", "createdAt", "email", "name", "password", "resetPassword", "updatedAt", "userId", "username") SELECT "address", "avatarUrl", "birth", "createdAt", "email", "name", "password", "resetPassword", "updatedAt", "userId", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
