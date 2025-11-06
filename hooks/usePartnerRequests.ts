/**
 * Partner Requests Hooks
 * Custom hooks for partner requests using partnerHttp client
 */

import useSWR from "swr";
import { partnerHttp } from "../lib/utils/partnerHttp";
import type { RequestFiltersInput } from "../schemas/requests";

/**
 * Response types
 */
export interface PartnerRequestResponse {
  id: number;
  requestNumber: string;
  status: string;
  priority: string;
  pickupOption: string;
  customerLat: string;
  customerLng: string;
  customerAddress: string;
  notes: string | null;
  rejectionReason: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  assignedAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  slaDeadline?: string;
  // Customer info
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Service info
  serviceId: number | null;
  serviceName: string | null;
  serviceNameAr: string | null;
  // Category info
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  // Branch info
  branchId: number;
  branchName: string;
  branchNameAr: string | null;
  branchAddress: string;
  branchLat: string;
  branchLng: string;
  branchPhone: string | null;
  // Partner info
  partnerName: string;
  partnerLogoUrl: string | null;
}

export interface PaginatedPartnerRequestsResponse {
  requests: PartnerRequestResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PartnerRequestDetailResponse {
  request: PartnerRequestResponse;
  timeline: Array<{
    id: number;
    status: string;
    notes: string | null;
    changedByName: string | null;
    timestamp: string;
  }>;
  timeRemainingMinutes: number | null;
}

/**
 * SWR fetcher using partnerHttp
 */
const fetcher = (url: string) =>
  partnerHttp.get(url).then((res) => res.data.data || res.data);

/**
 * Hook to fetch partner's requests with filters
 * @param filters - Optional filters for requests
 * @returns requests, pagination, loading state, error state, and mutate function
 */
export function usePartnerRequests(filters?: RequestFiltersInput) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/requests${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data, error, mutate, isLoading } =
    useSWR<PaginatedPartnerRequestsResponse>(endpoint, fetcher, {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    });

  return {
    requests: data?.requests || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch a single request by request number or ID
 * @param identifier - Request number (string) or ID (number)
 * @returns request details, timeline, loading state, error state, and mutate function
 */
export function usePartnerRequest(identifier: string | number | null) {
  const { data, error, mutate, isLoading } =
    useSWR<PartnerRequestDetailResponse>(
      identifier ? `/requests/${identifier}` : null,
      fetcher,
      {
        refreshInterval: 60000, // Auto-refresh every minute to update timer
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      }
    );

  return {
    request: data?.request,
    timeline: data?.timeline || [],
    timeRemainingMinutes: data?.timeRemainingMinutes,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to accept an assigned request
 * @returns Function to accept a request by ID
 */
export function useAcceptRequest() {
  return async (requestId: string | number) => {
    const response = await partnerHttp.post(`/requests/${requestId}/accept`);
    return response.data;
  };
}

/**
 * Hook to reject an assigned request
 * @returns Function to reject a request by ID with a reason
 */
export function useRejectRequest() {
  return async (requestId: string | number, reason: string) => {
    const response = await partnerHttp.post(`/requests/${requestId}/reject`, {
      reason,
    });
    return response.data;
  };
}

/**
 * Hook to update request status (in_progress, completed)
 * @returns Function to update request status
 */
export function useUpdateRequestStatus() {
  return async (
    requestId: string | number,
    status: "in_progress" | "completed",
    notes?: string
  ) => {
    const response = await partnerHttp.patch(`/requests/${requestId}/status`, {
      status,
      notes,
    });
    return response.data;
  };
}

/**
 * Hook to get requests count by status for quick stats
 * @returns Count of requests by status
 */
export function usePartnerRequestsCounts() {
  const { requests, isLoading } = usePartnerRequests();

  const counts = {
    assigned: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    total: 0,
  };

  if (!isLoading && requests) {
    counts.total = requests.length;
    requests.forEach((request) => {
      switch (request.status) {
        case "assigned":
          counts.assigned++;
          break;
        case "confirmed":
          counts.confirmed++;
          break;
        case "in_progress":
          counts.inProgress++;
          break;
        case "completed":
          counts.completed++;
          break;
        case "rejected":
          counts.rejected++;
          break;
      }
    });
  }

  return {
    counts,
    isLoading,
  };
}
