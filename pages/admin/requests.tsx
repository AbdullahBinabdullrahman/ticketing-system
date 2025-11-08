"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import RequestCard from "../../components/shared/RequestCard";
import StatsCard from "../../components/shared/StatsCard";
import {
  FileText,
  Clock,
  CheckCircle,
  Filter,
  Download,
  Zap,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { BlurFade } from "../../components/ui/blur-fade";
import { useRequests } from "@/hooks/useRequests";
import { RequestFiltersInput } from "@/schemas/requests";
import AssignRequestModal from "../../components/modals/AssignRequestModal";
import RequestDetailsModal from "../../components/modals/RequestDetailsModal";
import { CardSkeleton, StatsCardSkeleton } from "../../components/ui/skeleton";

/**
 * Admin Requests Page
 * Features:
 * - Real-time data with SWR
 * - Advanced filtering and search
 * - Quick assign functionality
 * - Request details modal
 * - Export functionality
 * - Mobile-responsive design
 * - RTL support
 * - i18n translations
 */
export default function AdminRequestsPage() {
  const { t } = useTranslation("common");
  const router = useRouter();

  // Modal states
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<RequestFiltersInput>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch requests with filters
  const { requests, pagination, isLoading, mutate, isError } =
    useRequests(filters);

  // Calculate statistics
  const stats = {
    total: pagination?.total || 0,
    unassigned: requests.filter((r) =>
      ["submitted", "unassigned"].includes(r.status)
    ).length,
    pending: requests.filter((r) =>
      ["assigned", "confirmed"].includes(r.status)
    ).length,
    inProgress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) =>
      ["completed", "closed"].includes(r.status)
    ).length,
  };

  // Status options for filter dropdown
  const statusOptions = [
    { value: "", label: t("filters.allStatuses"), color: "bg-gray-500" },
    {
      value: "submitted",
      label: t("requests.submitted"),
      color: "bg-blue-500",
    },
    {
      value: "unassigned",
      label: t("requests.unassigned"),
      color: "bg-orange-500",
    },
    {
      value: "assigned",
      label: t("requests.assigned"),
      color: "bg-yellow-500",
    },
    {
      value: "confirmed",
      label: t("requests.confirmed"),
      color: "bg-purple-500",
    },
    {
      value: "in_progress",
      label: t("requests.inProgress"),
      color: "bg-indigo-500",
    },
    {
      value: "completed",
      label: t("requests.completed"),
      color: "bg-green-500",
    },
    { value: "closed", label: t("requests.closed"), color: "bg-gray-500" },
    { value: "rejected", label: t("requests.rejected"), color: "bg-red-500" },
  ];

  // Sort options
  const sortOptions = [
    { value: "createdAt", label: t("filters.sortByCreated") },
    { value: "updatedAt", label: t("filters.sortByUpdated") },
    { value: "submittedAt", label: t("filters.sortBySubmitted") },
    { value: "assignedAt", label: t("filters.sortByAssigned") },
    { value: "completedAt", label: t("filters.sortByCompleted") },
  ];

  /**
   * Handle status filter change
   */
  const handleStatusFilter = (status: string) => {
    setFilters(
      (prev) =>
        ({
          ...prev,
          status: status || undefined,
          page: 1,
        } as RequestFiltersInput)
    );
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as any,
      page: 1,
    }));
  };

  /**
   * Handle sort order toggle
   */
  const handleSortOrderToggle = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  /**
   * Handle search
   */
  const handleSearch = () => {
    // In a full implementation, add search query to filters
    // For now, we'll filter locally
    mutate();
  };

  /**
   * Handle request card click
   */
  const handleRequestClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowDetailsModal(true);
  };

  /**
   * Handle quick assign
   */
  const handleQuickAssign = (e: React.MouseEvent, requestId: number) => {
    e.stopPropagation();
    setSelectedRequestId(requestId);
    setShowAssignModal(true);
  };

  /**
   * Handle assign success
   */
  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedRequestId(null);
    mutate(); // Refresh the list
  };

  /**
   * Handle export
   */
  const handleExport = () => {
    // TODO: Implement export functionality
    const csv = generateCSV(requests);
    downloadCSV(csv, `requests-${new Date().toISOString()}.csv`);
  };

  /**
   * Generate CSV from requests
   */
  const generateCSV = (data: any[]) => {
    const headers = [
      "ID",
      "Customer",
      "Phone",
      "Address",
      "Status",
      "Created",
      "Updated",
    ];
    const rows = data.map((req) => [
      req.requestNumber,
      req.customerName,
      req.customerPhone,
      req.customerAddress,
      req.status,
      new Date(req.createdAt).toLocaleString(),
      new Date(req.updatedAt).toLocaleString(),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  /**
   * Download CSV file
   */
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchQuery("");
  };

  /**
   * Filter requests by search query (client-side)
   */
  const filteredRequests = searchQuery
    ? requests.filter(
        (req) =>
          req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.customerPhone.includes(searchQuery) ||
          req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <BlurFade delay={0}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("navigation.requests")}
              </h1>
              <p className="text-gray-600">{t("requests.manageDescription")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => mutate()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                title={t("common.refresh")}
              >
                <RefreshCw className="w-4 h-4" />
                {t("common.refresh")}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Download className="w-4 h-4" />
                {t("common.export")}
              </button>
            </div>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        <BlurFade delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title={t("navigation.requests")}
              value={stats.total}
              icon={FileText}
              color="bg-blue-500"
              className="transition-colors cursor-pointer"
              onClick={() => handleClearFilters()}
            />
            <StatsCard
              title={t("unassignedRequests")}
              value={stats.unassigned}
              icon={AlertCircle}
              color="bg-orange-500"
              className="transition-colors cursor-pointer"
              onClick={() => handleStatusFilter("unassigned")}
            />
            <StatsCard
              title={t("requests.pending")}
              value={stats.pending}
              icon={Clock}
              color="bg-yellow-500"
              className="transition-colors cursor-pointer"
              onClick={() => handleStatusFilter("assigned")}
            />
            <StatsCard
              title={t("requests.inProgress")}
              value={stats.inProgress}
              icon={TrendingUp}
              color="bg-purple-500"
              className="transition-colors cursor-pointer"
              onClick={() => handleStatusFilter("in_progress")}
            />
            <StatsCard
              title={t("requests.completed")}
              value={stats.completed}
              icon={CheckCircle}
              color="bg-green-500"
              className="transition-colors cursor-pointer"
              onClick={() => handleStatusFilter("completed")}
            />
          </div>
        </BlurFade>

        {/* Search and Filters Bar */}
        <BlurFade delay={0.2}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("searchByCustomerOrPhone")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filters.status || ""}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium min-w-[180px]"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSortOrderToggle}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={
                    filters.sortOrder === "desc"
                      ? t("filters.descending")
                      : t("filters.ascending")
                  }
                >
                  <TrendingUp
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      filters.sortOrder === "asc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Clear Filters */}
              {(filters.status || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
                >
                  {t("filters.clear")}
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            {(filters.status || searchQuery) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  {t("filters.active")}:
                </span>
                {filters.status && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {t(`requests.${filters.status}`)}
                    <button
                      onClick={() => handleStatusFilter("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </BlurFade>

        {/* Requests List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <BlurFade delay={0.3}>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">
                {t("error.loadingFailed")}
              </h3>
              <p className="text-red-700 mb-6">{t("error.tryAgain")}</p>
              <button
                onClick={() => mutate()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t("common.retry")}
              </button>
            </div>
          </BlurFade>
        ) : filteredRequests.length === 0 ? (
          <BlurFade delay={0.3}>
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("requests.noRequestsFound")}
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.status
                  ? t("requests.noRequestsWithStatus", {
                      status: filters.status,
                    })
                  : searchQuery
                  ? t("requests.noRequestsMatchingSearch")
                  : t("requests.createFirstRequest")}
              </p>
              {(filters.status || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t("filters.clearAll")}
                </button>
              )}
            </div>
          </BlurFade>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, index) => (
              <BlurFade key={request.id} delay={0.05 * (index % 10)}>
                <div className="group">
                  <RequestCard
                    requestNumber={request.requestNumber}
                    customerName={request.customerName}
                    customerPhone={request.customerPhone}
                    customerAddress={request.customerAddress}
                    status={request.status}
                    createdAt={request.createdAt}
                    onClick={() => handleRequestClick(request.id)}
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  />

                  {/* Action Bar Below Card */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    {/* Location indicator */}
                    {request.customerLat && request.customerLng && (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MapPin className="w-3.5 h-3.5" />
                        {t("common.viewLocation")}
                      </div>
                    )}

                    {/* Spacer when no location */}
                    {!request.customerLat && !request.customerLng && (
                      <div className="flex-1" />
                    )}

                    {/* Quick Assign Button - Available for all statuses except completed/closed */}
                    {!["completed", "closed"].includes(request.status) && (
                      <button
                        onClick={(e) => handleQuickAssign(e, request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md font-semibold text-sm hover:scale-105 transform hover:shadow-lg"
                      >
                        <Zap className="w-4 h-4" />
                        {request.status === "submitted" ||
                        request.status === "unassigned"
                          ? t("quickAssign")
                          : t("reassign")}
                      </button>
                    )}
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <BlurFade delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6 gap-4">
              <div className="text-sm text-gray-600 font-medium">
                {t("pagination.showing", {
                  start: (filters.page - 1) * filters.limit + 1,
                  end: Math.min(filters.page * filters.limit, pagination.total),
                  total: pagination.total,
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: 1,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  title={t("pagination.first")}
                >
                  ««
                </button>
                <button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  {t("pagination.previous")}
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-2">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            filters.page === pageNum
                              ? "bg-blue-600 text-white shadow-md"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  {t("pagination.next")}
                </button>
                <button
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: pagination.totalPages,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  title={t("pagination.last")}
                >
                  »»
                </button>
              </div>
            </div>
          </BlurFade>
        )}
      </div>

      {/* Modals */}
      {selectedRequestId && (
        <>
          <AssignRequestModal
            requestId={selectedRequestId}
            isOpen={showAssignModal}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedRequestId(null);
            }}
            onAssignSuccess={handleAssignSuccess}
          />

          <RequestDetailsModal
            requestId={selectedRequestId}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedRequestId(null);
            }}
            onUpdate={() => mutate()}
          />
        </>
      )}
    </AdminLayout>
  );
}
