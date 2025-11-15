import { NextApiRequest, NextApiResponse } from "next";
import { registerSchema } from "../../../schemas/auth";
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
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await authService.register(validatedData);

    logger.apiResponse(
      req.method!,
      req.url!,
      201,
      0,
      undefined,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, result, 201);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Registration API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
