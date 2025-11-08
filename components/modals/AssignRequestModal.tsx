"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Zap,
  Search,
  Navigation,
} from "lucide-react";
import { apiClient } from "../../lib/api/client";
import { ShimmerButton } from "../ui/shimmer-button";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AssignRequestModalProps {
  requestId: number;
  isOpen: boolean;
  onClose: () => void;
  onAssignSuccess: () => void;
}

interface Partner {
  id: number;
  name: string;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  branches?: Branch[];
}

interface Branch {
  id: number;
  partnerId: number;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radiusKm: number;
  contactName?: string;
  phone?: string;
  distance?: number;
}

const assignSchema = z.object({
  partnerId: z.number().int().positive("Partner is required"),
  branchId: z.number().int().positive("Branch is required"),
  notes: z.string().optional(),
});

type AssignFormData = z.infer<typeof assignSchema>;

/**
 * Enhanced Assign Request Modal
 * Features:
 * - Sleek animated UI with Framer Motion
 * - Partner and branch selection with cards
 * - Distance calculation from customer location
 * - Search and filter functionality
 * - Real-time validation
 * - Mobile-responsive design
 */
export default function AssignRequestModal({
  requestId,
  isOpen,
  onClose,
  onAssignSuccess,
}: AssignRequestModalProps) {
  const { t } = useTranslation("common");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState<"partner" | "branch" | "confirm">("partner");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
  });

  /**
   * Fetch all active partners with their branches
   */
  const fetchPartners = React.useCallback(async () => {
    try {
      setLoadingPartners(true);
      const response = await apiClient.get("/admin/partners", {
        params: { status: "active", limit: 1000, includeBranches: true },
      });
      setPartners(response.data.data.partners || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setLoadingPartners(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
      setStep("partner");
      setSelectedPartner(null);
      setSelectedBranch(null);
      setSearchQuery("");
      reset();
    }
  }, [isOpen, reset, fetchPartners]);

  /**
   * Handle partner selection
   */
  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner);
    setValue("partnerId", partner.id);
    setStep("branch");
  };

  /**
   * Handle branch selection
   */
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setValue("branchId", branch.id);
    setStep("confirm");
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (step === "confirm") {
      setStep("branch");
      setSelectedBranch(null);
    } else if (step === "branch") {
      setStep("partner");
      setSelectedPartner(null);
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: AssignFormData) => {
    try {
      setLoading(true);
      await apiClient.post(`/admin/requests/${requestId}/assign`, data);

      toast.success(
        <div>
          <p className="font-bold">{t("success.assigned")}</p>
          <p className="text-sm">
            {selectedPartner?.name} - {selectedBranch?.name}
          </p>
        </div>,
        { duration: 5000 }
      );

      reset();
      onAssignSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter partners by search query
   */
  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Filter branches by search query
   */
  const filteredBranches = (selectedPartner?.branches || []).filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t("requests.assignToPartner")}
                  </h2>
                  <p className="text-orange-100 text-sm">REQ-{requestId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center px-6 py-4">
                {["partner", "branch", "confirm"].map((s, index) => (
                  <React.Fragment key={s}>
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                          step === s
                            ? "bg-orange-500 text-white shadow-lg scale-110"
                            : index <
                              ["partner", "branch", "confirm"].indexOf(step)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        )}
                      >
                        {index <
                        ["partner", "branch", "confirm"].indexOf(step) ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          "ml-2 font-medium text-sm",
                          step === s
                            ? "text-orange-600"
                            : index <
                              ["partner", "branch", "confirm"].indexOf(step)
                            ? "text-green-600"
                            : "text-gray-500"
                        )}
                      >
                        {t(`requests.step${index + 1}`)}
                      </span>
                    </div>
                    {index < 2 && (
                      <div
                        className={cn(
                          "flex-1 h-1 mx-4 rounded-full transition-all",
                          index < ["partner", "branch", "confirm"].indexOf(step)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        )}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
              {loadingPartners ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                  <p className="text-gray-600">{t("common.loading")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Step 1: Partner Selection */}
                  {step === "partner" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          {t("requests.selectPartner")}
                        </h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t("common.search")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {filteredPartners.length === 0 ? (
                          <div className="col-span-2 text-center py-8 text-gray-500">
                            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            {t("common.noResults")}
                          </div>
                        ) : (
                          filteredPartners.map((partner) => (
                            <motion.div
                              key={partner.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handlePartnerSelect(partner)}
                              className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-orange-500 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 bg-orange-100 rounded-lg">
                                    <Building2 className="w-6 h-6 text-orange-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg">
                                      {partner.name}
                                    </h4>
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mt-1">
                                      {t("common.active")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {partner.contactEmail && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Mail className="w-4 h-4" />
                                  {partner.contactEmail}
                                </div>
                              )}
                              {partner.contactPhone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  {partner.contactPhone}
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Branch Selection */}
                  {step === "branch" && selectedPartner && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {t("requests.selectBranch")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedPartner.name}
                          </p>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t("common.search")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {filteredBranches.length === 0 ? (
                          <div className="col-span-2 text-center py-8 text-gray-500">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            {t("common.noBranches")}
                          </div>
                        ) : (
                          filteredBranches.map((branch) => (
                            <motion.div
                              key={branch.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleBranchSelect(branch)}
                              className="bg-gradient-to-br from-white to-blue-50 border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition-all"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                  <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg">
                                    {branch.name}
                                  </h4>
                                  {branch.address && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {branch.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {branch.distance && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mt-3">
                                  <Navigation className="w-4 h-4" />
                                  {branch.distance.toFixed(1)} km away
                                </div>
                              )}
                              {branch.contactName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                  <Phone className="w-4 h-4" />
                                  {branch.contactName}
                                  {branch.phone && ` - ${branch.phone}`}
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Confirmation */}
                  {step === "confirm" && selectedPartner && selectedBranch && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {t("requests.confirmAssignment")}
                      </h3>

                      {/* Selected Partner & Branch Summary */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-green-500 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {t("requests.assignmentSummary")}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {t("requests.reviewBeforeSubmit")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-3 border-b border-green-200">
                            <span className="text-sm font-medium text-gray-600">
                              {t("common.partner")}:
                            </span>
                            <span className="font-bold text-gray-900">
                              {selectedPartner.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="text-sm font-medium text-gray-600">
                              {t("common.branch")}:
                            </span>
                            <span className="font-bold text-gray-900">
                              {selectedBranch.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t("requests.assignmentNotes")} (
                          {t("common.optional")})
                        </label>
                        <textarea
                          {...register("notes")}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                          placeholder={t("requests.assignmentNotesPlaceholder")}
                        />
                      </div>
                    </motion.div>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step !== "partner" && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    {t("common.back")}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  {t("common.cancel")}
                </button>
              </div>

              {step === "confirm" && (
                <ShimmerButton
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || loading}
                  className="px-8 py-3 text-lg font-bold"
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("common.assigning")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t("common.confirmAssign")}
                    </>
                  )}
                </ShimmerButton>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
