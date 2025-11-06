"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Clock, User, CheckCircle, XCircle, Package } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface TimelineItem {
  id: number;
  status: string;
  statusNotes?: string;
  createdAt: string;
  createdBy?: {
    name: string;
    userType: string;
  };
}

interface RequestTimelineProps {
  timeline: TimelineItem[];
  className?: string;
}

/**
 * Request Timeline Component
 * Displays a vertical timeline of request status changes
 */
export default function RequestTimeline({
  timeline,
  className,
}: RequestTimelineProps) {
  const { t, i18n } = useTranslation("common");

  /**
   * Get status icon based on status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Package className="h-4 w-4" />;
      case "assigned":
        return <User className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  /**
   * Get status color based on status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-gray-500";
      case "assigned":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "in_progress":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      case "closed":
        return "bg-teal-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t("requests.noTimeline") || "No timeline data available"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4", className)}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {timeline.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4"
        >
          {/* Timeline Icon */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md",
                getStatusColor(item.status)
              )}
            >
              {getStatusIcon(item.status)}
            </div>
            {index < timeline.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
            )}
          </div>

          {/* Timeline Content */}
          <div className="flex-1 pb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t(`requests.${item.status}`)}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {format(new Date(item.createdAt), "PPp")}
                </span>
              </div>

              {item.statusNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {item.statusNotes}
                </p>
              )}

              {item.createdBy && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <User className="h-3 w-3" />
                  <span>
                    {t("common.by")} {item.createdBy.name}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {item.createdBy.userType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}


