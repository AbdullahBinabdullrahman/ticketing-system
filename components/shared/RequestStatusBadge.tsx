"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface RequestStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border?: string }
> = {
  submitted: {
    label: "requests.submitted",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  assigned: {
    label: "requests.assigned",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  confirmed: {
    label: "requests.confirmed",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  in_progress: {
    label: "requests.inProgress",
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  completed: {
    label: "requests.completed",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  closed: {
    label: "requests.closed",
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-300",
  },
  rejected: {
    label: "requests.rejected",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  unassigned: {
    label: "requests.unassigned",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
};

export default function RequestStatusBadge({
  status,
  className,
}: RequestStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {/* We'll translate this with i18n */}
      {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
}

