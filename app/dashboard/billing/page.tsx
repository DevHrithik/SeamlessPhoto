"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  CreditCard,
  DollarSign,
  Zap,
  Clock,
  Settings,
  Plus,
} from "lucide-react";

export default function Billing() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("billing");

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
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              {/* Coming Soon Section */}
              <div className="text-center">
                <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Clock className="w-12 h-12 text-purple-600" />
                  </div>

                  <h1 className="text-4xl font-bold mb-4 text-gray-900">
                    Billing Dashboard
                  </h1>
                  <h2 className="text-2xl font-semibold mb-6 text-purple-600">
                    Coming Soon
                  </h2>

                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                    We're building an amazing billing dashboard where you'll be
                    able to manage your subscription, view usage history,
                    download invoices, and update payment methods.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Payment Management
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Update payment methods and billing information
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Settings className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Subscription Control
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Manage your plan and billing preferences
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Video className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Usage Analytics
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Track your video creation and usage metrics
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push("/dashboard/pricing")}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      View Pricing Plans
                    </button>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
