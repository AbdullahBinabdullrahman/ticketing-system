"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { usePartner } from "../../../../hooks/usePartners";
import { usePartnerCategories } from "../../../../hooks/usePartnerCategories";
import { useCategories } from "../../../../hooks/useCategories";
import { BlurFade } from "../../../../components/ui/blur-fade";
import { MagicCard } from "../../../../components/ui/magic-card";
import {
  Tag,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Partner Categories Page
 * Allows admin users to manage categories for a specific partner
 */
export default function PartnerCategoriesPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const partnerId = id ? parseInt(id as string) : null;
  const isRtl = i18n.language === "ar";

  const { partner, isLoading: partnerLoading } = usePartner(partnerId);
  const {
    categories: partnerCategories,
    isLoading: categoriesLoading,
    assignCategory,
    removeCategory,
  } = usePartnerCategories(partnerId);
  const { categories: allCategories } = useCategories();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedCategoryIds = partnerCategories.map((pc) => pc.categoryId);
  const availableCategories = allCategories.filter(
    (cat) => !assignedCategoryIds.includes(cat.id)
  );

  const handleAssignCategory = async () => {
    if (!selectedCategoryId) {
      toast.error(t("categories.selectCategory"));
      return;
    }

    setIsSubmitting(true);
    try {
      await assignCategory(selectedCategoryId);
      toast.success(t("success.assigned"));
      setIsAddingCategory(false);
      setSelectedCategoryId(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("errors.generic")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCategory = async (categoryId: number) => {
    if (!confirm(t("categories.confirmRemove"))) {
      return;
    }

    try {
      await removeCategory(categoryId);
      toast.success(t("success.deleted"));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("errors.generic")
      );
    }
  };

  if (partnerLoading || categoriesLoading) {
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
        <div className="max-w-6xl mx-auto">
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
                    {t("categories.title")}
                  </h1>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {partner.name}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingCategory(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                {t("categories.assignCategory")}
              </motion.button>
            </div>
          </BlurFade>

          {/* Assigned Categories */}
          <BlurFade delay={0.2}>
            {partnerCategories.length === 0 ? (
              <MagicCard
                className="p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                gradientColor="#d1d5db"
              >
                <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t("categories.noCategories")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("categories.noCategoriesDescription")}
                </p>
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <Plus className="h-5 w-5" />
                  {t("categories.assignFirst")}
                </button>
              </MagicCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerCategories.map((category) => (
                  <BlurFade key={category.id} delay={0.3}>
                    <MagicCard
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                      gradientColor="#d1d5db"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {category.categoryIcon && (
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <span className="text-2xl">
                                {category.categoryIcon}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.categoryName}
                            </h3>
                            {category.categoryDescription && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {category.categoryDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleRemoveCategory(category.categoryId)
                          }
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{t("categories.assigned")}</span>
                      </div>
                    </MagicCard>
                  </BlurFade>
                ))}
              </div>
            )}
          </BlurFade>
        </div>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAddingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setIsAddingCategory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("categories.assignCategory")}
                </h2>
                <button
                  onClick={() => setIsAddingCategory(false)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {availableCategories.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("categories.allAssigned")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      {t("categories.selectCategory")}
                    </label>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableCategories.map((category) => (
                        <motion.button
                          key={category.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCategoryId(category.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedCategoryId === category.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                              : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {category.icon && (
                              <span className="text-2xl">{category.icon}</span>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setIsAddingCategory(false)}
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-semibold transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAssignCategory}
                      disabled={!selectedCategoryId || isSubmitting}
                      className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t("common.assigning")}
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          {t("categories.assign")}
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

