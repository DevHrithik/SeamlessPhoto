"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  CreditCard,
  DollarSign,
  Zap,
  Check,
  Star,
  Plus,
} from "lucide-react";

export default function Pricing() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("pricing");
  const [isAnnual, setIsAnnual] = useState(false);

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

  const plans = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 19,
      annualPrice: 15.17,
      annualBilled: 182,
      annualSavings: 36.4,
      features: [
        "2 videos per month",
        "Access to 300 AI actors",
        "720p video quality",
        "Email and live chat support",
      ],
      buttonText: "Upgrade to Starter",
      buttonStyle:
        "bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 shadow-md hover:shadow-lg",
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 39,
      annualPrice: 31.17,
      annualBilled: 374,
      annualSavings: 74.8,
      features: [
        "5 videos per month",
        "Access to 300 AI actors",
        "1080p video quality",
        "Email and live chat support",
      ],
      buttonText: "Upgrade to Pro",
      buttonStyle:
        "bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 shadow-md hover:shadow-lg",
    },
    {
      id: "business",
      name: "Business",
      monthlyPrice: 99,
      annualPrice: 79.17,
      annualBilled: 950,
      annualSavings: 190,
      features: [
        "15 videos per month",
        "Access to 300 AI actors",
        "4K video quality",
        "Priority support",
        "Dedicated account manager",
      ],
      buttonText: "Upgrade to Business",
      buttonStyle:
        "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
      popular: true,
    },
    {
      id: "scale",
      name: "Scale",
      monthlyPrice: 149,
      annualPrice: 119.17,
      annualBilled: 1430,
      annualSavings: 286,
      features: [
        "25 videos per month",
        "Access to 300 AI actors",
        "4K video quality",
        "Priority support",
        "Dedicated account manager",
      ],
      buttonText: "Upgrade to Scale",
      buttonStyle:
        "bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 shadow-md hover:shadow-lg",
    },
  ];

  const enterpriseFeatures = [
    "Unlimited videos",
    "Dedicated support",
    "Advanced security features",
    "Custom avatars",
    "Custom integrations",
    "Training sessions",
  ];

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
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              {/* Header */}
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">
                  Choose the Right Plan for Your Business
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Create professional AI-generated UGC videos that convert.
                  Select a plan that matches your content needs.
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="flex justify-center mb-16">
                <div className="bg-white rounded-full p-1 flex items-center shadow-lg border border-gray-200">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                      !isAnnual
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isAnnual
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Annual</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                        Save 20%
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                      plan.popular
                        ? "border-violet-500 shadow-2xl transform scale-105 z-10"
                        : "border-gray-200 hover:border-violet-300 hover:-translate-y-1"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                          🎯 Most Popular
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">
                          {plan.name}
                        </h3>
                        <div className="mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-gray-500 ml-1 text-base">
                            /month
                          </span>
                        </div>
                        {isAnnual && (
                          <div className="text-xs text-gray-500 mt-1">
                            <div className="font-medium">
                              ${plan.annualBilled} billed annually
                            </div>
                            <div className="text-green-600 font-bold">
                              💰 Save ${plan.annualSavings}
                            </div>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-violet-600 font-bold" />
                            </div>
                            <span className="text-gray-700 text-sm font-medium">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle}`}
                      >
                        {plan.buttonText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enterprise Section */}
              <div className="bg-gradient-to-br from-gray-50 to-violet-50 rounded-3xl border border-gray-200 overflow-hidden">
                <div className="p-12">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">
                      Enterprise Solution
                    </h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Tailored for large organizations with specific
                      requirements and high-volume needs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Video className="w-8 h-8 text-violet-600" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">
                        Unlimited Videos
                      </h4>
                      <p className="text-gray-600">
                        Create as many videos as you need without restrictions
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-violet-600" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">
                        Custom Features
                      </h4>
                      <p className="text-gray-600">
                        Custom avatars, integrations, and advanced security
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-violet-600" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">
                        Dedicated Support
                      </h4>
                      <p className="text-gray-600">
                        Priority support with training sessions included
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                      Contact Sales Team
                    </button>
                    <p className="text-gray-500 mt-4">
                      Get a custom quote tailored to your needs
                    </p>
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
