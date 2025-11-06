/**
 * Customer Portal Layout
 * Simple layout for customer-facing pages
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

import {
  FileText,
  Plus,
  LogOut,
  Menu,
  X,
  Globe,
  AlertCircle,
} from "lucide-react";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    {
      name: t("customer.myRequests"),
      href: "/customer/requests",
      icon: FileText,
    },
    {
      name: t("customer.newRequest"),
      href: "/customer/requests/new",
      icon: Plus,
    },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  //       </div>
  //     );
  //   }

  //   if (!isAuthenticated) {
  //     return null;
  //   }

  const isRtl = i18n.language === "ar";

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Test Mode Banner */}
      <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
        <AlertCircle className="inline h-4 w-4 mr-2" />
        {t("customer.testMode")} - This portal simulates mobile app API calls
        using test customer account
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("customer.portal")}
          </h1>
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Globe className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 ${
            isRtl ? "right-0" : "left-0"
          } z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out lg:shadow-none`}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {t("customer.portal")}
              </h1>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Globe className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                // onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="font-medium">{t("auth.logout")}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
