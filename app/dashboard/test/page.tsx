"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  Loader2,
  TestTube,
  LayoutDashboard,
  Video,
  CreditCard,
  DollarSign,
  Plus,
  Zap,
} from "lucide-react";

export default function TestPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("test");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      label: "Create Video",
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

  const handleNavigation = (item: (typeof sidebarItems)[0]) => {
    setActiveSection(item.id);
    router.push(item.path);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setProcessedImageUrl(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove background");
      }

      // Get the processed image as blob
      const blob = await response.blob();
      const processedUrl = URL.createObjectURL(blob);
      setProcessedImageUrl(processedUrl);
    } catch (err: any) {
      setError(err.message || "An error occurred while processing the image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedImageUrl) {
      const link = document.createElement("a");
      link.href = processedImageUrl;
      link.download = "transparent-logo.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetProcess = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedImageUrl(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Vidaify</span>
        </div>

        <div className="flex items-center">
          <div className="text-sm text-gray-600">Welcome to Vidaify</div>
        </div>
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
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-purple-600 mb-3">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Free Plan</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <div className="text-xs text-gray-500 mb-1">
                  Videos Remaining
                </div>
                <div className="font-bold text-xl text-gray-900">0/0</div>
              </div>
              <button className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Logo Background Remover
                </h1>
                <p className="text-gray-600 text-lg">
                  Upload your logo and remove the background automatically
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Upload Logo
                  </h2>

                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="mb-4">
                        <p className="text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-block">
                          Choose File
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previewUrl && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Original Image:
                          </p>
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            style={{ maxHeight: "300px" }}
                          />
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={handleRemoveBackground}
                          disabled={isLoading}
                          className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <span>Remove Background</span>
                          )}
                        </button>
                        <button
                          onClick={resetProcess}
                          className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Result Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Result
                  </h2>

                  {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 font-medium">Error:</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  ) : processedImageUrl ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Processed Image:
                        </p>
                        <div
                          className="bg-gray-100 rounded-lg p-4"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20'%3e%3crect width='10' height='10' fill='%23f3f4f6'/%3e%3crect x='10' y='10' width='10' height='10' fill='%23f3f4f6'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23a)'/%3e%3c/svg%3e\")",
                          }}
                        >
                          <img
                            src={processedImageUrl}
                            alt="Processed"
                            className="max-w-full h-auto mx-auto"
                            style={{ maxHeight: "300px" }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PNG</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TestTube className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">
                        Upload an image and click "Remove Background" to see the
                        result here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
