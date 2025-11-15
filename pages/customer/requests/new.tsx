"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import CustomerLayout from "@/components/layout/CustomerLayout";
import { BlurFade } from "@/components/ui/blur-fade";
import MapBox from "@/components/shared/MapBox";
import {
  MapPin,
  User,
  Phone,
  Loader2,
  Send,
  AlertCircle,
  Tag,
  Package,
  Car,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema } from "@/schemas/requests";
import { z } from "zod";
import { useCategories } from "@/hooks/useCategories";
import { usePickupOptions } from "@/hooks/usePickupOptions";
import { useServices } from "@/hooks/useServices";
import { useCreateRequest } from "@/hooks/useCustomerRequests";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type CreateRequestForm = z.infer<typeof createRequestSchema>;

export default function CustomerNewRequestPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const isRtl = i18n.language === "ar";
  const { createRequest } = useCreateRequest();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestForm>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      customerLat: 24.7136, // Default to Riyadh, Saudi Arabia
      customerLng: 46.6753,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const selectedCategory = useWatch({ control, name: "categoryId" });
  const selectedPickupOption = useWatch({ control, name: "pickupOptionId" });
  const customerLat = useWatch({ control, name: "customerLat" });
  const customerLng = useWatch({ control, name: "customerLng" });

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { pickupOptions, isLoading: pickupOptionsLoading } = usePickupOptions();

  const { services, isLoading: servicesLoading } =
    useServices(selectedCategory);

  const selectedPickupOptionData = pickupOptions?.find(
    (opt) => opt.id === selectedPickupOption
  );
  const requiresServiceSelection = Boolean(
    selectedPickupOptionData?.requiresServiceSelection
  );

  useEffect(() => {
    if (selectedCategory && !requiresServiceSelection) {
      setValue("serviceId", undefined); // Clear service if not required
    }
  }, [selectedCategory, requiresServiceSelection, setValue]);

  const handleLocationChange = (lat: number, lng: number) => {
    setValue("customerLat", lat);
    setValue("customerLng", lng);
    toast.success(t("customer.locationUpdated"));
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("customerLat", latitude);
          setValue("customerLng", longitude);
          toast.success(t("customer.locationUpdated"));
        },
        (error) => {
          toast.error(t("customer.locationError"));
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error(t("customer.geolocationNotSupported"));
    }
  };

  const onSubmit = async (data: CreateRequestForm) => {
    try {
      const response = await createRequest(data);

      toast.custom(
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md">
          <div className="flex items-start">
            <div className="shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className={`${isRtl ? "mr-3" : "ml-3"}`}>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t("customer.requestSubmitted")}
              </h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  {t("customer.requestNumber")}:{" "}
                  <strong className="text-primary-600 dark:text-primary-400">
                    {response.requestNumber}
                  </strong>
                </p>
                <p className="mt-1">{t("customer.trackYourRequest")}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() =>
                    router.push(`/customer/requests/${response.requestNumber}`)
                  }
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  {t("customer.viewRequest")} →
                </button>
              </div>
            </div>
          </div>
        </div>,
        { duration: 8000 }
      );

      router.push(`/customer/requests/${response.requestNumber}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || t("errors.generic");
      toast.error(errorMessage);
    }
  };

  return (
    <CustomerLayout>
      <div
        className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 py-12 px-4"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="max-w-4xl mx-auto">
          <BlurFade delay={0.1} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t("customer.newRequest")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("customer.newRequestDescription")}
            </p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Service Selection */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white border-b pb-2 mb-6">
                    {t("customer.serviceDetails")}
                  </h2>
                  <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label
                        htmlFor="categoryId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <Tag className="inline h-4 w-4 mr-2" />
                        {t("customer.selectCategory")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="categoryId"
                        {...register("categoryId", { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                      >
                        <option value="">{t("customer.selectCategory")}</option>
                        {categoriesLoading ? (
                          <option disabled>{t("common.loading")}</option>
                        ) : (
                          categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                              {i18n.language === "ar"
                                ? category.nameAr
                                : category.name}
                            </option>
                          ))
                        )}
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
                        <Package className="inline h-4 w-4 mr-2" />
                        {t("customer.selectPickupOption")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="pickupOptionId"
                        {...register("pickupOptionId", { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                      >
                        <option value="">
                          {t("customer.selectPickupOption")}
                        </option>
                        {pickupOptionsLoading ? (
                          <option disabled>{t("common.loading")}</option>
                        ) : (
                          pickupOptions?.map((option) => (
                            <option key={option.id} value={option.id}>
                              {i18n.language === "ar"
                                ? option.nameAr ?? option.name
                                : option.name}
                            </option>
                          ))
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
                          <Car className="inline h-4 w-4 mr-2" />
                          {t("customer.selectService")}
                        </label>
                        <select
                          id="serviceId"
                          {...register("serviceId", { valueAsNumber: true })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                          disabled={!selectedCategory || servicesLoading}
                        >
                          <option value="">
                            {t("customer.selectService")}
                          </option>
                          {servicesLoading ? (
                            <option disabled>{t("common.loading")}</option>
                          ) : (
                            services?.map((service) => (
                              <option key={service.id} value={service.id}>
                                {i18n.language === "ar"
                                  ? service.nameAr
                                  : service.name}
                              </option>
                            ))
                          )}
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
                    {t("customer.yourInformation")}
                  </h2>
                  <div className="space-y-4">
                    {/* Customer Name */}
                    <div>
                      <label
                        htmlFor="customerName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        {t("customer.yourName")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customerName"
                        type="text"
                        {...register("customerName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                        placeholder={t("customer.yourNamePlaceholder")}
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
                        {t("customer.yourPhone")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customerPhone"
                        type="tel"
                        {...register("customerPhone")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
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
                        {t("customer.yourAddress")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customerAddress"
                        type="text"
                        {...register("customerAddress")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                        placeholder={t("customer.yourAddressPlaceholder")}
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
                    {t("customer.yourLocation")}
                  </h2>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {t("customer.useMyLocation")}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {t("customer.clickMapInstructions")}
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
                      {t("customer.locationRequired")}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <ShimmerButton
                    type="submit"
                    className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("customer.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        {t("customer.submitRequest")}
                      </>
                    )}
                  </ShimmerButton>
                </div>
              </form>
            </div>
          </BlurFade>
        </div>
      </div>
    </CustomerLayout>
  );
}
