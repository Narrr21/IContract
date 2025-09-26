import { NextRequest, NextResponse } from "next/server";
import { generateContractPDF } from "@/lib/services/contractPdfService";

// Helper function to convert date strings back to Date objects
function convertDateFields(data: any, contractType: string): any {
  const processedData = { ...data };
  
  if (contractType === 'partnership') {
    if (processedData.tanggalMulai && typeof processedData.tanggalMulai === 'string') {
      processedData.tanggalMulai = new Date(processedData.tanggalMulai);
    }
  } else if (contractType === 'employment') {
    if (processedData.tanggalMulai && typeof processedData.tanggalMulai === 'string') {
      processedData.tanggalMulai = new Date(processedData.tanggalMulai);
    }
    if (processedData.tanggalSelesai && typeof processedData.tanggalSelesai === 'string') {
      processedData.tanggalSelesai = new Date(processedData.tanggalSelesai);
    }
    if (processedData.tanggalLahir && typeof processedData.tanggalLahir === 'string') {
      processedData.tanggalLahir = new Date(processedData.tanggalLahir);
    }
    if (processedData.tanggalMulaiKerja && typeof processedData.tanggalMulaiKerja === 'string') {
      processedData.tanggalMulaiKerja = new Date(processedData.tanggalMulaiKerja);
    }
  }
  
  return processedData;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractType, contractData } = body;

    if (!contractType || !contractData) {
      return NextResponse.json(
        { error: 'Contract type and data are required' },
        { status: 400 }
      );
    }

    // Validate contract type
    if (contractType !== 'partnership' && contractType !== 'employment') {
      return NextResponse.json(
        { error: 'Invalid contract type. Must be "partnership" or "employment"' },
        { status: 400 }
      );
    }

    // Convert date strings back to Date objects if needed
    const processedData = convertDateFields(contractData, contractType);
    
    // Generate contract PDF
    const pdfBuffer = generateContractPDF(contractType, processedData);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Contract generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate contract',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}