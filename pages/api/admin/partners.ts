import type { NextApiRequest, NextApiResponse } from "next";
import {
  createPartnerSchema,
  partnerFiltersSchema,
} from "../../../schemas/partners";
import { partnerService } from "../../../lib/services/partnerService";
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest,
} from "../../../lib/middleware/authMiddleware";
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../lib/utils/errorHandler";
import { logger } from "../../../lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Require authentication and partner_manage permission
    console.time("requireAuth");
    await requireAuth(req as AuthenticatedRequest, res);
    console.timeEnd("requireAuth");
    console.time("requirePermission");
    await requirePermission(req as AuthenticatedRequest, res, "partner_manage");
    console.timeEnd("requirePermission");
    const userId = (req as AuthenticatedRequest).userId!;

    if (req.method === "GET") {
      // Get partners with filters
      // Supports optional includeBranches=true to include branch data in response
      const filters = partnerFiltersSchema.parse(req.query);
      const result = await partnerService.getPartners(filters);

      logger.apiResponse(
        req.method!,
        req.url!,
        200,
        0,
        userId,
        req.headers["x-request-id"] as string
      );
      return sendSuccessResponse(res, result);
    } else if (req.method === "POST") {
      // Create new partner
      const validatedData = createPartnerSchema.parse(req.body);
      const result = await partnerService.createPartner(validatedData, userId);

      logger.apiResponse(
        req.method!,
        req.url!,
        201,
        0,
        userId,
        req.headers["x-request-id"] as string
      );
      return sendSuccessResponse(res, result, 201);
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error("Admin partners API error", {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers["x-request-id"] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}
