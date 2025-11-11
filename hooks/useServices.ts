import useSWR from "swr";

import http from "@/lib/utils/http";

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  iconUrl?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  categoryName?: string | null;
  categoryNameAr?: string | null;
}

interface ServicesResponse {
  services: Service[];
  total: number;
}

/**
 * Custom hook to fetch and manage services
 * Uses centralized apiClient which automatically handles authentication
 * @param categoryId Optional category ID to filter services
 * @param search Optional search term to filter services
 * @returns Services data, loading state, error, and mutation functions
 */
export function useServices(categoryId?: number, search?: string) {
  const fetcher = async (url: string) => {
    const response = await http.get(url);
    return response.data.data || response.data;
  };

  // Build URL with query parameters
  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId.toString());
  if (search) params.append("search", search);
  const queryString = params.toString();
  const url = `/admin/services${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<ServicesResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const createService = async (serviceData: {
    categoryId: number;
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    iconUrl?: string;
  }) => {
    const response = await http.post("/admin/services", serviceData);
    mutate();
    return response.data.data || response.data;
  };

  const updateService = async (
    id: number,
    serviceData: {
      categoryId?: number;
      name?: string;
      nameAr?: string;
      description?: string;
      descriptionAr?: string;
      iconUrl?: string;
    }
  ) => {
    const response = await http.patch(`/admin/services/${id}`, serviceData);
    mutate();
    return response.data.data || response.data;
  };

  const deleteService = async (id: number) => {
    await http.delete(`/admin/services/${id}`);
    mutate();
  };

  return {
    services: data?.services || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    createService,
    updateService,
    deleteService,
  };
}
