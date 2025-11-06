/**
 * Unauthorized Access Page
 * Displayed when a user tries to access a route they don't have permission for
 */

import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/contexts/AuthContext";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { ShimmerButton } from "../components/ui/shimmer-button";
import { BlurFade } from "../components/ui/blur-fade";

export default function UnauthorizedPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user?.userType === "admin") {
      router.push("/dashboard");
    } else if (user?.userType === "partner") {
      router.push("/partner/dashboard");
    } else if (user?.userType === "customer") {
      router.push("/customer/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <BlurFade delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-red-100 dark:border-red-900">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t("errors.unauthorized") || "Access Denied"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("errors.unauthorizedMessage") ||
                  "You don't have permission to access this page."}
              </p>
            </div>

            <div className="space-y-3">
              <ShimmerButton
                onClick={handleGoHome}
                className="w-full"
                background="rgb(99, 102, 241)"
              >
                <Home className="w-5 h-5 mr-2" />
                {t("common.goHome") || "Go to Home"}
              </ShimmerButton>

              <button
                onClick={() => router.back()}
                className="w-full px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("common.goBack") || "Go Back"}
              </button>
            </div>

            {user && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("auth.loggedInAs") || "Logged in as"}:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t("common.role")}: {user.userType}
                </p>
              </div>
            )}
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

