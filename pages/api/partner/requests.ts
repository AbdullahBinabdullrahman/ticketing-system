import type { NextApiRequest, NextApiResponse } from "next";
import { requestFiltersSchema } from "../../../schemas/requests";
import { requestService } from "../../../lib/services/requestService";
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest,
} from "../../../lib/middleware/authMiddleware";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "@/lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Require authentication and request_view permission
    await requireAuth(req as AuthenticatedRequest, res);
    await requirePermission(req as AuthenticatedRequest, res, "request_view");

    const userId = (req as AuthenticatedRequest).userId!;
    const userProfile = (req as AuthenticatedRequest).user!;

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get partner's requests
      const filters = requestFiltersSchema.parse(req.query);
      const result = await requestService.getRequests(
        filters,
        userId,
        "partner"
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
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Partner requests API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
