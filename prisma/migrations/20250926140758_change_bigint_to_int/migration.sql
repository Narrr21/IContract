/*
  Warnings:

  - You are about to alter the column `gajipokok` on the `employment_contracts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `tunjangantetap` on the `employment_contracts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `tunjangantidaktetap` on the `employment_contracts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `makskompensasi` on the `partnership_contracts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `nominal` on the `partnership_contracts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employment_contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kontrakid" INTEGER NOT NULL,
    "nomorkontrak" TEXT NOT NULL,
    "judulkontrak" TEXT NOT NULL,
    "tanggalmulai" DATETIME NOT NULL,
    "tanggalakhir" DATETIME NOT NULL,
    "namaperusahaan" TEXT NOT NULL,
    "namadirektwr" TEXT NOT NULL,
    "alamatperusahaan" TEXT NOT NULL,
    "notelpperusahaan" TEXT NOT NULL,
    "emailperusahaan" TEXT NOT NULL,
    "npwpperusahaan" TEXT NOT NULL,
    "namalengkappegawai" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "alamatpegawai" TEXT NOT NULL,
    "jeniskelamin" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "jenispegawai" TEXT NOT NULL,
    "noktp" TEXT NOT NULL,
    "notelppegawai" TEXT NOT NULL,
    "emailpegawai" TEXT NOT NULL,
    "jobdesc" TEXT NOT NULL,
    "tempatkerja" TEXT NOT NULL,
    "waktukerja" TEXT NOT NULL,
    "waktuistirahat" TEXT NOT NULL,
    "ketentuancuti" TEXT NOT NULL,
    "ketentulembur" TEXT NOT NULL,
    "gajipokok" INTEGER NOT NULL,
    "tunjangantetap" INTEGER NOT NULL,
    "tunjangantidaktetap" INTEGER NOT NULL,
    "jaminansosial" TEXT NOT NULL,
    "fasilitaslain" TEXT NOT NULL,
    "perlindunganhukum" TEXT NOT NULL,
    "kerahasiaan" TEXT NOT NULL,
    "ketentuandisiplin" TEXT NOT NULL,
    "sanksi" TEXT NOT NULL,
    "pelanggaran" TEXT NOT NULL,
    "pemutusanhubungan" TEXT NOT NULL,
    CONSTRAINT "employment_contracts_kontrakid_fkey" FOREIGN KEY ("kontrakid") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_employment_contracts" ("alamatpegawai", "alamatperusahaan", "emailpegawai", "emailperusahaan", "fasilitaslain", "gajipokok", "id", "jabatan", "jaminansosial", "jeniskelamin", "jenispegawai", "jobdesc", "judulkontrak", "kerahasiaan", "ketentuancuti", "ketentuandisiplin", "ketentulembur", "kontrakid", "namadirektwr", "namalengkappegawai", "namaperusahaan", "noktp", "nomorkontrak", "notelppegawai", "notelpperusahaan", "npwpperusahaan", "pelanggaran", "pemutusanhubungan", "perlindunganhukum", "sanksi", "tanggalakhir", "tanggalmulai", "tempatkerja", "tunjangantetap", "tunjangantidaktetap", "usia", "waktuistirahat", "waktukerja") SELECT "alamatpegawai", "alamatperusahaan", "emailpegawai", "emailperusahaan", "fasilitaslain", "gajipokok", "id", "jabatan", "jaminansosial", "jeniskelamin", "jenispegawai", "jobdesc", "judulkontrak", "kerahasiaan", "ketentuancuti", "ketentuandisiplin", "ketentulembur", "kontrakid", "namadirektwr", "namalengkappegawai", "namaperusahaan", "noktp", "nomorkontrak", "notelppegawai", "notelpperusahaan", "npwpperusahaan", "pelanggaran", "pemutusanhubungan", "perlindunganhukum", "sanksi", "tanggalakhir", "tanggalmulai", "tempatkerja", "tunjangantetap", "tunjangantidaktetap", "usia", "waktuistirahat", "waktukerja" FROM "employment_contracts";
DROP TABLE "employment_contracts";
ALTER TABLE "new_employment_contracts" RENAME TO "employment_contracts";
CREATE UNIQUE INDEX "employment_contracts_kontrakid_key" ON "employment_contracts"("kontrakid");
CREATE TABLE "new_partnership_contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kontrakid" INTEGER NOT NULL,
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
    "majeure" TEXT NOT NULL,
    CONSTRAINT "partnership_contracts_kontrakid_fkey" FOREIGN KEY ("kontrakid") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_partnership_contracts" ("alamat1", "alamat2", "bank", "denda", "desklayanan", "direktur1", "direktur2", "email1", "email2", "hak1", "hak2", "id", "jenis", "jenislayanan", "judul", "kontrakid", "majeure", "makskompensasi", "namapemilik", "nominal", "nomorkontrak", "nomortel1", "nomortel2", "nomorusaha1", "nomorusaha2", "norek", "npwp1", "npwp2", "perusahaan1", "perusahaan2", "sengketa", "syaratbayar", "syaratlayanan", "tanggalakhir", "tanggalmulai", "tenggatbayar", "tenggatklaim", "wilayahoperasi") SELECT "alamat1", "alamat2", "bank", "denda", "desklayanan", "direktur1", "direktur2", "email1", "email2", "hak1", "hak2", "id", "jenis", "jenislayanan", "judul", "kontrakid", "majeure", "makskompensasi", "namapemilik", "nominal", "nomorkontrak", "nomortel1", "nomortel2", "nomorusaha1", "nomorusaha2", "norek", "npwp1", "npwp2", "perusahaan1", "perusahaan2", "sengketa", "syaratbayar", "syaratlayanan", "tanggalakhir", "tanggalmulai", "tenggatbayar", "tenggatklaim", "wilayahoperasi" FROM "partnership_contracts";
DROP TABLE "partnership_contracts";
ALTER TABLE "new_partnership_contracts" RENAME TO "partnership_contracts";
CREATE UNIQUE INDEX "partnership_contracts_kontrakid_key" ON "partnership_contracts"("kontrakid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
