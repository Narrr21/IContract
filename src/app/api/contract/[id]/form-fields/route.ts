import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const formFieldsPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}_form_fields.json`
    );

    try {
      const data = await fs.readFile(formFieldsPath, "utf8");
      const formFields = JSON.parse(data);
      return NextResponse.json(formFields);
    } catch (error) {
      // File doesn't exist, return empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Failed to load form fields:", error);
    return NextResponse.json(
      { error: "Failed to load form fields" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const { fields } = await request.json();

    const formFieldsPath = path.join(
      process.cwd(),
      "public",
      "contract",
      `${contractId}_form_fields.json`
    );

    // Ensure directory exists
    const dir = path.dirname(formFieldsPath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    // Save form fields
    await fs.writeFile(formFieldsPath, JSON.stringify(fields, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save form fields:", error);
    return NextResponse.json(
      { error: "Failed to save form fields" },
      { status: 500 }
    );
  }
}
