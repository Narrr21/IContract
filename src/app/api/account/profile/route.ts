import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // Verify and decode the JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
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
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create initials from first and last name
    const initials = `${user.firstname?.charAt(0) || ''}${user.lastname?.charAt(0) || ''}`.toUpperCase();

    // Transform data to match UserProfile interface
    const userProfile = {
      id: user.id,
      firstName: user.firstname || '',
      lastName: user.lastname || '',
      email: user.email,
      category: user.category,
      profilePath: user.profilepath || '/images/default-avatar.png',
      employeeId: `EMP${user.id.toString().padStart(3, '0')}`,
      phoneNumber: '+62 812-3456-7890', // Mock data - add to schema if needed
      address: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190', // Mock data
      birthDate: '1990-05-15', // Mock data - add to schema if needed
      joinDate: user.createdAt.toISOString().split('T')[0],
      department: 'Information Technology', // Mock data - add to schema if needed
      position: getCategoryPosition(user.category), // Derive from category
      initials: initials
    };

    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}

function getCategoryPosition(category: string): string {
  switch (category) {
    case 'MANAGEMENT':
      return 'Manager';
    case 'ADMIN':
      return 'System Administrator';
    case 'HR':
      return 'HR Specialist';
    case 'LEGAL':
      return 'Legal Counsel';
    default:
      return 'Employee';
  }
}