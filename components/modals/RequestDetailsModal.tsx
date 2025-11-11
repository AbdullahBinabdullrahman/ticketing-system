import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Package,
} from "lucide-react";
import { useRequest } from "@/hooks/useRequests";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface RequestDetailsModalProps {
  requestId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

/**
 * Request Details Modal Component
 * Features:
 * - Full request information display
 * - Timeline of status changes
 * - Customer information
 * - Partner/Branch details
 * - Action buttons
 * - Animations with Framer Motion
 * - Mobile-responsive design
 */
export default function RequestDetailsModal({
  requestId,
  isOpen,
  onClose,
  onUpdate,
}: RequestDetailsModalProps) {
  const { t } = useTranslation("common");
  const { request, isLoading, isError } = useRequest(requestId);
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "notes">(
    "details"
  );

  if (!isOpen) return null;

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800 border-blue-200",
      unassigned: "bg-orange-100 text-orange-800 border-orange-200",
      assigned: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-purple-100 text-purple-800 border-purple-200",
      in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || colors.submitted;
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ElementType> = {
      submitted: FileText,
      unassigned: AlertCircle,
      assigned: Clock,
      confirmed: CheckCircle,
      in_progress: TrendingUp,
      completed: CheckCircle,
      closed: CheckCircle,
      rejected: XCircle,
    };
    const Icon = icons[status] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  /**
   * Format date
   */
  const formatDate = (date: Date | null) => {
    if (!date) return t("common.na");
    return format(new Date(date), "PPP p");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t("requests.details")}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {isLoading ? t("common.loading") : `REQ-${requestId}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex px-6">
                {["details", "timeline", "notes"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(tab as "details" | "timeline" | "notes")
                    }
                    className={`px-6 py-4 font-semibold transition-all relative ${
                      activeTab === tab
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t(`requests.${tab}`)}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t("common.loading")}</p>
                </div>
              ) : isError || !request ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("error.loadingFailed")}
                  </h3>
                  <p className="text-gray-600">{t("error.tryAgain")}</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Details Tab */}
                  {activeTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {t(`requests.${request.status}`)}
                        </span>
                        {request.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {request.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Customer Information */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          {t("common.customerInfo")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("common.name")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.customerName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("common.phone")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.customerPhone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 md:col-span-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">
                                {t("common.address")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.customerAddress}
                              </p>
                              {request.customerLat && request.customerLng && (
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                  {t("common.viewOnMap")}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Request Information */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          {t("requests.requestInfo")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("common.category")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.categoryName || t("common.na")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Package className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("common.service")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.serviceName || t("common.na")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("common.created")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.createdAt
                                  ? formatDate(new Date(request.createdAt))
                                  : t("common.na")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("common.updated")}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {request.updatedAt
                                  ? formatDate(new Date(request.updatedAt))
                                  : t("common.na")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Partner Information */}
                      {request.partnerId && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-green-600" />
                            {t("common.partnerInfo")}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Building2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  {t("common.partner")}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {request.partnerName}
                                </p>
                              </div>
                            </div>
                            {request.branchId && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <MapPin className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    {t("common.branch")}
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {request.branchName}
                                  </p>
                                </div>
                              </div>
                            )}
                            {request.assignedAt && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    {t("common.assigned")}
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {request.assignedAt
                                      ? formatDate(new Date(request.assignedAt))
                                      : t("common.na")}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Timeline Tab */}
                  {activeTab === "timeline" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {t("requests.statusTimeline")}
                      </h3>
                      {/* Timeline implementation would go here */}
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        {t("common.comingSoon")}
                      </div>
                    </motion.div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === "notes" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {t("requests.notes")}
                      </h3>
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        {t("common.noNotes")}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                {t("common.close")}
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onUpdate}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  {t("common.refresh")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
