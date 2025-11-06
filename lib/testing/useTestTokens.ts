/**
 * Hook to automatically generate and manage test tokens
 */

import { useState, useEffect } from "react";
import { authManager } from "./authManager";
import { TestAccounts } from "./testDataFactory";
import { logger } from "../utils/logger";

export interface TestTokens {
  adminToken: string | null;
  partnerToken: string | null;
  loading: boolean;
  error: string | null;
  refreshTokens: () => Promise<void>;
}

/**
 * Custom hook to generate and manage test tokens
 * Automatically logs in as admin and partner on mount
 */
export function useTestTokens(): TestTokens {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [partnerToken, setPartnerToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate both admin and partner tokens
   */
  const generateTokens = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info("Generating test tokens...");

      // Check if tokens already exist in localStorage
      const storedAdminToken = localStorage.getItem("adminToken");
      const storedPartnerToken = localStorage.getItem("partnerToken");

      if (storedAdminToken && storedPartnerToken) {
        logger.info("Using existing tokens from localStorage");
        setAdminToken(storedAdminToken);
        setPartnerToken(storedPartnerToken);
        authManager.switchRole("admin");
        setLoading(false);
        return;
      }

      // Generate admin token
      logger.info("Logging in as admin...");
      const adminTokens = await authManager.login(
        TestAccounts.admin.email,
        TestAccounts.admin.password,
        "admin"
      );
      setAdminToken(adminTokens.accessToken);
      localStorage.setItem("adminToken", adminTokens.accessToken);
      logger.info("Admin token generated successfully");

      // Generate partner token
      logger.info("Logging in as partner...");
      const partnerTokens = await authManager.login(
        TestAccounts.partner1.email,
        TestAccounts.partner1.password,
        "partner"
      );
      setPartnerToken(partnerTokens.accessToken);
      localStorage.setItem("partnerToken", partnerTokens.accessToken);
      logger.info("Partner token generated successfully");

      // Set default to admin
      authManager.switchRole("admin");

      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate tokens";
      logger.error("Token generation failed", { error: errorMessage });
      setError(errorMessage);
      setLoading(false);
    }
  };

  /**
   * Refresh tokens (force regeneration)
   */
  const refreshTokens = async () => {
    // Clear existing tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("partnerToken");
    authManager.clearAll();

    // Generate fresh tokens
    await generateTokens();
  };

  // Generate tokens on mount
  useEffect(() => {
    generateTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    adminToken,
    partnerToken,
    loading,
    error,
    refreshTokens,
  };
}

/**
 * Helper to get current tokens from localStorage
 */
export function getStoredTokens(): {
  adminToken: string | null;
  partnerToken: string | null;
} {
  return {
    adminToken: localStorage.getItem("adminToken"),
    partnerToken: localStorage.getItem("partnerToken"),
  };
}

/**
 * Helper to check if tokens are valid (not expired)
 */
export function areTokensValid(): boolean {
  const { adminToken, partnerToken } = getStoredTokens();

  if (!adminToken || !partnerToken) {
    return false;
  }

  try {
    // Decode JWT to check expiration (without verification)
    const decodeToken = (token: string) => {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    };

    const adminPayload = decodeToken(adminToken);
    const partnerPayload = decodeToken(partnerToken);

    const now = Math.floor(Date.now() / 1000);

    return adminPayload.exp > now && partnerPayload.exp > now;
  } catch (error) {
    logger.error("Token validation failed", { error });
    return false;
  }
}

