/**
 * Admin Users API
 * GET - List all users (admin, operational, partner, and customer)
 * POST - Create a new admin or operational user
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import {
  createAdminUser,
  getAdminUsers,
  getAdminRoles,
} from "../../../lib/services/adminUserService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";
import { z } from "zod";

const createAdminUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  roleId: z.number().int().positive("Role ID is required"),
  language: z.enum(["en", "ar"]).optional(),
  sendWelcomeEmail: z.boolean().optional(),
});

/**
 * Admin Users API Handler
 */
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

    // Verify admin access
    const userProfile = await authService.getUserProfile(userId);
    if (userProfile.userType !== "admin") {
      return sendErrorResponse(res, {
        message: "Access denied - Admin required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    // Handle GET request - List all admin users
    if (req.method === "GET") {
      const users = await getAdminUsers();
      const roles = await getAdminRoles();

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, { users, roles }, 200);
    }

    // Handle POST request - Create new admin user
    if (req.method === "POST") {
      const validatedData = createAdminUserSchema.parse(req.body);

      const result = await createAdminUser({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        roleId: validatedData.roleId,
        language: validatedData.language || "en",
        sendWelcomeEmail: validatedData.sendWelcomeEmail !== false,
      });

      if (!result.success) {
        return sendErrorResponse(res, {
          message: result.error || "Failed to create user",
          code: "USER_CREATION_ERROR",
          statusCode: 400,
        });
      }

      logger.info("Admin user created", {
        userId: result.user?.id,
        createdBy: userId,
        email: validatedData.email,
      });

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
          user: result.user,
          temporaryPassword: result.temporaryPassword,
        },
        201
      );
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin users API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

