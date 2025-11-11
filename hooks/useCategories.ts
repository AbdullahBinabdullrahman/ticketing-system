import useSWR from "swr";

import http from "@/lib/utils/http";

export interface Category {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  iconUrl?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdById?: number | null;
  updatedById?: number | null;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

/**
 * Custom hook to fetch all categories
 * Uses centralized http which automatically handles authentication
 * @param search Optional search term to filter categories
 * @returns Categories data, loading state, error, and mutation functions
 */
export function useCategories(search?: string) {
  const fetcher = async (url: string) => {
    const response = await http.get(url);
    return response.data.data || response.data;
  };

  const url = search
    ? `/admin/categories?search=${encodeURIComponent(search)}`
    : "/admin/categories";

  const { data, error, isLoading, mutate } = useSWR<CategoriesResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const createCategory = async (categoryData: {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    iconUrl?: string;
  }) => {
    const response = await http.post("/admin/categories", categoryData);
    mutate();
    return response.data.data || response.data;
  };

  const updateCategory = async (
    id: number,
    categoryData: {
      name?: string;
      nameAr?: string;
      description?: string;
      descriptionAr?: string;
      iconUrl?: string;
    }
  ) => {
    const response = await http.patch(`/admin/categories/${id}`, categoryData);
    mutate();
    return response.data.data || response.data;
  };

  const deleteCategory = async (id: number) => {
    await http.delete(`/admin/categories/${id}`);
    mutate();
  };

  return {
    categories: data?.categories || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
