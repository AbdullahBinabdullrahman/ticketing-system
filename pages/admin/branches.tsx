"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../components/layout/AdminLayout";
import { BlurFade } from "../../components/ui/blur-fade";
import {
  Building2,
  MapPin,
  Phone,
  User,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { useBranches } from "../../hooks/useBranches";
import { usePartners } from "../../hooks/usePartners";
import { Skeleton } from "../../components/ui/skeleton";
import toast from "react-hot-toast";

// interface Branch {
//   id: number;
//   partnerId: number;
//   name: string;
//   address: string;
//   lat: number;
//   lng: number;
//   serviceRadius: number;
//   contactName?: string;
//   contactPhone?: string;
//   createdAt: string;
//   updatedAt: string;
//   partner?: {
//     id: number;
//     name: string;
//   };
// }

export default function AdminBranchesPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const isRtl = i18n.language === "ar";

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");

  // Fetch data
  const {
    branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranches();
  const { partners, isLoading: partnersLoading } = usePartners();

  // Filter branches based on search and partner filter
  const filteredBranches = React.useMemo(() => {
    if (!branches) return [];

    let filtered = branches;

    // Filter by partner
    if (selectedPartnerId !== "all") {
      const partnerId = parseInt(selectedPartnerId, 10);
      filtered = filtered.filter((b) => b.partnerId === partnerId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.address.toLowerCase().includes(query) ||
          b.contactName?.toLowerCase().includes(query) ||
          b.contactPhone?.includes(query)
      );
    }

    return filtered;
  }, [branches, selectedPartnerId, searchQuery]);

  // Get partner name by ID
  const getPartnerName = (partnerId: number) => {
    const partner = partners?.find((p) => p.id === partnerId);
    return partner?.name || `Partner #${partnerId}`;
  };

  // Handle edit branch
  const handleEdit = (branchId: number) => {
    toast.error(`Branch editing coming soon! ${branchId}`);
    // TODO: Navigate to edit page when implemented
    // router.push(`/admin/branches/${branchId}/edit`);
  };

  // Handle delete branch
  const handleDelete = (branchId: number) => {
    toast.error(`Branch deletion coming soon! ${branchId}`);
    // TODO: Implement delete functionality
  };

  if (branchesLoading || partnersLoading) {
    return (
      <AdminLayout>
        <div dir={isRtl ? "rtl" : "ltr"}>
          <div className="mb-6">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (branchesError) {
    return (
      <AdminLayout>
        <div dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("branches.loadError")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {branchesError.message || "Failed to load branches"}
            </p>
            <button
              onClick={() => router.reload()}
              className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div dir={isRtl ? "rtl" : "ltr"}>
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("branches.title")}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {t("branches.description")}
              </p>
            </div>
          </div>
        </BlurFade>

        {/* Stats */}
        <BlurFade delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className=" from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                    {t("branches.totalBranches")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {branches?.length || 0}
                  </p>
                </div>
                <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className=" from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                    {t("branches.activePartners")}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {partners?.length || 0}
                  </p>
                </div>
                <User className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className=" from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                    {t("branches.filtered")}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {filteredBranches.length}
                  </p>
                </div>
                <Filter className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Filters */}
        <BlurFade delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("branches.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Partner Filter */}
              <div>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{t("branches.allPartners")}</option>
                  {partners?.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Branches Grid */}
        {filteredBranches.length === 0 ? (
          <BlurFade delay={0.25}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || selectedPartnerId !== "all"
                  ? t("branches.noMatchingBranches")
                  : t("branches.noBranches")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedPartnerId !== "all"
                  ? t("branches.tryDifferentFilter")
                  : t("branches.createFirstBranch")}
              </p>
            </div>
          </BlurFade>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch, index) => (
              <BlurFade key={branch.id} delay={0.25 + index * 0.05}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden">
                  {/* Partner Badge */}
                  <div className=" from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 px-4 py-2">
                    <p className="text-white text-sm font-semibold truncate">
                      {getPartnerName(branch.partnerId)}
                    </p>
                  </div>

                  {/* Branch Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 truncate">
                      {branch.name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {/* Address */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 " />
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {branch.address}
                        </p>
                      </div>

                      {/* Contact Name */}
                      {branch.contactName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400 " />
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {branch.contactName}
                          </p>
                        </div>
                      )}

                      {/* Contact Phone */}
                      {branch.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 " />
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {branch.contactPhone}
                          </p>
                        </div>
                      )}

                      {/* Service Radius */}
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 text-gray-500 dark:text-gray-400  flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full border-2 border-gray-500 dark:border-gray-400"></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("branches.serviceRadius")}: {branch.serviceRadius}{" "}
                          km
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(branch.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
