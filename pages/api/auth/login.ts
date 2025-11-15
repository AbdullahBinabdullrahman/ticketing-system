import { NextApiRequest, NextApiResponse } from "next";

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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Validate request body
    const validatedData = req.body;

    // Get device info and IP
    const deviceInfo = req.headers["user-agent"] || "Unknown";
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "Unknown";

    // Login user
    const result = await authService.login(
      validatedData,
      deviceInfo,
      ipAddress
    );

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      undefined,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, result);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Login API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
