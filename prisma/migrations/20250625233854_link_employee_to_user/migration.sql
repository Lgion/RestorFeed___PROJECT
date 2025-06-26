/*
  Warnings:

  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "contact" TEXT,
    "userId" INTEGER,
    "dateOfBirth" DATETIME,
    "address" TEXT,
    "socialSecurityNumber" TEXT,
    "hireDate" DATETIME,
    "fireDate" DATETIME,
    "contractType" TEXT,
    "salary" REAL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "assignedTables" TEXT,
    "location" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'Available',
    "schedule" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("address", "assignedTables", "availability", "avatar", "contact", "contractType", "createdAt", "dateOfBirth", "fireDate", "hireDate", "id", "location", "name", "notes", "role", "salary", "schedule", "socialSecurityNumber", "status") SELECT "address", "assignedTables", "availability", "avatar", "contact", "contractType", "createdAt", "dateOfBirth", "fireDate", "hireDate", "id", "location", "name", "notes", "role", "salary", "schedule", "socialSecurityNumber", "status" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'public',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("clerkId", "createdAt", "email", "id", "password", "role", "username") SELECT "clerkId", "createdAt", "email", "id", "password", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
