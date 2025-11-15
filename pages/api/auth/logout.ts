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
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Logout user
    await authService.logout(validatedData.refreshToken);

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      undefined,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, { message: "Logged out successfully" });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Logout API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
