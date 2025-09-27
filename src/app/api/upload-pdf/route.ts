import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `uploaded-${timestamp}-${file.name}`;

    // Save to public directory (same location as sample-kontrak.pdf)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(process.cwd(), "public/contract", fileName);

    await writeFile(filePath, buffer);

    console.log(`📁 File saved: ${fileName}`);

    return NextResponse.json({
      success: true,
      fileName: fileName, // existing field (backward compatibility)
      uploadedFileName: fileName, // explicit field used by /api/contract
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
