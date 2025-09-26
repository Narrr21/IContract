// Import jsPDF for PDF generation
import jsPDF from 'jspdf';

// Types for contract data
interface ContractData {
  // Informasi Umum
  nomorKontrak: string
  judul: string
  jenis: string
  tanggalMulai: Date | undefined
  durasi: string
  // Pihak 1
  pihak1: {
    namaPerusahaan: string
    namaDirektur: string
    alamat: string
    nomorTelp: string
    email: string
    npwp: string
    nomorUsaha: string
  }
  // Pihak 2
  pihak2: {
    namaPerusahaan: string
    namaDirektur: string
    alamat: string
    nomorTelp: string
    email: string
    npwp: string
    nomorUsaha: string
  }
  // Layanan
  jenisLayanan: string
  deskripsiLayanan: string
  wilayahOperasional: string
  hakKewajibanPihak1: string
  hakKewajibanPihak2: string
  syaratLayanan: string
  // Keuangan
  nominal: string
  syaratPembayaran: string
  caraPembayaran: {
    bank: string
    nama: string
    norek: string
  }
  jangkaWaktuPembayaran: string
  dendaKeterlambatan: string
  // Klaim
  batasWaktuKlaim: string
  maksimalKompensasi: string
  penyelesaianSengketa: string
  forceMajeure: string
}

interface EmploymentContractData {
  // Informasi Umum Perjanjian
  nomorKontrak: string
  judul: string
  jenis: string
  tanggalMulai: Date | undefined
  tanggalSelesai: Date | undefined
  
  // Identitas Pegawai
  namaLengkap: string
  tanggalLahir: Date | undefined
  jenisKelamin: 'L' | 'P' | ''
  alamatLengkap: string
  nomorTelepon: string
  email: string
  
  // Detail Pekerjaan
  posisiJabatan: string
  lokasiKerja: string
  tanggalMulaiKerja: Date | undefined
  jenisKontrak: 'PKWTT' | 'PKWT' | ''
  hariCuti: string
  deskripsiPekerjaan: string
  detailCuti: string
  aturanLembur: string
  
  // Kompensasi & Tunjangan
  gajiPokok: string
  tunjanganTetap: string
  tunjanganTidakTetap: string
  jaminanSosial: string
  fasilitasLain: string
  
  // Aturan kerja
  hukumDanRahasia: string
}

// Template untuk Perjanjian Kerja Sama (Partnership)
export const partnershipTemplate = `
                                PT ICONTRACT SOLUSINDO
                    Alamat: Jl. Contoh No. 123, Bandung, Jawa Barat

                              PERJANJIAN KERJA SAMA
                                 No. [NOMOR_KONTRAK]

Pada hari ini, [HARI], tanggal [TANGGAL_LENGKAP], bertempat di [TEMPAT], yang bertanda tangan di bawah ini:

PIHAK PERTAMA     : [NAMA_PERUSAHAAN_1]
                    Dalam hal ini diwakili oleh [NAMA_DIREKTUR_1] selaku Direktur
                    Berkedudukan di [ALAMAT_1]
                    NPWP: [NPWP_1]
                    Nomor Usaha: [NOMOR_USAHA_1]
                    Telepon: [TELEPON_1]
                    Email: [EMAIL_1]

PIHAK KEDUA       : [NAMA_PERUSAHAAN_2]
                    Dalam hal ini diwakili oleh [NAMA_DIREKTUR_2] selaku Direktur
                    Berkedudukan di [ALAMAT_2]
                    NPWP: [NPWP_2]
                    Nomor Usaha: [NOMOR_USAHA_2]
                    Telepon: [TELEPON_2]
                    Email: [EMAIL_2]


Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian kerja sama dengan ketentuan sebagai berikut:

                                     PASAL 1
                               MAKSUD DAN TUJUAN

Perjanjian ini dibuat dengan maksud dan tujuan untuk [JENIS_LAYANAN] yaitu [DESKRIPSI_LAYANAN] yang akan dilaksanakan di wilayah [WILAYAH_OPERASIONAL].

                                     PASAL 2
                                 RUANG LINGKUP

Ruang lingkup kerja sama ini meliputi:
1. Jenis layanan: [JENIS_LAYANAN]
2. Deskripsi layanan: [DESKRIPSI_LAYANAN]
3. Wilayah operasional: [WILAYAH_OPERASIONAL]
4. Syarat layanan: [SYARAT_LAYANAN]

                                     PASAL 3
                              HAK DAN KEWAJIBAN

A. HAK DAN KEWAJIBAN PIHAK PERTAMA:
[HAK_KEWAJIBAN_PIHAK_1]

B. HAK DAN KEWAJIBAN PIHAK KEDUA:
[HAK_KEWAJIBAN_PIHAK_2]

                                     PASAL 4
                                 JANGKA WAKTU

Perjanjian ini berlaku sejak tanggal [TANGGAL_MULAI] selama [DURASI] dan berakhir pada tanggal [TANGGAL_BERAKHIR].

                                     PASAL 5
                              NILAI KONTRAK DAN PEMBAYARAN

1. Nilai total kontrak ini adalah sebesar Rp [NOMINAL] ([NOMINAL_TERBILANG]).
2. Syarat pembayaran: [SYARAT_PEMBAYARAN]
3. Cara pembayaran: Transfer ke rekening [BANK] atas nama [NAMA_REKENING] nomor [NOMOR_REKENING]
4. Jangka waktu pembayaran: [JANGKA_WAKTU_PEMBAYARAN]
5. Denda keterlambatan: [DENDA_KETERLAMBATAN]

                                     PASAL 6
                            KLAIM DAN KOMPENSASI

1. Batas waktu klaim: [BATAS_WAKTU_KLAIM]
2. Maksimal kompensasi: [MAKSIMAL_KOMPENSASI]
3. Penyelesaian sengketa: [PENYELESAIAN_SENGKETA]

                                     PASAL 7
                                FORCE MAJEURE

[FORCE_MAJEURE]

                                     PASAL 8
                                  LAIN-LAIN

Hal-hal lain yang belum diatur dalam perjanjian ini akan diatur kemudian oleh kedua belah pihak dengan itikad baik dan saling menguntungkan.

Demikian perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing mempunyai kekuatan hukum yang sama, ditandatangani oleh kedua belah pihak dalam keadaan sadar, tanpa adanya paksaan dari pihak manapun.


                                    [KOTA], [TANGGAL_PENANDATANGANAN]


PIHAK PERTAMA                                         PIHAK KEDUA




_____________________                                 _____________________
[NAMA_DIREKTUR_1]                                     [NAMA_DIREKTUR_2]
Direktur [NAMA_PERUSAHAAN_1]                          Direktur [NAMA_PERUSAHAAN_2]
`

// Template untuk Perjanjian Kerja (Employment)
export const employmentTemplate = `
                                PT ICONTRACT SOLUSINDO
                    Alamat: Jl. Contoh No. 123, Bandung, Jawa Barat

                           PERJANJIAN KERJA [JENIS_KONTRAK]
                                 No. [NOMOR_KONTRAK]

Pada hari ini, [HARI], tanggal [TANGGAL_LENGKAP], bertempat di [TEMPAT], yang bertanda tangan di bawah ini:

PIHAK PERTAMA     : PT ICONTRACT SOLUSINDO
                    Dalam hal ini diwakili oleh Direktur Utama
                    Berkedudukan di Jl. Contoh No. 123, Bandung, Jawa Barat
                    NPWP: XX.XXX.XXX.X-XXX.XXX
                    Untuk selanjutnya disebut sebagai "PERUSAHAAN"

PIHAK KEDUA       : [NAMA_LENGKAP]
                    Tempat/Tanggal Lahir: [TEMPAT_LAHIR], [TANGGAL_LAHIR]
                    Jenis Kelamin: [JENIS_KELAMIN]
                    Alamat: [ALAMAT_LENGKAP]
                    Telepon: [NOMOR_TELEPON]
                    Email: [EMAIL]
                    Untuk selanjutnya disebut sebagai "KARYAWAN"

Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian kerja dengan ketentuan sebagai berikut:

                                     PASAL 1
                              RUANG LINGKUP PEKERJAAN

1. KARYAWAN akan melaksanakan pekerjaan sebagai [POSISI_JABATAN] di [LOKASI_KERJA].
2. Deskripsi pekerjaan: [DESKRIPSI_PEKERJAAN]
3. Tanggal mulai kerja: [TANGGAL_MULAI_KERJA]
4. Jenis kontrak: [JENIS_KONTRAK]

                                     PASAL 2
                              JANGKA WAKTU PERJANJIAN

Perjanjian kerja ini berlaku mulai tanggal [TANGGAL_MULAI] sampai dengan [TANGGAL_SELESAI].

                                     PASAL 3
                                 GAJI DAN TUNJANGAN

1. Gaji pokok per bulan: Rp [GAJI_POKOK]
2. Tunjangan tetap: [TUNJANGAN_TETAP]
3. Tunjangan tidak tetap: [TUNJANGAN_TIDAK_TETAP]
4. Jaminan sosial: [JAMINAN_SOSIAL]
5. Fasilitas lain: [FASILITAS_LAIN]

                                     PASAL 4
                                WAKTU KERJA DAN CUTI

1. Hari cuti: [HARI_CUTI]
2. Detail cuti: [DETAIL_CUTI]
3. Aturan lembur: [ATURAN_LEMBUR]

                                     PASAL 5
                         HUKUM DAN KERAHASIAAN PERUSAHAAN

[HUKUM_DAN_RAHASIA]

                                     PASAL 6
                                  LAIN-LAIN

Hal-hal yang belum diatur dalam perjanjian ini akan diatur kemudian sesuai dengan peraturan perusahaan dan perundang-undangan yang berlaku.

Demikian perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing mempunyai kekuatan hukum yang sama.


                                    [KOTA], [TANGGAL_PENANDATANGANAN]


PERUSAHAAN                                            KARYAWAN




_____________________                                 _____________________
Direktur Utama                                        [NAMA_LENGKAP]
PT ICONTRACT SOLUSINDO




[NAMA_PIHAK_1]                   [NAMA_PIHAK_2]
[JABATAN_PIHAK_1]                [JABATAN_PIHAK_2]
`;



// Interface untuk data yang sudah diformat
interface FormattedContractData {
  [key: string]: string;
}

// Interface untuk return value formatDateIndonesian
interface DateInfo {
  hari: string;
  tanggalLengkap: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  tahunAngka: string;
}

// Fungsi untuk format tanggal Indonesia
export const formatDateIndonesian = (date: Date | string | undefined): DateInfo => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Convert to Date object if needed
  let dateObj: Date;
  if (!date) {
    dateObj = new Date();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Validate date
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  const dayName = days[dateObj.getDay()];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return {
    hari: dayName,
    tanggalLengkap: `${day} ${month} ${year}`,
    tanggal: day.toString(),
    bulan: month,
    tahun: year.toString(),
    tahunAngka: year.toString()
  };
};

// Fungsi untuk convert angka ke terbilang (Indonesia)
export const numberToWords = (num: number): string => {
  const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
  const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
  const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];

  if (num === 0) return 'nol';
  if (num === 1) return 'satu';

  const convertHundreds = (n: number): string => {
    let result = '';
    
    if (n >= 100) {
      const hundreds = Math.floor(n / 100);
      result += (hundreds === 1 ? 'seratus' : ones[hundreds] + ' ratus');
      n %= 100;
      if (n > 0) result += ' ';
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += ' ' + ones[n];
    } else if (n >= 10) {
      result += teens[n - 10];
    } else if (n > 0) {
      result += ones[n];
    }
    
    return result;
  };

  let result = '';
  let thousandCounter = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      let chunkStr = convertHundreds(chunk);
      if (thousandCounter === 1 && chunk === 1) {
        chunkStr = 'seribu';
      } else if (thousandCounter > 0) {
        chunkStr += ' ' + thousands[thousandCounter];
      }
      result = chunkStr + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }
  
  return result;
};

// Fungsi untuk format data partnership contract
export const formatPartnershipContract = (data: ContractData): FormattedContractData => {
  const now = new Date();
  const startDate = data.tanggalMulai || now;
  const dateInfo = formatDateIndonesian(startDate);
  
  // Calculate end date based on duration
  const endDate = new Date(startDate);
  const durationMatch = data.durasi.match(/(\d+)/);
  const durationNumber = durationMatch ? parseInt(durationMatch[1]) : 12;
  endDate.setMonth(endDate.getMonth() + durationNumber);
  
  const nominal = parseFloat(data.nominal.replace(/[^\d]/g, '')) || 0;
  
  return {
    '[NOMOR_KONTRAK]': data.nomorKontrak,
    '[HARI]': dateInfo.hari,
    '[TANGGAL_LENGKAP]': dateInfo.tanggalLengkap,
    '[TEMPAT]': 'Jakarta',
    '[NAMA_PERUSAHAAN_1]': data.pihak1.namaPerusahaan,
    '[NAMA_DIREKTUR_1]': data.pihak1.namaDirektur,
    '[ALAMAT_1]': data.pihak1.alamat,
    '[NPWP_1]': data.pihak1.npwp,
    '[NOMOR_USAHA_1]': data.pihak1.nomorUsaha,
    '[TELEPON_1]': data.pihak1.nomorTelp,
    '[EMAIL_1]': data.pihak1.email,
    '[NAMA_PERUSAHAAN_2]': data.pihak2.namaPerusahaan,
    '[NAMA_DIREKTUR_2]': data.pihak2.namaDirektur,
    '[ALAMAT_2]': data.pihak2.alamat,
    '[NPWP_2]': data.pihak2.npwp,
    '[NOMOR_USAHA_2]': data.pihak2.nomorUsaha,
    '[TELEPON_2]': data.pihak2.nomorTelp,
    '[EMAIL_2]': data.pihak2.email,
    '[JENIS_LAYANAN]': data.jenisLayanan,
    '[DESKRIPSI_LAYANAN]': data.deskripsiLayanan,
    '[WILAYAH_OPERASIONAL]': data.wilayahOperasional,
    '[SYARAT_LAYANAN]': data.syaratLayanan,
    '[HAK_KEWAJIBAN_PIHAK_1]': data.hakKewajibanPihak1,
    '[HAK_KEWAJIBAN_PIHAK_2]': data.hakKewajibanPihak2,
    '[TANGGAL_MULAI]': formatDateIndonesian(startDate).tanggalLengkap,
    '[DURASI]': data.durasi,
    '[TANGGAL_BERAKHIR]': formatDateIndonesian(endDate).tanggalLengkap,
    '[NOMINAL]': new Intl.NumberFormat('id-ID').format(nominal),
    '[NOMINAL_TERBILANG]': numberToWords(nominal) + ' rupiah',
    '[SYARAT_PEMBAYARAN]': data.syaratPembayaran,
    '[BANK]': data.caraPembayaran.bank,
    '[NAMA_REKENING]': data.caraPembayaran.nama,
    '[NOMOR_REKENING]': data.caraPembayaran.norek,
    '[JANGKA_WAKTU_PEMBAYARAN]': data.jangkaWaktuPembayaran,
    '[DENDA_KETERLAMBATAN]': data.dendaKeterlambatan,
    '[BATAS_WAKTU_KLAIM]': data.batasWaktuKlaim,
    '[MAKSIMAL_KOMPENSASI]': data.maksimalKompensasi,
    '[PENYELESAIAN_SENGKETA]': data.penyelesaianSengketa,
    '[FORCE_MAJEURE]': data.forceMajeure,
    '[KOTA]': 'Jakarta',
    '[TANGGAL_PENANDATANGANAN]': formatDateIndonesian(now).tanggalLengkap,
  };
};

// Fungsi untuk format data employment contract
export const formatEmploymentContract = (data: EmploymentContractData): FormattedContractData => {
  const now = new Date();
  const startDate = data.tanggalMulaiKerja || now;
  const endDate = data.tanggalSelesai || new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
  const dateInfo = formatDateIndonesian(startDate);
  const birthDateInfo = data.tanggalLahir ? formatDateIndonesian(data.tanggalLahir) : { hari: '', tanggalLengkap: '' };
  
  const gajiPokok = parseFloat(data.gajiPokok.replace(/[^\d]/g, '')) || 0;
  
  return {
    '[NOMOR_KONTRAK]': data.nomorKontrak,
    '[JENIS_KONTRAK]': data.jenisKontrak === 'PKWTT' ? 'WAKTU TIDAK TERTENTU (PKWTT)' : 'WAKTU TERTENTU (PKWT)',
    '[HARI]': dateInfo.hari,
    '[TANGGAL_LENGKAP]': dateInfo.tanggalLengkap,
    '[TEMPAT]': 'Jakarta',
    '[NAMA_LENGKAP]': data.namaLengkap,
    '[TEMPAT_LAHIR]': data.alamatLengkap.split(',')[0] || 'Jakarta', // Assume first part is birthplace
    '[TANGGAL_LAHIR]': birthDateInfo.tanggalLengkap,
    '[JENIS_KELAMIN]': data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    '[ALAMAT_LENGKAP]': data.alamatLengkap,
    '[NOMOR_TELEPON]': data.nomorTelepon,
    '[EMAIL]': data.email,
    '[POSISI_JABATAN]': data.posisiJabatan,
    '[LOKASI_KERJA]': data.lokasiKerja,
    '[DESKRIPSI_PEKERJAAN]': data.deskripsiPekerjaan,
    '[TANGGAL_MULAI_KERJA]': formatDateIndonesian(startDate).tanggalLengkap,
    '[TANGGAL_MULAI]': formatDateIndonesian(startDate).tanggalLengkap,
    '[TANGGAL_SELESAI]': formatDateIndonesian(endDate).tanggalLengkap,
    '[GAJI_POKOK]': new Intl.NumberFormat('id-ID').format(gajiPokok),
    '[TUNJANGAN_TETAP]': data.tunjanganTetap,
    '[TUNJANGAN_TIDAK_TETAP]': data.tunjanganTidakTetap,
    '[JAMINAN_SOSIAL]': data.jaminanSosial,
    '[FASILITAS_LAIN]': data.fasilitasLain,
    '[HARI_CUTI]': data.hariCuti,
    '[DETAIL_CUTI]': data.detailCuti,
    '[ATURAN_LEMBUR]': data.aturanLembur,
    '[HUKUM_DAN_RAHASIA]': data.hukumDanRahasia,
    '[KOTA]': 'Jakarta',
    '[TANGGAL_PENANDATANGANAN]': formatDateIndonesian(now).tanggalLengkap,

  };
};

// Fungsi utama untuk generate contract text
export const generateContractText = (
  contractType: 'partnership' | 'employment',
  data: ContractData | EmploymentContractData
): string => {
  let template: string;
  let formattedData: FormattedContractData;

  if (contractType === 'partnership') {
    template = partnershipTemplate;
    formattedData = formatPartnershipContract(data as ContractData);
  } else {
    template = employmentTemplate;
    formattedData = formatEmploymentContract(data as EmploymentContractData);
  }

  // Replace all placeholders in template
  let result = template;
  Object.entries(formattedData).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  });

  return result;
};

// Function to generate actual PDF using jsPDF
export const generateContractPDF = (
  contractType: 'partnership' | 'employment',
  data: ContractData | EmploymentContractData
): Buffer => {
  const doc = new jsPDF();
  
  // Page settings
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  let currentY = 30;
  
  // Helper functions for different text styles
  const addTitle = (text: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, currentY);
    currentY += 10;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, currentY);
    currentY += 8;
  };

  const addSectionHeader = (text: string) => {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }
    currentY += 5; // Extra space before section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, currentY);
    currentY += 8;
  };

  const addParagraph = (text: string, isJustified: boolean = true) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const maxWidth = pageWidth - (margin * 2);
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string, index: number) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin;
      }
      
      let x = margin;
      
      // Justify text (except last line of paragraph)
      if (isJustified && index < lines.length - 1 && line.trim().length > 0) {
        const words = line.trim().split(' ');
        if (words.length > 1) {
          const totalWordsWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
          const totalSpaceNeeded = maxWidth - totalWordsWidth;
          const spacePerGap = totalSpaceNeeded / (words.length - 1);
          
          let currentX = x;
          words.forEach((word, wordIndex) => {
            doc.text(word, currentX, currentY);
            currentX += doc.getTextWidth(word);
            if (wordIndex < words.length - 1) {
              currentX += spacePerGap;
            }
          });
        } else {
          doc.text(line, x, currentY);
        }
      } else {
        doc.text(line, x, currentY);
      }
      
      currentY += 6;
    });
    
    currentY += 3; // Extra spacing after paragraphs
  };

  const addNumberedItem = (number: string, text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const numberWidth = doc.getTextWidth(number + '. ');
    const maxWidth = pageWidth - (margin * 2) - numberWidth - 5;
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Add number for first line
    doc.text(number + '.', margin, currentY);
    
    lines.forEach((line: string, index: number) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin;
      }
      
      const x = margin + numberWidth + 5;
      doc.text(line, x, currentY);
      currentY += 6;
    });
    
    currentY += 2;
  };

  const addSignatureSection = () => {
    currentY += 10;
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }
    
    const signatureY = currentY;
    const leftX = margin;
    const rightX = pageWidth - margin - 80;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left signature
    doc.text('PIHAK PERTAMA', leftX, signatureY);
    doc.text('(', leftX + 20, signatureY + 40);
    doc.text(')', leftX + 60, signatureY + 40);
    doc.line(leftX + 25, signatureY + 38, leftX + 55, signatureY + 38);
    
    // Right signature  
    doc.text('PIHAK KEDUA', rightX, signatureY);
    doc.text('(', rightX + 20, signatureY + 40);
    doc.text(')', rightX + 60, signatureY + 40);
    doc.line(rightX + 25, signatureY + 38, rightX + 55, signatureY + 38);
    
    currentY = signatureY + 50;
  };
  
  // Add company header
  addTitle('PT ICONTRACT SOLUSINDO');
  addParagraph('Alamat: Jl. Contoh No. 123, Bandung, Jawa Barat', false);
  currentY += 5;
  
  // Add contract title
  const title = contractType === 'partnership' ? 'PERJANJIAN KERJA SAMA' : 'PERJANJIAN KERJA';
  addTitle(title);
  currentY += 5;
  
  // Generate formatted content based on contract type
  if (contractType === 'employment') {
    const empData = data as EmploymentContractData;
    const formattedData = formatEmploymentContract(empData);
    
    // Contract opening
    addParagraph(`Pada hari ini, ${formattedData['{tanggal_kontrak}']}, yang bertanda tangan di bawah ini:`);
    
    // Parties section
    addSectionHeader('PIHAK PERTAMA');
    addParagraph(`Dalam hal ini diwakili oleh selaku Direktur`);
    addParagraph(`Berkedudukan di: ${formattedData['{alamat_perusahaan}'] || 'Jakarta'}`);
    addParagraph(`NPWP: ${formattedData['{npwp_perusahaan}'] || '-'}`);
    addParagraph(`Nomor Usaha: ${formattedData['{nomor_usaha}'] || '-'}`);
    addParagraph(`Telepon: ${formattedData['{telepon_perusahaan}'] || '-'}`);
    addParagraph(`Email: ${formattedData['{email_perusahaan}'] || '-'}`);
    
    addSectionHeader('PIHAK KEDUA');
    addParagraph(`Nama: ${formattedData['{nama_karyawan}']}`);
    addParagraph(`Alamat: ${formattedData['{alamat_karyawan}']}`);
    addParagraph(`No. KTP: ${formattedData['{no_ktp}']}`);
    addParagraph(`Telepon: ${formattedData['{telepon_karyawan}']}`);
    addParagraph(`Email: ${formattedData['{email_karyawan}']}`);
    
    addParagraph('Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian kerja dengan ketentuan sebagai berikut:');
    
    // Contract terms
    addSectionHeader('PASAL 1 - MAKSUD DAN TUJUAN');
    addParagraph(`Perjanjian ini dibuat dengan maksud dan tujuan untuk ${formattedData['{tujuan_perjanjian}']} yang akan dilaksanakan di ${formattedData['{lokasi_kerja}']}.`);
    
    addSectionHeader('PASAL 2 - RUANG LINGKUP KERJA');
    addParagraph(`Ruang lingkup kerja meliputi ${formattedData['{ruang_lingkup}']}.`);
    
    addSectionHeader('PASAL 3 - HAK DAN KEWAJIBAN');
    addNumberedItem('1', `Pihak Pertama berkewajiban untuk memberikan gaji sebesar ${formattedData['{gaji}']} per bulan.`);
    addNumberedItem('2', `Pihak Kedua berkewajiban untuk melaksanakan tugas sesuai dengan jabatan ${formattedData['{posisi}']}.`);
    
    addSectionHeader('PASAL 4 - JANGKA WAKTU');
    addParagraph(`Perjanjian ini berlaku sejak tanggal ${formattedData['{tanggal_mulai}']} hingga ${formattedData['{tanggal_berakhir}']}.`);
    
    addSectionHeader('PASAL 5 - LAIN-LAIN');
    addParagraph('Hal-hal lain yang belum diatur dalam perjanjian ini akan diatur kemudian oleh kedua belah pihak.');
    
  } else {
    // Partnership contract
    const partData = data as ContractData;
    const formattedData = formatPartnershipContract(partData);
    
    addParagraph(`Pada hari ini, ${formattedData['{tanggal_kontrak}']}, yang bertanda tangan di bawah ini:`);
    
    addSectionHeader('PIHAK PERTAMA');
    addParagraph(`Nama: ${formattedData['{nama_pihak_pertama}']}`);
    addParagraph(`Alamat: ${formattedData['{alamat_pihak_pertama}']}`);
    
    addSectionHeader('PIHAK KEDUA');
    addParagraph(`Nama: ${formattedData['{nama_pihak_kedua}']}`);
    addParagraph(`Alamat: ${formattedData['{alamat_pihak_kedua}']}`);
    
    addParagraph('Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian kerja sama dengan ketentuan sebagai berikut:');
    
    addSectionHeader('PASAL 1 - MAKSUD DAN TUJUAN');
    addParagraph(`Perjanjian ini dibuat dengan maksud dan tujuan untuk ${formattedData['{tujuan_kerjasama}']}.`);
    
    addSectionHeader('PASAL 2 - RUANG LINGKUP KERJA SAMA');
    addParagraph(`Ruang lingkup kerja sama ini meliputi ${formattedData['{ruang_lingkup}']}.`);
    
    addSectionHeader('PASAL 3 - HAK DAN KEWAJIBAN');
    addNumberedItem('1', 'Pihak Pertama berkewajiban untuk menyediakan fasilitas dan dukungan yang diperlukan.');
    addNumberedItem('2', 'Pihak Kedua berkewajiban untuk melaksanakan kewajiban sesuai dengan kesepakatan.');
    
    addSectionHeader('PASAL 4 - JANGKA WAKTU');
    addParagraph(`Perjanjian ini berlaku sejak tanggal ditandatangani hingga ${formattedData['{tanggal_berakhir}']}.`);
    
    addSectionHeader('PASAL 5 - LAIN-LAIN');
    addParagraph('Hal-hal lain yang belum diatur dalam perjanjian ini akan diatur kemudian oleh kedua belah pihak.');
  }
  
  // Closing and signature section
  currentY += 10;
  addParagraph('Demikian perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing mempunyai kekuatan hukum yang sama, ditandatangani oleh kedua belah pihak dalam keadaan sadar, tanpa adanya paksaan dari pihak manapun.');
  
  // Add signature section
  addSignatureSection();
  
  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
};

// Export types for use in other files
export type { ContractData, EmploymentContractData };