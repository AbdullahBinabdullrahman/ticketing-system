import { apiClient } from "./client";
import type {
  CreatePartnerInput,
  CreatePartnerWithUserInput,
  UpdatePartnerInput,
  PartnerFiltersInput,
  BranchFiltersInput,
  CreateBranchInput,
  UpdateBranchInput,
} from "../../schemas/partners";

export interface PartnerResponse {
  id: number;
  name: string;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  branchesCount?: number;
  categoriesCount?: number;
  completedRequestsCount?: number;
  averageRating?: number;
}

export interface BranchResponse {
  id: number;
  partnerId: number;
  partnerName?: string;
  name: string;
  lat: number;
  lng: number;
  contactName?: string;
  phone?: string;
  address?: string;
  radiusKm: number;
  distance?: number;
  createdAt: string;
  updatedAt: string;
  usersCount?: number;
  requestsCount?: number;
}

export interface PaginatedPartnersResponse {
  partners: PartnerResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedBranchesResponse {
  branches: BranchResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NearestBranchResponse {
  branch: BranchResponse;
  alternativeBranches: BranchResponse[];
}

/**
 * Get partners with filters
 */
export async function getPartners(
  filters: PartnerFiltersInput
): Promise<PaginatedPartnersResponse> {
  const response = await apiClient.get("/admin/partners", { params: filters });
  return response.data;
}

/**
 * Get a single partner by ID
 */
export async function getPartner(partnerId: number): Promise<PartnerResponse> {
  const response = await apiClient.get(`/admin/partners/${partnerId}`);
  return response.data;
}

/**
 * Create a new partner with initial user account
 */
export async function createPartner(
  data: CreatePartnerWithUserInput
): Promise<{
  partner: PartnerResponse;
  user: { id: number; email: string; temporaryPassword?: string };
}> {
  const response = await apiClient.post("/admin/partners", data);
  return response.data;
}

/**
 * Update a partner
 */
export async function updatePartner(
  partnerId: number,
  data: UpdatePartnerInput
): Promise<PartnerResponse> {
  const response = await apiClient.patch(`/admin/partners/${partnerId}`, data);
  return response.data;
}

/**
 * Delete a partner
 */
export async function deletePartner(partnerId: number): Promise<void> {
  await apiClient.delete(`/admin/partners/${partnerId}`);
}

/**
 * Get branches with filters
 */
export async function getBranches(
  filters: BranchFiltersInput
): Promise<PaginatedBranchesResponse> {
  const response = await apiClient.get("/admin/branches", { params: filters });
  return response.data;
}

/**
 * Find nearest branch to coordinates
 */
export async function findNearestBranch(
  lat: number,
  lng: number,
  categoryId?: number,
  partnerId?: number
): Promise<NearestBranchResponse | null> {
  const params: Record<string, any> = { lat, lng };
  if (categoryId) params.categoryId = categoryId;
  if (partnerId) params.partnerId = partnerId;

  const response = await apiClient.get("/admin/branches/nearest", { params });
  return response.data;
}

/**
 * Create a new branch
 */
export async function createBranch(data: CreateBranchInput): Promise<BranchResponse> {
  const response = await apiClient.post("/admin/branches", data);
  return response.data;
}

/**
 * Update a branch
 */
export async function updateBranch(
  branchId: number,
  data: UpdateBranchInput
): Promise<BranchResponse> {
  const response = await apiClient.patch(`/admin/branches/${branchId}`, data);
  return response.data;
}

/**
 * Delete a branch
 */
export async function deleteBranch(branchId: number): Promise<void> {
  await apiClient.delete(`/admin/branches/${branchId}`);
}

export const partnersApi = {
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  getBranches,
  findNearestBranch,
  createBranch,
  updateBranch,
  deleteBranch,
};

