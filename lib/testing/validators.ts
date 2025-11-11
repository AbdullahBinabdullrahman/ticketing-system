/**
 * Response Validators for Testing
 * Validates API responses match expected schemas and business logic
 */

import { logger } from "../utils/logger";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate request response structure
 */
export function validateRequestResponse(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.id) errors.push("Missing request id");
  if (!data.requestNumber) errors.push("Missing request number");
  if (!data.status) errors.push("Missing status");
  if (!data.categoryId) errors.push("Missing categoryId");
  if (!data.pickupOptionId) errors.push("Missing pickupOptionId");
  if (!data.customerName) errors.push("Missing customerName");
  if (!data.customerPhone) errors.push("Missing customerPhone");
  if (!data.customerAddress) errors.push("Missing customerAddress");
  if (!data.customerLat) errors.push("Missing customerLat");
  if (!data.customerLng) errors.push("Missing customerLng");
  if (!data.createdAt) errors.push("Missing createdAt");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate partner response structure
 */
export function validatePartnerResponse(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.id) errors.push("Missing partner id");
  if (!data.name) errors.push("Missing partner name");
  if (!data.status) errors.push("Missing partner status");
  if (!data.createdAt) errors.push("Missing createdAt");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate branch response structure
 */
export function validateBranchResponse(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.id) errors.push("Missing branch id");
  if (!data.partnerId) errors.push("Missing partnerId");
  if (!data.name) errors.push("Missing branch name");
  if (typeof data.lat !== "number") errors.push("Missing or invalid lat");
  if (typeof data.lng !== "number") errors.push("Missing or invalid lng");
  if (typeof data.radiusKm !== "number") errors.push("Missing or invalid radiusKm");
  if (!data.createdAt) errors.push("Missing createdAt");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate request status transition
 */
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): ValidationResult {
  const validTransitions: Record<string, string[]> = {
    submitted: ["assigned"],
    assigned: ["confirmed", "rejected", "unassigned"],
    confirmed: ["in_progress", "rejected"],
    in_progress: ["completed"],
    completed: ["closed"],
    rejected: ["assigned"],
    unassigned: ["assigned"],
    closed: [], // Terminal state
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  const valid = allowedTransitions.includes(newStatus);

  return {
    valid,
    errors: valid
      ? []
      : [
          `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedTransitions.join(", ")}`,
        ],
  };
}

/**
 * Validate timeline entry
 */
export function validateTimelineEntry(entry: any): ValidationResult {
  const errors: string[] = [];

  if (!entry.id) errors.push("Missing timeline entry id");
  if (!entry.requestId) errors.push("Missing requestId");
  if (!entry.action) errors.push("Missing action");
  if (!entry.performedById) errors.push("Missing performedById");
  if (!entry.performedAt) errors.push("Missing performedAt");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate SLA deadline
 */
export function validateSlaDeadline(assignedAt: string, slaDeadline: string): ValidationResult {
  const errors: string[] = [];

  try {
    const assigned = new Date(assignedAt);
    const deadline = new Date(slaDeadline);
    const diffMinutes = (deadline.getTime() - assigned.getTime()) / (1000 * 60);

    // Default SLA is 15 minutes
    if (diffMinutes < 14 || diffMinutes > 16) {
      errors.push(
        `SLA deadline should be ~15 minutes after assignment. Got ${diffMinutes.toFixed(2)} minutes`
      );
    }
  } catch (error) {
    errors.push("Invalid date format in assignedAt or slaDeadline");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate pagination response
 */
export function validatePaginationResponse(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.pagination) {
    errors.push("Missing pagination object");
    return { valid: false, errors };
  }

  const { pagination } = data;

  if (typeof pagination.page !== "number") errors.push("Missing or invalid page");
  if (typeof pagination.limit !== "number") errors.push("Missing or invalid limit");
  if (typeof pagination.total !== "number") errors.push("Missing or invalid total");
  if (typeof pagination.totalPages !== "number") errors.push("Missing or invalid totalPages");

  // Validate pagination logic
  if (pagination.page < 1) errors.push("Page should be >= 1");
  if (pagination.limit < 1) errors.push("Limit should be >= 1");
  if (pagination.total < 0) errors.push("Total should be >= 0");

  const expectedTotalPages = Math.ceil(pagination.total / pagination.limit);
  if (pagination.totalPages !== expectedTotalPages && pagination.total > 0) {
    errors.push(
      `TotalPages mismatch. Expected ${expectedTotalPages}, got ${pagination.totalPages}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate distance calculation
 */
export function validateDistance(distance: number): ValidationResult {
  const errors: string[] = [];

  if (typeof distance !== "number") {
    errors.push("Distance must be a number");
  } else if (distance < 0) {
    errors.push("Distance cannot be negative");
  } else if (distance > 1000) {
    errors.push("Distance seems unreasonably large (>1000km)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate authentication response
 */
export function validateAuthResponse(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.user) errors.push("Missing user object");
  if (!data.tokens) errors.push("Missing tokens object");

  if (data.user) {
    if (!data.user.id) errors.push("Missing user id");
    if (!data.user.email) errors.push("Missing user email");
    if (!data.user.userType) errors.push("Missing user userType");
  }

  if (data.tokens) {
    if (!data.tokens.accessToken) errors.push("Missing accessToken");
    if (!data.tokens.refreshToken) errors.push("Missing refreshToken");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log validation results
 */
export function logValidation(name: string, result: ValidationResult): void {
  if (result.valid) {
    logger.info(`Validation passed: ${name}`);
  } else {
    logger.error(`Validation failed: ${name}`, { errors: result.errors });
  }
}

/**
 * Assert validation passes (throws if fails)
 */
export function assertValid(name: string, result: ValidationResult): void {
  if (!result.valid) {
    const errorMessage = `Validation failed for ${name}: ${result.errors.join(", ")}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

