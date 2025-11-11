import useSWR from "swr";

import { useMemo } from "react";
import http from "@/lib/utils/http";

interface Branch {
  id: number;
  partnerId: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  serviceRadius: number;
  contactName?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Calculated distance from customer location
}

interface UseBranchesOptions {
  partnerId?: number;
  customerLat?: number;
  customerLng?: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Custom hook to fetch branches with distance calculation
 * @param options - Filter options (partnerId, customer location)
 * @returns Branches data with calculated distances, loading state, error, and mutation function
 */
export function useBranches(options: UseBranchesOptions = {}) {
  const { partnerId, customerLat, customerLng } = options;

  const fetcher = async (url: string) => {
    const response = await http.get(url);
    // Extract from nested data property (API uses sendSuccessResponse wrapper)
    return response.data.data.branches;
  };

  const url = partnerId
    ? `/admin/branches?partnerId=${partnerId}`
    : "/admin/branches";

  const {
    data: branches,
    error,
    isLoading,
    mutate,
  } = useSWR<Branch[]>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Calculate distances if customer location is provided
  const branchesWithDistance = useMemo(() => {
    if (!branches) return [];

    if (customerLat !== undefined && customerLng !== undefined) {
      return branches
        .map((branch) => ({
          ...branch,
          distance: calculateDistance(
            customerLat,
            customerLng,
            branch.lat,
            branch.lng
          ),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return branches;
  }, [branches, customerLat, customerLng]);

  // Find nearest branch
  const nearestBranch = branchesWithDistance[0] || null;

  return {
    branches: branchesWithDistance,
    nearestBranch,
    isLoading,
    error,
    mutate,
  };
}

