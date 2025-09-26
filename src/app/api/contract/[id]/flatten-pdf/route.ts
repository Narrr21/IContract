import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;
    const formData = await request.formData();

    const flattenedPage = formData.get("flattenedPage") as File;
    const page = formData.get("page") as string;
    const fieldsData = formData.get("fields") as string;

    if (!flattenedPage || !page) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Save flattened page image
    const buffer = Buffer.from(await flattenedPage.arrayBuffer());
    const imagePath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}_page_${page}_flattened.png`
    );

    // Ensure directory exists
    const dir = path.dirname(imagePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(imagePath, buffer);

    // Save fields data if provided
    if (fieldsData) {
      const fields = JSON.parse(fieldsData);
      const fieldsPath = path.join(
        process.cwd(),
        "public",
        "contract",
        `${contractId}_form_fields.json`
      );
      await fs.writeFile(fieldsPath, JSON.stringify(fields, null, 2));
    }

    console.log(`✅ Flattened page ${page} saved for contract ${contractId}`);

    return NextResponse.json({
      success: true,
      imagePath: `/contract/${contractId}_page_${page}_flattened.png`,
    });
  } catch (error) {
    console.error("Failed to flatten PDF:", error);
    return NextResponse.json(
      { error: "Failed to flatten PDF" },
      { status: 500 }
    );
  }
}
