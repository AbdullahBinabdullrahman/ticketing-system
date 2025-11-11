/**
 * Authentication Manager for Testing
 * Handles multi-user authentication and role switching
 */

import http from "../utils/http";
import { logger } from "../utils/logger";
import type { AuthTokens, UserRole } from "./types";

export class AuthManager {
  private tokens: Map<UserRole, AuthTokens> = new Map();
  private currentRole: UserRole | null = null;

  /**
   * Login as a specific role
   */
  async login(
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthTokens> {
    try {
      const response = await http.post(`/auth/login`, {
        email,
        password,
      });

      // API response structure: { success: true, data: { user, tokens }, timestamp }
      const apiData = response.data.data || response.data;

      const tokens: AuthTokens = {
        accessToken: apiData.tokens.accessToken,
        refreshToken: apiData.tokens.refreshToken,
        userId: apiData.user.id,
        role: role,
      };

      this.tokens.set(role, tokens);
      this.currentRole = role;

      logger.info(`Logged in as ${role}`, { userId: tokens.userId });

      return tokens;
    } catch (error: unknown) {
      logger.error(`Failed to login as ${role}`, { error });
      throw error;
    }
  }

  /**
   * Switch to a different role context
   */
  switchRole(role: UserRole): void {
    if (!this.tokens.has(role)) {
      throw new Error(`No authentication token found for role: ${role}`);
    }
    this.currentRole = role;
    logger.info(`Switched to role: ${role}`);
  }

  /**
   * Get current authentication token
   */
  getCurrentToken(): string | null {
    if (!this.currentRole) {
      return null;
    }
    return this.tokens.get(this.currentRole)?.accessToken || null;
  }

  /**
   * Get token for specific role
   */
  getTokenForRole(role: UserRole): string | null {
    return this.tokens.get(role)?.accessToken || null;
  }

  /**
   * Get current role
   */
  getCurrentRole(): UserRole | null {
    return this.currentRole;
  }

  /**
   * Check if a role is authenticated
   */
  isAuthenticated(role: UserRole): boolean {
    return this.tokens.has(role);
  }

  /**
   * Clear all authentication tokens
   */
  clearAll(): void {
    this.tokens.clear();
    this.currentRole = null;
    logger.info("Cleared all authentication tokens");
  }

  /**
   * Clear authentication for specific role
   */
  clearRole(role: UserRole): void {
    this.tokens.delete(role);
    if (this.currentRole === role) {
      this.currentRole = null;
    }
    logger.info(`Cleared authentication for role: ${role}`);
  }

  /**
   * Get all authenticated roles
   */
  getAuthenticatedRoles(): UserRole[] {
    return Array.from(this.tokens.keys());
  }

  /**
   * Refresh token for current role
   */
  async refreshCurrentToken(): Promise<void> {
    if (!this.currentRole) {
      throw new Error("No current role set");
    }

    const tokens = this.tokens.get(this.currentRole);
    if (!tokens) {
      throw new Error(`No tokens found for role: ${this.currentRole}`);
    }

    try {
      const response = await http.post(`/auth/refresh`, {
        refreshToken: tokens.refreshToken,
      });

      // API response structure: { success: true, data: { tokens }, timestamp }
      const apiData = response.data.data || response.data;

      const newTokens: AuthTokens = {
        ...tokens,
        accessToken: apiData.tokens.accessToken,
        refreshToken: apiData.tokens.refreshToken,
      };

      this.tokens.set(this.currentRole, newTokens);
      logger.info(`Refreshed token for role: ${this.currentRole}`);
    } catch (error: unknown) {
      logger.error(`Failed to refresh token for ${this.currentRole}`, {
        error,
      });
      throw error;
    }
  }
}

// Singleton instance for testing
export const authManager = new AuthManager();
