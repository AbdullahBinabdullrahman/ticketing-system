"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import PartnerLayout from "../../components/layout/PartnerLayout";
import RequestStatusBadge from "../../components/shared/RequestStatusBadge";
import {
  FileText,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { BlurFade } from "../../components/ui/blur-fade";
import { cn } from "../../lib/utils";
import { format, differenceInMinutes } from "date-fns";
import {
  usePartnerRequests,
  type PartnerRequestResponse,
} from "@/hooks/usePartnerRequests";
import { RequestFiltersInput } from "@/schemas/requests";

/**
 * Partner Requests List Page
 * Displays all requests assigned to the partner's branches with filters and actions
 */
export default function PartnerRequestsPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<RequestFiltersInput>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { requests, pagination, isLoading } = usePartnerRequests(filters);

  const statusOptions = [
    { value: "", label: t("common.selectOption"), color: "gray" },
    { value: "assigned", label: t("requests.assigned"), color: "yellow" },
    { value: "confirmed", label: t("requests.confirmed"), color: "blue" },
    { value: "in_progress", label: t("requests.inProgress"), color: "purple" },
    { value: "completed", label: t("requests.completed"), color: "green" },
    { value: "rejected", label: t("requests.rejected"), color: "red" },
  ];

  const handleStatusFilter = (status: string) => {
    setFilters(
      (prev: RequestFiltersInput) =>
        ({
          ...prev,
          status: status || undefined,
          page: 1,
        } as RequestFiltersInput)
    );
  };

  const handleRequestClick = (requestNumber: string) => {
    router.push(`/partner/requests/${requestNumber}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounce implementation would go here
  };

  /**
   * Calculate remaining SLA time in minutes
   */
  const calculateSLARemaining = (assignedAt: string, slaDeadline: string) => {
    const now = new Date();
    const deadline = new Date(slaDeadline);
    return differenceInMinutes(deadline, now);
  };

  /**
   * Get SLA status color
   */
  const getSLAColor = (remainingMinutes: number) => {
    if (remainingMinutes < 0) return "text-red-600 bg-red-50";
    if (remainingMinutes <= 5) return "text-orange-600 bg-orange-50";
    if (remainingMinutes <= 10) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  // Filter requests based on search query
  const filteredRequests = requests?.filter(
    (request: PartnerRequestResponse) => {
      if (!searchQuery) return true;
      return (
        request.requestNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.customerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.customerPhone.includes(searchQuery)
      );
    }
  );

  return (
    <PartnerLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="space-y-6">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("navigation.requests")}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("requests.manageAssignedRequests") ||
                  "Manage your assigned service requests"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {
                    filteredRequests.filter((r) => r.status === "assigned")
                      .length
                  }{" "}
                  {t("requests.pendingConfirmation") || "Pending Confirmation"}
                </span>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Filters and Search */}
        <BlurFade delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t("common.search") + "..."}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400 " />
                <select
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  value={filters.status || ""}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white min-w-[180px]"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Requests List */}
        {isLoading ? (
          <BlurFade delay={0.3}>
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </BlurFade>
        ) : filteredRequests.length === 0 ? (
          <BlurFade delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("common.noData")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filters.status
                  ? `${t("requests.noRequestsWith")} ${
                      statusOptions.find((o) => o.value === filters.status)
                        ?.label
                    }`
                  : t("requests.noRequestsAssigned") ||
                    "No requests have been assigned yet"}
              </p>
            </div>
          </BlurFade>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, index) => {
              const isAssigned = request.status === "assigned";
              const slaRemaining =
                isAssigned && request.slaDeadline
                  ? calculateSLARemaining(
                      request.createdAt,
                      request.slaDeadline
                    )
                  : null;

              return (
                <BlurFade key={request.id} delay={0.1 * (index % 5)}>
                  <div
                    onClick={() => handleRequestClick(request.requestNumber)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer overflow-hidden group"
                  >
                    {/* SLA Warning Banner for Assigned Requests */}
                    {isAssigned &&
                      slaRemaining !== null &&
                      slaRemaining <= 10 && (
                        <div
                          className={cn(
                            "px-4 py-2 flex items-center gap-2 text-sm font-medium border-b",
                            getSLAColor(slaRemaining)
                          )}
                        >
                          <AlertCircle className="h-4 w-4" />
                          {slaRemaining < 0 ? (
                            <span>
                              {t("requests.slaExpired") || "SLA Expired"} -{" "}
                              {Math.abs(slaRemaining)}{" "}
                              {t("common.minutesAgo") || "minutes ago"}
                            </span>
                          ) : (
                            <span>
                              {t("requests.slaRemaining") || "Confirm within"}{" "}
                              {slaRemaining} {t("common.minutes") || "minutes"}
                            </span>
                          )}
                        </div>
                      )}

                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Request Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {request.requestNumber}
                            </h3>
                            <RequestStatusBadge status={request.status} />
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                {t("requests.customer")}:
                              </span>
                              <span>{request.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                {t("common.phone")}:
                              </span>
                              <span dir="ltr">{request.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                {t("common.address")}:
                              </span>
                              <span className="truncate">
                                {request.customerAddress}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(request.createdAt), "PPp")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Indicators */}
                        <div className="flex sm:flex-col gap-2 sm:items-end">
                          {isAssigned && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/partner/requests/${request.requestNumber}?action=accept`
                                  );
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {t("requests.accept") || "Accept"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/partner/requests/${request.requestNumber}?action=reject`
                                  );
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                              >
                                <XCircle className="h-4 w-4" />
                                {t("requests.reject") || "Reject"}
                              </button>
                            </div>
                          )}
                          {request.status === "confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/partner/requests/${request.requestNumber}?action=start`
                                );
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                            >
                              {t("requests.startWork") || "Start Work"}
                            </button>
                          )}
                          {request.status === "in_progress" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/partner/requests/${request.requestNumber}?action=complete`
                                );
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                            >
                              {t("requests.markComplete") || "Mark Complete"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <BlurFade delay={0.5}>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("common.showing")} {filteredRequests.length} {t("common.of")}{" "}
                {pagination.total} {t("navigation.requests")}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters((prev: RequestFiltersInput) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors"
                >
                  {t("common.previous")}
                </button>
                <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("common.page")} {filters.page} {t("common.of")}{" "}
                  {pagination.totalPages}
                </div>
                <button
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters((prev: RequestFiltersInput) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors"
                >
                  {t("common.next")}
                </button>
              </div>
            </div>
          </BlurFade>
        )}
      </div>
    </PartnerLayout>
  );
}
