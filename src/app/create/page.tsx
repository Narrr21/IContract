'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, Briefcase, Upload, CheckCircle } from 'lucide-react'
import DraftPage from '../draft/page'
import EmploymentPage from '../employment/page'

type ContractType = 'partnership' | 'employment'
type InputMethod = 'manual' | 'upload'

export default function CreateContractPage() {
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null)
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      // Extract text from PDF (simulate processing)
      // const extractedData = await extractPDFData(file)
      
      setScanProgress(100)
      setTimeout(() => {
        setIsScanning(false)
      }, 500)

    } catch (error) {
      console.error('Error processing PDF:', error)
      alert('Gagal memproses PDF. Silakan coba lagi.')
      setIsScanning(false)
      setScanProgress(0)
      setUploadedFile(null)
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
                      <li>• Auto-extract data</li>
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
                  <h3 className="font-semibold text-orange-900 mb-2">Upload Dokumen Kontrak</h3>
                  <p className="text-orange-800">
                    <strong>Tipe:</strong> {selectedContractType === 'partnership' ? 'Partnership Contract' : 'Employment Contract'}
                  </p>
                </div>

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
                    <p className="text-gray-700 mb-2 font-medium">Upload file PDF kontrak untuk analisis otomatis</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag & drop file PDF atau klik untuk browse
                      <br />
                      <span className="text-xs text-gray-500">Format: PDF • Ukuran maksimal: 10MB</span>
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
                            Dokumen berhasil diproses dan siap untuk diedit
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null)
                            setScanProgress(0)
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
            }}
            className="mb-4"
          >
            ← Kembali ke Pengaturan Kontrak
          </Button>
        </div>
        <DraftPage 
          initialInputMethod={selectedInputMethod} 
          initialFile={uploadedFile}
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
            }}
            className="mb-4"
          >
            ← Kembali ke Pengaturan Kontrak
          </Button>
        </div>
        <EmploymentPage 
          initialInputMethod={selectedInputMethod}
          initialFile={uploadedFile} 
        />
      </div>
    )
  }

  return null
}