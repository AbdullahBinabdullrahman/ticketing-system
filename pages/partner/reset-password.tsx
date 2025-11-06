"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "../../components/ui/magic-card";
import { BlurFade } from "../../components/ui/blur-fade";
import { AnimatedGradientText } from "../../components/ui/animated-gradient-text";
import { BorderBeam } from "../../components/ui/border-beam";
import axios from "axios";

/**
 * Partner Reset Password Page
 * Allows partners to reset their password using a token
 */
export default function PartnerResetPasswordPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isRtl = i18n.language === "ar";

  // Validate token on mount - wait for router to be ready
  useEffect(() => {
    if (router.isReady && !token) {
      setIsTokenValid(false);
      toast.error(t("auth.invalidResetToken"));
    }
  }, [router.isReady, token, t]);

  const validatePassword = () => {
    if (password.length < 8) {
      toast.error(t("auth.passwordTooShort"));
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error(t("auth.passwordRequirements"));
      return false;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordsDoNotMatch"));
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
      await axios.post("/api/auth/reset-password", {
        token,
        password,
      });

      setIsSuccess(true);
      toast.success(t("auth.passwordResetSuccess"));

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error(t("errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          <BlurFade delay={0.1}>
            <MagicCard className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t("auth.invalidResetToken")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("auth.invalidTokenDesc")}
              </p>
              <button
                onClick={() => router.push("/partner/forgot-password")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                {t("auth.requestNewLink")}
              </button>
            </MagicCard>
          </BlurFade>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlurFade delay={0.1}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <AnimatedGradientText className="text-3xl font-bold mb-2">
                    {t("auth.resetPassword")}
                  </AnimatedGradientText>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("auth.resetPasswordDesc")}
                  </p>
                </div>
              </BlurFade>

              <BlurFade delay={0.2}>
                <MagicCard className="p-8 relative overflow-hidden">
                  <BorderBeam size={250} duration={12} delay={9} />

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password Field */}
                    <div>
                      <label
                        htmlFor="password"
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
                              focusedField === "password"
                                ? "text-indigo-600"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          className={`block w-full ${
                            isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                          } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200`}
                          placeholder={t("auth.passwordPlaceholder")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute inset-y-0 ${
                            isRtl ? "left-0 pl-3" : "right-0 pr-3"
                          } flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                        >
                          {showPassword ? (
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
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField("confirmPassword")}
                          onBlur={() => setFocusedField(null)}
                          className={`block w-full ${
                            isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                          } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200`}
                          placeholder={t("auth.confirmPasswordPlaceholder")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
                      disabled={isSubmitting || !password || !confirmPassword}
                      className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("auth.resetting")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {t("auth.resetPassword")}
                        </>
                      )}
                    </button>

                    {/* Back to Login Link */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t("auth.backToLogin")}
                      </button>
                    </div>
                  </form>
                </MagicCard>
              </BlurFade>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <BlurFade delay={0.1}>
                <MagicCard className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("auth.passwordResetSuccess")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t("auth.passwordResetSuccessDesc")}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.redirectingToLogin")}
                  </div>
                </MagicCard>
              </BlurFade>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

