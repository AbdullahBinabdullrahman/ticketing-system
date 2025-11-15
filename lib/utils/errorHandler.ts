import { NextApiResponse } from "next";
import { ZodError } from "zod";

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    // Format Zod errors for better readability
    const formattedErrors = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    return {
      message: `Validation error: ${formattedErrors
        .map((e) => `${e.field}: ${e.message}`)
        .join(", ")}`,
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: formattedErrors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {} as Record<string, string>),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: "Internal server error",
    statusCode: 500,
  };
}

export function sendErrorResponse(res: NextApiResponse, error: ApiError) {
  const { statusCode, message, code, details = {} } = error;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  });
}

export function sendSuccessResponse<T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200
) {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

// Common error types
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PARTNER_NOT_FOUND: "PARTNER_NOT_FOUND",
  REQUEST_NOT_FOUND: "REQUEST_NOT_FOUND",
  BRANCH_NOT_FOUND: "BRANCH_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  SERVICE_NOT_FOUND: "SERVICE_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  SLA_TIMEOUT: "SLA_TIMEOUT",
  CONFIGURATION_NOT_FOUND: "CONFIGURATION_NOT_FOUND",
} as const;
