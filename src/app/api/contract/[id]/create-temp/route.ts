import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// POST - Create temporary document from original PDF
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

    console.log(`📄 Creating temporary document for contract ${contractId}`);

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

    // Check if original file exists
    if (!fs.existsSync(originalPdfPath)) {
      console.log(`❌ Original PDF file not found at: ${originalPdfPath}`);
      return NextResponse.json(
        { success: false, error: "Original contract PDF not found" },
        { status: 404 }
      );
    }

    // Copy original to temporary file
    fs.copyFileSync(originalPdfPath, tempPdfPath);

    console.log(`✅ Temporary document created: ${tempPdfPath}`);

    return NextResponse.json({
      success: true,
      message: "Temporary document created successfully",
      tempPath: `contract/${contractId}_temp.pdf`,
    });
  } catch (error) {
    console.error("API Error - Create Temp Document:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create temporary document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
