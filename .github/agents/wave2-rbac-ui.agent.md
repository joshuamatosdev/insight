---
name: "wave2-rbac-ui"
description: "Wave 2: RBAC Admin UI - Role and permission management pages."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create admin UI for managing roles, permissions, and user-role assignments.

## Branch

`claude/wave2/rbac-ui`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/controller/RoleController.java`
- `src/main/java/com/samgov/ingestor/controller/PermissionController.java`
- `src/main/java/com/samgov/ingestor/dto/RoleDTO.java`
- `src/main/java/com/samgov/ingestor/dto/PermissionDTO.java`
- `src/main/java/com/samgov/ingestor/dto/AssignRoleRequest.java`

### Frontend
- `sam-dashboard/src/pages/admin/RolesPage.tsx`
- `sam-dashboard/src/pages/admin/RolesPage.types.ts`
- `sam-dashboard/src/pages/admin/UsersAdminPage.tsx`
- `sam-dashboard/src/pages/admin/UsersAdminPage.types.ts`
- `sam-dashboard/src/pages/admin/PermissionsPage.tsx`
- `sam-dashboard/src/components/domain/admin/RoleCard.tsx`
- `sam-dashboard/src/components/domain/admin/RoleForm.tsx`
- `sam-dashboard/src/components/domain/admin/PermissionMatrix.tsx`
- `sam-dashboard/src/components/domain/admin/UserRoleAssignment.tsx`
- `sam-dashboard/src/services/roleService.ts`
- `sam-dashboard/src/hooks/useRoles.ts`

### Tests
- `src/test/java/com/samgov/ingestor/controller/RoleControllerTest.java`
- `sam-dashboard/src/pages/admin/RolesPage.test.tsx`

## DO NOT TOUCH

- `App.tsx` (document routes in output file)
- `SecurityConfig.java`
- Core RBAC entities (from wave1-rbac-core)

## Features

1. **Roles Management Page**
   - List all roles with permissions count
   - Create new custom role
   - Edit role permissions
   - Delete custom roles (not system roles)

2. **Users Admin Page**
   - List users with their roles
   - Assign/remove roles from users
   - Bulk role assignment

3. **Permission Matrix**
   - Visual grid of resources × actions
   - Toggle permissions for each role

## API Endpoints

- `GET /roles` - List roles
- `POST /roles` - Create role
- `PUT /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role
- `GET /permissions` - List permissions
- `POST /users/{id}/roles` - Assign role
- `DELETE /users/{id}/roles/{roleId}` - Remove role

## Routes to Document

- `/admin/roles` → RolesPage
- `/admin/users` → UsersAdminPage
- `/admin/permissions` → PermissionsPage

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE2_RBAC_UI_COMPLETE.md`
