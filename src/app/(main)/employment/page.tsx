"use client";

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { calculateEndDate } from '@/lib/helper'
import { createContractWithDetails } from '@/lib/contractHelpers';

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
  disiplin: string
  sanksi: string
  pemutusanHubunganKerja: string
}

interface EmploymentPageProps {
  initialInputMethod?: "manual" | "upload";
  initialFile?: File | null;
  initialExtractedData?: EmploymentContractData | null;
}

export default function EmploymentPage({ initialInputMethod, initialFile, initialExtractedData }: EmploymentPageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(initialInputMethod ? 1 : 0)
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload' | null>(initialInputMethod || null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile || null)
  const [isScanning, setIsScanning] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [contractData, setContractData] = useState<EmploymentContractData>({
    // Informasi Umum Perjanjian
    nomorKontrak: "",
    judul: "",
    jenis: "EMPLOYMENT",
    tanggalMulai: undefined,
    tanggalSelesai: undefined,
    
    // Identitas Pegawai
    namaLengkap: '',
    tanggalLahir: undefined,
    jenisKelamin: '',
    alamatLengkap: '',
    nomorTelepon: '',
    email: '',
    
    // Detail Pekerjaan
    posisiJabatan: '',
    lokasiKerja: '',
    tanggalMulaiKerja: undefined,
    jenisKontrak: '',
    hariCuti: '',
    deskripsiPekerjaan: '',
    detailCuti: '',
    aturanLembur: '',
    
    // Kompensasi & Tunjangan
    gajiPokok: '',
    tunjanganTetap: '',
    tunjanganTidakTetap: '',
    jaminanSosial: '',
    fasilitasLain: '',
    
    // Aturan kerja
    hukumDanRahasia: '',
    disiplin: '',
    sanksi: '',
    pemutusanHubunganKerja: ''
  })

  // Load initial extracted data if provided
  useEffect(() => {
    if (initialExtractedData) {
      console.log("📥 Loading initial extracted data:", initialExtractedData);
      setContractData(initialExtractedData);
      // If we have uploaded data, skip to step 1
      if (initialInputMethod === "upload" && initialFile) {
        setCurrentStep(1);
      }
    }
  }, [initialExtractedData, initialInputMethod, initialFile]);

  const steps = [
    'Pilih Metode Input',
    'Informasi Umum',
    'Identitas Pegawai',
    'Detail Pekerjaan',
    'Hak & Fasilitas',
    'Aturan Kerja'
  ]

  const handleInputChange = (field: string, value: any) => {
    setContractData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFieldDisabled = () => {
    return false; // Always allow editing
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 10MB.");
      return;
    }

    setUploadedFile(file);
    setIsScanning(true);
    setScanProgress(0);

    try {
      // Simulate PDF scanning progress
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Extract text from PDF
      const extractedData = await extractPDFData(file);

      // Map extracted data to form fields
      if (extractedData) {
        setContractData(extractedData);
      }

      setScanProgress(100);
      setTimeout(() => {
        setIsScanning(false);
        setCurrentStep(1);
      }, 500);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Gagal memproses PDF. Silakan coba lagi.");
      setIsScanning(false);
      setScanProgress(0);
      setUploadedFile(null);
    }
  };

  const extractPDFData = async (
    file: File
  ): Promise<EmploymentContractData> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/process-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to process PDF");
    }

    const result = await response.json();
    const data = result.data;
    return {
      ...data,
      tanggalMulai: data.tanggalMulai ? new Date(data.tanggalMulai) : undefined,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
      tanggalMulaiKerja: data.tanggalMulaiKerja
        ? new Date(data.tanggalMulaiKerja)
        : undefined,
    };
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setContractData({
      // Informasi Umum Perjanjian
      nomorKontrak: '',
      judul: '',
      jenis: 'EMPLOYMENT',
      tanggalMulai: undefined,
      tanggalSelesai: undefined,
      
      // Identitas Pegawai
      namaLengkap: '',
      tanggalLahir: undefined,
      jenisKelamin: '',
      alamatLengkap: '',
      nomorTelepon: '',
      email: '',
      
      // Detail Pekerjaan
      posisiJabatan: '',
      lokasiKerja: '',
      tanggalMulaiKerja: undefined,
      jenisKontrak: '',
      hariCuti: '',
      deskripsiPekerjaan: '',
      detailCuti: '',
      aturanLembur: '',
      
      // Kompensasi & Tunjangan
      gajiPokok: '',
      tunjanganTetap: '',
      tunjanganTidakTetap: '',
      jaminanSosial: '',
      fasilitasLain: '',
      
      // Aturan kerja
      hukumDanRahasia: '',
      disiplin: '',
      sanksi: '',
      pemutusanHubunganKerja: ''
    })
  }

  const handleGenerateContract = async () => {
    setIsGenerating(true)
    
    try {
      // Validate required fields first
      const requiredFields = [
        { field: contractData.nomorKontrak, name: 'Nomor Kontrak' },
        { field: contractData.judul, name: 'Judul Kontrak' },
        { field: contractData.namaLengkap, name: 'Nama Lengkap Pegawai' },
      ];

      const missingFields = requiredFields.filter(({ field }) => !field).map(({ name }) => name);
      
      if (missingFields.length > 0) {
        alert(`Harap isi field yang wajib: ${missingFields.join(', ')}`);
        setIsGenerating(false);
        return;
      }

      // Calculate end date if not provided
      let endDate = contractData.tanggalSelesai
      if (!endDate && contractData.tanggalMulai && contractData.jenisKontrak) {
        endDate = calculateEndDate(contractData.tanggalMulai, contractData.jenisKontrak)
      }

      // Prepare the data for API call - using ONLY the fields that exist in the Employment schema
      const apiData = {
        type: 'employment',
          // Main contract fields
          namakontrak: contractData.judul,
          counterparty: contractData.namaLengkap,
          judul: contractData.judul,
          
          // Employment specific fields - matching EXACT schema field names
          nomorkontrak: contractData.nomorKontrak,
          judulkontrak: contractData.judul,
          jeniskontrak: contractData.jenisKontrak,
          tanggalmulai: contractData.tanggalMulai?.toISOString(),
          tanggalakhir: endDate?.toISOString(),
          
          // Employee Information - matching schema field names
          namalengkap: contractData.namaLengkap,
          tanggallahir: contractData.tanggalLahir ? format(contractData.tanggalLahir, 'yyyy-MM-dd') : '',
          jeniskelamin: contractData.jenisKelamin,
          alamatlengkap: contractData.alamatLengkap,
          nomortelepon: contractData.nomorTelepon,
          email: contractData.email,
          
          // Job Details - matching schema field names
          posisijabatan: contractData.posisiJabatan,
          lokasikerja: contractData.lokasiKerja,
          tanggalmulaikerja: contractData.tanggalMulaiKerja?.toISOString(),
          haricuti: contractData.hariCuti,
          deskripsipekerjaan: contractData.deskripsiPekerjaan,
          detailcuti: contractData.detailCuti,
          aturanlembur: contractData.aturanLembur,

          // Compensation - matching schema field names
          gajipokok: parseInt(contractData.gajiPokok) || 0,
          tunjangantetap: parseInt(contractData.tunjanganTetap) || 0,
          tunjangantidaktetap: parseInt(contractData.tunjanganTidakTetap) || 0,
          jaminansosial: contractData.jaminanSosial,
          fasilitaslain: contractData.fasilitasLain,
          
          // Legal & Disciplinary - matching schema field names
          hukumdanrahasia: contractData.hukumDanRahasia,
          disiplin: contractData.disiplin,
          sanksi: contractData.sanksi,
          pemutusanhubungankerja: contractData.pemutusanHubunganKerja
      }

      console.log('🚀 Sending employment contract data:', apiData)

      const response = await fetch('/api/contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Employment contract created:', result.contract)
        
        // Show success message
        const successMessage = `Kontrak kerja "${contractData.judul}" berhasil dibuat!\nID: ${result.contract?.id}\n\nAnda akan diarahkan ke dashboard...`;
        alert(successMessage);
        
        // Redirect to dashboard to see the created contract
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        
      } else {
        console.error('❌ Failed to create employment contract:', result)
        alert(`Gagal membuat kontrak kerja:\n${result.error || 'Unknown error'}\n\nDetail: ${result.details || 'No details available'}`)
      }

    } catch (error) {
      console.error('❌ Error generating employment contract:', error)
      alert('Terjadi kesalahan saat membuat kontrak kerja. Silakan coba lagi.')
    } finally {
      setIsGenerating(false)
    }
  }
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Draft Kontrak Employment
        </h1>
        <p className="text-gray-600">
          Buat kontrak kerja dengan mudah dan lengkap
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  index <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  index <= currentStep ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-4 ${
                    index < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
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
                  <p className="text-green-800 font-medium">
                    Kontrak Kerja / Employment Contract
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Kontrak antara perusahaan dengan karyawan untuk hubungan
                    kerja
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className={`cursor-pointer border-2 ${
                    inputMethod === "manual"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setInputMethod("manual")}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">Isi Manual</h3>
                    <p className="text-gray-600">
                      Isi form secara manual langkah demi langkah
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${
                    inputMethod === "upload"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setInputMethod("upload")}
                >
                  <CardContent className="p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">
                      Upload Dokumen
                    </h3>
                    <p className="text-gray-600">
                      Upload kontrak kerja yang sudah ada untuk dianalisis
                    </p>
                  </CardContent>
                </Card>
              </div>

              {inputMethod === "upload" && (
                <div className="mt-6">
                  {!uploadedFile && !isScanning && (
                    <div
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add(
                          "border-blue-400",
                          "bg-blue-50"
                        );
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(
                          "border-blue-400",
                          "bg-blue-50"
                        );
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(
                          "border-blue-400",
                          "bg-blue-50"
                        );
                        const files = Array.from(e.dataTransfer.files);
                        if (files.length > 0) {
                          await processFile(files[0]);
                        }
                      }}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Upload file PDF kontrak kerja untuk analisis otomatis
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag & drop file PDF atau klik untuk browse
                        <br />
                        <span className="text-xs text-gray-400">
                          Format: PDF • Ukuran maksimal: 10MB
                        </span>
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
                        <h3 className="font-semibold text-lg text-blue-900">
                          Memproses Dokumen PDF
                        </h3>
                        <p className="text-blue-700 mb-4">
                          Menganalisis dan mengekstrak informasi kontrak
                          kerja...
                        </p>
                      </div>

                      <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-sm text-blue-600">
                        {scanProgress}% selesai
                      </p>
                    </div>
                  )}

                  {uploadedFile && !isScanning && (
                    <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <p className="font-semibold text-green-900">
                              {uploadedFile.name}
                            </p>
                            <p className="text-sm text-green-700">
                              Dokumen berhasil diproses dan data telah dipetakan
                              ke form
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadedFile(null);
                              setInputMethod(null);
                              resetForm();
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
              {initialExtractedData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-blue-800 font-medium">
                      Data telah diisi otomatis dari dokumen PDF yang di-upload
                    </p>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    Anda dapat mengedit data sesuai kebutuhan.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nomorKontrak">Nomor Kontrak</Label>
                  <Input
                    id="nomorKontrak"
                    value={contractData.nomorKontrak}
                    onChange={(e) =>
                      handleInputChange("nomorKontrak", e.target.value)
                    }
                    placeholder="Masukkan nomor kontrak kerja"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jenis">Jenis Kontrak</Label>
                  <Select
                    value={contractData.jenis}
                    onValueChange={(value) => handleInputChange("jenis", value)}
                    disabled={isFieldDisabled()}
                  >
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
                  onChange={(e) => handleInputChange("judul", e.target.value)}
                  placeholder="Masukkan judul kontrak kerja"
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isFieldDisabled()}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractData.tanggalMulai
                          ? format(contractData.tanggalMulai, "dd/MM/yyyy")
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractData.tanggalMulai}
                        onSelect={(date) =>
                          handleInputChange("tanggalMulai", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Tanggal Selesai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isFieldDisabled()}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractData.tanggalSelesai ? format(contractData.tanggalSelesai, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractData.tanggalSelesai}
                        onSelect={(date) => handleInputChange('tanggalSelesai', date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identitas Pegawai */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="namaLengkap">Nama Lengkap</Label>
                  <Input
                    id="namaLengkap"
                    value={contractData.namaLengkap}
                    onChange={(e) =>
                      handleInputChange("namaLengkap", e.target.value)
                    }
                    placeholder="Nama lengkap pegawai"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Tanggal Lahir</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isFieldDisabled()}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractData.tanggalLahir
                          ? format(contractData.tanggalLahir, "dd/MM/yyyy")
                          : "Pilih tanggal lahir"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractData.tanggalLahir}
                        onSelect={(date) =>
                          handleInputChange("tanggalLahir", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                  <Select
                    value={contractData.jenisKelamin}
                    onValueChange={(value) =>
                      handleInputChange("jenisKelamin", value)
                    }
                    disabled={isFieldDisabled()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="alamatLengkap">Alamat Lengkap</Label>
                <Textarea
                  id="alamatLengkap"
                  value={contractData.alamatLengkap}
                  onChange={(e) =>
                    handleInputChange("alamatLengkap", e.target.value)
                  }
                  rows={3}
                  placeholder="Alamat lengkap pegawai"
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="nomorTelepon">Nomor Telepon</Label>
                  <Input
                    id="nomorTelepon"
                    value={contractData.nomorTelepon}
                    onChange={(e) =>
                      handleInputChange("nomorTelepon", e.target.value)
                    }
                    placeholder="Nomor telepon"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contractData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Email pegawai"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Detail Pekerjaan */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="posisiJabatan">Posisi/Jabatan</Label>
                  <Input
                    id="posisiJabatan"
                    value={contractData.posisiJabatan}
                    onChange={(e) =>
                      handleInputChange("posisiJabatan", e.target.value)
                    }
                    placeholder="Contoh: Software Developer"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="lokasiKerja">Lokasi Kerja</Label>
                  <Input
                    id="lokasiKerja"
                    value={contractData.lokasiKerja}
                    onChange={(e) =>
                      handleInputChange("lokasiKerja", e.target.value)
                    }
                    placeholder="Contoh: Jakarta Selatan"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label>Tanggal Mulai Kerja</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isFieldDisabled()}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractData.tanggalMulaiKerja
                          ? format(contractData.tanggalMulaiKerja, "dd/MM/yyyy")
                          : "Pilih tanggal mulai kerja"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractData.tanggalMulaiKerja}
                        onSelect={(date) =>
                          handleInputChange("tanggalMulaiKerja", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="jenisKontrak">Jenis Kontrak</Label>
                  <Select
                    value={contractData.jenisKontrak}
                    onValueChange={(value) =>
                      handleInputChange("jenisKontrak", value)
                    }
                    disabled={isFieldDisabled()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kontrak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKWTT">
                        PKWTT (Kontrak Tidak Terbatas)
                      </SelectItem>
                      <SelectItem value="PKWT">
                        PKWT (Kontrak Waktu Tertentu)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hariCuti">Banyak Hari Cuti</Label>
                  <Input 
                    id="hariCuti"
                    value={contractData.hariCuti}
                    onChange={(e) => handleInputChange('hariCuti', e.target.value)}
                    placeholder="Contoh: 12"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deskripsiPekerjaan">Deskripsi Pekerjaan</Label>
                <Textarea
                  id="deskripsiPekerjaan"
                  value={contractData.deskripsiPekerjaan}
                  onChange={(e) =>
                    handleInputChange("deskripsiPekerjaan", e.target.value)
                  }
                  rows={5}
                  placeholder="Jelaskan secara detail tanggung jawab dan tugas pekerjaan..."
                  disabled={isFieldDisabled()}
                />
              </div>
              <div>
                <Label htmlFor="detailCuti">Detail Cuti</Label>
                <Textarea 
                  id="detailCuti"
                  value={contractData.detailCuti}
                  onChange={(e) => handleInputChange('detailCuti', e.target.value)}
                  rows={5}
                  placeholder="Jika ada cuti khusus jelaskan detailnya"
                  disabled={isFieldDisabled()}
                />
              </div>
              <div>
                <Label htmlFor="aturanLembur">Aturan Lembur</Label>
                <Textarea 
                  id="aturanLembur"
                  value={contractData.aturanLembur}
                  onChange={(e) => handleInputChange('aturanLembur', e.target.value)}
                  rows={5}
                  placeholder="Jelaskan secara detail aturan lembur"
                  disabled={isFieldDisabled()}
                />
              </div>
            </div>
          )}

          {/* Step 4: Jam Kerja & Waktu */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="gajiPokok">Gaji Pokok</Label>
                  <Input
                    id="gajiPokok"
                    value={contractData.gajiPokok}
                    onChange={(e) => handleInputChange('gajiPokok', e.target.value)}
                    placeholder="Contoh: 8000000"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="tunjanganTetap">Tunjangan Tetap</Label>
                  <Input
                    id="tunjanganTetap"
                    value={contractData.tunjanganTetap}
                    onChange={(e) => handleInputChange('tunjanganTetap', e.target.value)}
                    placeholder="Contoh: 1000000"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="tunjanganTidakTetap">Tunjangan Tidak Tetap</Label>
                  <Input 
                    id="tunjanganTidakTetap"
                    value={contractData.tunjanganTidakTetap}
                    onChange={(e) => handleInputChange('tunjanganTidakTetap', e.target.value)}
                    placeholder="Contoh: 1000000"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="jaminanSosial">Jaminan Sosial</Label>
                  <Input 
                    id="jaminanSosial"
                    value={contractData.jaminanSosial}
                    onChange={(e) => handleInputChange('jaminanSosial', e.target.value)}
                    placeholder="Jelaskan dengan detail jaminan sosial yang diberikan"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="fasilitasLain">Fasilitas Pendukung Lain</Label>
                  <Input 
                    id="fasilitasLain"
                    value={contractData.fasilitasLain}
                    onChange={(e) => handleInputChange('fasilitasLain', e.target.value)}
                    placeholder="Jelaskan fasilitas pendukung yang disediakan perusahaan untuk pegawai"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Kompensasi & Tunjangan */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="hukumDanRahasia">Perlindungan Hukum dan Kerahasiaan</Label>
                  <Input 
                    id="hukumDanRahasia"
                    value={contractData.hukumDanRahasia}
                    onChange={(e) => handleInputChange('hukumDanRahasia', e.target.value)}
                    placeholder="Jelaskan hak perlindungan hukum dan kerahasiaan data perusahaan"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="disiplin">Disiplin</Label>
                  <Input 
                    id="disiplin"
                    value={contractData.disiplin}
                    onChange={(e) => handleInputChange('disiplin', e.target.value)}
                    placeholder="Jelaskan kepatuhan terhadap tata terteb, kebijakan perusahaan, dan lainnya"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sanksi">Sanksi</Label>
                <Textarea 
                  id="sanksi"
                  value={contractData.sanksi}
                  onChange={(e) => handleInputChange('sanksi', e.target.value)}
                  rows={3}
                  placeholder="Jelaskan sanksi atau hukuman yang diterapkan apabila pegawai melanggar aturan kerja"
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="pemutusanHubunganKerja">Pemutusan Hubungan Kerja</Label>
                  <Input 
                    id="pemutusanHubunganKerja"
                    value={contractData.pemutusanHubunganKerja}
                    onChange={(e) => handleInputChange('pemutusanHubunganKerja', e.target.value)}
                    placeholder="Jelaskan ketentuan pemutusan hubungan kerja"
                    disabled={isFieldDisabled()}
                  />
                </div>
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
                <Button 
                  onClick={handleGenerateContract}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Membuat Kontrak...' : 'Generate Kontrak Kerja'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={
                    currentStep === 0 &&
                    (!inputMethod ||
                      (inputMethod === "upload" && !uploadedFile))
                  }
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}