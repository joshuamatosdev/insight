package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.repository.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public RoleService(RoleRepository roleRepository, TenantRepository tenantRepository,
                       AuditService auditService) {
        this.roleRepository = roleRepository;
        this.tenantRepository = tenantRepository;
        this.auditService = auditService;
    }

    public record CreateRoleRequest(
            @NotBlank(message = "Role name is required")
            @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
            @Pattern(regexp = "^[A-Z_]+$", message = "Role name must be uppercase with underscores only")
            String name,
            @Size(max = 255, message = "Description must not exceed 255 characters")
            String description,
            List<String> permissions,
            Boolean isSystemRole
    ) {}

    public record RoleResponse(UUID id, String name, String description, List<String> permissions,
                                Boolean isSystemRole, Instant createdAt) {}

    public RoleResponse createRole(UUID tenantId, UUID userId, CreateRoleRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        if (roleRepository.existsByTenantIdAndName(tenantId, request.name())) {
            throw new IllegalArgumentException("Role with this name already exists");
        }

        Role role = new Role();
        role.setTenant(tenant);
        role.setName(request.name());
        role.setDescription(request.description());
        role.setPermissions(request.permissions() != null ? String.join(",", request.permissions()) : "");
        role.setIsSystemRole(request.isSystemRole() != null ? request.isSystemRole() : false);

        role = roleRepository.save(role);
        auditService.logAction(AuditAction.ROLE_CREATED, "Role", role.getId().toString(),
                "Created role: " + request.name());

        return toResponse(role);
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles(UUID tenantId) {
        return roleRepository.findByTenantId(tenantId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<RoleResponse> getRole(UUID roleId) {
        return roleRepository.findById(roleId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<RoleResponse> getRoleByName(UUID tenantId, String name) {
        return roleRepository.findByTenantIdAndName(tenantId, name).map(this::toResponse);
    }

    public RoleResponse updateRole(UUID tenantId, UUID roleId, UUID userId, CreateRoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        if (!role.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Role does not belong to tenant");
        }

        if (role.getIsSystemRole()) {
            throw new IllegalArgumentException("System roles cannot be modified");
        }

        role.setName(request.name());
        role.setDescription(request.description());
        role.setPermissions(request.permissions() != null ? String.join(",", request.permissions()) : "");

        role = roleRepository.save(role);
        auditService.logAction(AuditAction.ROLE_UPDATED, "Role", roleId.toString(), "Updated role");

        return toResponse(role);
    }

    public void deleteRole(UUID tenantId, UUID roleId, UUID userId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        if (!role.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Role does not belong to tenant");
        }

        if (role.getIsSystemRole()) {
            throw new IllegalArgumentException("System roles cannot be deleted");
        }

        roleRepository.delete(role);
        auditService.logAction(AuditAction.ROLE_DELETED, "Role", roleId.toString(),
                "Deleted role: " + role.getName());
    }

    public void initializeDefaultRoles(UUID tenantId, UUID userId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        createSystemRole(tenant, "ADMIN", "Full system access",
                List.of("*"));
        createSystemRole(tenant, "MANAGER", "Management access",
                List.of("opportunities:read", "opportunities:write", "contracts:read", "contracts:write",
                        "pipeline:read", "pipeline:write", "reports:read"));
        createSystemRole(tenant, "USER", "Standard user access",
                List.of("opportunities:read", "contracts:read", "pipeline:read", "documents:read"));
        createSystemRole(tenant, "VIEWER", "Read-only access",
                List.of("opportunities:read", "contracts:read", "reports:read"));

        auditService.logAction(AuditAction.ROLE_CREATED, "Role", tenantId.toString(),
                "Initialized default roles for tenant");
    }

    private void createSystemRole(Tenant tenant, String name, String description, List<String> permissions) {
        if (!roleRepository.existsByTenantIdAndName(tenant.getId(), name)) {
            Role role = new Role();
            role.setTenant(tenant);
            role.setName(name);
            role.setDescription(description);
            role.setPermissions(String.join(",", permissions));
            role.setIsSystemRole(true);
            roleRepository.save(role);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getAllPermissions() {
        return List.of(
                "opportunities:read", "opportunities:write", "opportunities:delete",
                "contracts:read", "contracts:write", "contracts:delete",
                "pipeline:read", "pipeline:write", "pipeline:delete",
                "documents:read", "documents:write", "documents:delete",
                "compliance:read", "compliance:write",
                "financial:read", "financial:write",
                "reports:read", "reports:write",
                "users:read", "users:write", "users:delete",
                "settings:read", "settings:write",
                "audit:read",
                "*"
        );
    }

    private RoleResponse toResponse(Role role) {
        List<String> permissions = role.getPermissions() != null && !role.getPermissions().isEmpty() ?
                Arrays.asList(role.getPermissions().split(",")) : Collections.emptyList();

        return new RoleResponse(role.getId(), role.getName(), role.getDescription(),
                permissions, role.getIsSystemRole(), role.getCreatedAt());
    }
}
