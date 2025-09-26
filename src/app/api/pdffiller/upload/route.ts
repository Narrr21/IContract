import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// Simplified upload for demonstration
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // For demo purposes, save the file locally
    // In production, you would upload to PDFfiller API
    const filename = `pdffiller-${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), "public", "pdffiller", filename);

    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      // Create directory if it doesn't exist
      const { mkdir } = await import("fs/promises");
      const { dirname } = await import("path");
      await mkdir(dirname(filepath), { recursive: true });
      await writeFile(filepath, buffer);
    }

    // Mock successful response
    const mockDocumentId = `doc-${Date.now()}`;

    return NextResponse.json({
      success: true,
      documentId: mockDocumentId,
      documentUrl: `/pdffiller/${filename}`,
      editUrl: `https://www.pdffiller.com/en/project/embedded.htm?demo=true`,
      message: "File prepared for PDFfiller (Demo Mode)",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get PDFfiller authentication URL (Demo)
export async function GET() {
  try {
    return NextResponse.json({
      authUrl: "https://www.pdffiller.com/en/categories/embedded.htm",
      message: "Demo mode - redirecting to PDFfiller embed page",
    });
  } catch (error) {
    console.error("Auth URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}
