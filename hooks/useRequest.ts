import http from "@/lib/utils/http";
import useSWR from "swr";

/**
 * Custom hook to fetch a single request by ID or request number
 * @param requestId - Request ID or request number
 * @returns Request data, loading state, error, and mutation function
 */
export function useRequest(requestId: string | undefined) {
  const fetcher = async (url: string) => {
    const response = await http.get(url);
    return response.data.request;
  };

  const {
    data: request,
    error,
    isLoading,
    mutate,
  } = useSWR(requestId ? `/partner/requests/${requestId}` : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    request,
    isLoading,
    error,
    mutate,
  };
}

