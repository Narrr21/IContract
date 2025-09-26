"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createContractWithDetails } from "@/lib/helper";

interface ContractData {
  // Informasi Umum
  nomorKontrak: string;
  judul: string;
  jenis: string;
  tanggalMulai: Date | undefined;
  durasi: string;

  // Pihak Pertama
  pihak1: {
    namaPerusahaan: string;
    namaDirektur: string;
    alamat: string;
    nomorTelp: string;
    email: string;
    npwp: string;
    nomorUsaha: string;
  };

  // Pihak Kedua
  pihak2: {
    namaPerusahaan: string;
    namaDirektur: string;
    alamat: string;
    nomorTelp: string;
    email: string;
    npwp: string;
    nomorUsaha: string;
  };

  // Ruang Lingkup
  jenisLayanan: string;
  deskripsiLayanan: string;
  wilayahOperasional: string;
  hakKewajibanPihak1: string;
  hakKewajibanPihak2: string;
  syaratLayanan: string;

  // Administrasi Keuangan
  nominal: string;
  syaratPembayaran: string;
  caraPembayaran: {
    bank: string;
    nama: string;
    norek: string;
  };
  jangkaWaktuPembayaran: string;
  dendaKeterlambatan: string;

  // Klaim dan Sengketa
  batasWaktuKlaim: string;
  maksimalKompensasi: string;
  penyelesaianSengketa: string;
  forceMajeure: string;
}

interface DraftPageProps {
  initialInputMethod?: "manual" | "upload";
  initialFile?: File | null;
  initialExtractedData?: ContractData | null;
  // Callback ke parent untuk reset (kembali ke halaman create utama)
  onReset?: () => void;
}

export default function DraftPage({
  initialInputMethod,
  initialFile,
  initialExtractedData,
  onReset,
}: DraftPageProps) {
  const [currentStep, setCurrentStep] = useState(initialInputMethod ? 1 : 0);
  const [inputMethod, setInputMethod] = useState<"manual" | "upload" | null>(
    initialInputMethod || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(
    initialFile || null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Set initial extracted data if available
  useEffect(() => {
    if (initialExtractedData) {
      setContractData(initialExtractedData);
    }
  }, [initialExtractedData]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contractData, setContractData] = useState<ContractData>({
    nomorKontrak: "",
    judul: "",
    jenis: "PARTNERSHIP",
    tanggalMulai: undefined,
    durasi: "",
    pihak1: {
      namaPerusahaan: "",
      namaDirektur: "",
      alamat: "",
      nomorTelp: "",
      email: "",
      npwp: "",
      nomorUsaha: "",
    },
    pihak2: {
      namaPerusahaan: "",
      namaDirektur: "",
      alamat: "",
      nomorTelp: "",
      email: "",
      npwp: "",
      nomorUsaha: "",
    },
    jenisLayanan: "",
    deskripsiLayanan: "",
    wilayahOperasional: "",
    hakKewajibanPihak1: "",
    hakKewajibanPihak2: "",
    syaratLayanan: "",
    nominal: "",
    syaratPembayaran: "",
    caraPembayaran: {
      bank: "",
      nama: "",
      norek: "",
    },
    jangkaWaktuPembayaran: "",
    dendaKeterlambatan: "",
    batasWaktuKlaim: "",
    maksimalKompensasi: "",
    penyelesaianSengketa: "",
    forceMajeure: "",
  });

  const steps = [
    "Pilih Metode Input",
    "Informasi Umum",
    "Identitas Para Pihak",
    "Ruang Lingkup",
    "Administrasi Keuangan",
    "Klaim & Sengketa",
  ];

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setContractData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof ContractData] as any),
          [field]: value,
        },
      }));
    } else {
      setContractData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const isFieldDisabled = () => {
    return inputMethod === "upload" && uploadedFile !== null;
  };

  // Helper function to calculate end date from start date and duration
  const calculateEndDate = (
    startDate: Date | undefined,
    duration: string
  ): Date | undefined => {
    if (!startDate || !duration) return undefined;

    const match = duration.match(/(\d+)\s*(hari|bulan|tahun|day|month|year)/i);
    if (!match) return undefined;

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const endDate = new Date(startDate);

    if (unit.includes("hari") || unit.includes("day")) {
      endDate.setDate(endDate.getDate() + amount);
    } else if (unit.includes("bulan") || unit.includes("month")) {
      endDate.setMonth(endDate.getMonth() + amount);
    } else if (unit.includes("tahun") || unit.includes("year")) {
      endDate.setFullYear(endDate.getFullYear() + amount);
    }

    return endDate;
  };

  // Function to handle contract generation
  const handleGenerateContract = async () => {
    try {
      setIsGenerating(true);

      // Validate required fields
      const requiredFields = [
        { field: contractData.nomorKontrak, name: "Nomor Kontrak" },
        { field: contractData.judul, name: "Judul Kontrak" },
        { field: contractData.tanggalMulai, name: "Tanggal Mulai" },
        {
          field: contractData.pihak1.namaPerusahaan,
          name: "Nama Perusahaan Pihak 1",
        },
        {
          field: contractData.pihak2.namaPerusahaan,
          name: "Nama Perusahaan Pihak 2",
        },
      ];

      const missingFields = requiredFields
        .filter(({ field }) => !field)
        .map(({ name }) => name);

      if (missingFields.length > 0) {
        alert(`Harap isi field yang wajib: ${missingFields.join(", ")}`);
        setIsGenerating(false);
        return;
      }

      // Calculate end date from duration if not set
      const endDate = calculateEndDate(
        contractData.tanggalMulai,
        contractData.durasi
      );
      if (!endDate) {
        alert('Format durasi tidak valid. Contoh: "12 bulan" atau "1 tahun"');
        setIsGenerating(false);
        return;
      }

      // Transform contract data to match database schema
      const contractPayload = {
        namakontrak: contractData.judul,
        counterparty: contractData.pihak2.namaPerusahaan || "Unknown",
        type: "partnership",
        nomorkontrak: contractData.nomorKontrak,
        judul: contractData.judul,
        jenis: contractData.jenis || "PARTNERSHIP",
        tanggalmulai: contractData.tanggalMulai,
        tanggalakhir: endDate,

        // Pihak Pertama
        perusahaan1: contractData.pihak1.namaPerusahaan,
        direktur1: contractData.pihak1.namaDirektur,
        alamat1: contractData.pihak1.alamat,
        nomortel1: contractData.pihak1.nomorTelp,
        email1: contractData.pihak1.email,
        npwp1: contractData.pihak1.npwp,
        nomorusaha1: contractData.pihak1.nomorUsaha,

        // Pihak Kedua
        perusahaan2: contractData.pihak2.namaPerusahaan,
        direktur2: contractData.pihak2.namaDirektur,
        alamat2: contractData.pihak2.alamat,
        nomortel2: contractData.pihak2.nomorTelp,
        email2: contractData.pihak2.email,
        npwp2: contractData.pihak2.npwp,
        nomorusaha2: contractData.pihak2.nomorUsaha,

        // Ruang Lingkup
        jenislayanan: contractData.jenisLayanan,
        wilayahoperasi: contractData.wilayahOperasional,
        desklayanan: contractData.deskripsiLayanan,
        hak1: contractData.hakKewajibanPihak1,
        hak2: contractData.hakKewajibanPihak2,
        syaratlayanan: contractData.syaratLayanan,

        // Keuangan
        nominal:
          parseFloat(
            contractData.nominal.replace(/[^\d.,]/g, "").replace(",", ".")
          ) || 0,
        tenggatbayar: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
        syaratbayar: contractData.syaratPembayaran,
        bank: contractData.caraPembayaran.bank,
        namapemilik: contractData.caraPembayaran.nama,
        norek: contractData.caraPembayaran.norek,
        denda: contractData.dendaKeterlambatan,

        // Klaim dan Sengketa
        tenggatklaim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days from now
        makskompensasi:
          parseFloat(
            contractData.maksimalKompensasi
              .replace(/[^\d.,]/g, "")
              .replace(",", ".")
          ) || 0,
        sengketa: contractData.penyelesaianSengketa,
        majeure: contractData.forceMajeure,
      };

      console.log("🚀 Sending contract data:", contractPayload);

      // Call API to create contract
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractPayload),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Contract created:", result.contract);

        // Show success message
        const successMessage = `Kontrak "${contractData.judul}" berhasil dibuat!\nID: ${result.contract?.id}\n\nAnda akan diarahkan ke dashboard...`;
        alert(successMessage);

        // Redirect to dashboard to see the created contract
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        console.error("❌ Failed to create contract:", result);
        alert(
          `Gagal membuat kontrak:\n${
            result.error || "Unknown error"
          }\n\nDetail: ${result.details || "No details available"}`
        );
      }
    } catch (error) {
      console.error("❌ Error generating contract:", error);
      alert("Terjadi kesalahan saat membuat kontrak. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
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

    // Check file size (10MB limit)
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
        // Auto advance to next step after successful scan
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

  const extractPDFData = async (file: File): Promise<ContractData> => {
    try {
      // Step 1: Extract raw text from PDF
      const formData = new FormData();
      formData.append("fileName", file.name);

      // First, get the raw text from PDF
      const extractResponse = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract text from PDF");
      }

      const extractData = await extractResponse.json();

      // Convert coordinate data to plain text
      const extractedText =
        extractData.textData
          ?.map((item: any) => {
            if (typeof item === "string") return item;
            if (item.text) return item.text;
            if (item.str) return item.str;
            return "";
          })
          .filter((text: string) => text.trim())
          .join(" ") || "";

      if (!extractedText || extractedText.length < 100) {
        throw new Error("Insufficient text content found in PDF");
      }

      console.log(`📄 Extracted ${extractedText.length} characters from PDF`);

      // Step 2: Use AI to extract structured data
      const aiResponse = await fetch("/api/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractType: "partnership",
          requirements: extractedText,
          assistanceType: "extract",
          additionalData: {
            extractionType: "form_data",
            targetFields: [
              "nomorKontrak",
              "judul",
              "jenis",
              "tanggalMulai",
              "durasi",
              "pihak1",
              "pihak2",
              "jenisLayanan",
              "deskripsiLayanan",
              "wilayahOperasional",
              "nominal",
              "syaratPembayaran",
            ],
          },
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI analysis failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        throw new Error(aiData.error || "AI analysis failed");
      }

      console.log("🤖 AI analysis completed successfully");

      // Step 3: Parse AI response to form data
      const contractData = parseAIResponseToContractData(aiData.assistance);

      return contractData;
    } catch (error) {
      console.error("❌ Error extracting PDF data:", error);
      throw error;
    }
  };

  // New function to parse AI response into ContractData format
  const parseAIResponseToContractData = (aiResponse: string): ContractData => {
    try {
      console.log("📊 Parsing AI response to contract data...");

      // Initialize with empty data
      const contractData: ContractData = {
        nomorKontrak: "",
        judul: "",
        jenis: "PARTNERSHIP",
        tanggalMulai: undefined,
        durasi: "",
        pihak1: {
          namaPerusahaan: "",
          namaDirektur: "",
          alamat: "",
          nomorTelp: "",
          email: "",
          npwp: "",
          nomorUsaha: "",
        },
        pihak2: {
          namaPerusahaan: "",
          namaDirektur: "",
          alamat: "",
          nomorTelp: "",
          email: "",
          npwp: "",
          nomorUsaha: "",
        },
        jenisLayanan: "",
        deskripsiLayanan: "",
        wilayahOperasional: "",
        hakKewajibanPihak1: "",
        hakKewajibanPihak2: "",
        syaratLayanan: "",
        nominal: "",
        syaratPembayaran: "",
        caraPembayaran: { bank: "", nama: "", norek: "" },
        jangkaWaktuPembayaran: "",
        dendaKeterlambatan: "",
        batasWaktuKlaim: "",
        maksimalKompensasi: "",
        penyelesaianSengketa: "",
        forceMajeure: "",
      };

      // Parse different sections of the AI response
      const sections = aiResponse.split(/(?=##|\*\*)/);

      sections.forEach((section) => {
        const lowerSection = section.toLowerCase();

        // Extract contract number
        const contractNumMatch = section.match(
          /(?:contract number|nomor kontrak|no\.\s*kontrak)[\s:]*([^\n\r]+)/i
        );
        if (contractNumMatch && !contractData.nomorKontrak) {
          contractData.nomorKontrak = contractNumMatch[1].trim();
        }

        // Extract contract title
        const titleMatch = section.match(
          /(?:title|judul|contract title)[\s:]*([^\n\r]+)/i
        );
        if (titleMatch && !contractData.judul) {
          contractData.judul = titleMatch[1].trim();
        }

        // Extract dates
        const dateMatch = section.match(
          /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
        );
        if (dateMatch && !contractData.tanggalMulai) {
          try {
            const dateStr = dateMatch[1];
            const date = new Date(dateStr.replace(/[\/\-]/g, "-"));
            if (!isNaN(date.getTime())) {
              contractData.tanggalMulai = date;
            }
          } catch (e) {
            console.warn("Failed to parse date:", dateMatch[1]);
          }
        }

        // Extract company names
        const companyMatches = section.match(
          /(?:company|perusahaan|pt\.?\s*|cv\.?\s*)([^\n\r,;]+)/gi
        );
        if (companyMatches) {
          companyMatches.forEach((match, index) => {
            const cleanCompany = match
              .replace(/^(?:company|perusahaan|pt\.?\s*|cv\.?\s*)/i, "")
              .trim();
            if (cleanCompany && cleanCompany.length > 2) {
              if (index === 0 && !contractData.pihak1.namaPerusahaan) {
                contractData.pihak1.namaPerusahaan = cleanCompany;
              } else if (index === 1 && !contractData.pihak2.namaPerusahaan) {
                contractData.pihak2.namaPerusahaan = cleanCompany;
              }
            }
          });
        }

        // Extract monetary values
        const moneyMatch = section.match(
          /(?:rp\.?\s*|idr\s*|rupiah\s*)?([\d.,]+)(?:\s*(?:juta|million|miliar|billion))?/i
        );
        if (moneyMatch && !contractData.nominal) {
          contractData.nominal = moneyMatch[0].trim();
        }

        // Extract service descriptions
        if (
          lowerSection.includes("service") ||
          lowerSection.includes("layanan") ||
          lowerSection.includes("scope")
        ) {
          const serviceMatch = section.match(
            /(?:service|layanan|scope)[\s:]*([^\n\r]{20,200})/i
          );
          if (serviceMatch && !contractData.jenisLayanan) {
            contractData.jenisLayanan = serviceMatch[1].trim();
          }
        }

        // Extract addresses
        const addressMatch = section.match(
          /(?:address|alamat)[\s:]*([^\n\r]{10,100})/i
        );
        if (addressMatch) {
          const address = addressMatch[1].trim();
          if (!contractData.pihak1.alamat) {
            contractData.pihak1.alamat = address;
          } else if (!contractData.pihak2.alamat) {
            contractData.pihak2.alamat = address;
          }
        }

        // Extract phone numbers
        const phoneMatch = section.match(/(?:\+62|62|0)[\d\-\s]{8,15}/);
        if (phoneMatch) {
          const phone = phoneMatch[0].trim();
          if (!contractData.pihak1.nomorTelp) {
            contractData.pihak1.nomorTelp = phone;
          } else if (!contractData.pihak2.nomorTelp) {
            contractData.pihak2.nomorTelp = phone;
          }
        }

        // Extract emails
        const emailMatch = section.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          const email = emailMatch[0].trim();
          if (!contractData.pihak1.email) {
            contractData.pihak1.email = email;
          } else if (!contractData.pihak2.email) {
            contractData.pihak2.email = email;
          }
        }
      });

      // Set defaults if certain fields are empty
      if (!contractData.jenis) {
        contractData.jenis = "PARTNERSHIP";
      }

      if (!contractData.durasi) {
        contractData.durasi = "12 bulan"; // Default duration
      }

      console.log("✅ Successfully parsed contract data from AI response");
      console.log("📋 Extracted data:", {
        nomorKontrak: contractData.nomorKontrak,
        judul: contractData.judul,
        hasCompany1: !!contractData.pihak1.namaPerusahaan,
        hasCompany2: !!contractData.pihak2.namaPerusahaan,
        hasDate: !!contractData.tanggalMulai,
        hasNominal: !!contractData.nominal,
      });

      return contractData;
    } catch (error) {
      console.error("❌ Error parsing AI response:", error);

      // Return minimal data structure if parsing fails
      return {
        nomorKontrak: "PKS-" + Date.now(),
        judul: "Kontrak Partnership",
        jenis: "PARTNERSHIP",
        tanggalMulai: new Date(),
        durasi: "12 bulan",
        pihak1: {
          namaPerusahaan: "",
          namaDirektur: "",
          alamat: "",
          nomorTelp: "",
          email: "",
          npwp: "",
          nomorUsaha: "",
        },
        pihak2: {
          namaPerusahaan: "",
          namaDirektur: "",
          alamat: "",
          nomorTelp: "",
          email: "",
          npwp: "",
          nomorUsaha: "",
        },
        jenisLayanan: "",
        deskripsiLayanan: "",
        wilayahOperasional: "",
        hakKewajibanPihak1: "",
        hakKewajibanPihak2: "",
        syaratLayanan: "",
        nominal: "",
        syaratPembayaran: "",
        caraPembayaran: { bank: "", nama: "", norek: "" },
        jangkaWaktuPembayaran: "",
        dendaKeterlambatan: "",
        batasWaktuKlaim: "",
        maksimalKompensasi: "",
        penyelesaianSengketa: "",
        forceMajeure: "",
      };
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Jika user menekan kembali dari step pertama (index 1) -> reset ke parent
    if (currentStep === 1) {
      // Panggil callback parent untuk mengosongkan contract type & input method
      onReset?.();
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Draft Kontrak Partnership
        </h1>
        <p className="text-gray-600">
          Buat kontrak partnership dengan mudah dan lengkap
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const circleClass = isActive
              ? 'bg-transparent border-2 border-blue-600 text-blue-600'
              : isCompleted
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700';
            const labelClass = isActive
              ? 'text-blue-600'
              : isCompleted
                ? 'text-blue-600'
                : 'text-gray-500';
            const lineClass = index < currentStep ? 'bg-blue-600' : 'bg-gray-200';
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center min-w-[70px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${circleClass}`}>{index + 1}</div>
                  <span className={`mt-2 text-[11px] md:text-xs font-medium leading-snug ${labelClass}`}>{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 md:mx-4 transition-colors ${lineClass}`} />
                )}
              </React.Fragment>
            );
          })}
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
                    Anda dapat meninjau data di bawah ini. Field tidak dapat
                    diedit karena data berasal dari scan dokumen.
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
                    placeholder="Masukkan nomor kontrak"
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
                  onChange={(e) => handleInputChange("judul", e.target.value)}
                  placeholder="Masukkan judul kontrak"
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
                      Data identitas para pihak telah diisi otomatis dari
                      dokumen PDF
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
                        onChange={(e) =>
                          handleInputChange(
                            "namaPerusahaan",
                            e.target.value,
                            "pihak1"
                          )
                        }
                        disabled={isFieldDisabled()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="namaDirektur1">Nama Direktur</Label>
                      <Input
                        id="namaDirektur1"
                        value={contractData.pihak1.namaDirektur}
                        onChange={(e) =>
                          handleInputChange(
                            "namaDirektur",
                            e.target.value,
                            "pihak1"
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="alamat1">Alamat Perusahaan</Label>
                    <Textarea
                      id="alamat1"
                      value={contractData.pihak1.alamat}
                      onChange={(e) =>
                        handleInputChange("alamat", e.target.value, "pihak1")
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nomorTelp1">Nomor Telepon</Label>
                      <Input
                        id="nomorTelp1"
                        value={contractData.pihak1.nomorTelp}
                        onChange={(e) =>
                          handleInputChange(
                            "nomorTelp",
                            e.target.value,
                            "pihak1"
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email1">Email</Label>
                      <Input
                        id="email1"
                        type="email"
                        value={contractData.pihak1.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value, "pihak1")
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="npwp1">NPWP</Label>
                      <Input
                        id="npwp1"
                        value={contractData.pihak1.npwp}
                        onChange={(e) =>
                          handleInputChange("npwp", e.target.value, "pihak1")
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomorUsaha1">Nomor Usaha</Label>
                      <Input
                        id="nomorUsaha1"
                        value={contractData.pihak1.nomorUsaha}
                        onChange={(e) =>
                          handleInputChange(
                            "nomorUsaha",
                            e.target.value,
                            "pihak1"
                          )
                        }
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
                        onChange={(e) =>
                          handleInputChange(
                            "namaPerusahaan",
                            e.target.value,
                            "pihak2"
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="namaDirektur2">Nama Direktur</Label>
                      <Input
                        id="namaDirektur2"
                        value={contractData.pihak2.namaDirektur}
                        onChange={(e) =>
                          handleInputChange(
                            "namaDirektur",
                            e.target.value,
                            "pihak2"
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="alamat2">Alamat Perusahaan</Label>
                    <Textarea
                      id="alamat2"
                      value={contractData.pihak2.alamat}
                      onChange={(e) =>
                        handleInputChange("alamat", e.target.value, "pihak2")
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nomorTelp2">Nomor Telepon</Label>
                      <Input
                        id="nomorTelp2"
                        value={contractData.pihak2.nomorTelp}
                        onChange={(e) =>
                          handleInputChange(
                            "nomorTelp",
                            e.target.value,
                            "pihak2"
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email2">Email</Label>
                      <Input
                        id="email2"
                        type="email"
                        value={contractData.pihak2.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value, "pihak2")
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="npwp2">NPWP</Label>
                      <Input
                        id="npwp2"
                        value={contractData.pihak2.npwp}
                        onChange={(e) =>
                          handleInputChange("npwp", e.target.value, "pihak2")
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomorUsaha2">Nomor Usaha</Label>
                      <Input
                        id="nomorUsaha2"
                        value={contractData.pihak2.nomorUsaha}
                        onChange={(e) =>
                          handleInputChange(
                            "nomorUsaha",
                            e.target.value,
                            "pihak2"
                          )
                        }
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
                    onChange={(e) =>
                      handleInputChange("jenisLayanan", e.target.value)
                    }
                    placeholder="Contoh: Jasa Konsultasi IT"
                  />
                </div>
                <div>
                  <Label htmlFor="wilayahOperasional">
                    Wilayah Operasional
                  </Label>
                  <Input
                    id="wilayahOperasional"
                    value={contractData.wilayahOperasional}
                    onChange={(e) =>
                      handleInputChange("wilayahOperasional", e.target.value)
                    }
                    placeholder="Contoh: Jakarta, Indonesia"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deskripsiLayanan">
                  Deskripsi Layanan (Jenis Barang/Layanan)
                </Label>
                <Textarea
                  id="deskripsiLayanan"
                  value={contractData.deskripsiLayanan}
                  onChange={(e) =>
                    handleInputChange("deskripsiLayanan", e.target.value)
                  }
                  rows={4}
                  placeholder="Jelaskan secara detail layanan atau barang yang akan disediakan..."
                />
              </div>

              <div>
                <Label htmlFor="hakKewajibanPihak1">
                  Hak dan Kewajiban Pihak Pertama
                </Label>
                <Textarea
                  id="hakKewajibanPihak1"
                  value={contractData.hakKewajibanPihak1}
                  onChange={(e) =>
                    handleInputChange("hakKewajibanPihak1", e.target.value)
                  }
                  rows={4}
                  placeholder="Sebutkan hak dan kewajiban pihak pertama..."
                />
              </div>

              <div>
                <Label htmlFor="hakKewajibanPihak2">
                  Hak dan Kewajiban Pihak Kedua
                </Label>
                <Textarea
                  id="hakKewajibanPihak2"
                  value={contractData.hakKewajibanPihak2}
                  onChange={(e) =>
                    handleInputChange("hakKewajibanPihak2", e.target.value)
                  }
                  rows={4}
                  placeholder="Sebutkan hak dan kewajiban pihak kedua..."
                />
              </div>

              <div>
                <Label htmlFor="syaratLayanan">Syarat Layanan</Label>
                <Textarea
                  id="syaratLayanan"
                  value={contractData.syaratLayanan}
                  onChange={(e) =>
                    handleInputChange("syaratLayanan", e.target.value)
                  }
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
                    onChange={(e) =>
                      handleInputChange("nominal", e.target.value)
                    }
                    placeholder="Contoh: Rp 100.000.000"
                  />
                </div>
                <div>
                  <Label htmlFor="jangkaWaktuPembayaran">
                    Jangka Waktu Pembayaran
                  </Label>
                  <Input
                    id="jangkaWaktuPembayaran"
                    value={contractData.jangkaWaktuPembayaran}
                    onChange={(e) =>
                      handleInputChange("jangkaWaktuPembayaran", e.target.value)
                    }
                    placeholder="Contoh: 30 hari"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="syaratPembayaran">Syarat Pembayaran</Label>
                <Textarea
                  id="syaratPembayaran"
                  value={contractData.syaratPembayaran}
                  onChange={(e) =>
                    handleInputChange("syaratPembayaran", e.target.value)
                  }
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
                      onChange={(e) =>
                        handleInputChange(
                          "bank",
                          e.target.value,
                          "caraPembayaran"
                        )
                      }
                      placeholder="Contoh: BCA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="namaRekening">Nama Rekening</Label>
                    <Input
                      id="namaRekening"
                      value={contractData.caraPembayaran.nama}
                      onChange={(e) =>
                        handleInputChange(
                          "nama",
                          e.target.value,
                          "caraPembayaran"
                        )
                      }
                      placeholder="Nama pemilik rekening"
                    />
                  </div>
                  <div>
                    <Label htmlFor="norek">Nomor Rekening</Label>
                    <Input
                      id="norek"
                      value={contractData.caraPembayaran.norek}
                      onChange={(e) =>
                        handleInputChange(
                          "norek",
                          e.target.value,
                          "caraPembayaran"
                        )
                      }
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
                  onChange={(e) =>
                    handleInputChange("dendaKeterlambatan", e.target.value)
                  }
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
                    onChange={(e) =>
                      handleInputChange("batasWaktuKlaim", e.target.value)
                    }
                    placeholder="Contoh: 14 hari"
                  />
                </div>
                <div>
                  <Label htmlFor="maksimalKompensasi">
                    Maksimal Kompensasi
                  </Label>
                  <Input
                    id="maksimalKompensasi"
                    value={contractData.maksimalKompensasi}
                    onChange={(e) =>
                      handleInputChange("maksimalKompensasi", e.target.value)
                    }
                    placeholder="Contoh: 50% dari nilai kontrak"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="penyelesaianSengketa">
                  Penyelesaian Sengketa
                </Label>
                <Textarea
                  id="penyelesaianSengketa"
                  value={contractData.penyelesaianSengketa}
                  onChange={(e) =>
                    handleInputChange("penyelesaianSengketa", e.target.value)
                  }
                  rows={4}
                  placeholder="Jelaskan mekanisme penyelesaian sengketa (mediasi, arbitrase, pengadilan, dll)..."
                />
              </div>

              <div>
                <Label htmlFor="forceMajeure">Force Majeure</Label>
                <Textarea
                  id="forceMajeure"
                  value={contractData.forceMajeure}
                  onChange={(e) =>
                    handleInputChange("forceMajeure", e.target.value)
                  }
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
                <Button
                  onClick={handleGenerateContract}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span>
                      Generating...
                    </span>
                  ) : (
                    "Generate Kontrak"
                  )}
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
