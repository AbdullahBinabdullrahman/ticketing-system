"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
}

export function MagicCard({ children, className }: MagicCardProps) {
  return (
    <div className={cn("group relative rounded-xl border border-gray-200 dark:border-gray-800 shadow-md bg-white dark:bg-gray-950", className)}>
      <div className="relative">{children}</div>
    </div>
  );
}

