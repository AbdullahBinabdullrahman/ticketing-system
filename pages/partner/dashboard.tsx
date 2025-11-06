"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import PartnerLayout from "../../components/layout/PartnerLayout";
import StatsCard from "../../components/shared/StatsCard";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  XCircle,
} from "lucide-react";
import { BlurFade } from "../../components/ui/blur-fade";
import { usePartnerStats } from "../../hooks/usePartnerStats";
import Link from "next/link";

export default function PartnerDashboard() {
  const { t, i18n } = useTranslation("common");
  const { stats, isLoading } = usePartnerStats();

  if (isLoading) {
    return (
      <PartnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("partner.dashboard.welcome")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("partner.dashboard.overview")}
            </p>
          </div>
        </BlurFade>

        {/* Urgent Requests Alert */}
        {stats.pendingConfirmation > 0 && (
          <BlurFade delay={0.15}>
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {t("partner.dashboard.pendingAction")}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {stats.pendingConfirmation}{" "}
                  {t("partner.stats.pendingConfirmation")}
                </p>
              </div>
              <Link
                href="/partner/requests?status=assigned"
                className="px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-800 rounded-md hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
              >
                {t("common.viewAll")}
              </Link>
            </div>
          </BlurFade>
        )}

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <BlurFade delay={0.2}>
            <StatsCard
              title={t("partner.stats.totalRequests")}
              value={stats.totalRequests}
              icon={FileText}
              color="bg-indigo-500"
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <StatsCard
              title={t("partner.stats.pendingConfirmation")}
              value={stats.pendingConfirmation}
              icon={Clock}
              color="bg-amber-500"
            />
          </BlurFade>
          <BlurFade delay={0.3}>
            <StatsCard
              title={t("partner.stats.inProgress")}
              value={stats.inProgress}
              icon={CheckCircle2}
              color="bg-purple-500"
            />
          </BlurFade>
          <BlurFade delay={0.35}>
            <StatsCard
              title={t("partner.stats.completed")}
              value={stats.completed}
              icon={TrendingUp}
              color="bg-green-500"
            />
          </BlurFade>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BlurFade delay={0.4}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("partner.stats.completionRate")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completionRate}%
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.45}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("partner.stats.avgHandlingTime")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgHandlingTime} {t("partner.stats.minutes")}
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.5}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("partner.stats.avgRating")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgRating}/5.0
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>

        {/* Additional Stats */}
        <BlurFade delay={0.55}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("partner.stats.performance")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("partner.stats.totalRequests")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRequests}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("partner.stats.completed")}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("partner.stats.rejected")}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("partner.stats.rejectionRate")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.rejectionRate}%
                </p>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Quick Actions */}
        <BlurFade delay={0.6}>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/partner/requests"
              className="block bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("partner.dashboard.viewAllRequests")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("partner.dashboard.activeRequests")}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/partner/profile"
              className="block bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("partner.profile.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("partner.dashboard.performanceMetrics")}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </BlurFade>
      </div>
    </PartnerLayout>
  );
}
