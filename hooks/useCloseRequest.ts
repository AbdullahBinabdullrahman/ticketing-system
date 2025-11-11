import http from "@/lib/utils/http";
import { useState } from "react";

interface CloseRequestData {
  verificationNotes?: string;
  customerConfirmed: boolean;
}

/**
 * Custom hook to handle request closure mutation
 * @returns Mutation function, loading state, and error
 */
export function useCloseRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Close a completed request
   * @param requestId - Request ID or request number
   * @param data - Closure data (verification notes, customer confirmation)
   * @returns Promise with the closed request
   */
  const closeRequest = async (requestId: string, data: CloseRequestData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await http.post(
        `/admin/requests/${requestId}/close`,
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
          : "Failed to close request";
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    closeRequest,
    isLoading,
    error,
  };
}

