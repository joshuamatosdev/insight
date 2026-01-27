package com.samgov.ingestor.service;

import com.samgov.ingestor.model.Permission;
import com.samgov.ingestor.model.Permission.PermissionCategory;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.PermissionRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for permission management and checking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final TenantMembershipRepository tenantMembershipRepository;

    /**
     * Initialize default permissions on startup
     */
    @PostConstruct
    @Transactional
    public void initializeDefaultPermissions() {
        log.info("Initializing default permissions...");

        // Opportunities
        createPermissionIfNotExists("opportunities:read", "View Opportunities", "View opportunity listings", PermissionCategory.OPPORTUNITIES);
        createPermissionIfNotExists("opportunities:write", "Edit Opportunities", "Create and edit opportunities", PermissionCategory.OPPORTUNITIES);
        createPermissionIfNotExists("opportunities:delete", "Delete Opportunities", "Delete opportunities", PermissionCategory.OPPORTUNITIES);

        // Contracts
        createPermissionIfNotExists("contracts:read", "View Contracts", "View contract listings", PermissionCategory.CONTRACTS);
        createPermissionIfNotExists("contracts:write", "Edit Contracts", "Create and edit contracts", PermissionCategory.CONTRACTS);
        createPermissionIfNotExists("contracts:delete", "Delete Contracts", "Delete contracts", PermissionCategory.CONTRACTS);

        // Pipeline
        createPermissionIfNotExists("pipeline:read", "View Pipeline", "View pipeline stages", PermissionCategory.PIPELINE);
        createPermissionIfNotExists("pipeline:write", "Edit Pipeline", "Manage pipeline stages", PermissionCategory.PIPELINE);
        createPermissionIfNotExists("pipeline:delete", "Delete Pipeline Items", "Delete pipeline items", PermissionCategory.PIPELINE);

        // Documents
        createPermissionIfNotExists("documents:read", "View Documents", "View documents", PermissionCategory.DOCUMENTS);
        createPermissionIfNotExists("documents:write", "Edit Documents", "Upload and edit documents", PermissionCategory.DOCUMENTS);
        createPermissionIfNotExists("documents:delete", "Delete Documents", "Delete documents", PermissionCategory.DOCUMENTS);

        // Compliance
        createPermissionIfNotExists("compliance:read", "View Compliance", "View compliance status", PermissionCategory.COMPLIANCE);
        createPermissionIfNotExists("compliance:write", "Edit Compliance", "Manage compliance requirements", PermissionCategory.COMPLIANCE);

        // Financial
        createPermissionIfNotExists("financial:read", "View Financial", "View financial data", PermissionCategory.FINANCIAL);
        createPermissionIfNotExists("financial:write", "Edit Financial", "Manage financial data", PermissionCategory.FINANCIAL);

        // Reports
        createPermissionIfNotExists("reports:read", "View Reports", "View reports", PermissionCategory.REPORTS);
        createPermissionIfNotExists("reports:write", "Create Reports", "Create and export reports", PermissionCategory.REPORTS);

        // Users
        createPermissionIfNotExists("users:read", "View Users", "View user listings", PermissionCategory.USERS);
        createPermissionIfNotExists("users:write", "Edit Users", "Create and edit users", PermissionCategory.USERS);
        createPermissionIfNotExists("users:delete", "Delete Users", "Delete users", PermissionCategory.USERS);

        // Settings
        createPermissionIfNotExists("settings:read", "View Settings", "View system settings", PermissionCategory.SETTINGS);
        createPermissionIfNotExists("settings:write", "Edit Settings", "Modify system settings", PermissionCategory.SETTINGS);

        // Audit
        createPermissionIfNotExists("audit:read", "View Audit Logs", "View audit trail", PermissionCategory.AUDIT);

        // System (superadmin only)
        createPermissionIfNotExists("*", "Full Access", "Complete system access (superadmin)", PermissionCategory.SYSTEM);

        log.info("Default permissions initialized");
    }

    private void createPermissionIfNotExists(String code, String displayName, String description, PermissionCategory category) {
        if (!permissionRepository.existsByCode(code)) {
            Permission permission = Permission.builder()
                .code(code)
                .displayName(displayName)
                .description(description)
                .category(category)
                .build();
            permissionRepository.save(permission);
        }
    }

    /**
     * Get all permissions grouped by category
     */
    @Transactional(readOnly = true)
    public Map<String, List<PermissionDto>> getPermissionsByCategory() {
        List<Permission> permissions = permissionRepository.findAllOrderedByCategoryAndCode();

        return permissions.stream()
            .map(this::toDto)
            .collect(Collectors.groupingBy(PermissionDto::category, LinkedHashMap::new, Collectors.toList()));
    }

    /**
     * Get all permission codes
     */
    @Transactional(readOnly = true)
    public List<String> getAllPermissionCodes() {
        return permissionRepository.findAll().stream()
            .map(Permission::getCode)
            .sorted()
            .collect(Collectors.toList());
    }

    /**
     * Check if a user has a specific permission in a tenant
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(UUID userId, UUID tenantId, String permissionCode) {
        Optional<TenantMembership> membershipOpt = tenantMembershipRepository.findByUserIdAndTenantId(userId, tenantId);

        if (membershipOpt.isEmpty()) {
            return false;
        }

        TenantMembership membership = membershipOpt.get();
        Role role = membership.getRole();

        if (role == null) {
            return false;
        }

        // Check if user has wildcard permission
        return hasPermissionInRole(role, permissionCode);
    }

    /**
     * Check if a role has a specific permission
     */
    public boolean hasPermissionInRole(Role role, String permissionCode) {
        if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
            return false;
        }

        String[] permissions = role.getPermissions().split(",");
        for (String perm : permissions) {
            String trimmed = perm.trim();
            if (trimmed.equals("*") || trimmed.equals(permissionCode)) {
                return true;
            }
            // Check resource-level wildcard (e.g., "opportunities:*")
            if (trimmed.endsWith(":*")) {
                String resource = trimmed.substring(0, trimmed.length() - 2);
                if (permissionCode.startsWith(resource + ":")) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get all permissions for a user in a tenant
     */
    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(UUID userId, UUID tenantId) {
        Optional<TenantMembership> membershipOpt = tenantMembershipRepository.findByUserIdAndTenantId(userId, tenantId);

        if (membershipOpt.isEmpty()) {
            return Collections.emptySet();
        }

        TenantMembership membership = membershipOpt.get();
        Role role = membership.getRole();

        if (role == null || role.getPermissions() == null || role.getPermissions().isEmpty()) {
            return Collections.emptySet();
        }

        return Arrays.stream(role.getPermissions().split(","))
            .map(String::trim)
            .filter(p -> !p.isEmpty())
            .collect(Collectors.toSet());
    }

    private PermissionDto toDto(Permission permission) {
        return new PermissionDto(
            permission.getId(),
            permission.getCode(),
            permission.getDisplayName(),
            permission.getDescription(),
            permission.getCategory().name()
        );
    }

    public record PermissionDto(UUID id, String code, String displayName, String description, String category) {}
}
