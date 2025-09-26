// Role-based permission system
export type UserRole = "MANAGEMENT" | "ADMIN" | "HR" | "LEGAL";

export interface Permission {
  route: string;
  allowedRoles: UserRole[];
}

// Define permissions for each route
export const routePermissions: Permission[] = [
  { route: "/dashboard", allowedRoles: ["MANAGEMENT", "ADMIN", "HR", "LEGAL"] },
  { route: "/create", allowedRoles: ["ADMIN", "HR", "LEGAL"] },
  { route: "/review", allowedRoles: ["MANAGEMENT", "ADMIN", "LEGAL"] },
  { route: "/employment", allowedRoles: ["MANAGEMENT", "ADMIN", "HR"] },
  { route: "/draft", allowedRoles: ["MANAGEMENT", "ADMIN", "HR", "LEGAL"] },
  { route: "/profile", allowedRoles: ["MANAGEMENT", "ADMIN", "HR", "LEGAL"] },
  { route: "/register", allowedRoles: ["ADMIN"] }, // Only admin can access user registration
];

/**
 * Check if a user role has permission to access a specific route
 * @param userRole - The user's role
 * @param route - The route to check access for
 * @returns boolean - Whether the user has access to the route
 */
export function hasRouteAccess(
  userRole: UserRole | undefined,
  route: string
): boolean {
  if (!userRole) return false;

  const permission = routePermissions.find((p) => p.route === route);
  if (!permission) return false;

  return permission.allowedRoles.includes(userRole);
}

/**
 * Get all accessible routes for a user role
 * @param userRole - The user's role
 * @returns string[] - Array of accessible route paths
 */
export function getAccessibleRoutes(userRole: UserRole | undefined): string[] {
  if (!userRole) return [];

  return routePermissions
    .filter((permission) => permission.allowedRoles.includes(userRole))
    .map((permission) => permission.route);
}

/**
 * Get role display name for UI
 * @param role - The user role
 * @returns string - Formatted role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    MANAGEMENT: "Management",
    ADMIN: "Administrator",
    HR: "Human Resources",
    LEGAL: "Legal Department",
  };

  return roleNames[role] || role;
}
