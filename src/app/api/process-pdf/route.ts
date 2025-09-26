import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // In a real implementation, you would:
    // 1. Use a PDF parsing library like pdf-parse or pdf2pic
    // 2. Extract text from PDF
    // 3. Use AI/NLP to identify and map contract fields
    // 4. Return structured data

    // Mock extracted data
    const extractedData = {
      nomorKontrak: 'PKS-2025-001',
      judul: 'Perjanjian Kerjasama Teknologi Informasi',
      jenis: 'PARTNERSHIP',
      tanggalMulai: '2025-01-01',
      durasi: '24 bulan',
      pihak1: {
        namaPerusahaan: 'PT. Tech Solutions Indonesia',
        namaDirektur: 'Budi Santoso',
        alamat: 'Jl. Sudirman No. 123, Jakarta Pusat 10110',
        nomorTelp: '021-12345678',
        email: 'info@techsolutions.co.id',
        npwp: '01.234.567.8-901.000',
        nomorUsaha: 'NIB-1234567890123'
      },
      pihak2: {
        namaPerusahaan: 'PT. Digital Innovation Corp',
        namaDirektur: 'Sari Indira',
        alamat: 'Jl. Thamrin No. 456, Jakarta Pusat 10230',
        nomorTelp: '021-87654321',
        email: 'contact@digitalinnovation.co.id',
        npwp: '02.345.678.9-012.000',
        nomorUsaha: 'NIB-2345678901234'
      },
      jenisLayanan: 'Pengembangan Sistem Informasi',
      deskripsiLayanan: 'Pengembangan dan implementasi sistem informasi manajemen terintegrasi berbasis web dan mobile application untuk mendukung operasional bisnis perusahaan.',
      wilayahOperasional: 'Jakarta, Bogor, Depok, Tangerang, Bekasi (Jabodetabek)',
      hakKewajibanPihak1: 'Pihak pertama berkewajiban menyediakan spesifikasi teknis, akses sistem existing, dan melakukan pembayaran sesuai jadwal yang disepakati.',
      hakKewajibanPihak2: 'Pihak kedua berkewajiban mengembangkan sistem sesuai spesifikasi, memberikan pelatihan kepada pengguna, dan menyediakan maintenance selama masa garansi.',
      syaratLayanan: 'Sistem harus memenuhi standar keamanan ISO 27001, dapat diakses 24/7 dengan uptime minimal 99%, dan mendukung minimal 1000 concurrent users.',
      nominal: 'Rp 2.500.000.000',
      syaratPembayaran: 'Pembayaran dilakukan secara bertahap: 30% di awal kontrak, 40% saat milestone 50%, 30% saat delivery. Invoice diterbitkan H-7 sebelum jatuh tempo. Termasuk PPN 11%.',
      caraPembayaran: {
        bank: 'Bank Central Asia (BCA)',
        nama: 'PT. Tech Solutions Indonesia',
        norek: '1234567890'
      },
      jangkaWaktuPembayaran: '30 hari setelah invoice diterbitkan',
      dendaKeterlambatan: 'Denda keterlambatan pembayaran sebesar 0.1% per hari dari nilai yang belum dibayar, maksimal 5% dari total nilai kontrak.',
      batasWaktuKlaim: '30 hari sejak masalah ditemukan',
      maksimalKompensasi: '100% dari nilai kontrak untuk kerugian langsung, maksimal 50% untuk kerugian tidak langsung',
      penyelesaianSengketa: 'Sengketa diselesaikan melalui mediasi terlebih dahulu. Jika gagal, melalui arbitrase di Badan Arbitrase Nasional Indonesia (BANI). Pilihan hukum: Hukum Indonesia.',
      forceMajeure: 'Termasuk bencana alam, pandemi, perang, kebijakan pemerintah, dan keadaan kahar lainnya yang mempengaruhi pelaksanaan kontrak. Pemberitahuan wajib dilakukan dalam 7 hari.'
    }

    return NextResponse.json({ 
      success: true, 
      data: extractedData,
      message: 'PDF processed successfully'
    })

  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    )
  }
}