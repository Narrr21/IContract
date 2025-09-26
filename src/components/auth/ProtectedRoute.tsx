"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole, hasRouteAccess } from "@/lib/rolePermissions";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  category: UserRole;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallbackPath = "/dashboard",
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/account");
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          setUser(userData);

          // Check if user role is in the required roles
          const hasAccess = requiredRoles.includes(userData.category);
          setIsAuthorized(hasAccess);

          if (!hasAccess) {
            router.push(fallbackPath);
          }
        } else {
          // User not authenticated, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to check access:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredRoles, fallbackPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience wrapper components for specific roles
export function ManagementOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["MANAGEMENT"]}>{children}</ProtectedRoute>
  );
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}

export function HROnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRoles={["HR"]}>{children}</ProtectedRoute>;
}

export function LegalOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRoles={["LEGAL"]}>{children}</ProtectedRoute>;
}

export function AdminOrHR({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "HR"]}>{children}</ProtectedRoute>
  );
}

export function ReviewAccess({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["MANAGEMENT", "ADMIN", "LEGAL"]}>
      {children}
    </ProtectedRoute>
  );
}
