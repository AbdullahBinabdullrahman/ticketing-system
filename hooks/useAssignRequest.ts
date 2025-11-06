import http from "@/lib/utils/http";
import { useState } from "react";

interface AssignRequestData {
  branchId: number;
  assignmentNotes?: string;
}

/**
 * Custom hook to handle request assignment mutation
 * @returns Mutation function, loading state, and error
 */
export function useAssignRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Assign a request to a branch
   * @param requestId - Request ID or request number
   * @param data - Assignment data (branch ID, notes)
   * @returns Promise with the updated request
   */
  const assignRequest = async (requestId: string, data: AssignRequestData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await http.post(
        `/admin/requests/${requestId}/assign`,
        data
      );
      return response.data.request;
    } catch (error: unknown) {
      let errorMessage = t("errors.generic");
      if (error && typeof error === "object") {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      setError(new Error(errorMessage));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignRequest,
    isLoading,
    error,
  };
}

