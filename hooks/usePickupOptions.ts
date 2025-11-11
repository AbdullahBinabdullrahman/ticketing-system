import useSWR from "swr";

import http from "@/lib/utils/http";

export interface PickupOption {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  requiresServiceSelection?: boolean;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface PickupOptionsResponse {
  pickupOptions?: PickupOption[];
  data?: PickupOption[];
}

/**
 * Custom hook to fetch all pickup options
 * Uses centralized http which automatically handles authentication
 * @returns Pickup options data, loading state, error, and mutation functions
 */
export function usePickupOptions() {
  const fetcher = async (url: string) => {
    const response = await http.get(url);
    return response.data.data || response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<
    PickupOption[] | PickupOptionsResponse
  >("/pickup-options", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Handle both array and object responses
  const pickupOptions = Array.isArray(data)
    ? data
    : (data as PickupOptionsResponse)?.pickupOptions ||
      (data as PickupOptionsResponse)?.data ||
      [];

  return {
    pickupOptions,
    isLoading,
    error,
    mutate,
  };
}
