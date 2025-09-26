/*
  Warnings:

  - You are about to drop the `employment_contracts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `compensationsumm` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `jurisdiction` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `startdate` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `terminationdate` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `contracts` table. All the data in the column will be lost.
  - The primary key for the `partnership_contracts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contractid` on the `partnership_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `equityShare` on the `partnership_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `exitClause` on the `partnership_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `profitSharing` on the `partnership_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `partnership_contracts` table. All the data in the column will be lost.
  - Added the required column `counterparty` to the `contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jatuhtempo` to the `contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namakontrak` to the `contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alamat1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alamat2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `denda` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desklayanan` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direktur1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direktur2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hak1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hak2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenis` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenislayanan` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `judul` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kontrakid` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `majeure` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `makskompensasi` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namapemilik` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nominal` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorkontrak` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomortel1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomortel2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorusaha1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorusaha2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `norek` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `npwp1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `npwp2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perusahaan1` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perusahaan2` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sengketa` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syaratbayar` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syaratlayanan` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalakhir` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalmulai` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenggatbayar` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenggatklaim` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wilayahoperasi` to the `partnership_contracts` table without a default value. This is not possible if the table is not empty.
  - Made the column `profilepath` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "employment_contracts";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "namakontrak" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "counterparty" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "jatuhtempo" DATETIME NOT NULL
);
INSERT INTO "new_contracts" ("createdAt", "id", "status", "type", "updatedAt") SELECT "createdAt", "id", "status", "type", "updatedAt" FROM "contracts";
DROP TABLE "contracts";
ALTER TABLE "new_contracts" RENAME TO "contracts";
CREATE TABLE "new_partnership_contracts" (
    "kontrakid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomorkontrak" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "tanggalmulai" DATETIME NOT NULL,
    "tanggalakhir" DATETIME NOT NULL,
    "perusahaan1" TEXT NOT NULL,
    "direktur1" TEXT NOT NULL,
    "alamat1" TEXT NOT NULL,
    "nomortel1" TEXT NOT NULL,
    "email1" TEXT NOT NULL,
    "npwp1" TEXT NOT NULL,
    "nomorusaha1" TEXT NOT NULL,
    "perusahaan2" TEXT NOT NULL,
    "direktur2" TEXT NOT NULL,
    "alamat2" TEXT NOT NULL,
    "nomortel2" TEXT NOT NULL,
    "email2" TEXT NOT NULL,
    "npwp2" TEXT NOT NULL,
    "nomorusaha2" TEXT NOT NULL,
    "jenislayanan" TEXT NOT NULL,
    "wilayahoperasi" TEXT NOT NULL,
    "desklayanan" TEXT NOT NULL,
    "hak1" TEXT NOT NULL,
    "hak2" TEXT NOT NULL,
    "syaratlayanan" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "tenggatbayar" DATETIME NOT NULL,
    "syaratbayar" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "namapemilik" TEXT NOT NULL,
    "norek" TEXT NOT NULL,
    "denda" TEXT NOT NULL,
    "tenggatklaim" DATETIME NOT NULL,
    "makskompensasi" INTEGER NOT NULL,
    "sengketa" TEXT NOT NULL,
    "majeure" TEXT NOT NULL
);
DROP TABLE "partnership_contracts";
ALTER TABLE "new_partnership_contracts" RENAME TO "partnership_contracts";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "category" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilepath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("category", "createdAt", "email", "firstname", "id", "lastname", "password", "profilepath", "updatedAt") SELECT "category", "createdAt", "email", "firstname", "id", "lastname", "password", "profilepath", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
