import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    console.log("📁 File received:", file.name, file.type, file.size);

    // Check if Replicate API key is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not found in environment variables");
      return NextResponse.json({ 
        error: "Replicate API key not configured. Please add REPLICATE_API_TOKEN to your environment variables." 
      }, { status: 500 });
    }

    console.log("🔄 Removing background with Replicate 851-labs/background-remover...");

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Convert file to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Use Replicate 851-labs/background-remover model
    const output = await replicate.run(
      "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      {
        input: {
          image: dataUrl
        }
      }
    ) as unknown as string;

    console.log("📡 Replicate API response received");

    if (!output) {
      throw new Error("No output received from Replicate API");
    }

    // Fetch the result image from the output URL
    const imageResponse = await fetch(output);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch result image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const resultBuffer = await imageResponse.arrayBuffer();
    console.log("📦 Image buffer size:", resultBuffer.byteLength);

    if (resultBuffer.byteLength === 0) {
      throw new Error("Received empty image buffer");
    }

    console.log("✅ Background removal successful");
    
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=transparent-logo.png",
      },
    });

  } catch (error: any) {
    console.error("💥 Background removal error:", error);
    
    let errorMessage = error.message || "Background removal failed";
    
    // Handle specific Replicate errors
    if (error.message?.includes("401")) {
      errorMessage = "Replicate API authentication failed. Please check your API token.";
    } else if (error.message?.includes("402")) {
      errorMessage = "Replicate API quota exceeded. Please check your billing.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 