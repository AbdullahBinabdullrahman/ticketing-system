import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { authService } from "../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";

/**
 * Reset Password API Handler
 * POST /api/auth/reset-password - Reset password using token
 */

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);

    logger.apiRequest(
      req.method!,
      req.url!,
      null,
      req.headers["x-request-id"] as string
    );

    // Reset password
    await authService.resetPassword(
      validatedData.token,
      validatedData.password
    );

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      null,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, {
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Reset password API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

