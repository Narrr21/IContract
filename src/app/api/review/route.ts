import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/services/aiService";

export async function POST(req: NextRequest) {
  try {
    const { contractContent, contractType, analysisType } = await req.json();
    
    if (!contractContent || contractContent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract content is required and cannot be empty' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing ${contractType || 'general'} contract...`);
    console.log(`📄 Content length: ${contractContent.length} characters`);
    
    let result;
    
    // Different analysis types
    switch (analysisType) {
      case 'extract':
        result = await aiService.extractContractInfo(contractContent);
        break;
      case 'review':
      default:
        result = await aiService.reviewContract(contractContent, contractType);
        break;
    }
    
    if (!result.success) {
      console.error('❌ AI analysis failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to analyze contract' },
        { status: 500 }
      );
    }

    console.log('✅ Contract analysis completed successfully');

    return NextResponse.json({
      success: true,
      analysis: result.content,
      analysisType: analysisType || 'review',
      contractType: contractType || 'general',
      usage: result.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Contract review API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during contract analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check AI service status
export async function GET(req: NextRequest) {
  try {
    const hasApiKey = !!process.env.OPENROUTER_API_KEY;
    const model = process.env.AI_MODEL || 'x-ai/grok-4-fast:free';
    
    return NextResponse.json({
      success: true,
      status: 'AI Review Service is running',
      configured: hasApiKey,
      model: hasApiKey ? model : 'Not configured',
      endpoints: {
        review: 'POST /api/review - Analyze contract content',
        extract: 'POST /api/review (with analysisType: "extract") - Extract key information'
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Service status check failed' },
      { status: 500 }
    );
  }
}