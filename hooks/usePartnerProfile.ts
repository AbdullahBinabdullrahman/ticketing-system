import useSWR from "swr";
import { partnerHttp } from "../lib/utils/partnerHttp";

/**
 * Partner interface
 */
export interface Partner {
  id: number;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * Branch interface
 */
export interface Branch {
  id: number;
  partnerId: number;
  name: string;
  nameAr: string | null;
  address: string | null;
  lat: string | null;
  lng: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * Category interface
 */
export interface Category {
  id: number;
  name: string;
  nameAr: string | null;
  iconUrl: string | null;
}

/**
 * Partner user interface
 */
export interface PartnerUser {
  id: number;
  name: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Partner profile response interface
 */
export interface PartnerProfileResponse {
  partner: Partner;
  branches: Branch[];
  categories: Category[];
  users: PartnerUser[];
}

/**
 * Partner Profile Hook
 * Fetches partner profile with branches, categories, and users
 */
export function usePartnerProfile() {
  const fetcher = async (url: string) => {
    const response = await partnerHttp.get(url);
    return response.data.data || response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<PartnerProfileResponse>(
    "/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  /**
   * Update partner profile contact information
   */
  const updateProfile = async (profileData: {
    contactEmail?: string;
    contactPhone?: string;
  }) => {
    const response = await partnerHttp.patch("/profile", profileData);
    mutate();
    return response.data.data || response.data;
  };

  return {
    partner: data?.partner || null,
    branches: data?.branches || [],
    categories: data?.categories || [],
    users: data?.users || [],
    isLoading,
    error,
    mutate,
    updateProfile,
  };
}

