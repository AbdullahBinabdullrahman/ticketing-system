"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "../../lib/utils";

interface Branch {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone?: string;
  distance?: number; // Distance from customer in km
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchId?: number;
  onSelect: (branchId: number) => void;
  customerLocation?: {
    lat: number;
    lng: number;
  };
  className?: string;
}

/**
 * Branch Selector Component
 * Displays branches with distance information and allows selection
 */
export default function BranchSelector({
  branches,
  selectedBranchId,
  onSelect,
  customerLocation,
  className,
}: BranchSelectorProps) {
  const { t, i18n } = useTranslation("common");

  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p>{t("branches.noBranchesAvailable") || "No branches available"}</p>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-3", className)}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {branches.map((branch, index) => {
        const isSelected = branch.id === selectedBranchId;
        const isNearest = index === 0 && customerLocation && branch.distance;

        return (
          <div
            key={branch.id}
            onClick={() => onSelect(branch.id)}
            className={cn(
              "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
              isSelected
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700",
              "hover:shadow-md"
            )}
          >
            {/* Nearest Branch Badge */}
            {isNearest && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {t("branches.nearestBranch")}
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Selection Indicator */}
              <div className="flex-shrink-0 mt-1">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-primary-500 bg-primary-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Branch Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {branch.name}
                  </h4>
                  {branch.distance !== undefined && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {branch.distance} {t("branches.km") || "km"}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </div>

                {branch.contactPhone && (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    <span className="font-medium">{t("common.phone")}:</span>{" "}
                    <span dir="ltr">{branch.contactPhone}</span>
                  </div>
                )}

                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t("branches.coordinates")}: {branch.lat.toFixed(4)},{" "}
                  {branch.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {customerLocation && (
        <div className="text-xs text-gray-500 dark:text-gray-500 text-center pt-2">
          {t("branches.distanceCalculated") ||
            "Distances calculated from customer location"}
        </div>
      )}
    </div>
  );
}




