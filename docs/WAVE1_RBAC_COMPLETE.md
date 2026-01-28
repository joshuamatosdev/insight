# Wave 1: RBAC Core System Complete

## Overview

Enhanced the existing Role-Based Access Control (RBAC) system with a proper Permission entity, permission checking service, and a frontend roles management page.

## Files Created

### Backend
- `src/main/java/com/samgov/ingestor/model/Permission.java` - Permission entity with categories
- `src/main/java/com/samgov/ingestor/repository/PermissionRepository.java` - Permission repository
- `src/main/java/com/samgov/ingestor/service/PermissionService.java` - Permission checking and management
- `src/main/java/com/samgov/ingestor/controller/PermissionController.java` - Permission API endpoints

### Frontend
- `sam-dashboard/src/pages/RolesPage.tsx` - Role management UI

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/permissions` | Get all permissions by category | Admin |
| GET | `/permissions/codes` | Get all permission codes | Admin |
| GET | `/permissions/me` | Get current user's permissions | Authenticated |
| GET | `/permissions/check/{code}` | Check if user has permission | Authenticated |

## Permission Format

Permissions follow the `resource:action` format:
- `opportunities:read` - Read access to opportunities
- `contracts:write` - Write access to contracts
- `users:delete` - Delete users
- `*` - Full system access (superadmin)

## Permission Categories

- OPPORTUNITIES - Opportunity management
- CONTRACTS - Contract management
- PIPELINE - Pipeline management
- DOCUMENTS - Document management
- COMPLIANCE - Compliance management
- FINANCIAL - Financial data
- REPORTS - Reporting
- USERS - User management
- SETTINGS - System settings
- AUDIT - Audit logs
- SYSTEM - System-level access

## Default Permissions Initialized

On startup, the PermissionService automatically creates standard permissions for each category.

## Routes to Add to App.tsx

```tsx
import { RolesPage } from './pages/RolesPage';

// Add route (admin only):
<Route path="/admin/roles" element={<RolesPage />} />
```

## Usage Examples

### Check Permission in Backend

```java
@Autowired
private PermissionService permissionService;

public void someMethod(UUID userId, UUID tenantId) {
    if (permissionService.hasPermission(userId, tenantId, "contracts:write")) {
        // User can edit contracts
    }
}
```

### Check Permission in Frontend

```typescript
// Fetch user's permissions
const response = await fetch('/permissions/me', {
  headers: { Authorization: `Bearer ${token}` }
});
const permissions = await response.json() as Set<string>;

if (permissions.has('contracts:write')) {
  // Show edit button
}
```

## Existing RBAC Components (unchanged)

- `RoleService` - Role CRUD and default role initialization
- `RoleController` - Role management endpoints
- `RoleRepository` - Role data access
- `Role` entity - Role with comma-separated permissions

## Database Changes

New table: `permissions`
- `id` (UUID, PK)
- `code` (VARCHAR, unique) - e.g., "opportunities:read"
- `display_name` (VARCHAR)
- `description` (VARCHAR)
- `category` (ENUM)
- `created_at` (TIMESTAMP)
