import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const type = searchParams.get('type')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const whereClause: any = {
      AND: []
    };

    // Search filter - use your actual field names
    if (search) {
      whereClause.AND.push({
        OR: [
          { namakontrak: { contains: search, mode: 'insensitive' } },
          { counterparty: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Status filter
    if (status.length > 0) {
      whereClause.AND.push({
        status: { in: status }
      });
    }

    // Type filter
    if (type.length > 0) {
      whereClause.AND.push({
        type: { in: type }
      });
    }

    // If no filters, remove empty AND array
    if (whereClause.AND.length === 0) {
      delete whereClause.AND;
    }

    // Build orderBy clause - use your actual field names
    const orderBy: any = {};
    
    if (sortBy === 'jatuhtempo') {
      orderBy.jatuhtempo = sortOrder;
    } else if (sortBy === 'namakontrak') {
      orderBy.namakontrak = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Execute queries
    const [contracts, totalCount] = await Promise.all([
      prisma.contract.findMany({
        where: whereClause,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contract.count({ where: whereClause })
    ]);

    // Transform data to match your display format
    const transformedContracts = contracts.map(contract => ({
      id: contract.id,
      name: contract.namakontrak,           // "Nama dokumen"
      status: contract.status,              // "Status" 
      type: contract.type,
      counterParty: contract.counterparty,  // "Counterparty"
      expiryDate: contract.jatuhtempo       // "Jatuh tempo"
        ? new Date(contract.jatuhtempo).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
          })
        : 'N/A',
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString()
    }));

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      contracts: transformedContracts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      },
      filters: {
        search,
        status,
        type,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Contracts API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch contracts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get available filter options
export async function OPTIONS() {
  try {
    const [statusOptions, typeOptions] = await Promise.all([
      prisma.contract.findMany({
        select: { status: true },
        distinct: ['status']
      }),
      prisma.contract.findMany({
        select: { type: true },
        distinct: ['type']
      })
    ]);

    return NextResponse.json({
      statusOptions: statusOptions.map(item => item.status),
      typeOptions: typeOptions.map(item => item.type),
      sortOptions: [
        { value: 'namakontrak', label: 'Nama Dokumen' },
        { value: 'status', label: 'Status' },
        { value: 'type', label: 'Type' },
        { value: 'jatuhtempo', label: 'Jatuh Tempo' },
        { value: 'createdAt', label: 'Tanggal Dibuat' }
      ]
    });

  } catch (error) {
    console.error('Filter options error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}