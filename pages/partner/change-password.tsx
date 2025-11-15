"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import PartnerLayout from "../../components/layout/PartnerLayout";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MagicCard } from "../../components/ui/magic-card";
import { BlurFade } from "../../components/ui/blur-fade";
import { AnimatedGradientText } from "../../components/ui/animated-gradient-text";
import { BorderBeam } from "../../components/ui/border-beam";
import partnerHttp from "../../lib/api/client";

/**
 * Partner Change Password Page
 * Allows partners to change their password using old password
 */
export default function PartnerChangePasswordPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isRtl = i18n.language === "ar";

  const validatePassword = () => {
    if (!formData.currentPassword) {
      toast.error(t("auth.currentPasswordRequired"));
      return false;
    }

    if (formData.newPassword.length < 8) {
      toast.error(t("auth.passwordTooShort"));
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /\d/.test(formData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error(t("auth.passwordRequirements"));
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("auth.passwordsDoNotMatch"));
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error(t("auth.newPasswordSameAsOld"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await partnerHttp.put("/profile/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(t("auth.passwordChangedSuccess"));

      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/partner/dashboard");
      }, 2000);
    } catch (error: unknown) {
      console.error("Change password error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data &&
        error.response.data.error &&
        typeof error.response.data.error === "object" &&
        "message" in error.response.data.error
          ? String(error.response.data.error.message)
          : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PartnerLayout>
      <div dir={isRtl ? "rtl" : "ltr"} className="max-w-2xl mx-auto">
        <BlurFade delay={0.1}>
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full  from-indigo-600 to-purple-600">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <AnimatedGradientText className="text-3xl font-bold">
                {t("auth.changePassword")}
              </AnimatedGradientText>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("auth.changePasswordDesc")}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <MagicCard className="p-8 relative overflow-hidden">
            <BorderBeam size={250} duration={12} delay={9} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password Field */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t("auth.currentPassword")}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${
                      isRtl ? "right-0 pr-3" : "left-0 pl-3"
                    } flex items-center pointer-events-none`}
                  >
                    <Lock
                      className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === "currentPassword"
                          ? "text-indigo-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    onFocus={() => setFocusedField("currentPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full ${
                      isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200`}
                    placeholder={t("auth.enterCurrentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute inset-y-0 ${
                      isRtl ? "left-0 pl-3" : "right-0 pr-3"
                    } flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t("auth.newPassword")}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${
                      isRtl ? "right-0 pr-3" : "left-0 pl-3"
                    } flex items-center pointer-events-none`}
                  >
                    <Lock
                      className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === "newPassword"
                          ? "text-indigo-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full ${
                      isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200`}
                    placeholder={t("auth.passwordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute inset-y-0 ${
                      isRtl ? "left-0 pl-3" : "right-0 pr-3"
                    } flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("auth.passwordHint")}
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${
                      isRtl ? "right-0 pr-3" : "left-0 pl-3"
                    } flex items-center pointer-events-none`}
                  >
                    <Lock
                      className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === "confirmPassword"
                          ? "text-indigo-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full ${
                      isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200`}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 ${
                      isRtl ? "left-0 pl-3" : "right-0 pr-3"
                    } flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword
                }
                className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white  from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("auth.changing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t("auth.changePassword")}
                  </>
                )}
              </button>
            </form>
          </MagicCard>
        </BlurFade>
      </div>
    </PartnerLayout>
  );
}
