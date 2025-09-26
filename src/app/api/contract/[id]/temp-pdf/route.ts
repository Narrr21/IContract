import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GET - GET /api/contract/[id]/temp-pdf
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

    console.log(`📄 Fetching temporary PDF for contract ${contractId}`);

    // Construct path to temporary PDF file
    const tempPdfPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}_temp.pdf`
    );

    // Check if temp file exists, fallback to original
    let pdfPath = tempPdfPath;
    if (!fs.existsSync(tempPdfPath)) {
      console.log(`⚠️ Temp PDF not found, falling back to original`);
      pdfPath = path.join(
        process.cwd(),
        "public",
        "contract",
        `${contractId}.pdf`
      );

      if (!fs.existsSync(pdfPath)) {
        console.log(`❌ No PDF file found for contract ${contractId}`);
        return NextResponse.json(
          { success: false, error: "Contract PDF not found" },
          { status: 404 }
        );
      }
    }

    // Read the PDF file
    const fileBuffer = fs.readFileSync(pdfPath);

    // Return the PDF file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `inline; filename="contract-${contractId}-temp.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate", // No caching for temp files
      },
    });
  } catch (error) {
    console.error("API Error - Fetch Temp Contract PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch temporary contract PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
