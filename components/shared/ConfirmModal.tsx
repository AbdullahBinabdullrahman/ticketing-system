"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { MagicCard } from "../ui/magic-card";
import { BlurFade } from "../ui/blur-fade";
import { cn } from "../../lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "success" | "warning" | "info";
  isLoading?: boolean;
}

/**
 * Confirm Modal Component
 * Reusable confirmation dialog with customizable content and styling
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "info",
  isLoading = false,
}: ConfirmModalProps) {
  const { t, i18n } = useTranslation("common");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  /**
   * Get icon based on modal type
   */
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertCircle className="h-12 w-12 text-red-600" />;
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-12 w-12 text-yellow-600" />;
      default:
        return <AlertCircle className="h-12 w-12 text-blue-600" />;
    }
  };

  /**
   * Get confirm button style based on type
   */
  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700";
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <BlurFade delay={0.1} className="w-full max-w-md">
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <MagicCard className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">{getIcon()}</div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg",
                "hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white",
                "transition-colors font-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {cancelText || t("common.cancel")}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-2.5 text-white rounded-lg",
                "font-medium transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                getConfirmButtonStyle()
              )}
            >
              {isLoading
                ? t("common.loading")
                : confirmText || t("common.confirm")}
            </button>
          </div>
        </MagicCard>
        </div>
      </BlurFade>
    </div>
  );
}

