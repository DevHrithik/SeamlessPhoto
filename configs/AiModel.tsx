/*
 * Hybrid AI Model Integration for E-Commerce Product Photography Workflow
 *
 * NEW HYBRID APPROACH (Recommended):
 * Step 1: GPT-4o Vision - Analyze original product image
 * Step 2: GPT Image 1 - Generate high-quality blank product
 * Step 3: FLUX Kontext Pro - Place logo with specialized multi-image editing
 * 
 * LEGACY: OpenAI (GPT-4o + DALL-E 3) - kept for backward compatibility
 * 
 * Benefits of Hybrid Approach:
 * - GPT-4o: Superior image analysis and understanding
 * - GPT Image 1: High quality blank product generation with reliable output
 * - FLUX Kontext Pro: Specialized for precise logo placement and multi-image editing
 * - Better preservation of original garment characteristics
 * - More accurate logo placement and sizing
 */

import Replicate from "replicate";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./Firebaseconfig";

interface OpenAIError extends Error {
  response?: {
    status?: number;
    data?: any;
  };
}

interface ImageProcessingResult {
  success: boolean;
  enhancedImageUrl?: string;
  blankProductUrl?: string;
  originalAnalysis?: string;
  error?: string;
}

interface StyleAnalysisResult {
  success: boolean;
  styleDescription?: string;
  error?: string;
}

// Keep the existing chat session functionality for other features
let OpenAI: any;
try {
  OpenAI = require("openai").default || require("openai");
} catch (error) {
  console.warn("OpenAI package not found. Please install it with: npm install openai");
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const generationConfig = {
  model: "gpt-4o",
  temperature: 0.7,
  max_tokens: 1500,
};

// NEW: Step 2 - Analyze style reference (text or image)
export async function analyzeStyleReference(
  styleInput: string | null, 
  referenceImageUrl?: string
): Promise<StyleAnalysisResult> {
  try {
    console.log("🎨 Starting style analysis...");

    if (!OpenAI) {
      throw new Error("OpenAI package is not installed. Please run: npm install openai");
    }

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      timeout: 60000,
      maxRetries: 3,
    });

    let messages: ChatMessage[];

    if (referenceImageUrl) {
      // Analyze reference image for professional photography style
      messages = [
        {
          role: "system",
          content: "You are an expert in professional product photography. Analyze the reference image and focus ONLY on lighting techniques and background style that create clean, professional results. COMPLETELY IGNORE the garment positioning (flat-lay, hanging, worn, etc.), color, type, or specific details. Only describe lighting setup and background techniques that would create a clean, wrinkle-free, professional presentation. Provide a concise description (under 150 words) focusing on lighting and background only."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe ONLY the lighting techniques and background style in this image. DO NOT mention how the garment is positioned (flat-lay, hanging, etc.), garment color, type, or any specific garment details. Focus only on lighting setup and background techniques that create professional, clean results."
            },
            {
              type: "image_url",
              image_url: { url: referenceImageUrl }
            }
          ] as any
        }
      ];
    } else if (styleInput) {
      // Process text description into professional photography terms
      messages = [
        {
          role: "system",
          content: "You are an expert in product photography. Convert the user's style description into specific professional photography specifications (under 200 words) including lighting setup, background choice, and presentation style suitable for e-commerce."
        },
        {
          role: "user",
          content: `Convert this style description into professional product photography specifications: "${styleInput}"`
        }
      ];
    } else {
      // Default professional style
      return {
        success: true,
        styleDescription: "Professional studio lighting with soft, even illumination and clean white background for crisp, wrinkle-free presentation"
      };
    }

    const response = await openai.chat.completions.create({
      ...generationConfig,
      messages: messages as any,
    });

    const styleDescription = response.choices[0].message.content;

    console.log("✅ Style analysis completed");

    // Truncate the style description to ensure it's not too long
    const truncatedStyleDescription = truncateText(styleDescription || "", 400);

    return {
      success: true,
      styleDescription: truncatedStyleDescription || "Professional e-commerce photography style"
    };

  } catch (error: unknown) {
    const err = error as any;
    console.error("❌ Style analysis error:", err.message);
    
    return {
      success: false,
      error: `Style analysis failed: ${err.message || 'Unknown error'}`
    };
  }
}

// Helper function to truncate text intelligently
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Try to truncate at sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  // Fallback to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

// NEW: Step 3 - Create blank product version using FLUX 1.1 Pro
export async function createBlankProduct(
  originalImageUrl: string,
  styleDescription: string,
  productDescription?: string,
  referenceImageUrl?: string
): Promise<ImageProcessingResult> {
  // Declare variables in broader scope for fallback access
  let garmentInfo: string = "";
  let finalPrompt: string = "";
  
  try {
    console.log("🏭 Creating blank product with GPT Image 1...");

    if (!OpenAI) {
      throw new Error("OpenAI package is not installed");
    }

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      timeout: 90000,
      maxRetries: 3,
    });

    // Use simplified prompt structure as requested
    finalPrompt = `Create a studio quality photo of the [first image]. Create the final photo in the style of [reference image]. Remove design.`;
    
    // Add product description if provided (optional enhancement)
    if (productDescription && productDescription.trim()) {
      finalPrompt = `Create a studio quality photo of the [first image]. The attached photo is ${productDescription.trim()}. Create the final photo in the style of [reference image]. Remove design.`;
    }

    // Initialize Replicate for GPT Image 1
    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN,
    });

    console.log("🎨 Generating blank product with GPT Image 1...");
    console.log("🎨 Simplified prompt:", finalPrompt);
    console.log("🎨 Prompt length:", finalPrompt.length);
    console.log("🔑 API Key available:", !!(process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY));

    // Generate blank product with GPT Image 1 using multi-modal approach
    const inputImages = [originalImageUrl];
    if (referenceImageUrl) {
      inputImages.push(referenceImageUrl);
    }
    
    console.log("🖼️ Input images for GPT Image 1:", inputImages);
    
    const output = await replicate.run(
      "openai/gpt-image-1",
      {
        input: {
          prompt: finalPrompt,
          input_images: inputImages,
          openai_api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
          aspect_ratio: "1:1",
          number_of_images: 1
        }
      }
    );

    console.log("✅ GPT Image 1 processing completed");
    console.log("🔍 GPT Image 1 raw output:", JSON.stringify(output, null, 2));

    // Handle GPT Image 1 output - based on the example, it returns an object that can be iterated
    let generatedImageUrl: string | undefined;
    
    if (typeof output === 'string' && (output as string).startsWith('http')) {
      generatedImageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      // Handle array format
      const firstItem = output[0];
      console.log(`🔍 First array item:`, firstItem, `Type: ${typeof firstItem}`);
      
      if (typeof firstItem === 'string' && firstItem.startsWith('http')) {
        generatedImageUrl = firstItem;
      } else if (firstItem && typeof firstItem === 'object') {
        // Check if it's a ReadableStream (GPT Image 1 returns this format)
        if (firstItem instanceof ReadableStream) {
          console.log("📝 Converting ReadableStream to buffer...");
          
          // Convert stream to buffer
          const reader = firstItem.getReader();
          const chunks: Uint8Array[] = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          // Combine chunks into single buffer
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const buffer = new Uint8Array(totalLength);
          let offset = 0;
          
          for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
          }

          console.log("📤 Uploading GPT Image 1 result to Firebase...");
          
          // Upload to Firebase Storage
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          const fileName = `vidaify-images-videos/gpt-image-1-${timestamp}-${randomId}.png`;
          
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, buffer, {
            contentType: 'image/png',
          });
          
          generatedImageUrl = await getDownloadURL(storageRef);
          console.log("✅ GPT Image 1 image uploaded to Firebase:", generatedImageUrl);
        } else {
          // Check if it's an empty object
          const keys = Object.keys(firstItem);
          if (keys.length === 0) {
            throw new Error("GPT Image 1 returned empty object - generation likely failed or was rejected");
          }
          
          // Handle array of objects with URL property
          if ('url' in firstItem && typeof firstItem.url === 'string') {
            generatedImageUrl = firstItem.url;
          } else {
            // Try to find any property that looks like a URL
            const urlValue = Object.values(firstItem).find(val => 
              typeof val === 'string' && val.startsWith('http')
            );
            if (urlValue) {
              generatedImageUrl = urlValue as string;
            } else {
              throw new Error(`No valid URL found in object: ${JSON.stringify(firstItem)}`);
            }
          }
        }
      } else {
        throw new Error(`Invalid array item - expected string URL or object with URL, got: ${JSON.stringify(firstItem)}`);
      }
    } else if (output && typeof output === 'object') {
      // Handle object format - iterate through entries like in the example
      const entries = Object.entries(output);
      console.log(`🔍 Object entries:`, entries);
      
      if (entries.length === 0) {
        throw new Error("GPT_IMAGE_1_EMPTY_RESPONSE");
      }
      
      // Look for the first entry that contains a valid URL
      let foundUrl = false;
      for (const [key, value] of entries) {
        console.log(`🔍 Checking entry [${key}]:`, value, `Type: ${typeof value}`);
        
        if (typeof value === 'string' && value.startsWith('http')) {
          generatedImageUrl = value;
          foundUrl = true;
          break;
        } else if (value && typeof value === 'object' && 'url' in value) {
          generatedImageUrl = (value as any).url;
          foundUrl = true;
          break;
        }
      }
      
      if (!foundUrl) {
        throw new Error(`No valid URL found in object entries: ${JSON.stringify(output)}`);
      }
    } else {
      console.error("❌ Unexpected GPT Image 1 output format:", output);
      throw new Error(`GPT Image 1 returned unexpected format: ${JSON.stringify(output)}`);
    }

    if (!generatedImageUrl || typeof generatedImageUrl !== 'string' || !generatedImageUrl.startsWith('http')) {
      throw new Error(`Invalid image URL from GPT Image 1: ${generatedImageUrl || 'undefined'}`);
    }

    console.log("✅ Professional blank product generated:", generatedImageUrl);

    return {
      success: true,
      blankProductUrl: generatedImageUrl,
      originalAnalysis: `Created professional studio-quality blank product using GPT Image 1 with simplified prompt (original image + ${referenceImageUrl ? 'reference style image' : 'text-only prompt'})`,
    };

  } catch (error: unknown) {
    const err = error as any;
    console.error("❌ GPT Image 1 error:", err);
    console.error("❌ Error message:", err.message);
    

    
    let errorMessage: string;
    if (err.message?.includes("timeout")) {
      errorMessage = "GPT Image 1 generation took too long. Please try again.";
    } else if (err.message?.includes("rate limit") || err.message?.includes("429")) {
      errorMessage = "Too many requests to GPT Image 1. Please wait a moment and try again.";
    } else if (err.message?.includes("authentication") || err.message?.includes("401")) {
      errorMessage = "OpenAI API authentication failed. Please check your API key.";
    } else if (err.message?.includes("billing") || err.message?.includes("insufficient")) {
      errorMessage = "OpenAI API quota exceeded. Please check your billing.";
    } else if (err.message?.includes("Invalid image URL")) {
      errorMessage = `GPT Image 1 output validation failed: ${err.message}`;
    } else {
      errorMessage = `Blank product creation failed: ${err.message || 'Unknown error occurred'}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// UPDATED: Step 4 - Final logo placement with FLUX Kontext Pro (Hybrid Workflow)
export async function addLogoToProduct(
  blankProductUrl: string, 
  logoImageUrl: string, 
  outputSize?: string,
  referenceImageUrl?: string
): Promise<ImageProcessingResult> {
  try {
    console.log("🎯 Starting FLUX logo placement workflow...");
    console.log("🔗 Blank product:", blankProductUrl);
    console.log("🏷️ Logo to place:", logoImageUrl);

    // Quick analysis to determine garment type and placement location
    let placementLocation = "center front of the garment"; // default
    let garmentType = "garment"; // default
    
    if (referenceImageUrl) {
      if (!OpenAI) {
        throw new Error("OpenAI package is not installed");
      }

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 2,
      });
      
      console.log("🔍 Quick garment and placement analysis from reference image...");
      try {
        const analysis = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are analyzing a garment reference image. Identify the garment type and where the design/logo is located. Give brief answers."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "1. What type of garment is this? (t-shirt, hoodie, sweatshirt, tank top, etc.)\n2. Where is the design/logo positioned? (front chest, back center, left chest, etc.)\n\nAnswer in format: 'Garment: [type] | Location: [position]'"
                },
                {
                  type: "image_url",
                  image_url: { url: referenceImageUrl }
                }
              ] as any
            }
          ],
        });

        const response = analysis.choices[0].message.content || "";
        console.log("🔍 Analysis response:", response);
        
        // Parse the response
        const garmentMatch = response.match(/Garment:\s*([^|]+)/i);
        const locationMatch = response.match(/Location:\s*(.+)/i);
        
        if (garmentMatch) {
          garmentType = garmentMatch[1].trim().toLowerCase();
        }
        if (locationMatch) {
          placementLocation = locationMatch[1].trim();
        }
        
        console.log("👕 Garment type:", garmentType);
        console.log("📍 Logo placement location:", placementLocation);
      } catch (error) {
        console.log("⚠️ Analysis failed, using defaults");
        garmentType = "garment";
        placementLocation = "center front of the garment";
      }
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN,
    });

    console.log("🎨 Processing with FLUX Kontext Pro for targeted logo placement...");

    // Targeted prompt with dynamic garment type and placement location
    const logoPrompt = `Add the logo from the second image onto the ${placementLocation} of the ${garmentType} from the first image. The ${garmentType} must remain EXACTLY the same - same shape, same fabric texture, same lighting, same positioning, same structure. Only add the logo as a printed design on the fabric surface. Do not change the ${garmentType}'s structure, fit, sleeves, or any other part. Simply place the logo design on the fabric.`;

    console.log("🎯 Using FLUX logo placement prompt:", logoPrompt);

    // Use FLUX Kontext Pro for better logo placement control
    const output = await replicate.run(
      "flux-kontext-apps/multi-image-kontext-pro",
      {
        input: {
          prompt: logoPrompt,
          input_image_1: blankProductUrl,
          input_image_2: logoImageUrl,
        }
      }
    );

    console.log("✅ FLUX Kontext Pro logo placement completed");

    // Handle FLUX Kontext Pro output format - returns ReadableStream
    let generatedImageUrl: string | undefined;
    
    if (output instanceof ReadableStream) {
      console.log("📝 Converting FLUX ReadableStream to buffer...");
      
      // Convert stream to buffer
      const reader = output.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks into single buffer
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const buffer = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }

      console.log("📤 Uploading FLUX logo placement result to Firebase...");
      
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `vidaify-images-videos/flux-logo-${timestamp}-${randomId}.png`;
      
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, buffer, {
        contentType: 'image/png',
      });
      
      generatedImageUrl = await getDownloadURL(storageRef);
      console.log("✅ FLUX logo placement image uploaded to Firebase:", generatedImageUrl);
    } else {
      console.error("❌ Unexpected FLUX output format:", typeof output);
      throw new Error(`FLUX returned unexpected format: ${typeof output}`);
    }

    if (!generatedImageUrl || typeof generatedImageUrl !== 'string' || !generatedImageUrl.startsWith('http')) {
      throw new Error(`Invalid image URL from FLUX: ${generatedImageUrl || 'undefined'}`);
    }

    console.log("✅ FLUX logo placement completed:", generatedImageUrl);

    return {
      success: true,
      enhancedImageUrl: generatedImageUrl,
      originalAnalysis: `Logo placement completed using FLUX Kontext Pro with direct placement`,
    };

  } catch (error: unknown) {
    const err = error as any;
    let errorMessage: string;
    
    if (err.message?.includes("timeout")) {
      errorMessage = "Logo placement took too long. Please try again.";
    } else if (err.message?.includes("rate limit") || err.message?.includes("429")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (err.message?.includes("authentication") || err.message?.includes("401")) {
      errorMessage = "Replicate API authentication failed. Please check your API token.";
    } else if (err.message?.includes("billing") || err.message?.includes("insufficient")) {
      errorMessage = "Replicate API quota exceeded. Please check your billing.";
    } else {
      errorMessage = `FLUX logo placement error: ${err.message || 'Unknown error occurred'}`;
    }
    
    console.error("FLUX Logo Placement Error:", errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// LEGACY: Keep existing function for backward compatibility
export async function processHoodieLogo(hoodieImageUrl: string, logoImageUrl: string): Promise<ImageProcessingResult> {
  try {
    console.log("🔍 Starting legacy FLUX Kontext Pro enhancement...");

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN,
    });

    console.log("🎨 Processing with FLUX Kontext Pro...");

    // Use FLUX Kontext Pro for multi-image processing
    const output = await replicate.run(
      "flux-kontext-apps/multi-image-kontext-pro",
      {
        input: {
          prompt: "Create professional e-commerce product photography: Take ONLY the clothing garment/t-shirt from the first image (ignore any existing text, logos, or designs already on it - treat it as a blank garment). Take the logo design from the second image and place it cleanly onto the blank garment. Generate a studio-quality product photo with: pure white background, professional lighting, smooth wrinkle-free fabric, commercial photography quality. The garment should be the same color and style as in image 1, but completely blank, with only the logo from image 2 placed on it. High-resolution e-commerce ready product photography.",
          input_image_1: hoodieImageUrl,
          input_image_2: logoImageUrl,
        }
      }
    );

    console.log("✅ FLUX Kontext Pro processing completed");
    console.log("🔍 Output type:", typeof output);

    // Handle ReadableStream output
    if (output instanceof ReadableStream) {
      console.log("📝 Converting ReadableStream to buffer...");
      
      // Convert stream to buffer
      const reader = output.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks into single buffer
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const buffer = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }

      console.log("📤 Uploading enhanced image to Firebase...");
      
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `vidaify-images-videos/enhanced-${timestamp}-${randomId}.png`;
      
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, buffer, {
        contentType: 'image/png',
      });
      
      const enhancedImageUrl = await getDownloadURL(storageRef);
      console.log("✅ Enhanced image uploaded to Firebase:", enhancedImageUrl);

      return {
        success: true,
        enhancedImageUrl: enhancedImageUrl,
        originalAnalysis: "Enhanced using FLUX Kontext Pro - a state-of-the-art image editing model that preserves original content while improving quality, lighting, and professional presentation.",
      };
    } else {
      console.error("❌ Unexpected output format (not ReadableStream):", typeof output);
      throw new Error("Unexpected output format from FLUX Kontext Pro");
    }

  } catch (error: unknown) {
    const err = error as any;
    let errorMessage: string;
    
    if (err.message?.includes("timeout")) {
      errorMessage = "Image enhancement took too long. Please try again.";
    } else if (err.message?.includes("rate limit") || err.message?.includes("429")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (err.message?.includes("authentication") || err.message?.includes("401")) {
      errorMessage = "Replicate API authentication failed. Please check your API token.";
    } else if (err.message?.includes("billing") || err.message?.includes("insufficient")) {
      errorMessage = "Replicate API quota exceeded. Please check your billing.";
    } else {
      errorMessage = `Enhancement error: ${err.message || 'Unknown error occurred'}`;
    }
    
    console.error("FLUX Kontext Pro Error:", errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function createChatSession(initialPrompt: string | null = null) {
  try {
    if (!OpenAI) {
      throw new Error("OpenAI package is not installed. Please run: npm install openai");
    }

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      timeout: 60000,
      maxRetries: 3,
    });

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a creative UGC (User Generated Content) script writer. You create engaging, authentic-sounding video scripts for social media ads. 

Your scripts should:
- Sound natural and conversational
- Be engaging and hook viewers immediately
- Include a clear call-to-action
- Be appropriate for the specified length
- Match the requested tone
- Feel authentic, not overly salesy

Always respond with a plain text script only - no JSON, no formatting, just the script content that can be spoken by an avatar.`,
      },
    ];

    if (initialPrompt) {
      messages.push({
        role: "user",
        content: initialPrompt,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI request timeout")), 60000)
      );

      const makeRequest = async (retryCount = 0): Promise<any> => {
        try {
          return await openai.chat.completions.create({
            ...generationConfig,
            messages,
          });
        } catch (error: any) {
          if (retryCount < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            );
            return makeRequest(retryCount + 1);
          }
          throw error;
        }
      };

      const responsePromise = makeRequest();
      const response = await Promise.race([responsePromise, timeoutPromise]);
      return response;
    }

    return {
      async sendMessage(prompt: string) {
        const response = await openai.chat.completions.create({
          ...generationConfig,
          messages: [
            ...messages,
            {
              role: "user",
              content: prompt,
            },
          ],
        });
        return {
          response: {
            text: () => response.choices[0].message.content,
          },
        };
      },
    };
  } catch (error: unknown) {
    const err = error as OpenAIError;
    let errorMessage: string;
    
    if (err.message?.includes("timeout")) {
      errorMessage = "Request took too long to complete. Please try again.";
    } else if (err.response?.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (err.response?.status === 500) {
      errorMessage = "OpenAI service error. Please try again later.";
    } else if (err.message?.includes("not installed")) {
      errorMessage = err.message;
    } else {
      errorMessage = `Error: ${err.message || 'Unknown error occurred'}`;
    }
    console.error("OpenAI Error:", errorMessage);
    throw new Error(errorMessage);
  }
}