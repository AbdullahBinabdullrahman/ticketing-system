/**
 * Admin Route Guard Component
 * Protects admin routes from non-admin users
 * Redirects partners to partner portal and customers to customer portal
 */

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      // Partner user - redirect to partner portal
      if (user?.userType === "partner") {
        router.replace("/partner/dashboard");
        return;
      }

      // Customer user - redirect to customer portal
      if (user?.userType === "customer") {
        router.replace("/customer/dashboard");
        return;
      }

      // Not admin - redirect to unauthorized
      if (user?.userType !== "admin") {
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

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || user?.userType !== "admin") {
    return null;
  }

  // Render children for admin users
  return <>{children}</>;
}

/**
 * Higher-order component to wrap admin pages
 * Usage: export default withAdminGuard(MyAdminPage);
 */
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function GuardedComponent(props: P) {
    return (
      <AdminGuard>
        <Component {...props} />
      </AdminGuard>
    );
  };
}

