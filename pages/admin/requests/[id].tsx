"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import AdminLayout from "../../../components/layout/AdminLayout";
import RequestStatusBadge from "../../../components/shared/RequestStatusBadge";
import RequestTimeline from "../../../components/shared/RequestTimeline";

import {
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  MapIcon,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "../../../lib/api/client";
import toast from "react-hot-toast";
import { ShimmerButton } from "../../../components/ui/shimmer-button";
import { BlurFade } from "../../../components/ui/blur-fade";
import { MagicCard } from "../../../components/ui/magic-card";
import AssignRequestModal from "../../../components/modals/AssignRequestModal";
import http from "@/lib/utils/http";

interface RequestDetail {
  id: number;
  requestNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  categoryName: string;
  serviceName?: string;
  pickupOptionName: string;
  partnerName?: string;
  branchName?: string;
  status:
    | "submitted"
    | "assigned"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "closed"
    | "rejected"
    | "unassigned";
  slaDeadline?: string;
  submittedAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  closedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineEvent {
  id: number;
  status: string;
  changedByName?: string;
  notes?: string;
  timestamp: string;
}

export default function RequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t, i18n } = useTranslation("common");
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNotes, setCloseNotes] = useState("");
  const [customerConfirmed, setCustomerConfirmed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const [requestResponse, timelineResponse] = await Promise.all([
        apiClient.get(`/admin/requests/${id}`),
        apiClient.get(`/admin/requests/${id}/timeline`),
      ]);

      setRequest(requestResponse.data.data.request);
      setTimeline(timelineResponse.data.data.timeline || []);
    } catch (error: unknown) {
      let errorMessage = t("errors.generic");
      if (error && typeof error === "object") {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = () => {
    router.push("/admin/requests");
  };

  const handleAssign = () => {
    setShowAssignModal(true);
  };

  const handleClose = () => {
    setShowAssignModal(false);
  };

  const handleCloseRequest = async () => {
    if (!customerConfirmed) {
      toast.error(
        t("requests.customerConfirmationRequired") ||
          "Please confirm that the customer verified completion"
      );
      return;
    }

    try {
      setIsClosing(true);
      await http.post(`/api/admin/requests/${id}/close`, {
        verificationNotes: closeNotes,
        customerConfirmed,
      });
      toast.success(t("success.closed"));
      setShowCloseModal(false);
      await fetchRequestDetails();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || t("errors.generic"));
    } finally {
      setIsClosing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "assigned":
        return <User className="h-5 w-5 text-indigo-500" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "closed":
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "unassigned":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const canAssign =
    request?.status === "submitted" || request?.status === "unassigned";
  const canClose = request?.status === "completed";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500">{t("errors.notFound")}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="mb-6">
          <BlurFade delay={0.1}>
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("common.back")}
            </button>
          </BlurFade>
          <BlurFade delay={0.2}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  {getStatusIcon(request.status)}
                  <span className="ml-3">
                    {t("requests.requestNumber")}: {request.requestNumber}
                  </span>
                </h1>
                <div className="flex items-center space-x-4">
                  <RequestStatusBadge status={request.status} />
                  {request.slaDeadline && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      SLA: {format(new Date(request.slaDeadline), "PPP p")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {canAssign && (
                  <ShimmerButton onClick={handleAssign}>
                    {t("requests.assignToPartner")}
                  </ShimmerButton>
                )}
                {canClose && (
                  <ShimmerButton
                    onClick={() => setShowCloseModal(true)}
                    background="rgb(34, 197, 94)"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t("requests.closeRequest") || "Close Request"}
                  </ShimmerButton>
                )}
              </div>
            </div>
          </BlurFade>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <BlurFade delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t("requests.requestDetails")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("requests.category")}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {request.categoryName}
                    </p>
                  </div>
                  {request.serviceName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("requests.service")}
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {request.serviceName}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("partners.pickupOptions")}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {request.pickupOptionName}
                    </p>
                  </div>
                  {request.partnerName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("partners.title")}
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        {request.partnerName}
                      </p>
                    </div>
                  )}
                  {request.branchName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("branches.title")}
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {request.branchName}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("requests.submitted")}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(request.submittedAt), "PPP p")}
                    </p>
                  </div>
                  {request.confirmedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("requests.confirmed")}
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        {format(new Date(request.confirmedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                  {request.completedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("requests.completed")}
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                        {format(new Date(request.completedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                  {request.closedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("requests.closed")}
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                        {format(new Date(request.closedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </BlurFade>

            {/* Customer Contact */}
            <BlurFade delay={0.4}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t("requests.contactInfo")}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("common.name")}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {request.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("common.phone")}
                      </p>
                      <a
                        href={`tel:${request.customerPhone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {request.customerPhone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {t("requests.location")}
                      </p>
                      <p className="text-gray-900 dark:text-white mb-2">
                        {request.customerAddress}
                      </p>
                      <a
                        href={`https://maps.google.com/maps?q=${request.customerLat},${request.customerLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <MapIcon className="h-4 w-4 mr-1" />
                        {t("common.view")} {t("common.map")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>

            {/* Timeline */}
            <BlurFade delay={0.5}>
              <MagicCard className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t("requests.timeline")}
                </h2>
                <RequestTimeline
                  timeline={timeline.map((event) => ({
                    ...event,
                    statusNotes: event.notes,
                    createdAt: event.timestamp,
                    createdBy: event.changedByName
                      ? {
                          name: event.changedByName,
                          userType: "admin",
                        }
                      : undefined,
                  }))}
                />
              </MagicCard>
            </BlurFade>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating & Feedback */}
            {(request.rating || request.feedback) && (
              <BlurFade delay={0.6}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {t("requests.feedback")}
                  </h2>
                  {request.rating && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("requests.rating")}
                      </label>
                      <div className="mt-2 flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <CheckCircle
                            key={star}
                            className={`h-5 w-5 ${
                              star <= request.rating!
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {request.rating}/5
                        </span>
                      </div>
                    </div>
                  )}
                  {request.feedback && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("requests.feedback")}
                      </label>
                      <p className="mt-2 text-sm text-gray-900 dark:text-white">
                        {request.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </BlurFade>
            )}
          </div>
        </div>
      </div>
      <AssignRequestModal
        requestId={request.id}
        isOpen={showAssignModal}
        onClose={handleClose}
        onAssignSuccess={fetchRequestDetails}
      />

      {/* Close Request Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <BlurFade delay={0.1} className="w-full max-w-md">
            <MagicCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t("requests.closeRequest") || "Close Request"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("requests.closeRequestConfirmation") ||
                  "Verify that the customer has confirmed the completion of this request."}
              </p>

              {/* Customer Confirmation Checkbox */}
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerConfirmed}
                    onChange={(e) => setCustomerConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("requests.customerConfirmedCompletion") ||
                      "Customer confirmed completion"}
                  </span>
                </label>
              </div>

              {/* Verification Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("requests.verificationNotes") || "Verification Notes"} (
                  {t("common.optional")})
                </label>
                <textarea
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  placeholder={
                    t("requests.enterVerificationNotes") ||
                    "Enter verification notes..."
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCloseModal(false);
                    setCloseNotes("");
                    setCustomerConfirmed(false);
                  }}
                  disabled={isClosing}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleCloseRequest}
                  disabled={isClosing || !customerConfirmed}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isClosing ? t("common.loading") : t("requests.closeRequest")}
                </button>
              </div>
            </MagicCard>
          </BlurFade>
        </div>
      )}
    </AdminLayout>
  );
}
