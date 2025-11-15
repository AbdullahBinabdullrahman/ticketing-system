/**
 * SLA Monitor Service
 *
 * Handles automatic unassignment of requests that exceed the configurable
 * SLA deadline without partner response.
 *
 * This service is called by an external cron job every minute.
 */

import { db } from "../db/connection";
import {
  requests,
  requestAssignments,
  requestStatusLog,
  partners,
} from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";
import notificationService from "./notificationService";
import { configurationService } from "./configurationService";
import logger from "@/lib/utils/logger";

const SYSTEM_USER_ID = parseInt(process.env.SYSTEM_USER_ID || "1");

export class SlaMonitorService {
  /**
   * Check for expired SLA deadlines and auto-unassign requests
   *
   * @returns Number of requests that were unassigned
   */
  async checkAndUnassignExpired(): Promise<number> {
    const now = new Date();

    try {
      // Query requests with expired SLA using optimized index
      // idx_requests_sla_deadline filters WHERE status='assigned'
      const expiredRequests = await db
        .select({
          id: requests.id,
          requestNumber: requests.requestNumber,
          partnerId: requests.partnerId,
          branchId: requests.branchId,
          assignedByUserId: requests.assignedByUserId,
          assignedAt: requests.assignedAt,
          slaDeadline: requests.slaDeadline,
        })
        .from(requests)
        .where(
          and(eq(requests.status, "assigned"), lt(requests.slaDeadline, now))
        );

      if (expiredRequests.length === 0) {
        logger.debug("[SLA] No expired requests found");
        return 0;
      }

      logger.info(`[SLA] Found ${expiredRequests.length} expired requests`);

      let successCount = 0;

      for (const request of expiredRequests) {
        try {
          await this.unassignRequest(request, now);
          successCount++;
          logger.info(
            `[SLA] Successfully unassigned request ${request.requestNumber}`
          );
        } catch (error) {
          logger.error(
            `[SLA] Failed to unassign request ${request.requestNumber}:`,
            error as Record<string, unknown>
          );
        }
      }

      return successCount;
    } catch (error) {
      logger.error(
        "[SLA] Error in checkAndUnassignExpired:",
        error as Record<string, unknown>
      );
      throw error;
    }
  }

  /**
   * Unassign a single request and update all related tables
   */
  private async unassignRequest(
    request: {
      id: number;
      requestNumber: string;
      partnerId: number | null;
      branchId: number | null;
      assignedByUserId: number | null;
      assignedAt: Date | string | null;
      slaDeadline: Date | string | null;
    },
    now: Date
  ): Promise<void> {
    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // 1. Update request status to unassigned
      await tx
        .update(requests)
        .set({
          status: "unassigned",
          partnerId: null,
          branchId: null,
          assignedAt: null,
          slaDeadline: null,
          updatedById: SYSTEM_USER_ID,
          updatedAt: now,
        })
        .where(eq(requests.id, request.id));

      // 2. Record timeout in request_assignments table
      const slaTimeout = await configurationService.getSlaTimeout();
      await tx.insert(requestAssignments).values({
        requestId: request.id,
        partnerId: request.partnerId!,
        branchId: request.branchId!,
        assignedByUserId: request.assignedByUserId!,
        assignedAt:
          typeof request.assignedAt === "string"
            ? new Date(request.assignedAt)
            : request.assignedAt!,
        respondedAt: now,
        response: "timeout",
        rejectionReason: `Auto-unassigned: No response within ${slaTimeout}-minute SLA`,
        isActive: true,
      });

      // 3. Log status change in request_status_log
      await tx.insert(requestStatusLog).values({
        requestId: request.id,
        status: "unassigned",
        changedById: SYSTEM_USER_ID,
        notes: `SLA timeout - no partner response within ${slaTimeout} minutes`,
        timestamp: now,
        createdById: SYSTEM_USER_ID,
        isActive: true,
      });
    });

    // 4. Send notification email (outside transaction)
    try {
      // Fetch partner name for notification
      let partnerName = "Unknown Partner";
      if (request.partnerId) {
        const partnerResult = await db
          .select({ name: partners.name })
          .from(partners)
          .where(eq(partners.id, request.partnerId))
          .limit(1);

        if (partnerResult.length > 0) {
          partnerName = partnerResult[0].name;
        }
      }

      // Get all notification recipients (admin + operational team)
      const recipients =
        await configurationService.getSlaNotificationRecipients();

      if (recipients.length > 0) {
        await notificationService.sendSlaTimeoutEmail({
          requestNumber: request.requestNumber,
          partnerName,
          recipients,
          slaDeadline: request.slaDeadline,
          assignedAt: request.assignedAt,
        });
      } else {
        logger.warn(
          `[SLA] No notification recipients configured for request ${request.requestNumber}`
        );
      }
    } catch (emailError) {
      // Log email errors but don't fail the entire operation
      logger.error(
        `[SLA] Failed to send timeout email for ${request.requestNumber}:`,
        emailError as Record<string, unknown>
      );
    }
  }
}

export const slaMonitorService = new SlaMonitorService();
