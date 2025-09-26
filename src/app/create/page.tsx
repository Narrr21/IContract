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

export default function CreateContractPage() {
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null)
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanError, setScanError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ContractData | null>(null)
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
      const structuredData = parseAIResponseToContractData(aiExtractedData)
      setExtractedData(structuredData)
      
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

  // Enhanced parsing function that handles employment contract structure
  const parseAIResponseToContractData = (aiResponse: string): ContractData => {
    try {
      console.log('📊 Parsing AI response to contract data...');
      console.log('🔍 Contract type:', selectedContractType);
      
      // Initialize with contract-type-specific defaults
      const contractData: ContractData = {
        nomorKontrak: '',
        judul: '',
        jenis: selectedContractType?.toUpperCase() || 'PARTNERSHIP',
        tanggalMulai: undefined,
        durasi: '',
        pihak1: { // For employment: this is the company
          namaPerusahaan: '', namaDirektur: '', alamat: '', nomorTelp: '', email: '', npwp: '', nomorUsaha: ''
        },
        pihak2: { // For employment: this is the employee (using company fields for simplicity)
          namaPerusahaan: '', namaDirektur: '', alamat: '', nomorTelp: '', email: '', npwp: '', nomorUsaha: ''
        },
        jenisLayanan: '', deskripsiLayanan: '', wilayahOperasional: '', hakKewajibanPihak1: '', hakKewajibanPihak2: '', syaratLayanan: '',
        nominal: '', syaratPembayaran: '', caraPembayaran: { bank: '', nama: '', norek: '' }, jangkaWaktuPembayaran: '', dendaKeterlambatan: '',
        batasWaktuKlaim: '', maksimalKompensasi: '', penyelesaianSengketa: '', forceMajeure: ''
      };

      // Split response into sections for easier parsing
      const sections = aiResponse.split(/(?=##|#\s|\*\*)/);
      
      sections.forEach(section => {
        const lowerSection = section.toLowerCase();
        
        // Contract Number
        let contractMatch = section.match(/(?:contract number|contract id|nomor kontrak|no\.?\s*kontrak)[\s:]*([^\n\r]+)/i);
        if (contractMatch && !contractData.nomorKontrak) {
          contractData.nomorKontrak = contractMatch[1].trim().replace(/^[-:\s]+/, '');
        }

        // Contract Title/Job Position
        let titleMatch;
        if (selectedContractType === 'employment') {
          titleMatch = section.match(/(?:job title|position|jabatan|contract title|judul)[\s:]*([^\n\r]+)/i);
        } else {
          titleMatch = section.match(/(?:contract title|judul|title)[\s:]*([^\n\r]+)/i);
        }
        if (titleMatch && !contractData.judul) {
          contractData.judul = titleMatch[1].trim().replace(/^[-:\s]+/, '');
        }

        // Dates
        const dateMatch = section.match(/(?:start date|tanggal mulai|effective date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i);
        if (dateMatch && !contractData.tanggalMulai) {
          try {
            const dateStr = dateMatch[1];
            let date: Date;
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts[2].length === 4) {
                // DD/MM/YYYY or MM/DD/YYYY
                date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              } else {
                date = new Date(dateStr);
              }
            } else {
              date = new Date(dateStr);
            }
            if (!isNaN(date.getTime())) {
              contractData.tanggalMulai = date;
            }
          } catch (e) {
            console.warn('Failed to parse date:', dateMatch[1]);
          }
        }

        // Duration
        const durationMatch = section.match(/(?:duration|durasi|contract period)[\s:]*([^\n\r]{5,50})/i);
        if (durationMatch && !contractData.durasi) {
          contractData.durasi = durationMatch[1].trim().replace(/^[-:\s]+/, '');
        }

        if (selectedContractType === 'employment') {
          // EMPLOYMENT-SPECIFIC PARSING
          
          // Company Information
          const companyMatch = section.match(/(?:company name|perusahaan|employer)[\s:]*([^\n\r]+)/i);
          if (companyMatch && !contractData.pihak1.namaPerusahaan) {
            contractData.pihak1.namaPerusahaan = companyMatch[1].trim().replace(/^[-:\s]+/, '');
          }

          // Employee Name
          const employeeMatch = section.match(/(?:employee full name|employee name|nama lengkap|nama karyawan)[\s:]*([^\n\r]+)/i);
          if (employeeMatch && !contractData.pihak2.namaPerusahaan) {
            contractData.pihak2.namaPerusahaan = employeeMatch[1].trim().replace(/^[-:\s]+/, ''); // Using namaPerusahaan field for employee name
          }

          // Director/HR Manager
          const directorMatch = section.match(/(?:director|hr manager|pimpinan|direktur)[\s:]*([^\n\r]+)/i);
          if (directorMatch && !contractData.pihak1.namaDirektur) {
            contractData.pihak1.namaDirektur = directorMatch[1].trim().replace(/^[-:\s]+/, '');
          }

          // Job Description
          const jobDescMatch = section.match(/(?:job description|responsibilities|tanggung jawab|deskripsi pekerjaan)[\s:]*([^\n\r#]{20,500})/i);
          if (jobDescMatch && !contractData.deskripsiLayanan) {
            contractData.deskripsiLayanan = jobDescMatch[1].trim().replace(/^[-:\s]+/, '');
          }

          // Position/Job Title (for jenisLayanan field)
          const positionMatch = section.match(/(?:job title|position|jabatan)[\s:]*([^\n\r]+)/i);
          if (positionMatch && !contractData.jenisLayanan) {
            contractData.jenisLayanan = positionMatch[1].trim().replace(/^[-:\s]+/, '');
          }

          // Salary
          const salaryMatch = section.match(/(?:basic salary|gaji pokok|salary|gaji|monthly salary)[\s:]*(?:rp\.?\s*|idr\s*|rupiah\s*)?([\d.,]+)(?:\s*(?:juta|million|ribu|thousand|per month|\/bulan))?/i);
          if (salaryMatch && !contractData.nominal) {
            contractData.nominal = salaryMatch[0].trim();
          }

          // Work Location
          const workLocationMatch = section.match(/(?:work location|tempat kerja|office)[\s:]*([^\n\r]+)/i);
          if (workLocationMatch && !contractData.wilayahOperasional) {
            contractData.wilayahOperasional = workLocationMatch[1].trim().replace(/^[-:\s]+/, '');
          }

        } else {
          // PARTNERSHIP-SPECIFIC PARSING (original logic)
          
          const companyMatches = section.match(/(?:company|perusahaan|pt\.?\s*|cv\.?\s*)([^\n\r,;]+)/gi);
          if (companyMatches) {
            companyMatches.forEach((match, index) => {
              const cleanCompany = match.replace(/^(?:company|perusahaan|pt\.?\s*|cv\.?\s*)/i, '').trim();
              if (cleanCompany && cleanCompany.length > 2) {
                if (index === 0 && !contractData.pihak1.namaPerusahaan) {
                  contractData.pihak1.namaPerusahaan = cleanCompany;
                } else if (index === 1 && !contractData.pihak2.namaPerusahaan) {
                  contractData.pihak2.namaPerusahaan = cleanCompany;
                }
              }
            });
          }

          // Service description for partnerships
          if (lowerSection.includes('service') || lowerSection.includes('layanan') || lowerSection.includes('scope')) {
            const serviceMatch = section.match(/(?:service|layanan|scope)[\s:]*([^\n\r]{20,200})/i);
            if (serviceMatch && !contractData.deskripsiLayanan) {
              contractData.deskripsiLayanan = serviceMatch[1].trim();
            }
          }

          // Contract value for partnerships
          const moneyMatch = section.match(/(?:value|amount|nilai|rp\.?\s*|idr\s*|rupiah\s*)?([\d.,]+)(?:\s*(?:juta|million|miliar|billion))?/i);
          if (moneyMatch && !contractData.nominal) {
            contractData.nominal = moneyMatch[0].trim();
          }
        }

        // COMMON PARSING (both contract types)

        // Addresses
        const addressMatches = section.match(/(?:address|alamat)[\s:]*([^\n\r]{10,200})/gi);
        if (addressMatches) {
          addressMatches.forEach((match, index) => {
            const address = match.replace(/^(?:address|alamat)[\s:]*/i, '').trim();
            if (address && address.length > 5) {
              if (index === 0 && !contractData.pihak1.alamat) {
                contractData.pihak1.alamat = address;
              } else if (index === 1 && !contractData.pihak2.alamat) {
                contractData.pihak2.alamat = address;
              }
            }
          });
        }

        // Phone numbers
        const phoneMatches = section.match(/(?:phone|telephone|telp|hp)[\s:]*(?:\+62|62|0)[\d\-\s]{8,15}/gi);
        if (phoneMatches) {
          phoneMatches.forEach((match, index) => {
            const phone = match.replace(/^(?:phone|telephone|telp|hp)[\s:]*/i, '').trim();
            if (phone) {
              if (index === 0 && !contractData.pihak1.nomorTelp) {
                contractData.pihak1.nomorTelp = phone;
              } else if (index === 1 && !contractData.pihak2.nomorTelp) {
                contractData.pihak2.nomorTelp = phone;
              }
            }
          });
        }

        // Emails
        const emailMatches = section.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          emailMatches.forEach((email, index) => {
            if (index === 0 && !contractData.pihak1.email) {
              contractData.pihak1.email = email;
            } else if (index === 1 && !contractData.pihak2.email) {
              contractData.pihak2.email = email;
            }
          });
        }

        // NPWP
        const npwpMatch = section.match(/(?:npwp|tax id)[\s:]*([^\n\r]+)/i);
        if (npwpMatch) {
          const npwp = npwpMatch[1].trim().replace(/^[-:\s]+/, '');
          if (!contractData.pihak1.npwp) {
            contractData.pihak1.npwp = npwp;
          }
        }
      });

      // Set intelligent defaults based on contract type
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
      console.log('✅ Successfully parsed contract data from AI response');
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
      console.error('❌ Error parsing AI response:', error);
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
            }}
            className="mb-4"
          >
            ← Kembali ke Pengaturan Kontrak
          </Button>
        </div>
        <EmploymentPage 
          initialInputMethod={selectedInputMethod}
          initialFile={uploadedFile}
          initialExtractedData={extractedData} // Pass the AI-extracted data
        />
      </div>
    )
  }

  return null
}