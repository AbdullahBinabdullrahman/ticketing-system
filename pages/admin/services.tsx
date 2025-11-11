"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import { useServices } from "../../hooks/useServices";
import { useCategories } from "../../hooks/useCategories";
import { BlurFade } from "../../components/ui/blur-fade";
import { MagicCard } from "../../components/ui/magic-card";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Service } from "../../hooks/useServices";

/**
 * Services Management Page
 * Allows admin users to manage services linked to categories
 */
export default function AdminServicesPage() {
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language === "ar";

  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | undefined
  >(undefined);

  const { categories } = useCategories();
  const {
    services,
    isLoading,
    createService,
    updateService,
    deleteService,
  } = useServices(selectedCategoryFilter, search);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: 0,
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    iconUrl: "",
  });

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        categoryId: service.categoryId,
        name: service.name || "",
        nameAr: service.nameAr || "",
        description: service.description || "",
        descriptionAr: service.descriptionAr || "",
        iconUrl: service.iconUrl || "",
      });
    } else {
      setEditingService(null);
      setFormData({
        categoryId: selectedCategoryFilter || 0,
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
      setEditingService(null);
      setFormData({
        categoryId: 0,
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        iconUrl: "",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "categoryId" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("services.serviceNameRequired", "Service name is required"));
      return;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      toast.error(t("services.categoryRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
        toast.success(t("services.serviceUpdated"));
      } else {
        await createService(formData);
        toast.success(t("services.serviceCreated"));
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(t("services.confirmDelete") + ` (${name})?`)) {
      return;
    }

    try {
      await deleteService(id);
      toast.success(t("services.serviceDeleted"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.generic"));
    }
  };

  if (isLoading && services.length === 0) {
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
                  {t("services.title")}
                </h1>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  {t("services.manageServicesDescription")}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                {t("services.newService")}
              </motion.button>
            </div>
          </BlurFade>

          {/* Filters */}
          <BlurFade delay={0.2}>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className={`absolute top-3.5 ${
                    isRtl ? "right-4" : "left-4"
                  } h-5 w-5 text-gray-400`}
                />
                <input
                  type="text"
                  placeholder={t("services.searchServices")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full ${
                    isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                  } py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter
                  className={`absolute top-3.5 ${
                    isRtl ? "right-4" : "left-4"
                  } h-5 w-5 text-gray-400`}
                />
                <select
                  value={selectedCategoryFilter || ""}
                  onChange={(e) =>
                    setSelectedCategoryFilter(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className={`w-full ${
                    isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                  } py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                >
                  <option value="">{t("services.allCategories")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isRtl && cat.nameAr ? cat.nameAr : cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </BlurFade>

          {/* Services Grid */}
          {services.length === 0 ? (
            <BlurFade delay={0.3}>
              <MagicCard
                className="p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                gradientColor="#d1d5db"
              >
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {search || selectedCategoryFilter
                    ? t("services.noSearchResults")
                    : t("services.noServices")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {search || selectedCategoryFilter
                    ? t("services.tryDifferentSearch")
                    : t("services.noServicesDescription")}
                </p>
                {!search && !selectedCategoryFilter && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-5 w-5" />
                    {t("services.createFirst")}
                  </button>
                )}
              </MagicCard>
            </BlurFade>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <BlurFade key={service.id} delay={0.3 + index * 0.05}>
                  <MagicCard
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                    gradientColor="#d1d5db"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {service.iconUrl && (
                          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <span className="text-2xl">{service.iconUrl}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {service.name}
                          </h3>
                          {service.nameAr && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {service.nameAr}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {isRtl && service.categoryNameAr
                          ? service.categoryNameAr
                          : service.categoryName}
                      </span>
                    </div>

                    {(service.description || service.descriptionAr) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {isRtl && service.descriptionAr
                          ? service.descriptionAr
                          : service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal(service)}
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
                        onClick={() => handleDelete(service.id, service.name)}
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
                  {editingService
                    ? t("services.editService")
                    : t("services.newService")}
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
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("services.category")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value={0}>{t("services.selectCategory")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {isRtl && cat.nameAr ? cat.nameAr : cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Name (English) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("services.serviceName")} (English){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g., Oil Change"
                  />
                </div>

                {/* Service Name (Arabic) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("services.serviceName")} (العربية)
                  </label>
                  <input
                    type="text"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    dir="rtl"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="مثال: تغيير الزيت"
                  />
                </div>

                {/* Icon URL */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("services.icon")} (Emoji or URL)
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
                    {t("services.description")} (English)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Brief description of this service..."
                  />
                </div>

                {/* Description (Arabic) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("services.description")} (العربية)
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleInputChange}
                    rows={3}
                    dir="rtl"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="وصف مختصر لهذه الخدمة..."
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
                        {editingService
                          ? t("common.updating")
                          : t("common.creating")}
                      </>
                    ) : (
                      <>
                        {editingService ? t("common.update") : t("common.create")}
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
