"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Upload,
  FileText,
  Users,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

interface EmploymentContractData {
  // Informasi Umum Perjanjian
  nomorKontrak: string;
  judul: string;
  jenis: string;
  tanggalMulai: Date | undefined;
  durasi: string;

  // Identitas Pegawai
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: Date | undefined;
  jenisKelamin: "L" | "P" | "";
  alamatLengkap: string;
  nomorTelepon: string;
  email: string;
  pendidikanTerakhir: string;
  nomorIdentitas: string;
  jenisIdentitas: "KTP" | "Passport" | "SIM" | "";

  // Identitas Perusahaan
  namaPerusahaan: string;
  alamatPerusahaan: string;
  nomorTeleponPerusahaan: string;
  emailPerusahaan: string;
  npwpPerusahaan: string;
  namaPimpinan: string;
  jabatanPimpinan: string;

  // Detail Pekerjaan
  posisiJabatan: string;
  departemen: string;
  lokasiKerja: string;
  tanggalMulaiKerja: Date | undefined;
  jenisKontrak: "PKWTT" | "PKWT" | "";
  masaPercobaan: string;
  deskripsiPekerjaan: string;

  // Jam Kerja & Waktu
  hariKerja: string;
  jamKerja: string;
  jamIstirahat: string;
  jamLembur: string;

  // Kompensasi & Tunjangan
  gajiPokok: string;
  tunjanganTetap: string;
  tunjanganVariabel: string;
  metodePembayaran: string;
  jadwalPembayaran: string;

  // Fasilitas & Benefit
  bpjs: string;
  asuransiKesehatan: string;
  cuti: string;
  fasilitasLain: string;

  // Hak & Kewajiban
  hakPegawai: string;
  kewajibanPegawai: string;
  hakPerusahaan: string;
  kewajibanPerusahaan: string;

  // Perlindungan Hukum
  kerahasiaan: string;
  nonKompete: string;
  aturanDisiplin: string;
  keselamatanKerja: string;
  perlindunganData: string;
  sanksiPelanggaran: string;
  prosedurPenyelesaianSengketa: string;
  masaNotice: string;
  pesangonPHK: string;
}

interface EmploymentPageProps {
  initialInputMethod?: "manual" | "upload";
  initialFile?: File | null;
  initialExtractedData?: EmploymentContractData | null;
}

function EmploymentPageContent({
  initialInputMethod,
  initialFile,
  initialExtractedData,
}: EmploymentPageProps) {
  const [currentStep, setCurrentStep] = useState(initialInputMethod ? 1 : 0);
  const [inputMethod, setInputMethod] = useState<"manual" | "upload" | null>(
    initialInputMethod || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(
    initialFile || null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contractData, setContractData] = useState<EmploymentContractData>({
    // Informasi Umum Perjanjian
    nomorKontrak: "",
    judul: "",
    jenis: "EMPLOYMENT",
    tanggalMulai: undefined,
    durasi: "",

    // Identitas Pegawai
    namaLengkap: "",
    tempatLahir: "",
    tanggalLahir: undefined,
    jenisKelamin: "",
    alamatLengkap: "",
    nomorTelepon: "",
    email: "",
    pendidikanTerakhir: "",
    nomorIdentitas: "",
    jenisIdentitas: "",

    // Identitas Perusahaan
    namaPerusahaan: "",
    alamatPerusahaan: "",
    nomorTeleponPerusahaan: "",
    emailPerusahaan: "",
    npwpPerusahaan: "",
    namaPimpinan: "",
    jabatanPimpinan: "",

    // Detail Pekerjaan
    posisiJabatan: "",
    departemen: "",
    lokasiKerja: "",
    tanggalMulaiKerja: undefined,
    jenisKontrak: "",
    masaPercobaan: "",
    deskripsiPekerjaan: "",

    // Jam Kerja & Waktu
    hariKerja: "",
    jamKerja: "",
    jamIstirahat: "",
    jamLembur: "",

    // Kompensasi & Tunjangan
    gajiPokok: "",
    tunjanganTetap: "",
    tunjanganVariabel: "",
    metodePembayaran: "",
    jadwalPembayaran: "",

    // Fasilitas & Benefit
    bpjs: "",
    asuransiKesehatan: "",
    cuti: "",
    fasilitasLain: "",

    // Hak & Kewajiban
    hakPegawai: "",
    kewajibanPegawai: "",
    hakPerusahaan: "",
    kewajibanPerusahaan: "",

    // Perlindungan Hukum
    kerahasiaan: "",
    nonKompete: "",
    aturanDisiplin: "",
    keselamatanKerja: "",
    perlindunganData: "",
    sanksiPelanggaran: "",
    prosedurPenyelesaianSengketa: "",
    masaNotice: "",
    pesangonPHK: "",
  });

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
    "Pilih Metode Input",
    "Informasi Umum",
    "Identitas Pegawai",
    "Tanggung Jawab",
    "Hak & Fasilitas",
    "Perlindungan Hukum",
  ];

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
      nomorKontrak: "",
      judul: "",
      jenis: "EMPLOYMENT",
      tanggalMulai: undefined,
      durasi: "",
      namaLengkap: "",
      tempatLahir: "",
      tanggalLahir: undefined,
      jenisKelamin: "",
      alamatLengkap: "",
      nomorTelepon: "",
      email: "",
      pendidikanTerakhir: "",
      nomorIdentitas: "",
      jenisIdentitas: "",
      namaPerusahaan: "",
      alamatPerusahaan: "",
      nomorTeleponPerusahaan: "",
      emailPerusahaan: "",
      npwpPerusahaan: "",
      namaPimpinan: "",
      jabatanPimpinan: "",
      posisiJabatan: "",
      departemen: "",
      lokasiKerja: "",
      tanggalMulaiKerja: undefined,
      jenisKontrak: "",
      masaPercobaan: "",
      deskripsiPekerjaan: "",
      hariKerja: "",
      jamKerja: "",
      jamIstirahat: "",
      jamLembur: "",
      gajiPokok: "",
      tunjanganTetap: "",
      tunjanganVariabel: "",
      metodePembayaran: "",
      jadwalPembayaran: "",
      bpjs: "",
      asuransiKesehatan: "",
      cuti: "",
      fasilitasLain: "",
      hakPegawai: "",
      kewajibanPegawai: "",
      hakPerusahaan: "",
      kewajibanPerusahaan: "",
      kerahasiaan: "",
      nonKompete: "",
      aturanDisiplin: "",
      keselamatanKerja: "",
      perlindunganData: "",
      sanksiPelanggaran: "",
      prosedurPenyelesaianSengketa: "",
      masaNotice: "",
      pesangonPHK: "",
    });
  };

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
                  <Label htmlFor="durasi">Durasi Perjanjian</Label>
                  <Input
                    id="durasi"
                    value={contractData.durasi}
                    onChange={(e) =>
                      handleInputChange("durasi", e.target.value)
                    }
                    placeholder="Contoh: 24 bulan / Tidak terbatas"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              {/* Informasi Perusahaan */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Informasi Perusahaan
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="namaPerusahaan">Nama Perusahaan</Label>
                    <Input
                      id="namaPerusahaan"
                      value={contractData.namaPerusahaan}
                      onChange={(e) =>
                        handleInputChange("namaPerusahaan", e.target.value)
                      }
                      placeholder="Nama perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="namaPimpinan">Nama Pimpinan</Label>
                    <Input
                      id="namaPimpinan"
                      value={contractData.namaPimpinan}
                      onChange={(e) =>
                        handleInputChange("namaPimpinan", e.target.value)
                      }
                      placeholder="Nama pimpinan perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="jabatanPimpinan">Jabatan Pimpinan</Label>
                    <Input
                      id="jabatanPimpinan"
                      value={contractData.jabatanPimpinan}
                      onChange={(e) =>
                        handleInputChange("jabatanPimpinan", e.target.value)
                      }
                      placeholder="Contoh: Direktur Utama"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="npwpPerusahaan">NPWP Perusahaan</Label>
                    <Input
                      id="npwpPerusahaan"
                      value={contractData.npwpPerusahaan}
                      onChange={(e) =>
                        handleInputChange("npwpPerusahaan", e.target.value)
                      }
                      placeholder="NPWP perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="alamatPerusahaan">Alamat Perusahaan</Label>
                  <Textarea
                    id="alamatPerusahaan"
                    value={contractData.alamatPerusahaan}
                    onChange={(e) =>
                      handleInputChange("alamatPerusahaan", e.target.value)
                    }
                    rows={3}
                    placeholder="Alamat lengkap perusahaan"
                    disabled={isFieldDisabled()}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nomorTelefonPerusahaan">
                      Nomor Telepon
                    </Label>
                    <Input
                      id="nomorTelefonPerusahaan"
                      value={contractData.nomorTeleponPerusahaan}
                      onChange={(e) =>
                        handleInputChange(
                          "nomorTelefonPerusahaan",
                          e.target.value
                        )
                      }
                      placeholder="Nomor telepon perusahaan"
                      disabled={isFieldDisabled()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPerusahaan">Email Perusahaan</Label>
                    <Input
                      id="emailPerusahaan"
                      type="email"
                      value={contractData.emailPerusahaan}
                      onChange={(e) =>
                        handleInputChange("emailPerusahaan", e.target.value)
                      }
                      placeholder="Email perusahaan"
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
                <div>
                  <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                  <Input
                    id="tempatLahir"
                    value={contractData.tempatLahir}
                    onChange={(e) =>
                      handleInputChange("tempatLahir", e.target.value)
                    }
                    placeholder="Tempat lahir"
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
                <div>
                  <Label htmlFor="pendidikanTerakhir">
                    Pendidikan Terakhir
                  </Label>
                  <Input
                    id="pendidikanTerakhir"
                    value={contractData.pendidikanTerakhir}
                    onChange={(e) =>
                      handleInputChange("pendidikanTerakhir", e.target.value)
                    }
                    placeholder="Contoh: S1 Teknik Informatika"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="jenisIdentitas">Jenis Identitas</Label>
                  <Select
                    value={contractData.jenisIdentitas}
                    onValueChange={(value) =>
                      handleInputChange("jenisIdentitas", value)
                    }
                    disabled={isFieldDisabled()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis identitas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KTP">KTP</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="SIM">SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nomorIdentitas">Nomor Identitas</Label>
                  <Input
                    id="nomorIdentitas"
                    value={contractData.nomorIdentitas}
                    onChange={(e) =>
                      handleInputChange("nomorIdentitas", e.target.value)
                    }
                    placeholder="Nomor identitas"
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
                <div>
                  <Label htmlFor="departemen">Departemen</Label>
                  <Input
                    id="departemen"
                    value={contractData.departemen}
                    onChange={(e) =>
                      handleInputChange("departemen", e.target.value)
                    }
                    placeholder="Contoh: IT Department"
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
                  <Label htmlFor="masaPercobaan">Masa Percobaan</Label>
                  <Input
                    id="masaPercobaan"
                    value={contractData.masaPercobaan}
                    onChange={(e) =>
                      handleInputChange("masaPercobaan", e.target.value)
                    }
                    placeholder="Contoh: 3 bulan"
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
            </div>
          )}

          {/* Step 4: Jam Kerja & Waktu */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hariKerja">Hari Kerja</Label>
                  <Input
                    id="hariKerja"
                    value={contractData.hariKerja}
                    onChange={(e) =>
                      handleInputChange("hariKerja", e.target.value)
                    }
                    placeholder="Contoh: Senin - Jumat"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jamKerja">Jam Kerja</Label>
                  <Input
                    id="jamKerja"
                    value={contractData.jamKerja}
                    onChange={(e) =>
                      handleInputChange("jamKerja", e.target.value)
                    }
                    placeholder="Contoh: 08:00 - 17:00"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="jamIstirahat">Jam Istirahat</Label>
                  <Input
                    id="jamIstirahat"
                    value={contractData.jamIstirahat}
                    onChange={(e) =>
                      handleInputChange("jamIstirahat", e.target.value)
                    }
                    placeholder="Contoh: 12:00 - 13:00"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jamLembur">Ketentuan Jam Lembur</Label>
                  <Input
                    id="jamLembur"
                    value={contractData.jamLembur}
                    onChange={(e) =>
                      handleInputChange("jamLembur", e.target.value)
                    }
                    placeholder="Contoh: Maksimal 3 jam/hari"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Kompensasi & Tunjangan */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gajiPokok">Gaji Pokok</Label>
                  <Input
                    id="gajiPokok"
                    value={contractData.gajiPokok}
                    onChange={(e) =>
                      handleInputChange("gajiPokok", e.target.value)
                    }
                    placeholder="Contoh: Rp 8.000.000"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="tunjanganTetap">Tunjangan Tetap</Label>
                  <Input
                    id="tunjanganTetap"
                    value={contractData.tunjanganTetap}
                    onChange={(e) =>
                      handleInputChange("tunjanganTetap", e.target.value)
                    }
                    placeholder="Contoh: Tunjangan transportasi Rp 1.000.000"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tunjanganVariabel">Tunjangan Variabel</Label>
                <Textarea
                  id="tunjanganVariabel"
                  value={contractData.tunjanganVariabel}
                  onChange={(e) =>
                    handleInputChange("tunjanganVariabel", e.target.value)
                  }
                  rows={3}
                  placeholder="Jelaskan tunjangan tidak tetap seperti bonus, insentif, THR, dll..."
                  disabled={isFieldDisabled()}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="metodePembayaran">Metode Pembayaran</Label>
                  <Input
                    id="metodePembayaran"
                    value={contractData.metodePembayaran}
                    onChange={(e) =>
                      handleInputChange("metodePembayaran", e.target.value)
                    }
                    placeholder="Contoh: Transfer Bank"
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="jadwalPembayaran">Jadwal Pembayaran</Label>
                  <Input
                    id="jadwalPembayaran"
                    value={contractData.jadwalPembayaran}
                    onChange={(e) =>
                      handleInputChange("jadwalPembayaran", e.target.value)
                    }
                    placeholder="Contoh: Setiap tanggal 25"
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Fasilitas & Benefit */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bpjs">BPJS</Label>
                  <Textarea
                    id="bpjs"
                    value={contractData.bpjs}
                    onChange={(e) => handleInputChange("bpjs", e.target.value)}
                    rows={3}
                    placeholder="Jelaskan BPJS Kesehatan dan Ketenagakerjaan yang disediakan..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="asuransiKesehatan">Asuransi Kesehatan</Label>
                  <Textarea
                    id="asuransiKesehatan"
                    value={contractData.asuransiKesehatan}
                    onChange={(e) =>
                      handleInputChange("asuransiKesehatan", e.target.value)
                    }
                    rows={3}
                    placeholder="Jelaskan asuransi kesehatan tambahan jika ada..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cuti">Ketentuan Cuti</Label>
                  <Textarea
                    id="cuti"
                    value={contractData.cuti}
                    onChange={(e) => handleInputChange("cuti", e.target.value)}
                    rows={3}
                    placeholder="Jelaskan jenis cuti, jumlah hari, dan ketentuan pengajuan..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="fasilitasLain">Fasilitas Lain</Label>
                  <Textarea
                    id="fasilitasLain"
                    value={contractData.fasilitasLain}
                    onChange={(e) =>
                      handleInputChange("fasilitasLain", e.target.value)
                    }
                    rows={3}
                    placeholder="Jelaskan fasilitas lain seperti laptop, training, dll..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Hak & Kewajiban */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hakPegawai">Hak Pegawai</Label>
                  <Textarea
                    id="hakPegawai"
                    value={contractData.hakPegawai}
                    onChange={(e) =>
                      handleInputChange("hakPegawai", e.target.value)
                    }
                    rows={5}
                    placeholder="Jelaskan hak-hak yang dimiliki pegawai..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="kewajibanPegawai">Kewajiban Pegawai</Label>
                  <Textarea
                    id="kewajibanPegawai"
                    value={contractData.kewajibanPegawai}
                    onChange={(e) =>
                      handleInputChange("kewajibanPegawai", e.target.value)
                    }
                    rows={5}
                    placeholder="Jelaskan kewajiban yang harus dilaksanakan pegawai..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hakPerusahaan">Hak Perusahaan</Label>
                  <Textarea
                    id="hakPerusahaan"
                    value={contractData.hakPerusahaan}
                    onChange={(e) =>
                      handleInputChange("hakPerusahaan", e.target.value)
                    }
                    rows={5}
                    placeholder="Jelaskan hak-hak perusahaan..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="kewajibanPerusahaan">
                    Kewajiban Perusahaan
                  </Label>
                  <Textarea
                    id="kewajibanPerusahaan"
                    value={contractData.kewajibanPerusahaan}
                    onChange={(e) =>
                      handleInputChange("kewajibanPerusahaan", e.target.value)
                    }
                    rows={5}
                    placeholder="Jelaskan kewajiban perusahaan kepada pegawai..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Perlindungan Hukum */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="kerahasiaan">Kerahasiaan</Label>
                  <Textarea
                    id="kerahasiaan"
                    value={contractData.kerahasiaan}
                    onChange={(e) =>
                      handleInputChange("kerahasiaan", e.target.value)
                    }
                    rows={4}
                    placeholder="Jelaskan ketentuan kerahasiaan data perusahaan..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="nonKompete">Non Kompete</Label>
                  <Textarea
                    id="nonKompete"
                    value={contractData.nonKompete}
                    onChange={(e) =>
                      handleInputChange("nonKompete", e.target.value)
                    }
                    rows={4}
                    placeholder="Jelaskan ketentuan non kompete jika ada..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="aturanDisiplin">Aturan Disiplin</Label>
                  <Textarea
                    id="aturanDisiplin"
                    value={contractData.aturanDisiplin}
                    onChange={(e) =>
                      handleInputChange("aturanDisiplin", e.target.value)
                    }
                    rows={4}
                    placeholder="Jelaskan aturan kedisiplinan dan tata tertib..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="keselamatanKerja">Keselamatan Kerja</Label>
                  <Textarea
                    id="keselamatanKerja"
                    value={contractData.keselamatanKerja}
                    onChange={(e) =>
                      handleInputChange("keselamatanKerja", e.target.value)
                    }
                    rows={4}
                    placeholder="Jelaskan ketentuan keselamatan dan kesehatan kerja..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="perlindunganData">Perlindungan Data</Label>
                  <Textarea
                    id="perlindunganData"
                    value={contractData.perlindunganData}
                    onChange={(e) =>
                      handleInputChange("perlindunganData", e.target.value)
                    }
                    rows={4}
                    placeholder="Jelaskan perlindungan data pribadi pegawai..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="sanksiPelanggaran">Sanksi Pelanggaran</Label>
                  <Textarea
                    id="sanksiPelanggaran"
                    value={contractData.sanksiPelanggaran}
                    onChange={(e) =>
                      handleInputChange("sanksiPelanggaran", e.target.value)
                    }
                    rows={4}
                    placeholder="Jelaskan sanksi untuk berbagai pelanggaran..."
                    disabled={isFieldDisabled()}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="prosedurPenyelesaianSengketa">
                    Penyelesaian Sengketa
                  </Label>
                  <Textarea
                    id="prosedurPenyelesaianSengketa"
                    value={contractData.prosedurPenyelesaianSengketa}
                    onChange={(e) =>
                      handleInputChange(
                        "prosedurPenyelesaianSengketa",
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Jelaskan prosedur penyelesaian sengketa..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="masaNotice">Masa Notice</Label>
                  <Textarea
                    id="masaNotice"
                    value={contractData.masaNotice}
                    onChange={(e) =>
                      handleInputChange("masaNotice", e.target.value)
                    }
                    rows={3}
                    placeholder="Jelaskan masa pemberitahuan pengunduran diri..."
                    disabled={isFieldDisabled()}
                  />
                </div>
                <div>
                  <Label htmlFor="pesangonPHK">Pesangon PHK</Label>
                  <Textarea
                    id="pesangonPHK"
                    value={contractData.pesangonPHK}
                    onChange={(e) =>
                      handleInputChange("pesangonPHK", e.target.value)
                    }
                    rows={3}
                    placeholder="Jelaskan ketentuan pesangon PHK..."
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
                  onClick={() =>
                    console.log("Generate Employment Contract", contractData)
                  }
                >
                  Generate Kontrak Kerja
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

export default function EmploymentPage({
  initialInputMethod,
  initialFile,
  initialExtractedData,
}: EmploymentPageProps) {
  return (
    <ProtectedRoute requiredRoles={["MANAGEMENT", "ADMIN", "HR"]}>
      <EmploymentPageContent
        initialInputMethod={initialInputMethod}
        initialFile={initialFile}
        initialExtractedData={initialExtractedData}
      />
    </ProtectedRoute>
  );
}
