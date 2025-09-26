import { PrismaClient, UserCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create dummy users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        firstname: "Admin",
        lastname: "User",
        category: UserCategory.ADMIN,
        password: hashedPassword,
        profilepath: "/profiles/admin.png",
      },
    }),
    prisma.user.upsert({
      where: { email: "legal@example.com" },
      update: {},
      create: {
        email: "legal@example.com",
        firstname: "Legal",
        lastname: "Manager",
        category: UserCategory.LEGAL,
        password: hashedPassword,
        profilepath: "/profiles/legal.png",
      },
    }),
    prisma.user.upsert({
      where: { email: "hr@example.com" },
      update: {},
      create: {
        email: "hr@example.com",
        firstname: "HR",
        lastname: "Manager",
        category: UserCategory.HR,
        password: hashedPassword,
        profilepath: "/profiles/hr.png",
      },
    }),
  ]);

  console.log("✅ Created users:", users.length);

  // Sample contracts with variety of types and statuses
  const sampleContracts = [
    {
      namakontrak: "Kontrak Kerja Pak Budi",
      status: "dihentikan",
      counterparty: "PT Mulia Abadi",
      type: "employment",
      jatuhtempo: new Date("2025-03-01"),
    },
    {
      namakontrak: "Kontrak Partnership ABC Corp",
      status: "aktif",
      counterparty: "ABC Corporation",
      type: "partnership",
      jatuhtempo: new Date("2025-12-31"),
    },
    {
      namakontrak: "Kontrak Layanan IT Support",
      status: "draft",
      counterparty: "Tech Solutions",
      type: "services",
      jatuhtempo: new Date("2024-12-31"),
    },
    {
      namakontrak: "Kontrak Konsultan Marketing",
      status: "aktif",
      counterparty: "Marketing Pro",
      type: "consulting",
      jatuhtempo: new Date("2025-06-15"),
    },
    {
      namakontrak: "Partnership Agreement - Digital Transformation",
      status: "aktif",
      counterparty: "PT Teknologi Maju",
      type: "partnership",
      jatuhtempo: new Date("2026-01-31"),
    },
    {
      namakontrak: "Strategic Alliance Contract",
      status: "draft",
      counterparty: "Synergy Industries",
      type: "partnership",
      jatuhtempo: new Date("2025-08-15"),
    },
    {
      namakontrak: "Employment Contract - Senior Developer",
      status: "aktif",
      counterparty: "John Smith",
      type: "employment",
      jatuhtempo: new Date("2025-12-31"),
    },
    {
      namakontrak: "Service Agreement - Cloud Migration",
      status: "berakhir",
      counterparty: "CloudTech Solutions",
      type: "services",
      jatuhtempo: new Date("2024-11-30"),
    },
  ];

  // Create contracts
  const createdContracts = [];
  for (const contract of sampleContracts) {
    const created = await prisma.contract.create({
      data: contract,
    });
    createdContracts.push(created);
  }

  console.log("✅ Sample contracts created:", createdContracts.length);

  // Create detailed partnership contracts for partnership type contracts
  const partnershipContracts = createdContracts.filter(
    (c) => c.type === "partnership"
  );

  const partnershipDetails = [
    // Partnership 1: ABC Corporation
    {
      kontrakid: partnershipContracts[0].id,
      nomorkontrak: "PKS-2024-001",
      judul: "Strategic Partnership Agreement with ABC Corporation",
      jenis: "Technology Partnership",
      tanggalmulai: new Date("2024-01-01"),
      tanggalakhir: new Date("2025-12-31"),
      perusahaan1: "Your Company Ltd",
      direktur1: "Budi Santoso",
      alamat1: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta",
      nomortel1: "+62-21-1234567",
      email1: "budi@yourcompany.com",
      npwp1: "12.345.678.9-012.345",
      nomorusaha1: "NIB-001234567890",
      perusahaan2: "ABC Corporation",
      direktur2: "Jane Wilson",
      alamat2: "Jl. Gatot Subroto No. 456, Jakarta Selatan, DKI Jakarta",
      nomortel2: "+62-21-7654321",
      email2: "jane@abccorp.com",
      npwp2: "98.765.432.1-098.765",
      nomorusaha2: "NIB-098765432100",
      jenislayanan: "Software Development and Digital Consulting",
      wilayahoperasi: "Indonesia and Southeast Asia",
      desklayanan:
        "Web and mobile application development, cloud migration services, digital transformation consulting",
      hak1: "Intellectual property rights for developed solutions, 60% revenue share",
      hak2: "Market access rights, 40% revenue share, exclusive technology licensing",
      syaratlayanan:
        "Monthly progress reports, quarterly business reviews, annual audits",
      nominal: 250000,
      tenggatbayar: new Date("2024-02-15"),
      syaratbayar: "Net 30 days from invoice date, payment via bank transfer",
      bank: "Bank Mandiri",
      namapemilik: "Your Company Ltd",
      norek: "1234567890123",
      denda: "2% per month for late payments, maximum 24% per annum",
      tenggatklaim: new Date("2024-06-01"),
      makskompensasi: 50000,
      sengketa: "Jakarta Commercial Arbitration (BANI)",
      majeure:
        "Force majeure includes natural disasters, government actions, pandemic, war, and other unforeseeable circumstances",
    },

    // Partnership 2: PT Teknologi Maju
    {
      kontrakid: partnershipContracts[1].id,
      nomorkontrak: "PKS-2024-002",
      judul: "Digital Transformation Partnership Agreement",
      jenis: "Strategic Alliance",
      tanggalmulai: new Date("2024-02-01"),
      tanggalakhir: new Date("2026-01-31"),
      perusahaan1: "Your Company Ltd",
      direktur1: "Ahmad Rahman",
      alamat1: "Jl. Thamrin No. 789, Jakarta Pusat, DKI Jakarta",
      nomortel1: "+62-21-2345678",
      email1: "ahmad@yourcompany.com",
      npwp1: "12.345.678.9-012.345",
      nomorusaha1: "NIB-001234567890",
      perusahaan2: "PT Teknologi Maju",
      direktur2: "Siti Nurhaliza",
      alamat2: "Jl. Asia Afrika No. 321, Bandung, Jawa Barat",
      nomortel2: "+62-22-8765432",
      email2: "siti@teknologimaju.co.id",
      npwp2: "11.222.333.4-555.666",
      nomorusaha2: "NIB-111222333444",
      jenislayanan: "Enterprise Digital Transformation Services",
      wilayahoperasi: "Indonesia, Malaysia, Singapore",
      desklayanan:
        "ERP implementation, cloud infrastructure setup, AI/ML solutions, cybersecurity services",
      hak1: "Technology licensing rights, 55% profit sharing, exclusive partnership in Jakarta region",
      hak2: "Brand usage rights, 45% profit sharing, access to proprietary technologies",
      syaratlayanan:
        "Weekly status updates, monthly steering committee meetings, quarterly performance reviews",
      nominal: 5000, // 5 billion IDR
      tenggatbayar: new Date("2024-03-01"),
      syaratbayar:
        "Milestone-based payments, 50% upfront, 30% mid-project, 20% completion",
      bank: "Bank Central Asia (BCA)",
      namapemilik: "Your Company Ltd",
      norek: "9876543210987",
      denda:
        "1.5% per month for delayed milestones, professional mediation required after 60 days",
      tenggatklaim: new Date("2024-08-01"),
      makskompensasi: 100000, // 1 billion IDR
      sengketa: "Indonesian Mediation Center, escalation to BANI arbitration",
      majeure:
        "Extended force majeure clause including cyber attacks, regulatory changes, economic crisis",
    },

    // Partnership 3: Synergy Industries (Draft)
    {
      kontrakid: partnershipContracts[2].id,
      nomorkontrak: "PKS-2024-003",
      judul: "Strategic Alliance for Market Expansion",
      jenis: "Joint Venture",
      tanggalmulai: new Date("2024-04-01"),
      tanggalakhir: new Date("2025-08-15"),
      perusahaan1: "Your Company Ltd",
      direktur1: "Maria Gonzales",
      alamat1: "Jl. HR Rasuna Said No. 456, Jakarta Selatan, DKI Jakarta",
      nomortel1: "+62-21-3456789",
      email1: "maria@yourcompany.com",
      npwp1: "12.345.678.9-012.345",
      nomorusaha1: "NIB-001234567890",
      perusahaan2: "Synergy Industries",
      direktur2: "Robert Chen",
      alamat2: "Jl. Diponegoro No. 654, Surabaya, Jawa Timur",
      nomortel2: "+62-31-9876543",
      email2: "robert@synergyind.com",
      npwp2: "77.888.999.0-123.456",
      nomorusaha2: "NIB-777888999000",
      jenislayanan: "Manufacturing and Distribution Partnership",
      wilayahoperasi: "Indonesia, Vietnam, Thailand",
      desklayanan:
        "Product manufacturing, supply chain management, distribution network, quality control",
      hak1: "Manufacturing rights, 50% ownership in joint operations, brand co-usage",
      hak2: "Distribution rights, 50% ownership in joint operations, market development",
      syaratlayanan:
        "Bi-weekly production reports, monthly quality audits, quarterly board meetings",
      nominal: 750000, // 7.5 billion IDR
      tenggatbayar: new Date("2024-05-01"),
      syaratbayar:
        "Quarterly payments based on production volumes, LC payment terms",
      bank: "Bank Rakyat Indonesia (BRI)",
      namapemilik: "Your Company Ltd",
      norek: "5432109876543",
      denda:
        "3% per month for production delays, penalty clauses for quality issues",
      tenggatklaim: new Date("2024-10-01"),
      makskompensasi: 150000, // 1.5 billion IDR
      sengketa:
        "Surabaya Commercial Court, alternative dispute resolution preferred",
      majeure:
        "Manufacturing disruption clause, supply chain interruption, regulatory compliance issues",
    },
  ];

  // Create partnership details
  for (const partnership of partnershipDetails) {
    await prisma.partnership.create({
      data: partnership,
    });
  }

  console.log("✅ Partnership details created:", partnershipDetails.length);

  // Create detailed employment contracts for employment type contracts
  const employmentContracts = createdContracts.filter(
    (c) => c.type === "employment"
  );

// Update the employment details in the seed file
  const employmentDetails = [
    // Employment 1: Pak Budi
    {
      kontrakid: employmentContracts[0].id,
      nomorkontrak: "EMP-2024-001",
      judulkontrak: "Kontrak Kerja Karyawan Tetap - Senior Developer",
      jeniskontrak: "PKWTT",
      tanggalmulai: new Date("2024-01-15"),
      tanggalakhir: new Date("2025-03-01"),

      // Employee Information - using schema field names
      namalengkap: "Budi Santoso",
      tanggallahir: "1992-01-15",
      jeniskelamin: "L",
      alamatlengkap: "Jl. Kebon Jeruk No. 45, Jakarta Barat, DKI Jakarta 11530",
      nomortelepon: "+62-812-3456-7890",
      email: "budi.santoso@email.com",

      // Job Details - using schema field names
      posisijabatan: "Senior Software Developer",
      lokasikerja: "Kantor Pusat Jakarta dan Work From Home (Hybrid)",
      tanggalmulaikerja: new Date("2024-01-15"),
      haricuti: "12",
      deskripsipekerjaan: "Mengembangkan aplikasi web dan mobile, melakukan code review, mentoring junior developer, bertanggung jawab atas arsitektur sistem, dan berkolaborasi dengan tim product manager.",
      detailcuti: "12 hari cuti tahunan, cuti sakit sesuai surat dokter, cuti melahirkan 3 bulan",
      aturanlembur: "Maksimal 14 jam per bulan, kompensasi 1.5x gaji per jam di hari kerja, 2x gaji per jam di weekend",

      // Compensation - using schema field names
      gajipokok: 15000000,
      tunjangantetap: 3000000,
      tunjangantidaktetap: 2000000,
      jaminansosial: "BPJS Kesehatan, BPJS Ketenagakerjaan, Asuransi Jiwa",
      fasilitaslain: "Laptop kantor, akses gym, parkir gratis, annual health check-up",

      // Legal & Disciplinary - using schema field names
      hukumdanrahasia: "Perlindungan hukum sesuai UU Ketenagakerjaan No. 13 Tahun 2003. Wajib menjaga kerahasiaan data perusahaan dan klien, tidak boleh mengungkapkan informasi teknis",
      disiplin: "Hadir tepat waktu, berpakaian rapi, tidak menggunakan narkoba, tidak melakukan tindakan asusila",
      sanksi: "Teguran lisan, teguran tertulis, skorsing, pemotongan gaji, hingga pemutusan hubungan kerja",
      pemutusanhubungankerja: "Notice period 30 hari, pesangon sesuai UU, tidak boleh join kompetitor selama 6 bulan",
    },

    // Employment 2: John Smith
    {
      kontrakid: employmentContracts[1].id,
      nomorkontrak: "EMP-2024-002",
      judulkontrak: "Employment Contract - Senior Software Developer",
      jeniskontrak: "PKWT",
      tanggalmulai: new Date("2024-02-01"),
      tanggalakhir: new Date("2025-12-31"),

      // Employee Information - using schema field names
      namalengkap: "John Smith Anderson",
      tanggallahir: "1995-05-20",
      jeniskelamin: "L",
      alamatlengkap: "Jl. Kemang Raya No. 12A, Jakarta Selatan, DKI Jakarta 12560",
      nomortelepon: "+62-856-7890-1234",
      email: "john.anderson@email.com",

      // Job Details - using schema field names
      posisijabatan: "Senior Full-Stack Developer",
      lokasikerja: "Remote Work (WFH) dengan kunjungan kantor 2x per bulan",
      tanggalmulaikerja: new Date("2024-02-01"),
      haricuti: "15",
      deskripsipekerjaan: "Mengembangkan aplikasi full-stack menggunakan React dan Node.js, merancang database, mengimplementasikan API, melakukan testing, dan deployment aplikasi ke cloud platform.",
      detailcuti: "15 hari cuti tahunan, sick leave unlimited dengan surat dokter, personal emergency leave 3 hari",
      aturanlembur: "Tidak ada overtime, work-life balance prioritas utama",

      // Compensation - using schema field names
      gajipokok: 20000000,
      tunjangantetap: 2500000,
      tunjangantidaktetap: 5000000,
      jaminansosial: "BPJS Kesehatan Premium, BPJS Ketenagakerjaan, Asuransi Kesehatan Swasta",
      fasilitaslain: "MacBook Pro, monitor eksternal, ergonomic chair allowance, learning budget $1000/year",

      // Legal & Disciplinary - using schema field names
      hukumdanrahasia: "Full legal protection under Indonesian Labor Law and international best practices. Strict NDA for all client projects, proprietary technology, and business strategies",
      disiplin: "Professional conduct, meeting deadlines, active communication, continuous learning mindset",
      sanksi: "Performance improvement plan, formal warning, salary deduction, contract termination",
      pemutusanhubungankerja: "60 days notice period, prorated severance, 1-year non-compete clause, smooth knowledge transfer",
    },
  ];
  // Create employment details
  for (const employment of employmentDetails) {
    await prisma.employment.create({
      data: employment,
    });
  }

  console.log("✅ Employment details created:", employmentDetails.length);

  // Summary
  console.log("\n📊 Seeding Summary:");
  console.log(`👥 Users created: ${users.length}`);
  console.log(`📋 Contracts created: ${createdContracts.length}`);
  console.log(`🤝 Partnership details created: ${partnershipDetails.length}`);
  console.log(`👨‍💼 Employment details created: ${employmentDetails.length}`);
  console.log("\n📈 Contract breakdown:");
  console.log(
    `  - Partnership: ${
      createdContracts.filter((c) => c.type === "partnership").length
    }`
  );
  console.log(
    `  - Employment: ${
      createdContracts.filter((c) => c.type === "employment").length
    }`
  );
  console.log(
    `  - Services: ${
      createdContracts.filter((c) => c.type === "services").length
    }`
  );
  console.log(
    `  - Consulting: ${
      createdContracts.filter((c) => c.type === "consulting").length
    }`
  );
  console.log("\n🎯 Status breakdown:");
  console.log(
    `  - Active: ${createdContracts.filter((c) => c.status === "aktif").length}`
  );
  console.log(
    `  - Draft: ${createdContracts.filter((c) => c.status === "draft").length}`
  );
  console.log(
    `  - Terminated: ${
      createdContracts.filter((c) => c.status === "dihentikan").length
    }`
  );
  console.log(
    `  - Expired: ${
      createdContracts.filter((c) => c.status === "berakhir").length
    }`
  );

  console.log("\n✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
