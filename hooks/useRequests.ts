import useSWR from "swr";
import type {
  PaginatedRequestsResponse,
  RequestResponse,
} from "../lib/api/requests";
import type { RequestFiltersInput } from "../schemas/requests";
import { requestsApi } from "../lib/api/requests";
import { apiClient } from "../lib/api/client";

/**
 * Fetcher function for SWR
 */
const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

/**
 * Hook to fetch requests with filters
 */
export function useRequests(filters?: RequestFiltersInput) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }

  const { data, error, mutate, isLoading } = useSWR<PaginatedRequestsResponse>(
    filters ? `/admin/requests?${queryParams.toString()}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    requests: data?.requests || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch a single request by ID
 */
export function useRequest(requestId: number | null) {
  const { data, error, mutate, isLoading } = useSWR<{ request: RequestResponse }>(
    requestId ? `/admin/requests/${requestId}` : null,
    fetcher
  );

  return {
    request: data?.request,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to assign a request
 */
export async function useAssignRequest() {
  return async (requestId: number, partnerId: number, branchId: number) => {
    return requestsApi.assignRequest(requestId, { partnerId, branchId });
  };
}

/**
 * Hook to update request status
 */
export async function useUpdateRequestStatus() {
  return async (
    requestId: number,
    status: string,
    notes?: string,
    rejectionReason?: string
  ) => {
    return requestsApi.updateRequestStatus(requestId, {
      status: status as any,
      notes,
      rejectionReason,
    });
  };
}

/**
 * Hook to close a request
 */
export async function useCloseRequest() {
  return async (requestId: number, notes?: string) => {
    return requestsApi.closeRequest(requestId, notes);
  };
}
