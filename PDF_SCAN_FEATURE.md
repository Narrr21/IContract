# Fitur Upload dan Scan PDF Kontrak

## Deskripsi Fitur

Fitur ini memungkinkan pengguna untuk mengunggah dokumen PDF kontrak yang sudah ada dan secara otomatis mengekstrak informasi penting dari dokumen tersebut untuk dipetakan ke form drafting kontrak.

## Cara Kerja

### 1. **Pilih Metode Input**
- Pengguna dapat memilih antara "Isi Manual" atau "Upload Dokumen"
- Jika memilih "Upload Dokumen", akan muncul area drag & drop untuk file PDF

### 2. **Upload File PDF**
- Hanya menerima file dengan format PDF
- Maksimal ukuran file: 10MB (dapat dikonfigurasi)
- Validasi format file otomatis

### 3. **Proses Scanning**
- Setelah upload, sistem akan memproses dokumen PDF
- Menampilkan progress bar dan status scanning
- Simulasi waktu pemrosesan 2-3 detik

### 4. **Ekstraksi Data**
- Sistem mengekstrak informasi berikut dari PDF:
  - **Informasi Umum**: Nomor kontrak, judul, jenis, tanggal mulai, durasi
  - **Identitas Pihak 1**: Nama perusahaan, direktur, alamat, telepon, email, NPWP, nomor usaha
  - **Identitas Pihak 2**: Data lengkap pihak kedua
  - **Ruang Lingkup**: Jenis layanan, deskripsi, wilayah operasional, hak & kewajiban
  - **Keuangan**: Nominal, syarat pembayaran, cara pembayaran, denda
  - **Klaim & Sengketa**: Batas waktu klaim, kompensasi, penyelesaian sengketa, force majeure

### 5. **Auto-Fill Form**
- Semua data yang berhasil diekstrak akan otomatis mengisi form
- Field menjadi disabled/read-only untuk mencegah pengeditan
- Navigasi otomatis ke step berikutnya

## Teknologi yang Digunakan

### Frontend
- **React Hook**: `useState` untuk state management
- **UI Components**: shadcn/ui (Card, Button, Input, etc.)
- **File Upload**: HTML5 File API
- **Progress Indicator**: Custom progress bar dengan animasi

### Backend API
- **Endpoint**: `/api/process-pdf`
- **Method**: POST dengan FormData
- **Response**: JSON dengan data terstruktur
- **Error Handling**: Validasi file dan error handling

### Implementasi PDF Processing (Future Enhancement)
Untuk implementasi nyata, dapat menggunakan:
- **PDF.js**: Untuk ekstraksi teks dari PDF
- **OpenAI API**: Untuk parsing intelligent menggunakan AI
- **Tesseract.js**: Untuk OCR jika diperlukan
- **pdf-parse**: Library Node.js untuk parsing PDF

## Struktur Data Hasil Ekstraksi

```typescript
interface ContractData {
  // Informasi Umum
  nomorKontrak: string
  judul: string
  jenis: string
  tanggalMulai: Date | undefined
  durasi: string
  
  // Pihak Pertama & Kedua
  pihak1: PartyData
  pihak2: PartyData
  
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
  caraPembayaran: PaymentMethod
  jangkaWaktuPembayaran: string
  dendaKeterlambatan: string
  
  // Klaim dan Sengketa
  batasWaktuKlaim: string
  maksimalKompensasi: string
  penyelesaianSengketa: string
  forceMajeure: string
}
```

## Fitur UI/UX

### 1. **Upload Area**
- Drag & drop interface yang intuitif
- Visual feedback untuk hover state
- Icon dan teks instruksi yang jelas

### 2. **Progress Indicator**
- Loading spinner dengan animasi
- Progress bar dengan persentase
- Status text yang informatif

### 3. **Success State**
- Konfirmasi visual dengan ikon centang
- Informasi file yang diupload
- Tombol "Hapus & Mulai Ulang" untuk reset

### 4. **Form State Management**
- Field otomatis disabled setelah scan
- Visual indicator bahwa data berasal dari PDF
- Navigasi otomatis ke step selanjutnya

### 5. **Error Handling**
- Validasi format file
- Pesan error yang user-friendly
- Fallback jika proses gagal

## Kelebihan Fitur

1. **Efisiensi**: Mengurangi waktu input manual yang panjang
2. **Akurasi**: Mengurangi kesalahan human error dalam input data
3. **User Experience**: Interface yang intuitif dan responsif
4. **Fleksibilitas**: Pengguna tetap bisa memilih input manual
5. **Validation**: Otomatis validasi format dan isi dokumen

## Pengembangan Selanjutnya

1. **AI Integration**: Implementasi OpenAI untuk parsing yang lebih akurat
2. **Multiple Formats**: Support untuk format Word (.docx)
3. **Template Recognition**: Deteksi template kontrak yang berbeda
4. **Confidence Score**: Skor kepercayaan untuk setiap field yang diekstrak
5. **Manual Override**: Kemampuan edit field tertentu meski dari scan
6. **Batch Processing**: Upload multiple files sekaligus
7. **Preview**: Preview dokumen PDF dalam aplikasi
8. **Version History**: Tracking perubahan dan versi dokumen