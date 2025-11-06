/**
 * Admin Users Management Page
 * Manage admin and operational team users
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import AdminLayout from "../../components/layouts/AdminLayout";
import { MagicCard } from "../../components/magicui/magic-card";
import { BlurFade } from "../../components/magicui/blur-fade";
import { ShimmerButton } from "../../components/magicui/shimmer-button";
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "../../hooks/useAdminUsers";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";

// Form validation schema
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  roleId: z.number().int().positive("Role is required"),
  language: z.enum(["en", "ar"]).optional(),
  sendWelcomeEmail: z.boolean().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

/**
 * Admin Users Management Page Component
 */
export default function AdminUsersPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language === "ar";

  // Data fetching
  const { users, roles, isLoading, mutate } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      language: i18n.language as "en" | "ar",
      sendWelcomeEmail: true,
    },
  });

  /**
   * Handle create user
   */
  const onCreateUser = async (data: CreateUserForm) => {
    try {
      setIsSubmitting(true);
      const response = await createUser(data);

      if (response.success) {
        toast.success(t("users.userCreatedSuccess"));
        
        // Show generated password if available
        if (response.data.temporaryPassword) {
          setGeneratedPassword(response.data.temporaryPassword);
        } else {
          setShowCreateModal(false);
          reset();
        }

        await mutate(); // Refresh list
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle update user
   */
  const onUpdateUser = async (data: UpdateAdminUserInput) => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await updateUser(selectedUser.id, data);
      toast.success(t("users.userUpdatedSuccess"));
      setShowEditModal(false);
      setSelectedUser(null);
      await mutate(); // Refresh list
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete user
   */
  const onDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await deleteUser(selectedUser.id);
      toast.success(t("users.userDeletedSuccess"));
      setShowDeleteModal(false);
      setSelectedUser(null);
      await mutate(); // Refresh list
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Copy password to clipboard
   */
  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success(t("common.copiedToClipboard"));
    }
  };

  /**
   * Close password modal and reset form
   */
  const closePasswordModal = () => {
    setGeneratedPassword(null);
    setShowCreateModal(false);
    setShowPassword(false);
    reset();
  };

  if (isLoading) {
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
                {t("users.adminUsers")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("users.manageAdminOperationalUsers")}
              </p>
            </div>
            <ShimmerButton
              onClick={() => setShowCreateModal(true)}
              background="rgb(79, 70, 229)"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {t("users.addUser")}
            </ShimmerButton>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BlurFade delay={0.15}>
            <MagicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("users.totalUsers")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.length}
                  </p>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.2}>
            <MagicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("users.activeUsers")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.isActive).length}
                  </p>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.25}>
            <MagicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("users.roles")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roles.length}
                  </p>
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        </div>

        {/* Users Table */}
        <BlurFade delay={0.3}>
          <MagicCard className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("users.name")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("users.email")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("users.role")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("users.status")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("users.lastLogin")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        {t("users.noUsersFound")}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              {user.phone && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                          {user.email}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            {user.roleName}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              {t("users.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                              <XCircle className="w-3 h-3" />
                              {t("users.inactive")}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                          {user.lastLoginAt
                            ? format(new Date(user.lastLoginAt), "PPp")
                            : t("users.neverLoggedIn")}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                              title={t("common.edit")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title={t("common.delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </MagicCard>
        </BlurFade>

        {/* Create User Modal */}
        {showCreateModal && !generatedPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <BlurFade delay={0.1} className="w-full max-w-2xl">
              <MagicCard className="p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t("users.addUser")}
                </h3>

                <form
                  onSubmit={handleSubmit(onCreateUser)}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("users.name")} *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                      placeholder={t("users.enterName")}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("users.email")} *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                      placeholder={t("users.enterEmail")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("users.phone")} ({t("common.optional")})
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                      placeholder={t("users.enterPhone")}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("users.role")} *
                    </label>
                    <select
                      {...register("roleId", { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">{t("users.selectRole")}</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                    </select>
                    {errors.roleId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.roleId.message}
                      </p>
                    )}
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("users.language")}
                    </label>
                    <select
                      {...register("language")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  {/* Send Welcome Email */}
                  <div className="flex items-center gap-2">
                    <input
                      {...register("sendWelcomeEmail")}
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      {t("users.sendWelcomeEmail")}
                    </label>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {t("users.autoGeneratePasswordNote")}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        reset();
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? t("common.creating") : t("common.create")}
                    </button>
                  </div>
                </form>
              </MagicCard>
            </BlurFade>
          </div>
        )}

        {/* Generated Password Modal */}
        {generatedPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <BlurFade delay={0.1} className="w-full max-w-md">
              <MagicCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("users.userCreatedSuccess")}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("users.temporaryPasswordGenerated")}
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("users.temporaryPassword")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={generatedPassword}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white font-mono"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={showPassword ? t("common.hide") : t("common.show")}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={copyPassword}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title={t("common.copy")}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {t("users.savePasswordWarning")}
                </div>

                <button
                  onClick={closePasswordModal}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t("common.close")}
                </button>
              </MagicCard>
            </BlurFade>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <BlurFade delay={0.1} className="w-full max-w-md">
              <MagicCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("users.deleteUser")}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("users.deleteConfirmation", { name: selectedUser.name })}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white transition-colors disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={onDeleteUser}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? t("common.deleting") : t("common.delete")}
                  </button>
                </div>
              </MagicCard>
            </BlurFade>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

