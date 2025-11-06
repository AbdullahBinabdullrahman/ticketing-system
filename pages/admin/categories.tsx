"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import { useCategories } from "../../hooks/useCategories";
import { BlurFade } from "../../components/ui/blur-fade";
import { MagicCard } from "../../components/ui/magic-card";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "../../hooks/useCategories";

/**
 * Categories Management Page
 * Allows admin users to manage service categories
 */
export default function AdminCategoriesPage() {
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language === "ar";

  const [search, setSearch] = useState("");
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories(search);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    iconUrl: "",
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        nameAr: category.nameAr || "",
        description: category.description || "",
        descriptionAr: category.descriptionAr || "",
        iconUrl: category.iconUrl || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        iconUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        iconUrl: "",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("categories.categoryNameRequired", "Category name is required"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success(t("categories.categoryUpdated"));
      } else {
        await createCategory(formData);
        toast.success(t("categories.categoryCreated"));
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(t("categories.confirmDelete") + ` (${name})?`)) {
      return;
    }

    try {
      await deleteCategory(id);
      toast.success(t("categories.categoryDeleted"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.generic"));
    }
  };

  if (isLoading) {
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

  return (
    <AdminLayout>
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <BlurFade delay={0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("categories.title")}
                </h1>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  {t("categories.manageCategoriesDescription")}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                {t("categories.newCategory")}
              </motion.button>
            </div>
          </BlurFade>

          {/* Search Bar */}
          <BlurFade delay={0.2}>
            <div className="mb-6">
              <div className="relative">
                <Search
                  className={`absolute top-3.5 ${
                    isRtl ? "right-4" : "left-4"
                  } h-5 w-5 text-gray-400`}
                />
                <input
                  type="text"
                  placeholder={t("categories.searchCategories")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full ${
                    isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                  } py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                />
              </div>
            </div>
          </BlurFade>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <BlurFade delay={0.3}>
              <MagicCard
                className="p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                gradientColor="#d1d5db"
              >
                <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {search
                    ? t("categories.noSearchResults")
                    : t("categories.noCategories")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {search
                    ? t("categories.tryDifferentSearch")
                    : t("categories.noCategoriesDescription")}
                </p>
                {!search && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-5 w-5" />
                    {t("categories.createFirst")}
                  </button>
                )}
              </MagicCard>
            </BlurFade>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <BlurFade key={category.id} delay={0.3 + index * 0.05}>
                  <MagicCard
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                    gradientColor="#d1d5db"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {category.iconUrl && (
                          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <span className="text-2xl">{category.iconUrl}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {category.name}
                          </h3>
                          {category.nameAr && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {category.nameAr}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {(category.description || category.descriptionAr) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {isRtl && category.descriptionAr
                          ? category.descriptionAr
                          : category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal(category)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t("common.edit")}
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(category.id, category.name)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t("common.delete")}
                        </span>
                      </motion.button>
                    </div>
                  </MagicCard>
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingCategory
                    ? t("categories.editCategory")
                    : t("categories.newCategory")}
                </h2>
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Name (English) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("categories.categoryName")} (English){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g., Plumbing Services"
                  />
                </div>

                {/* Category Name (Arabic) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("categories.categoryName")} (العربية)
                  </label>
                  <input
                    type="text"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    dir="rtl"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="مثال: خدمات السباكة"
                  />
                </div>

                {/* Icon URL */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("categories.icon")} (Emoji or URL)
                  </label>
                  <input
                    type="text"
                    name="iconUrl"
                    value={formData.iconUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="🔧"
                  />
                  {formData.iconUrl && (
                    <div className="mt-2 text-2xl">{formData.iconUrl}</div>
                  )}
                </div>

                {/* Description (English) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("categories.description")} (English)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Brief description of this category..."
                  />
                </div>

                {/* Description (Arabic) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("categories.description")} (العربية)
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleInputChange}
                    rows={3}
                    dir="rtl"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="وصف مختصر لهذه الفئة..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-semibold transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {editingCategory
                          ? t("common.updating")
                          : t("common.creating")}
                      </>
                    ) : (
                      <>
                        {editingCategory ? t("common.update") : t("common.create")}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
