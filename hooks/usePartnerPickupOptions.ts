import useSWR from "swr";
import { apiClient } from "../lib/api/client";

interface PartnerPickupOption {
  id: number;
  pickupOptionTypeId: number;
  pickupOptionName: string;
  pickupOptionNameAr: string;
  pickupOptionDescription: string | null;
  pickupOptionDescriptionAr: string | null;
  requiresServiceSelection: boolean;
  createdAt: Date | null;
}

interface PartnerPickupOptionsResponse {
  pickupOptions: PartnerPickupOption[];
  total: number;
}

/**
 * Custom hook to fetch pickup options assigned to a partner
 * Uses centralized apiClient which automatically handles authentication
 * @param partnerId - The partner ID
 * @returns Partner pickup options data, loading state, error, and mutation function
 */
export function usePartnerPickupOptions(partnerId: number | null) {
  const fetcher = async (url: string) => {
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  };

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<PartnerPickupOptionsResponse>(
    partnerId ? `/admin/partners/${partnerId}/pickup-options` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const assignPickupOption = async (pickupOptionTypeId: number) => {
    await apiClient.post(
      `/admin/partners/${partnerId}/pickup-options`,
      { pickupOptionTypeId }
    );
    mutate();
  };

  const removePickupOption = async (pickupOptionTypeId: number) => {
    await apiClient.delete(`/admin/partners/${partnerId}/pickup-options`, {
      data: { pickupOptionTypeId },
    });
    mutate();
  };

  return {
    pickupOptions: data?.pickupOptions || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    assignPickupOption,
    removePickupOption,
  };
}

