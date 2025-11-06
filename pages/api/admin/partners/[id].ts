import type { NextApiRequest, NextApiResponse } from "next";
import { updatePartnerSchema } from "../../../../schemas/partners";
import { partnerService } from "../../../../lib/services/partnerService";
import { authService } from "../../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

/**
 * Admin Partner Detail API Handler
 * GET /api/admin/partners/[id] - Get a single partner by ID
 * PATCH /api/admin/partners/[id] - Update partner
 * DELETE /api/admin/partners/[id] - Delete partner
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
      // Check if branches should be included
      const includeBranches = req.query.include === "branches";

      // Get partner with details
      const result = await partnerService.getPartnerWithDetails(
        partnerId,
        includeBranches
      );

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, result);
    } else if (req.method === "PATCH") {
      // Validate request body
      const validatedData = updatePartnerSchema.parse(req.body);

      // Update partner
      const result = await partnerService.updatePartner(
        partnerId,
        validatedData,
        userId
      );

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, result);
    } else if (req.method === "DELETE") {
      // Delete partner (soft delete)
      await partnerService.deletePartner(partnerId, userId);

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        message: "Partner deleted successfully",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin partner detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
