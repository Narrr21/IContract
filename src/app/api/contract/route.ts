// Update the API route to handle both partnership and employment contracts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import path from "path";
import { promises as fs } from "fs";
import {  } from "@/app/api/generate-pdf/route"

// GET /api/contract?id=123  -> single contract (with details)
// GET /api/contract          -> list all contracts (basic data)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return NextResponse.json(
          { success: false, error: "Invalid contract id" },
          { status: 400 }
        );
      }

      const contract = await prisma.contract.findUnique({
        where: { id: numericId },
        include: {
          partnershipDetails: true,
          employmentDetails: true,
        },
      });

      if (!contract) {
        return NextResponse.json(
          { success: false, error: "Contract not found" },
          { status: 404 }
        );
      }

      // Serialize numeric fields (mainly defensive; SQLite returns numbers already)
      const serialized = {
        ...contract,
        id: Number(contract.id),
        partnershipDetails: contract.partnershipDetails
          ? {
              ...contract.partnershipDetails,
              id: Number(contract.partnershipDetails.id),
              kontrakid: Number(contract.partnershipDetails.kontrakid),
              nominal: Number(contract.partnershipDetails.nominal),
              makskompensasi: Number(
                contract.partnershipDetails.makskompensasi
              ),
            }
          : null,
        employmentDetails: contract.employmentDetails
          ? {
              ...contract.employmentDetails,
              id: Number(contract.employmentDetails.id),
              kontrakid: Number(contract.employmentDetails.kontrakid),
              gajipokok: Number(contract.employmentDetails.gajipokok),
              tunjangantetap: Number(contract.employmentDetails.tunjangantetap),
              tunjangantidaktetap: Number(
                contract.employmentDetails.tunjangantidaktetap
              ),
            }
          : null,
      };

      return NextResponse.json({ success: true, contract: serialized });
    }

    // List all contracts (lightweight)
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, contracts });
  } catch (error) {
    console.error("❌ Error fetching contract(s) in GET /api/contract:");
    if (error instanceof Error) {
      console.error(error.message, error.stack);
    } else {
      console.error(error);
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contract(s)",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("📥 Received contract data:", data);

    // Check if it's an employment contract
    // Helper to adopt uploaded PDF -> rename uploaded-<timestamp>-*.pdf to {id}.pdf
    async function adoptUploadedPdf(
      contractId: number,
      uploadedFileName?: string
    ) {
      if (!uploadedFileName) {
        console.log("ℹ️ No uploadedFileName provided; skipping PDF adoption");
        return { pdfRenamed: false };
      }
      try {
        // Security: ensure no path traversal & matches expected pattern
        if (uploadedFileName.includes("/") || uploadedFileName.includes("..")) {
          console.warn(
            "⚠️ Rejecting suspicious uploadedFileName",
            uploadedFileName
          );
          return { pdfRenamed: false, warning: "Invalid file name" };
        }
        if (!uploadedFileName.startsWith("uploaded-")) {
          console.warn(
            "⚠️ uploadedFileName does not have expected prefix",
            uploadedFileName
          );
          return { pdfRenamed: false, warning: "Unexpected file name format" };
        }
        const contractDir = path.join(process.cwd(), "public", "contract");
        const tempPath = path.join(contractDir, uploadedFileName);
        const finalPath = path.join(contractDir, `${contractId}.pdf`);
        // Check existence
        try {
          await fs.access(tempPath);
        } catch {
          console.warn("⚠️ Temp uploaded file not found:", tempPath);
          return { pdfRenamed: false, warning: "Temp file not found" };
        }
        // If a file already exists at finalPath, back it up (very unlikely on create)
        let backupMade = false;
        try {
          await fs.access(finalPath);
          const backupPath = path.join(
            contractDir,
            `${contractId}-backup-${Date.now()}.pdf`
          );
          await fs.rename(finalPath, backupPath);
          backupMade = true;
          console.log(`🗂️ Existing target PDF moved to backup ${backupPath}`);
        } catch {
          // no existing file, proceed
        }
        await fs.rename(tempPath, finalPath);
        console.log(`✅ Uploaded PDF adopted as ${contractId}.pdf`);
        return { pdfRenamed: true, pdfFile: `${contractId}.pdf`, backupMade };
      } catch (err) {
        console.error("❌ Failed to adopt uploaded PDF:", err);
        return { pdfRenamed: false, error: (err as Error).message };
      }
    }

    if (data.type === "employment") {
      console.log("🏢 Creating employment contract...");

      // Create main contract record first
      const contract = await prisma.contract.create({
        data: {
          namakontrak: data.namakontrak,
          counterparty: data.counterparty,
          type: "employment",
          status: "draft",
          jatuhtempo: data.tanggalakhir
            ? new Date(data.tanggalakhir)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      console.log("📋 Main contract created with ID:", contract.id);

      // Create employment details record
      const employmentDetails = await prisma.employment.create({
        data: {
          kontrakid: contract.id,

          // Contract Information
          nomorkontrak: data.nomorkontrak,
          judulkontrak: data.judulkontrak,
          jeniskontrak: data.jeniskontrak,
          tanggalmulai: data.tanggalmulai
            ? new Date(data.tanggalmulai)
            : new Date(),
          tanggalakhir: data.tanggalakhir
            ? new Date(data.tanggalakhir)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),

          // Employee Information
          namalengkap: data.namalengkap,
          tanggallahir: data.tanggallahir || "",
          jeniskelamin: data.jeniskelamin,
          alamatlengkap: data.alamatlengkap,
          nomortelepon: data.nomortelepon,
          email: data.email,

          // Job Details
          posisijabatan: data.posisijabatan,
          lokasikerja: data.lokasikerja,
          tanggalmulaikerja: data.tanggalmulaikerja
            ? new Date(data.tanggalmulaikerja)
            : new Date(),
          haricuti: data.haricuti,
          deskripsipekerjaan: data.deskripsipekerjaan,
          detailcuti: data.detailcuti,
          aturanlembur: data.aturanlembur,

          // Compensation
          gajipokok: data.gajipokok || 0,
          tunjangantetap: data.tunjangantetap || 0,
          tunjangantidaktetap: data.tunjangantidaktetap || 0,
          jaminansosial: data.jaminansosial,
          fasilitaslain: data.fasilitaslain,

          // Legal & Disciplinary
          hukumdanrahasia: data.hukumdanrahasia,
          disiplin: data.disiplin,
          sanksi: data.sanksi,
          pemutusanhubungankerja: data.pemutusanhubungankerja,
        } as any, // Cast to any in case prisma client types are outdated (run `npx prisma generate`)
      });

      console.log(
        "👨‍💼 Employment details created with ID:",
        employmentDetails.id
      );

      // Return contract with employment details
      const fullContract = await prisma.contract.findUnique({
        where: { id: contract.id },
        include: {
          employmentDetails: true,
        },
      });

      // Convert BigInt fields to regular numbers for JSON serialization
      const serializedContract = {
        ...fullContract,
        id: Number(fullContract?.id),
        employmentDetails: fullContract?.employmentDetails
          ? {
              ...fullContract.employmentDetails,
              id: Number(fullContract.employmentDetails.id),
              kontrakid: Number(fullContract.employmentDetails.kontrakid),
              gajipokok: Number(fullContract.employmentDetails.gajipokok),
              tunjangantetap: Number(
                fullContract.employmentDetails.tunjangantetap
              ),
              tunjangantidaktetap: Number(
                fullContract.employmentDetails.tunjangantidaktetap
              ),
            }
          : null,
      };

      if (!data.uploadedFileName) {
        data.uploadedFileName = data.kontrakid;
      }
      // Attempt to adopt uploaded PDF if provided
      const pdfResult = await adoptUploadedPdf(
        contract.id,
        data.uploadedFileName
      );

      return NextResponse.json({
        success: true,
        contract: serializedContract,
        message: "Employment contract created successfully",
        pdf: pdfResult,
      });
    } else {
      // Handle partnership contracts (existing code)
      console.log("🤝 Creating partnership contract...");

      // Create main contract record first
      const contract = await prisma.contract.create({
        data: {
          namakontrak: data.namakontrak,
          counterparty: data.counterparty,
          type: data.type || "partnership",
          status: "draft",
          jatuhtempo: data.tanggalakhir
            ? new Date(data.tanggalakhir)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      // Create partnership details
      const partnershipDetails = await prisma.partnership.create({
        data: {
          kontrakid: contract.id,
          nomorkontrak: data.nomorkontrak,
          judul: data.judul,
          jenis: data.jenis,
          tanggalmulai: data.tanggalmulai
            ? new Date(data.tanggalmulai)
            : new Date(),
          tanggalakhir: data.tanggalakhir
            ? new Date(data.tanggalakhir)
            : new Date(),

          // Company 1
          perusahaan1: data.perusahaan1,
          direktur1: data.direktur1,
          alamat1: data.alamat1,
          nomortel1: data.nomortel1,
          email1: data.email1,
          npwp1: data.npwp1,
          nomorusaha1: data.nomorusaha1,

          // Company 2
          perusahaan2: data.perusahaan2,
          direktur2: data.direktur2,
          alamat2: data.alamat2,
          nomortel2: data.nomortel2,
          email2: data.email2,
          npwp2: data.npwp2,
          nomorusaha2: data.nomorusaha2,

          // Service details
          jenislayanan: data.jenislayanan,
          wilayahoperasi: data.wilayahoperasi,
          desklayanan: data.desklayanan,
          hak1: data.hak1,
          hak2: data.hak2,
          syaratlayanan: data.syaratlayanan,

          // Financial
          nominal: data.nominal || 0,
          tenggatbayar: data.tenggatbayar
            ? new Date(data.tenggatbayar)
            : new Date(),
          syaratbayar: data.syaratbayar,
          bank: data.bank,
          namapemilik: data.namapemilik,
          norek: data.norek,

          // Legal
          denda: data.denda,
          tenggatklaim: data.tenggatklaim
            ? new Date(data.tenggatklaim)
            : new Date(),
          makskompensasi: data.makskompensasi || 0,
          sengketa: data.sengketa,
          majeure: data.majeure,
        },
      });

      // Return contract with partnership details
      const fullContract = await prisma.contract.findUnique({
        where: { id: contract.id },
        include: {
          partnershipDetails: true,
        },
      });

      // Convert BigInt fields to regular numbers for JSON serialization
      const serializedContract = {
        ...fullContract,
        id: Number(fullContract?.id),
        partnershipDetails: fullContract?.partnershipDetails
          ? {
              ...fullContract.partnershipDetails,
              id: Number(fullContract.partnershipDetails.id),
              kontrakid: Number(fullContract.partnershipDetails.kontrakid),
              nominal: Number(fullContract.partnershipDetails.nominal),
              makskompensasi: Number(
                fullContract.partnershipDetails.makskompensasi
              ),
            }
          : null,
      };
      if (!data.uploadedFileName) {
        data.uploadedFileName = data.kontrakid;
      }
      // Attempt to adopt uploaded PDF if provided
      const pdfResult = await adoptUploadedPdf(
        contract.id,
        data.uploadedFileName
      );

      return NextResponse.json({
        success: true,
        contract: serializedContract,
        message: "Partnership contract created successfully",
        pdf: pdfResult,
      });
    }
  } catch (error) {
    console.error("❌ Error creating contract:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/contract?id=123 -> update contract status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contract ID is required" },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid contract ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status values (manual set to 'berakhir' disallowed – auto only)
    const validStatuses = ["draft", "aktif", "berakhir", "dihentikan"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }
    if (status === "berakhir") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Status 'berakhir' ditetapkan otomatis saat kontrak melewati tanggal jatuh tempo",
        },
        { status: 400 }
      );
    }

    // Check if contract exists
    const existingContract = await prisma.contract.findUnique({
      where: { id: numericId },
    });

    if (!existingContract) {
      return NextResponse.json(
        { success: false, error: "Contract not found" },
        { status: 404 }
      );
    }

    // Auth: only MANAGEMENT can change status per business rule
    const token =
      (request as any).cookies?.get?.("auth-token")?.value ||
      (typeof (globalThis as any).headers === "function"
        ? undefined
        : undefined);
    // For edge cases in Next 13 route handlers, we re-access via request.headers (cookie string)
    let userRole: string | null = null;
    let userId: number | null = null;
    try {
      let jwtToken = token;
      if (!jwtToken) {
        // Fallback parse cookie header manually
        const cookieHeader = (request as any).headers?.get?.("cookie");
        if (cookieHeader) {
          const match = cookieHeader
            .split(";")
            .map((c: string) => c.trim())
            .find((c: string) => c.startsWith("auth-token="));
          if (match) jwtToken = match.substring("auth-token=".length);
        }
      }
      if (!jwtToken) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: No auth token" },
          { status: 401 }
        );
      }
      const decoded: any = jwt.verify(
        jwtToken,
        process.env.JWT_SECRET || "your-secret-key"
      );
      userRole = decoded.category;
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    if (userRole !== "MANAGEMENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Hanya role MANAGEMENT yang boleh mengubah status kontrak",
        },
        { status: 403 }
      );
    }

    // Enforce allowed transitions:
    // draft -> aktif
    // draft -> dihentikan
    // aktif -> dihentikan
    // No other transitions; terminal states: dihentikan, berakhir
    const current = existingContract.status;
    const allowed =
      (current === "draft" &&
        (status === "aktif" || status === "dihentikan")) ||
      (current === "aktif" && status === "dihentikan");

    if (current === "berakhir" || current === "dihentikan") {
      return NextResponse.json(
        {
          success: false,
          error: `Kontrak dengan status '${current}' tidak dapat diubah lagi`,
        },
        { status: 400 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Transisi status tidak valid (${current} -> ${status})`,
        },
        { status: 400 }
      );
    }

    const updatedContract = await prisma.contract.update({
      where: { id: numericId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Contract status updated successfully",
      contract: {
        id: updatedContract.id,
        status: updatedContract.status,
        updatedBy: userId,
      },
    });
  } catch (error) {
    console.error("Error updating contract status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contract status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
