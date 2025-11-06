"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import CustomerLayout from "@/components/layout/CustomerLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import {
  Search,
  Plus,
  FileText,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { http } from "@/lib/utils/index";

export default function CustomerRequestsPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const isRtl = i18n.language === "ar";

  const [requestNumber, setRequestNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestNumber.trim()) {
      toast.error(t("customer.enterRequestNumber"));
      return;
    }

    setIsSearching(true);

    try {
      // Search for request by number
      // The API will return the request or 404
      const response = await http.get(
        `/api/customer/requests/search?number=${encodeURIComponent(
          requestNumber
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("customerToken")}`,
          },
        }
      );

      // Axios returns status 200-299 as successful
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        // Navigate to the request detail page using request number
        router.push(`/customer/requests/${data.requestNumber}`);
      } else if (response.status === 404) {
        toast.error(t("customer.requestNotFoundByNumber"));
      } else {
        toast.error(t("errors.generic"));
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(t("errors.generic"));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <CustomerLayout>
      <div dir={isRtl ? "rtl" : "ltr"} className="max-w-4xl mx-auto">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t("customer.portal")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("customer.portalDescription")}
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit New Request Card */}
          <BlurFade delay={0.2}>
            <div className="p-8 h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t("customer.submitNewRequest")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("customer.submitNewRequestDescription")}
                </p>
              </div>
              <ShimmerButton
                onClick={() => router.push("/customer/requests/new")}
                className="w-full"
              >
                <Plus className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                {t("customer.createRequest")}
                <ArrowRight className={`h-5 w-5 ${isRtl ? "mr-2" : "ml-2"}`} />
              </ShimmerButton>
            </div>
          </BlurFade>

          {/* Track Request Card */}
          <BlurFade delay={0.3}>
            <div className="p-8 h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t("customer.trackRequest")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("customer.trackRequestDescription")}
                </p>
              </div>

              <form onSubmit={handleSearchRequest} className="space-y-4">
                <div>
                  <label
                    htmlFor="requestNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <FileText className="inline h-4 w-4 mr-1" />
                    {t("customer.requestNumber")}
                  </label>
                  <input
                    id="requestNumber"
                    type="text"
                    value={requestNumber}
                    onChange={(e) => setRequestNumber(e.target.value)}
                    placeholder={t("customer.enterRequestNumberPlaceholder")}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? (
                    <>
                      <Loader2
                        className={`h-5 w-5 animate-spin ${
                          isRtl ? "ml-2" : "mr-2"
                        }`}
                      />
                      {t("customer.searching")}
                    </>
                  ) : (
                    <>
                      <Search
                        className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`}
                      />
                      {t("customer.searchRequest")}
                    </>
                  )}
                </button>
              </form>
            </div>
          </BlurFade>
        </div>

        {/* Info Section */}
        <BlurFade delay={0.4}>
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {t("customer.howItWorks")}
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>{t("customer.step1")}</li>
                  <li>{t("customer.step2")}</li>
                  <li>{t("customer.step3")}</li>
                  <li>{t("customer.step4")}</li>
                </ul>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </CustomerLayout>
  );
}
