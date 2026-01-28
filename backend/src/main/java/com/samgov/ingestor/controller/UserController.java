package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.CreateUserRequest;
import com.samgov.ingestor.dto.TenantMembershipDto;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return userService.getUserById(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/memberships")
    public ResponseEntity<List<TenantMembershipDto>> getCurrentUserMemberships() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<TenantMembershipDto> memberships = userService.getUserMemberships(userId);
        return ResponseEntity.ok(memberships);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.canManageUser(#tenantId, #id)")
    public ResponseEntity<UserDto> getUser(
        @PathVariable UUID id,
        @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId
    ) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Creating user: {}", request.getEmail());
        UserDto user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        log.info("Activating user: {}", id);
        userService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurityService.canManageUser(#tenantId, #id)")
    public ResponseEntity<Void> suspendUser(
        @PathVariable UUID id,
        @RequestHeader(value = "X-Tenant-Id", required = false) UUID tenantId
    ) {
        log.info("Suspending user: {}", id);
        userService.suspendUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/invite")
    @PreAuthorize("@tenantSecurityService.canManageUsers(#request.tenantId())")
    public ResponseEntity<TenantMembershipDto> inviteUserToTenant(
        @Valid @RequestBody InviteUserRequest request
    ) {
        log.info("Inviting user {} to tenant {}", request.email(), request.tenantId());

        // Check if user exists
        var existingUser = userService.getUserByEmail(request.email());

        UUID userId;
        if (existingUser.isPresent()) {
            userId = existingUser.get().getId();
        } else {
            // Create a new pending user
            CreateUserRequest createRequest = CreateUserRequest.builder()
                .email(request.email())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .build();

            UserDto newUser = userService.createUser(createRequest);
            userId = newUser.getId();
        }

        UUID invitedBy = TenantContext.getCurrentUserId();
        TenantMembershipDto membership = userService.addUserToTenant(
            userId,
            request.tenantId(),
            request.role() != null ? request.role() : Role.USER,
            invitedBy
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(membership);
    }

    @PutMapping("/me/default-tenant")
    public ResponseEntity<Void> setDefaultTenant(
        @Valid @RequestBody SetDefaultTenantRequest request
    ) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        userService.setDefaultTenant(userId, request.tenantId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/memberships")
    @PreAuthorize("hasRole('SUPER_ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<List<TenantMembershipDto>> getUserMemberships(@PathVariable UUID id) {
        List<TenantMembershipDto> memberships = userService.getUserMemberships(id);
        return ResponseEntity.ok(memberships);
    }

    public record InviteUserRequest(
        @NotBlank @Email String email,
        String firstName,
        String lastName,
        @NotNull UUID tenantId,
        String role
    ) {}

    public record SetDefaultTenantRequest(@NotNull UUID tenantId) {}
}
