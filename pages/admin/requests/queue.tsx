/**
 * Admin Assignment Queue Page
 * Shows only unassigned/submitted requests for quick assignment
 */

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequests } from "@/hooks/useRequests";
import { RequestFiltersInput } from "@/schemas/requests";
import {
  FileText,
  MapPin,
  Clock,
  User,
  Phone,
  Package,
  Filter,
  X,
  Zap,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CardSkeleton } from "@/components/ui/skeleton";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import AssignRequestModal from "@/components/modals/AssignRequestModal";
import { formatDistanceToNow } from "date-fns";

export default function AssignmentQueuePage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<RequestFiltersInput>({
    page: 1,
    limit: 20,
    status: "submitted", // Only show submitted requests
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { requests, pagination, isLoading, mutate } = useRequests(filters);

  // Filter to show only unassigned/submitted requests
  const unassignedRequests = requests.filter(
    (r) => r.status === "submitted" || r.status === "unassigned"
  );

  const handleQuickAssign = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedRequestId(null);
    mutate(); // Refresh the list
  };

  const handleViewDetails = (requestNumber: string) => {
    router.push(`/admin/requests/${requestNumber}`);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: "submitted",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <AdminLayout>
      <div
        className="space-y-6"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("assignmentQueue")}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("assignmentQueueDescription")}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {t("common.filters")}
            </button>
          </div>
        </BlurFade>

        {/* Stats Bar */}
        <BlurFade delay={0.15}>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  {t("unassignedRequests")}
                </p>
                <p className="text-4xl font-bold mt-1">
                  {unassignedRequests.length}
                </p>
                <p className="text-orange-100 text-sm mt-1">
                  {t("waitingForAssignment")}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <Zap className="w-16 h-16 text-orange-200 opacity-50" />
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Filters Panel */}
        {showFilters && (
          <BlurFade delay={0.2}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {t("common.filters")}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {t("common.clear")}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("categories.category")}
                  </label>
                  <input
                    type="text"
                    name="categoryId"
                    placeholder={t("common.all")}
                    value={filters.categoryId || ""}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("requests.pickupOption")}
                  </label>
                  <input
                    type="text"
                    name="pickupOptionId"
                    placeholder={t("common.all")}
                    value={filters.pickupOptionId || ""}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("common.search")}
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder={t("searchByCustomerOrPhone")}
                    value={filters.search || ""}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </BlurFade>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && unassignedRequests.length === 0 && (
          <BlurFade delay={0.3}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t("noUnassignedRequests")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("noUnassignedRequestsDescription")}
              </p>
              <ShimmerButton onClick={() => router.push("/admin/requests")}>
                {t("viewAllRequests")}
              </ShimmerButton>
            </div>
          </BlurFade>
        )}

        {/* Requests Grid */}
        {!isLoading && unassignedRequests.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {unassignedRequests.map((request, index) => (
              <BlurFade key={request.id} delay={0.2 + index * 0.05}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-500">
                          #{request.requestNumber}
                        </span>
                        <RequestStatusBadge status={request.status} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(request.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {request.slaDeadline && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        {t("slaActive")}
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {request.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">{request.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">
                        {request.customerAddress}
                      </span>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-900">
                        {request.categoryName}
                      </span>
                      {request.serviceName && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-700">
                            {request.serviceName}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {request.pickupOptionName}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleQuickAssign(request.id)}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {t("quickAssign")}
                    </button>
                    <button
                      onClick={() => handleViewDetails(request.requestNumber)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t("common.view")}
                    </button>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading &&
          unassignedRequests.length > 0 &&
          pagination &&
          pagination.totalPages > 1 && (
            <BlurFade delay={0.5}>
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.previous")}
                </button>
                <span className="text-gray-700">
                  {t("common.page")} {pagination.page} {t("common.of")}{" "}
                  {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.next")}
                </button>
              </div>
            </BlurFade>
          )}
      </div>

      {/* Assign Modal */}
      {selectedRequestId && (
        <AssignRequestModal
          requestId={selectedRequestId}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRequestId(null);
          }}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

