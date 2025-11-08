import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { authService } from "../../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

/**
 * Admin/User Change Password API Handler
 * POST /api/auth/profile/change-password - Change password using current password
 */

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
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

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    // Validate request body
    const validatedData = changePasswordSchema.parse(req.body);

    // Change password
    await authService.changePassword(userId, {
      currentPassword: validatedData.currentPassword,
      newPassword: validatedData.newPassword,
    });

    logger.info("Password changed successfully", { userId });

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, {
      message: "Password changed successfully",
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Change password API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

