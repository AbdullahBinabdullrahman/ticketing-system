"use client";

/**
 * Admin Request Creation Page
 *
 * Allows admin users to create service requests on behalf of customers.
 * Uses external customer ID for all requests created through this interface.
 *
 * Features:
 * - MapBox integration for location selection
 * - Category/Service dropdowns with dynamic filtering
 * - Pickup option selection
 * - Form validation
 * - RTL support
 * - i18n ready
 * - Responsive design (mobile-first)
 */

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/layout/AdminLayout";
import { BlurFade } from "../../../components/ui/blur-fade";
import MapBox from "../../../components/shared/MapBox";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Loader2,
  Send,
  AlertCircle,
  Tag,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategories } from "../../../hooks/useCategories";
import { usePartnerPickupOptions } from "../../../hooks/usePartnerPickupOptions";
import { useServices } from "../../../hooks/useServices";
import { adminHttp } from "../../../lib/utils/http";

// Validation schema for admin request creation
const createAdminRequestSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),
  customerLat: z.number().min(-90).max(90),
  customerLng: z.number().min(-180).max(180),
  categoryId: z.number().min(1, "Please select a category"),
  serviceId: z.number().optional(),
  pickupOptionId: z.number().min(1, "Please select a pickup option"),
});

type CreateAdminRequestForm = z.infer<typeof createAdminRequestSchema>;

export default function AdminNewRequestPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const isRtl = i18n.language === "ar";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminRequestForm>({
    resolver: zodResolver(createAdminRequestSchema),
    defaultValues: {
      customerLat: 24.7136, // Default to Riyadh, Saudi Arabia
      customerLng: 46.6753,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const selectedCategory = watch("categoryId");
  const selectedPickupOption = watch("pickupOptionId");
  const customerLat = watch("customerLat");
  const customerLng = watch("customerLng");

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { pickupOptions, isLoading: pickupOptionsLoading } =
    usePartnerPickupOptions(null);

  const { services, isLoading: servicesLoading } =
    useServices(selectedCategory);

  const selectedPickupOptionData = pickupOptions?.find(
    (opt: { id: number; requiresServiceSelection: boolean }) =>
      opt.id === selectedPickupOption
  );
  const requiresServiceSelection =
    selectedPickupOptionData?.requiresServiceSelection;

  useEffect(() => {
    if (selectedCategory && !requiresServiceSelection) {
      setValue("serviceId", undefined); // Clear service if not required
    }
  }, [selectedCategory, requiresServiceSelection, setValue]);

  const handleLocationChange = (lat: number, lng: number) => {
    setValue("customerLat", lat);
    setValue("customerLng", lng);
    toast.success(t("branches.locationUpdated"));
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("customerLat", latitude);
          setValue("customerLng", longitude);
          toast.success(t("branches.locationUpdated"));
        },
        (error) => {
          toast.error(t("branches.locationError"));
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error(t("branches.geolocationNotSupported"));
    }
  };

  const onSubmit = async (data: CreateAdminRequestForm) => {
    try {
      const response = await adminHttp.post("/admin/requests/customer", {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        customerLat: data.customerLat,
        customerLng: data.customerLng,
        categoryId: data.categoryId,
        serviceId: data.serviceId,
        pickupOptionId: data.pickupOptionId,
      });

      toast.custom(
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md">
          <div className="flex items-start">
            <div className="shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className={`${isRtl ? "mr-3" : "ml-3"}`}>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t("requests.requestCreatedSuccess")}
              </h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  {t("requests.requestNumber")}:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {response.data.request.requestNumber}
                  </strong>
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() =>
                    router.push(`/admin/requests/${response.data.request.id}`)
                  }
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {t("requests.viewRequest")} →
                </button>
              </div>
            </div>
          </div>
        </div>,
        { duration: 8000 }
      );

      router.push(`/admin/requests/${response.data.request.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || t("errors.generic");
      toast.error(errorMessage);
      console.error("Error creating request:", error);
    }
  };

  if (categoriesLoading || pickupOptionsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div
        className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-black py-12 px-4"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <BlurFade delay={0.1}>
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{t("common.back")}</span>
              </button>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t("requests.createForCustomer")}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t("requests.external")}
              </p>
            </div>
          </BlurFade>

          {/* Form */}
          <BlurFade delay={0.2}>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Service Selection */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white border-b pb-2 mb-6">
                    {t("services.title")}
                  </h2>
                  <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label
                        htmlFor="categoryId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <Tag className="inline h-4 w-4 mr-2" />
                        {t("requests.selectCategory")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="categoryId"
                        {...register("categoryId", { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      >
                        <option value="">{t("requests.selectCategory")}</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {isRtl
                              ? category.nameAr || category.name
                              : category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>

                    {/* Pickup Option */}
                    <div>
                      <label
                        htmlFor="pickupOptionId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <Truck className="inline h-4 w-4 mr-2" />
                        {t("requests.selectPickupOption")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="pickupOptionId"
                        {...register("pickupOptionId", { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      >
                        <option value="">
                          {t("requests.selectPickupOption")}
                        </option>
                        {pickupOptions?.map(
                          (option: {
                            id: number;
                            name: string;
                            nameAr: string;
                          }) => (
                            <option key={option.id} value={option.id}>
                              {isRtl ? option.nameAr : option.name}
                            </option>
                          )
                        )}
                      </select>
                      {errors.pickupOptionId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.pickupOptionId.message}
                        </p>
                      )}
                    </div>

                    {/* Service (conditional) */}
                    {requiresServiceSelection && (
                      <div>
                        <label
                          htmlFor="serviceId"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          <Package className="inline h-4 w-4 mr-2" />
                          {t("requests.selectService")}
                        </label>
                        <select
                          id="serviceId"
                          {...register("serviceId", { valueAsNumber: true })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          disabled={!selectedCategory || servicesLoading}
                        >
                          <option value="">
                            {t("requests.selectService")}
                          </option>
                          {services?.map((service) => (
                            <option key={service.id} value={service.id}>
                              {isRtl
                                ? service.nameAr || service.name
                                : service.name}
                            </option>
                          ))}
                        </select>
                        {errors.serviceId && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.serviceId.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white border-b pb-2 mb-6">
                    {t("requests.customerInfo")}
                  </h2>
                  <div className="space-y-4">
                    {/* Customer Name */}
                    <div>
                      <label
                        htmlFor="customerName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        {t("requests.customerName")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customerName"
                        type="text"
                        {...register("customerName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder={t("requests.customerName")}
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>

                    {/* Customer Phone */}
                    <div>
                      <label
                        htmlFor="customerPhone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <Phone className="inline h-4 w-4 mr-2" />
                        {t("requests.customerPhone")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customerPhone"
                        type="tel"
                        {...register("customerPhone")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="+966 XXX XXX XXX"
                      />
                      {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.customerPhone.message}
                        </p>
                      )}
                    </div>

                    {/* Customer Address */}
                    <div>
                      <label
                        htmlFor="customerAddress"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <MapPin className="inline h-4 w-4 mr-2" />
                        {t("requests.customerAddress")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customerAddress"
                        type="text"
                        {...register("customerAddress")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder={t("requests.customerAddress")}
                      />
                      {errors.customerAddress && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.customerAddress.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white border-b pb-2 mb-6">
                    {t("requests.customerLocation")}
                  </h2>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {t("branches.getCurrentLocation")}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {t("requests.clickMapToSetLocation")}
                  </p>
                  <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                    <MapBox
                      latitude={customerLat}
                      longitude={customerLng}
                      onLocationChange={handleLocationChange}
                      draggableMarker={true}
                      zoom={12}
                    />
                  </div>
                  {(errors.customerLat || errors.customerLng) && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t("requests.locationRequired")}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("requests.creatingRequest")}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {t("requests.createNew")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </BlurFade>
        </div>
      </div>
    </AdminLayout>
  );
}
