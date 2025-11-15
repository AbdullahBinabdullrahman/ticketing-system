import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import { db } from "../../../../lib/db/connection";
import { users } from "../../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
  AppError,
  ErrorCodes,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  isActive: z.boolean().optional(),
});

/**
 * Partner User Detail API
 * PATCH /api/partner/users/[id] - Update user info
 * DELETE /api/partner/users/[id] - Deactivate user (soft delete)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH" && req.method !== "DELETE") {
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
    const { userId: currentUserId } = await authService.verifyToken(token);

    // Get user profile to find partner ID
    const userProfile = await authService.getUserProfile(currentUserId);
    if (userProfile.userType !== "partner" || !userProfile.partnerId) {
      return sendErrorResponse(res, {
        message: "Access denied - Partner required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    const partnerId = userProfile.partnerId;
    const targetUserId = parseInt(req.query.id as string);

    if (isNaN(targetUserId)) {
      return sendErrorResponse(res, {
        message: "Invalid user ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    // Prevent user from modifying themselves
    if (targetUserId === currentUserId) {
      return sendErrorResponse(res, {
        message: "Cannot modify your own account through this endpoint",
        code: "INVALID_OPERATION",
        statusCode: 400,
      });
    }

    // Verify the target user belongs to this partner
    const targetUserData = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, targetUserId),
          eq(users.partnerId, partnerId),
          eq(users.isDeleted, false)
        )
      )
      .limit(1);

    if (targetUserData.length === 0) {
      throw new AppError(
        "User not found or access denied",
        404,
        ErrorCodes.USER_NOT_FOUND
      );
    }

    if (req.method === "PATCH") {
      // Update user
      const validatedData = updateUserSchema.parse(req.body);

      await db
        .update(users)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, targetUserId));

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        currentUserId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        message: "User updated successfully",
      });
    } else if (req.method === "DELETE") {
      // Soft delete user
      await db
        .update(users)
        .set({
          isActive: false,
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, targetUserId));

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        currentUserId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        message: "User deactivated successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Partner user detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
