/**
 * Admin Users Hook
 * Custom hook for fetching and managing admin and operational users
 */

import useSWR from "swr";
import { adminHttp } from "../lib/utils/adminHttp";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  roleId: number;
  roleName: string;
  userType: string;
  languagePreference: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export interface AdminRole {
  id: number;
  name: string;
  description?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    roles: AdminRole[];
  };
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  phone?: string;
  roleId: number;
  language?: "en" | "ar";
  sendWelcomeEmail?: boolean;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  isActive?: boolean;
  languagePreference?: "en" | "ar";
}

const fetcher = async (url: string) => {
  const response = await adminHttp.get(url);
  return response.data.data || response.data;
};

/**
 * Hook to fetch all admin and operational users
 */
export function useAdminUsers() {
  const { data, error, mutate, isLoading } = useSWR<{
    users: AdminUser[];
    roles: AdminRole[];
  }>("/admin/users", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    users: data?.users || [],
    roles: data?.roles || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to create a new admin user
 */
export function useCreateAdminUser() {
  return async (data: CreateAdminUserInput) => {
    const response = await adminHttp.post("/admin/users", data);
    return response.data;
  };
}

/**
 * Hook to update an admin user
 */
export function useUpdateAdminUser() {
  return async (userId: number, data: UpdateAdminUserInput) => {
    const response = await adminHttp.patch(`/admin/users/${userId}`, data);
    return response.data;
  };
}

/**
 * Hook to delete an admin user
 */
export function useDeleteAdminUser() {
  return async (userId: number) => {
    const response = await adminHttp.delete(`/admin/users/${userId}`);
    return response.data;
  };
}

