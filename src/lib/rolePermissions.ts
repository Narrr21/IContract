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
  {
    route: "/contracts/{id}/review",
    allowedRoles: ["MANAGEMENT", "ADMIN", "LEGAL"],
  },
  // NEW: edit halaman hanya MANAGEMENT + LEGAL
  { route: "/contracts/{id}/edit", allowedRoles: ["MANAGEMENT", "LEGAL"] },
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
// Convert pattern with {param} segments to a RegExp
function patternToRegex(pattern: string): RegExp {
  // Escape regex chars except our parameter braces
  const escaped = pattern
    .replace(/[-/\\^$+?.()|[\]]/g, "\\$&")
    .replace(/\\\{[^/]+?\\\}/g, "([^/]+)");
  return new RegExp(`^${escaped}$`);
}

// Precompile regex for performance
const compiledPermissions = routePermissions.map((p) => ({
  ...p,
  regex: patternToRegex(p.route),
}));

export function hasRouteAccess(
  userRole: UserRole | undefined,
  routePath: string
): boolean {
  if (!userRole) return false;
  for (const perm of compiledPermissions) {
    if (perm.regex.test(routePath)) {
      return perm.allowedRoles.includes(userRole);
    }
  }
  return false;
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
