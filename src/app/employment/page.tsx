'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Upload, FileText, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface EmploymentContractData {
  // Informasi Umum Perjanjian
  nomorKontrak: string
  judul: string
  jenis: string
  tanggalMulai: Date | undefined
  durasi: string
  
  // Identitas Pegawai
  pegawai: {
    nama: string
    alamat: string
    jabatan: string
    jenisKelamin: string
    usia: string
    jenisKontrak: string // PKWT/PKWTT
    nomorKTP: string
    nomorTelp: string
    email: string
  }
  
  // Identitas Perusahaan
  perusahaan: {
    namaPerusahaan: string
    alamat: string
    namaDirektur: string
    nomorTelp: string
    email: string
    npwp: string
  }
  
  // Tanggung Jawab
  tanggungJawab: {
    jobdesk: string
    tempatKerja: string
    waktuKerja: string
    istirahat: string
    cuti: string
    lembur: string
  }
  
  // Hak dan Fasilitas
  hakFasilitas: {
    gajiPokok: string
    tunjanganTetap: string
    tunjanganTidakTetap: string
    jaminanSosial: string
    fasilitasLain: string
  }
  
  // Perlindungan Hukum dan Kerahasiaan
  perlindunganHukum: {
    kerahasiaan: string
    disiplin: string
    sanksi: string
    pemutusanHubunganKerja: string
  }
}

interface EmploymentPageProps {
  initialInputMethod?: 'manual' | 'upload'
  initialFile?: File | null
}

export default function EmploymentPage({ initialInputMethod, initialFile }: EmploymentPageProps) {
  const [currentStep, setCurrentStep] = useState(initialInputMethod ? 1 : 0)
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload' | null>(initialInputMethod || null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile || null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [contractData, setContractData] = useState<EmploymentContractData>({
    nomorKontrak: '',
    judul: '',
    jenis: 'EMPLOYMENT',
    tanggalMulai: undefined,
    durasi: '',
    pegawai: {
      nama: '',
      alamat: '',
      jabatan: '',
      jenisKelamin: '',
      usia: '',
      jenisKontrak: '',
      nomorKTP: '',
      nomorTelp: '',
      email: ''
    },
    perusahaan: {
      namaPerusahaan: '',
      alamat: '',
      namaDirektur: '',
      nomorTelp: '',
      email: '',
      npwp: ''
    },
    tanggungJawab: {
      jobdesk: '',
      tempatKerja: '',
      waktuKerja: '',
      istirahat: '',
      cuti: '',
      lembur: ''
    },
    hakFasilitas: {
      gajiPokok: '',
      tunjanganTetap: '',
      tunjanganTidakTetap: '',
      jaminanSosial: '',
      fasilitasLain: ''
    },
    perlindunganHukum: {
      kerahasiaan: '',
      disiplin: '',
      sanksi: '',
      pemutusanHubunganKerja: ''
    }
  })

  const steps = [
    'Pilih Metode Input',
    'Informasi Umum',
    'Identitas Pegawai',
    'Tanggung Jawab',
    'Hak & Fasilitas',
    'Perlindungan Hukum'
  ]

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setContractData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof EmploymentContractData] as any),
          [field]: value
        }
      }))
    } else {
      setContractData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const isFieldDisabled = () => {
    // return inputMethod === 'upload' && uploadedFile !== null
    return false // Always allow
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await processFile(file)
  }

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan!')
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 10MB.')
      return
    }

    setUploadedFile(file)
    setIsScanning(true)
    setScanProgress(0)

    try {
      // Simulate PDF scanning progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Extract text from PDF
      const extractedData = await extractPDFData(file)
      
      // Map extracted data to form fields
      if (extractedData) {
        setContractData(extractedData)
      }

      setScanProgress(100)
      setTimeout(() => {
        setIsScanning(false)
        // Auto advance to next step after successful scan
        setCurrentStep(1)
      }, 500)

    } catch (error) {
      console.error('Error processing PDF:', error)
      alert('Gagal memproses PDF. Silakan coba lagi.')
      setIsScanning(false)
      setScanProgress(0)
      setUploadedFile(null)
    }
  }

  const extractPDFData = async (file: File): Promise<EmploymentContractData> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to process PDF')
    }

    const result = await response.json()
    
    // Convert the API response to EmploymentContractData format
    const data = result.data
    return {
      ...data,
      tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : undefined
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Draft Kontrak Employment</h1>
        <p className="text-gray-600">Buat kontrak kerja dengan mudah dan lengkap</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Pilih cara mengisi kontrak kerja"}
            {currentStep === 1 && "Informasi umum perjanjian kerja"}
            {currentStep === 2 && "Data lengkap identitas pegawai"}
            {currentStep === 3 && "Tanggung jawab dan ketentuan kerja"}
            {currentStep === 4 && "Hak, gaji, dan fasilitas"}
            {currentStep === 5 && "Perlindungan hukum dan kerahasiaan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 0: Pilih Metode Input */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Kontrak Kerja / Employment Contract</p>
                  <p className="text-green-600 text-sm mt-1">
                    Kontrak antara perusahaan dengan karyawan untuk hubungan kerja
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className={`cursor-pointer border-2 ${inputMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setInputMethod('manual')}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">Isi Manual</h3>
                    <p className="text-gray-600">Isi form secara manual langkah demi langkah</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer border-2 ${inputMethod === 'upload' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setInputMethod('upload')}
                >
                  <CardContent className="p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">Upload Dokumen</h3>
                    <p className="text-gray-600">Upload kontrak kerja yang sudah ada untuk dianalisis</p>
                  </CardContent>
                </Card>
              </div>

              {inputMethod === 'upload' && (
                <div className="mt-6">
                  {!uploadedFile && !isScanning && (
                    <div 
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                      }}
                      onDrop={async (e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                        const files = Array.from(e.dataTransfer.files)
                        if (files.length > 0) {
                          await processFile(files[0])
                        }
                      }}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Upload file PDF kontrak kerja untuk analisis otomatis</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag & drop file PDF atau klik untuk browse
                        <br />
                        <span className="text-xs text-gray-400">Format: PDF • Ukuran maksimal: 10MB</span>
                      </p>
                      
                      <Button variant="outline" type="button">
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
                        <h3 className="font-semibold text-lg text-blue-900">Memproses Dokumen PDF</h3>
                        <p className="text-blue-700 mb-4">Menganalisis dan mengekstrak informasi kontrak kerja...</p>
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
                              Dokumen berhasil diproses dan data telah dipetakan ke form
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setUploadedFile(null)
                              setInputMethod(null)
                              // Reset contract data to empty state
                              setContractData({
                                nomorKontrak: '',
                                judul: '',
                                jenis: 'EMPLOYMENT',
                                tanggalMulai: undefined,
                                durasi: '',
                                pegawai: {
                                  nama: '',
                                  alamat: '',
                                  jabatan: '',
                                  jenisKelamin: '',
                                  usia: '',
                                  jenisKontrak: '',
                                  nomorKTP: '',
                                  nomorTelp: '',
                                  email: ''
                                },
                                perusahaan: {
                                  namaPerusahaan: '',
                                  alamat: '',
                                  namaDirektur: '',
                                  nomorTelp: '',
                                  email: '',
                                  npwp: ''
                                },
                                tanggungJawab: {
                                  jobdesk: '',
                                  tempatKerja: '',
                                  waktuKerja: '',
                                  istirahat: '',
                                  cuti: '',
                                  lembur: ''
                                },
                                hakFasilitas: {
                                  gajiPokok: '',
                                  tunjanganTetap: '',
                                  tunjanganTidakTetap: '',
                                  jaminanSosial: '',
                                  fasilitasLain: ''
                                },
                                perlindunganHukum: {
                                  kerahasiaan: '',
                                  disiplin: '',
                                  sanksi: '',
                                  pemutusanHubunganKerja: ''
                                }
                              })
                            }}
                          >
                            Hapus & Mulai Ulang
                          </Button>
                          <div className="text-green-600">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Informasi Umum */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {isFieldDisabled() && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 font-medium">
                      Data telah diisi otomatis dari dokumen PDF yang di-upload
                    </p>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    Anda dapat meninjau data di bawah ini. Field tidak dapat diedit karena data berasal dari scan dokumen.
                  </p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nomorKontrak">Nomor Kontrak</Label>
                  <Input 
                    id="nomorKontrak"
                    value={contractData.nomorKontrak}
                    onChange={(e) => handleInputChange('nomorKontrak', e.target.value)}
                    placeholder="Masukkan nomor kontrak kerja"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jenis">Jenis Kontrak</Label>
                  <Select value={contractData.jenis} onValueChange={(value) => handleInputChange('jenis', value)} disabled={isFieldDisabled()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYMENT">Employment</SelectItem>
                      <SelectItem value="FREELANCE">Freelance</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="judul">Judul Kontrak</Label>
                <Input 
                  id="judul"
                  value={contractData.judul}
                  onChange={(e) => handleInputChange('judul', e.target.value)}
                  placeholder="Masukkan judul kontrak kerja"
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isFieldDisabled()}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractData.tanggalMulai ? format(contractData.tanggalMulai, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractData.tanggalMulai}
                        onSelect={(date) => handleInputChange('tanggalMulai', date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="durasi">Durasi Perjanjian</Label>
                  <Input 
                    id="durasi"
                    value={contractData.durasi}
                    onChange={(e) => handleInputChange('durasi', e.target.value)}
                    placeholder="Contoh: 24 bulan / Tidak terbatas"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              {/* Informasi Perusahaan */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Informasi Perusahaan</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="namaPerusahaan">Nama Perusahaan</Label>
                    <Input 
                      id="namaPerusahaan"
                      value={contractData.perusahaan.namaPerusahaan}
                      onChange={(e) => handleInputChange('namaPerusahaan', e.target.value, 'perusahaan')}
                      placeholder="Nama perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="namaDirektur">Nama Direktur/Pimpinan</Label>
                    <Input 
                      id="namaDirektur"
                      value={contractData.perusahaan.namaDirektur}
                      onChange={(e) => handleInputChange('namaDirektur', e.target.value, 'perusahaan')}
                      placeholder="Nama direktur/pimpinan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="alamatPerusahaan">Alamat Perusahaan</Label>
                  <Textarea 
                    id="alamatPerusahaan"
                    value={contractData.perusahaan.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value, 'perusahaan')}
                    rows={3}
                    placeholder="Alamat lengkap perusahaan"
                    disabled={isFieldDisabled()}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="nomorTelpPerusahaan">Nomor Telepon</Label>
                    <Input 
                      id="nomorTelpPerusahaan"
                      value={contractData.perusahaan.nomorTelp}
                      onChange={(e) => handleInputChange('nomorTelp', e.target.value, 'perusahaan')}
                      placeholder="Nomor telepon perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPerusahaan">Email</Label>
                    <Input 
                      id="emailPerusahaan"
                      type="email"
                      value={contractData.perusahaan.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'perusahaan')}
                      placeholder="Email perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="npwpPerusahaan">NPWP</Label>
                    <Input 
                      id="npwpPerusahaan"
                      value={contractData.perusahaan.npwp}
                      onChange={(e) => handleInputChange('npwp', e.target.value, 'perusahaan')}
                      placeholder="NPWP perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identitas Pegawai */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {isFieldDisabled() && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 font-medium">
                      Data identitas pegawai telah diisi otomatis dari dokumen PDF
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="namaPegawai">Nama Lengkap</Label>
                  <Input 
                    id="namaPegawai"
                    value={contractData.pegawai.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value, 'pegawai')}
                    placeholder="Nama lengkap pegawai"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jabatan">Jabatan</Label>
                  <Input 
                    id="jabatan"
                    value={contractData.pegawai.jabatan}
                    onChange={(e) => handleInputChange('jabatan', e.target.value, 'pegawai')}
                    placeholder="Jabatan/posisi"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="alamatPegawai">Alamat</Label>
                <Textarea 
                  id="alamatPegawai"
                  value={contractData.pegawai.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value, 'pegawai')}
                  rows={3}
                  placeholder="Alamat lengkap pegawai"
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                  <Select value={contractData.pegawai.jenisKelamin} onValueChange={(value) => handleInputChange('jenisKelamin', value, 'pegawai')} disabled={isFieldDisabled()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="usia">Usia</Label>
                  <Input 
                    id="usia"
                    value={contractData.pegawai.usia}
                    onChange={(e) => handleInputChange('usia', e.target.value, 'pegawai')}
                    placeholder="Contoh: 25 tahun"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jenisKontrak">Jenis Kontrak</Label>
                  <Select value={contractData.pegawai.jenisKontrak} onValueChange={(value) => handleInputChange('jenisKontrak', value, 'pegawai')} disabled={isFieldDisabled()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kontrak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKWTT">PKWTT (Kontrak Tidak Terbatas)</SelectItem>
                      <SelectItem value="PKWT">PKWT (Kontrak Waktu Tertentu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="nomorKTP">Nomor KTP</Label>
                  <Input 
                    id="nomorKTP"
                    value={contractData.pegawai.nomorKTP}
                    onChange={(e) => handleInputChange('nomorKTP', e.target.value, 'pegawai')}
                    placeholder="Nomor KTP"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="nomorTelpPegawai">Nomor Telepon</Label>
                  <Input 
                    id="nomorTelpPegawai"
                    value={contractData.pegawai.nomorTelp}
                    onChange={(e) => handleInputChange('nomorTelp', e.target.value, 'pegawai')}
                    placeholder="Nomor telepon pegawai"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="emailPegawai">Email</Label>
                  <Input 
                    id="emailPegawai"
                    type="email"
                    value={contractData.pegawai.email}
                    onChange={(e) => handleInputChange('email', e.target.value, 'pegawai')}
                    placeholder="Email pegawai"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tanggung Jawab */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="jobdesk">Job Description & Tanggung Jawab</Label>
                <Textarea 
                  id="jobdesk"
                  value={contractData.tanggungJawab.jobdesk}
                  onChange={(e) => handleInputChange('jobdesk', e.target.value, 'tanggungJawab')}
                  rows={5}
                  placeholder="Jelaskan secara detail job description dan tanggung jawab pegawai..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tempatKerja">Tempat Kerja</Label>
                  <Input 
                    id="tempatKerja"
                    value={contractData.tanggungJawab.tempatKerja}
                    onChange={(e) => handleInputChange('tempatKerja', e.target.value, 'tanggungJawab')}
                    placeholder="Contoh: Kantor Pusat Jakarta"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="waktuKerja">Waktu Kerja</Label>
                  <Input 
                    id="waktuKerja"
                    value={contractData.tanggungJawab.waktuKerja}
                    onChange={(e) => handleInputChange('waktuKerja', e.target.value, 'tanggungJawab')}
                    placeholder="Contoh: Senin-Jumat, 08:00-17:00"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="istirahat">Waktu Istirahat</Label>
                  <Input 
                    id="istirahat"
                    value={contractData.tanggungJawab.istirahat}
                    onChange={(e) => handleInputChange('istirahat', e.target.value, 'tanggungJawab')}
                    placeholder="Contoh: 12:00-13:00"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="cuti">Ketentuan Cuti</Label>
                  <Input 
                    id="cuti"
                    value={contractData.tanggungJawab.cuti}
                    onChange={(e) => handleInputChange('cuti', e.target.value, 'tanggungJawab')}
                    placeholder="Contoh: 12 hari per tahun"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lembur">Ketentuan Lembur</Label>
                <Textarea 
                  id="lembur"
                  value={contractData.tanggungJawab.lembur}
                  onChange={(e) => handleInputChange('lembur', e.target.value, 'tanggungJawab')}
                  rows={3}
                  placeholder="Jelaskan ketentuan lembur, kompensasi, dan batas maksimal lembur..."
                  disabled={isFieldDisabled()}
                />
              </div>
            </div>
          )}

          {/* Step 4: Hak dan Fasilitas */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gajiPokok">Gaji Pokok</Label>
                  <Input 
                    id="gajiPokok"
                    value={contractData.hakFasilitas.gajiPokok}
                    onChange={(e) => handleInputChange('gajiPokok', e.target.value, 'hakFasilitas')}
                    placeholder="Contoh: Rp 8.000.000"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="tunjanganTetap">Tunjangan Tetap</Label>
                  <Input 
                    id="tunjanganTetap"
                    value={contractData.hakFasilitas.tunjanganTetap}
                    onChange={(e) => handleInputChange('tunjanganTetap', e.target.value, 'hakFasilitas')}
                    placeholder="Contoh: Tunjangan transportasi, makan"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tunjanganTidakTetap">Tunjangan Tidak Tetap</Label>
                <Textarea 
                  id="tunjanganTidakTetap"
                  value={contractData.hakFasilitas.tunjanganTidakTetap}
                  onChange={(e) => handleInputChange('tunjanganTidakTetap', e.target.value, 'hakFasilitas')}
                  rows={3}
                  placeholder="Jelaskan tunjangan tidak tetap seperti bonus, insentif, THR, dll..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div>
                <Label htmlFor="jaminanSosial">Jaminan Sosial</Label>
                <Textarea 
                  id="jaminanSosial"
                  value={contractData.hakFasilitas.jaminanSosial}
                  onChange={(e) => handleInputChange('jaminanSosial', e.target.value, 'hakFasilitas')}
                  rows={3}
                  placeholder="Jelaskan jaminan sosial yang diberikan (BPJS Kesehatan, BPJS Ketenagakerjaan, dll)..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div>
                <Label htmlFor="fasilitasLain">Fasilitas Lain</Label>
                <Textarea 
                  id="fasilitasLain"
                  value={contractData.hakFasilitas.fasilitasLain}
                  onChange={(e) => handleInputChange('fasilitasLain', e.target.value, 'hakFasilitas')}
                  rows={4}
                  placeholder="Jelaskan fasilitas lain seperti laptop, kendaraan dinas, training, asuransi kesehatan tambahan, dll..."
                  disabled={isFieldDisabled()}
                />
              </div>
            </div>
          )}

          {/* Step 5: Perlindungan Hukum dan Kerahasiaan */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="kerahasiaan">Perlindungan Hukum dan Kerahasiaan</Label>
                <Textarea 
                  id="kerahasiaan"
                  value={contractData.perlindunganHukum.kerahasiaan}
                  onChange={(e) => handleInputChange('kerahasiaan', e.target.value, 'perlindunganHukum')}
                  rows={4}
                  placeholder="Jelaskan ketentuan kerahasiaan data perusahaan, klien, dan informasi penting lainnya..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div>
                <Label htmlFor="disiplin">Ketentuan Disiplin</Label>
                <Textarea 
                  id="disiplin"
                  value={contractData.perlindunganHukum.disiplin}
                  onChange={(e) => handleInputChange('disiplin', e.target.value, 'perlindunganHukum')}
                  rows={4}
                  placeholder="Jelaskan aturan kedisiplinan, tata tertib, dan kode etik yang harus dipatuhi..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div>
                <Label htmlFor="sanksi">Sanksi dan Pelanggaran</Label>
                <Textarea 
                  id="sanksi"
                  value={contractData.perlindunganHukum.sanksi}
                  onChange={(e) => handleInputChange('sanksi', e.target.value, 'perlindunganHukum')}
                  rows={4}
                  placeholder="Jelaskan jenis sanksi untuk berbagai pelanggaran (teguran, skorsing, dll)..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div>
                <Label htmlFor="pemutusanHubunganKerja">Pemutusan Hubungan Kerja</Label>
                <Textarea 
                  id="pemutusanHubunganKerja"
                  value={contractData.perlindunganHukum.pemutusanHubunganKerja}
                  onChange={(e) => handleInputChange('pemutusanHubunganKerja', e.target.value, 'perlindunganHukum')}
                  rows={5}
                  placeholder="Jelaskan ketentuan PHK, masa pemberitahuan, pesangon, dan prosedur pengunduran diri..."
                  disabled={isFieldDisabled()}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Sebelumnya
            </Button>
            
            <div className="flex gap-2">
              {currentStep === steps.length - 1 ? (
                <Button onClick={() => console.log('Generate Employment Contract', contractData)}>
                  Generate Kontrak Kerja
                </Button>
              ) : (
                <Button 
                  onClick={nextStep}
                  disabled={currentStep === 0 && (!inputMethod || (inputMethod === 'upload' && !uploadedFile))}
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}