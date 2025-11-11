import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import { db } from "../../../lib/db/connection";
import { partners, branches, partnerCategories, categories, users } from "../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";
import { z } from "zod";

const updateProfileSchema = z.object({
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).optional(),
});

/**
 * Partner Profile API
 * GET /api/partner/profile - Get partner details with branches and users
 * PATCH /api/partner/profile - Update partner contact info
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "PATCH") {
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

    // Get user profile to find partner ID
    const userProfile = await authService.getUserProfile(userId);
    if (userProfile.userType !== "partner" || !userProfile.partnerId) {
      return sendErrorResponse(res, {
        message: "Access denied - Partner required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    const partnerId = userProfile.partnerId;

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get partner details
      const partnerData = await db
        .select()
        .from(partners)
        .where(
          and(
            eq(partners.id, partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        )
        .limit(1);

      if (partnerData.length === 0) {
        return sendErrorResponse(res, {
          message: "Partner not found",
          code: "PARTNER_NOT_FOUND",
          statusCode: 404,
        });
      }

      const partner = partnerData[0];

      // Get all branches
      const branchesData = await db
        .select()
        .from(branches)
        .where(
          and(
            eq(branches.partnerId, partnerId),
            eq(branches.isActive, true),
            eq(branches.isDeleted, false)
          )
        );

      // Get assigned categories
      const categoriesData = await db
        .select({
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          iconUrl: categories.iconUrl,
        })
        .from(partnerCategories)
        .leftJoin(categories, eq(partnerCategories.categoryId, categories.id))
        .where(
          and(
            eq(partnerCategories.partnerId, partnerId),
            eq(partnerCategories.isActive, true),
            eq(partnerCategories.isDeleted, false)
          )
        );

      // Get partner users
      const usersData = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          userType: users.userType,
          isActive: users.isActive,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .where(
          and(
            eq(users.partnerId, partnerId),
            eq(users.isDeleted, false)
          )
        );

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        partner,
        branches: branchesData,
        categories: categoriesData,
        users: usersData,
      });
    } else if (req.method === "PATCH") {
      // Update partner profile
      const validatedData = updateProfileSchema.parse(req.body);

      await db
        .update(partners)
        .set({
          ...validatedData,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(eq(partners.id, partnerId));

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        message: "Profile updated successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Partner profile API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

