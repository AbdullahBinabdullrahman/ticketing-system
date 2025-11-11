"use client";

import React from "react";
import { format } from "date-fns";
import { MapPin, Phone, Calendar } from "lucide-react";
import RequestStatusBadge from "./RequestStatusBadge";
import { cn } from "../../lib/utils";

interface RequestCardProps {
  requestNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  createdAt: string;
  onClick?: () => void;
  className?: string;
}

export default function RequestCard({
  requestNumber,
  customerName,
  customerPhone,
  customerAddress,
  status,
  createdAt,
  onClick,
  className,
}: RequestCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-colors cursor-pointer dark:bg-black dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {requestNumber}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {customerName}
          </p>
        </div>
        <RequestStatusBadge status={status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4 mr-2" />
          {customerPhone}
        </div>
        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 mr-2 mt-0.5" />
          <span className="truncate">{customerAddress}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(createdAt), "MMM dd, yyyy HH:mm")}
        </div>
      </div>
    </div>
  );
}

