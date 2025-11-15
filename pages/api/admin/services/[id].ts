import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import { db } from "../../../../lib/db/connection";
import { services, categories } from "../../../../lib/db/schema";
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
 * Admin Service Detail API Handler
 * GET /api/admin/services/[id] - Get service by ID
 * PATCH /api/admin/services/[id] - Update service
 * DELETE /api/admin/services/[id] - Delete service
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

    // Get service ID from query
    const serviceId = parseInt(req.query.id as string);
    if (isNaN(serviceId)) {
      return sendErrorResponse(res, {
        message: "Invalid service ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    if (req.method === "GET") {
      // Get service by ID with category info
      const service = await db
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
            eq(services.id, serviceId),
            eq(services.isActive, true),
            eq(services.isDeleted, false)
          )
        )
        .limit(1);

      if (service.length === 0) {
        throw new AppError(
          "Service not found",
          404,
          ErrorCodes.SERVICE_NOT_FOUND
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

      return sendSuccessResponse(res, service[0]);
    } else if (req.method === "PATCH") {
      // Update service
      const schema = z.object({
        categoryId: z.number().int().positive().optional(),
        name: z.string().min(2).max(255).optional(),
        nameAr: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        iconUrl: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);

      // If categoryId is being updated, verify it exists
      if (validatedData.categoryId) {
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
      }

      const updatedService = await db
        .update(services)
        .set({
          ...validatedData,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            eq(services.id, serviceId),
            eq(services.isActive, true),
            eq(services.isDeleted, false)
          )
        )
        .returning();

      if (updatedService.length === 0) {
        throw new AppError(
          "Service not found",
          404,
          ErrorCodes.SERVICE_NOT_FOUND
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

      return sendSuccessResponse(res, updatedService[0]);
    } else if (req.method === "DELETE") {
      // Soft delete service
      await db
        .update(services)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            eq(services.id, serviceId),
            eq(services.isActive, true),
            eq(services.isDeleted, false)
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
        message: "Service deleted successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin service detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
