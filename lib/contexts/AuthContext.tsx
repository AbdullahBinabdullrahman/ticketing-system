"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

import type { UserProfile, AuthTokens } from "../services/authService";
import { logger } from "../utils/logger";
import http from "../utils/http";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface AuthContextType {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto refresh token
  useEffect(() => {
    if (tokens?.refreshToken) {
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens?.refreshToken]);

  const initializeAuth = async () => {
    try {
      const storedTokens = localStorage.getItem("auth_tokens");
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);

        // Verify token and get user profile
        const response = await http.get(`/auth/me`);
        setUser(response.data.user);
      }
    } catch (error) {
      logger.error("Auth initialization failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Clear invalid tokens
      localStorage.removeItem("auth_tokens");
      setTokens(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Authenticate with API
      const result = await http.post(`/auth/login`, {
        email,
        password,
      });

      // Verify successful authentication
      // API returns: { success: true, data: { user, tokens }, timestamp }
      if (!result.data || !result.data.data) {
        throw new Error("Invalid response from server");
      }

      const { user, tokens } = result.data.data;

      // Verify user and tokens exist
      if (!user || !tokens) {
        throw new Error("Missing user or tokens in response");
      }

      // Verify user has valid role
      if (
        !user.userType ||
        !["admin", "partner", "customer"].includes(user.userType)
      ) {
        throw new Error("Invalid user role");
      }

      // Set user and tokens in state
      setUser(user);
      setTokens(tokens);

      // Store tokens in localStorage
      localStorage.setItem(
        "auth_tokens",
        JSON.stringify({
          ...tokens,
          userId: user.id,
          userType: user.userType,
        })
      );

      // Store role-specific token for easy access
      const tokenKey = `${user.userType}Token`;
      localStorage.setItem(tokenKey, tokens.accessToken);

      logger.info("User logged in successfully", {
        userId: user.id,
        email,
        userType: user.userType,
        tokenKey,
      });

      // Redirect based on user type with explicit role verification
      if (user.userType === "admin") {
        // Verify adminToken is stored before redirect
        const storedAdminToken = localStorage.getItem("adminToken");
        if (!storedAdminToken) {
          throw new Error("Failed to store admin token");
        }

        logger.info(
          "Admin authenticated successfully - redirecting to dashboard",
          {
            userId: user.id,
            email: user.email,
          }
        );

        router.push("/dashboard");
      } else if (user.userType === "partner") {
        // Verify partnerToken is stored
        const storedPartnerToken = localStorage.getItem("partnerToken");
        if (!storedPartnerToken) {
          throw new Error("Failed to store partner token");
        }

        logger.info(
          "Partner authenticated successfully - redirecting to partner dashboard",
          {
            userId: user.id,
            email: user.email,
          }
        );

        router.push("/partner/dashboard");
      } else if (user.userType === "customer") {
        // Verify customerToken is stored
        const storedCustomerToken = localStorage.getItem("customerToken");
        if (!storedCustomerToken) {
          throw new Error("Failed to store customer token");
        }

        logger.info(
          "Customer authenticated successfully - redirecting to customer dashboard",
          {
            userId: user.id,
            email: user.email,
          }
        );

        router.push("/customer/dashboard");
      } else {
        throw new Error(`Unknown user type: ${user.userType}`);
      }
    } catch (error) {
      logger.error("Login failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      });

      // Clear any partial data on error
      setUser(null);
      setTokens(null);
      localStorage.removeItem("auth_tokens");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("partnerToken");
      localStorage.removeItem("customerToken");

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await http.post(`/auth/logout`, {
          refreshToken: tokens.refreshToken,
        });
      }
    } catch (error) {
      logger.error("Logout failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setTokens(null);
      localStorage.removeItem("auth_tokens");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("partnerToken");
      localStorage.removeItem("customerToken");
      router.push("/login");
    }
  };

  const refreshToken = async () => {
    try {
      if (tokens?.refreshToken) {
        const result = await http.post(`/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });
        setTokens(result.data.tokens);

        // Update stored tokens
        const storedTokens = localStorage.getItem("auth_tokens");
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          localStorage.setItem(
            "auth_tokens",
            JSON.stringify({
              ...result.data.tokens,
              userId: parsedTokens.userId,
            })
          );
        }
      }
    } catch (error) {
      logger.error("Token refresh failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // If refresh fails, logout user
      await logout();
    }
  };

  const refreshUser = async () => {
    try {
      if (!tokens) throw new Error("User not authenticated");

      const response = await http.get(`/auth/me`);
      setUser(response.data.user);

      logger.info("User data refreshed successfully");
    } catch (error) {
      logger.error("Refresh user failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const updateProfile = async (data: Record<string, unknown>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const result = await http.patch(`/auth/profile`, data);
      setUser(result.data.user);

      logger.info("Profile updated successfully", { userId: user.id });
    } catch (error) {
      logger.error("Update profile failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  const isAuthenticated = !!user && !!tokens;
  const isAdmin = user?.userType === "admin";
  const isPartner = user?.userType === "partner";
  const isCustomer = user?.userType === "customer";

  const value: AuthContextType = {
    user,
    tokens,
    loading,
    login,
    logout,
    refreshToken,
    refreshUser,
    updateProfile,
    isAuthenticated,
    isAdmin,
    isPartner,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredUserType?: "admin" | "partner" | "customer"
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isAdmin, isPartner, isCustomer, loading } =
      useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        if (requiredUserType) {
          if (requiredUserType === "admin" && !isAdmin) {
            router.push("/unauthorized");
            return;
          }
          if (requiredUserType === "partner" && !isPartner) {
            router.push("/unauthorized");
            return;
          }
          if (requiredUserType === "customer" && !isCustomer) {
            router.push("/unauthorized");
            return;
          }
        }
      }
    }, [isAuthenticated, isAdmin, isPartner, isCustomer, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requiredUserType) {
      if (requiredUserType === "admin" && !isAdmin) return null;
      if (requiredUserType === "partner" && !isPartner) return null;
      if (requiredUserType === "customer" && !isCustomer) return null;
    }

    return <WrappedComponent {...props} />;
  };
}
