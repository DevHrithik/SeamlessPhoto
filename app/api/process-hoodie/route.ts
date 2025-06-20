import { NextRequest, NextResponse } from "next/server";
import { processHoodieLogo } from "@/configs/AiModel";

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 [Process Hoodie API] Route accessed");
    
    const body = await req.json();
    const { hoodieImageUrl, logoImageUrl, userId } = body;

    console.log("🔍 [Process Hoodie API] Processing request:", {
      hoodieImageUrl: hoodieImageUrl ? "✅ Provided" : "❌ Missing",
      logoImageUrl: logoImageUrl ? "✅ Provided" : "❌ Missing",
      userId: userId || "anonymous"
    });

    // Validate required fields
    if (!hoodieImageUrl || !logoImageUrl) {
      return NextResponse.json(
        { error: "Both hoodie image URL and logo image URL are required" },
        { status: 400 }
      );
    }

    // Process images with OpenAI
    console.log("🔄 [Process Hoodie API] Starting AI analysis...");
    const result = await processHoodieLogo(hoodieImageUrl, logoImageUrl);

    if (!result.success) {
      console.error("❌ [Process Hoodie API] AI processing failed:", result.error);
      return NextResponse.json(
        { error: result.error || "AI processing failed" },
        { status: 500 }
      );
    }

    console.log("✅ [Process Hoodie API] AI analysis completed successfully");

    return NextResponse.json({
      success: true,
      enhancedImageUrl: result.enhancedImageUrl,
      analysis: result.originalAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ [Process Hoodie API] Unexpected error:", error);
    
    return NextResponse.json(
      { error: `Processing failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🔍 [Process Hoodie API] GET request received - route is working");
  return NextResponse.json({ 
    message: "Process Hoodie API is working", 
    timestamp: new Date().toISOString() 
  });
} 