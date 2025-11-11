"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  useSlaSettings,
  useUpdateSettings,
} from "../../hooks/useSystemSettings";
import { BlurFade } from "../../components/ui/blur-fade";
import { ShimmerButton } from "../../components/ui/shimmer-button";
import {
  Settings,
  Clock,
  Mail,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "../../components/ui/skeleton";

export default function AdminSettingsPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const isRtl = i18n.language === "ar";

  // Fetch current settings
  const {
    slaTimeout: currentSlaTimeout,
    operationalTeamEmails: currentOperationalEmails,
    adminEmails: currentAdminEmails,
    isLoading,
    isError,
  } = useSlaSettings();

  // Update hook
  const { updateMultipleConfigurations, isUpdating } = useUpdateSettings();

  // Form state
  const [slaTimeout, setSlaTimeout] = useState<string>("");
  const [operationalEmails, setOperationalEmails] = useState<string>("");
  const [adminEmails, setAdminEmails] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    slaTimeout?: string;
    operationalEmails?: string;
    adminEmails?: string;
  }>({});

  // Initialize form with current values
  useEffect(() => {
    if (!isLoading) {
      setSlaTimeout((prev) =>
        prev === "" ? currentSlaTimeout.toString() : prev
      );
      setOperationalEmails((prev) =>
        prev === "" ? currentOperationalEmails : prev
      );
      setAdminEmails((prev) => (prev === "" ? currentAdminEmails : prev));
    }
  }, [
    currentSlaTimeout,
    currentOperationalEmails,
    currentAdminEmails,
    isLoading,
  ]);

  // Track changes - calculate without triggering setState during render
  const hasChangesValue =
    slaTimeout !== currentSlaTimeout.toString() ||
    operationalEmails !== currentOperationalEmails ||
    adminEmails !== currentAdminEmails;

  useEffect(() => {
    setHasChanges(hasChangesValue);
  }, [hasChangesValue]);

  /**
   * Validate email format
   */
  const validateEmails = (emailString: string): boolean => {
    if (!emailString.trim()) return true; // Empty is valid

    const emails = emailString.split(",").map((e) => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => email === "" || emailRegex.test(email));
  };

  /**
   * Validate SLA timeout
   */
  const validateSlaTimeout = (value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 60;
  };

  /**
   * Handle form validation
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!validateSlaTimeout(slaTimeout)) {
      newErrors.slaTimeout = t("settings.slaTimeoutError");
    }

    if (!validateEmails(operationalEmails)) {
      newErrors.operationalEmails = t("settings.emailFormatError");
    }

    if (!validateEmails(adminEmails)) {
      newErrors.adminEmails = t("settings.emailFormatError");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save settings
   */
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t("settings.validationError"));
      return;
    }

    try {
      const updates = [];

      if (slaTimeout !== currentSlaTimeout.toString()) {
        updates.push({
          key: "sla_timeout_minutes",
          value: slaTimeout,
          description: "SLA timeout in minutes for partner response",
        });
      }

      if (operationalEmails !== currentOperationalEmails) {
        updates.push({
          key: "operational_team_emails",
          value: operationalEmails,
          description: "Comma-separated operational team email addresses",
        });
      }

      if (adminEmails !== currentAdminEmails) {
        updates.push({
          key: "admin_notification_emails",
          value: adminEmails,
          description: "Comma-separated admin notification email addresses",
        });
      }

      if (updates.length === 0) {
        toast(t("settings.noChanges"), {
          icon: <Info className="h-5 w-5 text-blue-500" />,
        });
        return;
      }

      await updateMultipleConfigurations(updates);

      toast.success(t("settings.saveSuccess"), {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
      setHasChanges(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("settings.saveError");
      console.error("Failed to save settings:", error);
      toast.error(errorMessage, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  /**
   * Handle reset to defaults
   */
  const handleReset = () => {
    setSlaTimeout(currentSlaTimeout.toString());
    setOperationalEmails(currentOperationalEmails);
    setAdminEmails(currentAdminEmails);
    setErrors({});
    setHasChanges(false);
    toast(t("settings.resetSuccess"), {
      icon: <Info className="h-5 w-5 text-blue-500" />,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div dir={isRtl ? "rtl" : "ltr"}>
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("settings.loadError")}
            </h2>
            <button
              onClick={() => router.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div dir={isRtl ? "rtl" : "ltr"}>
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("settings.title")}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("settings.description")}
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* SLA Configuration Section */}
            <BlurFade delay={0.2}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("settings.slaConfiguration")}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {t("settings.slaConfigurationDescription")}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="slaTimeout"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t("settings.slaTimeout")}
                  </label>
                  <div className="relative">
                    <input
                      id="slaTimeout"
                      type="number"
                      min="1"
                      max="60"
                      value={slaTimeout}
                      onChange={(e) => {
                        setSlaTimeout(e.target.value);
                        if (errors.slaTimeout) {
                          setErrors({ ...errors, slaTimeout: undefined });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                        errors.slaTimeout
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="15"
                    />
                    <div className="absolute inset-y-0 left-10 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {t("settings.minutes")}
                      </span>
                    </div>
                  </div>
                  {errors.slaTimeout && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.slaTimeout}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.slaTimeoutHelp")}
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Notification Configuration Section */}
            <BlurFade delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("settings.notificationConfiguration")}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {t("settings.notificationConfigurationDescription")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Operational Team Emails */}
                  <div>
                    <label
                      htmlFor="operationalEmails"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t("settings.operationalTeamEmails")}
                    </label>
                    <textarea
                      id="operationalEmails"
                      rows={3}
                      value={operationalEmails}
                      onChange={(e) => {
                        setOperationalEmails(e.target.value);
                        if (errors.operationalEmails) {
                          setErrors({
                            ...errors,
                            operationalEmails: undefined,
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                        errors.operationalEmails
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="ops1@example.com, ops2@example.com"
                    />
                    {errors.operationalEmails && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.operationalEmails}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t("settings.operationalTeamEmailsHelp")}
                    </p>
                  </div>

                  {/* Admin Notification Emails */}
                  <div>
                    <label
                      htmlFor="adminEmails"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t("settings.adminEmails")}
                    </label>
                    <textarea
                      id="adminEmails"
                      rows={3}
                      value={adminEmails}
                      onChange={(e) => {
                        setAdminEmails(e.target.value);
                        if (errors.adminEmails) {
                          setErrors({ ...errors, adminEmails: undefined });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                        errors.adminEmails
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="admin@example.com"
                    />
                    {errors.adminEmails && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.adminEmails}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t("settings.adminEmailsHelp")}
                    </p>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Sidebar - Info & Actions */}
          <div className="space-y-6">
            {/* Current Status Card */}
            <BlurFade delay={0.2}>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg shadow-sm border border-primary-200 dark:border-primary-700 p-6">
                <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-4 uppercase tracking-wide">
                  {t("settings.currentSettings")}
                </h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t("settings.slaTimeout")}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentSlaTimeout} {t("settings.minutes")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t("settings.operationalTeam")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentOperationalEmails || t("settings.notConfigured")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t("settings.adminTeam")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentAdminEmails || t("settings.notConfigured")}
                    </p>
                  </div>
                </div>
              </div>
            </BlurFade>

            {/* Action Buttons */}
            <BlurFade delay={0.3}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-3">
                  <ShimmerButton
                    onClick={handleSave}
                    disabled={!hasChanges || isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("settings.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t("settings.saveSettings")}
                      </>
                    )}
                  </ShimmerButton>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!hasChanges || isUpdating}
                    className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("settings.resetDefaults")}
                  </button>
                </div>

                {hasChanges && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      {t("settings.unsavedChanges")}
                    </p>
                  </div>
                )}
              </div>
            </BlurFade>

            {/* Help Card */}
            <BlurFade delay={0.4}>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  {t("settings.helpTitle")}
                </h3>
                <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>{t("settings.helpSla")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>{t("settings.helpOperational")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>{t("settings.helpAdmin")}</span>
                  </li>
                </ul>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
