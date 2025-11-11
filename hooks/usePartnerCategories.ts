import useSWR from "swr";
import { apiClient } from "../lib/api/client";

interface PartnerCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryDescription: string | null;
  categoryIcon: string | null;
  createdAt: Date | null;
}

interface PartnerCategoriesResponse {
  categories: PartnerCategory[];
  total: number;
}

/**
 * Custom hook to fetch categories assigned to a partner
 * Uses centralized apiClient which automatically handles authentication
 * @param partnerId - The partner ID
 * @returns Partner categories data, loading state, error, and mutation function
 */
export function usePartnerCategories(partnerId: number | null) {
  const fetcher = async (url: string) => {
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  };

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<PartnerCategoriesResponse>(
    partnerId ? `/admin/partners/${partnerId}/categories` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const assignCategory = async (categoryId: number) => {
    await apiClient.post(
      `/admin/partners/${partnerId}/categories`,
      { categoryId }
    );
    mutate();
  };

  const removeCategory = async (categoryId: number) => {
    await apiClient.delete(`/admin/partners/${partnerId}/categories`, {
      data: { categoryId },
    });
    mutate();
  };

  return {
    categories: data?.categories || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    assignCategory,
    removeCategory,
  };
}

