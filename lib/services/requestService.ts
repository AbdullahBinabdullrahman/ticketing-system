import { db } from "../db/connection";
import {
  requests,
  requestAssignments,
  requestStatusLog,
  notifications,
  partners,
  branches,
  branchUsers,
  categories,
  services,
  pickupOptionTypes,
  users,
  configurations,
  NewRequest,
  requestStatusEnum,
  notificationTypeEnum,
  customers,
} from "../db/schema";
import { eq, and, desc, asc, sql, count, gte, lte } from "drizzle-orm";
import { AppError, ErrorCodes } from "../utils/errorHandler";
import { logger } from "../../lib/utils/logger";
import notificationService from "./notificationService";
import { configurationService } from "./configurationService";
import type {
  CreateRequestInput,
  AssignRequestInput,
  UpdateRequestStatusInput,
  RateRequestInput,
  RequestFiltersInput,
} from "../../schemas/requests";

export interface RequestWithDetails {
  id: number;
  requestNumber: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerLat: number;
  customerLng: number;
  customerAddress: string;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  serviceId?: number;
  serviceName?: string;
  serviceNameAr?: string;
  pickupOptionId: number;
  pickupOptionName: string;
  pickupOptionNameAr: string;
  partnerId?: number;
  partnerName?: string;
  branchId?: number;
  branchName?: string;
  status: string;
  slaDeadline?: Date;
  submittedAt: Date | null;
  assignedAt?: Date | null;
  confirmedAt?: Date | null;
  rejectedAt?: Date | null;
  inProgressAt?: Date | null;
  completedAt?: Date | null;
  closedAt?: Date | null;
  rating?: number | null;
  feedback?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface RequestStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPartner: Record<string, number>;
  slaBreaches: number;
  avgCompletionTime: number;
}

export class RequestService {
  /**
   * Create a new request
   */
  async createRequest(
    data: CreateRequestInput,
    customerId: number
  ): Promise<RequestWithDetails> {
    try {
      logger.info("Creating new request", { customerId });

      // Generate request number
      const requestNumber = await this.generateRequestNumber();

      // Get category and service details
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (category.length === 0) {
        throw new AppError(
          "Category not found",
          404,
          ErrorCodes.CATEGORY_NOT_FOUND
        );
      }

      let service = null;
      if (data.serviceId) {
        const serviceResult = await db
          .select()
          .from(services)
          .where(eq(services.id, data.serviceId))
          .limit(1);
        service = serviceResult[0] || null;
      }

      // Get pickup option details
      const pickupOption = await db
        .select()
        .from(pickupOptionTypes)
        .where(eq(pickupOptionTypes.id, data.pickupOptionId))
        .limit(1);

      if (pickupOption.length === 0) {
        throw new AppError(
          "Pickup option not found",
          404,
          ErrorCodes.SERVICE_NOT_FOUND
        );
      }

      // Create request
      const newRequest = await db
        .insert(requests)
        .values({
          requestNumber,
          customerId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerLat: data.customerLat.toString(),
          customerLng: data.customerLng.toString(),
          customerAddress: data.customerAddress,
          categoryId: data.categoryId,
          serviceId: data.serviceId,
          pickupOptionId: data.pickupOptionId,
          status: "submitted",
          submittedAt: new Date(),
          createdById: customerId,
        })
        .returning();

      // Log status change
      await this.logStatusChange(
        newRequest[0].id,
        "submitted",
        customerId,
        "Request submitted"
      );

      // Create notification for admins
      await this.notifyAdmins(
        "request_submitted",
        "New Request Submitted",
        `New request ${requestNumber} has been submitted`,
        newRequest[0].id
      );

      // Send email notification to admin/operational team
      await this.sendNewRequestEmail(newRequest[0].id);

      const requestWithDetails: RequestWithDetails = {
        id: newRequest[0].id,
        requestNumber: newRequest[0].requestNumber,
        customerId: newRequest[0].customerId,
        customerName: newRequest[0].customerName,
        customerPhone: newRequest[0].customerPhone,
        customerLat: parseFloat(newRequest[0].customerLat),
        customerLng: parseFloat(newRequest[0].customerLng),
        customerAddress: newRequest[0].customerAddress,
        categoryId: newRequest[0].categoryId,
        categoryName: category[0].name,
        categoryNameAr: category[0].nameAr || "",
        serviceId: newRequest[0].serviceId || undefined,
        serviceName: service?.name,
        serviceNameAr: service?.nameAr || undefined,
        pickupOptionId: newRequest[0].pickupOptionId,
        pickupOptionName: pickupOption[0].name,
        pickupOptionNameAr: pickupOption[0].nameAr || "",
        status: newRequest[0].status || "submitted",
        slaDeadline: newRequest[0].slaDeadline || undefined,
        submittedAt: newRequest[0].submittedAt!,
        assignedAt: newRequest[0].assignedAt || undefined,
        confirmedAt: newRequest[0].confirmedAt || undefined,
        rejectedAt: newRequest[0].rejectedAt || undefined,
        inProgressAt: newRequest[0].inProgressAt || undefined,
        completedAt: newRequest[0].completedAt || undefined,
        closedAt: newRequest[0].closedAt || undefined,
        rating: newRequest[0].rating || undefined,
        feedback: newRequest[0].feedback || undefined,
        createdAt: newRequest[0].createdAt!,
        updatedAt: newRequest[0].updatedAt!,
      };

      logger.info("Request created successfully", {
        requestId: newRequest[0].id,
        requestNumber,
      });

      return requestWithDetails;
    } catch (error) {
      logger.error("Create request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        customerId,
      });
      throw error;
    }
  }

  /**
   * Assign request to partner
   */
  async assignRequest(
    requestId: number,
    data: AssignRequestInput,
    assignedByUserId: number
  ): Promise<RequestWithDetails> {
    try {
      logger.info("Assigning request", {
        requestId,
        partnerId: data.partnerId,
        branchId: data.branchId,
      });

      // Get request
      const request = await db
        .select()
        .from(requests)
        .where(eq(requests.id, requestId))
        .limit(1);

      if (request.length === 0) {
        throw new AppError(
          "Request not found",
          404,
          ErrorCodes.REQUEST_NOT_FOUND
        );
      }

      // Allow assignment/reassignment for all statuses except completed and closed
      if (["completed", "closed"].includes(request[0].status || "")) {
        throw new AppError(
          "Cannot reassign completed or closed requests",
          400,
          ErrorCodes.INVALID_STATUS_TRANSITION
        );
      }

      // Check if this is a reassignment (request already has a partner)
      const isReassignment = request[0].partnerId !== null;

      // Get partner and branch details
      const partner = await db
        .select()
        .from(partners)
        .where(eq(partners.id, data.partnerId))
        .limit(1);

      if (partner.length === 0) {
        throw new AppError(
          "Partner not found",
          404,
          ErrorCodes.PARTNER_NOT_FOUND
        );
      }

      const branch = await db
        .select()
        .from(branches)
        .where(
          and(
            eq(branches.id, data.branchId),
            eq(branches.partnerId, data.partnerId)
          )
        )
        .limit(1);

      if (branch.length === 0) {
        throw new AppError(
          "Branch not found",
          404,
          ErrorCodes.BRANCH_NOT_FOUND
        );
      }

      // Get SLA timeout configuration
      const slaTimeout = await this.getSlaTimeout(data.partnerId);
      const slaDeadline = new Date(Date.now() + slaTimeout * 60 * 1000);

      // Update request
      const updatedRequest = await db
        .update(requests)
        .set({
          partnerId: data.partnerId,
          branchId: data.branchId,
          assignedByUserId,
          assignedAt: new Date(),
          status: "assigned",
          slaDeadline,
          updatedAt: new Date(),
        })
        .where(eq(requests.id, requestId))
        .returning();
      console.log("updatedRequest", updatedRequest);

      // If this is a reassignment, mark previous assignments as inactive
      if (isReassignment) {
        await db
          .update(requestAssignments)
          .set({ isActive: false })
          .where(
            and(
              eq(requestAssignments.requestId, requestId),
              eq(requestAssignments.isActive, true)
            )
          );
      }

      // Create assignment record
      await db.insert(requestAssignments).values({
        requestId,
        partnerId: data.partnerId,
        branchId: data.branchId,
        assignedByUserId,
        assignedAt: new Date(),
        response: "pending",
        isActive: true,
      });

      // Log status change
      const logMessage = isReassignment
        ? `Reassigned to ${partner[0].name} - ${branch[0].name}`
        : `Assigned to ${partner[0].name} - ${branch[0].name}`;

      await this.logStatusChange(
        requestId,
        "assigned",
        assignedByUserId,
        logMessage
      );

      // Notify customer
      const customerMessage = isReassignment
        ? `Your request has been reassigned to ${partner[0].name}`
        : `Your request has been assigned to ${partner[0].name}`;

      await this.notifyUser(
        request[0].customerId,
        "request_assigned",
        isReassignment ? "Request Reassigned" : "Request Assigned",
        customerMessage,
        requestId
      );

      // Notify partner users
      const partnerMessage = isReassignment
        ? `Request reassigned to your branch`
        : `New request assigned to your branch`;

      await this.notifyPartnerBranchUsers(
        data.branchId,
        "request_assigned",
        isReassignment ? "Request Reassigned" : "New Request Assigned",
        partnerMessage,
        requestId
      );

      // Send email notification to partner
      await this.sendAssignmentEmail(requestId, partner[0], branch[0]);

      // Get updated request with details
      const requestWithDetails = await this.getRequestWithDetails(requestId);

      logger.info("Request assigned successfully", {
        requestId,
        partnerId: data.partnerId,
        branchId: data.branchId,
      });

      return requestWithDetails;
    } catch (error) {
      logger.error("Assign request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  /**
   * Update request status (partner actions)
   */
  async updateRequestStatus(
    requestId: number,
    data: UpdateRequestStatusInput,
    userId: number
  ): Promise<RequestWithDetails> {
    try {
      logger.info("Updating request status", {
        requestId,
        status: data.status,
        userId,
      });

      // Get request
      const request = await db
        .select()
        .from(requests)
        .where(eq(requests.id, requestId))
        .limit(1);

      if (request.length === 0) {
        throw new AppError(
          "Request not found",
          404,
          ErrorCodes.REQUEST_NOT_FOUND
        );
      }

      // Validate status transition
      const validTransitions = this.getValidStatusTransitions(
        request[0].status || "unassigned"
      );
      if (!validTransitions.includes(data.status)) {
        throw new AppError(
          `Invalid status transition from ${request[0].status} to ${data.status}`,
          400,
          ErrorCodes.INVALID_STATUS_TRANSITION
        );
      }

      // Validate rejection reason
      if (data.status === "rejected" && !data.rejectionReason) {
        throw new AppError(
          "Rejection reason is required when rejecting a request",
          400,
          ErrorCodes.VALIDATION_ERROR
        );
      }

      // Update request
      const updateData: Partial<NewRequest> = {
        status: data.status,
        updatedAt: new Date(),
        updatedById: userId,
      };

      // Set specific timestamps based on status
      switch (data.status) {
        case "confirmed":
          updateData.confirmedAt = new Date();
          break;
        case "rejected":
          updateData.rejectedAt = new Date();
          updateData.status = "unassigned"; // Rejected requests become unassigned
          break;
        case "in_progress":
          updateData.inProgressAt = new Date();
          break;
        case "completed":
          updateData.completedAt = new Date();
          break;
      }

      await db
        .update(requests)
        .set(updateData)
        .where(eq(requests.id, requestId))
        .returning();

      // Update assignment record if confirmed or rejected
      if (data.status === "confirmed" || data.status === "rejected") {
        await db
          .update(requestAssignments)
          .set({
            respondedAt: new Date(),
            response: data.status === "confirmed" ? "confirmed" : "rejected",
            rejectionReason: data.rejectionReason,
          })
          .where(
            and(
              eq(requestAssignments.requestId, requestId),
              sql`${requestAssignments.response} = 'pending'::assignment_response_enum`
            )
          );
      }

      // Log status change
      await this.logStatusChange(requestId, data.status, userId, data.notes);

      // Send notifications
      if (data.status === "confirmed") {
        await this.notifyUser(
          request[0].customerId,
          "request_confirmed",
          "Request Confirmed",
          "Your request has been confirmed by the partner",
          requestId
        );
        await this.notifyAdmins(
          "request_confirmed",
          "Request Confirmed",
          `Request ${request[0].requestNumber} has been confirmed`,
          requestId
        );

        // Send email notifications to customer and admin team
        await this.sendRequestAcceptedEmail(requestId);
      } else if (data.status === "rejected") {
        await this.notifyUser(
          request[0].customerId,
          "request_rejected",
          "Request Rejected",
          "Your request has been rejected. We will find an alternative partner.",
          requestId
        );
        await this.notifyAdmins(
          "request_rejected",
          "Request Rejected - Needs Reassignment",
          `Request ${request[0].requestNumber} has been rejected and needs reassignment`,
          requestId
        );

        // Send email notification to admin team about rejection
        await this.sendRequestRejectedEmail(requestId, data.rejectionReason);
      } else if (data.status === "in_progress") {
        await this.notifyUser(
          request[0].customerId,
          "request_in_progress",
          "Service In Progress",
          "The partner has started working on your request",
          requestId
        );

        // Send email notification to customer for in_progress status
        await this.sendStatusChangeEmail(requestId, "in_progress", data.notes);
      } else if (data.status === "completed") {
        await this.notifyUser(
          request[0].customerId,
          "request_completed",
          "Service Completed",
          "Your service has been completed. Please rate your experience.",
          requestId
        );
        await this.notifyAdmins(
          "request_completed",
          "Request Completed - Verify with Customer",
          `Request ${request[0].requestNumber} has been completed and needs verification`,
          requestId
        );

        // Send email notification to customer and admins for completed status
        await this.sendStatusChangeEmail(requestId, "completed", data.notes);
      }

      // Get updated request with details
      const requestWithDetails = await this.getRequestWithDetails(requestId);

      logger.info("Request status updated successfully", {
        requestId,
        status: data.status,
        userId,
      });

      return requestWithDetails;
    } catch (error) {
      logger.error("Update request status failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  /**
   * Rate request
   */
  async rateRequest(
    requestId: number,
    data: RateRequestInput,
    customerId: number
  ): Promise<RequestWithDetails> {
    try {
      logger.info("Rating request", {
        requestId,
        rating: data.rating,
        customerId,
      });

      // Get request
      const request = await db
        .select()
        .from(requests)
        .where(
          and(eq(requests.id, requestId), eq(requests.customerId, customerId))
        )
        .limit(1);

      if (request.length === 0) {
        throw new AppError(
          "Request not found",
          404,
          ErrorCodes.REQUEST_NOT_FOUND
        );
      }

      if (request[0].status !== "completed") {
        throw new AppError(
          "Request must be completed before rating",
          400,
          ErrorCodes.INVALID_STATUS_TRANSITION
        );
      }

      // Update request with rating
      await db
        .update(requests)
        .set({
          rating: data.rating,
          feedback: data.feedback,
          ratedAt: new Date(),
          updatedAt: new Date(),
          updatedById: customerId,
        })
        .where(eq(requests.id, requestId))
        .returning();

      // Log status change
      await this.logStatusChange(
        requestId,
        "rated",
        customerId,
        `Rated ${data.rating} stars`
      );

      // Get updated request with details
      const requestWithDetails = await this.getRequestWithDetails(requestId);

      logger.info("Request rated successfully", {
        requestId,
        rating: data.rating,
        customerId,
      });

      return requestWithDetails;
    } catch (error) {
      logger.error("Rate request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  /**
   * Close request (admin action)
   */
  async closeRequest(
    requestId: number,
    closedByUserId: number
  ): Promise<RequestWithDetails> {
    try {
      logger.info("Closing request", { requestId, closedByUserId });

      // Get request
      const request = await db
        .select()
        .from(requests)
        .where(eq(requests.id, requestId))
        .limit(1);

      if (request.length === 0) {
        throw new AppError(
          "Request not found",
          404,
          ErrorCodes.REQUEST_NOT_FOUND
        );
      }

      if (request[0].status !== "completed") {
        throw new AppError(
          "Request must be completed before closing",
          400,
          ErrorCodes.INVALID_STATUS_TRANSITION
        );
      }

      // Update request
      await db
        .update(requests)
        .set({
          status: "closed",
          closedAt: new Date(),
          closedByUserId,
          updatedAt: new Date(),
          updatedById: closedByUserId,
        })
        .where(eq(requests.id, requestId))
        .returning();

      // Log status change
      await this.logStatusChange(
        requestId,
        "closed",
        closedByUserId,
        "Request closed after customer verification"
      );

      // Notify customer
      await this.notifyUser(
        request[0].customerId,
        "request_closed",
        "Request Closed",
        "Your request has been closed. Thank you for using our service!",
        requestId
      );

      // Notify partner
      if (request[0].partnerId) {
        await this.notifyPartnerBranchUsers(
          request[0].branchId!,
          "request_closed",
          "Request Closed",
          `Request ${request[0].requestNumber} has been closed successfully`,
          requestId
        );
      }

      // Get updated request with details
      const requestWithDetails = await this.getRequestWithDetails(requestId);

      logger.info("Request closed successfully", { requestId, closedByUserId });

      return requestWithDetails;
    } catch (error) {
      logger.error("Close request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  /**
   * Get requests with filters
   */
  async getRequests(
    filters: RequestFiltersInput,
    userId?: number,
    userType?: string
  ): Promise<{ requests: RequestWithDetails[]; total: number }> {
    try {
      logger.info("Getting requests", { filters, userId, userType });

      // Build where conditions
      const whereConditions = [
        eq(requests.isActive, true),
        eq(requests.isDeleted, false),
      ];

      // Apply user-specific filters
      if (userType === "customer" && userId) {
        whereConditions.push(eq(requests.customerId, userId));
      } else if (userType === "partner" && userId) {
        // Get user's partner ID to filter requests
        const user = await db
          .select({ partnerId: users.partnerId })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length > 0 && user[0].partnerId) {
          // Show all requests for the partner's company
          whereConditions.push(eq(requests.partnerId, user[0].partnerId));
        }
      }

      // Apply filters
      if (filters.status) {
        whereConditions.push(eq(requests.status, filters.status));
      }
      if (filters.categoryId) {
        whereConditions.push(eq(requests.categoryId, filters.categoryId));
      }
      if (filters.partnerId) {
        whereConditions.push(eq(requests.partnerId, filters.partnerId));
      }
      if (filters.branchId) {
        whereConditions.push(eq(requests.branchId, filters.branchId));
      }
      if (filters.dateFrom) {
        whereConditions.push(
          gte(requests.submittedAt, new Date(filters.dateFrom))
        );
      }
      if (filters.dateTo) {
        whereConditions.push(
          lte(requests.submittedAt, new Date(filters.dateTo))
        );
      }

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(requests)
        .where(and(...whereConditions));

      const total = totalResult[0]?.count || 0;

      // Get requests with details
      const requestsWithDetails = await db
        .select({
          id: requests.id,
          requestNumber: requests.requestNumber,
          customerId: requests.customerId,
          customerName: requests.customerName,
          customerPhone: requests.customerPhone,
          customerLat: requests.customerLat,
          customerLng: requests.customerLng,
          customerAddress: requests.customerAddress,
          categoryId: requests.categoryId,
          categoryName: categories.name,
          categoryNameAr: categories.nameAr,
          serviceId: requests.serviceId,
          serviceName: services.name,
          serviceNameAr: services.nameAr,
          pickupOptionId: requests.pickupOptionId,
          pickupOptionName: pickupOptionTypes.name,
          pickupOptionNameAr: pickupOptionTypes.nameAr,
          partnerId: requests.partnerId,
          partnerName: partners.name,
          branchId: requests.branchId,
          branchName: branches.name,
          status: requests.status,
          slaDeadline: requests.slaDeadline,
          submittedAt: requests.submittedAt,
          assignedAt: requests.assignedAt,
          confirmedAt: requests.confirmedAt,
          rejectedAt: requests.rejectedAt,
          inProgressAt: requests.inProgressAt,
          completedAt: requests.completedAt,
          closedAt: requests.closedAt,
          rating: requests.rating,
          feedback: requests.feedback,
          createdAt: requests.createdAt,
          updatedAt: requests.updatedAt,
        })
        .from(requests)
        .leftJoin(categories, eq(requests.categoryId, categories.id))
        .leftJoin(services, eq(requests.serviceId, services.id))
        .leftJoin(
          pickupOptionTypes,
          eq(requests.pickupOptionId, pickupOptionTypes.id)
        )
        .leftJoin(partners, eq(requests.partnerId, partners.id))
        .leftJoin(branches, eq(requests.branchId, branches.id))
        .where(and(...whereConditions))
        .orderBy(
          filters.sortOrder === "asc"
            ? asc(requests[filters.sortBy])
            : desc(requests[filters.sortBy])
        )
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);

      const result: RequestWithDetails[] = requestsWithDetails.map((req) => ({
        id: req.id,
        requestNumber: req.requestNumber,
        customerId: req.customerId,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        customerLat: parseFloat(req.customerLat),
        customerLng: parseFloat(req.customerLng),
        customerAddress: req.customerAddress,
        categoryId: req.categoryId,
        categoryName: req.categoryName || "",
        categoryNameAr: req.categoryNameAr || "",
        serviceId: req.serviceId || undefined,
        serviceName: req.serviceName || undefined,
        serviceNameAr: req.serviceNameAr || undefined,
        pickupOptionId: req.pickupOptionId,
        pickupOptionName: req.pickupOptionName || "",
        pickupOptionNameAr: req.pickupOptionNameAr || "",
        partnerId: req.partnerId || undefined,
        partnerName: req.partnerName || undefined,
        branchId: req.branchId || undefined,
        branchName: req.branchName || undefined,
        status: req.status || "submitted",
        slaDeadline: req.slaDeadline || undefined,
        submittedAt: req.submittedAt,
        assignedAt: req.assignedAt || undefined,
        confirmedAt: req.confirmedAt || undefined,
        rejectedAt: req.rejectedAt || undefined,
        inProgressAt: req.inProgressAt || undefined,
        completedAt: req.completedAt || undefined,
        closedAt: req.closedAt || undefined,
        rating: req.rating || undefined,
        feedback: req.feedback || undefined,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      }));

      logger.info("Requests retrieved successfully", {
        count: result.length,
        total,
        filters,
      });

      return { requests: result, total };
    } catch (error) {
      logger.error("Get requests failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        filters,
      });
      throw error;
    }
  }

  /**
   * Get request with details by ID
   */
  async getRequestWithDetails(requestId: number): Promise<RequestWithDetails> {
    try {
      const result = await db
        .select({
          id: requests.id,
          requestNumber: requests.requestNumber,
          customerId: requests.customerId,
          customerName: requests.customerName,
          customerPhone: requests.customerPhone,
          customerLat: requests.customerLat,
          customerLng: requests.customerLng,
          customerAddress: requests.customerAddress,
          categoryId: requests.categoryId,
          categoryName: categories.name,
          categoryNameAr: categories.nameAr,
          serviceId: requests.serviceId,
          serviceName: services.name,
          serviceNameAr: services.nameAr,
          pickupOptionId: requests.pickupOptionId,
          pickupOptionName: pickupOptionTypes.name,
          pickupOptionNameAr: pickupOptionTypes.nameAr,
          partnerId: requests.partnerId,
          partnerName: partners.name,
          branchId: requests.branchId,
          branchName: branches.name,
          status: requests.status,
          slaDeadline: requests.slaDeadline,
          submittedAt: requests.submittedAt,
          assignedAt: requests.assignedAt,
          confirmedAt: requests.confirmedAt,
          rejectedAt: requests.rejectedAt,
          inProgressAt: requests.inProgressAt,
          completedAt: requests.completedAt,
          closedAt: requests.closedAt,
          rating: requests.rating,
          feedback: requests.feedback,
          createdAt: requests.createdAt,
          updatedAt: requests.updatedAt,
        })
        .from(requests)
        .leftJoin(categories, eq(requests.categoryId, categories.id))
        .leftJoin(services, eq(requests.serviceId, services.id))
        .leftJoin(
          pickupOptionTypes,
          eq(requests.pickupOptionId, pickupOptionTypes.id)
        )
        .leftJoin(partners, eq(requests.partnerId, partners.id))
        .leftJoin(branches, eq(requests.branchId, branches.id))
        .where(
          and(
            eq(requests.id, requestId),
            eq(requests.isActive, true),
            eq(requests.isDeleted, false)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new AppError(
          "Request not found",
          404,
          ErrorCodes.REQUEST_NOT_FOUND
        );
      }

      const req = result[0];
      return {
        id: req.id,
        requestNumber: req.requestNumber,
        customerId: req.customerId,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        customerLat: parseFloat(req.customerLat),
        customerLng: parseFloat(req.customerLng),
        customerAddress: req.customerAddress,
        categoryId: req.categoryId,
        categoryName: req.categoryName || "",
        categoryNameAr: req.categoryNameAr || "",
        serviceId: req.serviceId || undefined,
        serviceName: req.serviceName || undefined,
        serviceNameAr: req.serviceNameAr || undefined,
        pickupOptionId: req.pickupOptionId,
        pickupOptionName: req.pickupOptionName || "",
        pickupOptionNameAr: req.pickupOptionNameAr || "",
        partnerId: req.partnerId || undefined,
        partnerName: req.partnerName || undefined,
        branchId: req.branchId || undefined,
        branchName: req.branchName || undefined,
        status: req.status || "unassigned",
        slaDeadline: req.slaDeadline || undefined,
        submittedAt: req.submittedAt,
        assignedAt: req.assignedAt || undefined,
        confirmedAt: req.confirmedAt || undefined,
        rejectedAt: req.rejectedAt || undefined,
        inProgressAt: req.inProgressAt || undefined,
        completedAt: req.completedAt || undefined,
        closedAt: req.closedAt || undefined,
        rating: req.rating || undefined,
        feedback: req.feedback || undefined,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      };
    } catch (error) {
      logger.error("Get request with details failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  /**
   * Get request with details by request number
   */
  async getRequestByNumber(requestNumber: string): Promise<RequestWithDetails> {
    try {
      const result = await db
        .select({
          id: requests.id,
          requestNumber: requests.requestNumber,
          customerId: requests.customerId,
          customerName: requests.customerName,
          customerPhone: requests.customerPhone,
          customerLat: requests.customerLat,
          customerLng: requests.customerLng,
          customerAddress: requests.customerAddress,
          categoryId: requests.categoryId,
          categoryName: categories.name,
          categoryNameAr: categories.nameAr,
          serviceId: requests.serviceId,
          serviceName: services.name,
          serviceNameAr: services.nameAr,
          pickupOptionId: requests.pickupOptionId,
          pickupOptionName: pickupOptionTypes.name,
          pickupOptionNameAr: pickupOptionTypes.nameAr,
          partnerId: requests.partnerId,
          partnerName: partners.name,
          branchId: requests.branchId,
          branchName: branches.name,
          status: requests.status,
          slaDeadline: requests.slaDeadline,
          submittedAt: requests.submittedAt,
          assignedAt: requests.assignedAt,
          confirmedAt: requests.confirmedAt,
          rejectedAt: requests.rejectedAt,
          inProgressAt: requests.inProgressAt,
          completedAt: requests.completedAt,
          closedAt: requests.closedAt,
          rating: requests.rating,
          feedback: requests.feedback,
          createdAt: requests.createdAt,
          updatedAt: requests.updatedAt,
        })
        .from(requests)
        .leftJoin(categories, eq(requests.categoryId, categories.id))
        .leftJoin(services, eq(requests.serviceId, services.id))
        .leftJoin(
          pickupOptionTypes,
          eq(requests.pickupOptionId, pickupOptionTypes.id)
        )
        .leftJoin(partners, eq(requests.partnerId, partners.id))
        .leftJoin(branches, eq(requests.branchId, branches.id))
        .where(
          and(
            eq(requests.requestNumber, requestNumber),
            eq(requests.isActive, true),
            eq(requests.isDeleted, false)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new AppError(
          "Request not found",
          404,
          ErrorCodes.REQUEST_NOT_FOUND
        );
      }

      const req = result[0];
      return {
        id: req.id,
        requestNumber: req.requestNumber,
        customerId: req.customerId,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        customerLat: parseFloat(req.customerLat),
        customerLng: parseFloat(req.customerLng),
        customerAddress: req.customerAddress,
        categoryId: req.categoryId,
        categoryName: req.categoryName || "",
        categoryNameAr: req.categoryNameAr || "",
        serviceId: req.serviceId || undefined,
        serviceName: req.serviceName || undefined,
        serviceNameAr: req.serviceNameAr || undefined,
        pickupOptionId: req.pickupOptionId,
        pickupOptionName: req.pickupOptionName || "",
        pickupOptionNameAr: req.pickupOptionNameAr || "",
        partnerId: req.partnerId || undefined,
        partnerName: req.partnerName || undefined,
        branchId: req.branchId || undefined,
        branchName: req.branchName || undefined,
        status: req.status || "unassigned",
        slaDeadline: req.slaDeadline || undefined,
        submittedAt: req.submittedAt,
        assignedAt: req.assignedAt || undefined,
        confirmedAt: req.confirmedAt || undefined,
        rejectedAt: req.rejectedAt || undefined,
        inProgressAt: req.inProgressAt || undefined,
        completedAt: req.completedAt || undefined,
        closedAt: req.closedAt || undefined,
        rating: req.rating || undefined,
        feedback: req.feedback || undefined,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      };
    } catch (error) {
      logger.error("Get request by number failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestNumber,
      });
      throw error;
    }
  }

  /**
   * Get request timeline
   */
  async getRequestTimeline(requestId: number) {
    try {
      const timelineEvents = await db
        .select({
          id: requestStatusLog.id,
          status: requestStatusLog.status,
          changedByName: users.name,
          notes: requestStatusLog.notes,
          timestamp: requestStatusLog.timestamp,
        })
        .from(requestStatusLog)
        .leftJoin(users, eq(requestStatusLog.changedById, users.id))
        .where(eq(requestStatusLog.requestId, requestId))
        .orderBy(asc(requestStatusLog.timestamp));

      return timelineEvents;
    } catch (error) {
      logger.error("Get request timeline failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  /**
   * Get unassigned requests
   */
  async getUnassignedRequests(): Promise<RequestWithDetails[]> {
    try {
      const result = await this.getRequests({
        status: "unassigned",
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      return result.requests;
    } catch (error) {
      logger.error("Get unassigned requests failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get request statistics
   */
  async getRequestStats(): Promise<RequestStats> {
    try {
      // This would implement statistics calculation
      // For now, returning a basic structure
      return {
        total: 0,
        byStatus: {},
        byCategory: {},
        byPartner: {},
        slaBreaches: 0,
        avgCompletionTime: 0,
      };
    } catch (error) {
      logger.error("Get request stats failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  // Helper methods
  private async generateRequestNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // Get count of requests today
    const startOfDay = new Date(year, today.getMonth(), today.getDate());
    const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1);

    const countResult: { count: number }[] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(
        and(
          gte(requests.createdAt, startOfDay),
          lte(requests.createdAt, endOfDay)
        )
      );

    const count = (countResult[0]?.count || 0) + 1;
    return `REQ-${year}${month}${day}-${String(count).padStart(4, "0")}`;
  }

  private async getSlaTimeout(partnerId?: number): Promise<number> {
    try {
      // Try to get partner-specific config first (future feature)
      if (partnerId) {
        const partnerConfig = await db
          .select()
          .from(configurations)
          .where(
            and(
              sql`${configurations.scope} = 'partner'::config_scope_enum`,
              eq(configurations.partnerId, partnerId),
              eq(configurations.key, "sla_timeout_minutes"),
              eq(configurations.isActive, true),
              eq(configurations.isDeleted, false)
            )
          )
          .limit(1);

        if (partnerConfig.length > 0) {
          const timeout = parseInt(partnerConfig[0].value, 10);
          if (!isNaN(timeout) && timeout > 0) {
            return timeout;
          }
        }
      }

      // Use configuration service for global config
      const { configurationService } = await import("./configurationService");
      return await configurationService.getSlaTimeout();
    } catch (error) {
      logger.error("Get SLA timeout failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        partnerId,
      });
      return 15; // Default fallback
    }
  }

  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      submitted: ["assigned"],
      assigned: ["confirmed", "rejected"],
      confirmed: ["in_progress"], // Partner can start work
      in_progress: ["completed", "confirmed"], // Can go back to confirmed or forward to completed
      completed: ["in_progress", "closed"], // Can go back to in_progress or close
      rejected: ["assigned"],
      unassigned: ["assigned"],
      closed: [], // Closed is final
    };
    return transitions[currentStatus] || [];
  }

  private async logStatusChange(
    requestId: number,
    status: string,
    userId: number,
    notes?: string
  ): Promise<void> {
    await db.insert(requestStatusLog).values({
      requestId,
      status: status as (typeof requestStatusEnum.enumValues)[number],
      changedById: userId,
      notes,
    });
  }

  private async notifyUser(
    userId: number,
    type: string,
    title: string,
    body: string,
    requestId?: number
  ): Promise<void> {
    await db.insert(notifications).values({
      userId,
      type: type as (typeof notificationTypeEnum.enumValues)[number],
      title,
      body,
      requestId,
    });
  }

  private async notifyAdmins(
    type: string,
    title: string,
    body: string,
    requestId?: number
  ): Promise<void> {
    // Get all admin users
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          sql`${users.userType} = 'admin'::user_type_enum`,
          eq(users.isActive, true),
          eq(users.isDeleted, false)
        )
      );

    for (const admin of admins) {
      await this.notifyUser(admin.id, type, title, body, requestId);
    }
  }

  private async notifyPartnerBranchUsers(
    branchId: number,
    type: string,
    title: string,
    body: string,
    requestId?: number
  ): Promise<void> {
    // Get all users assigned to this branch from the branchUsers junction table
    const branchUsersList = await db
      .select({
        userId: branchUsers.userId,
      })
      .from(branchUsers)
      .where(
        and(
          eq(branchUsers.branchId, branchId),
          eq(branchUsers.isActive, true),
          eq(branchUsers.isDeleted, false)
        )
      );

    // Notify each user assigned to this branch
    for (const branchUser of branchUsersList) {
      await this.notifyUser(branchUser.userId, type, title, body, requestId);
    }
  }

  /**
   * Send email notification for status change
   */
  private async sendStatusChangeEmail(
    requestId: number,
    newStatus: string,
    notes?: string
  ): Promise<void> {
    try {
      // Get full request details for email
      const requestDetails = await db
        .select({
          requestNumber: requests.requestNumber,
          customerName: users.name,
          customerEmail: users.email,
          customerLanguage: users.languagePreference,
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
        .where(eq(requests.id, requestId))
        .limit(1);

      if (requestDetails.length === 0) {
        logger.warn("Request not found for email notification", { requestId });
        return;
      }

      const details = requestDetails[0];

      // Send email to customer
      if (details.customerEmail) {
        // Get admin email for notification (use first admin from SLA recipients)
        const adminEmails =
          await configurationService.getSlaNotificationRecipients();
        const adminEmail = adminEmails[0] || "admin@system.com";

        await notificationService.sendStatusChangeEmail(
          {
            requestNumber: details.requestNumber || "",
            requestId,
            customerName: details.customerName || "",
            customerEmail: details.customerEmail,
            partnerName: details.partnerName || "",
            partnerEmail: details.partnerEmail || "",
            branchName: details.branchName || "",
            branchAddress: details.branchAddress || "",
            serviceName: details.serviceName || "",
            categoryName: details.categoryName || "",
            status: newStatus,
            notes,
          },
          newStatus, // Pass status as separate parameter
          adminEmail,
          (details.customerLanguage as "en" | "ar") || "en"
        );

        logger.info("Status change email sent to customer", {
          requestId,
          status: newStatus,
          email: details.customerEmail,
        });
      }

      // For in_progress and completed statuses, also send email to admin/operational team
      if (newStatus === "in_progress" || newStatus === "completed") {
        const adminEmails =
          await configurationService.getSlaNotificationRecipients();

        for (const adminEmail of adminEmails) {
          await notificationService.sendStatusChangeEmail(
            {
              requestNumber: details.requestNumber || "",
              requestId,
              customerName: details.customerName || "",
              customerEmail: details.customerEmail || "",
              partnerName: details.partnerName || "",
              partnerEmail: details.partnerEmail || "",
              branchName: details.branchName || "",
              branchAddress: details.branchAddress || "",
              serviceName: details.serviceName || "",
              categoryName: details.categoryName || "",
              status: newStatus,
              notes,
            },
            newStatus, // Pass status as separate parameter
            adminEmail,
            (details.customerLanguage as "en" | "ar") || "en"
          );
        }

        logger.info("Status change email sent to admin team", {
          requestId,
          status: newStatus,
          recipients: adminEmails.length,
        });
      }
    } catch (error) {
      logger.error("Failed to send status change email", {
        error,
        requestId,
        status: newStatus,
      });
      // Don't throw error - email failures shouldn't break the status update
    }
  }

  /**
   * Send email notification when a request is assigned to a partner
   */
  private async sendAssignmentEmail(
    requestId: number,
    partner: { id: number; name: string; contactEmail?: string | null },
    branch: { id: number; name: string; address?: string | null }
  ): Promise<void> {
    try {
      // Get full request details for email
      const requestDetails = await db
        .select({
          requestNumber: requests.requestNumber,
          customerName: requests.customerName,
          customerPhone: requests.customerPhone,
          customerAddress: requests.customerAddress,
          customerEmail: users.email,
          customerLanguage: users.languagePreference,
          serviceName: services.name,
          categoryName: categories.name,
        })
        .from(requests)
        .leftJoin(customers, eq(requests.customerId, customers.id))
        .leftJoin(users, eq(customers.userId, users.id))
        .leftJoin(services, eq(requests.serviceId, services.id))
        .leftJoin(categories, eq(requests.categoryId, categories.id))
        .where(eq(requests.id, requestId))
        .limit(1);

      if (requestDetails.length === 0) {
        logger.warn("Request not found for assignment email", { requestId });
        return;
      }

      const details = requestDetails[0];

      // If partner doesn't have a contact email, try to get branch users' emails
      const emailRecipients: string[] = [];

      if (partner.contactEmail) {
        emailRecipients.push(partner.contactEmail);
      }

      // Get branch users' emails
      const branchUserEmails = await db
        .select({
          email: users.email,
          languagePreference: users.languagePreference,
        })
        .from(branchUsers)
        .leftJoin(users, eq(branchUsers.userId, users.id))
        .where(
          and(
            eq(branchUsers.branchId, branch.id),
            eq(branchUsers.isActive, true),
            eq(branchUsers.isDeleted, false)
          )
        );

      // Add branch users' emails
      for (const branchUser of branchUserEmails) {
        if (branchUser.email && !emailRecipients.includes(branchUser.email)) {
          emailRecipients.push(branchUser.email);
        }
      }

      if (emailRecipients.length === 0) {
        logger.warn("No email recipients found for partner assignment", {
          requestId,
          partnerId: partner.id,
          branchId: branch.id,
        });
        return;
      }

      // Prepare notification data
      const notificationData = {
        requestNumber: details.requestNumber || "",
        requestId,
        customerName: details.customerName || "",
        customerEmail: details.customerEmail || "",
        partnerName: partner.name,
        partnerEmail: emailRecipients[0], // Primary email
        branchName: branch.name,
        branchAddress: branch.address || "",
        serviceName: details.serviceName || "",
        categoryName: details.categoryName || "",
        status: "assigned",
      };

      // Send email to all recipients
      for (const email of emailRecipients) {
        try {
          // Determine language preference (default to English)
          const userLanguage =
            branchUserEmails.find((u) => u.email === email)
              ?.languagePreference || "en";
          const language = (userLanguage === "ar" ? "ar" : "en") as "en" | "ar";

          const result = await notificationService.sendRequestAssignedEmail(
            { ...notificationData, partnerEmail: email },
            language
          );

          if (!result.success) {
            logger.error("Failed to send assignment email to recipient", {
              error: result.error,
              recipient: email,
              requestId,
            });
          }
        } catch (emailError) {
          logger.error("Failed to send assignment email to recipient", {
            error: emailError,
            recipient: email,
            requestId,
          });
        }
      }

      logger.info("Assignment emails sent to partner", {
        requestId,
        partnerId: partner.id,
        branchId: branch.id,
        recipients: emailRecipients.length,
      });
    } catch (error) {
      logger.error("Failed to send assignment emails", {
        error,
        requestId,
        partnerId: partner.id,
      });
      // Don't throw error - email failures shouldn't break the assignment
    }
  }

  /**
   * Send email notification when a partner accepts a request
   */
  private async sendRequestAcceptedEmail(requestId: number): Promise<void> {
    try {
      // Get full request details for email
      const requestDetails = await db
        .select({
          requestNumber: requests.requestNumber,
          customerName: requests.customerName,
          customerEmail: users.email,
          customerLanguage: users.languagePreference,
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
        .leftJoin(categories, eq(requests.categoryId, categories.id))
        .where(eq(requests.id, requestId))
        .limit(1);

      if (requestDetails.length === 0) {
        logger.warn("Request not found for acceptance email", { requestId });
        return;
      }

      const details = requestDetails[0];

      // Prepare notification data
      const notificationData = {
        requestNumber: details.requestNumber || "",
        requestId,
        customerName: details.customerName || "",
        customerEmail: details.customerEmail || "",
        partnerName: details.partnerName || "",
        partnerEmail: details.partnerEmail || "",
        branchName: details.branchName || "",
        branchAddress: details.branchAddress || "",
        serviceName: details.serviceName || "",
        categoryName: details.categoryName || "",
        status: "confirmed",
      };

      // Get admin/operational team emails
      const adminEmails =
        await configurationService.getSlaNotificationRecipients();

      if (adminEmails.length === 0) {
        logger.warn("No admin emails configured for acceptance notifications");
      }

      // Send emails to admin team
      for (const adminEmail of adminEmails) {
        try {
          const result = await notificationService.sendRequestAcceptedEmail(
            notificationData,
            adminEmail,
            "en" // Admin emails default to English
          );

          if (!result.success) {
            logger.error("Failed to send acceptance email to admin", {
              error: result.error,
              recipient: adminEmail,
              requestId,
            });
          }
        } catch (emailError) {
          logger.error("Failed to send acceptance email to admin", {
            error: emailError,
            recipient: adminEmail,
            requestId,
          });
        }
      }

      logger.info("Request acceptance emails sent", {
        requestId,
        recipients: adminEmails.length,
      });
    } catch (error) {
      logger.error("Failed to send request acceptance emails", {
        error,
        requestId,
      });
      // Don't throw error - email failures shouldn't break the status update
    }
  }

  /**
   * Send email notification when a partner rejects a request
   */
  private async sendRequestRejectedEmail(
    requestId: number,
    rejectionReason?: string
  ): Promise<void> {
    try {
      // Get full request details for email
      const requestDetails = await db
        .select({
          requestNumber: requests.requestNumber,
          customerName: requests.customerName,
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
        .leftJoin(categories, eq(requests.categoryId, categories.id))
        .where(eq(requests.id, requestId))
        .limit(1);

      if (requestDetails.length === 0) {
        logger.warn("Request not found for rejection email", { requestId });
        return;
      }

      const details = requestDetails[0];

      // Prepare notification data
      const notificationData = {
        requestNumber: details.requestNumber || "",
        requestId,
        customerName: details.customerName || "",
        customerEmail: details.customerEmail || "",
        partnerName: details.partnerName || "",
        partnerEmail: details.partnerEmail || "",
        branchName: details.branchName || "",
        branchAddress: details.branchAddress || "",
        serviceName: details.serviceName || "",
        categoryName: details.categoryName || "",
        status: "rejected",
        rejectionReason,
      };

      // Get admin/operational team emails
      const adminEmails =
        await configurationService.getSlaNotificationRecipients();

      if (adminEmails.length === 0) {
        logger.warn("No admin emails configured for rejection notifications");
        return;
      }

      // Send emails to admin team
      for (const adminEmail of adminEmails) {
        try {
          const result = await notificationService.sendRequestRejectedEmail(
            notificationData,
            adminEmail,
            "en" // Admin emails default to English
          );

          if (!result.success) {
            logger.error("Failed to send rejection email to admin", {
              error: result.error,
              recipient: adminEmail,
              requestId,
            });
          }
        } catch (emailError) {
          logger.error("Failed to send rejection email to admin", {
            error: emailError,
            recipient: adminEmail,
            requestId,
          });
        }
      }

      logger.info("Request rejection emails sent to admin team", {
        requestId,
        recipients: adminEmails.length,
        rejectionReason,
      });
    } catch (error) {
      logger.error("Failed to send request rejection emails", {
        error,
        requestId,
      });
      // Don't throw error - email failures shouldn't break the status update
    }
  }

  /**
   * Send email notification when a new request is created
   */
  private async sendNewRequestEmail(requestId: number): Promise<void> {
    try {
      // Get full request details for email
      const requestDetails = await db
        .select({
          requestNumber: requests.requestNumber,
          customerName: requests.customerName,
          customerPhone: requests.customerPhone,
          customerAddress: requests.customerAddress,
          serviceName: services.name,
          categoryName: categories.name,
          pickupOptionName: pickupOptionTypes.name,
        })
        .from(requests)
        .leftJoin(services, eq(requests.serviceId, services.id))
        .leftJoin(categories, eq(services.categoryId, categories.id))
        .leftJoin(
          pickupOptionTypes,
          eq(requests.pickupOptionId, pickupOptionTypes.id)
        )
        .where(eq(requests.id, requestId))
        .limit(1);

      if (requestDetails.length === 0) {
        logger.warn("Request not found for new request email", { requestId });
        return;
      }

      const details = requestDetails[0];

      // Get admin and operational team emails
      const recipients =
        await configurationService.getSlaNotificationRecipients();

      if (recipients.length === 0) {
        logger.warn(
          "No admin/operational team emails configured for new request notifications"
        );
        return;
      }

      // Prepare email content
      const content = {
        en: {
          subject: `New Request Submitted - ${details.requestNumber}`,
          message: `A new service request has been submitted and is waiting for assignment.

Request Number: ${details.requestNumber}
Customer Name: ${details.customerName}
Customer Phone: ${details.customerPhone}
Service: ${details.serviceName}
Category: ${details.categoryName}
Pickup Option: ${details.pickupOptionName}
Location: ${details.customerAddress}

Please log in to the admin portal to assign this request to a partner.`,
        },
        ar: {
          subject: `طلب جديد تم تقديمه - ${details.requestNumber}`,
          message: `تم تقديم طلب خدمة جديد وهو في انتظار التعيين.

رقم الطلب: ${details.requestNumber}
اسم العميل: ${details.customerName}
هاتف العميل: ${details.customerPhone}
الخدمة: ${details.serviceName}
الفئة: ${details.categoryName}
خيار الاستلام: ${details.pickupOptionName}
الموقع: ${details.customerAddress}

يرجى تسجيل الدخول إلى لوحة تحكم المسؤول لتعيين هذا الطلب لشريك.`,
        },
      };

      // Send email to all recipients
      for (const email of recipients) {
        try {
          // Use sendNotificationEmail instead of the interface method
          const result = await notificationService.sendNotificationEmail(
            email,
            content.en.subject,
            content.en.message,
            "en"
          );

          if (!result.success) {
            logger.error("Failed to send new request email to recipient", {
              error: result.error,
              recipient: email,
              requestId,
            });
          }
        } catch (emailError) {
          logger.error("Failed to send new request email to recipient", {
            error: emailError,
            recipient: email,
            requestId,
          });
        }
      }

      logger.info("New request emails sent to admin/operational team", {
        requestId,
        recipients: recipients.length,
      });
    } catch (error) {
      logger.error("Failed to send new request emails", {
        error,
        requestId,
      });
      // Don't throw error - email failures shouldn't break request creation
    }
  }
}

export const requestService = new RequestService();
