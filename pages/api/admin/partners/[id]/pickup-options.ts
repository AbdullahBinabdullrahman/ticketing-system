import type { NextApiRequest, NextApiResponse } from "next";
import { partnerService } from "../../../../../lib/services/partnerService";
import { authService } from "../../../../../lib/services/authService";
import { db } from "../../../../../lib/db/connection";
import { partnerPickupOptions, pickupOptionTypes } from "../../../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../../lib/utils/errorHandler";
import { logger } from "../../../../../lib/utils/logger";
import { z } from "zod";

/**
 * Admin Partner Pickup Options API Handler
 * GET /api/admin/partners/[id]/pickup-options - Get all pickup options for a partner
 * POST /api/admin/partners/[id]/pickup-options - Assign a pickup option to partner
 * DELETE /api/admin/partners/[id]/pickup-options - Remove a pickup option from partner
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
      // Get all pickup options assigned to this partner
      const partnerPickupOptionsResult = await db
        .select({
          id: partnerPickupOptions.id,
          pickupOptionTypeId: partnerPickupOptions.pickupOptionTypeId,
          pickupOptionName: pickupOptionTypes.name,
          pickupOptionNameAr: pickupOptionTypes.nameAr,
          pickupOptionDescription: pickupOptionTypes.description,
          pickupOptionDescriptionAr: pickupOptionTypes.descriptionAr,
          requiresServiceSelection: pickupOptionTypes.requiresServiceSelection,
          createdAt: partnerPickupOptions.createdAt,
        })
        .from(partnerPickupOptions)
        .leftJoin(
          pickupOptionTypes,
          eq(partnerPickupOptions.pickupOptionTypeId, pickupOptionTypes.id)
        )
        .where(
          and(
            eq(partnerPickupOptions.partnerId, partnerId),
            eq(partnerPickupOptions.isActive, true),
            eq(partnerPickupOptions.isDeleted, false)
          )
        )
        .orderBy(pickupOptionTypes.name);

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        pickupOptions: partnerPickupOptionsResult,
        total: partnerPickupOptionsResult.length,
      });
    } else if (req.method === "POST") {
      // Assign pickup option to partner
      const schema = z.object({
        pickupOptionTypeId: z.number().int().positive(),
      });

      const validatedData = schema.parse(req.body);

      await partnerService.assignPartnerPickupOption(
        {
          partnerId,
          pickupOptionTypeId: validatedData.pickupOptionTypeId,
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
        { message: "Pickup option assigned successfully" },
        201
      );
    } else if (req.method === "DELETE") {
      // Remove pickup option from partner
      const schema = z.object({
        pickupOptionTypeId: z.number().int().positive(),
      });

      const validatedData = schema.parse(req.body);

      // Soft delete the assignment
      await db
        .update(partnerPickupOptions)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            eq(partnerPickupOptions.partnerId, partnerId),
            eq(partnerPickupOptions.pickupOptionTypeId, validatedData.pickupOptionTypeId),
            eq(partnerPickupOptions.isActive, true),
            eq(partnerPickupOptions.isDeleted, false)
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
        message: "Pickup option removed successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin partner pickup options API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

