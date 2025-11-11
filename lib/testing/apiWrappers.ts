/**
 * API Wrappers for Testing
 * Wraps API calls with logging, performance tracking, and error handling
 */

import { authManager } from "./authManager";
import { performanceMonitor } from "./performanceMonitor";
import { logger } from "../utils/logger";
import type { ApiCallLog } from "./types";
import http from "../utils/http";

/**
 * Wrapped API call with logging and performance tracking
 */
export async function makeTestApiCall<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  data?: unknown
): Promise<{ data: T; log: ApiCallLog }> {
  const startTime = Date.now();
  const role = authManager.getCurrentRole() || "admin";

  const apiLog: ApiCallLog = {
    timestamp: startTime,
    method,
    endpoint,
    role,
    requestData: data,
    duration: 0,
  };

  try {
    let response;

    switch (method) {
      case "GET":
        response = await http.get(endpoint);
        break;
      case "POST":
        response = await http.post(endpoint, data);
        break;
      case "PUT":
        response = await http.put(endpoint, data);
        break;
      case "PATCH":
        response = await http.patch(endpoint, data);
        break;
      case "DELETE":
        response = await http.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    const duration = Date.now() - startTime;

    apiLog.responseData = response.data;
    apiLog.statusCode = response.status;
    apiLog.duration = duration;

    performanceMonitor.logApiCall(apiLog);

    logger.info(`API Call: ${method} ${endpoint}`, {
      status: response.status,
      duration: `${duration}ms`,
      role,
    });

    return { data: response.data, log: apiLog };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    apiLog.error = error.response?.data?.message || error.message;
    apiLog.statusCode = error.response?.status;
    apiLog.duration = duration;

    performanceMonitor.logApiCall(apiLog);

    logger.error(`API Call Failed: ${method} ${endpoint}`, {
      error: error.message,
      status: error.response?.status,
      duration: `${duration}ms`,
      role,
      responseData: error.response?.data,
    });

    throw error;
  }
}

/**
 * Test API wrapper functions for common operations
 */

// Authentication
export async function testLogin(email: string, password: string) {
  return makeTestApiCall("POST", "/auth/login", { email, password });
}

// Customer Requests
export async function testCreateRequest(requestData: any) {
  return makeTestApiCall("POST", "/customer/requests", requestData);
}

export async function testGetRequests(filters?: any) {
  return makeTestApiCall(
    "GET",
    `/admin/requests?${new URLSearchParams(filters).toString()}`
  );
}

export async function testGetRequest(requestId: number) {
  return makeTestApiCall("GET", `/admin/requests/${requestId}`);
}

export async function testGetRequestTimeline(requestId: number) {
  return makeTestApiCall("GET", `/admin/requests/${requestId}/timeline`);
}

// Admin Request Management
export async function testAssignRequest(
  requestId: number,
  partnerId: number,
  branchId: number
) {
  return makeTestApiCall("POST", `/admin/requests/${requestId}/assign`, {
    partnerId,
    branchId,
  });
}

export async function testCloseRequest(requestId: number, notes?: string) {
  return makeTestApiCall("POST", `/admin/requests/${requestId}/close`, {
    notes,
  });
}

export async function testGetUnassignedRequests() {
  return makeTestApiCall("GET", "/admin/requests/unassigned");
}

// Partner Request Management
export async function testGetPartnerRequests(filters?: any) {
  return makeTestApiCall(
    "GET",
    `/partner/requests?${new URLSearchParams(filters).toString()}`
  );
}

export async function testUpdateRequestStatus(
  requestId: number,
  status: string,
  notes?: string,
  rejectionReason?: string
) {
  return makeTestApiCall("PUT", `/partner/requests/${requestId}/status`, {
    status,
    notes,
    rejectionReason,
  });
}

// Partners and Branches
export async function testGetPartners(filters?: any) {
  return makeTestApiCall("GET", `/admin/partners?${new URLSearchParams(filters).toString()}`
}

export async function testCreatePartner(partnerData: any) {
  return makeTestApiCall("POST", "/admin/partners", partnerData);
}

export async function testGetBranches(filters?: any) {
  return makeTestApiCall("GET", `/admin/branches?${new URLSearchParams(filters).toString()}`
  );
}

export async function testCreateBranch(branchData: any) {
  return makeTestApiCall("POST", "/admin/branches", branchData);
}

export async function testFindNearestBranch(
  lat: number,
  lng: number,
  categoryId?: number,
  partnerId?: number
) {
  const params: any = { lat, lng };
  if (categoryId) params.categoryId = categoryId;
  if (partnerId) params.partnerId = partnerId;
  return makeTestApiCall("GET", `/admin/branches/nearest?${new URLSearchParams(params).toString()}`
  );
}

// Categories and Services
export async function testGetCategories() {
  return makeTestApiCall("GET", "/admin/categories");
}

export async function testGetServices(categoryId?: number) {
  const params = categoryId ? { categoryId } : undefined;
  return makeTestApiCall("GET", `/admin/services?${new URLSearchParams(params).toString()}`
  );
}

/**
 * Batch API calls with performance tracking
 */
export async function executeBatchCalls<T>(
  calls: Array<() => Promise<T>>,
  parallel: boolean = false
): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
  const startTime = Date.now();

  try {
    if (parallel) {
      const results = await Promise.allSettled(calls.map((call) => call()));
      logger.info(`Batch API calls completed (parallel)`, {
        total: calls.length,
        duration: `${Date.now() - startTime}ms`,
      });

      return results.map((result) => {
        if (result.status === "fulfilled") {
          return { success: true, data: result.value };
        } else {
          return { success: false, error: result.reason };
        }
      });
    } else {
      const results: Array<{ success: boolean; data?: T; error?: any }> = [];

      for (const call of calls) {
        try {
          const data = await call();
          results.push({ success: true, data });
        } catch (error) {
          results.push({ success: false, error });
        }
      }

      logger.info(`Batch API calls completed (sequential)`, {
        total: calls.length,
        duration: `${Date.now() - startTime}ms`,
      });

      return results;
    }
  } catch (error) {
    logger.error("Batch API calls failed", { error });
    throw error;
  }
}
