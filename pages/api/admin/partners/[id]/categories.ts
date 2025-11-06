import type { NextApiRequest, NextApiResponse } from "next";
import { partnerService } from "../../../../../lib/services/partnerService";
import { authService } from "../../../../../lib/services/authService";
import { db } from "../../../../../lib/db/connection";
import { partnerCategories, categories } from "../../../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../../lib/utils/errorHandler";
import { logger } from "../../../../../lib/utils/logger";
import { z } from "zod";

/**
 * Admin Partner Categories API Handler
 * GET /api/admin/partners/[id]/categories - Get all categories for a partner
 * POST /api/admin/partners/[id]/categories - Assign a category to partner
 * DELETE /api/admin/partners/[id]/categories - Remove a category from partner
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
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

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get all categories assigned to this partner
      const partnerCategoriesResult = await db
        .select({
          id: partnerCategories.id,
          categoryId: partnerCategories.categoryId,
          categoryName: categories.name,
          categoryDescription: categories.description,
          categoryIcon: categories.iconUrl,
          createdAt: partnerCategories.createdAt,
        })
        .from(partnerCategories)
        .leftJoin(categories, eq(partnerCategories.categoryId, categories.id))
        .where(
          and(
            eq(partnerCategories.partnerId, partnerId),
            eq(partnerCategories.isActive, true),
            eq(partnerCategories.isDeleted, false)
          )
        )
        .orderBy(categories.name);

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        categories: partnerCategoriesResult,
        total: partnerCategoriesResult.length,
      });
    } else if (req.method === "POST") {
      // Assign category to partner
      const schema = z.object({
        categoryId: z.number().int().positive(),
      });

      const validatedData = schema.parse(req.body);

      await partnerService.assignPartnerCategory(
        {
          partnerId,
          categoryId: validatedData.categoryId,
        },
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

      return sendSuccessResponse(
        res,
        { message: "Category assigned successfully" },
        201
      );
    } else if (req.method === "DELETE") {
      // Remove category from partner
      const schema = z.object({
        categoryId: z.number().int().positive(),
      });

      const validatedData = schema.parse(req.body);

      // Soft delete the assignment
      await db
        .update(partnerCategories)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            eq(partnerCategories.partnerId, partnerId),
            eq(partnerCategories.categoryId, validatedData.categoryId),
            eq(partnerCategories.isActive, true),
            eq(partnerCategories.isDeleted, false)
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
        message: "Category removed successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin partner categories API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

