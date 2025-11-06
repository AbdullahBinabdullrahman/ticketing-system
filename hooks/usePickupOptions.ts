/**
 * Pickup Options Hook
 * SWR-based hook for fetching pickup options data
 */

import useSWR from "swr";
import { pickupOptionsApi, type PickupOption } from "@/lib/api/pickupOptions";
import http from "@/lib/utils/http";

/**
 * Fetch all active pickup options
 */
export function usePickupOptions() {
  const { data, error, isLoading, mutate } = useSWR<PickupOption[]>(
    "/pickup-options",
    pickupOptionsApi.getAll
  );

  console.log({ data });

  return {
    pickupOptions: data?.data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Fetch a single pickup option by ID
 */
export function usePickupOption(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<PickupOption>(
    id ? `/pickup-options/${id}` : null,
    async (url: string) => {
      const response = await http.get<PickupOption>(url);
      return response.data;
    }
  );

  return {
    pickupOption: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

