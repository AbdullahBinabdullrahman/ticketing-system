import type { NextApiRequest, NextApiResponse } from "next";
import { configurationService } from "../../../../lib/services/configurationService";
import { authService } from "../../../../lib/services/authService";
import {
  updateConfigurationSchema,
  slaTimeoutConfigSchema,
  emailConfigSchema,
  ConfigurationKeys,
} from "../../../../schemas/configurations";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
  AppError,
  ErrorCodes,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

/**
 * Admin Configuration Detail API Handler
 * GET /api/admin/configurations/[key] - Get specific configuration
 * PATCH /api/admin/configurations/[key] - Update specific configuration
 * DELETE /api/admin/configurations/[key] - Delete specific configuration
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    req.method !== "GET" &&
    req.method !== "PATCH" &&
    req.method !== "DELETE"
  ) {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, {
        message: "Authorization header missing or invalid",
        code: "AUTHENTICATION_ERROR",
        statusCode: 401,
      });
    }

    const token = authHeader.substring(7);
    const { userId } = await authService.verifyToken(token);

    // Verify admin access
    const userProfile = await authService.getUserProfile(userId);
    if (userProfile.userType !== "admin") {
      return sendErrorResponse(res, {
        message: "Access denied - Admin required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    // Validate configuration key
    const key = req.query.key as string;
    const keyValidation = ConfigurationKeys.safeParse(key);
    if (!keyValidation.success) {
      return sendErrorResponse(res, {
        message: "Invalid configuration key",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get specific configuration
      const configuration = await configurationService.getGlobalConfig(key);

      if (!configuration) {
        throw new AppError(
          "Configuration not found",
          404,
          ErrorCodes.NOT_FOUND
        );
      }

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, configuration);
    } else if (req.method === "PATCH") {
      // Validate update data
      let validatedData;
      const basicValidation = updateConfigurationSchema.safeParse(req.body);

      if (!basicValidation.success) {
        return sendErrorResponse(res, {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          statusCode: 400,
          details: basicValidation.error.errors,
        });
      }

      // Apply specific validation based on key
      const dataWithKey = { ...req.body, key };

      if (key === "sla_timeout_minutes") {
        const result = slaTimeoutConfigSchema.safeParse(dataWithKey);
        if (!result.success) {
          return sendErrorResponse(res, {
            message: "SLA timeout validation error",
            code: "VALIDATION_ERROR",
            statusCode: 400,
            details: result.error.errors,
          });
        }
        validatedData = result.data;
      } else if (
        key === "operational_team_emails" ||
        key === "admin_notification_emails"
      ) {
        const result = emailConfigSchema.safeParse(dataWithKey);
        if (!result.success) {
          return sendErrorResponse(res, {
            message: "Email configuration validation error",
            code: "VALIDATION_ERROR",
            statusCode: 400,
            details: result.error.errors,
          });
        }
        validatedData = result.data;
      } else {
        validatedData = { ...basicValidation.data, key };
      }

      // Update configuration
      const configuration = await configurationService.setGlobalConfig(
        key,
        validatedData.value,
        validatedData.description,
        userId
      );

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, configuration);
    } else if (req.method === "DELETE") {
      // Delete configuration
      await configurationService.deleteGlobalConfig(key, userId);

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        message: "Configuration deleted successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin configuration detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
