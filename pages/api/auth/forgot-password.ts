import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { authService } from "../../../lib/services/authService";
import emailService from "../../../services/emailService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";

const resolveApplicationUrl = (req: NextApiRequest): string => {
  const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (req.headers.origin) {
    return req.headers.origin;
  }

  const forwardedProto = (req.headers["x-forwarded-proto"] as string)?.split(
    ","
  )[0];
  const forwardedHost = req.headers["x-forwarded-host"] as string | undefined;
  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  if (req.headers.host) {
    const socket = req.socket as typeof req.socket & { encrypted?: boolean };
    const protocol = forwardedProto || (socket.encrypted ? "https" : "http");
    return `${protocol}://${req.headers.host}`;
  }

  return defaultUrl;
};

/**
 * Forgot Password API Handler
 * POST /api/auth/forgot-password - Request password reset link
 */

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  language: z.enum(["en", "ar"]).default("en"),
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
    const validatedData = forgotPasswordSchema.parse(req.body);

    // Generate reset token (returns empty string if user doesn't exist)
    const resetToken = await authService.generatePasswordResetToken(
      validatedData.email
    );

    // Only send email if token was generated (user exists)
    if (resetToken) {
      // Generate reset URL
      const resetUrl = `${resolveApplicationUrl(
        req
      )}/partner/reset-password?token=${resetToken}`;

      // Send password reset email (fire and forget - don't block response)
      emailService
        .sendPasswordResetEmail(
          validatedData.email,
          resetToken,
          resetUrl,
          validatedData.language
        )
        .then(() => {
          logger.info("Password reset email sent", {
            email: validatedData.email,
          });
        })
        .catch((error) => {
          logger.error("Failed to send password reset email", {
            error,
            email: validatedData.email,
          });
        });
    }

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      undefined,
      req.headers["x-request-id"] as string
    );

    // Always return success to prevent email enumeration attacks
    return sendSuccessResponse(res, {
      message:
        "If an account exists with this email, you will receive a password reset link",
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Forgot password API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
