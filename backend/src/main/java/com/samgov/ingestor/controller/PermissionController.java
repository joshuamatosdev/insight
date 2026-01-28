package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.PermissionService;
import com.samgov.ingestor.service.PermissionService.PermissionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * Get all permissions grouped by category
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<Map<String, List<PermissionDto>>> getPermissionsByCategory() {
        return ResponseEntity.ok(permissionService.getPermissionsByCategory());
    }

    /**
     * Get all permission codes (flat list)
     */
    @GetMapping("/codes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<List<String>> getAllPermissionCodes() {
        return ResponseEntity.ok(permissionService.getAllPermissionCodes());
    }

    /**
     * Get current user's permissions in the current tenant
     */
    @GetMapping("/me")
    public ResponseEntity<Set<String>> getMyPermissions(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(permissionService.getUserPermissions(userId, tenantId));
    }

    /**
     * Check if current user has a specific permission
     */
    @GetMapping("/check/{permissionCode}")
    public ResponseEntity<PermissionCheckResponse> checkPermission(
        @PathVariable String permissionCode,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean hasPermission = permissionService.hasPermission(userId, tenantId, permissionCode);
        return ResponseEntity.ok(new PermissionCheckResponse(permissionCode, hasPermission));
    }

    public record PermissionCheckResponse(String permission, boolean granted) {}
}
