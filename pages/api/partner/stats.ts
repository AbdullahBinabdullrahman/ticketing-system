import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import { db } from "../../../lib/db/connection";
import { requests } from "../../../lib/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";

/**
 * Partner Stats API
 * GET /api/partner/stats - Get partner performance metrics
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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

    // Get total requests assigned to this partner
    const totalRequestsResult = await db
      .select({ count: count() })
      .from(requests)
      .where(
        and(eq(requests.partnerId, partnerId), eq(requests.isDeleted, false))
      );

    const totalRequests = totalRequestsResult[0]?.count || 0;

    // Get completed requests
    const completedResult = await db
      .select({ count: count() })
      .from(requests)
      .where(
        and(
          eq(requests.partnerId, partnerId),
          sql`${requests.status} = 'completed'::request_status_enum`,
          eq(requests.isDeleted, false)
        )
      );

    const completed = completedResult[0]?.count || 0;

    // Get rejected requests
    const rejectedResult = await db
      .select({ count: count() })
      .from(requests)
      .where(
        and(
          eq(requests.partnerId, partnerId),
          sql`${requests.status} = 'rejected'::request_status_enum`,
          eq(requests.isDeleted, false)
        )
      );

    const rejected = rejectedResult[0]?.count || 0;

    // Get in-progress requests
    const inProgressResult = await db
      .select({ count: count() })
      .from(requests)
      .where(
        and(
          eq(requests.partnerId, partnerId),
          sql`${requests.status} = 'in_progress'::request_status_enum`,
          eq(requests.isDeleted, false)
        )
      );

    const inProgress = inProgressResult[0]?.count || 0;

    // Get pending confirmation requests
    const pendingConfirmationResult = await db
      .select({ count: count() })
      .from(requests)
      .where(
        and(
          eq(requests.partnerId, partnerId),
          sql`${requests.status} = 'assigned'::request_status_enum`,
          eq(requests.isDeleted, false)
        )
      );

    const pendingConfirmation = pendingConfirmationResult[0]?.count || 0;

    // Calculate average handling time for completed requests
    const avgHandlingTimeResult = await db
      .select({
        avgMinutes: sql<number>`AVG(EXTRACT(EPOCH FROM (${requests.completedAt} - ${requests.confirmedAt})) / 60)`,
      })
      .from(requests)
      .where(
        and(
          eq(requests.partnerId, partnerId),
          sql`${requests.status} = 'completed'::request_status_enum`,
          eq(requests.isDeleted, false)
        )
      );

    const avgHandlingTime = Math.round(
      avgHandlingTimeResult[0]?.avgMinutes || 0
    );

    // Calculate average rating
    const avgRatingResult = await db
      .select({
        avgRating: sql<number>`AVG(${requests.rating})`,
      })
      .from(requests)
      .where(
        and(
          eq(requests.partnerId, partnerId),
          sql`${requests.status} = 'completed'::request_status_enum`,
          eq(requests.isDeleted, false)
        )
      );

    const avgRating = Number((avgRatingResult[0]?.avgRating || 0).toFixed(1));

    // Calculate completion rate
    const completionRate =
      totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0;

    // Calculate rejection rate
    const rejectionRate =
      totalRequests > 0 ? Math.round((rejected / totalRequests) * 100) : 0;

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, {
      totalRequests,
      completed,
      rejected,
      inProgress,
      pendingConfirmation,
      avgHandlingTime,
      avgRating,
      completionRate,
      rejectionRate,
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Partner stats API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
