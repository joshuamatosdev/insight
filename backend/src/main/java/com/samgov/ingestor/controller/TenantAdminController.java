package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.TenantBrandingDTO;
import com.samgov.ingestor.dto.TenantSettingsDTO;
import com.samgov.ingestor.service.TenantAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for tenant administration
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/tenant")
@RequiredArgsConstructor
public class TenantAdminController {

    private final TenantAdminService tenantAdminService;

    /**
     * Get current tenant settings
     */
    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantSettingsDTO> getSettings() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(tenantAdminService.getSettings(tenantId));
    }

    /**
     * Update tenant settings
     */
    @PutMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantSettingsDTO> updateSettings(
        @Valid @RequestBody TenantSettingsDTO dto
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(tenantAdminService.updateSettings(tenantId, dto));
    }

    /**
     * Get current tenant branding
     */
    @GetMapping("/branding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantBrandingDTO> getBranding() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(tenantAdminService.getBranding(tenantId));
    }

    /**
     * Update tenant branding
     */
    @PutMapping("/branding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantBrandingDTO> updateBranding(
        @Valid @RequestBody TenantBrandingDTO dto
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(tenantAdminService.updateBranding(tenantId, dto));
    }

    /**
     * Get branding for public display (login page, etc.)
     */
    @GetMapping("/branding/public")
    public ResponseEntity<TenantBrandingDTO> getPublicBranding(
        @RequestParam(required = false) String domain
    ) {
        // In production, would look up tenant by domain
        UUID tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return ResponseEntity.ok(TenantBrandingDTO.builder().build());
        }
        return ResponseEntity.ok(tenantAdminService.getBranding(tenantId));
    }
}
