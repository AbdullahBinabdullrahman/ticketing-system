/**
 * Admin User Management API (Single User)
 * GET - Get user details
 * PUT - Update user information
 * DELETE - Soft delete user
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import {
  updateAdminUser,
  deleteAdminUser,
} from "../../../../lib/services/adminUserService";
import { db } from "../../../../lib/db/connection";
import { users, roles } from "../../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

// const updateUserSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters").optional(),
//   email: z.string().email("Invalid email address").optional(),
//   phone: z.string().optional().nullable(),
//   roleId: z.number().int().positive("Invalid role ID").optional(),
//   isActive: z.boolean().optional(),
//   languagePreference: z.enum(["en", "ar"]).optional(),
// });

/**
 * Single User API Handler
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
    const { userId: currentUserId } = await authService.verifyToken(token);

    // Verify admin access
    const userProfile = await authService.getUserProfile(currentUserId);
    if (userProfile.userType !== "admin") {
      return sendErrorResponse(res, {
        message: "Access denied - Admin required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    const { id } = req.query;
    const userId = parseInt(id as string);

    if (isNaN(userId)) {
      return sendErrorResponse(res, {
        message: "Invalid user ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      null,
      currentUserId,
      req.headers["x-request-id"] as string
    );

    // Handle GET request - Get user details
    if (req.method === "GET") {
      const user = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          roleId: users.roleId,
          roleName: roles.name,
          userType: users.userType,
          partnerId: users.partnerId,
          languagePreference: users.languagePreference,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          emailVerifiedAt: users.emailVerifiedAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
        .limit(1);

      if (user.length === 0) {
        return sendErrorResponse(res, {
          message: "User not found",
          code: "USER_NOT_FOUND",
          statusCode: 404,
        });
      }

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        currentUserId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, { user: user[0] }, 200);
    }

    // Handle PUT request - Update user
    if (req.method === "PUT") {
      const validatedData = req.body;

      const result = await updateAdminUser(userId, validatedData);

      if (!result.success) {
        return sendErrorResponse(res, {
          message: result.error || "Failed to update user",
          code: "USER_UPDATE_ERROR",
          statusCode: 400,
        });
      }

      logger.info("User updated", {
        userId,
        updatedBy: currentUserId,
        changes: validatedData,
      });

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        currentUserId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, { user: result.user }, 200);
    }

    // Handle DELETE request - Soft delete user
    if (req.method === "DELETE") {
      const result = await deleteAdminUser(userId);

      if (!result.success) {
        return sendErrorResponse(res, {
          message: result.error || "Failed to delete user",
          code: "USER_DELETE_ERROR",
          statusCode: 400,
        });
      }

      logger.info("User deleted (soft delete)", {
        userId,
        deletedBy: currentUserId,
      });

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        currentUserId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(
        res,
        { message: "User deleted successfully" },
        200
      );
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("User management API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
