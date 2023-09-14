-- CreateTable
CREATE TABLE "Logout" (
    "logoutId" TEXT NOT NULL PRIMARY KEY,
    "invalidToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
