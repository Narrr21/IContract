import { NextRequest, NextResponse } from "next/server";

const PDFFILLER_CONFIG = {
  apiUrl: "https://api.pdffiller.com/v2",
  accessToken: process.env.PDFFILLER_ACCESS_TOKEN,
};

// Download completed document from PDFfiller
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Download document from PDFfiller
    const downloadResponse = await fetch(
      `${PDFFILLER_CONFIG.apiUrl}/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${PDFFILLER_CONFIG.accessToken}`,
        },
      }
    );

    if (!downloadResponse.ok) {
      throw new Error(`PDFfiller download failed: ${downloadResponse.status}`);
    }

    const pdfBuffer = await downloadResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="completed-document-${documentId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      {
        error: "Failed to download from PDFfiller",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
