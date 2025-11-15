import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../../lib/services/authService";
import { db } from "../../../../../lib/db/connection";
import { users, partners } from "../../../../../lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../../lib/utils/errorHandler";
import { logger } from "../../../../../lib/utils/logger";

/**
 * Admin Partner Users API Handler
 * GET /api/admin/partners/[id]/users - Get all users for a partner
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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

    // Get partner ID from query
    const partnerId = parseInt(req.query.id as string);
    if (isNaN(partnerId)) {
      return sendErrorResponse(res, {
        message: "Invalid partner ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    // Verify partner exists
    const partnerExists = await db
      .select()
      .from(partners)
      .where(and(eq(partners.id, partnerId), eq(partners.isDeleted, false)))
      .limit(1);

    if (partnerExists.length === 0) {
      return sendErrorResponse(res, {
        message: "Partner not found",
        code: "NOT_FOUND",
        statusCode: 404,
      });
    }

    // Get all users for this partner
    const partnerUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        userType: users.userType,
        isActive: users.isActive,
        emailVerifiedAt: users.emailVerifiedAt,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        languagePreference: users.languagePreference,
      })
      .from(users)
      .where(
        and(
          eq(users.partnerId, partnerId),
          sql`${users.userType} = 'partner'::user_type_enum`,
          eq(users.isDeleted, false)
        )
      )
      .orderBy(users.createdAt);

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, {
      users: partnerUsers,
      total: partnerUsers.length,
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin partner users API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
