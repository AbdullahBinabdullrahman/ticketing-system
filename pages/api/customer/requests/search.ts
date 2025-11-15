import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../lib/db/connection";
import { requests } from "../../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authService } from "../../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

/**
 * Search Customer Request by Number
 * GET /api/customer/requests/search?number=REQ-xxxxx
 *
 * Allows customer to search for their request by request number
 */
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

    const requestNumber = req.query.number as string;

    if (!requestNumber) {
      return sendErrorResponse(res, {
        message: "Request number is required",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    // Search for request by number and customer ID
    const request = await db
      .select({
        id: requests.id,
        requestNumber: requests.requestNumber,
        customerId: requests.customerId,
      })
      .from(requests)
      .where(
        and(
          eq(requests.requestNumber, requestNumber),
          eq(requests.customerId, userId)
        )
      )
      .limit(1);

    if (request.length === 0) {
      logger.info("Request not found", { requestNumber, userId });
      return sendErrorResponse(res, {
        message: "Request not found",
        code: "NOT_FOUND",
        statusCode: 404,
      });
    }

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, {
      requestNumber: request[0].requestNumber,
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Search request API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
