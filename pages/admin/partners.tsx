"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../components/layout/AdminLayout";
import { usePartners } from "../../hooks/usePartners";
import { Building2, Users, Tag, Award, Plus, Eye } from "lucide-react";
import { BlurFade } from "../../components/ui/blur-fade";
import { ShimmerButton } from "../../components/ui/shimmer-button";
import { CardSkeleton } from "../../components/ui/skeleton";
import { PartnerFiltersInput } from "@/schemas/partners";
import Image from "next/image";

export default function AdminPartnersPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [filters, setFilters] = useState<PartnerFiltersInput>({
    page: 1,
    limit: 12,
    search: "",
    status: "active",
    sortBy: "name",
    sortOrder: "asc",
  });

  const { partners, pagination, isLoading } = usePartners(filters);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleViewPartner = (partnerId: number) => {
    router.push(`/admin/partners/${partnerId}`);
  };

  return (
    <AdminLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <BlurFade delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
              {t("partners.title")}
            </h1>
            <ShimmerButton onClick={() => router.push("/admin/partners/new")}>
              <Plus className="h-5 w-5 mr-2" />
              {t("partners.newPartner")}
            </ShimmerButton>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="search"
                placeholder={t("common.search")}
                value={filters.search}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
              />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t("partners.status")}</option>
                <option value="active">{t("partners.active")}</option>
                <option value="inactive">{t("partners.inactive")}</option>
                <option value="suspended">{t("partners.suspended")}</option>
              </select>
            </div>
          </div>
        </BlurFade>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <BlurFade delay={0.3}>
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("common.noData")}
              </p>
            </div>
          </BlurFade>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner, index) => (
                <BlurFade key={partner.id} delay={0.2 + index * 0.05}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {partner.logoUrl && partner.logoUrl.startsWith('http') ? (
                          <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          </div>
                        )}
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {partner.name}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                              partner.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : partner.status === "inactive"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {t(`partners.${partner.status}`)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building2 className="h-4 w-4 mr-2" />
                        {partner.branchesCount || 0} {t("partners.branches")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Tag className="h-4 w-4 mr-2" />
                        {partner.categoriesCount || 0}{" "}
                        {t("partners.categories")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        {partner.completedRequestsCount || 0}{" "}
                        {t("partners.totalRequests")}
                      </div>
                      {partner.averageRating && partner.averageRating > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Award className="h-4 w-4 mr-2 text-yellow-500" />
                          {partner.averageRating.toFixed(1)}{" "}
                          {t("partners.averageRating")}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleViewPartner(partner.id)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("common.view")}
                      </button>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <BlurFade delay={0.5}>
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.previous")}
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("common.page")} {pagination.page} {t("common.of")}{" "}
                    {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.next")}
                  </button>
                </div>
              </BlurFade>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
