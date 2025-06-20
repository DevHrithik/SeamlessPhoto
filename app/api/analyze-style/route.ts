import { NextRequest, NextResponse } from "next/server";
import { analyzeStyleReference } from "@/configs/AiModel";

export async function POST(req: NextRequest) {
  try {
    console.log("🎨 [Analyze Style API] Route accessed");
    
    const body = await req.json();
    const { styleInput, referenceImageUrl, userId } = body;

    console.log("🔍 [Analyze Style API] Processing request:", {
      styleInput: styleInput ? "✅ Text provided" : "❌ No text",
      referenceImageUrl: referenceImageUrl ? "✅ Image provided" : "❌ No image",
      userId: userId || "anonymous"
    });

    // At least one input method should be provided
    if (!styleInput && !referenceImageUrl) {
      console.log("⚠️ [Analyze Style API] No style input provided, using default");
    }

    // Analyze style with OpenAI
    console.log("🔄 [Analyze Style API] Starting style analysis...");
    const result = await analyzeStyleReference(styleInput, referenceImageUrl);

    if (!result.success) {
      console.error("❌ [Analyze Style API] Style analysis failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Style analysis failed" },
        { status: 500 }
      );
    }

    console.log("✅ [Analyze Style API] Style analysis completed successfully");

    return NextResponse.json({
      success: true,
      styleDescription: result.styleDescription,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ [Analyze Style API] Unexpected error:", error);
    
    return NextResponse.json(
      { error: `Style analysis failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🔍 [Analyze Style API] GET request received - route is working");
  return NextResponse.json({ 
    message: "Analyze Style API is working", 
    timestamp: new Date().toISOString() 
  });
} 