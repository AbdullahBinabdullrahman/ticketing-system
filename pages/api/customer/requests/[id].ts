import { NextApiRequest, NextApiResponse } from "next";
import { rateRequestSchema } from "../../../../schemas/requests";
import { requestService } from "../../../../lib/services/requestService";
import { authService } from "../../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

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

    const requestNumberOrId = req.query.id as string;

    if (req.method === "GET") {
      // Get request details by request number (or fallback to ID for backward compatibility)
      let result;

      // Check if it's a request number (starts with REQ-)
      if (requestNumberOrId.startsWith("REQ-")) {
        result = await requestService.getRequestByNumber(requestNumberOrId);
      } else {
        // Fallback to numeric ID for backward compatibility
        const requestId = parseInt(requestNumberOrId);
        if (isNaN(requestId)) {
          return sendErrorResponse(res, {
            message: "Invalid request identifier",
            code: "VALIDATION_ERROR",
            statusCode: 400,
          });
        }
        result = await requestService.getRequestWithDetails(requestId);
      }

      // Verify customer owns this request
      if (result.customerId !== userId) {
        return sendErrorResponse(res, {
          message: "Access denied",
          code: "AUTHORIZATION_ERROR",
          statusCode: 403,
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
      return sendSuccessResponse(res, result);
    } else if (req.method === "POST") {
      // Rate request - need to get the numeric ID first
      let requestId: number;

      if (requestNumberOrId.startsWith("REQ-")) {
        const request = await requestService.getRequestByNumber(
          requestNumberOrId
        );
        requestId = request.id;
      } else {
        requestId = parseInt(requestNumberOrId);
        if (isNaN(requestId)) {
          return sendErrorResponse(res, {
            message: "Invalid request identifier",
            code: "VALIDATION_ERROR",
            statusCode: 400,
          });
        }
      }

      const validatedData = rateRequestSchema.parse(req.body);
      const result = await requestService.rateRequest(
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
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Customer request detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
