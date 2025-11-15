import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { authService } from "../../../../lib/services/authService";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../../../../lib/middleware/authMiddleware";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

/**
 * Partner Change Password API Handler
 * PUT /api/partner/profile/change-password - Change password using current password
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await requireAuth(req as AuthenticatedRequest, res);

    // Validate request body
    const validatedData = changePasswordSchema.parse(req.body);

    // Change password
    await authService.changePassword(user.id, {
      currentPassword: validatedData.currentPassword,
      newPassword: validatedData.newPassword,
    });

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      user.id,
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

export default handler;
