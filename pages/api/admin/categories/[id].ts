import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import { db } from "../../../../lib/db/connection";
import { categories } from "../../../../lib/db/schema";
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

/**
 * Admin Category Detail API Handler
 * GET /api/admin/categories/[id] - Get category by ID
 * PATCH /api/admin/categories/[id] - Update category
 * DELETE /api/admin/categories/[id] - Delete category
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

    // Get category ID from query
    const categoryId = parseInt(req.query.id as string);
    if (isNaN(categoryId)) {
      return sendErrorResponse(res, {
        message: "Invalid category ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      { userId },
      undefined,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get category by ID
      const category = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, categoryId),
            eq(categories.isActive, true),
            eq(categories.isDeleted, false)
          )
        )
        .limit(1);

      if (category.length === 0) {
        throw new AppError(
          "Category not found",
          404,
          ErrorCodes.CATEGORY_NOT_FOUND
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

      return sendSuccessResponse(res, category[0]);
    } else if (req.method === "PATCH") {
      // Update category
      const schema = z.object({
        name: z.string().min(2).max(255).optional(),
        nameAr: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        iconUrl: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);

      const updatedCategory = await db
        .update(categories)
        .set({
          ...validatedData,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            eq(categories.id, categoryId),
            eq(categories.isActive, true),
            eq(categories.isDeleted, false)
          )
        )
        .returning();

      if (updatedCategory.length === 0) {
        throw new AppError(
          "Category not found",
          404,
          ErrorCodes.CATEGORY_NOT_FOUND
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

      return sendSuccessResponse(res, updatedCategory[0]);
    } else if (req.method === "DELETE") {
      // Soft delete category
      await db
        .update(categories)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            eq(categories.id, categoryId),
            eq(categories.isActive, true),
            eq(categories.isDeleted, false)
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
        message: "Category deleted successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin category detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
