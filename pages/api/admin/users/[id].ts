/**
 * Admin User Detail API
 * PATCH - Update an admin user
 * DELETE - Delete (soft delete) an admin user
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import {
  updateAdminUser,
  deleteAdminUser,
} from "../../../../lib/services/adminUserService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";
import { z } from "zod";

const updateAdminUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  languagePreference: z.enum(["en", "ar"]).optional(),
});

/**
 * Admin User Detail API Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    const targetUserId = parseInt(req.query.id as string);
    if (isNaN(targetUserId)) {
      return sendErrorResponse(res, {
        message: "Invalid user ID",
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

    // Handle PATCH request - Update user
    if (req.method === "PATCH") {
      const validatedData = updateAdminUserSchema.parse(req.body);

      const result = await updateAdminUser(targetUserId, validatedData);

      if (!result.success) {
        return sendErrorResponse(res, {
          message: result.error || "Failed to update user",
          code: "USER_UPDATE_ERROR",
          statusCode: 400,
        });
      }

      logger.info("Admin user updated", {
        userId: targetUserId,
        updatedBy: userId,
      });

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, { user: result.user }, 200);
    }

    // Handle DELETE request - Soft delete user
    if (req.method === "DELETE") {
      // Prevent self-deletion
      if (targetUserId === userId) {
        return sendErrorResponse(res, {
          message: "Cannot delete your own account",
          code: "AUTHORIZATION_ERROR",
          statusCode: 403,
        });
      }

      const result = await deleteAdminUser(targetUserId);

      if (!result.success) {
        return sendErrorResponse(res, {
          message: result.error || "Failed to delete user",
          code: "USER_DELETE_ERROR",
          statusCode: 400,
        });
      }

      logger.info("Admin user deleted", {
        userId: targetUserId,
        deletedBy: userId,
      });

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, { success: true }, 200);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin user detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

