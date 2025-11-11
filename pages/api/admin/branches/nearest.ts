import { NextApiRequest, NextApiResponse } from "next";
import { partnerService } from "../../../lib/services/partnerService";
import { authService } from "../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";

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

    // Parse query parameters
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;
    const partnerId = req.query.partnerId
      ? parseInt(req.query.partnerId as string)
      : undefined;

    if (isNaN(lat) || isNaN(lng)) {
      return sendErrorResponse(res, {
        message: "Valid latitude and longitude are required",
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

    // Find nearest branch
    const result = await partnerService.findNearestBranch(
      lat,
      lng,
      categoryId,
      partnerId
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
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Find nearest branch API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
