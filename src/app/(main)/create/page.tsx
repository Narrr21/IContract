'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, Briefcase, Upload, CheckCircle, AlertCircle, Bot } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DraftPage from '../draft/page'
import EmploymentPage from '../employment/page'

type ContractType = 'partnership' | 'employment'
type InputMethod = 'manual' | 'upload'

// Interface for extracted contract data
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
  durasi: string
  
  // Identitas Pegawai
  namaLengkap: string
  tempatLahir: string
  tanggalLahir: Date | undefined
  jenisKelamin: 'L' | 'P' | ''
  alamatLengkap: string
  nomorTelepon: string
  email: string
  pendidikanTerakhir: string
  nomorIdentitas: string
  jenisIdentitas: 'KTP' | 'Passport' | 'SIM' | ''
  
  // Identitas Perusahaan
  namaPerusahaan: string
  alamatPerusahaan: string
  nomorTeleponPerusahaan: string
  emailPerusahaan: string
  npwpPerusahaan: string
  namaPimpinan: string
  jabatanPimpinan: string
  
  // Detail Pekerjaan
  posisiJabatan: string
  departemen: string
  lokasiKerja: string
  tanggalMulaiKerja: Date | undefined
  jenisKontrak: 'PKWTT' | 'PKWT' | ''
  masaPercobaan: string
  deskripsiPekerjaan: string
  
  // Jam Kerja & Waktu
  hariKerja: string
  jamKerja: string
  jamIstirahat: string
  jamLembur: string
  
  // Kompensasi & Tunjangan
  gajiPokok: string
  tunjanganTetap: string
  tunjanganVariabel: string
  metodePembayaran: string
  jadwalPembayaran: string
  
  // Fasilitas & Benefit
  bpjs: string
  asuransiKesehatan: string
  cuti: string
  fasilitasLain: string
  
  // Hak & Kewajiban
  hakPegawai: string
  kewajibanPegawai: string
  hakPerusahaan: string
  kewajibanPerusahaan: string
  
  // Perlindungan Hukum
  kerahasiaan: string
  nonKompete: string
  aturanDisiplin: string
  keselamatanKerja: string
  perlindunganData: string
  sanksiPelanggaran: string
  prosedurPenyelesaianSengketa: string
  masaNotice: string
  pesangonPHK: string
}

export default function CreateContractPage() {
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null)
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanError, setScanError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ContractData | null>(null)
  const [extractedEmploymentData, setExtractedEmploymentData] = useState<EmploymentContractData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await processFile(file)
  }

  // NEW: AI-powered PDF processing function
  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan!')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 10MB.')
      return
    }

    setUploadedFile(file)
    setIsScanning(true)
    setScanProgress(0)
    setScanError(null)
    setExtractedData(null)

    try {
      console.log('🔍 Starting PDF processing with AI analysis...')
      
      // Stage 1: Extract text from PDF (0-30%)
      setScanProgress(10)
      const extractedText = await extractTextFromPDF(file)
      setScanProgress(30)
      
      if (!extractedText || extractedText.length < 100) {
        throw new Error('Insufficient text content found in PDF')
      }
      
      console.log(`📄 Extracted ${extractedText.length} characters from PDF`)
      
      // Stage 2: AI analysis and data extraction (30-80%)
      setScanProgress(50)
      const aiExtractedData = await analyzeWithAI(extractedText, selectedContractType || 'partnership')
      setScanProgress(80)
      
      console.log('🤖 AI analysis completed successfully')
      
      // Stage 3: Process and structure data (80-100%)
      setScanProgress(90)
      if (selectedContractType === 'employment') {
        const employmentData = parseAIResponseToEmploymentData(aiExtractedData)
        setExtractedEmploymentData(employmentData)
        setExtractedData(null) // Clear partnership data
      } else {
        const structuredData = parseAIResponseToContractData(aiExtractedData)
        setExtractedData(structuredData)
        setExtractedEmploymentData(null) // Clear employment data
      }
      
      setScanProgress(100)
      console.log('✅ PDF processing completed successfully')
      
      setTimeout(() => {
        setIsScanning(false)
      }, 500)

    } catch (error) {
      console.error('❌ Error processing PDF:', error)
      setScanError(error instanceof Error ? error.message : 'Gagal memproses PDF')
      setIsScanning(false)
      setScanProgress(0)
      setUploadedFile(null)
    }
  }

  // Extract raw text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('📤 Uploading file for text extraction...')
      
      // Step 1: Upload the file to your server
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload PDF: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()
      const uploadedFileName = uploadData.fileName

      console.log(`📄 File uploaded as: ${uploadedFileName}`)

      // Step 2: Extract text using the same API as review page
      const extractResponse = await fetch('/api/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: uploadedFileName })
      })

      if (!extractResponse.ok) {
        throw new Error(`Failed to extract text: ${extractResponse.status}`)
      }

      const extractData = await extractResponse.json()
      
      // Step 3: Convert coordinate data to plain text (same as review page)
      const extractedText = extractData.textData
        ?.map((item: any) => {
          if (typeof item === 'string') return item
          if (item.text) return item.text
          if (item.str) return item.str
          return ''
        })
        .filter((text: string) => text.trim())
        .join(' ') || ''

      if (extractedText.length > 0) {
        console.log(`✅ Extracted ${extractedText.length} characters from PDF`)
        return extractedText
      } else {
        throw new Error('No text content found in PDF')
      }

    } catch (error) {
      console.error('❌ Failed to extract text from PDF:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to extract text from PDF')
    }
  }

  // Analyze extracted text with AI
  const analyzeWithAI = async (text: string, contractType: string): Promise<string> => {
    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractType,
          requirements: text,
          assistanceType: 'extract',
          additionalData: {
            extractionType: 'form_data',
            targetFields: [
              'nomorKontrak', 'judul', 'jenis', 'tanggalMulai', 'durasi',
              'pihak1', 'pihak2', 'jenisLayanan', 'deskripsiLayanan',
              'wilayahOperasional', 'nominal', 'syaratPembayaran'
            ]
          }
        })
      })

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`)
      }

      const aiData = await response.json()
      
      if (!aiData.success) {
        throw new Error(aiData.error || 'AI analysis failed')
      }

      return aiData.assistance
    } catch (error) {
      console.error('Error in AI analysis:', error)
      throw new Error('AI analysis failed')
    }
  }

  // Enhanced parsing function that handles semicolon-separated AI response
  const parseAIResponseToContractData = (aiResponse: string): ContractData => {
    try {
      console.log('📊 Parsing semicolon-separated AI response...');
      console.log('🔍 Contract type:', selectedContractType);
      
      // Initialize with contract-type-specific defaults
      const contractData: ContractData = {
        nomorKontrak: '',
        judul: '',
        jenis: selectedContractType?.toUpperCase() || 'PARTNERSHIP',
        tanggalMulai: undefined,
        durasi: '',
        pihak1: {
          namaPerusahaan: '', namaDirektur: '', alamat: '', nomorTelp: '', email: '', npwp: '', nomorUsaha: ''
        },
        pihak2: {
          namaPerusahaan: '', namaDirektur: '', alamat: '', nomorTelp: '', email: '', npwp: '', nomorUsaha: ''
        },
        jenisLayanan: '', deskripsiLayanan: '', wilayahOperasional: '', hakKewajibanPihak1: '', hakKewajibanPihak2: '', syaratLayanan: '',
        nominal: '', syaratPembayaran: '', caraPembayaran: { bank: '', nama: '', norek: '' }, jangkaWaktuPembayaran: '', dendaKeterlambatan: '',
        batasWaktuKlaim: '', maksimalKompensasi: '', penyelesaianSengketa: '', forceMajeure: ''
      };

      // Helper function to extract value after colon and before semicolon
      const extractValue = (text: string, key: string): string => {
        const regex = new RegExp(`${key}\\s*:\\s*([^;]+);?`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          const value = match[1].trim();
          return value === 'Not specified in document' ? '' : value;
        }
        return '';
      };

      // Helper function to parse date
      const parseDate = (dateStr: string): Date | undefined => {
        if (!dateStr || dateStr === 'Not specified in document') return undefined;
        try {
          // Handle DD/MM/YYYY format
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
          }
          return new Date(dateStr);
        } catch {
          return undefined;
        }
      };

      if (selectedContractType === 'employment') {
        // EMPLOYMENT CONTRACT PARSING
        
        // Basic Information
        contractData.nomorKontrak = extractValue(aiResponse, 'CONTRACT_NUMBER');
        contractData.judul = extractValue(aiResponse, 'CONTRACT_TITLE');
        contractData.jenis = extractValue(aiResponse, 'EMPLOYMENT_TYPE') || 'EMPLOYMENT';
        contractData.tanggalMulai = parseDate(extractValue(aiResponse, 'START_DATE'));
        contractData.durasi = extractValue(aiResponse, 'DURATION');
        
        // Company Information (Pihak 1)
        contractData.pihak1.namaPerusahaan = extractValue(aiResponse, 'COMPANY_NAME');
        contractData.pihak1.namaDirektur = extractValue(aiResponse, 'COMPANY_DIRECTOR');
        contractData.pihak1.alamat = extractValue(aiResponse, 'COMPANY_ADDRESS');
        contractData.pihak1.nomorTelp = extractValue(aiResponse, 'COMPANY_PHONE');
        contractData.pihak1.email = extractValue(aiResponse, 'COMPANY_EMAIL');
        contractData.pihak1.npwp = extractValue(aiResponse, 'COMPANY_NPWP');
        
        // Employee Information (Pihak 2 - using company fields creatively)
        contractData.pihak2.namaPerusahaan = extractValue(aiResponse, 'EMPLOYEE_NAME'); // Employee name
        contractData.pihak2.namaDirektur = extractValue(aiResponse, 'EMPLOYEE_POSITION'); // Position
        contractData.pihak2.alamat = extractValue(aiResponse, 'EMPLOYEE_ADDRESS');
        contractData.pihak2.nomorTelp = extractValue(aiResponse, 'EMPLOYEE_PHONE');
        contractData.pihak2.email = extractValue(aiResponse, 'EMPLOYEE_EMAIL');
        contractData.pihak2.npwp = extractValue(aiResponse, 'EMPLOYEE_ID'); // ID Number
        contractData.pihak2.nomorUsaha = extractValue(aiResponse, 'CONTRACT_TYPE'); // PKWT/PKWTT
        
        // Job Details
        contractData.jenisLayanan = extractValue(aiResponse, 'EMPLOYEE_POSITION');
        contractData.deskripsiLayanan = extractValue(aiResponse, 'JOB_DESCRIPTION');
        contractData.wilayahOperasional = extractValue(aiResponse, 'WORK_LOCATION');
        contractData.hakKewajibanPihak1 = extractValue(aiResponse, 'WORK_SCHEDULE') + ' | ' + extractValue(aiResponse, 'BREAK_TIME');
        contractData.hakKewajibanPihak2 = extractValue(aiResponse, 'LEAVE_POLICY') + ' | ' + extractValue(aiResponse, 'OVERTIME_POLICY');
        
        // Compensation
        contractData.nominal = extractValue(aiResponse, 'BASIC_SALARY');
        contractData.syaratPembayaran = extractValue(aiResponse, 'PAYMENT_SCHEDULE');
        
        // Legal Terms
        contractData.penyelesaianSengketa = extractValue(aiResponse, 'DISPUTE_RESOLUTION');
        contractData.batasWaktuKlaim = extractValue(aiResponse, 'NOTICE_PERIOD');
        contractData.maksimalKompensasi = extractValue(aiResponse, 'SEVERANCE_PAY');

      } else {
        // PARTNERSHIP CONTRACT PARSING
        
        // Basic Information
        contractData.nomorKontrak = extractValue(aiResponse, 'CONTRACT_NUMBER');
        contractData.judul = extractValue(aiResponse, 'CONTRACT_TITLE');
        contractData.jenis = extractValue(aiResponse, 'CONTRACT_TYPE') || 'PARTNERSHIP';
        contractData.tanggalMulai = parseDate(extractValue(aiResponse, 'START_DATE'));
        contractData.durasi = extractValue(aiResponse, 'DURATION');
        contractData.nominal = extractValue(aiResponse, 'CONTRACT_VALUE');
        
        // Party 1 Information
        contractData.pihak1.namaPerusahaan = extractValue(aiResponse, 'PARTY1_COMPANY');
        contractData.pihak1.namaDirektur = extractValue(aiResponse, 'PARTY1_DIRECTOR');
        contractData.pihak1.alamat = extractValue(aiResponse, 'PARTY1_ADDRESS');
        contractData.pihak1.nomorTelp = extractValue(aiResponse, 'PARTY1_PHONE');
        contractData.pihak1.email = extractValue(aiResponse, 'PARTY1_EMAIL');
        contractData.pihak1.npwp = extractValue(aiResponse, 'PARTY1_NPWP');
        contractData.pihak1.nomorUsaha = extractValue(aiResponse, 'PARTY1_LICENSE');
        
        // Party 2 Information
        contractData.pihak2.namaPerusahaan = extractValue(aiResponse, 'PARTY2_COMPANY');
        contractData.pihak2.namaDirektur = extractValue(aiResponse, 'PARTY2_DIRECTOR');
        contractData.pihak2.alamat = extractValue(aiResponse, 'PARTY2_ADDRESS');
        contractData.pihak2.nomorTelp = extractValue(aiResponse, 'PARTY2_PHONE');
        contractData.pihak2.email = extractValue(aiResponse, 'PARTY2_EMAIL');
        contractData.pihak2.npwp = extractValue(aiResponse, 'PARTY2_NPWP');
        contractData.pihak2.nomorUsaha = extractValue(aiResponse, 'PARTY2_LICENSE');
        
        // Service Information
        contractData.jenisLayanan = extractValue(aiResponse, 'SERVICE_TYPE');
        contractData.deskripsiLayanan = extractValue(aiResponse, 'SERVICE_DESCRIPTION');
        contractData.wilayahOperasional = extractValue(aiResponse, 'OPERATING_TERRITORY');
        contractData.hakKewajibanPihak1 = extractValue(aiResponse, 'PARTY1_OBLIGATIONS');
        contractData.hakKewajibanPihak2 = extractValue(aiResponse, 'PARTY2_OBLIGATIONS');
        contractData.syaratLayanan = extractValue(aiResponse, 'SERVICE_TERMS');
        
        // Financial Terms
        contractData.syaratPembayaran = extractValue(aiResponse, 'PAYMENT_TERMS');
        contractData.jangkaWaktuPembayaran = extractValue(aiResponse, 'PAYMENT_SCHEDULE');
        contractData.dendaKeterlambatan = extractValue(aiResponse, 'LATE_PENALTIES');
        
        // Legal Terms
        contractData.batasWaktuKlaim = extractValue(aiResponse, 'CLAIM_DEADLINE');
        contractData.maksimalKompensasi = extractValue(aiResponse, 'MAX_COMPENSATION');
        contractData.penyelesaianSengketa = extractValue(aiResponse, 'DISPUTE_RESOLUTION');
        contractData.forceMajeure = extractValue(aiResponse, 'FORCE_MAJEURE');
      }

      // Set intelligent defaults if values are empty
      if (!contractData.durasi) {
        contractData.durasi = selectedContractType === 'employment' ? '2 tahun' : '12 bulan';
      }

      if (!contractData.nomorKontrak) {
        const prefix = selectedContractType === 'employment' ? 'PKK' : 'PKS';
        const timestamp = new Date().getFullYear();
        contractData.nomorKontrak = `${prefix}-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      }

      if (!contractData.judul) {
        contractData.judul = selectedContractType === 'employment' ? 'Kontrak Kerja' : 'Kontrak Kerjasama';
      }

      // Enhanced logging
      console.log('✅ Successfully parsed semicolon-separated contract data');
      console.log('📋 Extracted data summary:', {
        contractType: selectedContractType,
        nomorKontrak: contractData.nomorKontrak || 'MISSING',
        judul: contractData.judul || 'MISSING',
        company: contractData.pihak1.namaPerusahaan || 'MISSING',
        employee: selectedContractType === 'employment' ? (contractData.pihak2.namaPerusahaan || 'MISSING') : 'N/A',
        partner: selectedContractType === 'partnership' ? (contractData.pihak2.namaPerusahaan || 'MISSING') : 'N/A',
        hasDate: !!contractData.tanggalMulai,
        hasNominal: !!contractData.nominal,
        hasDescription: !!contractData.deskripsiLayanan,
        hasService: !!contractData.jenisLayanan
      });

      return contractData;

    } catch (error) {
      console.error('❌ Error parsing semicolon-separated AI response:', error);
      console.error('📄 Raw AI response:', aiResponse);
      
      // Return intelligent fallback based on contract type
      const prefix = selectedContractType === 'employment' ? 'PKK' : 'PKS';
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      return {
        nomorKontrak: `${prefix}-${year}-${randomNum}`,
        judul: selectedContractType === 'employment' ? 'Kontrak Kerja' : 'Kontrak Kerjasama',
        jenis: selectedContractType?.toUpperCase() || 'PARTNERSHIP',
        tanggalMulai: new Date(),
        durasi: selectedContractType === 'employment' ? '2 tahun' : '12 bulan',
        pihak1: { namaPerusahaan: '', namaDirektur: '', alamat: '', nomorTelp: '', email: '', npwp: '', nomorUsaha: '' },
        pihak2: { namaPerusahaan: '', namaDirektur: '', alamat: '', nomorTelp: '', email: '', npwp: '', nomorUsaha: '' },
        jenisLayanan: '', deskripsiLayanan: '', wilayahOperasional: '', hakKewajibanPihak1: '', hakKewajibanPihak2: '', syaratLayanan: '',
        nominal: '', syaratPembayaran: '', caraPembayaran: { bank: '', nama: '', norek: '' }, jangkaWaktuPembayaran: '', dendaKeterlambatan: '',
        batasWaktuKlaim: '', maksimalKompensasi: '', penyelesaianSengketa: '', forceMajeure: ''
      };
    }
  }
  const convertContractDataToEmployment = (contractData: ContractData): EmploymentContractData => {
    return {
      // Informasi Umum Perjanjian
      nomorKontrak: contractData.nomorKontrak || '',
      judul: contractData.judul || '',
      jenis: contractData.jenis || 'EMPLOYMENT',
      tanggalMulai: contractData.tanggalMulai,
      durasi: contractData.durasi || '',
      
      // Identitas Pegawai (from pihak2)
      namaLengkap: contractData.pihak2.namaPerusahaan || '', // Employee name stored here
      tempatLahir: '',
      tanggalLahir: undefined,
      jenisKelamin: '',
      alamatLengkap: contractData.pihak2.alamat || '',
      nomorTelepon: contractData.pihak2.nomorTelp || '',
      email: contractData.pihak2.email || '',
      pendidikanTerakhir: '',
      nomorIdentitas: contractData.pihak2.npwp || '', // ID stored in npwp field
      jenisIdentitas: '',
      
      // Identitas Perusahaan (from pihak1)
      namaPerusahaan: contractData.pihak1.namaPerusahaan || '',
      alamatPerusahaan: contractData.pihak1.alamat || '',
      nomorTeleponPerusahaan: contractData.pihak1.nomorTelp || '',
      emailPerusahaan: contractData.pihak1.email || '',
      npwpPerusahaan: contractData.pihak1.npwp || '',
      namaPimpinan: contractData.pihak1.namaDirektur || '',
      jabatanPimpinan: 'Direktur',
      
      // Detail Pekerjaan
      posisiJabatan: contractData.jenisLayanan || contractData.pihak2.namaDirektur || '', // Position stored here
      departemen: '',
      lokasiKerja: contractData.wilayahOperasional || '',
      tanggalMulaiKerja: contractData.tanggalMulai,
      jenisKontrak: contractData.pihak2.nomorUsaha as 'PKWTT' | 'PKWT' | '' || '', // Contract type stored here
      masaPercobaan: '',
      deskripsiPekerjaan: contractData.deskripsiLayanan || '',
      
      // Jam Kerja & Waktu (from hakKewajiban fields)
      hariKerja: '',
      jamKerja: contractData.hakKewajibanPihak1 || '',
      jamIstirahat: '',
      jamLembur: contractData.hakKewajibanPihak2 || '',
      
      // Kompensasi & Tunjangan
      gajiPokok: contractData.nominal || '',
      tunjanganTetap: '',
      tunjanganVariabel: '',
      metodePembayaran: contractData.caraPembayaran.bank || '',
      jadwalPembayaran: contractData.syaratPembayaran || '',
      
      // Fasilitas & Benefit
      bpjs: '',
      asuransiKesehatan: '',
      cuti: '',
      fasilitasLain: '',
      
      // Hak & Kewajiban
      hakPegawai: contractData.hakKewajibanPihak2 || '',
      kewajibanPegawai: contractData.syaratLayanan || '',
      hakPerusahaan: contractData.hakKewajibanPihak1 || '',
      kewajibanPerusahaan: '',
      
      // Perlindungan Hukum
      kerahasiaan: '',
      nonKompete: '',
      aturanDisiplin: '',
      keselamatanKerja: '',
      perlindunganData: '',
      sanksiPelanggaran: contractData.dendaKeterlambatan || '',
      prosedurPenyelesaianSengketa: contractData.penyelesaianSengketa || '',
      masaNotice: contractData.batasWaktuKlaim || '',
      pesangonPHK: contractData.maksimalKompensasi || ''
    }
  }
  const parseAIResponseToEmploymentData = (aiResponse: string): EmploymentContractData => {
  try {
    console.log('📊 Parsing AI response for employment contract...');
    
    const extractValue = (text: string, key: string): string => {
      const regex = new RegExp(`${key}\\s*:\\s*([^;]+);?`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        const value = match[1].trim();
        return value === 'Not specified in document' ? '' : value;
      }
      return '';
    };

    const parseDate = (dateStr: string): Date | undefined => {
      if (!dateStr || dateStr === 'Not specified in document') return undefined;
      try {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          return new Date(year, month, day);
        }
        return new Date(dateStr);
      } catch {
        return undefined;
      }
    };

    return {
      // Informasi Umum Perjanjian
      nomorKontrak: extractValue(aiResponse, 'CONTRACT_NUMBER') || `PKK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      judul: extractValue(aiResponse, 'CONTRACT_TITLE') || 'Kontrak Kerja',
      jenis: extractValue(aiResponse, 'EMPLOYMENT_TYPE') || 'EMPLOYMENT',
      tanggalMulai: parseDate(extractValue(aiResponse, 'START_DATE')),
      durasi: extractValue(aiResponse, 'DURATION') || '2 tahun',
      
      // Identitas Pegawai
      namaLengkap: extractValue(aiResponse, 'EMPLOYEE_NAME'),
      tempatLahir: '',
      tanggalLahir: undefined,
      jenisKelamin: extractValue(aiResponse, 'EMPLOYEE_GENDER') as 'L' | 'P' | '' || '',
      alamatLengkap: extractValue(aiResponse, 'EMPLOYEE_ADDRESS'),
      nomorTelepon: extractValue(aiResponse, 'EMPLOYEE_PHONE'),
      email: extractValue(aiResponse, 'EMPLOYEE_EMAIL'),
      pendidikanTerakhir: '',
      nomorIdentitas: extractValue(aiResponse, 'EMPLOYEE_ID'),
      jenisIdentitas: 'KTP',
      
      // Identitas Perusahaan
      namaPerusahaan: extractValue(aiResponse, 'COMPANY_NAME'),
      alamatPerusahaan: extractValue(aiResponse, 'COMPANY_ADDRESS'),
      nomorTeleponPerusahaan: extractValue(aiResponse, 'COMPANY_PHONE'),
      emailPerusahaan: extractValue(aiResponse, 'COMPANY_EMAIL'),
      npwpPerusahaan: extractValue(aiResponse, 'COMPANY_NPWP'),
      namaPimpinan: extractValue(aiResponse, 'COMPANY_DIRECTOR'),
      jabatanPimpinan: 'Direktur',
      
      // Detail Pekerjaan
      posisiJabatan: extractValue(aiResponse, 'EMPLOYEE_POSITION'),
      departemen: '',
      lokasiKerja: extractValue(aiResponse, 'WORK_LOCATION'),
      tanggalMulaiKerja: parseDate(extractValue(aiResponse, 'START_DATE')),
      jenisKontrak: extractValue(aiResponse, 'CONTRACT_TYPE') as 'PKWTT' | 'PKWT' | '' || '',
      masaPercobaan: extractValue(aiResponse, 'PROBATION_PERIOD'),
      deskripsiPekerjaan: extractValue(aiResponse, 'JOB_DESCRIPTION'),
      
      // Jam Kerja & Waktu
      hariKerja: '',
      jamKerja: extractValue(aiResponse, 'WORK_SCHEDULE'),
      jamIstirahat: extractValue(aiResponse, 'BREAK_TIME'),
      jamLembur: extractValue(aiResponse, 'OVERTIME_POLICY'),
      
      // Kompensasi & Tunjangan
      gajiPokok: extractValue(aiResponse, 'BASIC_SALARY'),
      tunjanganTetap: extractValue(aiResponse, 'FIXED_ALLOWANCES'),
      tunjanganVariabel: extractValue(aiResponse, 'VARIABLE_ALLOWANCES'),
      metodePembayaran: '',
      jadwalPembayaran: extractValue(aiResponse, 'PAYMENT_SCHEDULE'),
      
      // Fasilitas & Benefit
      bpjs: extractValue(aiResponse, 'SOCIAL_SECURITY'),
      asuransiKesehatan: extractValue(aiResponse, 'HEALTH_INSURANCE'),
      cuti: extractValue(aiResponse, 'LEAVE_POLICY'),
      fasilitasLain: extractValue(aiResponse, 'OTHER_BENEFITS'),
      
      // Hak & Kewajiban
      hakPegawai: '',
      kewajibanPegawai: '',
      hakPerusahaan: '',
      kewajibanPerusahaan: '',
      
      // Perlindungan Hukum
      kerahasiaan: extractValue(aiResponse, 'CONFIDENTIALITY'),
      nonKompete: extractValue(aiResponse, 'NON_COMPETE'),
      aturanDisiplin: extractValue(aiResponse, 'DISCIPLINARY_RULES'),
      keselamatanKerja: '',
      perlindunganData: '',
      sanksiPelanggaran: '',
      prosedurPenyelesaianSengketa: extractValue(aiResponse, 'DISPUTE_RESOLUTION'),
      masaNotice: extractValue(aiResponse, 'NOTICE_PERIOD'),
      pesangonPHK: extractValue(aiResponse, 'SEVERANCE_PAY')
    };

  } catch (error) {
    console.error('❌ Error parsing employment contract data:', error);
    
    // Return default employment contract structure
    return {
      nomorKontrak: `PKK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      judul: 'Kontrak Kerja',
      jenis: 'EMPLOYMENT',
      tanggalMulai: new Date(),
      durasi: '2 tahun',
      namaLengkap: '', tempatLahir: '', tanggalLahir: undefined, jenisKelamin: '', alamatLengkap: '',
      nomorTelepon: '', email: '', pendidikanTerakhir: '', nomorIdentitas: '', jenisIdentitas: '',
      namaPerusahaan: '', alamatPerusahaan: '', nomorTeleponPerusahaan: '', emailPerusahaan: '',
      npwpPerusahaan: '', namaPimpinan: '', jabatanPimpinan: '', posisiJabatan: '', departemen: '',
      lokasiKerja: '', tanggalMulaiKerja: undefined, jenisKontrak: '', masaPercobaan: '',
      deskripsiPekerjaan: '', hariKerja: '', jamKerja: '', jamIstirahat: '', jamLembur: '',
      gajiPokok: '', tunjanganTetap: '', tunjanganVariabel: '', metodePembayaran: '',
      jadwalPembayaran: '', bpjs: '', asuransiKesehatan: '', cuti: '', fasilitasLain: '',
      hakPegawai: '', kewajibanPegawai: '', hakPerusahaan: '', kewajibanPerusahaan: '',
      kerahasiaan: '', nonKompete: '', aturanDisiplin: '', keselamatanKerja: '',
      perlindunganData: '', sanksiPelanggaran: '', prosedurPenyelesaianSengketa: '',
      masaNotice: '', pesangonPHK: ''
    };
  }
}
  // Jika belum memilih tipe kontrak atau metode input, atau sedang upload, tampilkan pilihan
  if (!selectedContractType || !selectedInputMethod || (selectedInputMethod === 'upload' && !uploadedFile)) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Kontrak Baru</h1>
          <p className="text-gray-600">Pilih jenis kontrak dan metode input</p>
        </div>

        {/* Step 1: Pilih Tipe Kontrak */}
        {!selectedContractType && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Pilih Jenis Kontrak</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Partnership Contract */}
              <Card 
                className="cursor-pointer border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                onClick={() => setSelectedContractType('partnership')}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <Users className="w-16 h-16 mx-auto text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Partnership Contract</h3>
                  <p className="text-gray-600 mb-4">
                    Kontrak kerjasama antara dua perusahaan atau lebih untuk menjalin hubungan bisnis
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2"><strong>Mencakup:</strong></p>
                    <ul className="text-left space-y-1">
                      <li>• Identitas para pihak</li>
                      <li>• Ruang lingkup kerjasama</li>
                      <li>• Administrasi keuangan</li>
                      <li>• Klaim dan sengketa</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Contract */}
              <Card 
                className="cursor-pointer border-2 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                onClick={() => setSelectedContractType('employment')}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <Briefcase className="w-16 h-16 mx-auto text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Employment Contract</h3>
                  <p className="text-gray-600 mb-4">
                    Kontrak kerja antara perusahaan dengan karyawan untuk hubungan kerja
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2"><strong>Mencakup:</strong></p>
                    <ul className="text-left space-y-1">
                      <li>• Identitas pegawai</li>
                      <li>• Tanggung jawab & jobdesk</li>
                      <li>• Hak dan fasilitas</li>
                      <li>• Perlindungan hukum</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Step 2: Pilih Metode Input */}
        {selectedContractType && !selectedInputMethod && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedContractType(null)}
                >
                  ← Ubah Tipe Kontrak
                </Button>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">2. Pilih Metode Input</h2>
                  <p className="text-sm text-gray-600">
                    Tipe kontrak: <span className="font-medium">
                      {selectedContractType === 'partnership' ? 'Partnership Contract' : 'Employment Contract'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Manual Input */}
              <Card 
                className="cursor-pointer border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                onClick={() => setSelectedInputMethod('manual')}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <FileText className="w-16 h-16 mx-auto text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Isi Manual</h3>
                  <p className="text-gray-600 mb-4">
                    Isi form secara manual langkah demi langkah dengan panduan yang disediakan
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2"><strong>Keunggulan:</strong></p>
                    <ul className="text-left space-y-1">
                      <li>• Kontrol penuh atas data</li>
                      <li>• Panduan step-by-step</li>
                      <li>• Validasi real-time</li>
                      <li>• Customisasi mudah</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Document */}
              <Card 
                className="cursor-pointer border-2 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                onClick={() => setSelectedInputMethod('upload')}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <Upload className="w-16 h-16 mx-auto text-orange-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Upload Dokumen</h3>
                  <p className="text-gray-600 mb-4">
                    Upload dokumen kontrak yang sudah ada untuk dianalisis dan dikonversi
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2"><strong>Keunggulan:</strong></p>
                    <ul className="text-left space-y-1">
                      <li>• Proses lebih cepat</li>
                      <li>• Auto-extract data dengan AI</li>
                      <li>• Support file PDF</li>
                      <li>• Dapat diedit setelahnya</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Upload Section untuk metode upload */}
        {selectedContractType && selectedInputMethod === 'upload' && (
          <div className="mb-6">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Upload Dokumen Kontrak (AI-Powered)
                  </h3>
                  <p className="text-orange-800">
                    <strong>Tipe:</strong> {selectedContractType === 'partnership' ? 'Partnership Contract' : 'Employment Contract'}
                  </p>
                </div>

                {/* Error Display */}
                {scanError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{scanError}</AlertDescription>
                  </Alert>
                )}

                {!uploadedFile && !isScanning && (
                  <div 
                    className="p-6 border-2 border-dashed border-orange-300 rounded-lg text-center hover:border-orange-400 transition-colors cursor-pointer bg-white"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('border-orange-400', 'bg-orange-50')
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50')
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50')
                      const files = Array.from(e.dataTransfer.files)
                      if (files.length > 0) {
                        await processFile(files[0])
                      }
                    }}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <p className="text-gray-700 mb-2 font-medium">Upload file PDF kontrak untuk analisis otomatis dengan AI</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag & drop file PDF atau klik untuk browse
                      <br />
                      <span className="text-xs text-gray-500">Format: PDF • Ukuran maksimal: 10MB • AI akan mengekstrak data secara otomatis</span>
                    </p>
                    
                    <Button variant="outline" type="button" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <Upload className="w-4 h-4 mr-2" />
                      Pilih File PDF
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isScanning && (
                  <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="text-center mb-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <h3 className="font-semibold text-lg text-blue-900 flex items-center justify-center gap-2">
                        <Bot className="w-5 h-5" />
                        AI sedang memproses dokumen PDF
                      </h3>
                      <p className="text-blue-700 mb-4">
                        {scanProgress < 30 ? 'Mengekstrak teks dari PDF...' :
                         scanProgress < 80 ? 'AI menganalisis dan mengekstrak data kontrak...' :
                         'Memproses dan menyusun data...'}
                      </p>
                    </div>
                    
                    <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-blue-600">{scanProgress}% selesai</p>
                  </div>
                )}

                {uploadedFile && !isScanning && (
                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="font-semibold text-green-900">{uploadedFile.name}</p>
                          <p className="text-sm text-green-700">
                            {extractedData ? 
                              `Dokumen berhasil diproses dengan AI dan siap untuk diedit` :
                              'Dokumen berhasil diproses dan siap untuk diedit'
                            }
                          </p>
                          {extractedData && (
                            <div className="text-xs text-green-600 mt-1">
                              Data yang diekstrak: {extractedData.nomorKontrak ? '✓ Nomor' : '✗ Nomor'} {extractedData.judul ? '✓ Judul' : '✗ Judul'} {extractedData.pihak1.namaPerusahaan ? '✓ Perusahaan' : '✗ Perusahaan'} {extractedData.nominal ? '✓ Nilai' : '✗ Nilai'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null)
                            setScanProgress(0)
                            setScanError(null)
                            setExtractedData(null)
                          }}
                        >
                          Upload Ulang
                        </Button>
                        <div className="text-green-600">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedContractType(null)
                      setSelectedInputMethod(null)
                      setUploadedFile(null)
                      setScanProgress(0)
                      setScanError(null)
                      setExtractedData(null)
                    }}
                  >
                    ← Kembali
                  </Button>
                  
                  {uploadedFile && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        // File sudah ter-upload, form akan render otomatis
                        // karena kondisi (selectedInputMethod === 'manual' || uploadedFile) sudah terpenuhi
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Lanjut ke Form →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary untuk metode manual */}
        {selectedContractType && selectedInputMethod === 'manual' && (
          <div className="mb-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Siap Membuat Kontrak</h3>
                    <p className="text-blue-800">
                      <strong>Tipe:</strong> {selectedContractType === 'partnership' ? 'Partnership Contract' : 'Employment Contract'}
                      <br />
                      <strong>Metode:</strong> Input Manual
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedContractType(null)
                        setSelectedInputMethod(null)
                      }}
                    >
                      Mulai Ulang
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Mulai Mengisi Form →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Jika sudah memilih tipe kontrak dan metode input, tampilkan form yang sesuai
  if (selectedContractType === 'partnership' && selectedInputMethod && (selectedInputMethod === 'manual' || uploadedFile)) {
    return (
      <div>
        {/* Back button */}
        <div className="container mx-auto px-6 pt-6 max-w-4xl">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedContractType(null)
              setSelectedInputMethod(null)
              setUploadedFile(null)
              setScanProgress(0)
              setScanError(null)
              setExtractedData(null)
            }}
            className="mb-4"
          >
            ← Kembali ke Pengaturan Kontrak
          </Button>
        </div>
        <DraftPage 
          initialInputMethod={selectedInputMethod} 
          initialFile={uploadedFile}
          initialExtractedData={extractedData} // Pass the AI-extracted data
        />
      </div>
    )
  }

  if (selectedContractType === 'employment' && selectedInputMethod && (selectedInputMethod === 'manual' || uploadedFile)) {
    return (
      <div>
        {/* Back button */}
        <div className="container mx-auto px-6 pt-6 max-w-4xl">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedContractType(null)
              setSelectedInputMethod(null)
              setUploadedFile(null)
              setScanProgress(0)
              setScanError(null)
              setExtractedData(null)
              setExtractedEmploymentData(null)
            }}
            className="mb-4"
          >
            ← Kembali ke Pengaturan Kontrak
          </Button>
        </div>
        <EmploymentPage 
          initialInputMethod={selectedInputMethod}
          initialFile={uploadedFile}
          initialExtractedData={extractedEmploymentData} // Pass the AI-extracted data
        />
      </div>
    )
  }
  return null
}