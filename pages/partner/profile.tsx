"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PartnerLayout from "../../components/layout/PartnerLayout";
import { usePartnerProfile } from "../../hooks/usePartnerProfile";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Tag,
  Calendar,
  Edit,
  TrendingUp,
} from "lucide-react";
import { BlurFade } from "../../components/ui/blur-fade";
import toast from "react-hot-toast";

export default function PartnerProfile() {
  const { t, i18n } = useTranslation("common");
  const { partner, branches, categories, users, isLoading, updateProfile } =
    usePartnerProfile();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    contactEmail: "",
    contactPhone: "",
  });

  React.useEffect(() => {
    if (partner) {
      setFormData({
        contactEmail: partner.contactEmail || "",
        contactPhone: partner.contactPhone || "",
      });
    }
  }, [partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success(t("partner.profile.updateSuccess"));
    } catch (_error) {
      toast.error(t("errors.generic"));
    }
  };

  if (isLoading) {
    return (
      <PartnerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PartnerLayout>
    );
  }

  if (!partner) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t("errors.notFound")}
          </p>
        </div>
      </PartnerLayout>
    );
  }

  const tabs = [
    {
      id: "profile",
      label: t("partner.profile.tabs.profile"),
      icon: Building2,
    },
    {
      id: "branches",
      label: t("partner.profile.tabs.branches"),
      icon: MapPin,
    },
    { id: "users", label: t("partner.profile.tabs.users"), icon: Users },
    {
      id: "performance",
      label: t("partner.profile.tabs.performance"),
      icon: TrendingUp,
    },
  ];

  return (
    <PartnerLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("partner.profile.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("partner.profile.companyInfo")}
            </p>
          </div>
        </BlurFade>

        {/* Partner Info Card */}
        <BlurFade delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-start gap-6">
              {partner.logoUrl && (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {i18n.language === "ar" && partner.nameAr
                    ? partner.nameAr
                    : partner.name}
                </h2>
                {partner.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {i18n.language === "ar" && partner.descriptionAr
                      ? partner.descriptionAr
                      : partner.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {branches.length} {t("partner.profile.branchesCount")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {categories.length}{" "}
                      {t("partner.profile.categoriesCount")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {users.length} {t("partner.profile.usersCount")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(partner.createdAt).toLocaleDateString(
                        i18n.language
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Tabs */}
        <BlurFade delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("partner.profile.contactInfo")}
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? t("common.cancel") : t("partner.profile.editProfile")}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("partner.profile.contactEmail")}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                contactEmail: e.target.value,
                              })
                            }
                            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("partner.profile.contactPhone")}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                contactPhone: e.target.value,
                              })
                            }
                            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          {t("partner.profile.updateProfile")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("partner.profile.contactEmail")}
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {partner.contactEmail || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("partner.profile.contactPhone")}
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {partner.contactPhone || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Branches Tab */}
              {activeTab === "branches" && (
                <div className="space-y-4">
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {i18n.language === "ar" && branch.nameAr
                            ? branch.nameAr
                            : branch.name}
                        </h4>
                        <div className="space-y-2 text-sm">
                          {branch.address && (
                            <p className="text-gray-600 dark:text-gray-400">
                              {branch.address}
                            </p>
                          )}
                          {branch.contactPhone && (
                            <p className="text-gray-600 dark:text-gray-400">
                              {branch.contactPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      {t("partner.profile.noBranches")}
                    </p>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          }`}
                        >
                          {user.isActive
                            ? t("partner.users.activeUser")
                            : t("partner.users.inactiveUser")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      {t("partner.users.noUsers")}
                    </p>
                  )}
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === "performance" && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    {t("partner.dashboard.performanceMetrics")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </BlurFade>

        {/* Categories */}
        {categories.length > 0 && (
          <BlurFade delay={0.4}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("navigation.categories")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    {category.iconUrl && (
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {i18n.language === "ar" && category.nameAr
                        ? category.nameAr
                        : category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        )}
      </div>
    </PartnerLayout>
  );
}

