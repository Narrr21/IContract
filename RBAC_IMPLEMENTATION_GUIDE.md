# Role-Based Access Control (RBAC) Implementation Guide

This guide explains how the role-based navbar and page protection system works in the IContract application.

## User Roles

The system supports four user roles:

- **MANAGEMENT**: Can view dashboard, review contracts, employment contracts, and drafts
- **ADMIN**: Full access to all features (dashboard, create, review, employment, drafts)
- **HR**: Can create contracts, manage employment contracts, and drafts (dashboard, create, employment, drafts)
- **LEGAL**: Can create contracts, review contracts, and manage drafts (dashboard, create, review, drafts)

## Components

### 1. Navbar (`src/components/custom/navbar.tsx`)

The navbar automatically shows/hides navigation items based on the user's role:

```tsx
// Role-based navigation is automatically configured
const navLinks = getNavLinksForRole(user?.category);
```

The dropdown also shows the user's role in a formatted manner:

```tsx
{
  user.category && (
    <DropdownMenuLabel className="text-xs text-blue-600 bg-[#F8F8FF] pt-0">
      {getRoleDisplayName(user.category)}
    </DropdownMenuLabel>
  );
}
```

### 2. Role Permissions (`src/lib/rolePermissions.ts`)

This file contains the role-based permission logic:

```tsx
// Check if a user has access to a route
hasRouteAccess(userRole: UserRole, route: string): boolean

// Get all accessible routes for a role
getAccessibleRoutes(userRole: UserRole): string[]

// Format role names for display
getRoleDisplayName(role: UserRole): string
```

### 3. Protected Route Component (`src/components/auth/ProtectedRoute.tsx`)

Provides page-level protection with several convenience components:

```tsx
// Generic protection
<ProtectedRoute requiredRoles={['ADMIN', 'HR']}>
  <YourPageContent />
</ProtectedRoute>

// Convenience wrappers
<AdminOnly>{children}</AdminOnly>
<HROnly>{children}</HROnly>
<ManagementOnly>{children}</ManagementOnly>
<LegalOnly>{children}</LegalOnly>
<ReviewAccess>{children}</ReviewAccess> // MANAGEMENT, ADMIN, LEGAL
<AdminOrHR>{children}</AdminOrHR>
```

## Implementation Examples

### Protecting a Page

#### Option 1: Using ProtectedRoute

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "HR"]}>
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

#### Option 2: Using Convenience Components

```tsx
import { ReviewAccess } from "@/components/auth/ProtectedRoute";

export default function ReviewPage() {
  return (
    <ReviewAccess>
      <ReviewPageContent />
    </ReviewAccess>
  );
}
```

### Current Page Protections

- **Review Page** (`/review`): Protected with `ReviewAccess` (MANAGEMENT, ADMIN, LEGAL only)
- **Employment Page** (`/employment`): Protected for MANAGEMENT, ADMIN, HR only
- **Create Page** (`/create`): Available to ADMIN, HR, LEGAL (via navbar)
- **Dashboard** (`/dashboard`): Available to all authenticated users
- **Draft Page** (`/draft`): Available to all authenticated users

### Adding Role Information to API Response

The user API (`/api/account`) already includes the `category` field:

```tsx
const userData = {
  firstName: user.firstname || "",
  lastName: user.lastname || "",
  email: user.email,
  category: user.category, // This is the user's role
  // ... other fields
};
```

## Database Schema

User roles are defined in the Prisma schema:

```prisma
enum UserCategory {
    MANAGEMENT
    ADMIN
    HR
    LEGAL
}

model User {
  // ... other fields
  category    UserCategory
  // ... other fields
}
```

## Features

### 1. Dynamic Navigation

- Navigation items automatically appear/disappear based on user role
- Active route highlighting works correctly
- Role is displayed in the user dropdown

### 2. Page Protection

- Unauthorized users are redirected to dashboard or login
- Loading states while checking permissions
- Graceful error handling

### 3. Security

- Both client-side (UX) and can be extended with server-side protection
- Route permissions are centrally managed
- Easy to modify role access patterns

## Extending the System

### Adding New Roles

1. Update the `UserCategory` enum in `prisma/schema.prisma`
2. Update the `UserRole` type in `src/lib/rolePermissions.ts`
3. Add role configurations in `getNavLinksForRole()` function
4. Update `routePermissions` array if needed

### Adding New Protected Routes

1. Add the route to `routePermissions` in `rolePermissions.ts`
2. Wrap the page component with appropriate protection
3. Update navbar configuration if the route should appear in navigation

### Custom Permission Logic

```tsx
import { hasRouteAccess } from "@/lib/rolePermissions";

// In your component
const canAccessFeature = hasRouteAccess(user?.category, "/special-feature");
```

## Testing Role Access

To test different roles:

1. Update a user's `category` field in the database
2. Log in with that user
3. Observe the navigation changes and page access

## Best Practices

1. **Always protect sensitive pages** with `ProtectedRoute`
2. **Use convenience components** when possible for readability
3. **Keep role logic centralized** in `rolePermissions.ts`
4. **Test all role combinations** when adding new features
5. **Consider server-side validation** for critical operations

## Troubleshooting

### Navigation items not appearing

- Check if the route is included in the user's role configuration
- Verify the user's `category` field is correctly set

### Page access denied

- Confirm the page is wrapped with appropriate protection
- Check `routePermissions` configuration
- Verify user authentication status

### Role not displaying

- Ensure `getRoleDisplayName()` includes the role
- Check if the user object includes the `category` field
