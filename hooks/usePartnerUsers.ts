import useSWR from "swr";
import { partnerHttp } from "../lib/utils/partnerHttp";

/**
 * Partner user interface
 */
export interface PartnerUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  userType: string;
  isActive: boolean;
  otpEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Partner users response interface
 */
export interface PartnerUsersResponse {
  users: PartnerUser[];
  total: number;
}

/**
 * Create user data interface
 */
export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  language?: "en" | "ar";
}

/**
 * Update user data interface
 */
export interface UpdateUserData {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

/**
 * Partner Users Hook
 * CRUD operations for partner users
 */
export function usePartnerUsers() {
  const fetcher = async (url: string) => {
    const response = await partnerHttp.get(url);
    return response.data.data || response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<PartnerUsersResponse>(
    "/users",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  /**
   * Create new partner user
   * Sends welcome email automatically
   */
  const createUser = async (userData: CreateUserData) => {
    const response = await partnerHttp.post("/users", userData);
    mutate();
    return response.data.data || response.data;
  };

  /**
   * Update partner user
   */
  const updateUser = async (userId: number, userData: UpdateUserData) => {
    const response = await partnerHttp.patch(`/users/${userId}`, userData);
    mutate();
    return response.data.data || response.data;
  };

  /**
   * Deactivate partner user (soft delete)
   */
  const deleteUser = async (userId: number) => {
    await partnerHttp.delete(`/users/${userId}`);
    mutate();
  };

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    createUser,
    updateUser,
    deleteUser,
  };
}

