import { NextApiRequest, NextApiResponse } from "next";
import { refreshTokenSchema } from "../../../schemas/auth";
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
    logger.apiRequest(
      req.method!,
      req.url!,
      undefined,
      req.headers["x-request-id"] as string
    );

    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Refresh token
    const result = await authService.refreshToken(validatedData.refreshToken);

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
    logger.error("Refresh token API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
