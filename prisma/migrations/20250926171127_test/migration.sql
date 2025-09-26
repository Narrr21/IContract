/*
  Warnings:

  - You are about to drop the column `alamatpegawai` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `alamatperusahaan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `emailpegawai` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `emailperusahaan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `jabatan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `jenispegawai` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `jobdesc` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `kerahasiaan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `ketentuancuti` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `ketentuandisiplin` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `ketentulembur` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `namadirektwr` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `namalengkappegawai` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `namaperusahaan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `noktp` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `notelppegawai` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `notelpperusahaan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `npwpperusahaan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `pelanggaran` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `pemutusanhubungan` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `perlindunganhukum` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `tempatkerja` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `usia` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `waktuistirahat` on the `employment_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `waktukerja` on the `employment_contracts` table. All the data in the column will be lost.
  - Added the required column `alamatlengkap` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aturanlembur` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deskripsipekerjaan` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detailcuti` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disiplin` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `haricuti` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hukumdanrahasia` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jeniskontrak` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lokasikerja` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namalengkap` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomortelepon` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pemutusanhubungankerja` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posisijabatan` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggallahir` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalmulaikerja` to the `employment_contracts` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employment_contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kontrakid" INTEGER NOT NULL,
    "nomorkontrak" TEXT NOT NULL,
    "judulkontrak" TEXT NOT NULL,
    "jeniskontrak" TEXT NOT NULL,
    "tanggalmulai" DATETIME NOT NULL,
    "tanggalakhir" DATETIME NOT NULL,
    "namalengkap" TEXT NOT NULL,
    "tanggallahir" TEXT NOT NULL,
    "jeniskelamin" TEXT NOT NULL,
    "alamatlengkap" TEXT NOT NULL,
    "nomortelepon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "posisijabatan" TEXT NOT NULL,
    "lokasikerja" TEXT NOT NULL,
    "tanggalmulaikerja" DATETIME NOT NULL,
    "haricuti" TEXT NOT NULL,
    "deskripsipekerjaan" TEXT NOT NULL,
    "detailcuti" TEXT NOT NULL,
    "aturanlembur" TEXT NOT NULL,
    "gajipokok" INTEGER NOT NULL,
    "tunjangantetap" INTEGER NOT NULL,
    "tunjangantidaktetap" INTEGER NOT NULL,
    "jaminansosial" TEXT NOT NULL,
    "fasilitaslain" TEXT NOT NULL,
    "hukumdanrahasia" TEXT NOT NULL,
    "disiplin" TEXT NOT NULL,
    "sanksi" TEXT NOT NULL,
    "pemutusanhubungankerja" TEXT NOT NULL,
    CONSTRAINT "employment_contracts_kontrakid_fkey" FOREIGN KEY ("kontrakid") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_employment_contracts" ("fasilitaslain", "gajipokok", "id", "jaminansosial", "jeniskelamin", "judulkontrak", "kontrakid", "nomorkontrak", "sanksi", "tanggalakhir", "tanggalmulai", "tunjangantetap", "tunjangantidaktetap") SELECT "fasilitaslain", "gajipokok", "id", "jaminansosial", "jeniskelamin", "judulkontrak", "kontrakid", "nomorkontrak", "sanksi", "tanggalakhir", "tanggalmulai", "tunjangantetap", "tunjangantidaktetap" FROM "employment_contracts";
DROP TABLE "employment_contracts";
ALTER TABLE "new_employment_contracts" RENAME TO "employment_contracts";
CREATE UNIQUE INDEX "employment_contracts_kontrakid_key" ON "employment_contracts"("kontrakid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
