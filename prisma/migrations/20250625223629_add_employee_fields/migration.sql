/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Employee` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "contact" TEXT,
    "email" TEXT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Employee" ("assignedTables", "availability", "avatar", "contact", "createdAt", "id", "location", "name", "role", "schedule") SELECT "assignedTables", "availability", "avatar", "contact", "createdAt", "id", "location", "name", "role", "schedule" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
