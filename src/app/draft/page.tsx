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

interface ContractData {
  // Informasi Umum
  nomorKontrak: string
  judul: string
  jenis: string
  tanggalMulai: Date | undefined
  durasi: string
  
  // Pihak Pertama
  pihak1: {
    namaPerusahaan: string
    namaDirektur: string
    alamat: string
    nomorTelp: string
    email: string
    npwp: string
    nomorUsaha: string
  }
  
  // Pihak Kedua
  pihak2: {
    namaPerusahaan: string
    namaDirektur: string
    alamat: string
    nomorTelp: string
    email: string
    npwp: string
    nomorUsaha: string
  }
  
  // Ruang Lingkup
  jenisLayanan: string
  deskripsiLayanan: string
  wilayahOperasional: string
  hakKewajibanPihak1: string
  hakKewajibanPihak2: string
  syaratLayanan: string
  
  // Administrasi Keuangan
  nominal: string
  syaratPembayaran: string
  caraPembayaran: {
    bank: string
    nama: string
    norek: string
  }
  jangkaWaktuPembayaran: string
  dendaKeterlambatan: string
  
  // Klaim dan Sengketa
  batasWaktuKlaim: string
  maksimalKompensasi: string
  penyelesaianSengketa: string
  forceMajeure: string
}

export default function DraftPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload' | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [contractData, setContractData] = useState<ContractData>({
    nomorKontrak: '',
    judul: '',
    jenis: 'PARTNERSHIP',
    tanggalMulai: undefined,
    durasi: '',
    pihak1: {
      namaPerusahaan: '',
      namaDirektur: '',
      alamat: '',
      nomorTelp: '',
      email: '',
      npwp: '',
      nomorUsaha: ''
    },
    pihak2: {
      namaPerusahaan: '',
      namaDirektur: '',
      alamat: '',
      nomorTelp: '',
      email: '',
      npwp: '',
      nomorUsaha: ''
    },
    jenisLayanan: '',
    deskripsiLayanan: '',
    wilayahOperasional: '',
    hakKewajibanPihak1: '',
    hakKewajibanPihak2: '',
    syaratLayanan: '',
    nominal: '',
    syaratPembayaran: '',
    caraPembayaran: {
      bank: '',
      nama: '',
      norek: ''
    },
    jangkaWaktuPembayaran: '',
    dendaKeterlambatan: '',
    batasWaktuKlaim: '',
    maksimalKompensasi: '',
    penyelesaianSengketa: '',
    forceMajeure: ''
  })

  const steps = [
    'Pilih Metode Input',
    'Informasi Umum',
    'Identitas Para Pihak',
    'Ruang Lingkup',
    'Administrasi Keuangan',
    'Klaim & Sengketa'
  ]

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setContractData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof ContractData] as any),
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
    return inputMethod === 'upload' && uploadedFile !== null
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

  const extractPDFData = async (file: File): Promise<ContractData> => {
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
    
    // Convert the API response to ContractData format
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Draft Kontrak Partnership</h1>
        <p className="text-gray-600">Buat kontrak partnership dengan mudah dan lengkap</p>
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
            {currentStep === 0 && "Pilih cara mengisi kontrak"}
            {currentStep === 1 && "Masukkan informasi dasar kontrak"}
            {currentStep === 2 && "Data lengkap kedua belah pihak"}
            {currentStep === 3 && "Ruang lingkup dan ketentuan layanan"}
            {currentStep === 4 && "Detail keuangan dan pembayaran"}
            {currentStep === 5 && "Aturan klaim dan penyelesaian sengketa"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 0: Pilih Metode Input */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-4">Pilih Tipe Kontrak</h3>
                <Select value={contractData.jenis} onValueChange={(value) => handleInputChange('jenis', value)}>
                  <SelectTrigger className="w-full max-w-md mx-auto">
                    <SelectValue placeholder="Pilih tipe kontrak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                    <SelectItem value="EMPLOYMENT">Employment</SelectItem>
                  </SelectContent>
                </Select>
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
                    <p className="text-gray-600">Upload dokumen yang sudah ada untuk dianalisis</p>
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
                      <p className="text-gray-600 mb-2">Upload file PDF kontrak untuk analisis otomatis</p>
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
                        <p className="text-blue-700 mb-4">Menganalisis dan mengekstrak informasi kontrak...</p>
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
                                jenis: 'PARTNERSHIP',
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
                    placeholder="Masukkan nomor kontrak"
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
                      <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                      <SelectItem value="VENDOR">Vendor</SelectItem>
                      <SelectItem value="SERVICE">Service Agreement</SelectItem>
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
                  placeholder="Masukkan judul kontrak"
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
                    placeholder="Contoh: 12 bulan"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identitas Para Pihak */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {isFieldDisabled() && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 font-medium">
                      Data identitas para pihak telah diisi otomatis dari dokumen PDF
                    </p>
                  </div>
                </div>
              )}
              <Tabs defaultValue="pihak1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pihak1">Pihak Pertama</TabsTrigger>
                <TabsTrigger value="pihak2">Pihak Kedua</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pihak1" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="namaPerusahaan1">Nama Perusahaan</Label>
                    <Input 
                      id="namaPerusahaan1"
                      value={contractData.pihak1.namaPerusahaan}
                      onChange={(e) => handleInputChange('namaPerusahaan', e.target.value, 'pihak1')}
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="namaDirektur1">Nama Direktur</Label>
                    <Input 
                      id="namaDirektur1"
                      value={contractData.pihak1.namaDirektur}
                      onChange={(e) => handleInputChange('namaDirektur', e.target.value, 'pihak1')}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="alamat1">Alamat Perusahaan</Label>
                  <Textarea 
                    id="alamat1"
                    value={contractData.pihak1.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value, 'pihak1')}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nomorTelp1">Nomor Telepon</Label>
                    <Input 
                      id="nomorTelp1"
                      value={contractData.pihak1.nomorTelp}
                      onChange={(e) => handleInputChange('nomorTelp', e.target.value, 'pihak1')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email1">Email</Label>
                    <Input 
                      id="email1"
                      type="email"
                      value={contractData.pihak1.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'pihak1')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="npwp1">NPWP</Label>
                    <Input 
                      id="npwp1"
                      value={contractData.pihak1.npwp}
                      onChange={(e) => handleInputChange('npwp', e.target.value, 'pihak1')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nomorUsaha1">Nomor Usaha</Label>
                    <Input 
                      id="nomorUsaha1"
                      value={contractData.pihak1.nomorUsaha}
                      onChange={(e) => handleInputChange('nomorUsaha', e.target.value, 'pihak1')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pihak2" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="namaPerusahaan2">Nama Perusahaan</Label>
                    <Input 
                      id="namaPerusahaan2"
                      value={contractData.pihak2.namaPerusahaan}
                      onChange={(e) => handleInputChange('namaPerusahaan', e.target.value, 'pihak2')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="namaDirektur2">Nama Direktur</Label>
                    <Input 
                      id="namaDirektur2"
                      value={contractData.pihak2.namaDirektur}
                      onChange={(e) => handleInputChange('namaDirektur', e.target.value, 'pihak2')}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="alamat2">Alamat Perusahaan</Label>
                  <Textarea 
                    id="alamat2"
                    value={contractData.pihak2.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value, 'pihak2')}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nomorTelp2">Nomor Telepon</Label>
                    <Input 
                      id="nomorTelp2"
                      value={contractData.pihak2.nomorTelp}
                      onChange={(e) => handleInputChange('nomorTelp', e.target.value, 'pihak2')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input 
                      id="email2"
                      type="email"
                      value={contractData.pihak2.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'pihak2')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="npwp2">NPWP</Label>
                    <Input 
                      id="npwp2"
                      value={contractData.pihak2.npwp}
                      onChange={(e) => handleInputChange('npwp', e.target.value, 'pihak2')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nomorUsaha2">Nomor Usaha</Label>
                    <Input 
                      id="nomorUsaha2"
                      value={contractData.pihak2.nomorUsaha}
                      onChange={(e) => handleInputChange('nomorUsaha', e.target.value, 'pihak2')}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            </div>
          )}

          {/* Step 3: Ruang Lingkup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="jenisLayanan">Jenis Layanan</Label>
                  <Input 
                    id="jenisLayanan"
                    value={contractData.jenisLayanan}
                    onChange={(e) => handleInputChange('jenisLayanan', e.target.value)}
                    placeholder="Contoh: Jasa Konsultasi IT"
                  />
                </div>
                <div>
                  <Label htmlFor="wilayahOperasional">Wilayah Operasional</Label>
                  <Input 
                    id="wilayahOperasional"
                    value={contractData.wilayahOperasional}
                    onChange={(e) => handleInputChange('wilayahOperasional', e.target.value)}
                    placeholder="Contoh: Jakarta, Indonesia"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deskripsiLayanan">Deskripsi Layanan (Jenis Barang/Layanan)</Label>
                <Textarea 
                  id="deskripsiLayanan"
                  value={contractData.deskripsiLayanan}
                  onChange={(e) => handleInputChange('deskripsiLayanan', e.target.value)}
                  rows={4}
                  placeholder="Jelaskan secara detail layanan atau barang yang akan disediakan..."
                />
              </div>

              <div>
                <Label htmlFor="hakKewajibanPihak1">Hak dan Kewajiban Pihak Pertama</Label>
                <Textarea 
                  id="hakKewajibanPihak1"
                  value={contractData.hakKewajibanPihak1}
                  onChange={(e) => handleInputChange('hakKewajibanPihak1', e.target.value)}
                  rows={4}
                  placeholder="Sebutkan hak dan kewajiban pihak pertama..."
                />
              </div>

              <div>
                <Label htmlFor="hakKewajibanPihak2">Hak dan Kewajiban Pihak Kedua</Label>
                <Textarea 
                  id="hakKewajibanPihak2"
                  value={contractData.hakKewajibanPihak2}
                  onChange={(e) => handleInputChange('hakKewajibanPihak2', e.target.value)}
                  rows={4}
                  placeholder="Sebutkan hak dan kewajiban pihak kedua..."
                />
              </div>

              <div>
                <Label htmlFor="syaratLayanan">Syarat Layanan</Label>
                <Textarea 
                  id="syaratLayanan"
                  value={contractData.syaratLayanan}
                  onChange={(e) => handleInputChange('syaratLayanan', e.target.value)}
                  rows={3}
                  placeholder="Sebutkan syarat-syarat khusus layanan..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Administrasi Keuangan */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nominal">Nominal Kontrak</Label>
                  <Input 
                    id="nominal"
                    value={contractData.nominal}
                    onChange={(e) => handleInputChange('nominal', e.target.value)}
                    placeholder="Contoh: Rp 100.000.000"
                  />
                </div>
                <div>
                  <Label htmlFor="jangkaWaktuPembayaran">Jangka Waktu Pembayaran</Label>
                  <Input 
                    id="jangkaWaktuPembayaran"
                    value={contractData.jangkaWaktuPembayaran}
                    onChange={(e) => handleInputChange('jangkaWaktuPembayaran', e.target.value)}
                    placeholder="Contoh: 30 hari"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="syaratPembayaran">Syarat Pembayaran</Label>
                <Textarea 
                  id="syaratPembayaran"
                  value={contractData.syaratPembayaran}
                  onChange={(e) => handleInputChange('syaratPembayaran', e.target.value)}
                  rows={3}
                  placeholder="Jelaskan syarat pembayaran (pelunasan, invoice rilis kapan, pajak, dll)..."
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Cara Pembayaran</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bank">Bank</Label>
                    <Input 
                      id="bank"
                      value={contractData.caraPembayaran.bank}
                      onChange={(e) => handleInputChange('bank', e.target.value, 'caraPembayaran')}
                      placeholder="Contoh: BCA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="namaRekening">Nama Rekening</Label>
                    <Input 
                      id="namaRekening"
                      value={contractData.caraPembayaran.nama}
                      onChange={(e) => handleInputChange('nama', e.target.value, 'caraPembayaran')}
                      placeholder="Nama pemilik rekening"
                    />
                  </div>
                  <div>
                    <Label htmlFor="norek">Nomor Rekening</Label>
                    <Input 
                      id="norek"
                      value={contractData.caraPembayaran.norek}
                      onChange={(e) => handleInputChange('norek', e.target.value, 'caraPembayaran')}
                      placeholder="Nomor rekening"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="dendaKeterlambatan">Denda Keterlambatan</Label>
                <Textarea 
                  id="dendaKeterlambatan"
                  value={contractData.dendaKeterlambatan}
                  onChange={(e) => handleInputChange('dendaKeterlambatan', e.target.value)}
                  rows={3}
                  placeholder="Jelaskan aturan denda keterlambatan pembayaran..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Klaim dan Sengketa */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="batasWaktuKlaim">Batas Waktu Klaim</Label>
                  <Input 
                    id="batasWaktuKlaim"
                    value={contractData.batasWaktuKlaim}
                    onChange={(e) => handleInputChange('batasWaktuKlaim', e.target.value)}
                    placeholder="Contoh: 14 hari"
                  />
                </div>
                <div>
                  <Label htmlFor="maksimalKompensasi">Maksimal Kompensasi</Label>
                  <Input 
                    id="maksimalKompensasi"
                    value={contractData.maksimalKompensasi}
                    onChange={(e) => handleInputChange('maksimalKompensasi', e.target.value)}
                    placeholder="Contoh: 50% dari nilai kontrak"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="penyelesaianSengketa">Penyelesaian Sengketa</Label>
                <Textarea 
                  id="penyelesaianSengketa"
                  value={contractData.penyelesaianSengketa}
                  onChange={(e) => handleInputChange('penyelesaianSengketa', e.target.value)}
                  rows={4}
                  placeholder="Jelaskan mekanisme penyelesaian sengketa (mediasi, arbitrase, pengadilan, dll)..."
                />
              </div>

              <div>
                <Label htmlFor="forceMajeure">Force Majeure</Label>
                <Textarea 
                  id="forceMajeure"
                  value={contractData.forceMajeure}
                  onChange={(e) => handleInputChange('forceMajeure', e.target.value)}
                  rows={4}
                  placeholder="Jelaskan ketentuan force majeure (bencana alam, pandemi, perang, dll)..."
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
                <Button onClick={() => console.log('Generate Contract', contractData)}>
                  Generate Kontrak
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
