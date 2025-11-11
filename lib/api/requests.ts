import { apiClient } from "./client";
import type {
  CreateRequestInput,
  RequestFiltersInput,
  AssignRequestInput,
  UpdateRequestStatusInput,
  RateRequestInput,
} from "../../schemas/requests";

export interface RequestResponse {
  id: number;
  requestNumber: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  serviceId?: number;
  serviceName?: string;
  serviceNameAr?: string;
  pickupOptionId: number;
  pickupOptionName: string;
  pickupOptionNameAr: string;
  partnerId?: number;
  partnerName?: string;
  branchId?: number;
  branchName?: string;
  status: string;
  slaDeadline?: string;
  submittedAt: string;
  assignedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  closedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRequestsResponse {
  requests: RequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a new request (customer endpoint)
 */
export async function createRequest(
  data: CreateRequestInput
): Promise<RequestResponse> {
  const response = await apiClient.post("/customer/requests", data);
  return response.data;
}

/**
 * Get requests with filters (admin, partner, or customer)
 */
export async function getRequests(
  filters: RequestFiltersInput
): Promise<PaginatedRequestsResponse> {
  const response = await apiClient.get("/admin/requests", { params: filters });
  return response.data;
}

/**
 * Get a single request by ID
 */
export async function getRequest(requestId: number): Promise<RequestResponse> {
  const response = await apiClient.get(`/admin/requests/${requestId}`);
  return response.data;
}

/**
 * Assign a request to a partner branch (admin endpoint)
 */
export async function assignRequest(
  requestId: number,
  data: AssignRequestInput
): Promise<RequestResponse> {
  const response = await apiClient.post(
    `/admin/requests/${requestId}/assign`,
    data
  );
  return response.data;
}

/**
 * Close a request (admin endpoint)
 */
export async function closeRequest(
  requestId: number,
  notes?: string
): Promise<RequestResponse> {
  const response = await apiClient.post(`/admin/requests/${requestId}/close`, {
    notes,
  });
  return response.data;
}

/**
 * Update request status (partner endpoint)
 */
export async function updateRequestStatus(
  requestId: number,
  data: UpdateRequestStatusInput
): Promise<RequestResponse> {
  const response = await apiClient.put(
    `/partner/requests/${requestId}/status`,
    data
  );
  return response.data;
}

/**
 * Rate a request (customer endpoint)
 */
export async function rateRequest(
  requestId: number,
  data: RateRequestInput
): Promise<RequestResponse> {
  const response = await apiClient.post(
    `/customer/requests/${requestId}/rate`,
    data
  );
  return response.data;
}

export const requestsApi = {
  createRequest,
  getRequests,
  getRequest,
  assignRequest,
  closeRequest,
  updateRequestStatus,
  rateRequest,
};
