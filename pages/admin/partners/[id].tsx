"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/layout/AdminLayout";
import { usePartner } from "../../../hooks/usePartners";
import { useAdminPartnerUsers } from "../../../hooks/useAdminPartnerUsers";
import { BlurFade } from "../../../components/ui/blur-fade";
import { ShimmerButton } from "../../../components/ui/shimmer-button";
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Users,
  Tag,
  Award,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Info,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { Skeleton, StatsCardSkeleton } from "../../../components/ui/skeleton";

export default function PartnerDetailPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const partnerId = id ? parseInt(id as string) : null;

  const { partner, isLoading, isError } = usePartner(partnerId);
  const { users: partnerUsers, isLoading: usersLoading } = useAdminPartnerUsers(partnerId);

  if (isLoading) {
    return (
      <AdminLayout>
        <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !partner) {
    return (
      <AdminLayout>
        <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("partners.notFound")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("partners.notFoundDescription")}
            </p>
            <button
              onClick={() => router.push("/admin/partners")}
              className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
            >
              {t("partners.backToList")}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {partner.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      partner.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : partner.status === "inactive"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {t(`partners.${partner.status}`)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {partner.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/partners/${partnerId}/edit`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {t("partners.editPartner")}
              </button>
            </div>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <BlurFade delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary-500" />
                  {t("common.contactInfo")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partner.contactEmail && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("partners.contactEmail")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {partner.contactEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  {partner.contactPhone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("partners.contactPhone")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {partner.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {!partner.contactEmail && !partner.contactPhone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {t("partners.noContactInfo")}
                  </p>
                )}
              </div>
            </BlurFade>

            {/* Branches Section */}
            <BlurFade delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary-500" />
                    {t("partners.branches")} ({partner.branchesCount || 0})
                  </h2>
                  <ShimmerButton
                    onClick={() =>
                      router.push(`/admin/partners/${partnerId}/branches/new`)
                    }
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("branches.newBranch")}
                  </ShimmerButton>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                  <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm text-blue-900 dark:text-blue-200 mb-2">
                    {t("branches.addBranchPrompt")}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {t("branches.branchesNeededForAssignment")}
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Categories Section */}
            <BlurFade delay={0.4}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary-500" />
                    {t("partners.categories")} ({partner.categoriesCount || 0})
                  </h2>
                  <button
                    onClick={() =>
                      router.push(`/admin/partners/${partnerId}/categories`)
                    }
                    className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    {t("partners.manageCategories")}
                  </button>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
                  <Tag className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <p className="text-sm text-orange-900 dark:text-orange-200 mb-2">
                    {t("categories.assignCategoriesPrompt")}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {t("categories.categoriesNeededForRequests")}
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Pickup Options Section */}
            <BlurFade delay={0.5}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary-500" />
                    {t("partners.pickupOptions")}
                  </h2>
                  <button
                    onClick={() =>
                      router.push(`/admin/partners/${partnerId}/pickup-options`)
                    }
                    className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    {t("partners.managePickupOptions")}
                  </button>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">
                    {t("pickupOptions.assignPickupOptionsPrompt")}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {t("pickupOptions.pickupOptionsDefineServices")}
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Users Section */}
            <BlurFade delay={0.6}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-500" />
                    {t("users.title")} ({usersLoading ? "..." : partnerUsers.length})
                  </h2>
                  <button
                    onClick={() =>
                      router.push(`/admin/partners/${partnerId}/users`)
                    }
                    className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    {t("users.manageUsers")}
                  </button>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-10 w-10 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                          {partnerUsers.length === 0
                            ? t("users.noUsers")
                            : `${partnerUsers.length} ${t("common.active")} ${partnerUsers.length === 1 ? t("users.user") : t("users.users")}`}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                          {t("users.manageAccessAndPermissions")}
                        </p>
                      </div>
                    </div>
                    <ShimmerButton
                      onClick={() =>
                        router.push(`/admin/partners/${partnerId}/users`)
                      }
                      size="sm"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("users.addUser")}
                    </ShimmerButton>
                  </div>
                  {partnerUsers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-700 dark:text-indigo-300">
                          {t("users.activeUsers")}: {partnerUsers.filter(u => u.isActive).length}
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/admin/partners/${partnerId}/users`)
                          }
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          {t("common.viewAll")} →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            {/* Partner Logo */}
            {partner.logoUrl && partner.logoUrl.startsWith('http') && (
              <BlurFade delay={0.2}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t("partners.logo")}
                  </h3>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </BlurFade>
            )}

            {/* Performance Stats */}
            <BlurFade delay={0.3}>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg shadow-sm border border-primary-200 dark:border-primary-700 p-6">
                <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-4 uppercase tracking-wide">
                  {t("partners.performance")}
                </h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t("partners.totalRequests")}
                      </span>
                      <Users className="h-4 w-4 text-primary-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {partner.requestsCount || 0}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t("partners.completedRequests")}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {partner.completedRequestsCount || 0}
                    </p>
                  </div>

                  {partner.averageRating && partner.averageRating > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t("partners.averageRating")}
                        </span>
                        <Award className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {partner.averageRating.toFixed(1)}
                        <span className="text-sm text-gray-500 ml-1">/5</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </BlurFade>

            {/* Quick Actions */}
            <BlurFade delay={0.4}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t("common.quickActions")}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      router.push(`/admin/requests?partnerId=${partnerId}`)
                    }
                    className="w-full px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {t("partners.viewRequests")}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/admin/reports/partners?id=${partnerId}`)
                    }
                    className="w-full px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {t("partners.viewReports")}
                  </button>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

