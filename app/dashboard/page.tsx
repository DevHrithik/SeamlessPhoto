"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  CreditCard,
  DollarSign,
  Play,
  Calendar,
  Zap,
  Plus,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dashboard");

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

  const handleCreateVideo = () => {
    router.push("/dashboard/create-video");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center w-full">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Vidaify</span>
        </div>

        {/* Right side - removed user button */}
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
          {/* Dashboard Content */}
          <main className="flex-1 p-8 overflow-auto">
            {/* Page Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Create and manage your AI-generated videos
                </p>
              </div>
              <button
                onClick={handleCreateVideo}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your Video</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Videos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Total Videos
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">0</p>
                    <p className="text-sm text-gray-500">in your library</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Videos This Month */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Videos This Month
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">0</p>
                    <p className="text-sm text-gray-500">created in June</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Remaining Credits */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Remaining Credits
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">0</p>
                    <p className="text-sm text-gray-500">
                      videos available to create
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Videos Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Videos
                </h2>
              </div>

              {/* Empty State */}
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No videos generated yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Create your first UGC video with the help of our AI and
                  skyrocket your content marketing.
                </p>
                <button
                  onClick={handleCreateVideo}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Video</span>
                </button>
                <div className="mt-6">
                  <span className="inline-flex items-center text-sm text-purple-600 font-medium">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                    videos available
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
