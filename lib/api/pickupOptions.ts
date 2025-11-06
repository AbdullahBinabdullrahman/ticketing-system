/**
 * Pickup Options API Client
 * Handles all pickup options-related API requests using adminHttp client
 */

import { adminHttp } from "@/lib/utils/http";

export interface PickupOption {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  requiresServiceSelection: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all active pickup options
 */
export async function getPickupOptions(): Promise<PickupOption[]> {
  const response = await adminHttp.get("/pickup-options");
  return response.data;
}

/**
 * Get a single pickup option by ID
 */
export async function getPickupOptionById(id: number): Promise<PickupOption> {
  const response = await adminHttp.get(`/pickup-options/${id}`);
  return response.data;
}

export const pickupOptionsApi = {
  getAll: getPickupOptions,
  getById: getPickupOptionById,
};

