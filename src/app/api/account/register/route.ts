import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { firstname, lastname, email, password, confirmpassword, role } =
      await req.json();

    console.log("📝 Registration attempt:", { firstname, lastname, email, role }); // Debug log

    // Validation
    if (!firstname || !lastname || !email || !password || !confirmpassword || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmpassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Map role to UserCategory
    const roleMapping: { [key: string]: UserCategory } = {
      admin: UserCategory.ADMIN,
      hr: UserCategory.HR,
      legal: UserCategory.LEGAL,
      management: UserCategory.MANAGEMENT,
    };

    const userCategory = roleMapping[role];
    if (!userCategory) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    console.log("🔐 Hashing password..."); // Debug log
    const hashedPassword = await bcrypt.hash(password, 10);

    const profilepath = "/profiles/default.png";

    console.log("💾 Creating user in database..."); // Debug log
    const user = await prisma.user.create({
      data: {
        email,
        firstname,
        lastname,
        category: userCategory,
        password: hashedPassword,
        profilepath,
      },
    });

    console.log("✅ User created successfully:", user.id); // Debug log

    // Return success response without auto-login
    return NextResponse.json({
      message: "Registration successful",
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        category: user.category,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
