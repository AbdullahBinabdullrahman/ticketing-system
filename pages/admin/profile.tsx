/**
 * Admin Profile Page
 * View and edit admin user profile
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import { MagicCard } from "../../components/ui/magic-card";
import { BlurFade } from "../../components/ui/blur-fade";
import { useAuth } from "../../lib/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Globe,
  Calendar,
  Edit,
  Check,
  X,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import adminHttp from "../../lib/utils/http";

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  languagePreference: z.enum(["en", "ar"]),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

/**
 * Admin Profile Page Component
 */
export default function AdminProfilePage() {
  const { t } = useTranslation("common");
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      languagePreference: (user?.languagePreference as "en" | "ar") || "en",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  /**
   * Handle profile update
   */
  const onUpdateProfile = async (data: ProfileForm) => {
    try {
      setIsSubmitting(true);
      await adminHttp.patch("/auth/profile", data);
      await refreshUser();
      toast.success(t("success.updated"));
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle password change
   */
  const onChangePassword = async (data: PasswordForm) => {
    try {
      setIsSubmitting(true);
      await adminHttp.post("/auth/profile/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t("auth.passwordChangedSuccess"));
      setIsChangingPassword(false);
      resetPassword();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    resetProfile({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      languagePreference: (user?.languagePreference as "en" | "ar") || "en",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">{t("common.loading")}...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("navigation.profile")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("auth.manageYourProfile")}
              </p>
            </div>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <BlurFade delay={0.15}>
              <MagicCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t("auth.profileInformation")}
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {t("common.edit")}
                    </button>
                  ) : null}
                </div>

                <form
                  onSubmit={handleSubmitProfile(onUpdateProfile)}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("auth.name")} *
                    </label>
                    <input
                      {...registerProfile("name")}
                      type="text"
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                    {profileErrors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("auth.email")} *
                    </label>
                    <input
                      {...registerProfile("email")}
                      type="email"
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                    {profileErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("auth.phone")} ({t("common.optional")})
                    </label>
                    <input
                      {...registerProfile("phone")}
                      type="tel"
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("common.language")}
                    </label>
                    <select
                      {...registerProfile("languagePreference")}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {isSubmitting ? t("common.updating") : t("common.save")}
                      </button>
                    </div>
                  )}
                </form>
              </MagicCard>
            </BlurFade>

            {/* Change Password Card */}
            <BlurFade delay={0.25}>
              <MagicCard className="p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {t("auth.changePassword")}
                  </h2>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {t("common.edit")}
                    </button>
                  ) : null}
                </div>

                {isChangingPassword ? (
                  <form
                    onSubmit={handleSubmitPassword(onChangePassword)}
                    className="space-y-4"
                  >
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.currentPassword")} *
                      </label>
                      <input
                        {...registerPassword("currentPassword")}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        placeholder={t("auth.enterCurrentPassword")}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.newPassword")} *
                      </label>
                      <input
                        {...registerPassword("newPassword")}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        placeholder={t("auth.passwordPlaceholder")}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t("auth.passwordHint")}
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("auth.confirmPassword")} *
                      </label>
                      <input
                        {...registerPassword("confirmPassword")}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        placeholder={t("auth.confirmPasswordPlaceholder")}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          resetPassword();
                        }}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {isSubmitting
                          ? t("auth.changing")
                          : t("auth.changePassword")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("auth.changePasswordDesc")}
                  </p>
                )}
              </MagicCard>
            </BlurFade>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            {/* Account Info */}
            <BlurFade delay={0.2}>
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("auth.accountInfo")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("users.role")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {user.userType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("auth.email")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("auth.phone")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("common.language")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.languagePreference === "ar"
                          ? "العربية"
                          : "English"}
                      </p>
                    </div>
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("users.lastLogin")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(user.lastLoginAt), "PPp")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </MagicCard>
            </BlurFade>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
