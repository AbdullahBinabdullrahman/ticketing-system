import useSWR from "swr";
import { partnerHttp } from "../lib/utils/partnerHttp";

/**
 * Partner stats interface
 */
export interface PartnerStats {
  totalRequests: number;
  completed: number;
  rejected: number;
  inProgress: number;
  pendingConfirmation: number;
  avgHandlingTime: number;
  avgRating: number;
  completionRate: number;
  rejectionRate: number;
}

/**
 * Partner Stats Hook
 * Fetches partner performance metrics using partnerHttp
 */
export function usePartnerStats() {
  const fetcher = async (url: string) => {
    const response = await partnerHttp.get(url);
    return response.data.data || response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<PartnerStats>(
    "/stats",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    stats: data || {
      totalRequests: 0,
      completed: 0,
      rejected: 0,
      inProgress: 0,
      pendingConfirmation: 0,
      avgHandlingTime: 0,
      avgRating: 0,
      completionRate: 0,
      rejectionRate: 0,
    },
    isLoading,
    error,
    mutate,
  };
}

