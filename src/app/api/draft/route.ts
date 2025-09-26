import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/services/aiService";

export async function POST(req: NextRequest) {
  try {
    const { contractType, requirements, assistanceType, additionalData } = await req.json();
    
    if (!contractType || !requirements) {
      return NextResponse.json(
        { success: false, error: 'Contract type and requirements are required' },
        { status: 400 }
      );
    }

    console.log(`✍️ Providing ${assistanceType || 'general'} assistance for ${contractType} contract`);
    
    let result;
    
    switch (assistanceType) {
      case 'clauses':
        if (!additionalData?.specificNeeds || !Array.isArray(additionalData.specificNeeds)) {
          return NextResponse.json(
            { success: false, error: 'specificNeeds array is required for clause suggestions' },
            { status: 400 }
          );
        }
        result = await aiService.suggestClauses(contractType, additionalData.specificNeeds);
        break;
        
      case 'compare':
        if (!additionalData?.contract1 || !additionalData?.contract2) {
          return NextResponse.json(
            { success: false, error: 'Two contracts are required for comparison' },
            { status: 400 }
          );
        }
        result = await aiService.compareContracts(
          additionalData.contract1, 
          additionalData.contract2, 
          additionalData.comparisonContext
        );
        break;
        
      case 'draft':
      default:
        result = await aiService.assistContractDrafting(contractType, requirements);
        break;
    
      case 'extract':
        result = await aiService.extractContractData(requirements, contractType);
        break;
    }
    
    if (!result.success) {
      console.error('❌ AI drafting assistance failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to provide drafting assistance' },
        { status: 500 }
      );
    }

    console.log('✅ Drafting assistance provided successfully');
    console.log(result.content);

    return NextResponse.json({
      success: true,
      contractType,
      assistanceType: assistanceType || 'draft',
      assistance: result.content,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Drafting assistance API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during drafting assistance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for drafting templates and examples
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractType = searchParams.get('type');
    
    const templates = {
      partnership: {
        name: 'Partnership Agreement',
        sections: ['Party Information', 'Purpose', 'Obligations', 'Financial Terms', 'Duration', 'Termination'],
        commonClauses: ['IP Rights', 'Confidentiality', 'Dispute Resolution', 'Force Majeure']
      },
      employment: {
        name: 'Employment Contract',
        sections: ['Employee Details', 'Job Description', 'Compensation', 'Benefits', 'Termination'],
        commonClauses: ['Non-Compete', 'Confidentiality', 'IP Assignment', 'Performance Review']
      },
      services: {
        name: 'Service Agreement',
        sections: ['Scope of Work', 'Deliverables', 'Timeline', 'Payment Terms', 'Responsibilities'],
        commonClauses: ['SLA', 'Liability', 'Data Protection', 'Change Management']
      }
    };
    
    if (contractType && templates[contractType as keyof typeof templates]) {
      return NextResponse.json({
        success: true,
        contractType,
        template: templates[contractType as keyof typeof templates],
        availableAssistance: ['draft', 'clauses', 'compare']
      });
    }
    
    return NextResponse.json({
      success: true,
      availableTypes: Object.keys(templates),
      templates: templates,
      endpoints: {
        draft: 'POST /api/drafting (assistanceType: "draft")',
        clauses: 'POST /api/drafting (assistanceType: "clauses")',
        compare: 'POST /api/drafting (assistanceType: "compare")'
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get drafting information' },
      { status: 500 }
    );
  }
}