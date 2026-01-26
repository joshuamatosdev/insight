package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.CompanyProfileService;
import com.samgov.ingestor.service.CompanyProfileService.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API for company profile management.
 */
@RestController
@RequestMapping("/api/v1/company-profile")
@PreAuthorize("isAuthenticated()")
public class CompanyProfileController {

    private final CompanyProfileService profileService;

    public CompanyProfileController(CompanyProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Get or create company profile for current tenant.
     */
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return profileService.getProfile(tenantId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create or update company profile.
     */
    @PostMapping
    public ResponseEntity<ProfileResponse> createOrUpdateProfile(
            @Valid @RequestBody CreateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(profileService.createOrUpdateProfile(tenantId, userId, request));
    }

    /**
     * Look up company profile by UEI.
     */
    @GetMapping("/lookup/uei/{uei}")
    public ResponseEntity<ProfileResponse> getProfileByUei(@PathVariable String uei) {
        return profileService.getProfileByUei(uei)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
