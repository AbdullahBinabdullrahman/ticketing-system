"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import CustomerLayout from "@/components/layout/CustomerLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import moment from "moment";
import {
  useCustomerRequest,
  useRateRequest,
} from "@/hooks/useCustomerRequests";
import {
  ArrowLeft,
  MapPin,
  Package,
  Building2,
  Clock,
  CheckCircle2,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import MapBox from "@/components/shared/MapBox";

export default function CustomerRequestDetailPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const requestIdentifier = id as string | null;
  const isRtl = i18n.language === "ar";

  const { request, isLoading, refetch } = useCustomerRequest(requestIdentifier);
  const { rateRequest } = useRateRequest(requestIdentifier!);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      unassigned:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
      assigned:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      confirmed:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
      in_progress:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error(t("customer.pleaseSelectRating"));
      return;
    }

    try {
      setIsSubmittingRating(true);
      await rateRequest({ rating, feedback });
      toast.success(t("customer.thankYouForRating"));
      setShowRatingForm(false);
      refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </CustomerLayout>
    );
  }

  if (!request) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("customer.requestNotFound")}
          </h3>
          <button
            onClick={() => router.push("/customer/requests")}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            ← {t("customer.backToRequests")}
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const canRate = request.status === "completed" && !request.rating;

  return (
    <CustomerLayout>
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="mb-8">
              <button
                onClick={() => router.push("/customer/requests")}
                className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
              >
                <ArrowLeft className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                {t("customer.backToRequests")}
              </button>

              {/* Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {request.requestNumber}
                      </h1>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {t(`customer.requestStatus.${request.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        {t("customer.submitted")}{" "}
                        {moment(request.submittedAt).format("LLL")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Details */}
              <BlurFade delay={0.2}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("customer.serviceDetails")}
                    </h2>
                  </div>
                  <dl className="space-y-4">
                    <div className="flex items-start justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("customer.category")}
                      </dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                        {i18n.language === "ar"
                          ? request.categoryNameAr
                          : request.categoryName}
                      </dd>
                    </div>
                    {request.serviceName && (
                      <div className="flex items-start justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("customer.service")}
                        </dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                          {i18n.language === "ar"
                            ? request.serviceNameAr
                            : request.serviceName}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("customer.pickupOption")}
                      </dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                        {i18n.language === "ar"
                          ? request.pickupOptionNameAr
                          : request.pickupOptionName}
                      </dd>
                    </div>
                  </dl>
                </div>
              </BlurFade>

              {/* Location */}
              <BlurFade delay={0.3}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("customer.location")}
                    </h2>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {request.customerAddress}
                    </p>
                  </div>

                  {/* Map Display */}
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 mb-4">
                    <MapBox
                      latitude={request.customerLat}
                      longitude={request.customerLng}
                      zoom={14}
                      draggableMarker={false}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                    <span>
                      Lat: {request.customerLat.toFixed(6)}, Lng:{" "}
                      {request.customerLng.toFixed(6)}
                    </span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              </BlurFade>

              {/* Partner Info */}
              {request.partnerName && (
                <BlurFade delay={0.4}>
                  <div className="bg-linear-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary-200 dark:border-primary-800">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t("customer.assignedPartner")}
                      </h2>
                    </div>
                    <dl className="space-y-4">
                      <div className="flex items-start justify-between">
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t("customer.partner")}
                        </dt>
                        <dd className="text-sm font-bold text-primary-700 dark:text-primary-300 text-right">
                          {request.partnerName}
                        </dd>
                      </div>
                      {request.branchName && (
                        <div className="flex items-start justify-between">
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {t("customer.branch")}
                          </dt>
                          <dd className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                            {request.branchName}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </BlurFade>
              )}

              {/* Rating Section */}
              {(canRate || request.rating) && (
                <BlurFade delay={0.5}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.rating
                          ? t("customer.yourRating")
                          : t("customer.rateService")}
                      </h2>
                    </div>

                    {request.rating ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-7 w-7 ${
                                i < request.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                            {request.rating}/5
                          </span>
                        </div>
                        {request.feedback && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                              &ldquo;{request.feedback}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    ) : showRatingForm ? (
                      <div>
                        <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setRating(i + 1)}
                              className="focus:outline-none transform hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`h-10 w-10 transition-all ${
                                  i < rating
                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                                    : "text-gray-300 hover:text-yellow-200"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {rating > 0 && (
                          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                            {rating === 5 && "⭐ Excellent!"}
                            {rating === 4 && "👍 Great!"}
                            {rating === 3 && "😊 Good"}
                            {rating === 2 && "🤔 Fair"}
                            {rating === 1 && "😕 Poor"}
                          </p>
                        )}
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder={t("customer.feedbackPlaceholder")}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white mb-4 resize-none"
                          rows={4}
                        />
                        <div className="flex gap-3">
                          <ShimmerButton
                            type="button"
                            onClick={handleSubmitRating}
                            disabled={isSubmittingRating || rating === 0}
                            className="flex-1"
                          >
                            {isSubmittingRating ? (
                              <>
                                <Loader2
                                  className={`h-4 w-4 animate-spin ${
                                    isRtl ? "ml-2" : "mr-2"
                                  }`}
                                />
                                {t("customer.submitting")}
                              </>
                            ) : (
                              <>
                                <CheckCircle2
                                  className={`h-4 w-4 ${
                                    isRtl ? "ml-2" : "mr-2"
                                  }`}
                                />
                                {t("customer.submitRating")}
                              </>
                            )}
                          </ShimmerButton>
                          <button
                            type="button"
                            onClick={() => {
                              setShowRatingForm(false);
                              setRating(0);
                              setFeedback("");
                            }}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-linear-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                      >
                        <Star
                          className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`}
                        />
                        {t("customer.rateService")}
                      </button>
                    )}
                  </div>
                </BlurFade>
              )}
            </div>

            {/* Sidebar - Timeline */}
            <div>
              <BlurFade delay={0.2}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("customer.timeline")}
                    </h2>
                  </div>
                  <div className="relative space-y-6">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-linear-to-b from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800"></div>
                    {request.submittedAt && (
                      <div className="relative flex gap-4 pl-2">
                        <div className="shrink-0 z-10">
                          <div className="h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("customer.requestStatus.submitted")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(request.submittedAt), "PPp")}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.assignedAt && (
                      <div className="relative flex gap-4 pl-2">
                        <div className="shrink-0 z-10">
                          <div className="h-8 w-8 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("customer.requestStatus.assigned")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(request.assignedAt), "PPp")}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.confirmedAt && (
                      <div className="relative flex gap-4 pl-2">
                        <div className="shrink-0 z-10">
                          <div className="h-8 w-8 rounded-full bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("customer.requestStatus.confirmed")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(request.confirmedAt), "PPp")}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.inProgressAt && (
                      <div className="relative flex gap-4 pl-2">
                        <div className="shrink-0 z-10">
                          <div className="h-8 w-8 rounded-full bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <Clock className="h-4 w-4 text-white animate-pulse" />
                          </div>
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("customer.requestStatus.inProgress")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(request.inProgressAt), "PPp")}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.completedAt && (
                      <div className="relative flex gap-4 pl-2">
                        <div className="shrink-0 z-10">
                          <div className="h-8 w-8 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("customer.requestStatus.completed")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(request.completedAt), "PPp")}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.closedAt && (
                      <div className="relative flex gap-4 pl-2">
                        <div className="shrink-0 z-10">
                          <div className="h-8 w-8 rounded-full bg-gray-500 dark:bg-gray-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("customer.requestStatus.closed")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(request.closedAt), "PPp")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
