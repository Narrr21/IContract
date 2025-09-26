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

/**
 * Creates a contract with its type-specific details
 * Handles the sync between jatuhtempo and tanggalakhir automatically
 */
export async function createContractWithDetails(data: CreatePartnershipContractData) {
  try {
    // Convert string dates to Date objects
    const tanggalAkhir = typeof data.tanggalakhir === 'string' ? new Date(data.tanggalakhir) : data.tanggalakhir;
    const tanggalMulai = typeof data.tanggalmulai === 'string' ? new Date(data.tanggalmulai) : data.tanggalmulai;
    const tenggatBayar = typeof data.tenggatbayar === 'string' ? new Date(data.tenggatbayar) : data.tenggatbayar;
    const tenggatklaim = typeof data.tenggatklaim === 'string' ? new Date(data.tenggatklaim) : data.tenggatklaim;

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
      const partnership = await prisma.partnership.create({
        data: {
          kontrakid: contract.id, // Link to the main contract
          nomorkontrak: data.nomorkontrak,
          judul: data.judul,
          jenis: data.jenis,
          tanggalmulai: tanggalMulai,
          tanggalakhir: tanggalAkhir, // 🔄 SYNC: Same as contract.jatuhtempo
          perusahaan1: data.perusahaan1,
          direktur1: data.direktur1,
          alamat1: data.alamat1,
          nomortel1: data.nomortel1,
          email1: data.email1,
          npwp1: data.npwp1,
          nomorusaha1: data.nomorusaha1,
          perusahaan2: data.perusahaan2,
          direktur2: data.direktur2,
          alamat2: data.alamat2,
          nomortel2: data.nomortel2,
          email2: data.email2,
          npwp2: data.npwp2,
          nomorusaha2: data.nomorusaha2,
          jenislayanan: data.jenislayanan,
          wilayahoperasi: data.wilayahoperasi,
          desklayanan: data.desklayanan,
          hak1: data.hak1,
          hak2: data.hak2,
          syaratlayanan: data.syaratlayanan,
          nominal: data.nominal,
          tenggatbayar: tenggatBayar,
          syaratbayar: data.syaratbayar,
          bank: data.bank,
          namapemilik: data.namapemilik,
          norek: data.norek,
          denda: data.denda,
          tenggatklaim: tenggatklaim,
          makskompensasi: data.makskompensasi,
          sengketa: data.sengketa,
          majeure: data.majeure,
        }
      });

      console.log(`✅ Partnership details created with ID: ${partnership.id}`);
    }

    // Step 3: Return the complete contract with relations
    return await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        partnershipDetails: true
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

/**
 * Calculate end date based on start date and contract type
 */
export function calculateEndDate(startDate: Date, contractType: string): Date {
  const endDate = new Date(startDate);
  
  switch (contractType.toLowerCase()) {
    case 'tetap':
    case 'permanent':
      // Permanent contracts typically have a long duration, using 2 years as default
      endDate.setFullYear(endDate.getFullYear() + 2);
      break;
    case 'kontrak':
    case 'contract':
      // Contract employment typically 1 year
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case 'magang':
    case 'internship':
      // Internship typically 3-6 months
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case 'paruh waktu':
    case 'part-time':
      // Part-time can vary, using 1 year as default
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      // Default to 1 year
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }
  
  return endDate;
}