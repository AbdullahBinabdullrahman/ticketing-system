import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../../../lib/services/authService";
import { db } from "../../../../../lib/db/connection";
import {
  requests,
  requestStatusLog,
  users,
  customers,
  services,
  categories,
  branches,
  partners,
} from "../../../../../lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
  AppError,
  ErrorCodes,
} from "../../../../../lib/utils/errorHandler";
import { logger } from "../../../../../lib/utils/logger";
import notificationService from "../../../../../lib/services/notificationService";

/**
 * Accept Request API
 * POST /api/partner/requests/[id]/accept - Accept assigned request
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

    // Get the request
    const requestData = await db
      .select()
      .from(requests)
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

    // Check if request is in "assigned" status
    if (request.status !== "assigned") {
      return sendErrorResponse(res, {
        message: `Cannot accept request with status: ${request.status}`,
        code: "INVALID_STATUS",
        statusCode: 400,
      });
    }

    // Check if 15-minute window has expired
    if (request.assignedAt) {
      const assignedTime = new Date(request.assignedAt).getTime();
      const now = Date.now();
      const elapsed = now - assignedTime;
      const timeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

      if (elapsed > timeLimit) {
        return sendErrorResponse(res, {
          message: "Confirmation window has expired (15 minutes)",
          code: "TIME_EXPIRED",
          statusCode: 400,
        });
      }
    }

    // Update request status to "confirmed"
    await db
      .update(requests)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, request.id));

    // Log action in timeline
    await db.insert(requestStatusLog).values({
      requestId: request.id,
      status: "confirmed",
      changedById: userId,
      notes: "Partner accepted the request",
      createdAt: new Date(),
    });

    // Get full request details for email notification
    const requestDetails = await db
      .select({
        requestNumber: requests.requestNumber,
        customerName: users.name,
        customerEmail: users.email,
        partnerName: partners.name,
        partnerEmail: partners.contactEmail,
        branchName: branches.name,
        branchAddress: branches.address,
        serviceName: services.name,
        categoryName: categories.name,
      })
      .from(requests)
      .leftJoin(customers, eq(requests.customerId, customers.id))
      .leftJoin(users, eq(customers.userId, users.id))
      .leftJoin(partners, eq(requests.partnerId, partners.id))
      .leftJoin(branches, eq(requests.branchId, branches.id))
      .leftJoin(services, eq(requests.serviceId, services.id))
      .leftJoin(categories, eq(services.categoryId, categories.id))
      .where(eq(requests.id, request.id))
      .limit(1);

    if (requestDetails.length > 0) {
      const details = requestDetails[0];

      // Fetch all active admin users to notify them
      const adminUsers = await db
        .select({
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(
          and(
            sql`${users.userType} = 'admin'::user_type_enum`,
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        );

      logger.info("Fetched admin users for notification", {
        count: adminUsers.length,
        admins: adminUsers.map((a) => a.email),
      });

      // Send email notifications to each admin (fire and forget - don't wait)
      if (adminUsers.length > 0) {
        logger.info("Sending acceptance emails to admins", {
          requestId: request.id,
          adminCount: adminUsers.length,
          customerEmail: details.customerEmail,
        });

        for (const admin of adminUsers) {
          notificationService
            .sendRequestAcceptedEmail(
              {
                requestNumber: details.requestNumber || "",
                requestId: request.id,
                customerName: details.customerName || "",
                customerEmail: details.customerEmail || "",
                partnerName: details.partnerName || "",
                partnerEmail: details.partnerEmail || "",
                branchName: details.branchName || "",
                branchAddress: details.branchAddress || "",
                serviceName: details.serviceName || "",
                categoryName: details.categoryName || "",
                status: "confirmed",
              },
              admin.email || "",
              "en"
            )
            .then((result) => {
              if (result.success) {
                logger.info("Acceptance email sent successfully", {
                  requestId: request.id,
                  adminEmail: admin.email,
                });
              } else {
                logger.error("Acceptance email failed", {
                  error: result.error,
                  requestId: request.id,
                  adminEmail: admin.email,
                });
              }
            })
            .catch((error) => {
              logger.error("Failed to send acceptance notification to admin", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                requestId,
                adminEmail: admin.email,
              });
            });
        }
      } else {
        logger.warn(
          "No active admin users found to notify about request acceptance",
          {
            requestId: request.id,
          }
        );
      }
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
      message: "Request accepted successfully",
      requestId,
      status: "confirmed",
    });
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Accept request API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
