import http from "@/lib/utils/http";
import { useState } from "react";

interface UpdateStatusData {
  status: string;
  statusNotes?: string;
}

/**
 * Custom hook to handle request status update mutation
 * @returns Mutation function, loading state, and error
 */
export function useUpdateRequestStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Update request status
   * @param requestId - Request ID or request number
   * @param data - Status update data (status, notes)
   * @returns Promise with the updated request
   */
  const updateStatus = async (requestId: string, data: UpdateStatusData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await http.put(
        `/partner/requests/${requestId}/status`,
        data
      );

      return response.data.request;
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : "Failed to update request status";
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStatus,
    isLoading,
    error,
  };
}

