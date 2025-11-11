import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Shield,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "../components/ui/magic-card";
import { ShineBorder } from "../components/ui/shine-border";
import { BlurFade } from "../components/ui/blur-fade";
import { AnimatedGradientText } from "../components/ui/animated-gradient-text";
import { BorderBeam } from "../components/ui/border-beam";
import { colors } from "@/config/colors";

/**
 * Enhanced Login Page Component
 * Supports Admin, Partner, and Customer login with modern UI and animations
 * Features: RTL support, i18n, responsive design, Magic UI effects
 */
export default function LoginPage() {
  const { t, i18n } = useTranslation("common");
  const { login, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isRtl = i18n.language === "ar";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (user?.userType === "admin") {
        router.push("/dashboard");
      } else if (user?.userType === "partner") {
        router.push("/partner/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, loading, router, user]);

  /**
   * Toggle between English and Arabic languages
   */
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  /**
   * Handle input field changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      toast.success(t("auth.loginSuccess"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-t-4 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-12 w-12 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            {t("common.loading")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl relative"
            >
              <Shield className="h-8 w-8 text-white" />
              <BorderBeam size={60} duration={3} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <AnimatedGradientText className="text-4xl font-extrabold">
                {t("auth.welcomeBack")}
              </AnimatedGradientText>
              <p className="mt-3 text-base text-gray-600">
                {t("auth.signInToContinue")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex relative"
            >
              <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full relative">
                <ShineBorder shineColor="#818cf8" duration={3} />
                <div className="flex items-center gap-2 relative z-10">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {t("auth.secureLogin")}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </BlurFade>

        {/* Language Switcher */}
        <BlurFade delay={0.4} inView>
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
            >
              <Globe className="h-4 w-4" />
              {i18n.language === "en" ? "العربية" : "English"}
            </motion.button>
          </div>
        </BlurFade>

        {/* Login Form */}
        <BlurFade delay={0.5} inView>
          <MagicCard
            className="p-8 bg-white/80 backdrop-blur-sm shadow-2xl"
            gradientColor="#d1d5db"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-5"
                >
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                          className={`h-5 w-5 ${
                            focusedField === "email"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          } transition-colors duration-200`}
                        />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full ${
                          isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                        } py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                        placeholder={t("auth.enterEmail")}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 ${
                          isRtl ? "right-0 pr-3" : "left-0 pl-3"
                        } flex items-center pointer-events-none`}
                      >
                        <Lock
                          className={`h-5 w-5 ${
                            focusedField === "password"
                              ? "text-indigo-600"
                              : "text-gray-400"
                          } transition-colors duration-200`}
                        />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full ${
                          isRtl ? "pr-11 pl-12" : "pl-11 pr-12"
                        } py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50`}
                        placeholder={t("auth.enterPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 ${
                          isRtl ? "left-0 pl-3" : "right-0 pr-3"
                        } flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200`}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <label
                    htmlFor="remember-me"
                    className={`${
                      isRtl ? "mr-2" : "ml-2"
                    } block text-sm text-gray-700 font-medium`}
                  >
                    {t("auth.rememberMe")}
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => router.push("/partner/forgot-password")}
                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{t("auth.signingIn")}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>{t("auth.login")}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center pt-2"
              >
                <p className="text-sm text-gray-600">
                  {t("auth.dontHaveAccount")}{" "}
                  <a
                    href="/register"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                  >
                    {t("auth.register")}
                  </a>
                </p>
              </motion.div>
            </form>
          </MagicCard>
        </BlurFade>

        {/* Portal Type Indicator */}
        <BlurFade delay={1.0} inView>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-center"
          >
            <p className="text-xs text-gray-500">
              {t("app.name")} • {t("auth.adminPortal")} /{" "}
              {t("auth.partnerPortal")}
            </p>
          </motion.div>
        </BlurFade>
      </div>

      {/* Custom animations in CSS */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
