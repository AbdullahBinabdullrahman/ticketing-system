/**
 * Customer Requests Hooks
 * SWR-based hooks for customer request operations
 */

import useSWR, { mutate } from "swr";
import customerHttp from "@/lib/utils/customerHttp";
import type { CreateRequestInput, RateRequestInput } from "@/schemas/requests";

interface RequestResponse {
  id: number;
  requestNumber: string;
  status: string;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  serviceId?: number;
  serviceName?: string;
  serviceNameAr?: string;
  pickupOptionId: number;
  pickupOptionName: string;
  pickupOptionNameAr: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  partnerId?: number;
  partnerName?: string;
  branchId?: number;
  branchName?: string;
  rating?: number;
  feedback?: string;
  submittedAt: string;
  assignedAt?: string;
  confirmedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  closedAt?: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedRequestsResponse {
  requests: RequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch all customer requests with pagination
 */
export function useCustomerRequests(page: number = 1, limit: number = 10) {
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<PaginatedRequestsResponse>(
    `/customer/requests?page=${page}&limit=${limit}`,
    async (url: string) => {
      const response = await customerHttp.get(url);
      return response.data;
    }
  );

  return {
    requests: data?.requests || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetch a single customer request by request number (or ID for backward compatibility)
 */
export function useCustomerRequest(requestIdentifier: string | number | null) {
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<{ status: boolean; data: RequestResponse }>(
    requestIdentifier ? `/customer/requests/${requestIdentifier}` : null,
    async (url: string) => {
      const response = await customerHttp.get(url);
      return response.data;
    }
  );

  return {
    request: data?.data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Create a new customer request
 */
export function useCreateRequest() {
  const createRequest = async (
    data: CreateRequestInput
  ): Promise<RequestResponse> => {
    const response = await customerHttp.post("/customer/requests", data);

    // Invalidate the requests list cache
    mutate(
      (key) => typeof key === "string" && key.startsWith("/customer/requests")
    );

    return response.data;
  };

  return { createRequest };
}

/**
 * Rate a completed request (accepts request number or ID)
 */
export function useRateRequest(requestIdentifier: string | number) {
  const rateRequest = async (
    data: RateRequestInput
  ): Promise<RequestResponse> => {
    const response = await customerHttp.post(
      `/customer/requests/${requestIdentifier}/rate`,
      data
    );

    // Invalidate both the specific request and the list cache
    mutate(`/customer/requests/${requestIdentifier}`);
    mutate(
      (key) => typeof key === "string" && key.startsWith("/customer/requests")
    );

    return response.data;
  };

  return { rateRequest };
}
