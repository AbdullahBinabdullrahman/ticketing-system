"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MagicCard } from "../components/ui/magic-card";
import { ShimmerButton } from "../components/ui/shimmer-button";
import { BlurFade } from "../components/ui/blur-fade";
import { requestsApi } from "../lib/api/requests";
import { cn } from "../lib/utils";

const createRequestSchema = z.object({
  categoryId: z.number().int().positive("Category ID must be positive"),
  serviceId: z.number().int().positive().optional(),
  pickupOptionId: z.number().int().positive("Pickup option ID must be positive"),
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  customerLat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  customerLng: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),
});

type CreateRequestForm = z.infer<typeof createRequestSchema>;

// Mock data from seed file
const categories = [
  { id: 1, name: "Car Maintenance", nameAr: "صيانة السيارات" },
  { id: 2, name: "Tires", nameAr: "الإطارات" },
  { id: 3, name: "Oil Change", nameAr: "تغيير الزيت" },
  { id: 4, name: "Battery", nameAr: "البطارية" },
];

const services = {
  1: [
    { id: 1, name: "General Inspection", nameAr: "فحص عام" },
    { id: 2, name: "Brake Service", nameAr: "خدمة الفرامل" },
  ],
  2: [
    { id: 3, name: "Tire Replacement", nameAr: "استبدال الإطارات" },
    { id: 4, name: "Tire Repair", nameAr: "إصلاح الإطارات" },
  ],
  3: [
    { id: 5, name: "Engine Oil Change", nameAr: "تغيير زيت المحرك" },
  ],
  4: [
    { id: 6, name: "Battery Replacement", nameAr: "استبدال البطارية" },
    { id: 7, name: "Battery Testing", nameAr: "فحص البطارية" },
  ],
};

const pickupOptions = [
  { id: 1, name: "Pickup Only", nameAr: "استلام فقط", requiresService: false },
  { id: 2, name: "Pickup and Return", nameAr: "استلام وإرجاع", requiresService: false },
  { id: 3, name: "Emergency Pickup", nameAr: "استلام طارئ", requiresService: false },
  { id: 4, name: "Drop-off In Center", nameAr: "تسليم في المركز", requiresService: true },
  { id: 5, name: "Service At Location", nameAr: "خدمة في الموقع", requiresService: true },
];

export default function TestRequestPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateRequestForm>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      categoryId: 1,
      pickupOptionId: 1,
      customerLat: 24.7136,
      customerLng: 46.6753,
      customerName: "Test Customer",
      customerPhone: "+966501234567",
      customerAddress: "Test Address, Riyadh",
    },
  });

  const selectedCategory = watch("categoryId");
  const selectedPickupOption = watch("pickupOptionId");

  const handleFormSubmit = async (data: CreateRequestForm) => {
    setIsSubmitting(true);
    try {
      const result = await requestsApi.createRequest(data);
      setSuccessData(result);
      toast.success(t("test.successTitle"));
    } catch (error: any) {
      toast.error(error.message || t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPickupOptionData = pickupOptions.find((opt) => opt.id === selectedPickupOption);

  if (successData) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 flex items-center justify-center p-4"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        <BlurFade delay={0.2} className="w-full max-w-2xl">
          <MagicCard className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t("test.successTitle")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t("test.successMessage")}
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t("test.requestNumber")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {successData.requestNumber || successData.request?.requestNumber}
                </p>
              </div>

              <ShimmerButton
                onClick={() => {
                  setSuccessData(null);
                  router.reload();
                }}
                className="w-full sm:w-auto"
                background="rgb(249, 115, 22)"
              >
                {t("test.backToForm")}
              </ShimmerButton>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 py-12 px-4"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto">
        <BlurFade delay={0.1} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t("test.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("test.subtitle")}
          </p>
        </BlurFade>

        <BlurFade delay={0.2}>
          <MagicCard className="p-8">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Pickup Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("test.form.pickupOption")} *
                </label>
                <select
                  {...register("pickupOptionId", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                >
                  {pickupOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {i18n.language === "ar" ? opt.nameAr : opt.name}
                    </option>
                  ))}
                </select>
                {errors.pickupOptionId && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickupOptionId.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("test.form.category")} *
                </label>
                <select
                  {...register("categoryId", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {i18n.language === "ar" ? cat.nameAr : cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Service */}
              {selectedPickupOptionData?.requiresService && (
                <BlurFade delay={0.1}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("test.form.service")} *
                    </label>
                    <select
                      {...register("serviceId", { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                    >
                      <option value="">{t("common.selectOption")}</option>
                      {services[selectedCategory as keyof typeof services]?.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {i18n.language === "ar" ? svc.nameAr : svc.name}
                        </option>
                      ))}
                    </select>
                    {errors.serviceId && (
                      <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
                    )}
                  </div>
                </BlurFade>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("test.form.customerName")} *
                </label>
                <input
                  type="text"
                  {...register("customerName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                  placeholder="John Doe"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("test.form.customerPhone")} *
                </label>
                <input
                  type="tel"
                  {...register("customerPhone")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                  placeholder="+966501234567"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("test.form.latitude")} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("customerLat", { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                  />
                  {errors.customerLat && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerLat.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("test.form.longitude")} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("customerLng", { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                  />
                  {errors.customerLng && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerLng.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("test.form.address")} *
                </label>
                <textarea
                  {...register("customerAddress")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-black dark:border-gray-700 dark:text-white"
                  placeholder="Full address"
                />
                {errors.customerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerAddress.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <ShimmerButton
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                background="rgb(249, 115, 22)"
              >
                {isSubmitting ? t("test.submitting") : t("test.submit")}
              </ShimmerButton>
            </form>
          </MagicCard>
        </BlurFade>
      </div>
    </div>
  );
}

