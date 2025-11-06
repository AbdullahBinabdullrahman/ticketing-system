import type { NextApiRequest, NextApiResponse } from "next";
import { configurationService } from "../../../lib/services/configurationService";
import { authService } from "../../../lib/services/authService";
import {
  createConfigurationSchema,
  slaTimeoutConfigSchema,
  emailConfigSchema,
} from "../../../schemas/configurations";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";

/**
 * Admin Configurations API Handler
 * GET /api/admin/configurations - Get all system configurations
 * POST /api/admin/configurations - Create or update a configuration
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
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

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get all global configurations
      const configurations = await configurationService.getAllGlobalConfigs();

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        configurations,
        total: configurations.length,
      });
    } else if (req.method === "POST") {
      // Validate based on configuration key
      let validatedData;
      
      // First, do basic validation
      const basicValidation = createConfigurationSchema.safeParse(req.body);
      if (!basicValidation.success) {
        return sendErrorResponse(res, {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          statusCode: 400,
          details: basicValidation.error.errors,
        });
      }

      // Then apply specific validation based on key
      const { key } = basicValidation.data;
      
      if (key === 'sla_timeout_minutes') {
        const result = slaTimeoutConfigSchema.safeParse(req.body);
        if (!result.success) {
          return sendErrorResponse(res, {
            message: "SLA timeout validation error",
            code: "VALIDATION_ERROR",
            statusCode: 400,
            details: result.error.errors,
          });
        }
        validatedData = result.data;
      } else if (key === 'operational_team_emails' || key === 'admin_notification_emails') {
        const result = emailConfigSchema.safeParse(req.body);
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
        validatedData = basicValidation.data;
      }

      // Create or update configuration
      const configuration = await configurationService.setGlobalConfig(
        validatedData.key,
        validatedData.value,
        validatedData.description,
        userId
      );

      logger.apiResponse(
        req.method!,
        req.url!,
        201,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, configuration, 201);
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin configurations API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

