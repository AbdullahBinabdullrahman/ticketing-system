/**
 * Partner Route Guard Component
 * Protects partner routes from non-partner users
 * Redirects admins to admin portal and customers to customer portal
 */

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PartnerGuardProps {
  children: React.ReactNode;
}

export function PartnerGuard({ children }: PartnerGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      // Admin user - redirect to admin portal
      if (user?.userType === "admin") {
        router.replace("/dashboard");
        return;
      }

      // Customer user - redirect to customer portal
      if (user?.userType === "customer") {
        router.replace("/customer/dashboard");
        return;
      }

      // Not partner - redirect to unauthorized
      if (user?.userType !== "partner") {
        router.replace("/unauthorized");
        return;
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not partner
  if (!isAuthenticated || user?.userType !== "partner") {
    return null;
  }

  // Render children for partner users
  return <>{children}</>;
}

/**
 * Higher-order component to wrap partner pages
 * Usage: export default withPartnerGuard(MyPartnerPage);
 */
export function withPartnerGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function GuardedComponent(props: P) {
    return (
      <PartnerGuard>
        <Component {...props} />
      </PartnerGuard>
    );
  };
}

