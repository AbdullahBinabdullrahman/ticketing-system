import type { NextApiRequest, NextApiResponse } from "next";
import { updateRequestStatusSchema } from "../../../../../schemas/requests";
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
import { db } from "../../../../../lib/db/connection";
import { requests } from "../../../../../lib/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Require authentication and request_update permission
    await requireAuth(req as AuthenticatedRequest, res);
    await requirePermission(req as AuthenticatedRequest, res, "request_update");

    const userId = (req as AuthenticatedRequest).userId!;

    const idParam = req.query.id as string;
    
    // Support both numeric ID and request number (e.g., REQ-20251106-0011)
    let requestId: number;
    
    if (idParam.startsWith("REQ-")) {
      // It's a request number, fetch the actual ID
      const requestResult = await db
        .select({ id: requests.id })
        .from(requests)
        .where(eq(requests.requestNumber, idParam))
        .limit(1);

      if (requestResult.length === 0) {
        return sendErrorResponse(res, {
          message: "Request not found",
          code: "NOT_FOUND",
          statusCode: 404,
        });
      }

      requestId = requestResult[0].id;
    } else {
      // It's a numeric ID
      requestId = parseInt(idParam);
      if (isNaN(requestId)) {
        return sendErrorResponse(res, {
          message: "Invalid request ID",
          code: "VALIDATION_ERROR",
          statusCode: 400,
        });
      }
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    // Validate request body
    const validatedData = updateRequestStatusSchema.parse(req.body);

    // Update request status
    const result = await requestService.updateRequestStatus(
      requestId,
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
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Update request status API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
