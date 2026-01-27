---
name: "wave1-rbac-core"
description: "Wave 1: Core RBAC System - Role and permission entities with service layer."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement the core Role-Based Access Control (RBAC) system with roles, permissions, and user-role assignments.

## Branch

`claude/wave1/rbac-core`

## Scope (ONLY these paths)

### Backend - Models
- `src/main/java/com/samgov/ingestor/model/Role.java`
- `src/main/java/com/samgov/ingestor/model/Permission.java`
- `src/main/java/com/samgov/ingestor/model/UserRole.java`
- `src/main/java/com/samgov/ingestor/model/RolePermission.java`

### Backend - Repositories
- `src/main/java/com/samgov/ingestor/repository/RoleRepository.java`
- `src/main/java/com/samgov/ingestor/repository/PermissionRepository.java`
- `src/main/java/com/samgov/ingestor/repository/UserRoleRepository.java`
- `src/main/java/com/samgov/ingestor/repository/RolePermissionRepository.java`

### Backend - Services
- `src/main/java/com/samgov/ingestor/service/RoleService.java`
- `src/main/java/com/samgov/ingestor/service/PermissionService.java`

### Tests
- `src/test/java/com/samgov/ingestor/service/RoleServiceTest.java`
- `src/test/java/com/samgov/ingestor/service/PermissionServiceTest.java`

## DO NOT TOUCH

- `SecurityConfig.java`
- `UserDetailsServiceImpl.java`
- Existing User.java (only add @ManyToMany to roles)

## Data Model

### Role
```java
@Entity
public class Role {
    UUID id;
    UUID tenantId;
    String name;        // ADMIN, BD_MANAGER, CONTRACT_MANAGER, etc.
    String description;
    boolean isSystem;   // Cannot be deleted if true
    Set<Permission> permissions;
    Instant createdAt;
    Instant updatedAt;
}
```

### Permission
```java
@Entity
public class Permission {
    UUID id;
    String name;        // opportunities:read, contracts:write, etc.
    String resource;    // opportunities, contracts, etc.
    String action;      // read, write, delete, admin
    String description;
}
```

## Default Roles

1. **ADMIN** - Full access
2. **BD_MANAGER** - Business Development Manager
3. **CONTRACT_MANAGER** - Contract Manager
4. **PROPOSAL_MANAGER** - Proposal Manager
5. **VIEWER** - Read-only access

## Default Permissions

Format: `{resource}:{action}`

- `opportunities:read`, `opportunities:write`, `opportunities:delete`
- `contracts:read`, `contracts:write`, `contracts:delete`
- `proposals:read`, `proposals:write`, `proposals:delete`
- `users:read`, `users:write`, `users:admin`
- `reports:read`, `reports:write`
- `settings:read`, `settings:write`

## Verification

```bash
./gradlew build
./gradlew test
```

## Output

`docs/WAVE1_RBAC_CORE_COMPLETE.md`
