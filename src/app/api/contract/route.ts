// Update the API route to handle both partnership and employment contracts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('📥 Received contract data:', data)

    // Check if it's an employment contract
    if (data.type === 'employment') {
      console.log('🏢 Creating employment contract...')
      
      // Create main contract record first
      const contract = await prisma.contract.create({
        data: {
          namakontrak: data.namakontrak,
          counterparty: data.counterparty,
          type: 'employment',
          status: 'draft',
          jatuhtempo: data.tanggalakhir ? new Date(data.tanggalakhir) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })

      console.log('📋 Main contract created with ID:', contract.id)

      // Create employment details record
      const employmentDetails = await prisma.employment.create({
        data: {
          kontrakid: contract.id,
          
          // Contract Information
          nomorkontrak: data.nomorkontrak,
          judulkontrak: data.judulkontrak,
          jeniskontrak: data.jeniskontrak,
          tanggalmulai: data.tanggalmulai ? new Date(data.tanggalmulai) : new Date(),
          tanggalakhir: data.tanggalakhir ? new Date(data.tanggalakhir) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          
          // Employee Information
          namalengkap: data.namalengkap,
          tanggallahir: data.tanggallahir || '',
          jeniskelamin: data.jeniskelamin,
          alamatlengkap: data.alamatlengkap,
          nomortelepon: data.nomortelepon,
          email: data.email,
          
          // Job Details
          posisijabatan: data.posisijabatan,
          lokasikerja: data.lokasikerja,
          tanggalmulaikerja: data.tanggalmulaikerja ? new Date(data.tanggalmulaikerja) : new Date(),
          haricuti: data.haricuti,
          deskripsipekerjaan: data.deskripsipekerjaan,
          detailcuti: data.detailcuti,
          aturanlembur: data.aturanlembur,
          
          // Compensation
          gajipokok: data.gajipokok || 0,
          tunjangantetap: data.tunjangantetap || 0,
          tunjangantidaktetap: data.tunjangantidaktetap || 0,
          jaminansosial: data.jaminansosial,
          fasilitaslain: data.fasilitaslain,
          
          // Legal & Disciplinary
          hukumdanrahasia: data.hukumdanrahasia,
          disiplin: data.disiplin,
          sanksi: data.sanksi,
          pemutusanhubungankerja: data.pemutusanhubungankerja
        }
      })

      console.log('👨‍💼 Employment details created with ID:', employmentDetails.id)

      // Return contract with employment details
      const fullContract = await prisma.contract.findUnique({
        where: { id: contract.id },
        include: {
          employmentDetails: true
        }
      })

      return NextResponse.json({
        success: true,
        contract: fullContract,
        message: 'Employment contract created successfully'
      })
    } 
    else {
      // Handle partnership contracts (existing code)
      console.log('🤝 Creating partnership contract...')
      
      // Create main contract record first
      const contract = await prisma.contract.create({
        data: {
          namakontrak: data.namakontrak,
          counterparty: data.counterparty,
          type: data.type || 'partnership',
          status: 'draft',
          jatuhtempo: data.tanggalakhir ? new Date(data.tanggalakhir) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })

      // Create partnership details
      const partnershipDetails = await prisma.partnership.create({
        data: {
          kontrakid: contract.id,
          nomorkontrak: data.nomorkontrak,
          judul: data.judul,
          jenis: data.jenis,
          tanggalmulai: data.tanggalmulai ? new Date(data.tanggalmulai) : new Date(),
          tanggalakhir: data.tanggalakhir ? new Date(data.tanggalakhir) : new Date(),
          
          // Company 1
          perusahaan1: data.perusahaan1,
          direktur1: data.direktur1,
          alamat1: data.alamat1,
          nomortel1: data.nomortel1,
          email1: data.email1,
          npwp1: data.npwp1,
          nomorusaha1: data.nomorusaha1,
          
          // Company 2
          perusahaan2: data.perusahaan2,
          direktur2: data.direktur2,
          alamat2: data.alamat2,
          nomortel2: data.nomortel2,
          email2: data.email2,
          npwp2: data.npwp2,
          nomorusaha2: data.nomorusaha2,
          
          // Service details
          jenislayanan: data.jenislayanan,
          wilayahoperasi: data.wilayahoperasi,
          desklayanan: data.desklayanan,
          hak1: data.hak1,
          hak2: data.hak2,
          syaratlayanan: data.syaratlayanan,
          
          // Financial
          nominal: data.nominal || 0,
          tenggatbayar: data.tenggatbayar ? new Date(data.tenggatbayar) : new Date(),
          syaratbayar: data.syaratbayar,
          bank: data.bank,
          namapemilik: data.namapemilik,
          norek: data.norek,
          
          // Legal
          denda: data.denda,
          tenggatklaim: data.tenggatklaim ? new Date(data.tenggatklaim) : new Date(),
          makskompensasi: data.makskompensasi || 0,
          sengketa: data.sengketa,
          majeure: data.majeure
        }
      })

      // Return contract with partnership details
      const fullContract = await prisma.contract.findUnique({
        where: { id: contract.id },
        include: {
          partnershipDetails: true
        }
      })

      return NextResponse.json({
        success: true,
        contract: fullContract,
        message: 'Partnership contract created successfully'
      })
    }

  } catch (error) {
    console.error('❌ Error creating contract:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create contract',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}