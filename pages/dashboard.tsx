import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useAuth } from "../lib/contexts/AuthContext";
import AdminLayout from "../components/layout/AdminLayout";
import {
  FileText,
  Users,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Zap,
  ArrowRight,
  Activity,
  Award,
  BarChart3,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Skeleton, StatsCardSkeleton } from "@/components/ui/skeleton";

/**
 * Admin Dashboard Page
 * Displays real-time statistics, recent requests, and partner performance
 * Features:
 * - Real-time data updates every 60 seconds
 * - Database-integrated metrics
 * - Mobile-first responsive design
 * - RTL support for Arabic
 * - i18n for all text
 */
export default function DashboardPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { stats, isLoading, isError } = useDashboardStats();

  // Redirect partners to their dashboard
  React.useEffect(() => {
    if (!loading && isAuthenticated && user?.userType === "partner") {
      router.replace("/partner/dashboard");
    }
  }, [user, isAuthenticated, loading, router]);

  // Loading state
  if (isLoading || !stats) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Section Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* Status Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {t("error.loadingFailed")}
          </h3>
          <p className="text-red-700 mb-4">{t("error.tryAgain")}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Main stats cards configuration
  const statCards = [
    {
      title: t("requests.title"),
      value: stats.totalRequests,
      icon: FileText,
      color: "bg-blue-500",
      change: `${stats.requestsGrowth >= 0 ? "+" : ""}${stats.requestsGrowth}%`,
      changeType:
        stats.requestsGrowth >= 0
          ? ("positive" as const)
          : ("negative" as const),
      subtitle: t("dashboard.fromLastMonth"),
    },
    {
      title: t("partners.title"),
      value: stats.activePartners,
      icon: Users,
      color: "bg-green-500",
      change: `${stats.totalPartners} ${t("common.total")}`,
      changeType: "neutral" as const,
      subtitle: t("partners.active"),
    },
    {
      title: t("branches.title"),
      value: stats.activeBranches,
      icon: Building2,
      color: "bg-purple-500",
      change: "",
      changeType: "neutral" as const,
      subtitle: t("branches.active"),
    },
    {
      title: t("dashboard.completionRate"),
      value: `${stats.completionRate}%`,
      icon: CheckCircle,
      color: "bg-emerald-500",
      change: `${stats.averageRating.toFixed(1)} ⭐ ${t("common.rating")}`,
      changeType: "positive" as const,
      subtitle: t("dashboard.customerSatisfaction"),
    },
  ];

  // Status cards configuration
  const statusCards = [
    {
      title: t("unassignedRequests"),
      value: stats.unassignedRequests,
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      hoverColor: "hover:bg-orange-50",
      onClick: () => router.push("/admin/requests/queue"),
      urgent: stats.unassignedRequests > 0,
    },
    {
      title: t("requests.pending"),
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      hoverColor: "hover:bg-yellow-50",
      onClick: () => router.push("/admin/requests?status=assigned"),
    },
    {
      title: t("dashboard.completedToday"),
      value: stats.todayCompleted,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      hoverColor: "hover:bg-green-50",
      onClick: () => router.push("/admin/requests?status=completed"),
    },
    {
      title: t("dashboard.slaBreaches"),
      value: stats.slaBreaches,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      hoverColor: "hover:bg-red-50",
      urgent: stats.slaBreaches > 0,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <BlurFade delay={0}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("dashboard.welcome")}, {user?.name || "Admin"}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  {t("dashboard.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {stats.last30DaysCount}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {t("dashboard.last30Days")}
                  </div>
                </div>
                <div className="h-12 w-px bg-blue-400"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {stats.activePartners}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {t("partners.active")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Urgent: Unassigned Requests Alert */}
        {stats.unassignedRequests > 0 && (
          <BlurFade delay={0.1}>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-xl p-6 text-white border-2 border-orange-400 animate-pulse">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl">
                    <ClipboardList className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-1">
                      {stats.unassignedRequests} {t("unassignedRequests")}
                    </h3>
                    <p className="text-orange-100 text-lg">
                      ⚡ {t("waitingForAssignment")}
                    </p>
                  </div>
                </div>
                <ShimmerButton
                  onClick={() => router.push("/admin/requests/queue")}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg px-6 py-3"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t("navigation.assignmentQueue")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </ShimmerButton>
              </div>
            </div>
          </BlurFade>
        )}

        {/* SLA Breaches Alert */}
        {stats.slaBreaches > 0 && (
          <BlurFade delay={0.15}>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    ⚠️ {stats.slaBreaches} {t("dashboard.slaBreaches")}
                  </h3>
                  <p className="text-red-100">
                    {t("dashboard.slaBreachesDesc")}
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>
        )}

        {/* Main Stats Grid */}
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {card.title}
                      </p>
                      <p className="text-4xl font-bold text-gray-900">
                        {typeof card.value === "number"
                          ? card.value.toLocaleString()
                          : card.value}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${card.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {card.changeType === "positive" && card.change && (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {card.changeType === "negative" && card.change && (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      {card.change && (
                        <span
                          className={`text-sm font-semibold ${
                            card.changeType === "positive"
                              ? "text-green-600"
                              : card.changeType === "negative"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {card.change}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {card.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </BlurFade>

        {/* Status Cards */}
        <BlurFade delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-sm border-2 ${
                    card.urgent ? "border-orange-200" : "border-gray-200"
                  } p-6 ${
                    card.onClick
                      ? `cursor-pointer ${card.hoverColor} transition-all duration-300 hover:-translate-y-1`
                      : ""
                  }`}
                  onClick={card.onClick}
                >
                  <div className="flex items-center">
                    <div className={`p-4 rounded-xl ${card.bgColor} mr-4`}>
                      <Icon className={`h-7 w-7 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                    </div>
                  </div>
                  {card.urgent && (
                    <div className="mt-3 flex items-center text-xs font-medium text-orange-600">
                      <Activity className="w-3 h-3 mr-1" />
                      {t("common.requiresAttention")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </BlurFade>

        {/* Recent Activity & Top Partners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <BlurFade delay={0.4}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  {t("dashboard.recentRequests")}
                </h3>
                <button
                  onClick={() => router.push("/admin/requests")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {t("common.viewAll")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {stats.recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    {t("common.noData")}
                  </div>
                ) : (
                  stats.recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-3 rounded-lg transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/requests/${request.id}`)
                      }
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          REQ-{request.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.customerName} - {request.customerPhone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            request.status === "completed" ||
                            request.status === "closed"
                              ? "bg-green-100 text-green-800"
                              : request.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "assigned" ||
                                request.status === "confirmed"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {t(`requests.${request.status}`)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </BlurFade>

          {/* Top Partners */}
          <BlurFade delay={0.5}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                  {t("dashboard.topPartners")}
                </h3>
                <button
                  onClick={() => router.push("/admin/partners")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {t("common.viewAll")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {stats.topPartners.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    {t("common.noData")}
                  </div>
                ) : (
                  stats.topPartners.map((partner, index) => (
                    <div
                      key={partner.partnerId}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-3 rounded-lg transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/partners/${partner.partnerId}`)
                      }
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {partner.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {partner.completedRequests}{" "}
                            {t("requests.completed")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            {partner.rating.toFixed(1)}
                          </span>
                          <span className="text-yellow-500 text-lg">★</span>
                        </div>
                        <p
                          className={`text-xs font-medium mt-1 ${
                            partner.status === "Excellent"
                              ? "text-green-600"
                              : partner.status === "Good"
                              ? "text-blue-600"
                              : partner.status === "Average"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {t(`common.${partner.status.toLowerCase()}`)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </BlurFade>
        </div>

        {/* Status Distribution */}
        <BlurFade delay={0.6}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              {t("dashboard.requestsDistribution")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {stats.requestsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/requests?status=${item.status}`)
                  }
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {item.count}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {t(`requests.${item.status}`)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>

        {/* Auto-refresh indicator */}
        <div className="text-center text-xs text-gray-500">
          <Activity className="w-3 h-3 inline mr-1" />
          {t("dashboard.autoRefresh")}
        </div>
      </div>
    </AdminLayout>
  );
}
