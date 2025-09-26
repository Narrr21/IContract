import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GET - GET /api/contract/[id]/pdf
export async function GET(
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

    console.log(`📄 Fetching PDF for contract ${contractId}`);

    // Construct path to PDF file in public/contract directory
    const pdfPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}.pdf`
    );

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`❌ PDF file not found at: ${pdfPath}`);
      return NextResponse.json(
        { success: false, error: "Contract PDF not found" },
        { status: 404 }
      );
    }

    // Read the PDF file
    const fileBuffer = fs.readFileSync(pdfPath);

    // Return the PDF file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `inline; filename="contract-${contractId}.pdf"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("API Error - Fetch Contract PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contract PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
