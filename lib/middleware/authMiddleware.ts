import type { NextApiRequest, NextApiResponse } from "next";
import { authService, type UserProfile } from "../services/authService";
import { db } from "../db/connection";
import { rolePermissions, permissions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError, ErrorCodes } from "../utils/errorHandler";
import { logger } from "../utils/logger";

/**
 * Extended NextApiRequest with authenticated user information
 */
export interface AuthenticatedRequest extends NextApiRequest {
  user?: UserProfile;
  userId?: number;
  roleId?: number;
}

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user info to request
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<UserProfile> {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user ID
    const { userId } = await authService.verifyToken(token);

    // Get user profile
    const user = await authService.getUserProfile(userId);

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.roleId = user.roleId;

    return user;
  } catch (error) {
    logger.error("Authentication failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.url,
    });
    throw error;
  }
}

/**
 * Middleware to require specific permission
 * Checks if user's role has the required permission
 */
export async function requirePermission(
  req: AuthenticatedRequest,
  _res: NextApiResponse,
  permissionName: string
): Promise<void> {
  try {
    // First ensure user is authenticated
    if (!req.user || !req.roleId) {
      await requireAuth(req, _res);
    }

    const roleId = req.roleId!;

    // Check if role has the required permission
    const rolePermission = await db
      .select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(permissions.name, permissionName),
          eq(rolePermissions.isActive, true),
          eq(rolePermissions.isDeleted, false),
          eq(permissions.isActive, true),
          eq(permissions.isDeleted, false)
        )
      )
      .limit(1);

    if (rolePermission.length === 0) {
      throw new AppError(
        `Permission denied: ${permissionName} required`,
        403,
        ErrorCodes.FORBIDDEN
      );
    }

    logger.info("Permission check passed", {
      userId: req.userId,
      roleId,
      permission: permissionName,
    });
  } catch (error) {
    logger.error("Permission check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.userId,
      permission: permissionName,
      path: req.url,
    });
    throw error;
  }
}

/**
 * Helper function to check if user has permission (non-throwing)
 * Returns true if user has permission, false otherwise
 */
export async function hasPermission(
  userId: number,
  roleId: number,
  permissionName: string
): Promise<boolean> {
  try {
    const rolePermission = await db
      .select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(permissions.name, permissionName),
          eq(rolePermissions.isActive, true),
          eq(rolePermissions.isDeleted, false),
          eq(permissions.isActive, true),
          eq(permissions.isDeleted, false)
        )
      )
      .limit(1);

    return rolePermission.length > 0;
  } catch (error) {
    logger.error("Error checking permission", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      roleId,
      permission: permissionName,
    });
    return false;
  }
}

/**
 * Wrapper for API route handlers that require authentication and permission
 */
export function withAuthAndPermission(
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>,
  permissionName?: string
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Require authentication
      await requireAuth(req, res);

      // Require permission if specified
      if (permissionName) {
        await requirePermission(req, res, permissionName);
      }

      // Call the handler
      return await handler(req, res);
    } catch (error) {
      const { handleApiError, sendErrorResponse } = await import(
        "../utils/errorHandler"
      );
      const apiError = handleApiError(error);
      return sendErrorResponse(res, apiError);
    }
  };
}

