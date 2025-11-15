import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../../../lib/services/authService";
import { createPartnerUser } from "../../../../../../lib/services/partnerUserService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../../../lib/utils/errorHandler";
import { logger } from "../../../../../../lib/utils/logger";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  language: z.enum(["en", "ar"]).default("en"),
  sendWelcomeEmail: z.boolean().default(true),
});

/**
 * Admin API to create a partner user
 * POST /api/admin/partners/[id]/users/create
 */
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

    // Get user profile to verify admin access
    const userProfile = await authService.getUserProfile(userId);
    if (userProfile.userType !== "admin") {
      return sendErrorResponse(res, {
        message: "Access denied - Admin required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    const partnerId = parseInt(req.query.id as string);

    if (isNaN(partnerId)) {
      return sendErrorResponse(res, {
        message: "Invalid partner ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    // Validate request body
    const validatedData = createUserSchema.parse(req.body);

    // Create partner user using the service
    const result = await createPartnerUser({
      partnerId,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      language: validatedData.language,
      sendWelcomeEmail: validatedData.sendWelcomeEmail,
    });

    if (!result.success) {
      return sendErrorResponse(res, {
        message: result.error || "Failed to create partner user",
        code: "USER_CREATION_FAILED",
        statusCode: 400,
      });
    }

    logger.apiResponse(
      req.method!,
      req.url!,
      201,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(
      res,
      {
        message: "Partner user created successfully. Welcome email sent.",
        user: result.user,
        temporaryPassword: result.password, // Include for admin to see
      },
      201
    );
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Create partner user API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
