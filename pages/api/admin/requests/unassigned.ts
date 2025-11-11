import { NextApiRequest, NextApiResponse } from "next";
import { requestService } from "../../../lib/services/requestService";
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

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    // Get unassigned requests
    const result = await requestService.getUnassignedRequests();

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
    logger.error("Unassigned requests API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
