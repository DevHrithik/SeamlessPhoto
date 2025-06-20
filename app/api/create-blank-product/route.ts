import { NextRequest, NextResponse } from "next/server";
import { createBlankProduct } from "@/configs/AiModel";

export async function POST(req: NextRequest) {
  try {
    console.log("🏭 [Create Blank Product API] Route accessed");
    
    const body = await req.json();
    const { originalImageUrl, styleDescription, productDescription, referenceImageUrl, userId } = body;

    console.log("🔍 [Create Blank Product API] Processing request:", {
      originalImageUrl: originalImageUrl ? "✅ Provided" : "❌ Missing",
      styleDescription: styleDescription ? "✅ Provided" : "❌ Missing",
      productDescription: productDescription ? "✅ Provided" : "❌ Not provided",
      referenceImageUrl: referenceImageUrl ? "✅ Provided" : "❌ Not provided",
      userId: userId || "anonymous"
    });

    // Validate required fields
    if (!originalImageUrl) {
      return NextResponse.json(
        { error: "Original image URL is required" },
        { status: 400 }
      );
    }

    if (!styleDescription) {
      return NextResponse.json(
        { error: "Style description is required" },
        { status: 400 }
      );
    }

    // Create blank product with GPT Image 1 (multi-modal)
    console.log("🔄 [Create Blank Product API] Starting blank product creation...");
    const result = await createBlankProduct(originalImageUrl, styleDescription, productDescription, referenceImageUrl);

    if (!result.success) {
      console.error("❌ [Create Blank Product API] Blank product creation failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Blank product creation failed" },
        { status: 500 }
      );
    }

    console.log("✅ [Create Blank Product API] Blank product creation completed successfully");

    return NextResponse.json({
      success: true,
      blankProductUrl: result.blankProductUrl,
      analysis: result.originalAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ [Create Blank Product API] Unexpected error:", error);
    
    return NextResponse.json(
      { error: `Blank product creation failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🔍 [Create Blank Product API] GET request received - route is working");
  return NextResponse.json({ 
    message: "Create Blank Product API is working", 
    timestamp: new Date().toISOString() 
  });
} 