"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "../../../components/layout/AdminLayout";
import { createPartnerWithUserSchema, type CreatePartnerWithUserInput } from "../../../schemas/partners";
import { partnersApi } from "../../../lib/api/partners";
import { BlurFade } from "../../../components/ui/blur-fade";
import { ShimmerButton } from "../../../components/ui/shimmer-button";
import { 
  Building2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  KeyRound
} from "lucide-react";
import toast from "react-hot-toast";

export default function NewPartnerPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreatePartnerWithUserInput>({
    resolver: zodResolver(createPartnerWithUserSchema),
    defaultValues: {
      status: "active",
      sendWelcomeEmail: true,
    },
  });

  const onSubmit = async (data: CreatePartnerWithUserInput) => {
    try {
      setIsSubmitting(true);

      const response = await partnersApi.createPartner(data);

      // Show success with user details
      if (response.user?.temporaryPassword) {
        toast.success(
          <div>
            <p className="font-semibold">{t("partners.userCreated")}</p>
            <p className="text-xs mt-1">
              {t("users.email")}: {response.user.email}
            </p>
            <p className="text-xs">
              {t("partners.temporaryPassword")}: <span className="font-mono">{response.user.temporaryPassword}</span>
            </p>
          </div>,
          { duration: 10000 } // Show longer for password
        );
      } else {
        toast.success(t("partners.userCreated"), {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });
      }

      // Navigate to partner detail page
      router.push(`/admin/partners/${response.partner.id}`);
    } catch (error: any) {
      console.error("Failed to create partner:", error);
      
      const errorMessage = error.response?.data?.error?.message || t("errors.generic");
      
      toast.error(errorMessage, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = watch("status");

  return (
    <AdminLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("partners.newPartner")}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("partners.addPartnerDescription")}
                </p>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <BlurFade delay={0.2}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("partners.basicInformation")}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Partner Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("partners.partnerName")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...register("name")}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                          errors.name
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder={t("partners.enterPartnerName")}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("partners.status")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        {...register("status")}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="active">{t("partners.active")}</option>
                        <option value="inactive">{t("partners.inactive")}</option>
                        <option value="suspended">{t("partners.suspended")}</option>
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </BlurFade>

              {/* Contact Information */}
              <BlurFade delay={0.3}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("common.contactInfo")}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Contact Email */}
                    <div>
                      <label
                        htmlFor="contactEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("partners.contactEmail")} <span className="text-gray-400 text-xs">({t("common.optional")})</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="contactEmail"
                          type="email"
                          {...register("contactEmail")}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                            errors.contactEmail
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="partner@example.com"
                        />
                      </div>
                      {errors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.contactEmail.message}
                        </p>
                      )}
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label
                        htmlFor="contactPhone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("partners.contactPhone")} <span className="text-gray-400 text-xs">({t("common.optional")})</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="contactPhone"
                          type="tel"
                          {...register("contactPhone")}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                            errors.contactPhone
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="+966 XXX XXX XXX"
                        />
                      </div>
                      {errors.contactPhone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.contactPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </BlurFade>

              {/* Logo */}
              <BlurFade delay={0.4}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("partners.logo")}
                    </h2>
                  </div>

                  <div>
                    <label
                      htmlFor="logoUrl"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t("partners.logoUrl")} <span className="text-gray-400 text-xs">({t("common.optional")})</span>
                    </label>
                    <input
                      id="logoUrl"
                      type="url"
                      {...register("logoUrl")}
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                        errors.logoUrl
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="https://example.com/logo.png"
                    />
                    {errors.logoUrl && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.logoUrl.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t("partners.logoUrlHelper")}
                    </p>
                  </div>
                </div>
              </BlurFade>

              {/* Initial User Account */}
              <BlurFade delay={0.5}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t("partners.initialUser")}
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t("partners.initialUserDescription")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* User Name */}
                    <div>
                      <label
                        htmlFor="userName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("users.name")} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="userName"
                          type="text"
                          {...register("userName")}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                            errors.userName
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.userName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.userName.message}
                        </p>
                      )}
                    </div>

                    {/* User Email */}
                    <div>
                      <label
                        htmlFor="userEmail"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("users.email")} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="userEmail"
                          type="email"
                          {...register("userEmail")}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                            errors.userEmail
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="user@example.com"
                        />
                      </div>
                      {errors.userEmail && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.userEmail.message}
                        </p>
                      )}
                    </div>

                    {/* User Phone */}
                    <div>
                      <label
                        htmlFor="userPhone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("users.phone")} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="userPhone"
                          type="tel"
                          {...register("userPhone")}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                            errors.userPhone
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="+966 XXX XXX XXX"
                        />
                      </div>
                      {errors.userPhone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.userPhone.message}
                        </p>
                      )}
                    </div>

                    {/* Optional Password */}
                    <div>
                      <label
                        htmlFor="userPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t("users.password")} <span className="text-gray-400 text-xs">({t("common.optional")})</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="userPassword"
                          type="password"
                          {...register("userPassword")}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${
                            errors.userPassword
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.userPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.userPassword.message}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t("partners.passwordHelp")}
                      </p>
                    </div>

                    {/* Send Welcome Email */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                      <input
                        id="sendWelcomeEmail"
                        type="checkbox"
                        {...register("sendWelcomeEmail")}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="sendWelcomeEmail"
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {t("partners.sendWelcomeEmail")}
                      </label>
                    </div>
                  </div>
                </div>
              </BlurFade>
            </div>

            {/* Sidebar - Preview & Actions */}
            <div className="space-y-6">
              {/* Preview Card */}
              <BlurFade delay={0.2}>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg shadow-sm border border-primary-200 dark:border-primary-700 p-6 sticky top-6">
                  <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-4 uppercase tracking-wide">
                    {t("common.preview")}
                  </h3>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {watch("name") || t("partners.partnerName")}
                        </h4>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                            status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : status === "inactive"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {t(`partners.${status}`)}
                        </span>
                      </div>
                    </div>

                    {watch("contactEmail") && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{watch("contactEmail")}</span>
                      </div>
                    )}

                    {watch("contactPhone") && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{watch("contactPhone")}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 text-xs text-primary-800 dark:text-primary-200">
                    <p className="font-medium mb-1">{t("partners.nextSteps")}</p>
                    <ul className="list-disc list-inside space-y-1 text-primary-700 dark:text-primary-300">
                      <li>{t("partners.addBranches")}</li>
                      <li>{t("partners.assignCategories")}</li>
                      <li>{t("partners.configureServices")}</li>
                    </ul>
                  </div>
                </div>
              </BlurFade>

              {/* Action Buttons */}
              <BlurFade delay={0.3}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-3">
                    <ShimmerButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("common.creating")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {t("partners.createPartner")}
                        </>
                      )}
                    </ShimmerButton>

                    <button
                      type="button"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    <span className="text-red-500">*</span> {t("common.requiredFields")}
                  </p>
                </div>
              </BlurFade>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

