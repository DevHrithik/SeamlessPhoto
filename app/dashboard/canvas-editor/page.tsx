"use client";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  CreditCard,
  DollarSign,
  Upload,
  Image as ImageIcon,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Palette,
  Download,
  ArrowLeft,
  Save,
  Sparkles,
  FileImage,
  Settings,
  RefreshCw,
  Edit3,
  Plus,
} from "lucide-react";

interface CanvasElement {
  id: string;
  type: "logo";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

function CanvasEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get blank product URL from query params
  const blankProductUrl = searchParams.get("blankProduct");
  const originalImageUrl = searchParams.get("originalImage");

  const [activeSection, setActiveSection] = useState("create-video");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize] = useState({ width: 800, height: 800 });
  const [isSaved, setIsSaved] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] =
    useState<Partial<CanvasElement> | null>(null);
  const [rotatingElement, setRotatingElement] = useState<string | null>(null);
  const [initialRotation, setInitialRotation] = useState(0);
  const [elementCenter, setElementCenter] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state to history
  const saveToHistory = useCallback(
    (elements: CanvasElement[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push([...elements]);
        return newHistory.slice(-20); // Keep only last 20 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 19));
    },
    [historyIndex]
  );

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setCanvasElements([...previousState]);
      setHistoryIndex((prev) => prev - 1);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  // Reset function
  const handleReset = useCallback(() => {
    setCanvasElements([]);
    setSelectedElement(null);
    setHistory([]);
    setHistoryIndex(-1);
    saveToHistory([]);
  }, [saveToHistory]);

  const addElement = useCallback(
    (element: CanvasElement) => {
      if (isSaved) return;

      saveToHistory(canvasElements); // Save current state before adding
      setCanvasElements((prev) => [...prev, element]);
    },
    [canvasElements, isSaved, saveToHistory]
  );

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      if (isSaved) return;

      saveToHistory(canvasElements); // Save current state before updating
      setCanvasElements((elements) =>
        elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    [canvasElements, isSaved, saveToHistory]
  );

  const deleteElement = useCallback(
    (id: string) => {
      if (isSaved) return;

      saveToHistory(canvasElements); // Save current state before deleting
      setCanvasElements((elements) => elements.filter((el) => el.id !== id));
      setSelectedElement(null);
    },
    [canvasElements, isSaved, saveToHistory]
  );

  // Save design
  const handleSaveDesign = useCallback(() => {
    // Lock in logo, background, and specs
    setIsSaved(true);
    setSelectedElement(null);
    console.log("Design saved with current elements and background");
  }, []);

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
    {
      id: "test",
      icon: Plus,
      label: "Test",
      path: "/dashboard/test",
    },
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

  const presetBackgrounds = [
    "#ffffff", // white
    "#f5f5f5", // off-white
    "#fdf6ec", // cream
    "#e6f0fa", // light blue
    "#f5e6d6", // tan
    "#cccccc", // gray
    "#1a1a1a", // black
    "#4a90e2", // blue
  ];

  const handleNavigation = (item: (typeof sidebarItems)[0]) => {
    setActiveSection(item.id);
    router.push(item.path);
  };

  // Upload logo and add to canvas
  const handleLogoUpload = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        let logoSrc = URL.createObjectURL(file);

        // Remove background if enabled
        if (true) {
          console.log("🔄 Background removal enabled, processing...");
          try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/remove-background", {
              method: "POST",
              body: formData,
            });

            console.log(
              "📡 Background removal API response:",
              response.status,
              response.statusText
            );

            if (response.ok) {
              const blob = await response.blob();
              logoSrc = URL.createObjectURL(blob);
              console.log("✅ Background removed successfully");
            } else {
              const errorData = await response.json();
              console.error("❌ Background removal failed:", errorData);
              console.warn(
                "⚠️ Using original image without background removal"
              );
            }
          } catch (bgError) {
            console.error("💥 Background removal error:", bgError);
            console.warn("⚠️ Using original image without background removal");
          }
        } else {
          console.log("ℹ️ Background removal disabled, using original image");
        }

        // Add logo to canvas
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: "logo",
          src: logoSrc,
          x: canvasSize.width / 2 - 100,
          y: canvasSize.height / 2 - 100,
          width: 200,
          height: 200,
          rotation: 0,
          zIndex: canvasElements.length + 1,
        };

        addElement(newElement);
        setSelectedElement(newElement.id);
        setIsSaved(false);
        console.log("🎨 Logo added to canvas successfully");
      } catch (error) {
        console.error("💥 Logo upload failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [canvasElements.length, canvasSize, addElement]
  );

  // Handle reference photo upload
  const handleReferenceUpload = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        const referenceUrl = URL.createObjectURL(file);
        setReferenceImage(referenceUrl);

        // Optionally add to canvas as well
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: "logo",
          src: referenceUrl,
          x: 50,
          y: 50,
          width: 150,
          height: 150,
          rotation: 0,
          zIndex: canvasElements.length + 1,
        };

        addElement(newElement);
        setSelectedElement(newElement.id);
        setIsSaved(false);
      } catch (error) {
        console.error("Reference upload failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [canvasElements.length, addElement]
  );

  // Handle AI photo generation
  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;

    try {
      setIsGenerating(true);

      // Create form data with the current canvas state
      const formData = new FormData();
      formData.append("prompt", aiPrompt);

      // If there's a reference image, include it
      if (referenceImage) {
        const response = await fetch(referenceImage);
        const blob = await response.blob();
        formData.append("referenceImage", blob);
      }

      // If there's a blank product, include it
      if (blankProductUrl) {
        formData.append("baseImage", blankProductUrl);
      }

      // Add current canvas elements context
      formData.append("canvasElements", JSON.stringify(canvasElements));
      formData.append("backgroundColor", backgroundColor);

      // Call AI enhancement API
      const response = await fetch("/api/enhance-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const enhancedImageUrl = URL.createObjectURL(blob);

        // Create new element with enhanced image
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: "logo",
          src: enhancedImageUrl,
          x: canvasSize.width / 2 - 150,
          y: canvasSize.height / 2 - 150,
          width: 300,
          height: 300,
          rotation: 0,
          zIndex: canvasElements.length + 1,
        };

        addElement(newElement);
        setSelectedElement(newElement.id);
        setIsSaved(false);
        setAiPrompt(""); // Clear prompt after successful generation
      } else {
        throw new Error("AI generation failed");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      // You could add toast notification here
    } finally {
      setIsGenerating(false);
    }
  }, [
    aiPrompt,
    referenceImage,
    blankProductUrl,
    canvasElements,
    backgroundColor,
    canvasSize,
    addElement,
  ]);

  // Handle reference image file input
  const handleReferenceFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const referenceUrl = URL.createObjectURL(file);
        setReferenceImage(referenceUrl);
      }
      e.target.value = "";
    },
    []
  );

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));
      if (imageFile) {
        handleLogoUpload(imageFile);
      }
    },
    [handleLogoUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleLogoUpload(file);
      }
      // Reset the input value so the same file can be selected again
      e.target.value = "";
    },
    [handleLogoUpload]
  );

  // Canvas mouse events
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on an element (reverse order for top elements first)
      const clickedElement = [...canvasElements].reverse().find((el) => {
        return (
          x >= el.x &&
          x <= el.x + el.width &&
          y >= el.y &&
          y <= el.y + el.height
        );
      });

      if (clickedElement) {
        setSelectedElement(clickedElement.id);
        setDraggedElement(clickedElement.id);
        setDragOffset({
          x: x - clickedElement.x,
          y: y - clickedElement.y,
        });

        // Delete element on click if saved (as per requirements)
        if (isSaved) {
          deleteElement(clickedElement.id);
          return;
        }
      } else {
        setSelectedElement(null);
      }
    },
    [canvasElements, isSaved, deleteElement]
  );

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isSaved) return;

    // Handle rotation
    if (rotatingElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate angle from element center to mouse position
      const deltaX = mouseX - elementCenter.x;
      const deltaY = mouseY - elementCenter.y;
      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      // Calculate initial angle for smooth rotation
      const initialDeltaX = initialMousePos.x - rect.left - elementCenter.x;
      const initialDeltaY = initialMousePos.y - rect.top - elementCenter.y;
      const initialAngle =
        (Math.atan2(initialDeltaY, initialDeltaX) * 180) / Math.PI;

      const rotation = initialRotation + (angle - initialAngle);

      setCanvasElements((elements) =>
        elements.map((el) =>
          el.id === rotatingElement ? { ...el, rotation: rotation } : el
        )
      );
      return;
    }

    // Handle resizing
    if (resizingElement && resizeHandle && initialElementState) {
      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;

      const element = canvasElements.find((el) => el.id === resizingElement);
      if (!element) return;

      let newX = initialElementState.x!;
      let newY = initialElementState.y!;
      let newWidth = initialElementState.width!;
      let newHeight = initialElementState.height!;

      switch (resizeHandle) {
        case "nw":
          newX = Math.min(
            initialElementState.x! + deltaX,
            initialElementState.x! + initialElementState.width! - 50
          );
          newY = Math.min(
            initialElementState.y! + deltaY,
            initialElementState.y! + initialElementState.height! - 50
          );
          newWidth = Math.max(50, initialElementState.width! - deltaX);
          newHeight = Math.max(50, initialElementState.height! - deltaY);
          break;
        case "ne":
          newY = Math.min(
            initialElementState.y! + deltaY,
            initialElementState.y! + initialElementState.height! - 50
          );
          newWidth = Math.max(50, initialElementState.width! + deltaX);
          newHeight = Math.max(50, initialElementState.height! - deltaY);
          break;
        case "sw":
          newX = Math.min(
            initialElementState.x! + deltaX,
            initialElementState.x! + initialElementState.width! - 50
          );
          newWidth = Math.max(50, initialElementState.width! - deltaX);
          newHeight = Math.max(50, initialElementState.height! + deltaY);
          break;
        case "se":
          newWidth = Math.max(50, initialElementState.width! + deltaX);
          newHeight = Math.max(50, initialElementState.height! + deltaY);
          break;
        case "n":
          newY = Math.min(
            initialElementState.y! + deltaY,
            initialElementState.y! + initialElementState.height! - 50
          );
          newHeight = Math.max(50, initialElementState.height! - deltaY);
          break;
        case "s":
          newHeight = Math.max(50, initialElementState.height! + deltaY);
          break;
        case "w":
          newX = Math.min(
            initialElementState.x! + deltaX,
            initialElementState.x! + initialElementState.width! - 50
          );
          newWidth = Math.max(50, initialElementState.width! - deltaX);
          break;
        case "e":
          newWidth = Math.max(50, initialElementState.width! + deltaX);
          break;
      }

      setCanvasElements((elements) =>
        elements.map((el) =>
          el.id === resizingElement
            ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
            : el
        )
      );
      return;
    }

    // Handle dragging
    if (draggedElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setCanvasElements((elements) =>
        elements.map((el) =>
          el.id === draggedElement
            ? {
                ...el,
                x: Math.max(0, Math.min(x, canvasSize.width - el.width)),
                y: Math.max(0, Math.min(y, canvasSize.height - el.height)),
              }
            : el
        )
      );
    }
  };

  const handleCanvasMouseUp = useCallback(() => {
    if (isSaved) return;

    // Save to history if any changes were made
    if (draggedElement || resizingElement || rotatingElement) {
      saveToHistory(canvasElements);
    }

    setDraggedElement(null);
    setResizingElement(null);
    setResizeHandle(null);
    setInitialElementState(null);
    setRotatingElement(null);
    setInitialRotation(0);
    setElementCenter({ x: 0, y: 0 });
  }, [
    isSaved,
    draggedElement,
    resizingElement,
    rotatingElement,
    canvasElements,
    saveToHistory,
  ]);

  // Generate final image
  const generateFinalImage = useCallback(async () => {
    if (!canvasRef.current || !blankProductUrl) return;

    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Draw background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw blank product
      const productImg = new Image();
      productImg.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        productImg.onload = resolve;
        productImg.src = blankProductUrl;
      });

      // Scale product to fit canvas
      const scale = Math.min(
        canvas.width / productImg.width,
        canvas.height / productImg.height
      );
      const scaledWidth = productImg.width * scale;
      const scaledHeight = productImg.height * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      ctx.drawImage(productImg, offsetX, offsetY, scaledWidth, scaledHeight);

      // Draw logos
      for (const element of canvasElements.sort(
        (a, b) => a.zIndex - b.zIndex
      )) {
        if (element.type === "logo") {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.src = element.src;
          });

          ctx.save();
          ctx.translate(
            element.x + element.width / 2,
            element.y + element.height / 2
          );
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.drawImage(
            logoImg,
            -element.width / 2,
            -element.height / 2,
            element.width,
            element.height
          );
          ctx.restore();
        }
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "custom-design.png";
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Generate final image failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [blankProductUrl, backgroundColor, canvasElements, canvasSize]);

  const selectedElementData = canvasElements.find(
    (el) => el.id === selectedElement
  );

  // Handle resize handle mouse down
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    handle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const element = canvasElements.find((el) => el.id === elementId);
    if (!element) return;

    setResizingElement(elementId);
    setResizeHandle(handle);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialElementState({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });
  };

  const handleRotationMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const element = canvasElements.find((el) => el.id === elementId);
    if (!element) return;

    setRotatingElement(elementId);
    setInitialRotation(element.rotation);
    setInitialMousePos({ x: e.clientX, y: e.clientY });

    // Calculate element center
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    setElementCenter({ x: centerX, y: centerY });
  };

  // Remove reference image
  const removeReferenceImage = useCallback(() => {
    setReferenceImage(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Canvas Editor</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard/create-video")}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Designer
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Canvas Editor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0 || isSaved}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Undo
              </button>

              <button
                onClick={handleReset}
                disabled={canvasElements.length === 0 || isSaved}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>

              <button
                onClick={handleSaveDesign}
                disabled={canvasElements.length === 0}
                className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {isSaved ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save
                  </>
                )}
              </button>

              <button
                onClick={generateFinalImage}
                disabled={canvasElements.length === 0}
                className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex flex-1">
            {/* Left Panel - Tools */}
            <div className="w-80 bg-white border-r border-gray-200 p-6">
              <div className="space-y-6">
                {/* Upload Logo */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add Logo/Design
                  </h3>

                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="logo-upload"
                      disabled={isSaved}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`cursor-pointer ${
                        isSaved ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drop logo here or click to upload
                      </p>
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <span className="flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Background will be removed automatically
                        </span>
                      </div>
                    </label>

                    {isLoading && (
                      <div className="mt-4 flex items-center justify-center text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm">Removing background...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Background Colors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Background
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {presetBackgrounds.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        disabled={isSaved}
                        className={`w-12 h-12 rounded-lg border-2 ${
                          backgroundColor === color
                            ? "border-blue-500"
                            : "border-gray-300"
                        } ${isSaved ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Element Controls */}
                {selectedElementData && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Element Controls
                    </h3>
                    <div className="space-y-4">
                      {/* Size Controls */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Width: {selectedElementData.width}px
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="400"
                          value={selectedElementData.width}
                          onChange={(e) =>
                            updateElement(selectedElement!, {
                              width: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                          disabled={isSaved}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Height: {selectedElementData.height}px
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="400"
                          value={selectedElementData.height}
                          onChange={(e) =>
                            updateElement(selectedElement!, {
                              height: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                          disabled={isSaved}
                        />
                      </div>

                      {/* Rotation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rotation: {selectedElementData.rotation}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedElementData.rotation}
                          onChange={(e) =>
                            updateElement(selectedElement!, {
                              rotation: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                          disabled={isSaved}
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteElement(selectedElement!)}
                        disabled={isSaved}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Delete Element
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="relative">
                <div
                  className="relative border border-gray-300 cursor-crosshair"
                  style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    backgroundColor: backgroundColor,
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                >
                  {/* Blank Product Background */}
                  {blankProductUrl && (
                    <img
                      src={blankProductUrl}
                      alt="Blank Product"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  )}

                  {/* Canvas Elements */}
                  {canvasElements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute ${
                        !isSaved ? "cursor-move" : "cursor-pointer"
                      } ${
                        selectedElement === element.id && !isSaved
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex,
                      }}
                    >
                      <img
                        src={element.src}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        draggable={false}
                      />

                      {/* Resize handles for Canva-like editing */}
                      {selectedElement === element.id && !isSaved && (
                        <>
                          {/* Corner handles */}
                          <div
                            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "nw")
                            }
                          ></div>
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "ne")
                            }
                          ></div>
                          <div
                            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "sw")
                            }
                          ></div>
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "se")
                            }
                          ></div>

                          {/* Side handles */}
                          <div
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "n")
                            }
                          ></div>
                          <div
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "s")
                            }
                          ></div>
                          <div
                            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "w")
                            }
                          ></div>
                          <div
                            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) =>
                              handleResizeMouseDown(e, element.id, "e")
                            }
                          ></div>

                          {/* Rotation handle */}
                          <div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full cursor-grab hover:bg-green-600 transition-colors"
                            onMouseDown={(e) =>
                              handleRotationMouseDown(e, element.id)
                            }
                          ></div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Hidden canvas for export */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Edit Section Below Canvas - Same Width */}
              <div
                className="bg-gray-900 border border-gray-700 rounded-lg mt-6 p-6"
                style={{ width: canvasSize.width }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Edit3 className="w-5 h-5 mr-2" />
                    AI Photo Editor
                  </h3>
                  <span className="text-gray-400 text-sm">
                    Edit = 5 credits
                  </span>
                </div>

                {/* Reference Image Section */}
                {referenceImage && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">
                        Reference Image
                      </span>
                      <button
                        onClick={removeReferenceImage}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <img
                        src={referenceImage}
                        alt="Reference"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                      />
                      <div className="text-gray-300 text-sm">
                        <p>Reference image loaded successfully</p>
                        <p className="text-gray-400 text-xs">
                          This will be used to guide AI generation
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type prompt here..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !isGenerating && handleAiGenerate()
                      }
                      disabled={isGenerating}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceFileInput}
                      className="hidden"
                      id="ai-reference-upload"
                    />
                    <label
                      htmlFor="ai-reference-upload"
                      className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-3 text-gray-300 hover:text-white transition-colors cursor-pointer inline-block"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </label>
                  </div>

                  <button
                    onClick={handleAiGenerate}
                    disabled={!aiPrompt.trim() || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate</span>
                        <span className="bg-blue-700 px-2 py-1 rounded text-xs">
                          + 1
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    {referenceImage
                      ? "AI will use your reference image and prompt to enhance the design"
                      : "Add a reference image or describe your desired changes in the prompt"}
                  </p>
                </div>

                {/* Quick Prompt Suggestions */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "enhance image quality",
                      "remove background",
                      "adjust lighting",
                      "make more vibrant",
                      "professional product photo",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setAiPrompt(suggestion)}
                        disabled={isGenerating}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-600 transition-colors disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CanvasEditor() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center w-full">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Vidaify</span>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Canvas Editor...</p>
            </div>
          </div>
        </div>
      }
    >
      <CanvasEditorContent />
    </Suspense>
  );
}
