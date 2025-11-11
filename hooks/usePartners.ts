import useSWR from "swr";
import type { PaginatedPartnersResponse, PartnerResponse, BranchResponse } from "../lib/api/partners";
import type { PartnerFiltersInput, BranchFiltersInput } from "../schemas/partners";
import { partnersApi } from "../lib/api/partners";
import { apiClient } from "../lib/api/client";

/**
 * Fetcher function for SWR
 */
const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

/**
 * Hook to fetch partners with filters
 */
export function usePartners(filters?: PartnerFiltersInput) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const { data, error, mutate, isLoading } = useSWR<PaginatedPartnersResponse>(
    `/admin/partners?${queryParams.toString()}`,
    fetcher
  );

  return {
    partners: data?.partners || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch a single partner by ID
 */
export function usePartner(partnerId: number | null) {
  const { data, error, mutate, isLoading } = useSWR<PartnerResponse>(
    partnerId ? `/admin/partners/${partnerId}` : null,
    fetcher
  );

  return {
    partner: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch branches with filters
 */
export function useBranches(filters?: BranchFiltersInput) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const { data, error, mutate, isLoading } = useSWR<{ 
    branches: BranchResponse[], 
    pagination: { currentPage: number; totalPages: number; total: number; pageSize: number } 
  }>(
    `/admin/branches?${queryParams.toString()}`,
    fetcher
  );

  return {
    branches: data?.branches || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Export the find nearest branch function
 */
export { partnersApi };

