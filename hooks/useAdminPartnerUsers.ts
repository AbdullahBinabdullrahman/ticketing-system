import useSWR from "swr";
import { apiClient } from "../lib/api/client";

/**
 * Admin Partner User interface
 */
export interface AdminPartnerUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  userType: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  languagePreference: string;
}

/**
 * Partner users response interface
 */
export interface AdminPartnerUsersResponse {
  users: AdminPartnerUser[];
  total: number;
}

/**
 * Create user data interface
 */
export interface CreateAdminPartnerUserData {
  name: string;
  email: string;
  phone?: string;
  language?: "en" | "ar";
  sendWelcomeEmail?: boolean;
}

/**
 * Create user response interface
 */
export interface CreateUserResponse {
  user: AdminPartnerUser;
  temporaryPassword?: string;
  message: string;
}

/**
 * Admin Partner Users Hook
 * Allows admin to manage users for a specific partner
 * 
 * @param partnerId - The partner ID to fetch users for
 */
export function useAdminPartnerUsers(partnerId: number | null) {
  const fetcher = async (url: string) => {
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  };

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<AdminPartnerUsersResponse>(
    partnerId ? `/admin/partners/${partnerId}/users` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  /**
   * Create new partner user
   * Sends welcome email automatically if sendWelcomeEmail is true
   */
  const createUser = async (
    userData: CreateAdminPartnerUserData
  ): Promise<CreateUserResponse> => {
    const response = await apiClient.post(
      `/admin/partners/${partnerId}/users/create`,
      userData
    );
    mutate();
    return response.data.data || response.data;
  };

  /**
   * Update partner user status
   */
  const updateUserStatus = async (userId: number, isActive: boolean) => {
    const response = await apiClient.patch(
      `/admin/users/${userId}/status`,
      { isActive }
    );
    mutate();
    return response.data.data || response.data;
  };

  /**
   * Delete (soft delete) partner user
   */
  const deleteUser = async (userId: number) => {
    await apiClient.delete(`/admin/users/${userId}`);
    mutate();
  };

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    createUser,
    updateUserStatus,
    deleteUser,
  };
}

