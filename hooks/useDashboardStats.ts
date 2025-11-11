import useSWR from "swr";
import { apiClient } from "../lib/api/client";

/**
 * Dashboard stats interface
 */
export interface DashboardStats {
  // Overview stats
  totalRequests: number;
  pendingRequests: number;
  unassignedRequests: number;
  completedRequests: number;
  todayCompleted: number;
  slaBreaches: number;

  // Resource stats
  totalPartners: number;
  activePartners: number;
  activeBranches: number;

  // Performance metrics
  averageRating: number;
  completionRate: number;

  // Growth metrics
  requestsGrowth: number;
  last30DaysCount: number;

  // Recent activity
  recentRequests: RecentRequest[];

  // Top partners
  topPartners: TopPartner[];

  // Status distribution
  requestsByStatus: StatusDistribution[];

  // Category distribution
  requestsByCategory: CategoryDistribution[];
}

export interface RecentRequest {
  id: number;
  customerName: string;
  customerPhone: string;
  status: string;
  createdAt: Date;
  timeAgo: string;
}

export interface TopPartner {
  partnerId: number;
  name: string;
  completedRequests: number;
  rating: number;
  status: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: string;
}

export interface CategoryDistribution {
  categoryId: number;
  count: number;
  percentage: string;
}

/**
 * Fetcher function for SWR
 */
const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

/**
 * Hook to fetch dashboard stats
 * Automatically refreshes every 60 seconds
 */
export function useDashboardStats() {
  const { data, error, mutate, isLoading } = useSWR<DashboardStats>(
    "/admin/dashboard/stats",
    fetcher,
    {
      refreshInterval: 60000, // Auto-refresh every 60 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}

