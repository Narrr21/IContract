import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File;
    const userId = formData.get("userId") as string;

    if (!photo) {
      return NextResponse.json(
        { error: "No photo file provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = photo.name.split(".").pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert File to Buffer and save
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const photoUrl = `/uploads/profiles/${fileName}`;
    
    // Uncomment below for real database implementation:
    /*
    const { prisma } = await import("@/lib/db");
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { 
        profilepath: photoUrl,
        updatedAt: new Date()
      }
    });
    */

    return NextResponse.json({
      success: true,
      photoUrl: photoUrl,
      message: "Profile photo updated successfully"
    });

  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}