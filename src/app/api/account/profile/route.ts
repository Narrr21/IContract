import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return mock data directly
    // In production, this would fetch from database with authentication
    
    const mockUser = {
      id: 1,
      email: "ahmad.wijaya@company.com",
      firstname: "Ahmad",
      lastname: "Wijaya",
      category: "ADMIN",
      profilepath: "/images/default-avatar.png",
      createdAt: new Date('2020-01-15'),
      updatedAt: new Date()
    };

    // Uncomment below for real database implementation:
    /*
    const { prisma } = await import("@/lib/db");
    const userId = 1; // Get from authenticated session
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    */

    const user = mockUser;

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