"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: string, order: "asc" | "desc") => void;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

/**
 * DataTable Component
 * Reusable table with sorting, pagination, and custom rendering
 */
export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pagination,
  onSort,
  onRowClick,
  className,
  emptyMessage,
  isLoading = false,
}: DataTableProps<T>) {
  const { t, i18n } = useTranslation("common");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
    onSort(key, newOrder);
  };

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row, index);
    }

    // Default rendering
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === "boolean") {
      return value ? (
        <span className="text-green-600">{t("common.yes")}</span>
      ) : (
        <span className="text-red-600">{t("common.no")}</span>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (isLoading) {
    return (
      <div
        className={cn("overflow-x-auto", className)}
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        <div className="min-w-full animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 mb-2 rounded" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-gray-800 mb-2 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-12 text-gray-600 dark:text-gray-400",
          className
        )}
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        {emptyMessage || t("common.noData")}
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4", className)}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                    column.sortable &&
                      onSort &&
                      "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                    column.className
                  )}
                  onClick={() =>
                    column.sortable && onSort && handleSort(column.key)
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && onSort && (
                      <div className="flex flex-col">
                        {sortKey === column.key ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="opacity-30">
                            <ChevronUp className="h-3 w-3 -mb-1" />
                            <ChevronDown className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick && onRowClick(row, index)}
                className={cn(
                  onRowClick &&
                    "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                      column.className
                    )}
                  >
                    {renderCell(column, row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick && onRowClick(row, index)}
            className={cn(
              "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4",
              onRowClick &&
                "cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-all"
            )}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {column.label}:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {renderCell(column, row, index)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("common.showing")}{" "}
            {(pagination.currentPage - 1) * pagination.pageSize + 1}-
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.total
            )}{" "}
            {t("common.of")} {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
              {t("common.page")} {pagination.currentPage} {t("common.of")}{" "}
              {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
