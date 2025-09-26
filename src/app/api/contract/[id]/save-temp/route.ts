import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// POST - Save temporary document as final PDF (overwrite original)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: "Contract ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `💾 Saving temporary document as final for contract ${contractId}`
    );

    // Paths
    const originalPdfPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}.pdf`
    );
    const tempPdfPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}_temp.pdf`
    );
    const backupPdfPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}_backup.pdf`
    );

    // Check if temporary file exists
    if (!fs.existsSync(tempPdfPath)) {
      console.log(`❌ Temporary PDF file not found at: ${tempPdfPath}`);
      return NextResponse.json(
        {
          success: false,
          error: "Temporary PDF not found. Please refresh and try again.",
        },
        { status: 404 }
      );
    }

    // Create backup of original if it exists
    if (fs.existsSync(originalPdfPath)) {
      fs.copyFileSync(originalPdfPath, backupPdfPath);
      console.log(`📁 Backup created: ${backupPdfPath}`);
    }

    // Overwrite original with temporary file
    fs.copyFileSync(tempPdfPath, originalPdfPath);
    console.log(`✅ Original PDF updated: ${originalPdfPath}`);

    // Clean up temporary file
    fs.unlinkSync(tempPdfPath);
    console.log(`🗑️ Temporary file removed: ${tempPdfPath}`);

    return NextResponse.json({
      success: true,
      message: "PDF saved successfully",
      backupCreated: true,
    });
  } catch (error) {
    console.error("API Error - Save Temp Document:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save PDF changes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
