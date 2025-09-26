import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.get('auth-token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        category: true,
        profilepath: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Format user data for navbar
    const userData = {
      firstName: user.firstname || '',
      lastName: user.lastname || '',
      email: user.email,
      avatarUrl: user.profilepath || `https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&background=random`,
      initials: `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase(),
      category: user.category,
      id: user.id
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error("Account fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}