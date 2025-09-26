import { PrismaClient } from '@prisma/client';

// Initialize Prisma (or import your existing instance)
const prisma = new PrismaClient();

// Types for better type safety
export interface CreatePartnershipContractData {
  // Main contract fields
  namakontrak: string;
  counterparty: string;
  type: string;
  
  // Partnership specific fields
  nomorkontrak: string;
  judul: string;
  jenis: string;
  tanggalmulai: Date | string;
  tanggalakhir: Date | string;
  perusahaan1: string;
  direktur1: string;
  alamat1: string;
  nomortel1: string;
  email1: string;
  npwp1: string;
  nomorusaha1: string;
  perusahaan2: string;
  direktur2: string;
  alamat2: string;
  nomortel2: string;
  email2: string;
  npwp2: string;
  nomorusaha2: string;
  jenislayanan: string;
  wilayahoperasi: string;
  desklayanan: string;
  hak1: string;
  hak2: string;
  syaratlayanan: string;
  nominal: number;
  tenggatbayar: Date | string;
  syaratbayar: string;
  bank: string;
  namapemilik: string;
  norek: string;
  denda: string;
  tenggatklaim: Date | string;
  makskompensasi: number;
  sengketa: string;
  majeure: string;
}

export interface CreateEmploymentContractData {
  // Main contract fields
  namakontrak: string;
  counterparty: string;
  type: string;
  
  // Employment specific fields - matching database schema
  nomorkontrak: string;
  judulkontrak: string;
  jeniskontrak: string;
  tanggalmulai: Date | string;
  tanggalakhir: Date | string;
  
  // Employee Information
  namalengkap: string;
  tanggallahir: string;
  jeniskelamin: string;
  alamatlengkap: string;
  nomortelepon: string;
  email: string;
  
  // Job Details
  posisijabatan: string;
  lokasikerja: string;
  tanggalmulaikerja: Date | string;
  haricuti: string;
  deskripsipekerjaan: string;
  detailcuti: string;
  aturanlembur: string;
  
  // Compensation
  gajipokok: number;
  tunjangantetap: number;
  tunjangantidaktetap: number;
  jaminansosial: string;
  fasilitaslain: string;
  
  // Legal & Disciplinary
  hukumdanrahasia: string;
  disiplin: string;
  sanksi: string;
  pemutusanhubungankerja: string;
}

/**
 * Creates a contract with its type-specific details
 * Handles the sync between jatuhtempo and tanggalakhir automatically
 */
export async function createContractWithDetails(data: CreatePartnershipContractData | CreateEmploymentContractData) {
  try {
    // Convert string dates to Date objects
    const tanggalAkhir = typeof data.tanggalakhir === 'string' ? new Date(data.tanggalakhir) : data.tanggalakhir;
    const tanggalMulai = typeof data.tanggalmulai === 'string' ? new Date(data.tanggalmulai) : data.tanggalmulai;

    // Step 1: Create the main contract
    const contract = await prisma.contract.create({
      data: {
        namakontrak: data.namakontrak,
        status: "draft", // Default status
        counterparty: data.counterparty,
        type: data.type,
        jatuhtempo: tanggalAkhir, // 🔄 SYNC: Use tanggalakhir as jatuhtempo
      }
    });

    console.log(`✅ Contract created with ID: ${contract.id}`);

    // Step 2: Create type-specific details based on contract type
    if (data.type === 'partnership') {
      const partnershipData = data as CreatePartnershipContractData;
      const tenggatBayar = typeof partnershipData.tenggatbayar === 'string' ? new Date(partnershipData.tenggatbayar) : partnershipData.tenggatbayar;
      const tenggatklaim = typeof partnershipData.tenggatklaim === 'string' ? new Date(partnershipData.tenggatklaim) : partnershipData.tenggatklaim;

      const partnership = await prisma.partnership.create({
        data: {
          kontrakid: contract.id, // Link to the main contract
          nomorkontrak: partnershipData.nomorkontrak,
          judul: partnershipData.judul,
          jenis: partnershipData.jenis,
          tanggalmulai: tanggalMulai,
          tanggalakhir: tanggalAkhir, // 🔄 SYNC: Same as contract.jatuhtempo
          perusahaan1: partnershipData.perusahaan1,
          direktur1: partnershipData.direktur1,
          alamat1: partnershipData.alamat1,
          nomortel1: partnershipData.nomortel1,
          email1: partnershipData.email1,
          npwp1: partnershipData.npwp1,
          nomorusaha1: partnershipData.nomorusaha1,
          perusahaan2: partnershipData.perusahaan2,
          direktur2: partnershipData.direktur2,
          alamat2: partnershipData.alamat2,
          nomortel2: partnershipData.nomortel2,
          email2: partnershipData.email2,
          npwp2: partnershipData.npwp2,
          nomorusaha2: partnershipData.nomorusaha2,
          jenislayanan: partnershipData.jenislayanan,
          wilayahoperasi: partnershipData.wilayahoperasi,
          desklayanan: partnershipData.desklayanan,
          hak1: partnershipData.hak1,
          hak2: partnershipData.hak2,
          syaratlayanan: partnershipData.syaratlayanan,
          nominal: Math.floor(partnershipData.nominal),
          tenggatbayar: tenggatBayar,
          syaratbayar: partnershipData.syaratbayar,
          bank: partnershipData.bank,
          namapemilik: partnershipData.namapemilik,
          norek: partnershipData.norek,
          denda: partnershipData.denda,
          tenggatklaim: tenggatklaim,
          makskompensasi: Math.floor(partnershipData.makskompensasi),
          sengketa: partnershipData.sengketa,
          majeure: partnershipData.majeure,
        }
      });

      console.log(`✅ Partnership details created with ID: ${partnership.id}`);
    }
    
    if (data.type === 'employment') {
      const employmentData = data as CreateEmploymentContractData;
      const tanggalMulaiKerja = typeof employmentData.tanggalmulaikerja === 'string' ? new Date(employmentData.tanggalmulaikerja) : employmentData.tanggalmulaikerja;

      const employment = await prisma.employment.create({
        data: {
          kontrakid: contract.id, // Link to the main contract
          nomorkontrak: employmentData.nomorkontrak,
          judulkontrak: employmentData.judulkontrak,
          jeniskontrak: employmentData.jeniskontrak,
          tanggalmulai: tanggalMulai,
          tanggalakhir: tanggalAkhir, // 🔄 SYNC: Same as contract.jatuhtempo
          
          // Employee Information
          namalengkap: employmentData.namalengkap,
          tanggallahir: employmentData.tanggallahir,
          jeniskelamin: employmentData.jeniskelamin,
          alamatlengkap: employmentData.alamatlengkap,
          nomortelepon: employmentData.nomortelepon,
          email: employmentData.email,
          
          // Job Details
          posisijabatan: employmentData.posisijabatan,
          lokasikerja: employmentData.lokasikerja,
          tanggalmulaikerja: tanggalMulaiKerja,
          haricuti: employmentData.haricuti,
          deskripsipekerjaan: employmentData.deskripsipekerjaan,
          detailcuti: employmentData.detailcuti,
          aturanlembur: employmentData.aturanlembur,
          
          // Compensation
          gajipokok: Math.floor(employmentData.gajipokok),
          tunjangantetap: Math.floor(employmentData.tunjangantetap),
          tunjangantidaktetap: Math.floor(employmentData.tunjangantidaktetap),
          jaminansosial: employmentData.jaminansosial,
          fasilitaslain: employmentData.fasilitaslain,
          
          // Legal & Disciplinary
          hukumdanrahasia: employmentData.hukumdanrahasia,
          disiplin: employmentData.disiplin,
          sanksi: employmentData.sanksi,
          pemutusanhubungankerja: employmentData.pemutusanhubungankerja,
        }
      });

      console.log(`✅ Employment details created with ID: ${employment.id}`);
    }

    // Step 3: Return the complete contract with relations
    return await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        partnershipDetails: true,
        employmentDetails: true
      }
    });

  } catch (error) {
    console.error('❌ Error creating contract with details:', error);
    throw error;
  }
}

/**
 * Updates a contract and keeps type-specific details in sync
 */
export async function updateContractWithDetails(contractId: number, data: Partial<CreatePartnershipContractData>) {
  try {
    // Convert dates if provided
    const updates: any = {};
    if (data.namakontrak) updates.namakontrak = data.namakontrak;
    if (data.counterparty) updates.counterparty = data.counterparty;
    if (data.tanggalakhir) {
      const tanggalAkhir = typeof data.tanggalakhir === 'string' ? new Date(data.tanggalakhir) : data.tanggalakhir;
      updates.jatuhtempo = tanggalAkhir; // 🔄 SYNC: Update jatuhtempo when tanggalakhir changes
    }

    // Update main contract
    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: updates
    });

    // Update partnership details if they exist and data is provided
    const partnership = await prisma.partnership.findUnique({
      where: { kontrakid: contractId }
    });

    if (partnership && Object.keys(data).length > 0) {
      const partnershipUpdates: any = {};
      
      // Sync tanggalakhir with jatuhtempo
      if (data.tanggalakhir) {
        const tanggalAkhir = typeof data.tanggalakhir === 'string' ? new Date(data.tanggalakhir) : data.tanggalakhir;
        partnershipUpdates.tanggalakhir = tanggalAkhir;
      }
      
      // Add other partnership fields
      if (data.judul) partnershipUpdates.judul = data.judul;
      if (data.perusahaan1) partnershipUpdates.perusahaan1 = data.perusahaan1;
      if (data.perusahaan2) partnershipUpdates.perusahaan2 = data.perusahaan2;
      // Add more fields as needed...

      await prisma.partnership.update({
        where: { kontrakid: contractId },
        data: partnershipUpdates
      });
    }

    return await prisma.contract.findUnique({
      where: { id: contractId },
      include: { partnershipDetails: true }
    });

  } catch (error) {
    console.error('❌ Error updating contract with details:', error);
    throw error;
  }
}

/**
 * Gets a contract with all its details
 */
export async function getContractWithDetails(contractId: number) {
  return await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      partnershipDetails: true
    }
  });
}

/**
 * Deletes a contract and all its related data
 */
export async function deleteContractWithDetails(contractId: number) {
  try {
    // Due to cascade delete, this will automatically delete partnership details
    const deleted = await prisma.contract.delete({
      where: { id: contractId }
    });
    
    console.log(`✅ Contract ${contractId} and all related data deleted`);
    return deleted;
  } catch (error) {
    console.error('❌ Error deleting contract:', error);
    throw error;
  }
}

export async function createEmploymentContract(contractData: any) {
  try {
    console.log('🏢 Creating employment contract with data:', contractData);
    
    // Create main contract record first
    const contract = await prisma.contract.create({
      data: {
        namakontrak: contractData.namakontrak,
        counterparty: contractData.counterparty,
        type: 'employment',
        status: 'draft',
        jatuhtempo: contractData.tanggalakhir ? new Date(contractData.tanggalakhir) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    console.log('📋 Main contract created with ID:', contract.id);

    // Create employment details record - using ONLY fields that exist in the schema
    const employmentDetails = await prisma.employment.create({
      data: {
        kontrakid: contract.id,
        
        // Contract Information
        nomorkontrak: contractData.nomorkontrak,
        judulkontrak: contractData.judulkontrak,
        jeniskontrak: contractData.jeniskontrak,
        tanggalmulai: contractData.tanggalmulai ? new Date(contractData.tanggalmulai) : new Date(),
        tanggalakhir: contractData.tanggalakhir ? new Date(contractData.tanggalakhir) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        
        // Employee Information
        namalengkap: contractData.namalengkap,
        tanggallahir: contractData.tanggallahir || '',
        jeniskelamin: contractData.jeniskelamin,
        alamatlengkap: contractData.alamatlengkap,
        nomortelepon: contractData.nomortelepon,
        email: contractData.email,
        
        // Job Details
        posisijabatan: contractData.posisijabatan,
        lokasikerja: contractData.lokasikerja,
        tanggalmulaikerja: contractData.tanggalmulaikerja ? new Date(contractData.tanggalmulaikerja) : new Date(),
        haricuti: contractData.haricuti,
        deskripsipekerjaan: contractData.deskripsipekerjaan,
        detailcuti: contractData.detailcuti,
        aturanlembur: contractData.aturanlembur,
        
        // Compensation
        gajipokok: contractData.gajipokok || 0,
        tunjangantetap: contractData.tunjangantetap || 0,
        tunjangantidaktetap: contractData.tunjangantidaktetap || 0,
        jaminansosial: contractData.jaminansosial,
        fasilitaslain: contractData.fasilitaslain,
        
        // Legal & Disciplinary
        hukumdanrahasia: contractData.hukumdanrahasia,
        disiplin: contractData.disiplin,
        sanksi: contractData.sanksi,
        pemutusanhubungankerja: contractData.pemutusanhubungankerja
      }
    });

    console.log('👨‍💼 Employment details created with ID:', employmentDetails.id);

    // Return contract with employment details
    const fullContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        employmentDetails: true
      }
    });

    return fullContract;

  } catch (error) {
    console.error('❌ Error creating employment contract:', error);
    throw error;
  }
}