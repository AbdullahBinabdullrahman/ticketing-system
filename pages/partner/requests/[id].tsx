"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import PartnerLayout from "../../../components/layout/PartnerLayout";
import RequestStatusBadge from "../../../components/shared/RequestStatusBadge";
import { BlurFade } from "../../../components/ui/blur-fade";
import { ShimmerButton } from "../../../components/ui/shimmer-button";
import { MagicCard } from "../../../components/ui/magic-card";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Package,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "../../../lib/utils";
import {
  usePartnerRequest,
  useAcceptRequest,
  useRejectRequest,
  useUpdateRequestStatus,
} from "../../../hooks/usePartnerRequests";

/**
 * Partner Request Detail Page
 * Shows complete request information and allows partners to accept/reject/update status
 */
export default function PartnerRequestDetailPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { id, action } = router.query;

  // Use SWR hook for data fetching with auto-refresh
  const {
    request,
    timeline,
    timeRemainingMinutes: initialTimeRemaining,
    isLoading,
    mutate,
  } = usePartnerRequest(id as string);

  // Action hooks
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const updateStatus = useUpdateRequestStatus();

  // Local state for timer countdown
  const [timeRemainingMinutes, setTimeRemainingMinutes] = useState<
    number | null
  >(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Sync initial time remaining from API
  useEffect(() => {
    if (initialTimeRemaining !== undefined) {
      setTimeRemainingMinutes(initialTimeRemaining);
    }
  }, [initialTimeRemaining]);

  // Update timer every minute
  useEffect(() => {
    if (request?.status === "assigned" && timeRemainingMinutes !== null) {
      const interval = setInterval(() => {
        setTimeRemainingMinutes((prev) => {
          if (prev === null || prev <= 0) return 0;
          return prev - 1;
        });
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [request?.status, timeRemainingMinutes]);

  /**
   * Handle accept request
   */
  const handleAcceptDirect = useCallback(async () => {
    if (isAccepting) return; // Prevent double-click

    try {
      setIsAccepting(true);
      await acceptRequest(id as string);
      toast.success(t("partner.actions.requestAccepted"));
      await mutate(); // Refresh data
      router.push("/partner/requests");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
      setIsAccepting(false);
    }
  }, [isAccepting, acceptRequest, id, t, mutate, router]);

  // Handle action query parameter (after function declarations)
  // Only auto-accept, don't auto-show reject modal
  useEffect(() => {
    if (action && request) {
      if (action === "accept" && request.status === "assigned") {
        handleAcceptDirect();
      }
      // Don't auto-show reject modal - user must click reject button
    }
  }, [action, request, handleAcceptDirect]);

  /**
   * Handle reject request
   */
  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.length < 10) {
      toast.error(t("partner.actions.rejectionReasonMinLength"));
      return;
    }

    try {
      setIsSubmitting(true);
      await rejectRequest(id as string, rejectionReason);
      toast.success(t("partner.actions.requestRejected"));
      setShowRejectModal(false);
      // Don't mutate - request is now unassigned from partner and would return 404
      router.push("/partner/requests");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  /**
   * Handle closing the reject modal
   */
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason("");
    // Remove action query parameter from URL
    if (action === "reject") {
      router.push(`/partner/requests/${id}`, undefined, { shallow: true });
    }
  };

  /**
   * Handle status update via dropdown
   */
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!newStatus || newStatus === request?.status) return;

      try {
        setIsSubmitting(true);
        await updateStatus(
          id as string,
          newStatus as "in_progress" | "completed"
        );
        toast.success(t("partner.actions.statusUpdated"));
        setSelectedStatus(""); // Reset dropdown
        await mutate(); // Refresh data
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.generic");
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, updateStatus, mutate, t, request?.status]
  );

  /**
   * Get available status options based on current status
   */
  const getAvailableStatuses = useCallback(() => {
    if (!request) return [];

    const statuses: { value: string; label: string }[] = [];

    switch (request.status) {
      case "confirmed":
        statuses.push({
          value: "in_progress",
          label: t("requests.status.in_progress") || "In Progress",
        });
        break;
      case "in_progress":
        statuses.push({
          value: "completed",
          label: t("requests.status.completed") || "Completed",
        });
        statuses.push({
          value: "confirmed",
          label: t("requests.status.confirmed") || "Confirmed",
        });
        break;
      case "completed":
        statuses.push({
          value: "in_progress",
          label: t("requests.status.in_progress") || "In Progress",
        });
        break;
      default:
        break;
    }

    return statuses;
  }, [request, t]);

  /**
   * Get timer color based on remaining time
   */
  const getTimerColor = (remainingMinutes: number | null) => {
    if (remainingMinutes === null)
      return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700";
    if (remainingMinutes <= 0)
      return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
    if (remainingMinutes <= 5)
      return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800";
    if (remainingMinutes <= 10)
      return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800";
    return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
  };

  /**
   * Format timer message
   */
  const getTimerMessage = (remainingMinutes: number | null) => {
    if (remainingMinutes === null) return "";
    if (remainingMinutes <= 0) return t("partner.timer.expired");
    if (remainingMinutes < 1) return t("partner.timer.lessThanMinute");
    return t("partner.timer.minutesRemaining", { minutes: remainingMinutes });
  };

  if (isLoading) {
    return (
      <PartnerLayout>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </PartnerLayout>
    );
  }

  if (!request) {
    return null;
  }

  const isAssigned = request.status === "assigned";
  const isRejected = request.status === "rejected";
  const canAccept =
    isAssigned && (timeRemainingMinutes === null || timeRemainingMinutes > 0);
  const canReject = isAssigned; // Can always reject if assigned, even after timer expires
  const isReadOnly = isRejected; // Rejected requests are read-only

  return (
    <PartnerLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="space-y-6">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {request.requestNumber}
                </h1>
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("requests.createdAt")}:{" "}
                {format(new Date(request.createdAt), "PPp")}
              </p>
            </div>
          </div>
        </BlurFade>

        {/* Timer Warning */}
        {isAssigned && timeRemainingMinutes !== null && (
          <BlurFade delay={0.15}>
            <div
              className={cn(
                "p-4 rounded-lg border flex items-center gap-3",
                getTimerColor(timeRemainingMinutes)
              )}
            >
              <Clock className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">
                  {timeRemainingMinutes <= 0
                    ? t("partner.timer.expired")
                    : timeRemainingMinutes <= 5
                    ? t("partner.timer.urgent")
                    : t("partner.timer.confirmWithin", { minutes: 15 })}
                </p>
                <p className="text-sm">
                  {getTimerMessage(timeRemainingMinutes)}
                </p>
              </div>
            </div>
          </BlurFade>
        )}

        {/* Action Buttons - Only show for assigned status, not for rejected */}
        {isAssigned && !isReadOnly && (
          <BlurFade delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-3">
              <ShimmerButton
                onClick={handleAcceptDirect}
                className="flex-1 sm:flex-none"
                background="rgb(34, 197, 94)"
                disabled={!canAccept || isAccepting}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {isAccepting
                  ? t("partner.actions.accepting")
                  : t("partner.actions.accept")}
              </ShimmerButton>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={!canReject}
                className="flex-1 sm:flex-none px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-5 w-5" />
                {t("partner.actions.reject")}
              </button>
            </div>
            {!canAccept &&
              timeRemainingMinutes !== null &&
              timeRemainingMinutes <= 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {t("partner.timer.expired")} -{" "}
                  {t("requests.cannotAccept") ||
                    "Cannot accept after timer expires, but you can still reject"}
                </p>
              )}
          </BlurFade>
        )}

        {/* Status Change Dropdown - Show for confirmed, in_progress, or completed (not for rejected) */}
        {!isReadOnly &&
          (request.status === "confirmed" ||
            request.status === "in_progress" ||
            request.status === "completed") && (
            <BlurFade delay={0.2}>
              <MagicCard className="p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("requests.changeStatus") || "Change Status"}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    handleStatusChange(e.target.value);
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:opacity-50"
                >
                  <option value="">
                    {t("requests.selectNewStatus") || "Select new status..."}
                  </option>
                  {getAvailableStatuses().map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {isSubmitting && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t("common.updating") || "Updating..."}
                  </p>
                )}
              </MagicCard>
            </BlurFade>
          )}

        {/* Read-Only Notice for Rejected Requests */}
        {isReadOnly && (
          <BlurFade delay={0.2}>
            <MagicCard className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                    {t("partner.requests.rejectedTitle") || "Request Rejected"}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    {t("partner.requests.rejectedMessage") ||
                      "This request has been rejected and is now read-only. No further actions can be taken."}
                  </p>
                  {request.rejectionReason && (
                    <div className="mt-3 p-3 bg-white dark:bg-red-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t("requests.rejectionReason")}:
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {request.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        )}

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <BlurFade delay={0.25}>
            <MagicCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                {t("requests.customerInfo") || "Customer Information"}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("common.name")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("common.phone")}
                    </p>
                    <p
                      className="font-medium text-gray-900 dark:text-white"
                      dir="ltr"
                    >
                      {request.customerPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("common.address")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.customerAddress}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {t("branches.coordinates")}: {request.customerLat},{" "}
                      {request.customerLng}
                    </p>
                  </div>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          {/* Service Details */}
          <BlurFade delay={0.3}>
            <MagicCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                {t("requests.serviceDetails") || "Service Details"}
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("categories.title")}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {i18n.language === "ar"
                      ? request.categoryNameAr
                      : request.categoryName}
                  </p>
                </div>
                {request.serviceName && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("services.title")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {i18n.language === "ar"
                        ? request.serviceNameAr
                        : request.serviceName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("partners.pickupOptions")}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {request.pickupOption}
                  </p>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          {/* Branch Assignment */}
          {request.branchId && (
            <BlurFade delay={0.35}>
              <MagicCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  {t("branches.assignedBranch") || "Assigned Branch"}
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("branches.branchName")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {i18n.language === "ar" && request.branchNameAr
                        ? request.branchNameAr
                        : request.branchName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("common.address")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.branchAddress}
                    </p>
                  </div>
                  {request.branchPhone && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("common.phone")}
                      </p>
                      <p
                        className="font-medium text-gray-900 dark:text-white"
                        dir="ltr"
                      >
                        {request.branchPhone}
                      </p>
                    </div>
                  )}
                </div>
              </MagicCard>
            </BlurFade>
          )}

          {/* Timeline */}
          <BlurFade delay={0.4}>
            <MagicCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                {t("partner.requests.timeline")}
              </h2>
              <div className="space-y-4">
                {timeline && timeline.length > 0 ? (
                  timeline.map((item, index: number) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            index === 0
                              ? "bg-indigo-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          )}
                        />
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.status}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {format(new Date(item.timestamp), "PPp")}
                          {item.changedByName && ` • ${item.changedByName}`}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    {t("partner.requests.noTimeline")}
                  </p>
                )}
              </div>
            </MagicCard>
          </BlurFade>
        </div>

        {/* Reject Modal - Beautiful Modern Design */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <BlurFade delay={0.1} className="w-full max-w-2xl">
              <MagicCard className="p-8 bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10">
                {/* Header with Icon */}
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/50 mb-4">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-2">
                    {t("partner.actions.reject")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {t("partner.actions.rejectConfirm")}
                  </p>
                </div>

                {/* Request Info Card */}
                <div className="mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("requests.requestNumber")}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {request?.requestNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("requests.customer")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {request?.customerName}
                    </span>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t("partner.actions.rejectionReason")} *
                  </label>
                  <div className="relative">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all resize-none"
                      placeholder={t(
                        "partner.actions.rejectionReasonPlaceholder"
                      )}
                      required
                      minLength={10}
                    />
                    <div className="absolute bottom-3 right-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          rejectionReason.length >= 10
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {rejectionReason.length}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t("common.minimum")} 10 {t("common.characters")}
                  </p>
                </div>

                {/* Warning Message */}
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-semibold mb-1">
                      {t("partner.actions.rejectWarningTitle") || "Important"}
                    </p>
                    <p>
                      {t("partner.actions.rejectWarningText") ||
                        "This action cannot be undone. The request will be returned to unassigned status."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleCloseRejectModal}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.cancel")}
                  </button>
                  <ShimmerButton
                    onClick={handleReject}
                    disabled={isSubmitting || rejectionReason.length < 10}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">
                        {isSubmitting
                          ? t("partner.actions.rejecting")
                          : t("partner.actions.reject")}
                      </span>
                    </div>
                  </ShimmerButton>
                </div>
              </MagicCard>
            </BlurFade>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
