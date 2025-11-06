"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  change?: string;
  changeType?: "positive" | "negative";
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "bg-blue-500",
  change,
  changeType,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-black dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={cn("p-3 rounded-full", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {change && changeType && (
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive" ? "text-green-600" : "text-red-600"
            )}
          >
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
}

