import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import { db } from "../../../lib/db/connection";
import { categories } from "../../../lib/db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";
import { z } from "zod";

/**
 * Admin Categories API Handler
 * GET /api/admin/categories - Get all categories
 * POST /api/admin/categories - Create a new category
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
      // Get all categories with optional search
      const search = req.query.search as string;

      let query = db
        .select()
        .from(categories)
        .where(
          and(eq(categories.isActive, true), eq(categories.isDeleted, false))
        );

      if (search) {
        query = db
          .select()
          .from(categories)
          .where(
            and(
              eq(categories.isActive, true),
              eq(categories.isDeleted, false),
              or(
                like(categories.name, `%${search}%`),
                like(categories.nameAr, `%${search}%`)
              )
            )
          );
      }

      const allCategories = await query.orderBy(desc(categories.createdAt));

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        categories: allCategories,
        total: allCategories.length,
      });
    } else if (req.method === "POST") {
      // Create new category
      const schema = z.object({
        name: z.string().min(2).max(255),
        nameAr: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        iconUrl: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);

      const newCategory = await db
        .insert(categories)
        .values({
          ...validatedData,
          createdById: userId,
        })
        .returning();

      logger.apiResponse(
        req.method!,
        req.url!,
        201,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, newCategory[0], 201);
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin categories API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

