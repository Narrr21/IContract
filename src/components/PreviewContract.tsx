'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Eye } from 'lucide-react';
import { generateContractText } from '@/lib/services/contractPdfService';

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

interface PreviewContractProps {
  contractType: 'partnership' | 'employment';
  contractData: ContractData | EmploymentContractData;
  onSave?: () => void;
}

export default function PreviewContract({ contractType, contractData, onSave }: PreviewContractProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewText, setPreviewText] = useState<string>('');

  const handlePreview = async () => {
    try {
      setIsGenerating(true);
      
      // Generate contract text using our service
      const contractText = generateContractText(contractType, contractData);
      setPreviewText(contractText);
      setIsPreviewOpen(true);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Error generating contract preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType,
          contractData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Handle PDF blob response
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kontrak-${contractType}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (onSave) {
        onSave();
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Kontrak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handlePreview}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Preview Kontrak'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Preview Kontrak</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
                    {previewText}
                  </pre>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download Kontrak'}
            </Button>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Preview untuk melihat hasil kontrak sebelum download. 
            Download akan menghasilkan file kontrak yang sudah diformat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}