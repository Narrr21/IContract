import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { createContractWithDetails } from '@/lib/helper';

const prisma = new PrismaClient();

// Helper function to convert BigInt values to strings for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }

  return obj;
}

// GET - GET /api/contract?id=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractId = parseInt(searchParams.get("id") || "0");

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: "Contract ID is required" },
        { status: 400 }
      );
    }

    console.log(`📖 Fetching contract ${contractId}`);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        partnershipDetails: true,
        employmentDetails: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contract: serializeBigInt(contract),
    });
  } catch (error) {
    console.error("API Error - Fetch Contract:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// CREATE - POST /api/contract
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    console.log('📝 Creating contract with data:', {
      namakontrak: data.namakontrak,
      nomorkontrak: data.nomorkontrak,
      judul: data.judul,
      nominal: typeof data.nominal === 'number' ? data.nominal : 'invalid',
      makskompensasi: typeof data.makskompensasi === 'number' ? data.makskompensasi : 'invalid',
      type: data.type
    });
    
    // Validate required fields
    if (!data.namakontrak || !data.nomorkontrak || !data.judul) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: namakontrak, nomorkontrak, judul',
          console: 'Received data: ' + JSON.stringify(data)
        },
        { status: 400 }
      );
    }

    // Use the helper function - all the sync logic is handled inside
    const contract = await createContractWithDetails(data);
    
    return NextResponse.json({
      success: true,
      message: "Contract created successfully",
    });
  } catch (error) {
    console.error("API Error - Create Contract:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// UPDATE - PUT /api/contract
export async function PUT(req: NextRequest) {
  try {
    const {
      contractId,
      contractType,
      partnershipDetails,
      employmentDetails,
      ...updateData
    } = await req.json();

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: "Contract ID is required" },
        { status: 400 }
      );
    }

    console.log(`📝 Updating contract ${contractId} with data:`, updateData);

    // Update basic contract
    await prisma.contract.update({
      where: { id: contractId },
      data: updateData,
    });

    // Update or create type-specific details
    if (contractType === "partnership" && partnershipDetails) {
      await prisma.partnership.upsert({
        where: { kontrakid: contractId },
        update: partnershipDetails,
        create: {
          kontrakid: contractId,
          ...partnershipDetails,
        },
      });
    } else if (contractType === "employment" && employmentDetails) {
      await prisma.employment.upsert({
        where: { kontrakid: contractId },
        update: employmentDetails,
        create: {
          kontrakid: contractId,
          ...employmentDetails,
        },
      });
    }

    // Fetch the updated contract with details
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        partnershipDetails: true,
        employmentDetails: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contract updated successfully",
      contract: serializeBigInt(contract),
    });
  } catch (error) {
    console.error("API Error - Update Contract:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - DELETE /api/contract
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractId = parseInt(searchParams.get("id") || "0");

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: "Contract ID is required" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting contract ${contractId}`);

    // Delete the contract (cascade will handle related records)
    await prisma.contract.delete({
      where: { id: contractId },
    });

    return NextResponse.json({
      success: true,
      message: "Contract deleted successfully",
    });
  } catch (error) {
    console.error("API Error - Delete Contract:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
