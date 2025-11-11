import { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../lib/utils/errorHandler";
import { logger } from "@/lib/utils/logger";

import { requests, partners, branches } from "@/lib/db/schema";
import { eq, and, sql, gte, desc, count } from "drizzle-orm";
import { db } from "@/lib/db/connection";

/**
 * Dashboard stats API handler
 * GET /api/admin/dashboard/stats
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
      { userId },
      undefined,
      req.headers["x-request-id"] as string
    );

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      totalRequestsResult,
      pendingRequestsResult,
      unassignedRequestsResult,
      completedRequestsResult,
      todayCompletedResult,
      slaBreachesResult,
      totalPartnersResult,
      activePartnersResult,
      activeBranchesResult,
      averageRatingResult,
      last30DaysRequestsResult,
      last60DaysRequestsResult,
      recentRequests,
      topPartners,
      requestsByStatus,
      requestsByCategory,
    ] = await Promise.all([
      // Total requests
      db.select({ count: count() }).from(requests),

      // Pending requests (assigned, confirmed, in_progress)
      db
        .select({ count: count() })
        .from(requests)
        .where(
          sql`${requests.status} IN ('assigned', 'confirmed', 'in_progress')`
        ),

      // Unassigned requests
      db
        .select({ count: count() })
        .from(requests)
        .where(sql`${requests.status} IN ('submitted', 'unassigned')`),

      // Completed requests
      db
        .select({ count: count() })
        .from(requests)
        .where(sql`${requests.status} IN ('completed', 'closed')`),

      // Today's completed requests
      db
        .select({ count: count() })
        .from(requests)
        .where(
          and(
            sql`${requests.status} IN ('completed', 'closed')`,
            gte(requests.completedAt, todayStart)
          )
        ),

      // SLA breaches (requests where response time > 15 minutes)
      db
        .select({ count: count() })
        .from(requests)
        .where(
          sql`${requests.assignedAt} IS NOT NULL 
          AND ${requests.submittedAt} IS NOT NULL 
          AND EXTRACT(EPOCH FROM (${requests.assignedAt} - ${requests.submittedAt}))/60 > 15`
        ),

      // Total partners
      db.select({ count: count() }).from(partners),

      // Active partners (status = 'active')
      db
        .select({ count: count() })
        .from(partners)
        .where(sql`${partners.status} = 'active'::partner_status_enum`),

      // Active branches
      db
        .select({ count: count() })
        .from(branches)
        .where(eq(branches.isActive, true)),

      // Average rating
      db
        .select({
          avg: sql<number>`COALESCE(AVG(${requests.rating}), 0)`,
        })
        .from(requests)
        .where(sql`${requests.rating} IS NOT NULL`),

      // Requests in last 30 days
      db
        .select({ count: count() })
        .from(requests)
        .where(gte(requests.createdAt, last30Days)),

      // Requests in previous 30 days (30-60 days ago, for comparison)
      db
        .select({ count: count() })
        .from(requests)
        .where(
          and(
            gte(requests.createdAt, last60Days),
            sql`${requests.createdAt} < ${last30Days.toISOString()}`
          )
        ),

      // Recent requests (last 10)
      db
        .select({
          id: requests.id,
          customerName: requests.customerName,
          customerPhone: requests.customerPhone,
          status: requests.status,
          createdAt: requests.createdAt,
          categoryId: requests.categoryId,
        })
        .from(requests)
        .orderBy(desc(requests.createdAt))
        .limit(10),

      // Top partners by completed requests
      db
        .select({
          partnerId: requests.partnerId,
          partnerName: partners.name,
          completedCount: count(),
          avgRating: sql<number>`COALESCE(AVG(${requests.rating}), 0)`,
        })
        .from(requests)
        .innerJoin(partners, eq(requests.partnerId, partners.id))
        .where(
          sql`${requests.status} IN ('completed', 'closed') AND ${requests.partnerId} IS NOT NULL`
        )
        .groupBy(requests.partnerId, partners.name)
        .orderBy(desc(count()))
        .limit(5),

      // Requests by status distribution
      db
        .select({
          status: requests.status,
          count: count(),
        })
        .from(requests)
        .groupBy(requests.status),

      // Requests by category
      db
        .select({
          categoryId: requests.categoryId,
          count: count(),
        })
        .from(requests)
        .where(sql`${requests.categoryId} IS NOT NULL`)
        .groupBy(requests.categoryId)
        .limit(5),
    ]);

    // Calculate metrics
    const totalRequests = totalRequestsResult[0]?.count || 0;
    const pendingRequests = pendingRequestsResult[0]?.count || 0;
    const unassignedRequests = unassignedRequestsResult[0]?.count || 0;
    const completedRequests = completedRequestsResult[0]?.count || 0;
    const todayCompleted = todayCompletedResult[0]?.count || 0;
    const slaBreaches = slaBreachesResult[0]?.count || 0;
    const totalPartners = totalPartnersResult[0]?.count || 0;
    const activePartners = activePartnersResult[0]?.count || 0;
    const activeBranches = activeBranchesResult[0]?.count || 0;
    const averageRating = Number(averageRatingResult[0]?.avg || 0);
    const last30DaysCount = last30DaysRequestsResult[0]?.count || 0;
    const last60DaysCount = last60DaysRequestsResult[0]?.count || 1; // Avoid division by zero

    // Calculate completion rate
    const completionRate =
      totalRequests > 0
        ? ((completedRequests / totalRequests) * 100).toFixed(1)
        : 0;

    // Calculate growth percentages
    const requestsGrowth =
      last60DaysCount > 0
        ? (
            ((last30DaysCount - last60DaysCount) / last60DaysCount) *
            100
          ).toFixed(1)
        : 0;

    // Build response
    const dashboardStats = {
      // Overview stats
      totalRequests,
      pendingRequests,
      unassignedRequests,
      completedRequests,
      todayCompleted,
      slaBreaches,

      // Resource stats
      totalPartners,
      activePartners,
      activeBranches,

      // Performance metrics
      averageRating: Number(averageRating.toFixed(1)),
      completionRate: Number(completionRate),

      // Growth metrics
      requestsGrowth: Number(requestsGrowth),
      last30DaysCount,

      // Recent activity
      recentRequests: recentRequests.map((req) => ({
        id: req.id,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        status: req.status,
        createdAt: req.createdAt,
        timeAgo: getTimeAgo(req.createdAt),
      })),

      // Top partners
      topPartners: topPartners.map((partner) => ({
        partnerId: partner.partnerId,
        name: partner.partnerName,
        completedRequests: partner.completedCount,
        rating: partner?.avgRating
          ? Number(Number(partner.avgRating).toFixed(1))
          : 0,
        status: getRatingStatus(Number(partner.avgRating || 0)),
      })),

      // Status distribution
      requestsByStatus: requestsByStatus.map((item) => ({
        status: item.status,
        count: item.count,
        percentage:
          totalRequests > 0
            ? ((item.count / totalRequests) * 100).toFixed(1)
            : 0,
      })),

      // Category distribution
      requestsByCategory: requestsByCategory.map((item) => ({
        categoryId: item.categoryId,
        count: item.count,
        percentage:
          totalRequests > 0
            ? ((item.count / totalRequests) * 100).toFixed(1)
            : 0,
      })),
    };

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, dashboardStats);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Dashboard stats API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}

/**
 * Helper function to get time ago string
 */
function getTimeAgo(date: Date | null): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

/**
 * Helper function to get rating status
 */
function getRatingStatus(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Good";
  if (rating >= 3.5) return "Average";
  return "Poor";
}
