import { NextApiRequest, NextApiResponse } from "next";
import {
  createRequestSchema,
  requestFiltersSchema,
} from "../../../schemas/requests";
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

    if (req.method === "POST") {
      // Create new request
      const validatedData = createRequestSchema.parse(req.body);
      const result = await requestService.createRequest(validatedData, userId);

      logger.apiResponse(
        req.method!,
        req.url!,
        201,
        0,
        userId,
        req.headers["x-request-id"] as string
      );
      return sendSuccessResponse(res, result, 201);
    } else if (req.method === "GET") {
      // Get customer's requests
      const filters = requestFiltersSchema.parse(req.query);
      const result = await requestService.getRequests(
        filters,
        userId,
        "customer"
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
    logger.error("Customer requests API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
