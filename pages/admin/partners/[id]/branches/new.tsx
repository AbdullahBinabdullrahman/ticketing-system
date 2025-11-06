"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../../../../components/layout/AdminLayout";
import { usePartner } from "../../../../../hooks/usePartners";
import { BlurFade } from "../../../../../components/ui/blur-fade";
import { MagicCard } from "../../../../../components/ui/magic-card";
import MapBox from "../../../../../components/shared/MapBox";
import {
  Building2,
  ArrowLeft,
  MapPin,
  User,
  Phone,
  MapPinned,
  Navigation,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import http from "@/lib/utils/http";

/**
 * New Branch Page
 * Allows admin users to create a new branch for a specific partner
 *
 * Features:
 * - Form validation with real-time feedback
 * - Centralized color system
 * - RTL support
 * - i18n ready
 * - Responsive design
 */
export default function NewBranchPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const partnerId = id ? parseInt(id as string) : null;
  const isRtl = i18n.language === "ar";

  const { partner, isLoading: partnerLoading } = usePartner(partnerId);

  const [formData, setFormData] = useState({
    name: "",
    lat: "",
    lng: "",
    contactName: "",
    phone: "",
    address: "",
    radiusKm: "10",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input field changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = t("validation.branchNameRequired");
    }

    const lat = parseFloat(formData.lat);
    if (!formData.lat || isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.lat = t("validation.validLatitudeRequired");
    }

    const lng = parseFloat(formData.lng);
    if (!formData.lng || isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.lng = t("validation.validLongitudeRequired");
    }

    if (!formData.contactName || formData.contactName.length < 2) {
      newErrors.contactName = t("validation.contactNameRequired");
    }

    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = t("validation.phoneRequired");
    }

    if (!formData.address || formData.address.length < 5) {
      newErrors.address = t("validation.addressRequired");
    }

    const radius = parseFloat(formData.radiusKm);
    if (!formData.radiusKm || isNaN(radius) || radius < 0.1 || radius > 100) {
      newErrors.radiusKm = t("validation.validRadiusRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("validation.pleaseFixErrors"));
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("adminToken");

      const response = await http.post(
        "/admin/branches",
        {
          partnerId,
          name: formData.name,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          contactName: formData.contactName,
          phone: formData.phone,
          address: formData.address,
          radiusKm: parseFloat(formData.radiusKm),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(t("success.branchCreated"));
        router.push(`/admin/partners/${partnerId}`);
      }
    } catch (error: unknown) {
      console.error("Branch creation error:", error);
      toast.error(error instanceof Error ? error.message : t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get current location
   */
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          }));
          toast.success(t("success.locationDetected"));
        },
        (error) => {
          toast.error(t("errors.locationAccessDenied"));
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error(t("errors.geolocationNotSupported"));
    }
  };

  if (partnerLoading) {
    return (
      <AdminLayout>
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {t("common.loading")}
            </p>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  if (!partner) {
    return (
      <AdminLayout>
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {t("partners.notFound")}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t("partners.notFoundDescription")}
            </p>
            <button
              onClick={() => router.push("/admin/partners")}
              className="px-4 py-2 rounded-lg transition-colors bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              {t("partners.backToList")}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <BlurFade delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("branches.newBranch")}
                  </h1>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {partner.name}
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Form Card */}
          <BlurFade delay={0.2}>
            <MagicCard
              className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
              gradientColor="#d1d5db"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Branch Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t("branches.branchName")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute inset-y-0 ${
                        isRtl ? "right-0 pr-3" : "left-0 pl-3"
                      } flex items-center pointer-events-none`}
                    >
                      <Building2
                        className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === "name"
                            ? "text-indigo-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className={`block w-full ${
                        isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                      } py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 ${
                        errors.name
                          ? "border-red-500"
                          : focusedField === "name"
                          ? "border-indigo-500 ring-2 ring-indigo-200"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder={t("branches.enterBranchName")}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Location Section */}
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                      {t("branches.coordinates")}
                    </h3>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 bg-white dark:bg-gray-800 text-indigo-600 border border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    >
                      <Navigation className="h-3 w-3" />
                      {t("branches.useCurrentLocation")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Latitude */}
                    <div>
                      <label
                        htmlFor="lat"
                        className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400"
                      >
                        {t("branches.latitude")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lat"
                        name="lat"
                        type="text"
                        required
                        value={formData.lat}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("lat")}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 ${
                          errors.lat
                            ? "border-red-500"
                            : focusedField === "lat"
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="24.7136"
                      />
                      {errors.lat && (
                        <p className="mt-1 text-xs flex items-center gap-1 text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lat}
                        </p>
                      )}
                    </div>

                    {/* Longitude */}
                    <div>
                      <label
                        htmlFor="lng"
                        className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400"
                      >
                        {t("branches.longitude")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lng"
                        name="lng"
                        type="text"
                        required
                        value={formData.lng}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("lng")}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 ${
                          errors.lng
                            ? "border-red-500"
                            : focusedField === "lng"
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="46.6753"
                      />
                      {errors.lng && (
                        <p className="mt-1 text-xs flex items-center gap-1 text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                {formData.lat &&
                  formData.lng &&
                  !isNaN(parseFloat(formData.lat)) &&
                  !isNaN(parseFloat(formData.lng)) && (
                    <BlurFade delay={0.3}>
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPinned className="h-5 w-5 text-indigo-600" />
                          {t("branches.mapPreview", "Map Preview")}
                        </h3>
                        <MapBox
                          latitude={parseFloat(formData.lat)}
                          longitude={parseFloat(formData.lng)}
                          onLocationChange={(lat, lng) => {
                            setFormData({
                              ...formData,
                              lat: lat.toFixed(6),
                              lng: lng.toFixed(6),
                            });
                          }}
                          draggableMarker={true}
                          className="h-[400px] w-full border-2 border-gray-200 dark:border-gray-700"
                          zoom={14}
                        />
                      </div>
                    </BlurFade>
                  )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Name */}
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      {t("branches.contactName")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 ${
                          isRtl ? "right-0 pr-3" : "left-0 pl-3"
                        } flex items-center pointer-events-none`}
                      >
                        <User
                          className={`h-5 w-5 transition-colors duration-200 ${
                            focusedField === "contactName"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("contactName")}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full ${
                          isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                        } py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 ${
                          errors.contactName
                            ? "border-red-500"
                            : focusedField === "contactName"
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder={t("branches.enterContactName")}
                      />
                    </div>
                    {errors.contactName && (
                      <p className="mt-1 text-sm flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.contactName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      {t("branches.phone")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 ${
                          isRtl ? "right-0 pr-3" : "left-0 pl-3"
                        } flex items-center pointer-events-none`}
                      >
                        <Phone
                          className={`h-5 w-5 transition-colors duration-200 ${
                            focusedField === "phone"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full ${
                          isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                        } py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 ${
                          errors.phone
                            ? "border-red-500"
                            : focusedField === "phone"
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="+966 50 123 4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t("branches.address")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute top-3 ${
                        isRtl ? "right-0 pr-3" : "left-0 pl-3"
                      } flex items-start pointer-events-none`}
                    >
                      <MapPinned
                        className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === "address"
                            ? "text-indigo-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("address")}
                      onBlur={() => setFocusedField(null)}
                      className={`block w-full ${
                        isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                      } py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 ${
                        errors.address
                          ? "border-red-500"
                          : focusedField === "address"
                          ? "border-indigo-500 ring-2 ring-indigo-200"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder={t("branches.enterAddress")}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Service Radius */}
                <div>
                  <label
                    htmlFor="radiusKm"
                    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                  >
                    {t("branches.radius")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="radiusKm"
                    name="radiusKm"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                    value={formData.radiusKm}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("radiusKm")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 ${
                      errors.radiusKm
                        ? "border-red-500"
                        : focusedField === "radiusKm"
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("branches.radiusHelper")}
                  </p>
                  {errors.radiusKm && (
                    <p className="mt-1 text-sm flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.radiusKm}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl font-semibold transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {t("common.cancel")}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("common.creating")}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {t("branches.createBranch")}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </MagicCard>
          </BlurFade>
        </div>
      </div>
    </AdminLayout>
  );
}
