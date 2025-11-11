"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { usePartner } from "../../../../hooks/usePartners";
import { useAdminPartnerUsers } from "../../../../hooks/useAdminPartnerUsers";
import { BlurFade } from "../../../../components/ui/blur-fade";
import { MagicCard } from "../../../../components/ui/magic-card";
import {
  Users,
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Partner Users Management Page
 * Allows admin users to view and add users for a specific partner
 */
export default function PartnerUsersPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const partnerId = id ? parseInt(id as string) : null;
  const isRtl = i18n.language === "ar";

  const { partner, isLoading: partnerLoading } = usePartner(partnerId);
  const {
    users: partnerUsers,
    isLoading: usersLoading,
    createUser,
  } = useAdminPartnerUsers(partnerId);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    language: i18n.language as "en" | "ar",
    sendWelcomeEmail: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("validation.nameTooShort");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = t("validation.phoneTooShort");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      toast.error(t("validation.pleaseFixErrors"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createUser(formData);

      if (response.temporaryPassword) {
        setCreatedPassword(response.temporaryPassword);
        setShowPassword(true);
        toast.success(
          <div>
            <p className="font-semibold">{t("users.userCreated")}</p>
            <p className="text-xs mt-1">
              {t("users.passwordDisplayed")}
            </p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.success(t("users.userCreated"));
        setIsAddingUser(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || t("errors.generic")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      language: i18n.language as "en" | "ar",
      sendWelcomeEmail: true,
    });
    setErrors({});
    setCreatedPassword(null);
    setShowPassword(false);
  };

  const handleCloseModal = () => {
    setIsAddingUser(false);
    resetForm();
  };

  const copyPassword = () => {
    if (createdPassword) {
      navigator.clipboard.writeText(createdPassword);
      toast.success(t("users.passwordCopied"));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("common.never");
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (partnerLoading || usersLoading) {
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
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {t("partners.notFound")}
            </h2>
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
        <div className="max-w-7xl mx-auto">
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
                    {t("users.title")}
                  </h1>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {partner.name}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-5 w-5" />
                {t("users.addUser")}
              </motion.button>
            </div>
          </BlurFade>

          {/* Users List */}
          <BlurFade delay={0.2}>
            {partnerUsers.length === 0 ? (
              <MagicCard
                className="p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                gradientColor="#d1d5db"
              >
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t("users.noUsers")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("users.noUsersDescription")}
                </p>
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <Plus className="h-5 w-5" />
                  {t("users.addFirstUser")}
                </button>
              </MagicCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {partnerUsers.map((user) => (
                  <BlurFade key={user.id} delay={0.3}>
                    <MagicCard
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-shadow"
                      gradientColor="#d1d5db"
                    >
                      {/* User Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-lg ${
                              user.isActive
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            <User
                              className={`h-6 w-6 ${
                                user.isActive
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {user.isActive ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t("common.active")}
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  {t("common.inactive")}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{user.email}</span>
                        </div>

                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Globe className="h-4 w-4" />
                          <span>
                            {user.languagePreference === "ar"
                              ? t("languages.arabic")
                              : t("languages.english")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            {t("users.lastLogin")}: {formatDate(user.lastLoginAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {user.emailVerifiedAt ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>{t("users.emailVerified")}</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span>{t("users.emailNotVerified")}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* User Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("common.created")}: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </MagicCard>
                  </BlurFade>
                ))}
              </div>
            )}
          </BlurFade>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && !createdPassword && handleCloseModal()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {createdPassword ? t("users.userCreatedTitle") : t("users.addUser")}
                </h2>
              </div>

              {createdPassword ? (
                // Password Display
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                          {t("users.userCreatedSuccessfully")}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {t("users.temporaryPasswordGenerated")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("users.email")}
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          {formData.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("users.temporaryPassword")}
                      </label>
                      <div className="relative">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className={`text-sm font-mono text-amber-900 dark:text-amber-100 break-all ${!showPassword ? "blur-sm" : ""}`}>
                            {createdPassword}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-amber-700" />
                            ) : (
                              <Eye className="h-4 w-4 text-amber-700" />
                            )}
                          </button>
                          <button
                            onClick={copyPassword}
                            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                          >
                            <Copy className="h-4 w-4 text-amber-700" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        {t("users.passwordWarning")}
                      </p>
                    </div>
                  </div>

                  {formData.sendWelcomeEmail && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <Mail className="h-4 w-4 inline mr-1" />
                        {t("users.welcomeEmailSent")}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleCloseModal}
                    className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    {t("common.close")}
                  </button>
                </div>
              ) : (
                // User Form
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t("users.name")} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.name
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                      placeholder={t("users.namePlaceholder")}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t("users.email")} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                      placeholder={t("users.emailPlaceholder")}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t("users.phone")}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.phone
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                      placeholder={t("users.phonePlaceholder")}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {t("users.language")}
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) =>
                        handleInputChange("language", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="en">{t("languages.english")}</option>
                      <option value="ar">{t("languages.arabic")}</option>
                    </select>
                  </div>

                  {/* Send Welcome Email */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <input
                      type="checkbox"
                      id="sendWelcomeEmail"
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) =>
                        handleInputChange("sendWelcomeEmail", e.target.checked)
                      }
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="sendWelcomeEmail"
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {t("users.sendWelcomeEmail")}
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-semibold transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddUser}
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
                          <Plus className="h-5 w-5" />
                          {t("users.createUser")}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

