package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.CreateTenantRequest;
import com.samgov.ingestor.dto.TenantDto;
import com.samgov.ingestor.dto.TenantMembershipDto;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Tenant.SubscriptionTier;
import com.samgov.ingestor.service.TenantService;
import com.samgov.ingestor.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TenantDto> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        log.info("Creating tenant: {}", request.getName());
        TenantDto tenant = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.canAccessTenant(#id)")
    public ResponseEntity<TenantDto> getTenant(@PathVariable UUID id) {
        return tenantService.getTenantById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<TenantDto> getTenantBySlug(@PathVariable String slug) {
        return tenantService.getTenantBySlug(slug)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<TenantDto>> getAllActiveTenants() {
        List<TenantDto> tenants = tenantService.getAllActiveTenants();
        return ResponseEntity.ok(tenants);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.isTenantAdmin(#id)")
    public ResponseEntity<TenantDto> updateTenant(
        @PathVariable UUID id,
        @Valid @RequestBody CreateTenantRequest request
    ) {
        log.info("Updating tenant: {}", id);
        TenantDto tenant = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(tenant);
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> suspendTenant(@PathVariable UUID id) {
        log.info("Suspending tenant: {}", id);
        tenantService.suspendTenant(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> activateTenant(@PathVariable UUID id) {
        log.info("Activating tenant: {}", id);
        tenantService.activateTenant(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/subscription")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> updateSubscriptionTier(
        @PathVariable UUID id,
        @Valid @RequestBody SubscriptionTierRequest request
    ) {
        log.info("Updating subscription tier for tenant {}: {}", id, request.tier());
        tenantService.updateSubscriptionTier(id, request.tier());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.canAccessTenant(#id)")
    public ResponseEntity<List<UserDto>> getTenantUsers(@PathVariable UUID id) {
        List<UserDto> users = userService.getUsersByTenantId(id);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}/memberships")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.canAccessTenant(#id)")
    public ResponseEntity<List<TenantMembershipDto>> getTenantMemberships(@PathVariable UUID id) {
        List<TenantMembershipDto> memberships = tenantService.getTenantMemberships(id);
        return ResponseEntity.ok(memberships);
    }

    @DeleteMapping("/{tenantId}/users/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.isTenantAdmin(#tenantId)")
    public ResponseEntity<Void> removeUserFromTenant(
        @PathVariable UUID tenantId,
        @PathVariable UUID userId
    ) {
        log.info("Removing user {} from tenant {}", userId, tenantId);
        userService.removeUserFromTenant(userId, tenantId);
        return ResponseEntity.noContent().build();
    }

    public record SubscriptionTierRequest(SubscriptionTier tier) {}
}
