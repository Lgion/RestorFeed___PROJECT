-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tableId" TEXT,
    "message" TEXT NOT NULL DEFAULT 'Aide demandée',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "resolvedBy" INTEGER,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HelpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HelpRequest_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
