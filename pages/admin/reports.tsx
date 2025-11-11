"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import { BlurFade } from "../../components/ui/blur-fade";
import { FileText, Info } from "lucide-react";

export default function AdminReportsPage() {
  const { t, i18n } = useTranslation("common");

  return (
    <AdminLayout>
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <BlurFade delay={0.1}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t("reports.title")}
          </h1>
        </BlurFade>

        <BlurFade delay={0.2}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Reports and analytics will be available soon.
            </p>
          </div>
        </BlurFade>
      </div>
    </AdminLayout>
  );
}

