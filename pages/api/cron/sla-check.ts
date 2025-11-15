/**
 * SLA Check Cron Endpoint
 *
 * This endpoint is called by an external cron job application every minute
 * to check for requests that have exceeded their 15-minute SLA deadline
 * and automatically unassign them.
 *
 * Protected by CRON_SECRET header for security.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { slaMonitorService } from "@/lib/services/slaMonitorService";
import logger from "@/lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret for security
  const cronSecret = req.headers["x-cron-secret"];
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    logger.warn("[CRON] Unauthorized SLA check attempt", {
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const startTime = Date.now();
    const count = await slaMonitorService.checkAndUnassignExpired();
    const duration = Date.now() - startTime;

    logger.info(`[CRON] SLA check completed`, {
      unassignedCount: count,
      durationMs: duration,
    });

    return res.status(200).json({
      success: true,
      unassignedCount: count,
      timestamp: new Date().toISOString(),
      durationMs: duration,
    });
  } catch (error) {
    logger.error(
      "[CRON] SLA check failed:",
      error as Record<string, unknown> | undefined
    );
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
