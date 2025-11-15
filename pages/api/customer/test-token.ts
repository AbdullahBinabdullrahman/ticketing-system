import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db/connection";
import { NewUser, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authService } from "@/lib/services/authService";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/utils/logger";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "@/lib/utils/errorHandler";

/**
 * Generate Test Customer Token
 * Creates or retrieves a test customer user and returns a valid token
 * This endpoint is for TESTING ONLY and requires a secret key
 *
 * @requires X-Test-Secret header matching JWT_SECRET
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Validate secret key from environment
    const SECRET_KEY = process.env.JWT_SECRET;
    const providedSecret = req.headers["x-test-secret"] as string;

    if (!SECRET_KEY) {
      logger.error("JWT_SECRET not configured in environment");
      return sendErrorResponse(res, {
        message: "Server configuration error",
        code: "CONFIGURATION_ERROR",
        statusCode: 500,
      });
    }

    if (!providedSecret || providedSecret !== SECRET_KEY) {
      logger.warn("Unauthorized test token request - invalid secret", {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      });
      return sendErrorResponse(res, {
        message: "Unauthorized - Invalid secret key",
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }

    const TEST_CUSTOMER_EMAIL = "test.customer@example.com";
    const TEST_CUSTOMER_PASSWORD = "TestCustomer123!";

    // Check if test customer already exists
    const existingCustomer = await db
      .select()
      .from(users)
      .where(
        and(eq(users.email, TEST_CUSTOMER_EMAIL), eq(users.isDeleted, false))
      )
      .limit(1);

    let customerId: number;

    if (existingCustomer.length === 0) {
      // Create test customer
      logger.info("Creating test customer user");

      const hashedPassword = await bcrypt.hash(TEST_CUSTOMER_PASSWORD, 12);

      const newCustomer = await db
        .insert(users)
        .values({
          name: "Test Customer",
          email: TEST_CUSTOMER_EMAIL,
          phone: "+966500000000",
          password: hashedPassword,
          userType: "customer",
          roleId: null, // Customers don't need a role
          partnerId: null,
          languagePreference: "en",
          isActive: true,
          isDeleted: false,
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as NewUser)
        .returning();

      customerId = newCustomer[0].id;
      logger.info("Test customer created", { customerId });
    } else {
      customerId = existingCustomer[0].id;
      logger.info("Using existing test customer", { customerId });
    }

    // Generate token for the customer
    if (customerId) {
      const tokens = await authService.generateTokens(customerId);

      logger.info("Test customer token generated", { customerId });

      return sendSuccessResponse(res, {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: customerId,
          name: "Test Customer",
          email: TEST_CUSTOMER_EMAIL,
          userType: "customer",
        },
        message:
          "Test customer token generated. This is for TESTING purposes only.",
      });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Failed to generate test customer token", {
      error: apiError.message,
    });
    return sendErrorResponse(res, apiError);
  }
}
