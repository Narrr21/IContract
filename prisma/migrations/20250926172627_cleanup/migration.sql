-- CreateTable
CREATE TABLE "users" (
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

-- CreateTable
CREATE TABLE "contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "namakontrak" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "counterparty" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "jatuhtempo" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "partnership_contracts" (
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

-- CreateTable
CREATE TABLE "employment_contracts" (
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partnership_contracts_kontrakid_key" ON "partnership_contracts"("kontrakid");

-- CreateIndex
CREATE UNIQUE INDEX "employment_contracts_kontrakid_key" ON "employment_contracts"("kontrakid");
