import { NextRequest, NextResponse } from "next/server";
import { addLogoToProduct } from "@/configs/AiModel";

export async function POST(req: NextRequest) {
  try {
    console.log("🎯 [Add Logo API] Route accessed");
    
    const body = await req.json();
    const { blankProductUrl, logoImageUrl, outputSize, referenceImageUrl, userId } = body;

    console.log("🔍 [Add Logo API] Processing request:", {
      blankProductUrl: blankProductUrl ? "✅ Provided" : "❌ Missing",
      logoImageUrl: logoImageUrl ? "✅ Provided" : "❌ Missing",
      outputSize: outputSize ? `✅ ${outputSize}` : "❌ Not specified",
      referenceImageUrl: referenceImageUrl ? "✅ Provided" : "❌ Missing",
      userId: userId || "anonymous"
    });

    // Validate required fields
    if (!blankProductUrl || !logoImageUrl) {
      return NextResponse.json(
        { error: "Both blank product URL and logo image URL are required" },
        { status: 400 }
      );
    }

    // Add logo to product with FLUX
    console.log("🔄 [Add Logo API] Starting logo placement...");
    const result = await addLogoToProduct(blankProductUrl, logoImageUrl, outputSize, referenceImageUrl);

    if (!result.success) {
      console.error("❌ [Add Logo API] Logo placement failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Logo placement failed" },
        { status: 500 }
      );
    }

    console.log("✅ [Add Logo API] Logo placement completed successfully");

    return NextResponse.json({
      success: true,
      finalImageUrl: result.enhancedImageUrl,
      analysis: result.originalAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ [Add Logo API] Unexpected error:", error);
    
    return NextResponse.json(
      { error: `Logo placement failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🔍 [Add Logo API] GET request received - route is working");
  return NextResponse.json({ 
    message: "Add Logo API is working", 
    timestamp: new Date().toISOString() 
  });
} 