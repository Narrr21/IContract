/*
  Warnings:

  - You are about to drop the column `counterparty` on the `contracts` table. All the data in the column will be lost.
  - Added the required column `version` to the `contracts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "partnership_contracts" (
    "contractid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equityShare" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "profitSharing" TEXT NOT NULL,
    "exitClause" TEXT NOT NULL,
    CONSTRAINT "partnership_contracts_contractid_fkey" FOREIGN KEY ("contractid") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employment_contracts" (
    "contractid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "benefits" TEXT,
    "workHours" TEXT NOT NULL,
    "probationPeriod" INTEGER,
    CONSTRAINT "employment_contracts_contractid_fkey" FOREIGN KEY ("contractid") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "startdate" DATETIME NOT NULL,
    "terminationdate" DATETIME NOT NULL,
    "compensationsumm" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL,
    CONSTRAINT "contracts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_contracts" ("compensationsumm", "content", "createdAt", "id", "jurisdiction", "startdate", "status", "terminationdate", "title", "type", "updatedAt", "userId") SELECT "compensationsumm", "content", "createdAt", "id", "jurisdiction", "startdate", "status", "terminationdate", "title", "type", "updatedAt", "userId" FROM "contracts";
DROP TABLE "contracts";
ALTER TABLE "new_contracts" RENAME TO "contracts";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "category" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilepath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("category", "createdAt", "email", "firstname", "id", "lastname", "password", "profilepath", "updatedAt") SELECT "category", "createdAt", "email", "firstname", "id", "lastname", "password", "profilepath", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
