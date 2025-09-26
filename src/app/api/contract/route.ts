import { NextRequest, NextResponse } from "next/server";
import { createContractWithDetails, updateContractWithDetails, deleteContractWithDetails } from "@/lib/contractHelpers";

// CREATE - POST /api/contracts
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    console.log('📝 Creating contract with data:', data);
    
    // Use the helper function - all the sync logic is handled inside
    const contract = await createContractWithDetails(data);
    
    return NextResponse.json({
      success: true,
      message: 'Contract created successfully',
      contract: contract
    });

  } catch (error) {
    console.error('API Error - Create Contract:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create contract',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// UPDATE - PUT /api/contracts
export async function PUT(req: NextRequest) {
  try {
    const { contractId, ...updateData } = await req.json();
    
    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating contract ${contractId} with data:`, updateData);
    
    // Use the helper function - sync logic handled automatically
    const contract = await updateContractWithDetails(contractId, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Contract updated successfully',
      contract: contract
    });

  } catch (error) {
    console.error('API Error - Update Contract:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update contract',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - DELETE /api/contracts
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractId = parseInt(searchParams.get('id') || '0');
    
    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting contract ${contractId}`);
    
    await deleteContractWithDetails(contractId);
    
    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('API Error - Delete Contract:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete contract',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}