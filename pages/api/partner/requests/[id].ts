import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../lib/services/authService";
import { db } from "../../../../lib/db/connection";
import {
  requests,
  customers,
  users,
  services,
  categories,
  branches,
  partners,
  requestStatusLog,
} from "../../../../lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
  AppError,
  ErrorCodes,
} from "../../../../lib/utils/errorHandler";
import { logger } from "../../../../lib/utils/logger";

/**
 * Partner Request Detail API
 * GET /api/partner/requests/[id] - Get single request with full details
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
    const idParam = req.query.id as string;

    // Check if it's a request number (e.g., REQ-20251105-0011) or numeric ID
    const isRequestNumber = idParam.startsWith("REQ-");
    const requestId = isRequestNumber ? null : parseInt(idParam);

    if (!isRequestNumber && isNaN(requestId!)) {
      return sendErrorResponse(res, {
        message: "Invalid request ID",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      });
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers["x-request-id"] as string
    );

    // Build where conditions based on ID type
    const whereConditions = [
      eq(requests.partnerId, partnerId),
      eq(requests.isDeleted, false),
    ];

    if (isRequestNumber) {
      whereConditions.push(eq(requests.requestNumber, idParam));
    } else {
      whereConditions.push(eq(requests.id, requestId!));
    }

    // Get request with all details
    const requestData = await db
      .select({
        // Request fields
        id: requests.id,
        requestNumber: requests.requestNumber,
        status: requests.status,
        pickupOptionId: requests.pickupOptionId,
        customerLat: requests.customerLat,
        customerLng: requests.customerLng,
        customerAddress: requests.customerAddress,
        rating: requests.rating,
        feedback: requests.feedback,
        createdAt: requests.createdAt,
        assignedAt: requests.assignedAt,
        confirmedAt: requests.confirmedAt,
        completedAt: requests.completedAt,
        // Customer fields
        customerId: customers.id,
        customerName: users.name,
        customerEmail: users.email,
        customerPhone: customers.phone,
        // Service fields
        serviceId: services.id,
        serviceName: services.name,
        serviceNameAr: services.nameAr,
        // Category fields
        categoryId: categories.id,
        categoryName: categories.name,
        categoryNameAr: categories.nameAr,
        // Branch fields
        branchId: branches.id,
        branchName: branches.name,
        branchAddress: branches.address,
        branchLat: branches.lat,
        branchLng: branches.lng,
        branchPhone: branches.phone,
        // Partner fields
        partnerName: partners.name,
        partnerLogoUrl: partners.logoUrl,
      })
      .from(requests)
      .leftJoin(users, eq(requests.customerId, users.id))
      .leftJoin(customers, eq(users.id, customers.userId))
      .leftJoin(services, eq(requests.serviceId, services.id))
      .leftJoin(categories, eq(services.categoryId, categories.id))
      .leftJoin(branches, eq(requests.branchId, branches.id))
      .leftJoin(partners, eq(requests.partnerId, partners.id))
      .where(and(...whereConditions))
      .limit(1);

    if (requestData.length === 0) {
      throw new AppError(
        "Request not found or access denied",
        404,
        ErrorCodes.REQUEST_NOT_FOUND
      );
    }

    const request = requestData[0];

    // Get timeline (use request.id from the result, not requestId which could be null)
    const timeline = await db
      .select({
        id: requestStatusLog.id,
        status: requestStatusLog.status,
        changedById: requestStatusLog.changedById,
        changedByName: users.name,
        notes: requestStatusLog.notes,
        timestamp: requestStatusLog.timestamp,
      })
      .from(requestStatusLog)
      .leftJoin(users, eq(requestStatusLog.changedById, users.id))
      .where(eq(requestStatusLog.requestId, request.id))
      .orderBy(desc(requestStatusLog.timestamp));

    // Calculate time remaining for confirmation if status is "assigned"
    let timeRemainingMinutes: number | null = null;
    if (request.status === "assigned" && request.assignedAt) {
      const assignedTime = new Date(request.assignedAt).getTime();
      const now = Date.now();
      const elapsed = now - assignedTime;
      const timeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
      const remaining = timeLimit - elapsed;
      timeRemainingMinutes = Math.max(0, Math.floor(remaining / 60000));
    }

    logger.apiResponse(
      req.method!,
      req.url!,
      200,
      0,
      userId,
      req.headers["x-request-id"] as string
    );

    return sendSuccessResponse(res, {
      request,
      timeline,
      timeRemainingMinutes,
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Partner request detail API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
