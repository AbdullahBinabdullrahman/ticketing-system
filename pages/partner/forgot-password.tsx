"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
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
 * Partner Forgot Password Page
 * Allows partners to request a password reset link
 */
export default function PartnerForgotPasswordPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(false);
  const isRtl = i18n.language === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("auth.emailRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/api/auth/forgot-password", {
        email,
        language: i18n.language,
      });

      setIsSuccess(true);
      toast.success(t("auth.resetLinkSent"));
    } catch (error) {
      console.error("Forgot password error:", error);
      // Don't show specific error to prevent email enumeration
      toast.success(t("auth.resetLinkSent"));
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    {t("auth.forgotPassword")}
                  </AnimatedGradientText>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("auth.forgotPasswordDesc")}
                  </p>
                </div>
              </BlurFade>

              <BlurFade delay={0.2}>
                <MagicCard className="p-8 relative overflow-hidden">
                  <BorderBeam size={250} duration={12} delay={9} />

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("auth.email")}
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 ${
                            isRtl ? "right-0 pr-3" : "left-0 pl-3"
                          } flex items-center pointer-events-none`}
                        >
                          <Mail
                            className={`h-5 w-5 transition-colors duration-200 ${
                              focusedField
                                ? "text-indigo-600"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField(true)}
                          onBlur={() => setFocusedField(false)}
                          className={`block w-full ${
                            isRtl ? "pr-10 text-right" : "pl-10"
                          } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200`}
                          placeholder={t("auth.emailPlaceholder")}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("auth.sending")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {t("auth.sendResetLink")}
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
                    {t("auth.checkYourEmail")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t("auth.resetLinkSentDesc")}
                  </p>
                  <button
                    onClick={() => router.push("/login")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    {t("auth.backToLogin")}
                  </button>
                </MagicCard>
              </BlurFade>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

