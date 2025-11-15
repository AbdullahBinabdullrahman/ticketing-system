import type { NextApiRequest, NextApiResponse } from "next";
import { requestService } from "../../../../../lib/services/requestService";
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest,
} from "../../../../../lib/middleware/authMiddleware";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../../lib/utils/errorHandler";
import { logger } from "../../../../../lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Require authentication and request_close permission
    await requireAuth(req as AuthenticatedRequest, res);
    await requirePermission(req as AuthenticatedRequest, res, "request_close");

    const userId = (req as AuthenticatedRequest).userId!;

    const requestId = parseInt(req.query.id as string);
    if (isNaN(requestId)) {
      return sendErrorResponse(res, {
        message: "Invalid request ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    // Close request
    const result = await requestService.closeRequest(requestId, userId);

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
    logger.error("Close request API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
