/**
 * Customer Authentication Hook
 * Simple authentication for customer portal with auto test token generation
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import http from "@/lib/utils/http";

export function useCustomerAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        let token = localStorage.getItem("customerToken");

        // If no token exists and we're on a customer page, generate a test token
        if (!token && router.pathname.startsWith("/customer")) {
          setIsGeneratingToken(true);
          try {
            // Get secret from environment (exposed via Next.js public env var)
            const secret = process.env.NEXT_PUBLIC_TEST_SECRET || "";

            const response = await http.post("/customer/test-token", null, {
              headers: {
                "X-Test-Secret": secret,
              },
            });
            token = response.data.token;
            if (token) {
              localStorage.setItem("customerToken", token);
            }
            console.log("✅ Test customer token generated automatically");
          } catch (error) {
            console.error("Failed to generate test token:", error);
          } finally {
            setIsGeneratingToken(false);
          }
        }

        setIsAuthenticated(!!token);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [router.pathname]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("auth_tokens");
      router.push("/login");
    }
  };

  return {
    isAuthenticated,
    isLoading: isLoading || isGeneratingToken,
    logout,
  };
}
