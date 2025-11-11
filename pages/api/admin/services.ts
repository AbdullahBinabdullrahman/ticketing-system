import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import { db } from "../../../lib/db/connection";
import { services, categories } from "../../../lib/db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";
import { z } from "zod";

/**
 * Admin Services API Handler
 * GET /api/admin/services - Get all services (optionally filtered by category)
 * POST /api/admin/services - Create a new service
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
      // Get all services with optional filters
      const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : undefined;
      const search = req.query.search as string;

      let query = db
        .select({
          id: services.id,
          categoryId: services.categoryId,
          name: services.name,
          nameAr: services.nameAr,
          description: services.description,
          descriptionAr: services.descriptionAr,
          iconUrl: services.iconUrl,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt,
          categoryName: categories.name,
          categoryNameAr: categories.nameAr,
        })
        .from(services)
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .where(
          and(
            eq(services.isActive, true),
            eq(services.isDeleted, false),
            categoryId ? eq(services.categoryId, categoryId) : undefined
          )
        )
        .$dynamic();

      if (search) {
        query = db
          .select({
            id: services.id,
            categoryId: services.categoryId,
            name: services.name,
            nameAr: services.nameAr,
            description: services.description,
            descriptionAr: services.descriptionAr,
            iconUrl: services.iconUrl,
            createdAt: services.createdAt,
            updatedAt: services.updatedAt,
            categoryName: categories.name,
            categoryNameAr: categories.nameAr,
          })
          .from(services)
          .leftJoin(categories, eq(services.categoryId, categories.id))
          .where(
            and(
              eq(services.isActive, true),
              eq(services.isDeleted, false),
              categoryId ? eq(services.categoryId, categoryId) : undefined,
              or(
                like(services.name, `%${search}%`),
                like(services.nameAr, `%${search}%`)
              )
            )
          )
          .$dynamic();
      }

      const allServices = await query.orderBy(desc(services.createdAt));

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        services: allServices,
        total: allServices.length,
      });
    } else if (req.method === "POST") {
      // Create new service
      const schema = z.object({
        categoryId: z.number().int().positive(),
        name: z.string().min(2).max(255),
        nameAr: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        iconUrl: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);

      // Verify category exists
      const category = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, validatedData.categoryId),
            eq(categories.isActive, true),
            eq(categories.isDeleted, false)
          )
        )
        .limit(1);

      if (category.length === 0) {
        return sendErrorResponse(res, {
          message: "Category not found",
          code: "VALIDATION_ERROR",
          statusCode: 400,
        });
      }

      const newService = await db
        .insert(services)
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

      return sendSuccessResponse(res, newService[0], 201);
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin services API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

