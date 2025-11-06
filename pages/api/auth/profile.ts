import type { NextApiRequest, NextApiResponse } from "next";
import { authService } from "../../../lib/services/authService";
import { updateProfileSchema } from "../../../schemas/auth";
import { logger } from "../../../lib/utils/logger";
import { errorHandler } from "../../../lib/utils/errorHandler";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);

    // Verify token and get user ID
    const { userId } = await authService.verifyToken(token);

    // Validate request body
    const validatedData = updateProfileSchema.parse(req.body);

    // Update profile
    const user = await authService.updateProfile(userId, validatedData);

    logger.info("Profile updated successfully", { userId });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}
