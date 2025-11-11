import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import { db } from "../../../lib/db/connection";
import { users } from "../../../lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";
import { z } from "zod";
import bcrypt from "bcryptjs";
import emailService from "../../../services/emailService";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  language: z.enum(["en", "ar"]).default("en"),
});

/**
 * Partner Users API
 * GET /api/partner/users - List all users for this partner
 * POST /api/partner/users - Create new partner user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
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

    // Get user profile to find partner ID
    const userProfile = await authService.getUserProfile(userId);
    if (userProfile.userType !== "partner" || !userProfile.partnerId) {
      return sendErrorResponse(res, {
        message: "Access denied - Partner required",
        code: "AUTHORIZATION_ERROR",
        statusCode: 403,
      });
    }

    const partnerId = userProfile.partnerId;

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    if (req.method === "GET") {
      // Get all partner users
      const usersData = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          userType: users.userType,
          isActive: users.isActive,
          otpEnabled: users.otpEnabled,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .where(
          and(
            eq(users.partnerId, partnerId),
            eq(users.isDeleted, false)
          )
        );

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        users: usersData,
        total: usersData.length,
      });
    } else if (req.method === "POST") {
      // Create new partner user
      const validatedData = createUserSchema.parse(req.body);

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, validatedData.email),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      if (existingUser.length > 0) {
        return sendErrorResponse(res, {
          message: "Email already exists",
          code: "EMAIL_EXISTS",
          statusCode: 400,
        });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create user
      const newUserData = await db
        .insert(users)
        .values({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          password: hashedPassword,
          userType: "partner",
          partnerId: partnerId,
          isActive: true,
          otpEnabled: false,
          createdAt: new Date(),
          isDeleted: false,
        })
        .returning();

      const newUser = newUserData[0];

      // Send welcome email with password
      try {
        await emailService.sendWelcomeEmail(
          validatedData.email,
          validatedData.name,
          tempPassword,
          validatedData.language
        );
      } catch (emailError) {
        logger.error("Failed to send welcome email", {
          error: emailError,
          userId: newUser.id,
        });
        // Don't fail the request if email fails
      }

      logger.apiResponse(
        req.method!,
        req.url!,
        201,
        0,
        userId,
        req.headers["x-request-id"] as string
      );

      return sendSuccessResponse(res, {
        message: "User created successfully. Welcome email sent.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          userType: newUser.userType,
          isActive: newUser.isActive,
        },
      }, 201);
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Partner users API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

