import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirect based on user type
        if (user?.userType === "admin") {
          router.push("/dashboard");
        } else if (user?.userType === "partner") {
          router.push("/partner/dashboard");
        } else {
          router.push("/customer/dashboard");
        }
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500">
        test
      </div>
    </div>
  );
}
