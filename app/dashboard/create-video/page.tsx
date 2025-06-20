"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  CreditCard,
  DollarSign,
  Zap,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  Camera,
  Sparkles,
  ArrowRight,
  Wand2,
  Shirt,
  Plus,
} from "lucide-react";

export default function CreateVideo() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("create-video");
  const [currentStep, setCurrentStep] = useState(1);

  // State for t-shirt + logo workflow
  const [uploadedImages, setUploadedImages] = useState<{
    tshirtPhoto: File | null;
  }>({
    tshirtPhoto: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");

  // Add state for Step 2
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [presetBackground, setPresetBackground] = useState<string | null>(null);
  const [creativeDirection, setCreativeDirection] = useState<string>("");

  const [finalImageUrl, setFinalImageUrl] = useState<string>("");

  // Add state for backend integration
  const [tshirtPhotoUrl, setTshirtPhotoUrl] = useState<string>("");
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>("");
  const [styleDescription, setStyleDescription] = useState<string>("");
  const [blankProductUrl, setBlankProductUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Add state for product description
  const [productDescription, setProductDescription] = useState<string>("");

  const presetBackgrounds = [
    "#ffffff", // white
    "#f5f5f5", // off-white
    "#fdf6ec", // cream
    "#e6f0fa", // light blue
    "#f5e6d6", // tan
    "#cccccc", // gray
  ];

  const sidebarItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "create-video",
      icon: Video,
      label: "T-Shirt Designer",
      path: "/dashboard/create-video",
    },
    { id: "test", icon: Plus, label: "Test", path: "/dashboard/test" },
    {
      id: "billing",
      icon: CreditCard,
      label: "Billing",
      path: "/dashboard/billing",
    },
    {
      id: "pricing",
      icon: DollarSign,
      label: "Pricing",
      path: "/dashboard/pricing",
    },
  ];

  const steps = [
    { id: 1, title: "Upload T-Shirt", completed: false, active: true },
    { id: 2, title: "Style & Generate Blank", completed: false, active: false },
  ];

  const handleNavigation = (item: (typeof sidebarItems)[0]) => {
    setActiveSection(item.id);
    router.push(item.path);
  };

  const handleImageUpload = useCallback((type: "tshirtPhoto", file: File) => {
    setUploadedImages((prev) => ({
      ...prev,
      [type]: file,
    }));
  }, []);

  const removeImage = useCallback((type: "tshirtPhoto") => {
    setUploadedImages((prev) => ({
      ...prev,
      [type]: null,
    }));
  }, []);

  // Helper to upload a file to /api/upload-image and return downloadUrl
  async function uploadFileToApi(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("files", file);
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    const data = await res.json();
    if (!data.success || !data.files[0]?.downloadUrl)
      throw new Error("File upload failed");
    return data.files[0].downloadUrl;
  }

  // Step 1: Upload t-shirt photo and continue to Step 2
  async function handleContinueStep1() {
    setError("");
    if (!uploadedImages.tshirtPhoto) return;
    try {
      setIsProcessing(true);
      setProcessingStage("Uploading t-shirt photo...");
      const url = await uploadFileToApi(uploadedImages.tshirtPhoto);
      setTshirtPhotoUrl(url);
      setCurrentStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  }

  // Step 2: Create blank product and go to canvas editor
  async function handleContinueStep2() {
    setError("");
    let refImageUrl = "";
    let styleInput = creativeDirection;
    try {
      setIsProcessing(true);
      setProcessingStage("Analyzing style...");
      // If reference image, upload it
      if (referenceImage) {
        refImageUrl = await uploadFileToApi(referenceImage);
        setReferenceImageUrl(refImageUrl);
      }
      // If preset background, convert to style description
      let styleDesc = styleInput;
      if (presetBackground) {
        const colorName =
          {
            "#ffffff": "white",
            "#f5f5f5": "off-white",
            "#fdf6ec": "cream",
            "#e6f0fa": "light blue",
            "#f5e6d6": "tan",
            "#cccccc": "gray",
          }[presetBackground] || "custom color";
        styleDesc = `${
          styleInput ? styleInput + ", " : ""
        }plain ${colorName} background, studio lighting`;
      }

      // Ensure we always have a style description - add fallback
      if (!styleDesc && !referenceImage) {
        styleDesc =
          "Professional e-commerce product photography with clean white background, studio lighting, wrinkle-free presentation, commercial quality";
      }

      // Call analyze-style API
      const res = await fetch("/api/analyze-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleInput: styleDesc,
          referenceImageUrl: refImageUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Style analysis failed");
      const data = await res.json();

      // Ensure we got a valid style description back
      const finalStyleDescription =
        data.styleDescription ||
        styleDesc ||
        "Professional e-commerce product photography with clean white background, studio lighting, wrinkle-free presentation, commercial quality";

      // Create blank product
      setProcessingStage("Creating blank product...");
      const blankRes = await fetch("/api/create-blank-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImageUrl: tshirtPhotoUrl,
          styleDescription: finalStyleDescription,
          productDescription: productDescription || undefined,
          referenceImageUrl: refImageUrl || undefined,
        }),
      });

      if (!blankRes.ok) {
        const errorData = await blankRes.json();
        throw new Error(errorData.error || "Blank product creation failed");
      }

      const blankData = await blankRes.json();

      // Redirect to canvas editor with blank product
      const canvasUrl = `/dashboard/canvas-editor?blankProduct=${encodeURIComponent(
        blankData.blankProductUrl
      )}&originalImage=${encodeURIComponent(tshirtPhotoUrl)}`;
      router.push(canvasUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  }

  // Reset all state for new design
  function handleResetAll() {
    setUploadedImages({ tshirtPhoto: null });
    setTshirtPhotoUrl("");
    setReferenceImage(null);
    setReferenceImageUrl("");
    setPresetBackground(null);
    setCreativeDirection("");
    setProductDescription("");
    setStyleDescription("");
    setBlankProductUrl("");
    setFinalImageUrl("");
    setAnalysis("");
    setError("");
    setCurrentStep(1);
  }

  const ImageUploadCard = ({
    type,
    title,
    description,
    file,
    icon: Icon,
    tips,
  }: {
    type: "tshirtPhoto";
    title: string;
    description: string;
    file: File | null;
    icon: any;
    tips: string[];
  }) => {
    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));
        if (imageFile) {
          handleImageUpload(type, imageFile);
        }
      },
      [type]
    );

    const handleFileInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
          handleImageUpload(type, file);
        }
      },
      [type]
    );

    const getCardColor = () => {
      return type === "tshirtPhoto" ? "blue" : "purple";
    };

    const color = getCardColor();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${color}-100`}
          >
            <Icon className={`w-4 h-4 text-${color}-600`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {file ? (
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
              <img
                src={URL.createObjectURL(file)}
                alt={title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(type)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          </div>
        ) : (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer border-${color}-300 hover:border-${color}-400 hover:bg-${color}-50`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id={`file-input-${type}`}
              />
              <label htmlFor={`file-input-${type}`} className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  <span className={`font-medium text-${color}-600`}>
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>

            {/* Tips Section */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">
                💡 Tips for best results:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  const canProceed = uploadedImages.tshirtPhoto;

  // In the main render, after t-shirt photo is uploaded and currentStep === 2, show Step 2 UI
  const canContinueStep2 = !!referenceImage || !!presetBackground;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center w-full">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shirt className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            T-Shirt Designer AI
          </span>
        </div>

        {/* Right side with User */}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-white flex flex-col border-r border-gray-200">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                  activeSection === item.id
                    ? "bg-purple-50 text-purple-700 border-r-4 border-purple-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    activeSection === item.id
                      ? "text-purple-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Free Plan Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-purple-600 mb-3">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Free Plan</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <div className="text-xs text-gray-500 mb-1">
                  Designs Remaining
                </div>
                <div className="font-bold text-xl text-gray-900">3/5</div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Create Project Content */}
          <main className="flex-1 p-8 overflow-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI T-Shirt Designer
              </h1>
              <p className="text-gray-600 mb-8">
                Upload your t-shirt photo. The AI will detect the orientation
                (front/back) and place your logo perfectly for e-commerce
                quality results.
              </p>

              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          currentStep >= step.id
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step.id}
                      </div>
                      <span
                        className={`ml-3 text-sm font-medium ${
                          currentStep >= step.id
                            ? "text-purple-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-12 h-px bg-gray-300 ml-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-red-800 font-medium">Error</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                    <button
                      onClick={() => setError("")}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Status */}
              {isProcessing && processingStage && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-blue-800 font-medium">
                      {processingStage}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Images Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ImageUploadCard
                type="tshirtPhoto"
                title="T-Shirt Photo"
                description="Upload a photo of your t-shirt (front or back view)"
                file={uploadedImages.tshirtPhoto}
                icon={Shirt}
                tips={[
                  "Show front OR back of t-shirt clearly",
                  "AI will detect orientation automatically",
                  "Any quality photo works (mobile camera OK)",
                  "Logo will be placed on the same side shown",
                ]}
              />
            </div>

            {/* Add Product Description field in Step 1 after t-shirt upload */}
            {uploadedImages.tshirtPhoto && currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Product Description (Optional)
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Describe your product for better AI understanding (e.g.,
                  "oversized cream t-shirt", "vintage hoodie").
                </p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  placeholder="e.g., oversized cream t-shirt, vintage hoodie..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
            )}

            {/* Results Section */}
            {finalImageUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      E-Commerce Product Ready!
                    </h3>
                    <p className="text-gray-600">
                      Your professional product design is complete
                    </p>
                  </div>
                </div>

                {/* Final Image Display */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Final E-Commerce Product
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                    <img
                      src={finalImageUrl}
                      alt="Final product with logo"
                      className="max-w-full max-h-96 rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                {/* Analysis Description */}
                {analysis && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      AI Process Summary
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{analysis}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <a
                    href={finalImageUrl}
                    download="ecommerce-product-design.png"
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
                  >
                    <span>Download E-Commerce Image</span>
                  </a>
                  <button
                    onClick={handleResetAll}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Create Another Design
                  </button>
                </div>
              </div>
            )}

            {/* Processing Flow Explanation */}
            {canProceed && !finalImageUrl && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Shirt className="w-5 h-5 text-purple-600 mr-2" />
                  T-Shirt Design Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Upload T-Shirt</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Wand2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>Create Blank Version</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                    </div>
                    <span>Place Logo Perfectly</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 UI */}
            {uploadedImages.tshirtPhoto && currentStep === 2 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Step 2: Add Image Reference or Background
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Reference Image Upload */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Reference/Background Image
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Upload a background or style reference image (optional,
                      recommended for best results).
                    </p>
                    {referenceImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(referenceImage)}
                          alt="Reference"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setReferenceImage(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.type.startsWith("image/")) {
                              setReferenceImage(file);
                              setPresetBackground(null); // Only one can be active
                            }
                          }}
                          className="hidden"
                        />
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium text-blue-600">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-gray-400 text-sm">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    )}
                  </div>
                  {/* Preset Background Swatches */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Or Select a Preset Background
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Choose a background color for your studio shot.
                    </p>
                    <div className="flex space-x-4 mb-2">
                      {presetBackgrounds.map((color, idx) => (
                        <button
                          key={color}
                          className={`w-12 h-12 rounded-lg border-2 ${
                            presetBackground === color
                              ? "border-blue-600 ring-2 ring-blue-200"
                              : "border-gray-200"
                          } focus:outline-none`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setPresetBackground(color);
                            setReferenceImage(null); // Only one can be active
                          }}
                          aria-label={`Select background color ${color}`}
                        />
                      ))}
                    </div>
                    {presetBackground && (
                      <button
                        onClick={() => setPresetBackground(null)}
                        className="mt-2 text-xs text-red-500 underline"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>
                {/* Creative Direction Input */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Creative Direction (Optional)
                  </h3>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    rows={3}
                    placeholder="Any specific notes or creative direction for the AI..."
                    value={creativeDirection}
                    onChange={(e) => setCreativeDirection(e.target.value)}
                  />
                </div>
                {/* Continue Button */}
                <div className="flex justify-end">
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      canContinueStep2 && !isProcessing
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!canContinueStep2 || isProcessing}
                    onClick={handleContinueStep2}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Save as Draft
              </button>

              {currentStep === 1 && (
                <button
                  onClick={handleContinueStep1}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    canProceed && !isProcessing
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!canProceed || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{processingStage || "Processing..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Step 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {finalImageUrl && (
                <button
                  onClick={handleResetAll}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
                >
                  <span>Create Another Design</span>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
