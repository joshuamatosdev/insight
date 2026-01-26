package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for tenant-based security checks.
 * Used by @PreAuthorize expressions for method-level security.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantSecurityService {

    private final TenantMembershipRepository membershipRepository;

    /**
     * Check if the current user can access the specified tenant.
     */
    @Transactional(readOnly = true)
    public boolean canAccessTenant(UUID tenantId) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        if (currentUserId == null) {
            log.debug("No current user in context, denying access");
            return false;
        }

        boolean hasAccess = membershipRepository.existsByUserIdAndTenantId(currentUserId, tenantId);
        log.debug("User {} access to tenant {}: {}", currentUserId, tenantId, hasAccess);
        return hasAccess;
    }

    /**
     * Check if the current user is an admin of the specified tenant.
     */
    @Transactional(readOnly = true)
    public boolean isTenantAdmin(UUID tenantId) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        if (currentUserId == null) {
            return false;
        }

        return hasRoleInTenant(currentUserId, tenantId, Role.TENANT_ADMIN);
    }

    /**
     * Check if the current user is a manager or higher in the specified tenant.
     */
    @Transactional(readOnly = true)
    public boolean isTenantManagerOrHigher(UUID tenantId) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        if (currentUserId == null) {
            return false;
        }

        Optional<TenantMembership> membership = membershipRepository
            .findByUserIdAndTenantId(currentUserId, tenantId);

        if (membership.isEmpty()) {
            return false;
        }

        String role = membership.get().getRole().getName();
        return Role.TENANT_ADMIN.equals(role) || Role.MANAGER.equals(role);
    }

    /**
     * Check if a user has a specific role in a tenant.
     */
    @Transactional(readOnly = true)
    public boolean hasRoleInTenant(UUID userId, UUID tenantId, String roleName) {
        Optional<TenantMembership> membership = membershipRepository
            .findByUserIdAndTenantId(userId, tenantId);

        if (membership.isEmpty()) {
            return false;
        }

        return roleName.equals(membership.get().getRole().getName());
    }

    /**
     * Get the current user's role in a tenant.
     */
    @Transactional(readOnly = true)
    public Optional<String> getCurrentUserRoleInTenant(UUID tenantId) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        if (currentUserId == null) {
            return Optional.empty();
        }

        return membershipRepository.findByUserIdAndTenantId(currentUserId, tenantId)
            .map(m -> m.getRole().getName());
    }

    /**
     * Check if the current user can manage users in the tenant (admin or manager).
     */
    @Transactional(readOnly = true)
    public boolean canManageUsers(UUID tenantId) {
        return isTenantManagerOrHigher(tenantId);
    }

    /**
     * Check if the current user can manage a specific user in the tenant.
     * Admins can manage anyone, managers can manage users and viewers.
     */
    @Transactional(readOnly = true)
    public boolean canManageUser(UUID tenantId, UUID targetUserId) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        if (currentUserId == null) {
            return false;
        }

        // Can't manage yourself through this check
        if (currentUserId.equals(targetUserId)) {
            return false;
        }

        Optional<TenantMembership> currentMembership = membershipRepository
            .findByUserIdAndTenantId(currentUserId, tenantId);

        Optional<TenantMembership> targetMembership = membershipRepository
            .findByUserIdAndTenantId(targetUserId, tenantId);

        if (currentMembership.isEmpty() || targetMembership.isEmpty()) {
            return false;
        }

        String currentRole = currentMembership.get().getRole().getName();
        String targetRole = targetMembership.get().getRole().getName();

        // Admins can manage anyone except other admins
        if (Role.TENANT_ADMIN.equals(currentRole)) {
            return !Role.TENANT_ADMIN.equals(targetRole);
        }

        // Managers can manage users and viewers
        if (Role.MANAGER.equals(currentRole)) {
            return Role.USER.equals(targetRole) || Role.VIEWER.equals(targetRole);
        }

        return false;
    }

    /**
     * Check if the current user has a specific permission in the current tenant.
     * Used by @PreAuthorize expressions.
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(String permission) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        UUID currentTenantId = TenantContext.getCurrentTenantId();

        if (currentUserId == null || currentTenantId == null) {
            log.debug("No current user or tenant in context, denying permission: {}", permission);
            return false;
        }

        Optional<TenantMembership> membership = membershipRepository
            .findByUserIdAndTenantId(currentUserId, currentTenantId);

        if (membership.isEmpty()) {
            log.debug("User {} has no membership in tenant {}, denying permission: {}",
                currentUserId, currentTenantId, permission);
            return false;
        }

        String permissions = membership.get().getRole().getPermissions();
        if (permissions == null || permissions.isBlank()) {
            log.debug("Role has no permissions defined, denying: {}", permission);
            return false;
        }

        // Check if permission exists in comma-separated list
        boolean hasPermission = Arrays.stream(permissions.split(","))
            .map(String::trim)
            .anyMatch(p -> p.equals(permission));

        log.debug("User {} permission {} in tenant {}: {}",
            currentUserId, permission, currentTenantId, hasPermission);
        return hasPermission;
    }

    /**
     * Validate that the current user can access the tenant from the context.
     * This should be called after tenant context is set from headers.
     */
    @Transactional(readOnly = true)
    public boolean validateCurrentTenantAccess() {
        UUID currentUserId = TenantContext.getCurrentUserId();
        UUID currentTenantId = TenantContext.getCurrentTenantId();

        if (currentUserId == null) {
            return false;
        }

        if (currentTenantId == null) {
            return true; // No tenant context, allowed
        }

        return membershipRepository.existsByUserIdAndTenantId(currentUserId, currentTenantId);
    }
}
