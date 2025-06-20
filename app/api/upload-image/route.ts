import { NextRequest, NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/configs/Firebaseconfig";

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 [Upload API] Route accessed");
    console.log("🔧 [Upload API] Firebase Storage App Info:", {
      projectId: storage.app.options.projectId,
      storageBucket: storage.app.options.storageBucket,
    });

    // Get the form data from the request
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    console.log(`📁 [Upload API] Received ${files.length} files`);

    // Validate that files were provided
    if (!files || files.length === 0) {
      console.log("❌ [Upload API] No files provided");
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate file types (images and videos only)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/mov', 'video/avi', 'video/quicktime'
    ];

    const uploadPromises = files.map(async (file, index) => {
      console.log(`🔍 [Upload API] Processing file ${index + 1}: ${file.name} (${file.type})`);
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(`File too large: ${file.name}. Maximum size is 50MB.`);
      }

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create a unique filename with timestamp and original extension
      const fileExtension = file.name.split('.').pop() || 'unknown';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `vidaify-images-videos/${timestamp}-${randomId}.${fileExtension}`;

      console.log(`📁 [Upload API] Attempting to upload to: ${fileName}`);

      // Create storage reference
      const storageRef = ref(storage, fileName);

      // Upload file to Firebase Storage
      await uploadBytes(storageRef, uint8Array, {
        contentType: file.type,
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      console.log(`✅ [Upload API] File uploaded to Firebase Storage: ${downloadUrl}`);

      return {
        originalName: file.name,
        fileName: fileName,
        downloadUrl: downloadUrl,
        fileType: file.type,
        fileSize: file.size,
      };
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);

    console.log(`🎉 [Upload API] All uploads completed successfully: ${uploadResults.length} files`);

    return NextResponse.json({
      success: true,
      files: uploadResults,
      message: `Successfully uploaded ${uploadResults.length} file(s)`,
    });

  } catch (error) {
    console.error("❌ [Upload API] File upload error:", error);
    
    // Return appropriate error message
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error during file upload" },
      { status: 500 }
    );
  }
}

// Add a simple GET handler for testing
export async function GET() {
  console.log("🔍 [Upload API] GET request received - route is working");
  return NextResponse.json({ 
    message: "Upload API is working", 
    timestamp: new Date().toISOString() 
  });
}
