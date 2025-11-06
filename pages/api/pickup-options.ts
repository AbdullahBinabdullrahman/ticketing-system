import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db/connection";
import { pickupOptionTypes } from "../../lib/db/schema";
import { eq } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../lib/utils/errorHandler";
import { logger } from "../../lib/utils/logger";

/**
 * Pickup Options API
 * GET /api/pickup-options - Get all active pickup options (public endpoint)
 * 
 * This is a public endpoint accessible without authentication
 * Used by customers and mobile app to get available pickup options
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    logger.apiRequest(
      req.method!,
      req.url!,
      undefined,
      req.headers["x-request-id"] as string
    );

    // Get all active pickup options
    const options = await db
      .select({
        id: pickupOptionTypes.id,
        name: pickupOptionTypes.name,
        nameAr: pickupOptionTypes.nameAr,
        description: pickupOptionTypes.description,
        descriptionAr: pickupOptionTypes.descriptionAr,
        requiresServiceSelection: pickupOptionTypes.requiresServiceSelection,
        isActive: pickupOptionTypes.isActive,
        createdAt: pickupOptionTypes.createdAt,
        updatedAt: pickupOptionTypes.updatedAt,
      })
      .from(pickupOptionTypes)
      .where(eq(pickupOptionTypes.isActive, true))
      .orderBy(pickupOptionTypes.name);

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      undefined,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, options);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Pickup options API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}


